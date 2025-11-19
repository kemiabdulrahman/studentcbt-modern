# Your Frontend Architecture Overview

## Current Setup Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SVELTEKIT FRONTEND                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│   Route Pages        │      │  Modal Components    │
│ (+page.svelte)       │      │ (CreateAssessment,   │
│                      │      │  QuestionsManager,   │
│ export let data ✅   │      │  LoginForm, etc.)    │
│                      │      │                      │
│ ✅ Server data       │      │ ✅ Client API calls  │
│ ✅ No API calls      │      │ ✅ Self-contained    │
│ ✅ Guaranteed data   │      │ ✅ Reusable          │
└──────────┬───────────┘      └────────┬─────────────┘
           │                           │
           │ (data prop)               │ (api.*)
           │                           │
           ▼                           ▼
┌──────────────────────────────────────────────────┐
│         +page.server.js Load Functions           │
│    (Admin: 9 pages, Student: 6 pages)            │
│                                                  │
│  export async function load({...}) {             │
│    const data = await serverGet(...)            │
│    return { data }                              │
│  }                                              │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│            API Utilities                         │
│                                                  │
│  Client-Side: $lib/api/                         │
│  ├─ core.js (apiFetch, parseResponse)           │
│  ├─ auth.js (login, profile, changePassword)    │
│  ├─ admin.js (students, classes, subjects)      │
│  ├─ assessments.js (create, publish, etc)       │
│  ├─ student.js (dashboard, results, etc)        │
│  ├─ upload.js (uploadStudents, downloadFile)    │
│  └─ index.js (exports all)                      │
│                                                  │
│  Server-Side: $lib/utils/api.server.js          │
│  ├─ serverGet (fetch with auth token)           │
│  ├─ serverPost (POST with auth token)           │
│  └─ getAuthToken (extract from cookies)         │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│         Authentication Layer                     │
│                                                  │
│  Server-Side: hooks.server.js                   │
│  ├─ Extract auth_tokens & auth_user cookies     │
│  └─ Populate event.locals.auth                  │
│                                                  │
│  Client-Side: $lib/stores/auth.js               │
│  ├─ authStore (isAuthenticated, user, tokens)   │
│  ├─ Derived stores (isAdmin, isStudent, etc)    │
│  └─ Persists to cookies                         │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│           Backend API (Node.js)                  │
│      http://localhost:5000/api                   │
│                                                  │
│  /auth/login                                    │
│  /admin/students, /admin/classes, etc           │
│  /assessment (CRUD operations)                  │
│  /student/assessments, /student/results, etc    │
│  /upload/students, /upload/questions            │
└──────────────────────────────────────────────────┘
```

---

## Data Flow: Two Patterns

### Pattern A: Server-Side Data Loading (Routes)

```
User visits /admin/students
    ↓
+page.server.js load() runs
    ↓
serverGet(/admin/students) with token
    ↓
Returns data
    ↓
+page.svelte receives as export let data
    ↓
Page renders with data.students
    ↓
✅ Data guaranteed, no loading state needed
```

**Files Involved:** 2
- `src/routes/admin/students/+page.server.js`
- `src/routes/admin/students/+page.svelte`

**Security:** ✅✅✅ Excellent (server-side only)

---

### Pattern B: Client-Side Modal Loading (Components)

```
Component mounts
    ↓
onMount() or component initialization
    ↓
api.admin.classes.getAll() 
    ↓
API wrapper adds token from store
    ↓
Returns data
    ↓
Component state updated
    ↓
Template re-renders
    ↓
User sees data
```

**Files Involved:** 1
- `src/lib/components/admin/CreateAssessment.svelte`

**Security:** ✅✅ Good (token from cookies/store)

---

## File Structure

```
studentcbt-frontend/
├── src/
│   ├── lib/
│   │   ├── api/                      ✅ NEW (Modular)
│   │   │   ├── core.js               (Auth, fetch wrapper)
│   │   │   ├── auth.js               (Login, profile)
│   │   │   ├── admin.js              (Students, classes, subjects)
│   │   │   ├── assessments.js        (CRUD, publish, results)
│   │   │   ├── student.js            (Dashboard, results)
│   │   │   ├── upload.js             (File operations)
│   │   │   └── index.js              (Main export)
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js                (Backward compatibility wrapper)
│   │   │   ├── api.server.js         (Server-side helpers)
│   │   │   ├── validation.js         (Form schemas)
│   │   │   └── helpers.js            (Utility functions)
│   │   │
│   │   ├── stores/
│   │   │   ├── auth.js               (Authentication state)
│   │   │   └── ui.js                 (Toast, modal state)
│   │   │
│   │   └── components/
│   │       ├── auth/
│   │       │   ├── LoginForm.svelte  (api.auth.login())
│   │       │   └── ChangePassword.svelte (api.auth.changePassword())
│   │       │
│   │       ├── admin/
│   │       │   ├── CreateAssessment.svelte (api.assessments.create())
│   │       │   ├── QuestionsManager.svelte (api.assessments.questions.*)
│   │       │   ├── StudentUpload.svelte (api.upload.*)
│   │       │   └── ResultsExport.svelte (api.upload.downloadFile())
│   │       │
│   │       └── student/
│   │           ├── ExamInterface.svelte (api.student.*)
│   │           └── ...
│   │
│   ├── routes/
│   │   ├── hooks.server.js           (Extract cookies → locals.auth)
│   │   ├── hooks.client.js           (Client-side error handling)
│   │   │
│   │   ├── +layout.server.js         (Return auth state to all pages)
│   │   ├── +layout.svelte            (Global layout + redirects)
│   │   │
│   │   ├── auth/login/
│   │   │   └── +page.svelte          (Uses LoginForm component)
│   │   │
│   │   ├── admin/
│   │   │   ├── +page.server.js       (serverGet counts)
│   │   │   ├── +page.svelte
│   │   │   ├── students/
│   │   │   │   ├── +page.server.js   (serverGet students list)
│   │   │   │   └── +page.svelte
│   │   │   ├── classes/
│   │   │   │   ├── +page.server.js   (serverGet classes)
│   │   │   │   └── +page.svelte
│   │   │   ├── subjects/
│   │   │   │   ├── +page.server.js   (serverGet subjects)
│   │   │   │   └── +page.svelte
│   │   │   └── assessments/
│   │   │       ├── +page.server.js   (serverGet assessments)
│   │   │       ├── +page.svelte      (Embed CreateAssessment modal)
│   │   │       ├── [id]/
│   │   │       │   ├── +page.server.js (serverGet single assessment)
│   │   │       │   ├── +page.svelte   (Embed QuestionsManager modal)
│   │   │       │   └── results/
│   │   │       │       ├── +page.server.js (serverGet results)
│   │   │       │       ├── +page.svelte
│   │   │       │       └── [studentId]/
│   │   │       │           ├── +page.server.js (serverGet attempt details)
│   │   │       │           └── +page.svelte
│   │   │
│   │   └── student/
│   │       ├── +page.server.js       (serverGet dashboard stats)
│   │       ├── +page.svelte
│   │       ├── assessments/
│   │       │   ├── +page.server.js   (serverGet available assessments)
│   │       │   ├── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.js (serverGet assessment details)
│   │       │       ├── +page.svelte   (With start exam button)
│   │       │       └── (take exam page if exists)
│   │       ├── results/
│   │       │   ├── +page.server.js   (serverGet results list)
│   │       │   ├── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.js (serverGet single result)
│   │       │       └── +page.svelte
│   │       └── settings/
│   │           ├── +page.server.js   (serverGet profile)
│   │           └── +page.svelte      (Embed ChangePassword modal)
│   │
│   ├── app.css
│   ├── app.html
│   └── ...
```

---

## Component Communication

```
                    ┌─ AuthLayout
                    │   └─ LoginForm
                    │       └─ api.auth.login()
                    │
Route Page ──────── ├─ MainLayout
                    │   ├─ Header
                    │   │   └─ api calls (if any)
                    │   └─ Sidebar
                    │       └─ stores (isAdmin, isStudent)
                    │
                    └─ Content
                        ├─ Data (from +page.server.js)
                        └─ Modal/Components
                            └─ api.* (client-side)

Examples:
- /admin/assessments
  └─ Data: assessments (from server)
     └─ Modal: CreateAssessment
        └─ api.assessments.create() (client)

- /student/settings
  └─ Data: profile (from server)
     └─ Modal: ChangePassword
        └─ api.auth.changePassword() (client)
```

---

## API Call Locations

### Server-Side (In +page.server.js)
```javascript
// Secure, always server-side
import { serverGet, serverPost, getAuthToken } from '$lib/utils/api.server';

export async function load({ locals, cookies }) {
  const token = getAuthToken(cookies);
  const data = await serverGet('/endpoint', token);
  return { data };
}
```

**Used for:** Loading page data, fetching initial state

**Files:** All `+page.server.js` files (15+ files)

---

### Client-Side (In Components)
```javascript
// Client-side wrapper, token from store
import { api } from '$lib/utils/api';
// OR
import { api } from '$lib/api';

const response = await api.auth.login(formData);
```

**Used for:** Modal operations, form submissions, user actions

**Files:**
- LoginForm.svelte
- ChangePassword.svelte
- CreateAssessment.svelte
- QuestionsManager.svelte
- StudentUpload.svelte
- ResultsExport.svelte
- ExamInterface.svelte

---

## State Management

```
┌─────────────────────────────────┐
│      Authentication State       │
│    ($lib/stores/auth.js)        │
│                                 │
│  authStore                      │
│  ├─ isAuthenticated (boolean)   │
│  ├─ user (User object)          │
│  ├─ tokens (accessToken, etc)   │
│  └─ isLoading (boolean)         │
│                                 │
│  Derived stores                 │
│  ├─ isAdmin (boolean)           │
│  ├─ isStudent (boolean)         │
│  ├─ currentUser (User)          │
│  └─ userRole (string)           │
└────────────┬────────────────────┘
             │ Persisted to cookies
             │ (auth_tokens, auth_user)
             │
┌────────────▼────────────────────┐
│         Browser Cookies         │
│                                 │
│  auth_tokens (7-day expiry)    │
│  auth_user (7-day expiry)      │
└─────────────────────────────────┘
```

---

## Performance Checklist

✅ **Server-side data loading** - Routes don't wait for JS
✅ **API calls centralized** - Consistent error handling
✅ **Modular API** - Tree-shakeable
✅ **Auth handled correctly** - Token refresh on 401
✅ **No unnecessary renders** - Proper reactivity
✅ **Stores for UI state** - Not data state
⚠️ **Could add caching** - Optional optimization

---

## Security Checklist

✅ **Auth token in cookies** - HttpOnly, Secure flags
✅ **Server-side token extraction** - Never exposed to client fully
✅ **API wrapper adds token** - Automatic, consistent
✅ **401 handling** - Token refresh + redirect to login
✅ **Role-based redirects** - Server-side checks
✅ **CORS configured** - Backend allows frontend origin
⚠️ **Could add CSRF** - Optional for forms

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Architecture | ✅ Solid | Server routes + client modals |
| API Calls | ✅ Good | Centralized, token-aware |
| Security | ✅ Good | Server-side auth handling |
| Performance | ✅ Good | Proper data loading strategy |
| Maintainability | ✅ Good | Clear separation of concerns |
| Code Organization | ✅ Good | Modular, follows SvelteKit patterns |
| Scalability | ✅ Good | Easy to add new pages/components |
| Testing | ⚠️ Could improve | No tests currently |
| Documentation | ⚠️ Minimal | Create guides (← Done now!) |

**Grade: 8.5/10** - Excellent foundation, well-architected

---

## How to Navigate This Architecture

### If you want to add a new admin page:
1. Create `src/routes/admin/[feature]/+page.server.js` with `load()` using `serverGet()`
2. Create `src/routes/admin/[feature]/+page.svelte` using `export let data`
3. Done! Page has data on render.

### If you want to add a modal component:
1. Create `src/lib/components/admin/[Feature].svelte` with `api.*()` calls
2. Embed in page: `<Feature {data} />`
3. Done! Component is reusable.

### If you want to add a server action:
1. Add to `+page.server.js`: `export const actions = { async actionName(...) { ... } }`
2. Call from component: `fetch('?/actionName', { method: 'POST' })`
3. Handle result: `const result = await response.json()`
4. Done! Server-side operation.

---

## Questions This Architecture Answers

**Q: Where do I fetch data for the page?**  
A: In `+page.server.js` using `serverGet()`

**Q: Where do I handle auth?**  
A: In `hooks.server.js` (initialization) and `stores/auth.js` (client state)

**Q: Where do I call APIs from components?**  
A: Import `api` from `$lib/api/` and use `api.namespace.method()`

**Q: How do I secure sensitive operations?**  
A: Move them to server actions in `+page.server.js`

**Q: How do I handle tokens?**  
A: Automatically! `api` wrapper or `getAuthToken()` handle it.

**Q: How do I add new endpoints?**  
A: Add method to `src/lib/api/[namespace].js`, export in `index.js`

This is a well-thought-out architecture. No changes needed.
