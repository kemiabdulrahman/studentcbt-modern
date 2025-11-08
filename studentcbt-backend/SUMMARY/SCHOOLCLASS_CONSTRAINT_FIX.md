# SchoolClass Model Constraint Fix

## Problem Statement
The `SchoolClass` model had a constraint that prevented multiple classes with the same level but different streams (e.g., SS1 Science and SS1 Art) from coexisting in the database.

### Original Issue
```prisma
// ❌ BEFORE (PROBLEMATIC)
model SchoolClass {
  id     String @id @default(cuid())
  name   String @unique  // ← This prevents SS1, SS1 occurring twice
  stream String?
  // ...
}
```

**Problem**: The seed file tried to create:
- `{ name: 'SS1', stream: 'Science' }`
- `{ name: 'SS1', stream: 'Art' }` (would fail due to unique constraint on `name`)

---

## Solution Implemented

### 1. Schema Changes (`prisma/schema.prisma`)

**Before**:
```prisma
model SchoolClass {
  id     String @id @default(cuid())
  name   String @unique  // ← Unique on name only
  stream String?
  // ...
}
```

**After**:
```prisma
model SchoolClass {
  id     String @id @default(cuid())
  name   String  // ← Removed @unique
  stream String?

  // Relationships...
  
  @@unique([name, stream])  // ← Composite unique on (name, stream)
  @@map("school_classes")
}
```

**Key Changes**:
- ✅ Removed `@unique` from `name` field
- ✅ Added composite unique constraint: `@@unique([name, stream])`
- ✅ Allows multiple classes with same `name` but different `stream` values
- ✅ Allows multiple classes with `stream: null` OR only one per combination

**Why This Works**:
- `(SS1, Science)` and `(SS1, Art)` are now both allowed ✅
- `(JSS1, null)` is unique ✅
- Duplicate `(SS1, Science)` entries are prevented ✅

---

### 2. Seed File Corrections (`src/utils/seed.js`)

**Before**:
```javascript
prisma.schoolClass.upsert({
  where: { name: 'SS1 Science' },  // ❌ Looking up by name only
  update: {},
  create: { name: 'SS1', stream: 'Science' }
})
```

**After**:
```javascript
prisma.schoolClass.upsert({
  where: { 
    name_stream: { name: 'SS1', stream: 'Science' }  // ✅ Composite key lookup
  },
  update: {},
  create: { name: 'SS1', stream: 'Science' }
})
```

**All Classes Updated**:
```javascript
// JSS Classes (no stream)
{ name: 'JSS1', stream: null }
{ name: 'JSS2', stream: null }
{ name: 'JSS3', stream: null }

// SS Classes (with stream)
{ name: 'SS1', stream: 'Science' }
{ name: 'SS2', stream: 'Science' }
{ name: 'SS3', stream: 'Science' }
```

---

## Migration Steps

### Step 1: Create Migration
```bash
cd /home/abdulrahman/studentcbt-backend
npx prisma migrate dev --name add_class_stream_composite_unique
```

**Note**: If you have existing data with duplicate `name` values and different `stream` values:
- Prisma will detect this and ask for data cleanup
- Follow the prompts or manually clean data before applying migration

### Step 2: Verify Migration
```bash
npx prisma db push  # Verify the schema changes are applied
```

### Step 3: Re-seed Data (Optional)
```bash
node src/utils/seed.js
```

---

## Data Migration Guide

### If You Have Existing Data

Before running the migration, check for duplicate classes:

```sql
-- Check for duplicate class names with different streams
SELECT name, stream, COUNT(*) 
FROM school_classes 
GROUP BY name, stream 
HAVING COUNT(*) > 1;

-- Check for duplicate class names (regardless of stream)
SELECT name, COUNT(*) 
FROM school_classes 
GROUP BY name 
HAVING COUNT(*) > 1;
```

**If you find conflicts**:

1. **Option A: Delete duplicates (if it's test data)**
   ```bash
   npx prisma studio  # Use Prisma Studio UI to view and delete
   ```

2. **Option B: Manually fix in seed.js**
   - Update the seed file to match your desired class structure
   - Run migration
   - Re-seed with corrected data

3. **Option C: Custom migration**
   - Create a custom migration file if you need complex data transformations
   - Place in `prisma/migrations/` directory

---

## Files Modified

### 1. `prisma/schema.prisma`
**Change**: SchoolClass model constraint
- Removed: `name String @unique`
- Added: `@@unique([name, stream])`

**Lines Changed**: 
- Line with `name String @unique` → `name String`
- Added composite unique constraint

### 2. `src/utils/seed.js`
**Change**: Updated all `schoolClass.upsert()` calls
- Changed `where: { name: '...' }` → `where: { name_stream: { name: '...', stream: '...' } }`
- Affects 6 upsert operations for JSS1, JSS2, JSS3, SS1, SS2, SS3

**Classes Affected**:
```javascript
// JSS Classes (stream: null)
- JSS1, JSS2, JSS3

// SS Classes (stream: 'Science')
- SS1, SS2, SS3
```

---

## Benefits of This Change

| Aspect | Before | After |
|--------|--------|-------|
| **SS1 Science + SS1 Art** | ❌ Impossible | ✅ Possible |
| **Multiple streams** | ❌ Limited | ✅ Flexible |
| **Composite uniqueness** | ❌ Name only | ✅ (Name, Stream) |
| **Backward compatible** | — | ✅ Yes (for single stream) |
| **JSS classes (no stream)** | ✅ Works | ✅ Works |

---

## Example: Valid Class Configurations After Fix

### Scenario 1: Single Stream Per Level
```javascript
{ name: 'JSS1', stream: null }      // ✅
{ name: 'JSS2', stream: null }      // ✅
{ name: 'SS1', stream: 'Science' }  // ✅
```

### Scenario 2: Multiple Streams
```javascript
{ name: 'SS1', stream: 'Science' }  // ✅
{ name: 'SS1', stream: 'Art' }      // ✅ Now allowed!
{ name: 'SS1', stream: 'Commerce' } // ✅ Now allowed!
{ name: 'JSS1', stream: null }      // ✅
```

### Invalid (Will Fail)
```javascript
{ name: 'SS1', stream: 'Science' }  // First occurrence - OK
{ name: 'SS1', stream: 'Science' }  // ❌ Duplicate of above
```

---

## Testing the Changes

### Test 1: Create Multiple Streams
```bash
# Login as admin and create:
- SS1 Science class
- SS1 Art class
- SS2 Science class
- SS2 Art class
# All should succeed ✅
```

### Test 2: Verify Uniqueness Constraint
```bash
# Try to create duplicate class with same stream
- Create SS1 Science (1st time) → Success ✅
- Create SS1 Science (2nd time) → Error ❌ (expected)
```

### Test 3: Seed Data
```bash
node src/utils/seed.js
# Should complete without errors
# Check database for correct class structures
```

---

## Verification Checklist

After applying the migration:

- [ ] Migration applied successfully
- [ ] No database errors during migration
- [ ] Existing data preserved (if applicable)
- [ ] Seed script runs without errors
- [ ] Can create SS1 Science + SS1 Art simultaneously
- [ ] Cannot create duplicate (SS1, Science) entries
- [ ] JSS classes with null stream work correctly
- [ ] Admin UI can create multi-stream classes
- [ ] Student assignment works for both streams

---

## Rollback Instructions (If Needed)

If you need to revert the changes:

```bash
# View migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate deploy

# Revert schema.prisma changes
# (Apply the original @unique constraint)
```

---

## Next Steps

1. ✅ **Schema Updated** - `prisma/schema.prisma` modified
2. ✅ **Seed Fixed** - `src/utils/seed.js` corrected
3. ⏳ **Run Migration** (Manual):
   ```bash
   cd /home/abdulrahman/studentcbt-backend
   npx prisma migrate dev --name add_class_stream_composite_unique
   ```
4. ⏳ **Test the changes** using the admin UI

---

## Summary

| Item | Status |
|------|--------|
| **Schema Fix** | ✅ DONE |
| **Seed Fix** | ✅ DONE |
| **Composite Unique Constraint** | ✅ IMPLEMENTED |
| **Documentation** | ✅ COMPLETE |
| **Ready for Migration** | ✅ YES |

The system now supports multiple class streams (e.g., SS1 Science, SS1 Art) while maintaining data integrity through composite unique constraints.
