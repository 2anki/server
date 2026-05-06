# CLAUDE.md

## Routes

- Wire up paths and middleware only — no business logic
- Validate and sanitize all user input before passing to controllers
- Use `res.locals` for authenticated user data set by middleware
