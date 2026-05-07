# Ankify security hardening — spec

Status: proposed (2026-05-08). Not started. Targeted at the work that needs to land before onboarding user #2 to `/ankify`.

This spec turns the conversation-level assessment into a buildable plan. It's grouped by the area of risk it closes, in the order I'd ship.

## Threat model in one paragraph

The service runs each user's Anki desktop inside a Docker container on a host the operator (Alexander) administers. A web client talks to a server that talks to AnkiConnect inside that container; the user also opens noVNC in their browser to drive Anki by hand. Today, host ports are bound publicly, no TLS, no auth on the container endpoints, and named volumes persist user data on disk between sessions. Threats we want to defend against, in order of impact: (1) **a stranger discovering and hijacking another user's session** by port-scanning the host, (2) **a compromised operator** (host root) reading user data when no session is running, (3) **a compromised operator** snooping on an active session, (4) **a malicious user inside their own container** escaping to the host or another container.

We can fully close (1). We can fully close (2) with reasonable engineering. We bound (3) but cannot fully eliminate it without confidential computing — be honest about it. We materially raise the cost of (4).

## What we are NOT solving in this spec

- End-to-end encryption against a malicious operator during an active session. The operator runs the host; full prevention requires confidential-computing hardware (SEV-SNP / TDX / Nitro Enclaves). Out of scope.
- Auditing the AnkiConnect plugin itself for vulnerabilities. We treat it as a third-party dependency and confine it.
- Server-side persistence of Anki collection data. We're moving to a model where AnkiWeb is the source of truth and we hold a session-scoped working copy only.

---

## Slice 1 — Token-gated reverse proxy + private container ports

This is the single most important change. It closes the URL-guessability and VNC-exposure risks together, and makes every later slice easier because it abstracts container port allocation behind a name.

### Architecture target

```
Browser
  │  https://app.2anki.net/v/<token>/  (TLS, WebSocket upgrade for noVNC)
  ▼
Caddy (or Traefik) on the host's public IP
  │  forward_auth → POST /api/ankify/sessions/validate {token}
  │  on 200, reads X-Backend-Port and proxies to:
  ▼
127.0.0.1:<novnc_port>  (the container's host-bound noVNC port — only loopback)
```

Same proxy serves the existing `/api/ankify/*` and `/api/notion/webhook/*` paths under TLS, so the public surface is one hostname, one cert.

### Server changes

1. **`src/services/ankify/RacService.ts` — change port binding**

   In `createAndStartContainer()`, switch each `HostPort` binding to bind on the loopback address only by setting `HostIp: '127.0.0.1'`:

   ```ts
   PortBindings: {
     [`${CONTAINER_INTERNAL_NOVNC_PORT}/tcp`]: [
       { HostIp: '127.0.0.1', HostPort: novncPort.toString() },
     ],
     // same for VNC and AnkiConnect
   }
   ```

   AnkiConnect at `127.0.0.1:<anki_port>` is still reachable from the server process (which already calls it as `localhost`). noVNC is no longer reachable from the public internet.

2. **New table: `ankify_session_tokens`**

   ```sql
   CREATE TABLE ankify_session_tokens (
     id              SERIAL PRIMARY KEY,
     ankify_client_id INTEGER NOT NULL REFERENCES ankify_clients(id) ON DELETE CASCADE,
     owner           INTEGER NOT NULL,
     token_hash      VARCHAR(64) NOT NULL UNIQUE,   -- sha256 hex of the plaintext token
     expires_at      TIMESTAMP NOT NULL,
     last_used_at    TIMESTAMP,
     revoked_at      TIMESTAMP,
     created_at      TIMESTAMP DEFAULT now()
   );
   CREATE UNIQUE INDEX ankify_session_tokens_one_active_per_client
     ON ankify_session_tokens(ankify_client_id) WHERE revoked_at IS NULL;
   CREATE INDEX ankify_session_tokens_lookup ON ankify_session_tokens(token_hash);
   ```

   We never store the plaintext token. The plaintext lives only on the client (in the URL). Lookups hash the incoming token first.

3. **New repo: `AnkifySessionTokensRepository`**

   ```
   mint(input: { ankify_client_id, owner, ttl_hours }) → { plaintext, row }
   findByHash(token_hash) → row | null
   touchLastUsed(id) → void
   revoke(id) → void
   revokeByClientId(ankify_client_id) → void   // called on stop / respin
   ```

   `mint` is the only place plaintext exists server-side: generate `crypto.randomBytes(32)`, base64url-encode, hash with SHA-256, insert hash row, return `{ plaintext, row }`. The plaintext is returned **once** to the controller and never persisted.

4. **Mint on provision and respin**

   In `RacService.provision()` and `RacService.respin()`, after `repo.create(...)`, call `tokens.mint({ ankify_client_id: client.id, owner, ttl_hours: 8 })`. Add the plaintext to the `ProvisionResult`:

   ```ts
   interface ProvisionResult {
     client: AnkifyClient;
     created: boolean;
     session_url: string;   // https://app.2anki.net/v/<plaintext>/
   }
   ```

   On `stop`, call `tokens.revokeByClientId(client.id)` so the URL stops working immediately.

5. **New endpoint: `POST /api/ankify/sessions/validate`** (no auth — called only by the proxy from localhost)

   - Accept `{ token: string }` in body.
   - Hash, look up `ankify_session_tokens` by hash.
   - Reject (401) if: not found, revoked, expired, or the linked client is not active.
   - Else: `touchLastUsed`, respond 200 with header `X-Backend-Port: <novnc_port>` and an empty body.

   Lock this endpoint to listen on `127.0.0.1` only at the express level — or guard with a static shared secret in a header that the proxy sends. The shared-secret check is belt-and-suspenders; loopback binding is the actual control.

6. **Reaper integration**

   When the idle reaper marks a client deleted (existing `RacService.reapIdle()`), revoke its tokens too. This is a single line in the reaper loop after `repo.deleteById(client.id)`: ON DELETE CASCADE on the FK already handles it. Confirm the cascade clause in the migration.

### Client changes

1. **`Backend.provisionAnkifyClient()` return type**: gain `session_url: string`. Don't expose `novnc_port` to the client at all going forward.

2. **`AnkifyPage.ankiUrlFor(client)`** is removed. Read `session_url` from the provision/list response. The list endpoint also returns `session_url` — server constructs it on the fly using the active token row, or returns null if no token is live (UI shows "Reissue session link" button).

3. **Connection details disclosure** in the active card no longer shows the noVNC port. The whole point is that the port is an implementation detail.

### Proxy config (Caddy)

```caddyfile
app.2anki.net {
  # API + webhook + web app — existing
  reverse_proxy /api/* localhost:2020
  reverse_proxy /api/ankify/webhook/* localhost:2020
  reverse_proxy localhost:3000  # Vite/web

  # Session proxy
  @session path_regexp session ^/v/([A-Za-z0-9_-]{43})/?(.*)$
  handle @session {
    forward_auth localhost:2020 {
      uri /api/ankify/sessions/validate
      copy_headers X-Backend-Port
      header_up X-Session-Token "{re.session.1}"
    }
    rewrite * /{re.session.2}
    reverse_proxy {
      to localhost:{header.X-Backend-Port}
      transport http {
        # Allow long-lived noVNC websocket
        read_timeout 24h
      }
    }
  }
}
```

Traefik or nginx versions are equivalent; the structure is "extract token from path → forward_auth resolves to backend port → reverse-proxy with WebSocket upgrade."

### Tests

- `RacService.provision` mints a token; the result includes `session_url`. (RacService.test.ts already mocks the repo; add a `tokens` mock.)
- `tokens.mint` returns plaintext with 43-char base64url, stores hash only.
- `validate` endpoint: 401 for unknown / revoked / expired; 200 with header for valid; 401 if client not active.
- Stop and reap revoke tokens (DB row gets `revoked_at`).

### Complexity: **medium.** ~3 days for the full slice including tests and deployment of Caddy.

---

## Slice 2 — Container hardening baseline

These are config-only changes inside `RacService.createAndStartContainer()` plus one daemon-level config edit. Each one is independently valuable; ship them all.

### Docker container args

```ts
HostConfig: {
  AutoRemove: true,
  Memory: 768 * 1024 * 1024,
  CpuQuota: 50_000,
  CpuPeriod: 100_000,
  // NEW
  CapDrop: ['ALL'],
  SecurityOpt: ['no-new-privileges:true'],
  ReadonlyRootfs: true,
  Tmpfs: {
    '/tmp': 'rw,nosuid,nodev,size=128m',
    '/var/run': 'rw,nosuid,nodev,size=8m',
    '/run/user/1000': 'rw,nosuid,nodev,size=32m',  // Anki Qt user runtime
  },
  // existing volume mount stays
  Mounts: [...],
  PortBindings: {
    // already loopback-only after slice 1
  },
  NetworkMode: `ankify-${owner}-${Date.now()}`,
}
```

The dynamic per-session network name is created with `docker.createNetwork({ Name: ..., Internal: false })` before container start, and removed after the container's container.remove() in stop / reap. Containers on different networks cannot reach each other; AnkiWeb is still reachable because `Internal: false`.

### Daemon config — `/etc/docker/daemon.json`

```json
{
  "userns-remap": "default",
  "no-new-privileges": true,
  "icc": false,
  "default-runtime": "runc"
}
```

`userns-remap` requires:

- One-time chown of existing volumes after the daemon flag is enabled: `chown -R 100000:100000 /var/lib/docker/volumes/ankify-*`. Ship this in a one-shot deploy script, not a migration.
- The `remote-anki-client` image's `USER anki` (UID 1000) becomes UID 101000 on the host — outside any meaningful host user space.

`icc: false` disables inter-container communication on the default bridge (a fallback if the per-session network mode is bypassed somehow).

### Anki image tweaks

Two small edits to `2anki/remote-anki-client/Dockerfile`:

1. Drop `--privileged`-equivalent runtime expectations. Anki currently writes Qt cache to `/run/user/1000` — confirm with `strace` that the tmpfs above covers this.
2. Add `chmod g+rwx /data` so the user-namespace-remapped UID can write to mounted volumes.

### Tests

- New unit test in `RacService.test.ts`: assert `createContainer` is called with `CapDrop: ['ALL']`, `ReadonlyRootfs: true`, `SecurityOpt: ['no-new-privileges:true']`.
- New integration smoke (manual, in deploy runbook): start a container, exec into it, try `mount`, `ip link add`, write to `/etc` — all should fail.

### Complexity: **low** for the Docker arg changes (~half a day including tests). **Medium** for the daemon-level userns-remap because of the volume-chown rollover.

---

## Slice 3 — Ephemeral by default

Persistent named volumes give the operator readable disk artifacts even when no session is running. Switching to tmpfs eliminates that, and AnkiWeb already serves as the source of truth for the user's collection.

### Server changes

1. **`RacService.createAndStartContainer()`**: replace the named volume mount

   ```ts
   // OLD
   Mounts: [{ Type: 'volume', Source: ankifyVolumeNameForOwner(owner), Target: '/data' }]

   // NEW (default)
   Tmpfs: {
     ...existing,
     '/data': 'rw,nosuid,nodev,size=512m',
   }
   ```

2. **Drop `ankifyVolumeNameForOwner` and the volume-creation calls in provision/respin/stop.** Volumes simply aren't part of the lifecycle anymore.

3. **Bootstrap script inside the container** that runs after Anki starts, before the user signs in:

   - Configure Anki's `~/.local/share/Anki2/profile.json` to point at the user's empty `/data/collection` so Anki's first sync fetches everything from AnkiWeb.
   - This is a small change to the existing `startup.sh` in `2anki/remote-anki-client`.

4. **Onboarding copy update on `/ankify`**: step 3 ("Run your first sync") becomes the moment the user's collection actually lands in the container. Lean into this in the spec for slice 5 (privacy claims). The copy is already step-aware; it just needs a sentence noting "we don't store your collection between sessions — your AnkiWeb account does."

### Migration story for existing users

There is one user (Alexander). Drop the existing `ankify-rac-owner-N-data` volumes manually as part of the deploy: `docker volume rm $(docker volume ls -q | grep ankify-rac)` after stopping the active session. No migration code needed.

### Optional v3 — encrypted persistent mode

For a future user who wants offline cards, add an opt-in:

- User sets a passphrase at session bootstrap.
- Server derives a key with Argon2id (parameters: m=64MB, t=3, p=4) and uses it to open a LUKS-formatted file (a sparse file on the host disk, attached to the container as a block device via `--device`).
- Key lives in process memory only — never written to disk, never logged.
- On container stop / idle, key is purged (`Buffer.fill(0)`) before garbage collection.
- Forgot passphrase = data is gone (we say so in the UI).

**Spec but don't build until a user asks.** It's three weeks of careful work and meaningful UX friction. Ephemeral default covers most users.

### Tests

- `RacService.provision` with the new flow: assert `Mounts` doesn't include a volume, `Tmpfs` has `/data`.
- Integration smoke: start a session, sign into AnkiWeb, write a card; stop; provision a fresh session, sign into AnkiWeb, confirm the card is there (came from AnkiWeb, not from a persisted volume).

### Complexity: **low** (~1 day) for ephemeral default. Encrypted mode is **high** (~2–3 weeks).

---

## Slice 4 — Operator audit log

Even if the operator can technically `docker exec` into a running container, **logged access** is what makes the privacy claim defensible. Two pieces:

1. **Wrap the host shell** so `docker exec`, `docker inspect`, and `docker volume` against `ankify-*` containers/volumes append to `/var/log/ankify-operator-access.log` with the timestamp, command, and tty user. Implement as a tiny shell wrapper sourced from `~/.bashrc`. Not an actual access control — just a transparent log.

2. **A weekly job** (cron or GitHub Action against the prod box) that publishes the last 7 days of `/var/log/ankify-operator-access.log` to a public URL like `https://2anki.net/audit/ankify-week-<n>.log`. Or, more practically, posts it to the same Patreon community where users see roadmap updates.

The point isn't airtight — a malicious operator can disable the wrapper. The point is making access expensive to do silently and easy to audit publicly. That's the basis on which "operator access requires explicit consent or legal request, and is logged" is an honest claim instead of a marketing one.

### Complexity: **low** (~half a day for the wrapper + a one-line cron entry).

---

## Slice 5 — Privacy page on 2anki.net

Once slices 1–4 are live, ship a `/privacy/ankify` page that says, exactly:

> ### What we promise about Ankify
>
> **No data at rest between sessions.** When your session ends or times out, the Docker container that ran your Anki is destroyed and its in-memory `/data` is wiped. We retain no copy of your Anki collection on our servers between sessions.
>
> **AnkiWeb is your source of truth.** Your collection lives with AnkiWeb (Anki's official cloud service), not us. We sign into your AnkiWeb account inside the running session at your direction; your AnkiWeb password is typed directly into the embedded Anki window and stays there.
>
> **Each session is isolated.** Containers run on a per-session network with no path to other users' containers. A compromise inside one session cannot reach another.
>
> **Session URLs are unguessable and short-lived.** Each session URL contains a 256-bit random token that we store only as a hash. Tokens expire after 8 hours of inactivity and rotate when the container is restarted.
>
> ### What's still true
>
> While your session is **actively running**, an operator with shell access to our host can technically observe what's happening inside your container — the same is true of any cloud service. We never do this without your explicit consent or a legal requirement, and we publish a weekly log of every operator access at `/audit/ankify-week-N`. Once your session ends, there's nothing left to access.
>
> ### What we don't promise
>
> End-to-end encryption against a malicious operator during an active session. If you need that, run Anki locally — that's the right tool for the threat model.

The exact text matters: every claim is something we can defend if challenged.

### Complexity: **low** (~1 hour for the page; the engineering it commits us to is the rest of this spec).

---

## Sequencing and gating

| # | Slice | Days | Gate before un-gating allowlist? |
|---|---|---|---|
| 1 | Token-gated reverse proxy + private container ports | 3 | **yes** |
| 2 | Container hardening baseline (caps, no-new-privs, read-only, per-session network, userns-remap) | 1.5 | **yes** |
| 3 | Ephemeral default | 1 | **yes** |
| 4 | Operator audit log + public weekly publish | 0.5 | yes (cheap, do alongside 1–3) |
| 5 | Privacy page | 0.1 | yes (after 1–4 land) |
| 6 | gVisor runtime | 2 | no (defense in depth, ship after onboarding) |
| 7 | Encrypted persistent mode (opt-in) | 15+ | no (only when a user specifically asks) |

**Total before un-gating: roughly one focused week.**

## Open questions for Alexander

1. **Where does the proxy run?** Same host as the server (simplest), or a separate small box for blast-radius isolation? My vote: same host for now, separate later if the user count grows past ~50.
2. **Token TTL.** 8 hours is long enough that nobody re-clicks during a study session and short enough that lost URLs aren't dangerous overnight. Comfortable with that, or shorter?
3. **Operator audit log destination.** Public weekly file, Patreon post, both? Public is more defensible; Patreon is more visible to the audience that cares.
4. **Privacy page tone.** I leaned dry-and-honest. Some users prefer a single one-line "we never see your data" — but that would be a lie. Defer to your taste.
