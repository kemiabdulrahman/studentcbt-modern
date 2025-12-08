# Backend Testing Guide

This document outlines the Jest testing setup for the Student CBT Backend.

## Setup

### Prerequisites
- Node.js 14+
- PostgreSQL running locally
- All dependencies installed (`npm install`)

### Test Database
Create a separate test database:

```bash
# Create test database
createdb studentcbt_test

# Or using psql
psql -U postgres -c "CREATE DATABASE studentcbt_test;"
```

Update your `.env.test` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/studentcbt_test
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key
NODE_ENV=test
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test -- tests/__tests__/auth.test.js
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should"
```

## Test Structure

### Files Organization
```
tests/
├── __tests__/
│   ├── auth.test.js          # Authentication tests
│   ├── assessment.test.js     # Assessment endpoints
│   ├── student.test.js        # Student endpoints
│   └── admin.test.js          # Admin endpoints (todo)
├── setup.js                   # Jest setup configuration
└── utils.js                   # Test utilities and helpers
```

### Test Files

#### `tests/utils.js`
Contains reusable test utilities:
- `generateToken()` - Generate JWT tokens
- `getAuthHeader()` - Get Authorization headers
- `cleanupDatabase()` - Clean database between tests
- `createTestUser()` - Create test users
- `createTestStudent()` - Create student profiles
- `createTestClass()` - Create school classes
- `createTestSubject()` - Create subjects
- `createTestAssessment()` - Create assessments
- `createTestQuestion()` - Create questions
- `createTestAttempt()` - Create attempts

#### `tests/__tests__/auth.test.js`
Tests for authentication endpoints:
- User registration
- User login
- Token refresh
- Error handling

#### `tests/__tests__/assessment.test.js`
Tests for assessment management:
- Fetch assessment details
- Fetch results
- Create assessment
- Update assessment
- Authorization checks

#### `tests/__tests__/student.test.js`
Tests for student functionality:
- Fetch available assessments
- Start attempt
- Submit answers
- Submit assessment
- Fetch results

## Writing New Tests

### Test Template
```javascript
const request = require('supertest');
const { cleanupDatabase, createTestUser, getAuthHeader } = require('../utils');

describe('Feature Name', () => {
  beforeEach(async () => {
    await cleanupDatabase();
    // Setup test data
  });

  afterAll(async () => {
    await cleanupDatabase();
    // Cleanup
  });

  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set(getAuthHeader(userId, 'ROLE'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` and `afterAll` hooks
3. **Meaningful Names**: Test names should describe what they test
4. **Single Responsibility**: One test = one behavior
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Mocking**: Use test utilities to create consistent test data
7. **Error Cases**: Test both success and failure scenarios

## Coverage

View test coverage report:
```bash
npm test -- --coverage
```

Coverage reports are generated in `./coverage` directory.

Target coverage goals:
- Lines: > 80%
- Branches: > 75%
- Functions: > 80%

## CI/CD Integration

Add to your CI/CD pipeline:
```yaml
test:
  script:
    - npm install
    - npm run migrate -- --deploy
    - npm test -- --coverage
  artifacts:
    paths:
      - coverage/
```

## Troubleshooting

### Tests timeout
Increase timeout in `jest.config.js`:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### Database connection issues
- Verify test database exists
- Check `DATABASE_URL` in `.env.test`
- Ensure PostgreSQL is running

### Foreign key constraint errors
- Ensure test utilities delete in correct order
- Check `cleanupDatabase()` order matches schema relationships

### Token verification fails
- Verify `JWT_SECRET` matches between setup and app config
- Check token generation uses correct secret

## Future Enhancements

- [ ] Add integration tests with real database
- [ ] Add performance benchmarks
- [ ] Add E2E tests with Cypress/Playwright
- [ ] Add mutation testing
- [ ] Add contract testing with Pact
