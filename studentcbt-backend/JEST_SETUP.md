# Backend Jest Testing Setup - Complete

## What's Been Created

### 1. Configuration Files

- **`jest.config.js`** - Jest configuration
  - Test environment: Node.js
  - Coverage collection
  - Test file patterns
  - Module name mapping

- **`tests/setup.js`** - Test environment setup
  - Set NODE_ENV to 'test'
  - Configure test database URL
  - Set JWT secrets
  - Suppress console logs
  - Increase timeout to 10s

### 2. Test Utilities

- **`tests/utils.js`** - Reusable test helpers
  - `generateToken()` - Create JWT tokens
  - `getAuthHeader()` - Get Authorization headers
  - `cleanupDatabase()` - Clear database between tests
  - `createTestUser()` - Create test users
  - `createTestStudent()` - Create student profiles
  - `createTestClass()` - Create school classes
  - `createTestSubject()` - Create subjects
  - `createTestAssessment()` - Create assessments
  - `createTestQuestion()` - Create test questions
  - `createTestAttempt()` - Create assessment attempts

- **`tests/scenarios.js`** - Advanced test scenarios
  - `createFullTestScenario()` - Complete test setup
  - `simulateAssessmentAttempt()` - Simulate student taking exam
  - `createMultipleStudents()` - Batch student creation
  - `verifyAssessmentStats()` - Verify statistics
  - `createAssessmentWithMixedQuestions()` - Create mixed question types

### 3. Test Suites

- **`tests/__tests__/auth.test.js`** - Authentication tests
  - ✅ User registration
  - ✅ User login
  - ✅ Token refresh
  - ✅ Error handling (duplicate email, invalid email, wrong password)

- **`tests/__tests__/assessment.test.js`** - Assessment management tests
  - ✅ Fetch assessment details
  - ✅ Fetch assessment results
  - ✅ Create assessment
  - ✅ Update assessment
  - ✅ Authorization checks

- **`tests/__tests__/student.test.js`** - Student functionality tests
  - ✅ Get available assessments
  - ✅ Start assessment attempt
  - ✅ Submit answers
  - ✅ Submit assessment
  - ✅ View detailed results
  - ✅ Answer validation

### 4. Documentation

- **`tests/README.md`** - Comprehensive testing guide
  - Setup instructions
  - Running tests
  - Test structure explanation
  - Writing new tests
  - Best practices
  - CI/CD integration

- **`TESTING.md`** - Quick start guide
  - Fast setup
  - Commands reference
  - Common issues
  - Examples

## Quick Start

### 1. Create Test Database
```bash
createdb studentcbt_test
```

### 2. Create `.env.test`
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/studentcbt_test
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key
NODE_ENV=test
```

### 3. Run Tests
```bash
npm test
```

## Test Coverage

Currently covers:

| Area | Coverage |
|------|----------|
| Authentication | ✅ 4 test cases |
| Assessments | ✅ 5 test cases |
| Student Functions | ✅ 7 test cases |
| **Total** | **✅ 16 test cases** |

## Command Reference

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific file
npm test -- tests/__tests__/auth.test.js

# Watch mode (rerun on changes)
npm test -- --watch

# Run tests matching pattern
npm test -- --testNamePattern="should"

# Run single test
npm test -- --testNamePattern="should register a new student"

# Generate coverage HTML report
npm test -- --coverage && open coverage/lcov-report/index.html
```

## Test Data Helpers

### Creating Test Data
```javascript
const scenario = await createFullTestScenario({
  email: 'student@example.com',
  className: 'JSS1',
  subjectName: 'Mathematics',
  assessmentTitle: 'Math Quiz',
  totalMarks: 100,
  passMarks: 50
});

// scenario contains: user, schoolClass, subject, student, assessment, questions
```

### Simulating Assessment
```javascript
const attempt = await simulateAssessmentAttempt(
  studentId,
  assessmentId,
  {
    [questionId1]: 'correct answer',
    [questionId2]: 'wrong answer'
  }
);
```

### Making API Requests
```javascript
const res = await request(app)
  .post('/api/endpoint')
  .set(getAuthHeader(userId, 'STUDENT'))
  .send({ data: 'value' });

expect(res.status).toBe(200);
```

## Architecture Benefits

1. **Isolated Testing** - Each test is independent
2. **Database Cleanup** - Automatic cleanup between tests
3. **Reusable Utilities** - DRY test code
4. **Real Scenarios** - Can simulate complex flows
5. **Coverage Tracking** - Measure code coverage
6. **CI/CD Ready** - Easy to integrate with pipelines

## Next Steps

1. ✅ Setup Jest configuration
2. ✅ Create test utilities
3. ✅ Write endpoint tests
4. ⏭️ Add admin tests
5. ⏭️ Add error case tests
6. ⏭️ Increase coverage to 80%+
7. ⏭️ Setup CI/CD pipeline
8. ⏭️ Add performance benchmarks

## File Structure

```
studentcbt-backend/
├── jest.config.js              ← Jest configuration
├── TESTING.md                  ← Quick start guide
├── tests/
│   ├── setup.js               ← Environment setup
│   ├── utils.js               ← Reusable helpers
│   ├── scenarios.js           ← Advanced scenarios
│   ├── README.md              ← Detailed guide
│   └── __tests__/
│       ├── auth.test.js       ← Auth tests
│       ├── assessment.test.js ← Assessment tests
│       └── student.test.js    ← Student tests
└── src/
    └── ... (app files)
```

## Tips for Writing Tests

1. **Use beforeEach/afterAll** for setup/cleanup
2. **Test both success and failure** cases
3. **Use meaningful test names** that describe behavior
4. **Follow Arrange-Act-Assert** pattern
5. **Keep tests small** and focused
6. **Mock external dependencies** as needed
7. **Test at the API level** for integration tests
8. **Use test utilities** to avoid duplication

## Support

For detailed information, see:
- `tests/README.md` - Complete testing guide
- `TESTING.md` - Quick reference
- Individual test files for examples
