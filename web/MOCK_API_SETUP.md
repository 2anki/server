# Mock API Setup for Playwright Testing

This setup provides comprehensive API mocking for the 2anki web application during Playwright testing. You now have two approaches to choose from:

## 🎯 Quick Start

For immediate testing with mocked APIs, run:

```bash
# Test with route interception (recommended for most cases)
npm run test:e2e -- tests/app-with-mocks.spec.ts

# Or test with external mock server
npm run test:e2e:with-mock
```

## 📋 Available Approaches

### 1. Route Interception (Recommended)

**File**: `tests/app-with-mocks.spec.ts`

This approach intercepts network requests directly in Playwright and provides mock responses without running a separate server.

**Advantages:**
- ✅ No additional server to manage
- ✅ Faster test execution
- ✅ More reliable (no port conflicts)
- ✅ Better isolation between tests
- ✅ Easier to customize per test

**Usage:**
```bash
npx playwright test tests/app-with-mocks.spec.ts
```

### 2. External Mock Server

**Files**: `mock-server/server.js`

This approach runs a complete Express.js mock server that mimics the real API.

**Advantages:**
- ✅ Full API documentation with Swagger
- ✅ Can be used for manual testing
- ✅ More realistic network behavior
- ✅ Easier to share mock data between tests
- ✅ Useful for integration testing

**Usage:**
```bash
# Using environment variable (recommended)
npm run test:e2e:with-mock

# Or run specific mock server tests
npx playwright test tests/mock-api.spec.ts

# Manual approach
npm run mock-server & npm run test:e2e
```

## 🔧 Configuration Details

### Route Interception Setup

The route interception approach is configured in `tests/app-with-mocks.spec.ts` with:

```typescript
await page.route('**/api/users/debug/locals**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ /* mock data */ })
  });
});
```

### Mock Server Setup

The external mock server runs on `http://localhost:2020` and provides:

- **Swagger Documentation**: `http://localhost:2020/docs`
- **Health Check**: `http://localhost:2020/health`
- **All API Endpoints**: Matching the real API structure

The Playwright configuration automatically detects when mock server is needed:
- When `PLAYWRIGHT_WITH_MOCK=true` environment variable is set
- When running tests that include `mock-api.spec.ts`

## 📊 Mocked API Endpoints

Both approaches mock these key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/debug/locals` | GET | User information and features |
| `/api/settings/card-options` | GET | Available card options |
| `/api/notion/pages` | POST | Search Notion pages |
| `/api/notion/page/:id` | GET | Get specific page |
| `/api/notion/database/:id` | GET | Get specific database |
| `/api/upload/mine` | GET | User's uploads |
| `/api/upload/jobs` | GET | Conversion jobs |
| `/api/favorite/mine` | GET | User's favorites |
| And many more... | | See mock server for complete list |

## 🚀 Running Tests

### Option 1: Route Interception Tests

```bash
# Run the mocked tests
npx playwright test tests/app-with-mocks.spec.ts

# Run with UI
npx playwright test tests/app-with-mocks.spec.ts --ui

# Run in debug mode
npx playwright test tests/app-with-mocks.spec.ts --debug
```

### Option 2: External Mock Server Tests

```bash
# Use environment variable to enable mock server
npm run test:e2e:with-mock

# Run specific mock server tests
npx playwright test tests/mock-api.spec.ts

# Start mock server manually first
npm run mock-server

# Then run tests (in another terminal)
npm run test:e2e
```

### Option 3: Both Approaches

```bash
# Run all tests including mocked ones
npm run test:e2e
npx playwright test tests/app-with-mocks.spec.ts
```

## 🔍 Test Results

When running tests with mocks, you should see:

1. **No API Connection Errors**: Previously, you'd see `ECONNREFUSED` errors
2. **Faster Test Execution**: No waiting for real API responses
3. **Predictable Data**: Consistent mock responses every time
4. **Better Test Isolation**: Each test gets fresh mock data

### Before (without mocks):
```
[WebServer] http proxy error: /api/users/debug/locals
[WebServer] AggregateError [ECONNREFUSED]
```

### After (with mocks):
```
✓ homepage loads without API errors
✓ can search for notion pages without backend
✓ user locals are properly mocked
```

## 🛠️ Customizing Mocks

### For Route Interception

Edit `tests/app-with-mocks.spec.ts`:

```typescript
await page.route('**/api/users/debug/locals**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      // Your custom mock data here
      features: { kiUI: false }  // e.g., test without kiUI feature
    })
  });
});
```

### For External Mock Server

Edit `mock-server/server.js`:

```javascript
// Modify the mockUsers array or any endpoint handler
const mockUsers = [
  {
    id: 1,
    name: 'Custom Test User',
    email: 'custom@example.com',
    // ... your modifications
  }
];
```

## 📝 Adding New Mock Endpoints

### Route Interception

Add new route handlers in the `beforeEach` block:

```typescript
await page.route('**/api/your-new-endpoint**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ your: 'data' })
  });
});
```

### External Mock Server

Add new routes in `mock-server/server.js`:

```javascript
app.get('/api/your-new-endpoint', (req, res) => {
  res.json({ your: 'data' });
});
```

## 🎯 Best Practices

1. **Use Route Interception for Unit-like Tests**: When testing specific components or user flows
2. **Use Mock Server for Integration Tests**: When testing full user journeys or API contracts
3. **Keep Mock Data Realistic**: Use data that closely resembles production data
4. **Test Error Scenarios**: Mock API failures to test error handling
5. **Document Your Mocks**: Keep mock data well-documented for team understanding

## 🔄 Workflow Integration

### CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Run E2E Tests with Mocks
  run: |
    npm run test:e2e -- tests/app-with-mocks.spec.ts
    npm run test:e2e:with-mock
```

### Development Workflow

```bash
# During development
npm run mock-server  # Terminal 1
npm run start        # Terminal 2
# Manually test against mock API

# For automated testing
npm run test:e2e -- tests/app-with-mocks.spec.ts
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Make sure port 2020 is free
2. **Route Pattern Matching**: Use `**` for flexible matching
3. **CORS Issues**: Mock server has CORS enabled
4. **Timing Issues**: Add `page.waitForTimeout()` if needed

### Debug Commands

```bash
# Check if mock server is running
curl http://localhost:2020/health

# Run single test with debug
npx playwright test tests/app-with-mocks.spec.ts --debug

# Check Playwright report
npx playwright show-report
```

## 📚 Additional Resources

- Mock Server Documentation: `mock-server/README.md`
- Swagger API Docs: `http://localhost:2020/docs` (when server is running)
- Playwright Route Interception: [Official Docs](https://playwright.dev/docs/network#mock-apis)

---

Choose the approach that best fits your testing needs. Route interception is recommended for most scenarios due to its simplicity and reliability.