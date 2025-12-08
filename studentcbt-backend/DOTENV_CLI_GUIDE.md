# Using dotenv-cli for Test/Production Separation

This guide explains how to use `dotenv-cli` to manage separate environment variables for testing and production.

## What is dotenv-cli?

`dotenv-cli` is a command-line tool that loads environment variables from a `.env` file before executing a command. This allows you to easily switch between different environments without modifying code.

## Installation

Already installed! It's in your `devDependencies`:
```bash
npm list dotenv-cli
```

## File Structure

```
studentcbt-backend/
├── .env                    ← Production environment
├── .env.test              ← Test environment (new)
├── .env.example           ← Template (optional)
├── package.json           ← Updated with new scripts
├── tests/
│   ├── setup.js          ← Updated to load .env.test
│   └── ...
└── prisma/
    └── schema.prisma
```

## Environment Files

### `.env` (Production)
Used for development:
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/studentcbt
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=5000
```

### `.env.test` (Testing)
Used for testing:
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:iamconnected@localhost:5432/studentcbt_test
JWT_SECRET=test-secret-key-12345
JWT_REFRESH_SECRET=test-refresh-secret-key-67890
PORT=5001
```

## Available Commands

### Running Tests

```bash
# Run all tests with .env.test
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage

# Run specific test file
npm test -- tests/__tests__/auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

### Database Migrations

```bash
# Deploy migrations to test database
npm run migrate:test

# Run migrations in dev mode for test database
npm run migrate:test:dev

# Migrate production database (uses default .env)
npm run migrate
```

### Seeding

```bash
# Seed test database
npm run seed:test

# Seed production database (uses default .env)
npm run seed
```

## How It Works

### Example: Running Tests

When you run:
```bash
npm test
```

The `package.json` script runs:
```bash
dotenv -e .env.test jest
```

This means:
1. `dotenv` loads all variables from `.env.test`
2. These variables are available as `process.env.*`
3. Then `jest` runs with those environment variables

### Example: Test Setup

In `tests/setup.js`:
```javascript
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });
```

This ensures that:
- `.env.test` variables are loaded in the test environment
- Different database URL (`studentcbt_test`) is used
- Different JWT secrets are used
- No production data is affected

## Step-by-Step Usage

### 1. Create Test Database

```bash
# Using createdb command
createdb studentcbt_test

# Or using psql
psql -U postgres -c "CREATE DATABASE studentcbt_test;"
```

### 2. Create `.env.test`

Already created! Update the values if needed:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/studentcbt_test
JWT_SECRET=test-secret-key-12345
```

### 3. Run Database Migrations for Tests

```bash
# Deploy existing migrations to test database
npm run migrate:test

# Or create new migration
npm run migrate:test:dev
```

### 4. Run Tests

```bash
npm test
```

Tests will automatically use the test database!

## Benefits

✅ **Isolation** - Tests use separate database, no risk to production data
✅ **Easy Switching** - Different env files for different purposes
✅ **Clean Code** - No hardcoded credentials in code
✅ **CI/CD Ready** - Easy to use in automated pipelines
✅ **Multiple Environments** - Can add `.env.staging`, `.env.development`, etc.
✅ **Security** - Production secrets stay in production

## Practical Examples

### Example 1: Run Tests Without Affecting Production

```bash
# These use .env.test (separate database)
npm test
npm test:watch
npm test:coverage

# These use .env (production database)
npm run migrate
npm run seed
npm start
```

### Example 2: Add New Environment

```bash
# Create new environment file
echo "NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/studentcbt_staging
JWT_SECRET=staging-secret" > .env.staging

# Add script to package.json
"test:staging": "dotenv -e .env.staging jest"

# Use it
npm run test:staging
```

### Example 3: Run Migrations for All Environments

```bash
# Production
npm run migrate

# Test
npm run migrate:test

# Staging (if you create it)
dotenv -e .env.staging -- prisma migrate deploy
```

## CI/CD Integration

In your CI/CD pipeline (GitHub Actions, GitLab CI, etc.):

```yaml
# Example: GitHub Actions
- name: Setup test database
  run: |
    createdb studentcbt_test
    npm run migrate:test

- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Tests still using wrong database?

Check your `.env.test` file:
```bash
cat .env.test
```

Make sure it has the correct `DATABASE_URL`.

### Command not found: dotenv?

Reinstall dotenv-cli:
```bash
npm install --save-dev dotenv-cli
```

### Tests still timing out?

Increase timeout in `jest.config.js`:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### Permissions denied on database?

Check PostgreSQL user has correct permissions:
```bash
psql -U postgres -c "ALTER DATABASE studentcbt_test OWNER TO postgres;"
```

## Advanced: Multiple Test Environments

You can create multiple test environments:

```bash
# Unit tests only
npm run test -- --testPathPattern="unit"

# Integration tests
npm run test -- --testPathPattern="integration"

# All tests
npm test
```

Or separate .env files:
```bash
# .env.unit
DATABASE_URL=postgresql://user:pass@localhost:5432/studentcbt_unit

# .env.integration
DATABASE_URL=postgresql://user:pass@localhost:5432/studentcbt_integration
```

Then add scripts:
```json
"test:unit": "dotenv -e .env.unit jest --testPathPattern=unit",
"test:integration": "dotenv -e .env.integration jest --testPathPattern=integration"
```

## Summary

With `dotenv-cli`, you now have:

| Task | Command | Environment |
|------|---------|-------------|
| Development | `npm run dev` | `.env` |
| Run Tests | `npm test` | `.env.test` |
| Watch Tests | `npm test:watch` | `.env.test` |
| Coverage | `npm test:coverage` | `.env.test` |
| Migrate Prod | `npm run migrate` | `.env` |
| Migrate Test | `npm run migrate:test` | `.env.test` |
| Production | `npm start` | `.env` |

Perfect isolation between environments! 🎉
