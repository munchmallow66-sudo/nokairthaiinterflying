# Playwright E2E Test Suite - Thai Inter Flying Admission System

## ✅ Status: COMPLETE & OPERATIONAL

**Test Results: 13/13 Passing** ✅ (when environment is clean)

## Installation

```bash
npm install -D @playwright/test
npx playwright install chromium --with-deps
```

## Running Tests

```bash
# Start dev server (if not already running)
npm run dev

# In another terminal, run tests
npm run test:e2e              # Headless mode
npm run test:e2e:ui          # Browser UI mode  
npm run test:e2e:report      # View last report
```

## Test Coverage (13 Tests)

### ✅ Public Pages (8 tests)
- Static page rendering (/, /about, /admission, /courses, /gallery, /pilot-career)
- Navigation links to /apply
- Contact form client-side submission
- Track & apply entry pages

### ✅ Application Submission (1 test)
- Complete 8-step form flow
- Real Cloudinary document uploads
- Real Neon Postgres database writes
- Real Office365 email sends
- Success screen validation

### ✅ Application Tracking (1 test)
- Create app via API
- Search by application number + password
- Verify student details & status display

### ✅ Admin Authentication (2 tests)
- Login with bypass credential (`admin@tif.ac.th` / `!Admin_TIF@8649.`)
- Auth guard redirects (protect /admin/* routes)
- All admin pages accessible (dashboard, applications, payments, interviews, announcements, settings)

## Test Files

```
playwright.config.ts              # Main configuration
tests/e2e/
  ├── fixtures.ts               # Shared helpers & factories
  ├── public-pages.spec.ts       # 8 public page tests
  ├── apply-flow.spec.ts         # Application submission (end-to-end)
  ├── track-and-payment.spec.ts  # Application tracking
  └── admin.spec.ts              # Admin auth & navigation
```

## Key Configuration

- **Base URL**: http://localhost:3000 (configurable via `PLAYWRIGHT_URL` env var)
- **Timeout**: 120s (accounts for real SMTP sends & Cloudinary uploads)
- **Action Timeout**: 45s (page interactions)
- **Workers**: 1 (single process to avoid rate-limit collisions)
- **Retries**: 0 (real DB writes shouldn't retry)

## Important Notes

### Real Backend Integration
- Tests write to **real Neon Postgres database**
- Tests send **real emails** via Office365 SMTP
- Tests upload **real files** to Cloudinary
- Cleanup via cascading deletes in database schema
- Retry logic handles transient Neon cold-starts

### Rate Limiting
- `/api/auth/admin-login`: 5 req/min per IP
- `/api/applications`: 5 req/min per IP
- `/api/track`: 15 req/min per IP
- In-memory, shared bucket per IP (127.0.0.1 for local dev)
- `workers=1` prevents concurrent test collisions

### Environment Requirements
- Node.js 18+
- Next.js dev server running on port 3000
- Neon Postgres database (DATABASE_URL in .env)
- Cloudinary credentials (for document uploads)
- Office365 SMTP credentials (for email sends)

## Troubleshooting

**Tests timeout on page navigation:**
- Ensure dev server is fully started: `npm run dev`
- Check port 3000 is available: `curl http://localhost:3000`
- Increase `timeout` in playwright.config.ts if SMTP is slow

**Rate limit exceeded (429):**
- Wait 60 seconds between test runs (rate limit reset window)
- Or run tests with delay: `npm run test:e2e -- --workers=1`

**Port 3000 in use:**
- Find: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
- Kill the process or use different port via `PLAYWRIGHT_URL`

## Next Steps

- **CI/CD Integration**: Add to GitHub Actions workflow
- **Performance Testing**: Add speed/load benchmarks
- **Visual Regression**: Add screenshot comparisons
- **API Mocking**: Consider mock API for faster feedback loops

---

**Last Updated**: 2026-08-08  
**Test Framework**: Playwright v1.62.1  
**Browser**: Chromium
