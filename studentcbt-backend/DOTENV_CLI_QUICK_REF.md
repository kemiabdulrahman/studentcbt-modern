# dotenv-cli Quick Reference

## Commands Overview

```bash
# TESTING
npm test                    # Run all tests with .env.test
npm test:watch             # Run tests in watch mode
npm test:coverage          # Run tests with coverage report

# DATABASE MIGRATIONS
npm run migrate            # Migrate production database (.env)
npm run migrate:test       # Deploy migrations to test database (.env.test)
npm run migrate:test:dev   # Create/run new migrations for test database

# SEEDING
npm run seed              # Seed production database (.env)
npm run seed:test         # Seed test database (.env.test)

# DEVELOPMENT
npm run dev               # Start development server (.env)
npm start                 # Start production server (.env)
```

## How dotenv-cli Works

```bash
dotenv -e .env.test jest
       ↑         ↑         ↑
    command   env file   command to run

# Loads variables from .env.test, then runs jest with those variables
```

## Environment Setup

### Production (.env)
- Real database
- Real secrets
- Used by: `npm run dev`, `npm start`, `npm run migrate`

### Testing (.env.test)
- Test database (separate)
- Test secrets
- Used by: `npm test`, `npm run migrate:test`

## Quick Start

1. **First time setup:**
   ```bash
   npm install --save-dev dotenv-cli          # Already done!
   createdb studentcbt_test                    # Create test database
   npm run migrate:test                        # Setup test database
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **View coverage:**
   ```bash
   npm test:coverage
   ```

## File Locations

- `.env` - Production environment variables
- `.env.test` - Test environment variables
- `tests/setup.js` - Test setup (loads .env.test automatically)
- `package.json` - Scripts using dotenv-cli

## Common Tasks

### Add new test
```bash
npm test                          # Tests run with .env.test database
```

### Modify test database schema
```bash
npm run migrate:test:dev          # Create migration
npm run migrate:test              # Deploy to test database
```

### Seed test data
```bash
npm run seed:test
```

### Run production
```bash
npm run dev                       # Uses .env (not .env.test)
npm start                         # Uses .env (not .env.test)
```

## Troubleshooting

**Tests using wrong database?**
- Check: `cat .env.test`
- Verify: `DATABASE_URL` points to `studentcbt_test`

**dotenv command not found?**
- Run: `npm install --save-dev dotenv-cli`
- Check: `npm list dotenv-cli`

**Test database doesn't exist?**
- Create: `createdb studentcbt_test`
- Migrate: `npm run migrate:test`

## What Changed in package.json

**Before:**
```json
"test": "jest"
```

**After:**
```json
"test": "dotenv -e .env.test jest",
"test:watch": "dotenv -e .env.test jest --watch",
"test:coverage": "dotenv -e .env.test jest --coverage",
"migrate:test": "dotenv -e .env.test prisma migrate deploy",
"migrate:test:dev": "dotenv -e .env.test prisma migrate dev",
"seed:test": "dotenv -e .env.test node prisma/seed.js"
```

## Key Benefits

✅ Tests use separate database
✅ No production data at risk
✅ Easy environment switching
✅ Clean, simple commands
✅ CI/CD ready
✅ No hardcoded secrets in code

## Documentation

- Full guide: `DOTENV_CLI_GUIDE.md`
- Testing setup: `TESTING.md`
- Jest setup: `JEST_SETUP.md`
- Test utilities: `tests/README.md`
