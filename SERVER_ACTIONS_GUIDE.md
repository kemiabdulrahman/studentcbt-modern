# Server Actions Implementation Guide

## What Changed

### Files Modified:
1. **`+page.server.js`** - Added `actions` export with server action
2. **`+page.svelte`** - Converted to use Svelte 5 runes and server actions

---

## The Pattern: Before vs After

### BEFORE (Client-Side API Call)
```svelte
<script>
  import { goto } from '$app/navigation';
  
  let data = {};
  let busy = false;

  async function startExam() {
    busy = true;
    try {
      // ❌ Problem: API call exposed to client
      const response = await fetch(`/api/student/assessments/${data.assessment.id}/start`, {
        method: 'POST'
      });
      if (response.ok) {
        goto(`/student/assessments/${data.assessment.id}/take`);
      }
    } finally {
      busy = false;
    }
  }
</script>

<button on:click={startExam} disabled={busy}>
  {busy ? 'Starting...' : 'Start Assessment'}
</button>
```

### AFTER (Server Action)
```svelte
<script>
  import { goto } from '$app/navigation';

  let { data, form } = $props();
  let busy = $state(false);
  let error = $state('');

  async function startExam() {
    busy = true;
    error = '';
    try {
      // ✅ Call server action instead
      const response = await fetch(`?/startAssessment`, {
        method: 'POST',
        body: new FormData()
      });
      const result = await response.json();
      if (result.success) {
        goto(`/student/assessments/${data.assessmentId}/take`);
      } else {
        error = result.error;
      }
    } finally {
      busy = false;
    }
  }
</script>

<button on:click={startExam} disabled={busy}>
  {busy ? 'Starting...' : 'Start Assessment'}
</button>
```

**Key Differences:**
- ❌ No direct `/api/` calls in client
- ✅ Uses `?/actionName` to call server action
- ✅ All auth/token handling on server
- ✅ Better security
- ✅ Svelte 5 runes: `$state()` for reactive variables, `$props()` for props

---

## Server Action Structure

### In `+page.server.js`

```javascript
import { fail } from '@sveltejs/kit';
import { serverPost, getAuthToken } from '$lib/utils/api.server';

// Load data
export async function load({ locals, cookies, params }) {
  // Return data needed on page
  return { assessment, user };
}

// Server actions
export const actions = {
  // Action name appears as ?/actionName in form submission
  async startAssessment({ request, locals, cookies, params }) {
    // Check auth
    if (!locals.auth?.isAuthenticated) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const token = getAuthToken(cookies);
      // API call happens here (server-side, secure)
      const result = await serverPost(
        `/student/assessments/${params.id}/start`,
        {},
        token
      );
      
      // Return result to component
      return {
        success: true,
        data: result
      };
    } catch (error) {
      // Return error in fail() for form validation
      return fail(500, { error: error.message });
    }
  }
};
```

---

## Svelte 5 Runes Used

### `$props()`
```svelte
<script>
  // Declare props from parent or +page.server.js
  let { data, form } = $props();
  
  // Now you can use data.assessment, form.error, etc.
</script>
```

### `$state()`
```svelte
<script>
  // Reactive state (replaces let with reactivity)
  let busy = $state(false);
  let error = $state('');
  let count = $state(0);
  
  function increment() {
    count++; // Automatically reactive
  }
</script>
```

### Why Better Than Old Pattern?
```javascript
// OLD (Svelte 4)
let busy = false;
let error = '';
$: derivedValue = someComputation(busy);

// NEW (Svelte 5 runes)
let busy = $state(false);
let error = $state('');
let derivedValue = $derived(someComputation(busy));
```

---

## How to Apply to Other Pages

### Step 1: Identify Client-Side Fetch Calls
Search for:
```svelte
await fetch('/api/...')
const response = fetch(...)
const result = api.something(...)
```

### Step 2: Move to Server Action
```javascript
// +page.server.js
export const actions = {
  async myAction({ request, locals, cookies, params }) {
    // Move the fetch here
    const result = await serverPost('/api/endpoint', {}, token);
    return { success: true, result };
  }
};
```

### Step 3: Update Component
```svelte
<script>
  let { data, form } = $props();
  let busy = $state(false);
  
  async function handleClick() {
    const response = await fetch('?/myAction', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      // Handle success
    }
  }
</script>
```

---

## Pages That Need Server Actions

These pages currently have client-side API calls:

1. **`admin/assessments/[id]/+page.svelte`** - publish, toggleResults, exportPDF/Excel
2. **`admin/students/+page.svelte`** - delete, search
3. **`admin/classes/+page.svelte`** - create, delete
4. **`admin/subjects/+page.svelte`** - create, delete
5. **`admin/assessments/+page.svelte`** - delete assessment
6. **`admin/assessments/[id]/+page.svelte` - QuestionsManager component** - add/update/delete questions
7. **`student/assessments/+page.svelte`** - (if filtering/searching)
8. **`student/settings/+page.svelte`** - change password, update profile

### Priority Order:
1. **HIGH** - `student/assessments/[id]` (startAssessment) ✅ DONE
2. **HIGH** - `student/settings` (changePassword)
3. **MEDIUM** - Modal components (CreateAssessment, QuestionsManager)
4. **MEDIUM** - Admin pages (delete, publish)
5. **LOW** - Search/filter (less critical)

---

## Current Implementation Example

### File: `src/routes/student/assessments/[id]/+page.server.js`
```javascript
export const actions = {
  async startAssessment({ locals, cookies, params }) {
    if (!locals.auth?.isAuthenticated) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const token = getAuthToken(cookies);
      const attempt = await serverPost(
        `/student/assessments/${params.id}/start`,
        {},
        token
      );
      return { success: true, attempt, assessmentId: params.id };
    } catch (error) {
      return fail(500, { error: error.message });
    }
  }
};
```

### File: `src/routes/student/assessments/[id]/+page.svelte`
```svelte
<script>
  let { data, form } = $props();
  let busy = $state(false);
  let error = $state('');

  async function startExam() {
    busy = true;
    error = '';
    try {
      const response = await fetch(`?/startAssessment`, {
        method: 'POST',
        body: new FormData()
      });
      const result = await response.json();
      if (result.success) {
        goto(`/student/assessments/${data.assessmentId}/take`);
      } else {
        error = result.error;
      }
    } finally {
      busy = false;
    }
  }
</script>

<button on:click={startExam} disabled={busy}>
  {busy ? 'Starting...' : 'Start Assessment'}
</button>
```

---

## Benefits of This Approach

| Aspect | Before | After |
|--------|--------|-------|
| **Security** | Token exposed in browser | Token stays on server |
| **Auth** | Manual header management | Automatic via cookies |
| **Error Handling** | Client-side catch | Server-side control |
| **Type Safety** | Limited | Better with JSDoc |
| **Performance** | Slower, more requests | Direct server calls |
| **Code Organization** | Mixed logic | Separated concerns |
| **Testing** | Hard to test APIs | Easy to test actions |
| **Caching** | Client manages | Server controls |

---

## Next Steps

1. ✅ Convert `student/assessments/[id]` - DONE
2. Convert `student/settings` changePassword to action
3. Convert modal components to use actions
4. Convert admin pages delete/create to actions
5. Upgrade to Svelte 5 in package.json (optional but recommended)

---

## Additional Resources

### SvelteKit Form Actions
https://kit.svelte.dev/docs/form-actions

### Svelte 5 Runes
https://svelte.dev/docs/svelte/what-are-runes

### Progressive Enhancement
https://kit.svelte.dev/docs/form-actions#progressive-enhancement

---

## Questions?

The pattern is always:
1. **Client**: `await fetch('?/actionName', { method: 'POST', body: formData })`
2. **Server**: `export const actions = { async actionName(...) { ... } }`
3. **Return**: `return { success, data, error }`
