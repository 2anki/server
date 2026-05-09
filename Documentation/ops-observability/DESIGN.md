# Design: `/ops` internal observability dashboard

Audience: Al only. No friendly tone — terse, dense, scannable. Visual language reuses tokens from `web/src/styles/base.css` and component classes from `web/src/styles/shared.module.css`. No new design system.

## 1. Page layout

**Recommendation: 2x2 grid on desktop, full-width stack on mobile.** A single column wastes the 1120px width and pushes chart 4 below the fold. With four roughly co-equal charts and the goal "know in 5 seconds," everything visible at once beats vertical scanning. Use the existing `.pageWide` (1120px) container.

```
+------------------------------------------------------------------+
| [logo]  Upload  Find pages  Downloads  ...  Ankify  Ops·admin ⋯ |   <- existing navbar, "Ops·admin" added before "Ankify"
+------------------------------------------------------------------+
|                                                                  |
|  Ops                                Window: [Last 24 hours ▾]    |   <- h1 left, controls right
|  Updated 14:32:07  ·  auto-refresh every 30s  [Refresh]          |   <- subtitle row, mono timestamp
|                                                                  |
|  +-----------------------------+  +-----------------------------+ |
|  | Inbound requests, last 24h  |  | Latency by route, last 24h  | |
|  |                             |  |                             | |
|  |     [stacked area chart]    |  |     [bar chart, 15 rows]    | |
|  |                             |  |                             | |
|  +-----------------------------+  +-----------------------------+ |
|  +-----------------------------+  +-----------------------------+ |
|  | Outbound calls by service   |  | Error rate                  | |
|  |                             |  | [routes]   |   [services]   | |
|  |     [line chart]            |  | [bars]     |   [bars]       | |
|  |                             |  |                             | |
|  +-----------------------------+  +-----------------------------+ |
+------------------------------------------------------------------+
```

- Chart panels: reuse `.surface` (white bg, 1px border, `--radius-lg`, 1.5rem padding). Chart height fixed at **220px** inside each panel — title row ~32px above. Total panel ≈ 280px.
- Grid gap: **1rem** (tighter than the 1.5rem default `.columns2` — this is a dashboard, not a marketing grid). Inline `gap: 1rem` on the wrapper.
- Header row: title left, window dropdown + refresh button right. Reuse `.select` for the dropdown, `.btnSmall` for refresh.
- Subtitle row: muted text (`--color-text-secondary`, `--text-xs`), monospaced timestamp.
- **Auto-refresh: every 30s.** Quiet — no toast, no spinner overlay. Just bump the "Updated HH:MM:SS" string and re-fetch in the background. Pause when the tab is hidden (`document.hidden`). Resume on focus.
- **Loading state (initial only):** the four panels render immediately with a 220px skeleton (light grey bar shimmer reusing `.spinnerSmall` centered). Subsequent refreshes do not show skeletons — the chart just updates in place.
- **Empty state (no rows in DB at all):** all four panels render the same line, centered: `"No data yet. Make a request — it'll show up within 5 seconds."` This is the only string with any warmth, because the 5-second part is a real expectation Al should have about the sink.
- **API error state:** banner at top of page (reuses `.alertDanger`): `"/ops/api/metrics failed: <status> <message>. Last good data shown below."` Charts keep showing the last successful fetch (don't blank them out).

## 2. Chart-by-chart spec

All charts use Recharts with `<ResponsiveContainer width="100%" height={220}>`. X/Y axis tick fontSize 11, axis line color `#e5e7eb` (`--color-border`), grid lines `#f3f4f6` (`--color-border-light`), axis label color `#6b7280` (`--color-text-secondary`). Tooltips use `background: #1f2937` (`--color-text-primary`), white text, monospaced numerics — `font-family: ui-monospace, SFMono-Regular, monospace`.

### Chart 1 — Inbound requests, last 24h

- Title: **"Inbound requests, last 24h"** (the "last 24h" segment swaps with the window: "last 1h" / "last 7d").
- X axis: time, formatted `HH:mm` for 1h/24h, `MMM D` for 7d. No axis label.
- Y axis: request count. Label: `"requests"` rotated -90, small, secondary color.
- Stacked AreaChart, 4 series in this draw order (bottom to top): 2xx, 3xx, 4xx, 5xx.
- Colors (semantic, picked to match the existing palette):
  - 2xx: `#10b981` (green, slightly brighter than `--color-success` for area fills)
  - 3xx: `#9ca3af` (`--color-text-tertiary` — neutral, redirects rarely matter)
  - 4xx: `#f59e0b` (`--color-warning`)
  - 5xx: `#dc2626` (`--color-danger`)
- Fill opacity 0.7, stroke same hue full opacity.
- Tooltip on hover: bucket time on first line, then four mono rows: `2xx  1,204` / `3xx  3` / `4xx  12` / `5xx  0` / `total  1,219`. Right-aligned numbers.
- Empty state for chart: centered grey text `"No requests in this window."`

### Chart 2 — Latency by route, last 24h

- Title: **"Latency by route, last 24h"**.
- Horizontal BarChart (route names on Y, ms on X) — readability beats vertical for 15 long path templates. Use `<BarChart layout="vertical">`.
- Y axis: route template (`GET /api/upload/:id`), tick fontSize 11, monospaced. Truncate to 32 chars with ellipsis; full path in tooltip.
- X axis: ms. Label: `"ms"`.
- Two bars per route, grouped:
  - avg: `#3b82f6` (`--color-primary`)
  - p95: `#1e40af` (darker primary, same hue family — communicates "same metric, worse case")
- Bar height 8px, gap 2px between avg/p95 within a route.
- Tooltip: `GET /api/upload/:id` / `avg  142 ms` / `p95  890 ms` / `count  4,201`.
- Sort descending by request count (matches spec — top 15 by volume, not by latency, so Al sees what's *actually being hit*).
- Empty state: `"No requests in this window."`

### Chart 3 — Outbound calls by service, last 24h

- Title: **"Outbound calls by service, last 24h"**.
- LineChart, hourly buckets.
- X axis: time, same formatting rules as chart 1.
- Y axis: count. Label: `"calls"`.
- One line per service. Fixed colors (stable across reloads — Al builds muscle memory):
  - notion: `#000000` (Notion brand black)
  - claude: `#d97706` (Claude orange)
  - dropbox: `#0061ff` (Dropbox blue)
  - google_drive: `#0f9d58` (Drive green)
  - patreon: `#f1465a` (Patreon coral)
- Line stroke 2px, dot only on hover (`dot={false}`, `activeDot={{ r: 4 }}`).
- Legend: bottom, horizontal, fontSize 11.
- Tooltip: bucket time, then one mono row per service that has a value: `notion  84` / `claude  12`.
- Empty state: `"No outbound calls in this window."`

### Chart 4 — Error rate, last 24h

- Title: **"Error rate, last 24h"**. Subtitle inside the panel, smaller: `"% non-2xx · top 10 routes / top 5 services"`.
- Two side-by-side `<BarChart>` panels inside the same surface, separated by a 1px `--color-border-light` divider. Each renders horizontal bars (route/service name on Y, % on X 0–100).
- Bar color: gradient based on value — green `#10b981` below 1%, amber `#f59e0b` at 1–5%, red `#dc2626` above 5%. Single bar, color computed per row.
- X axis ticks: `0%`, `5%`, `25%`, `100%` — log-ish spacing so a 0.3% rate is still visible next to a 60% rate. Use a custom tick formatter; the actual scale stays linear, just the displayed ticks are sparse.
- Tooltip: `GET /api/notion/blocks/:id` / `error rate  6.2%` / `errors  31 / 500`.
- Empty state: `"No errors in this window."` (yes, this one is good news — keep it neutral, not celebratory.)

## 3. Navbar entry

Insert in `web/src/components/NavigationBar/helpers/useNavbarEnd.tsx`, **immediately after** the `showAnkifyLink` block and before `/upload`. Same email gate (`data?.user?.email?.toLowerCase() === 'alexander@alemayhu.com'`) — but read it from `data?.features?.ops` once the backend ships the flag, mirroring the spec. Until then, gate on email like Ankify already does.

```tsx
{showOpsLink && (
  <NavbarItem href="/ops" path={path}>
    Ops <span className={styles.adminTag}>admin</span>
  </NavbarItem>
)}
```

- Label: **"Ops"**. No icon, no emoji (admin tool, not a feature).
- Admin marker: a small inline tag `admin` in `--text-xs`, `--color-text-tertiary`, uppercase, letter-spacing `--tracking-wider`, padding `0 0.25rem`, no background. Just enough to read "this isn't a normal nav item" without screaming. Add `.adminTag` to `NavigationBar.module.css`:

```css
.adminTag {
  margin-left: 0.375rem;
  font-size: 0.625rem;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}
```

- Mobile (burger menu open): same item, `admin` tag wraps to the right of "Ops" — no special handling needed.

## 4. Microcopy

- Browser tab title: **`Ops · 2anki`**
- Page h1: **`Ops`**
- Subtitle row format: **`Updated 14:32:07 · auto-refresh every 30s`** (24-hour clock, local time, mono)
- Window selector options: **`Last 1 hour`** / **`Last 24 hours`** / **`Last 7 days`**. Long form, not "1h/24h/7d" — the chart titles already use the short form, no need to repeat it in the dropdown.
- Refresh button label: **`Refresh`**. Loading: button stays enabled, label swaps to **`Refreshing…`**, no spinner. (Refreshes are sub-second — a spinner would flash and disappear.)
- API error banner: **`/ops/api/metrics failed: 500 Internal Server Error. Last good data shown below.`** Verbatim include the status code and message — Al wants the technical detail, not a soft version.
- Empty (no data anywhere): **`No data yet. Make a request — it'll show up within 5 seconds.`**
- Empty (no data in current window, but data exists elsewhere): **`No requests in this window.`** / **`No outbound calls in this window.`** / **`No errors in this window.`**
- 404 / not allowed: the route returns 404 per spec — no dedicated page, the existing 404 handler renders.

## 5. Visual hierarchy / density

Confirmed:

- Tight spacing: 1rem grid gap, 1.5rem panel padding (matches `.surface`), no decorative borders beyond the existing `--color-border` 1px.
- Chart heights: **220px** (within the 200–240 range you suggested — 220 leaves room for the 32px panel title row to sit above without crowding).
- Numerics in tooltips: **monospaced** (`ui-monospace, SFMono-Regular, Menlo, monospace`). Right-aligned. Same for the "Updated HH:MM:SS" timestamp in the subtitle row.
- Panel titles: `--text-base`, `--font-semibold`, `--color-text-primary`, no margin top, 0.75rem margin bottom. Smaller than the page h1, no subtitle inside panels except chart 4 (where the "% non-2xx · top 10 / top 5" hint is necessary because the bare title is ambiguous).
- No card shadows. Border + radius is the visual separation.

## 6. Responsive / mobile

Confirmed: stack vertically below 768px. Inside the page wrapper:

```css
.opsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 769px) {
  .opsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- Chart heights stay 220px on mobile — Recharts' `ResponsiveContainer` handles width.
- Header row stacks: h1 first, then a flex row with the window dropdown and refresh button taking 50/50 of the width.
- Auto-refresh keeps running on mobile but pauses on `document.hidden` (which fires when the user switches apps), so it won't drain Al's battery on the bus.

## Hand-off notes for the engineer

- **New components:** `web/src/pages/OpsPage/OpsPage.tsx` (lazy-loaded in `App.tsx`), `OpsPage.module.css` (or extend `shared.module.css` if any class is reused 3+ times — not yet). Charts as four sibling components in `OpsPage/charts/`.
- **Route:** `/ops`, lazy-loaded, no AuthRequired wrapper — the server returns 404 for non-Al via `RequireOpsAccess`, so the SPA simply renders the page; the API fetch fails with 404 for anyone else and shows the error banner. No client-side gate needed.
- **Dropdown state:** `?window=24h` in the URL query. Reload-safe, shareable in screenshots.
- **Auto-refresh:** `setInterval(fetch, 30_000)` plus `visibilitychange` listener to pause/resume.
- **Data freshness expectation:** sink flushes every 5s, so "Updated 14:32:07" can lag real time by up to 5s. Fine — don't over-explain it in copy.
