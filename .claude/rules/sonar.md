# SonarCloud quality gate

The gate blocks merges when **Security Rating on New Code < A**. Security issues are the only category that regularly causes failures — reliability and maintainability rarely flip.

## Run Sonar locally before pushing

Install the scanner once:

```bash
brew install sonar-scanner          # macOS
# or
npm install -g sonar-scanner        # any platform
```

Get a token from https://sonarcloud.io/account/security (one-time, save it).

Generate coverage then scan:

```bash
# from repo root
pnpm test -- --coverage
pnpm --filter 2anki-web test -- --coverage

SONAR_TOKEN=<your-token> sonar-scanner \
  -Dsonar.host.url=https://sonarcloud.io
```

The scanner reads `sonar-project.properties` for everything else. The report link appears in stdout — click it to see issues before CI sees them.

## What triggers a security issue

| Rule | Pattern | Safe alternative |
|---|---|---|
| `tssecurity:S5144` / `S7044` | User-controlled URL passed to `axios`/`fetch` | Use `instrumentedAxios` — it validates host against the allowlist |
| `tssecurity:S5131` | User input reflected into HTML without sanitization | `sanitize-html` with project allowlist |
| `javascript:S2068` | String that looks like a hardcoded credential | Read from `process.env`; never use values like `"secret"` or `"password"` as literals |
| `javascript:S5042` | Zip entry extracted without path check | Validate entry name against base dir (see `lib/zip` helpers) |
| `javascript:S4830` | TLS cert validation disabled | Never set `rejectUnauthorized: false` |

**New code path checklist before pushing:**
1. Does any new code pass a user-supplied string to an HTTP call? → route through `instrumentedAxios`.
2. Does any new code render user-supplied content in HTML? → sanitize first.
3. Does any new code extract a zip? → use existing `lib/zip` helpers.
4. Does any new code read a file path from user input? → assert path stays inside the base dir.

## Handling false positives

`tssecurity` taint findings (S5144, S7044) **cannot** be suppressed via `sonar.issue.ignore.multicriteria` — the rule engine ignores multicriteria for taint flows. The only options are:

1. **Rearchitect** so the taint no longer reaches the sink (preferred — often the right call).
2. **Mark as False Positive in the SonarCloud UI** (Issues → the finding → Change Status → False Positive). Add a one-line note explaining why. Alexander must do this for tssecurity FPs; they are not auto-suppressed.

The existing FPs in `instrumentedAxios.ts` (S5144/S7044) are already marked in the UI. The URL passes through `validateAndResolveUrl()` → `isHostOnFixedAllowlist()` / `resolveHostnameSafely()` — Sonar's taint engine cannot follow that chain.

## Existing rule waivers (in `sonar-project.properties`)

| Key | Rule | Scope | Why |
|---|---|---|---|
| `mock1` | `javascript:S5122` (CORS) | `web/mock-server/**` | Mock server is intentionally permissive |
| `mock2` | `javascript:S5689` (method exposure) | `web/mock-server/**` | Same |
| `test1` | `javascript:S2068` (hardcoded credential) | `web/tests/**` | Playwright fixtures use placeholder credentials |
| `test2` | `javascript:S1481` (unused variable) | `web/tests/**` | Test helpers declare but don't always use locals |
| `gen1/gen2` | all rules | `web/src/generated/**`, `web/src/schemas/**` | Generated code — don't edit |
