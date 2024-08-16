# Development

This documentation is intended for developers, for users see https://docs.2anki.net/.


## Database reminders

To create a new migration file (from the source root directory):

```bash
 npx knex migrate:make descriptive-migration-name --knexfile ./src/KnexConfig.ts  --migrations-directory ./migrations -x js
```
