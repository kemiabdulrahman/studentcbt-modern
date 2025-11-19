# Component-to-Action Conversion Guide

## What Files Change When Converting a Component

When you convert a component from using `api.*()` to using server actions, **2 files change**:

### Example: Converting ChangePassword Component

---

## File 1: Create/Update `+page.server.js`

**Location:** `src/routes/student/settings/+page.server.js`

```javascript
import { fail } from '@sveltejs/kit';
import { serverPost, getAuthToken } from '$lib/utils/api.server';

export const actions = {
  // NEW: Add this action
  async changePassword({ request, locals, cookies }) {
    // Auth check
    if (!locals.auth?.isAuthenticated) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      // Parse form data
      const formData = await request.formData();
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');

      // Validate
      if (!currentPassword || !newPassword) {
        return fail(400, { error: 'All fields required' });
      }

      // Get token and call API (server-side, secure)
      const token = getAuthToken(cookies);
      await serverPost('/auth/change-password', {
        currentPassword,
        newPassword
      }, token);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return fail(400, {
        error: error.message || 'Failed to change password'
      });
    }
  }
};
```

---

## File 2: Update Component

**Location:** `src/lib/components/auth/ChangePassword.svelte`

```svelte
<script>
  import { enhance } from '$app/forms';
  import Button from '$components/ui/Button.svelte';
  import Input from '$components/ui/Input.svelte';
  import Alert from '$components/ui/Alert.svelte';

  // Props
  let { form } = $props();

  // State
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let message = $state('');

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      // This is client-side, so check locally first
      message = 'Passwords do not match';
      return;
    }

    loading = true;

    try {
      // Submit to server action
      const formData = new FormData(e.target);
      const response = await fetch('?/changePassword', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        message = result.message;
        // Reset message after 3 seconds
        setTimeout(() => { message = ''; }, 3000);
      } else {
        message = result.error;
      }
    } catch (error) {
      message = error.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
  <h2 class="text-2xl font-bold mb-6">Change Password</h2>

  {#if message}
    <Alert type={form?.success ? 'success' : 'error'} dismissible>
      {message}
    </Alert>
  {/if}

  <form on:submit={handleSubmit} class="space-y-4">
    <Input
      label="Current Password"
      type="password"
      name="currentPassword"
      bind:value={currentPassword}
      required
      disabled={loading}
    />

    <Input
      label="New Password"
      type="password"
      name="newPassword"
      bind:value={newPassword}
      required
      disabled={loading}
    />

    <Input
      label="Confirm Password"
      type="password"
      name="confirmPassword"
      bind:value={confirmPassword}
      required
      disabled={loading}
    />

    <Button
      type="submit"
      disabled={loading}
      variant="primary"
      class="w-full"
    >
      {loading ? 'Changing...' : 'Change Password'}
    </Button>
  </form>
</div>
```

---

## What Changes: Summary

| File | Change | What You Do |
|------|--------|-----------|
| `+page.server.js` | **CREATE** new `actions` export | Add `export const actions = { async actionName(...) { ... } }` |
| Component | **UPDATE** API calls | Replace `api.method()` with `fetch('?/actionName', {...})` |
| **NOTHING ELSE** | No other files needed | That's it! |

---

## Step-by-Step Example: CreateAssessment Component

### Current (Client-Side API Call)

**CreateAssessment.svelte:**
```svelte
<script>
  import { api } from '$lib/utils/api';
  
  async function handleSubmit() {
    // ❌ API call in client component
    const resp = await api.assessments.create({
      title: form.title,
      classId: form.classId,
      // ... more fields
    });
    
    if (resp.assessment) {
      // Success
    }
  }
</script>
```

### Converted (Server Action)

**Step 1: Update `admin/assessments/+page.server.js`**
```javascript
export const actions = {
  async createAssessment({ request, locals, cookies }) {
    if (!locals.auth?.isAuthenticated) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const classId = formData.get('classId');
    // ... get other fields

    try {
      const token = getAuthToken(cookies);
      const result = await serverPost('/assessment', {
        title,
        classId,
        // ... other fields
      }, token);

      return { success: true, assessment: result.assessment };
    } catch (error) {
      return fail(400, { error: error.message });
    }
  }
};
```

**Step 2: Update Component**
```svelte
<script>
  import { enhance } from '$app/forms';
  
  async function handleSubmit() {
    // ✅ Call server action instead
    const response = await fetch('?/createAssessment', {
      method: 'POST',
      body: new FormData(formElement)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Success
    }
  }
</script>
```

---

## Components Organized by Difficulty

### Easy to Convert (1 file change)
```
- LoginForm.svelte → auth/login/+page.server.js
- ChangePassword.svelte → student/settings/+page.server.js
```

### Medium (2-3 file changes)
```
- CreateAssessment.svelte → admin/assessments/+page.server.js
- StudentUpload.svelte → admin/students/+page.server.js
- ResultsExport.svelte → admin/assessments/[id]/results/+page.server.js
```

### Complex (Multiple related changes)
```
- QuestionsManager.svelte → admin/assessments/[id]/+page.server.js
  (needs multiple actions: addQuestion, updateQuestion, deleteQuestion)
- ExamInterface.svelte → student/assessments/[id]/+page.server.js
  (needs: submitAnswer, submitAssessment)
```

---

## Pattern: Converting Any Component

### 1. Identify API Calls in Component
```svelte
<script>
  // Find these:
  await api.something.doSomething(data);
  const result = await api.another.call();
</script>
```

### 2. Create Server Action in `+page.server.js`
```javascript
export const actions = {
  async actionName({ request, locals, cookies }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    try {
      const token = getAuthToken(cookies);
      const result = await serverPost('/api/endpoint', data, token);
      return { success: true, result };
    } catch (error) {
      return fail(400, { error: error.message });
    }
  }
};
```

### 3. Update Component to Call Action
```svelte
<script>
  async function handleSubmit() {
    const formData = new FormData();
    formData.append('field1', value1);
    // ... add all fields
    
    const response = await fetch('?/actionName', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <!-- form fields -->
</form>
```

---

## Multiple Actions in One Page

You can have **multiple actions** in one `+page.server.js`:

```javascript
export const actions = {
  async createAssessment({ request, locals, cookies }) {
    // Handle create
  },
  
  async updateAssessment({ request, locals, cookies }) {
    // Handle update
  },
  
  async deleteAssessment({ request, locals, cookies }) {
    // Handle delete
  },
  
  async publishAssessment({ request, locals, cookies }) {
    // Handle publish
  }
};
```

Then call them from components:
```svelte
<button on:click={() => fetch('?/deleteAssessment', { method: 'POST' })}>
  Delete
</button>

<button on:click={() => fetch('?/publishAssessment', { method: 'POST' })}>
  Publish
</button>
```

---

## When to Do This Conversion

### Priority: SHOULD DO
1. **LoginForm** - Auth operations ← Considered sensitive
2. **ChangePassword** - Auth operations ← Very sensitive
3. **DeleteAssessment/Student** - Destructive operations ← Security

### Priority: NICE TO HAVE
1. **CreateAssessment** - Large forms
2. **QuestionsManager** - Multiple operations
3. **StudentUpload** - File operations

### Priority: OPTIONAL
1. **ResultsExport** - Read-only data
2. **ExamInterface** - Complex but fine as-is

---

## File Count Summary

### Current Setup
- `src/lib/utils/api.js` (1 file)
- `src/lib/utils/api.server.js` (1 file)
- Components with API calls (many files)
- `+page.server.js` for routes (15+ files)

### If You Convert Everything
- `src/lib/api/` folder (6 files) ✅ Already done
- `src/lib/utils/api.server.js` (1 file)
- Components (same files, just without API calls)
- `+page.server.js` with lots of actions (15+ files, more code)

**Net Change:** ~500 lines of code moved from components to server

---

## Real World: What I Recommend

1. **NOW (0 effort):** Keep everything as-is ✅
   - Works fine
   - Simple to understand
   - Good performance

2. **SOON (4-5 hours):** Convert sensitive operations
   - LoginForm → auth/login/+page.server.js
   - ChangePassword → student/settings/+page.server.js
   - Delete operations → respective pages

3. **LATER (8-10 hours):** Convert remaining forms
   - All create/update operations → actions
   - All modals → use page actions

4. **FUTURE:** Add progressive enhancement
   - Use SvelteKit's `enhance()` directive
   - Works without JavaScript
   - Better user experience

---

## How Many Files Change Per Conversion?

| Conversion | Files Changed | Effort |
|-----------|---------------|--------|
| Simple component | 1 file (component) | 10 min |
| Modal with data | 2 files (+page.server.js + component) | 20 min |
| Multiple actions | 3 files (component splits, +page.server.js) | 30 min |
| Full page refactor | 5+ files (multiple components + page) | 1-2 hours |

---

## Summary

**To convert a component to use server actions:**
1. Add `actions` export to `+page.server.js`
2. Update component to call `fetch('?/actionName', { method: 'POST' })`
3. That's it! Only **2 files** change per component

**Your app is already in good shape.** You don't need to do this conversion unless you want better security or cleaner code.
