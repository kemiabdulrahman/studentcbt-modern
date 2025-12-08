# Jest Testing Quick Start

## 1. Setup Test Database

```bash
# Create test database
createdb studentcbt_test

# Or using psql
psql -U postgres -c "CREATE DATABASE studentcbt_test;"
```

## 2. Create `.env.test` file in the backend root

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/studentcbt_test
JWT_SECRET=test-secret-key-do-not-use-in-production
JWT_REFRESH_SECRET=test-refresh-secret-key
NODE_ENV=test
PORT=5001
```

## 3. Run Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/__tests__/auth.test.js

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Single test
npm test -- --testNamePattern="should register a new student"
```

## 4. Test Files Available

✅ **auth.test.js** - Authentication tests
- User registration
- User login
- Token refresh

✅ **assessment.test.js** - Assessment management tests
- Create assessment
- Fetch assessment details
- Get results

✅ **student.test.js** - Student functionality tests
- Get available assessments
- Start attempt
- Submit answers
- Submit assessment
- View results

## 5. Test Utilities

Use these in your tests:

```javascript
const {
  createTestUser,
  createTestStudent,
  createTestClass,
  createTestSubject,
  createTestAssessment,
  createTestQuestion,
  createTestAttempt,
  getAuthHeader,
  cleanupDatabase,
  prisma
} = require('../utils');

const {
  createFullTestScenario,
  simulateAssessmentAttempt,
  createMultipleStudents,
  verifyAssessmentStats
} = require('../scenarios');
```

## 6. Example Test

```javascript
it('should fetch assessment details', async () => {
  // Setup
  const assessment = await createTestAssessment(classId, subjectId);
  
  // Act
  const res = await request(app)
    .get(`/api/assessment/${assessment.id}`)
    .set(getAuthHeader(userId, 'ADMIN'));
  
  // Assert
  expect(res.status).toBe(200);
  expect(res.body.assessment.id).toBe(assessment.id);
});
```

## 7. Quick Reference

**Before Each Test:**
```javascript
beforeEach(async () => {
  await cleanupDatabase();
  // Create test data
});
```

**After All Tests:**
```javascript
afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});
```

**Making API Requests:**
```javascript
const res = await request(app)
  .post('/api/endpoint')
  .set(getAuthHeader(userId, 'STUDENT'))
  .send({ data: 'value' });

expect(res.status).toBe(200);
expect(res.body).toHaveProperty('data');
```

## 8. Coverage Report

Generate and view coverage:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## 9. Common Issues

**Test timeout?**
- Increase timeout in tests: `jest.setTimeout(30000)`
- Check if test database exists

**Database errors?**
- Verify `studentcbt_test` database exists
- Check DATABASE_URL in `.env.test`

**Token errors?**
- Ensure JWT_SECRET matches in both places
- Use `getAuthHeader()` for proper token generation

## 10. Next Steps

- [ ] Create admin endpoint tests
- [ ] Add integration tests
- [ ] Increase coverage to 80%+
- [ ] Add performance tests
- [ ] Set up CI/CD with test automation
