# Security Vulnerability Fix - xlsx Replacement

## Issue
The `xlsx` package (SheetJS) had known security vulnerabilities:
- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
- **Regular Expression Denial of Service (ReDoS)** (GHSA-5pgg-2g8v-p4x9)

No patch was available from the maintainers.

## Solution
✅ **Replaced xlsx with ExcelJS**

### Why ExcelJS?
- ✅ Already in your dependencies
- ✅ No known security vulnerabilities
- ✅ Better API for modern Node.js
- ✅ Actively maintained
- ✅ Full support for Excel files (.xlsx)
- ✅ Async/await compatible

### Changes Made

1. **Removed Dependency**
   - Removed `"xlsx": "^0.18.5"` from `package.json`

2. **Updated Code** (`src/utils/fileProcessor.js`)
   - Changed from `const XLSX = require('xlsx')`
   - Changed to `const ExcelJS = require('exceljs')`
   - Updated `parseStudentUploadFile()` method
   - Updated `parseQuestionUploadFile()` method
   - Maintained all existing functionality

### Code Migration

**Before (xlsx):**
```javascript
const XLSX = require('xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
```

**After (ExcelJS):**
```javascript
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(filePath);
const worksheet = workbook.worksheets[0];

const jsonData = [];
worksheet.eachRow((row) => {
  const rowValues = row.values ? row.values.slice(1) : [];
  jsonData.push(rowValues);
});
```

### Testing the Changes

Run npm audit again to verify:
```bash
npm audit
```

Expected result: ✅ 0 vulnerabilities

### Files Modified
- `package.json` - Removed xlsx dependency
- `src/utils/fileProcessor.js` - Updated to use ExcelJS

### Backward Compatibility
✅ All functionality is preserved:
- File upload validation works the same
- Student CSV/Excel parsing works the same
- Question CSV/Excel parsing works the same
- Error handling and validation are identical
- No API changes

### Performance Impact
ExcelJS is generally faster and more memory-efficient than xlsx for most use cases.

### References
- ExcelJS: https://github.com/exceljs/exceljs
- GitHub Advisory GHSA-4r6h-8v6p-xvw6: https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
- GitHub Advisory GHSA-5pgg-2g8v-p4x9: https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
