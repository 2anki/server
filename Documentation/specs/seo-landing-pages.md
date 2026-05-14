# Spec: SEO landing pages for conversion-intent queries

**Author:** PM. **Date:** 2026-05-10. **Inputs:** `Documentation/retros/2026-W19.md`, `docs-overhaul-design.md` (#2090).

## Outcome

≥1 of the four pages indexed in Google Search Console with surfacing impressions by next retro (W20), and ≥5% of new signups arriving with `signup_origin = '/x-to-anki'`. **Goal alignment:** acquisition is the single biggest gap to 300K (13× short at 53/wk vs 694/wk needed); these pages widen the top of the funnel by capturing query-intent search traffic the homepage doesn't address.

## Scope (in)

Four React routes mounted in `web/src/App.tsx`, each rendering a shared `<LandingPage>` component with route-specific copy props:

- `/notion-to-anki` (primary)
- `/quizlet-to-anki`
- `/markdown-to-anki`
- `/pdf-to-anki`

Each page contains, in order:
1. Per-route `<title>` and `<meta name="description">` set via `react-helmet-async` (add the dep — pnpm.overrides is fine, it's a small lib). Also set canonical and `og:title`/`og:description`.
2. Single-CTA hero above the fold: H1, one-sentence promise, the existing `<UploadForm>` from `web/src/pages/UploadPage/components/UploadForm/UploadForm.tsx` reused as-is. Secondary "Sign up free" link points to `/register?source=/notion-to-anki` (etc.).
3. Below-fold sections (each ~80 LOC of MDX/TSX): 3-step "How it works", supported file types (link to `/documentation/reference/file-formats`), 1 testimonial pulled from existing site copy, 4-question FAQ tuned to the query.
4. **Signup-origin tracking.** New nullable column `users.signup_origin TEXT` via Knex migration → `pnpm kanel`. `RegisterForm` reads `?source=` param, sends in body. `UserController.register` persists. Hero "Sign up free" link injects `?source=<pathname>`; for users who upload first then sign up, store `source` in `sessionStorage` on landing-page mount and the register form hydrates from it as fallback.
5. Voice from the docs-overhaul scaffold (`docs-overhaul-design.md` section 8): second person, short sentences, no "simply"/"just", lead with the user's verb.
6. `web/public/sitemap.xml` listing all four routes + `/`. Add `Sitemap:` line to `web/public/robots.txt`.
7. Light prerender at build time: add `vite-plugin-prerender-spa` (or equivalent) configured for the four landing routes only. Hero HTML must be in the static document so Googlebot indexes it without executing JS. Document trade-offs in the PR body.

Layered architecture touch points: `routes/UserRouter.ts` → `controllers/UserController` → `usecases/RegisterUserUseCase` → `data_layer/UsersRepository`. Add `signup_origin` end-to-end. Validate the param server-side: only persist if it matches `/^\/[a-z0-9-]{1,64}$/`; null otherwise (CWE-20).

## Out of scope (next iteration)

- Blog at `/blog`. Defer — not required for the success metric and adds rendering surface. Open follow-up if W20 indexing lands.
- A third pricing tier or pricing-copy changes on these pages. CTAs are "Convert now" / "Sign up free", nothing else.
- Rewriting the upload widget or its accepted-types list.
- Per-locale landing pages (i18n).
- Dynamic FAQ content from CMS.
- Hreflang / international SEO.
- Analytics events beyond what GA already captures via pageview + `signup_origin` in DB.
- Backfilling `signup_origin` for existing users (column nullable; new signups only).

## Measurement

Two queries, both runnable from the `/ops` business tab:

```sql
-- Share of new signups via SEO landing pages, last 7d
SELECT signup_origin, COUNT(*) AS signups
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY signup_origin
ORDER BY signups DESC;
```

Target: rows where `signup_origin LIKE '/%-to-anki'` sum to ≥5% of total. GSC: search-console property `2anki.net`, filter Pages by `/notion-to-anki` etc., look for non-zero impressions on at least one URL.

## Risks

- **CSR indexing.** Vite SPA serves an empty `<div id="root">`; Googlebot now renders JS but ranks slower-loading routes worse. Mitigation: prerender the four routes at build time so the hero HTML and meta tags are static. If prerender plugin is not viable in one PR, ship with a `<noscript>` fallback containing H1, description, and the upload page link, and document the limitation as the next-iteration follow-up in the commit body.
- **Source-param spoofing.** Anyone can set `?source=anything`. Server-side regex allowlist (above) keeps the column clean enough for analytics; don't use this column for access control.
- **Upload widget assumes auth-aware shell.** `UploadForm` should work logged-out (the homepage already exposes it). Engineer to verify no `RequireAuth` wrap leaks in.
- **Stripe sync isn't touched.** Keep it that way — manual only.

## Open questions for engineer

- Which prerender approach lands cleanest in one PR — `vite-plugin-prerender-spa`, `vite-plugin-ssg`, or a static `index.html` per route generated at build? Pick one and ship; document why in the commit body.
- Does the existing `<AppShell>` need a "minimal" mode for these routes (no sidebar, no top nav) so the hero is genuinely above-the-fold on mobile? Designer sign-off needed if yes.

## Files in play

- `web/src/App.tsx` — add four routes.
- `web/src/pages/LandingPage/LandingPage.tsx` (new) — shared template.
- `web/src/pages/LandingPage/copy/{notion,quizlet,markdown,pdf}.ts` (new) — per-route copy.
- `web/src/pages/UploadPage/components/UploadForm/UploadForm.tsx` — reuse, do not modify.
- `web/src/components/forms/RegisterForm.tsx` — read `?source=` and `sessionStorage`, send in register body.
- `web/index.html` — keep; per-route `<title>` set via helmet.
- `web/public/sitemap.xml`, `web/public/robots.txt` — new/edit.
- `web/vite.config.ts` — add prerender plugin.
- `src/migrations/<timestamp>_add_signup_origin_to_users.ts` (new).
- `src/data_layer/public/Users.ts` — regenerated via `pnpm kanel`.
- `src/controllers/UserController.ts`, `src/usecases/RegisterUserUseCase.ts` (or equivalent), `src/data_layer/UsersRepository.ts` — thread `signup_origin` through.
- `src/routes/UserRouter.ts` — accept `source` in register body.
