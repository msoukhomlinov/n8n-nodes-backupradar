# API v2 Alignment — Remove BrightGauge Operation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the dead `getBackupsBrightGauge` operation (calls `GET /backups/bg` which no longer exists in BackupRadar API v2) and bump the package version to 2.0.0.

**Architecture:** Three touch-points in the codebase: delete the operation definition file, strip two import lines and two array references from the properties index, remove the 68-line execution branch from the node. No new code — pure deletion.

**Tech Stack:** TypeScript, n8n-workflow, npm

---

### Task 1: Delete operation file and strip index.ts references

**Files:**
- Delete: `src/nodes/BackupRadar/description/getBackupsBrightGauge.operation.ts`
- Modify: `src/nodes/BackupRadar/description/index.ts`

- [ ] **Step 1: Delete the operation file**

```bash
git rm src/nodes/BackupRadar/description/getBackupsBrightGauge.operation.ts
```

Expected output: `rm 'src/nodes/BackupRadar/description/getBackupsBrightGauge.operation.ts'`

- [ ] **Step 2: Remove the import block from index.ts**

In `src/nodes/BackupRadar/description/index.ts`, remove lines 3–6:

```ts
// DELETE these three lines:
import {
  getBackupsBrightGaugeOperationOption,
  getBackupsBrightGaugeOperationFields,
} from './getBackupsBrightGauge.operation.js';
```

The file should go from:

```ts
import type { INodeProperties } from 'n8n-workflow';
import { getBackupsOperationOption, getBackupsOperationFields } from './getBackups.operation.js';
import {
  getBackupsBrightGaugeOperationOption,
  getBackupsBrightGaugeOperationFields,
} from './getBackupsBrightGauge.operation.js';
import { getBackupOperationOption, getBackupOperationFields } from './getBackup.operation.js';
```

To:

```ts
import type { INodeProperties } from 'n8n-workflow';
import { getBackupsOperationOption, getBackupsOperationFields } from './getBackups.operation.js';
import { getBackupOperationOption, getBackupOperationFields } from './getBackup.operation.js';
```

- [ ] **Step 3: Remove getBackupsBrightGaugeOperationOption from the options array**

In `src/nodes/BackupRadar/description/index.ts`, remove `getBackupsBrightGaugeOperationOption,` from the `options` array.

From:

```ts
    options: [
      getBackupsOperationOption,
      getBackupsBrightGaugeOperationOption,
      getBackupOperationOption,
```

To:

```ts
    options: [
      getBackupsOperationOption,
      getBackupOperationOption,
```

- [ ] **Step 4: Remove the getBackupsBrightGaugeOperationFields spread**

In `src/nodes/BackupRadar/description/index.ts`, remove `...getBackupsBrightGaugeOperationFields,` from the properties array.

From:

```ts
  ...getBackupsOperationFields,
  ...getBackupsBrightGaugeOperationFields,
  ...getBackupOperationFields,
```

To:

```ts
  ...getBackupsOperationFields,
  ...getBackupOperationFields,
```

- [ ] **Step 5: Verify index.ts final state**

The complete file should now be:

```ts
import type { INodeProperties } from 'n8n-workflow';
import { getBackupsOperationOption, getBackupsOperationFields } from './getBackups.operation.js';
import { getBackupOperationOption, getBackupOperationFields } from './getBackup.operation.js';
import {
  getBackupResultsOperationOption,
  getBackupResultsOperationFields,
} from './getBackupResults.operation.js';
import { getFiltersOperationOption, getFiltersOperationFields } from './getFilters.operation.js';
import {
  getInactiveBackupsOperationOption,
  getInactiveBackupsOperationFields,
} from './getInactiveBackups.operation.js';
import {
  getRetiredBackupsOperationOption,
  getRetiredBackupsOperationFields,
} from './getRetiredBackups.operation.js';
import { getOverviewOperationOption, getOverviewOperationFields } from './getOverview.operation.js';

export const backupRadarNodeProperties: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      getBackupsOperationOption,
      getBackupOperationOption,
      getBackupResultsOperationOption,
      getFiltersOperationOption,
      getInactiveBackupsOperationOption,
      getRetiredBackupsOperationOption,
      getOverviewOperationOption,
    ],
    default: 'getBackups',
  },
  ...getBackupsOperationFields,
  ...getBackupOperationFields,
  ...getBackupResultsOperationFields,
  ...getFiltersOperationFields,
  ...getInactiveBackupsOperationFields,
  ...getRetiredBackupsOperationFields,
  ...getOverviewOperationFields,
];
```

- [ ] **Step 6: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors. If errors appear, they will reference `getBackupsBrightGauge` — you missed a reference; search and remove it.

- [ ] **Step 7: Commit**

```bash
git add src/nodes/BackupRadar/description/index.ts
git commit -m "feat: remove getBackupsBrightGauge operation definition (API endpoint removed)"
```

---

### Task 2: Remove execution branch from BackupRadar.node.ts

**Files:**
- Modify: `src/nodes/BackupRadar/BackupRadar.node.ts:222-290`

- [ ] **Step 1: Delete the case 'getBackupsBrightGauge' block**

In `src/nodes/BackupRadar/BackupRadar.node.ts`, remove the entire block from line 222 to line 290 (inclusive):

```ts
          case 'getBackupsBrightGauge': {
            const baseQs: IDataObject = {};
            const date = this.getNodeParameter('date', itemIndex, '') as string;
            const days = this.getNodeParameter('days', itemIndex) as number;
            const includeResults = this.getNodeParameter('includeResults', itemIndex) as boolean;
            const includeHistoryDetails = this.getNodeParameter(
              'includeHistoryDetails',
              itemIndex,
            ) as boolean;

            if (date && date.trim()) baseQs.date = date;
            if (days !== undefined && days > 0) baseQs.days = days;
            if (includeResults !== undefined) baseQs.includeResults = includeResults;
            if (includeHistoryDetails !== undefined)
              baseQs.includeHistoryDetails = includeHistoryDetails;

            // Pagination
            const returnAll = this.getNodeParameter('returnAll', itemIndex, true);
            if (returnAll) {
              // Fetch all pages
              const allResults: IDataObject[] = [];
              let currentPage = 1;
              const pageSize = 1000; // Max page size for efficiency
              let totalPages = 1;
              let totalCount = 0;

              do {
                const qs = { ...baseQs, Page: currentPage, Size: pageSize };
                const pageResponse = (await requestBackupRadar.call(this, 'GET', '/backups/bg', {
                  qs,
                })) as IDataObject;

                if (
                  pageResponse &&
                  'Results' in pageResponse &&
                  Array.isArray(pageResponse.Results)
                ) {
                  allResults.push(...(pageResponse.Results as IDataObject[]));
                  totalPages = (pageResponse.TotalPages as number) || 1;
                  if (currentPage === 1) {
                    totalCount = (pageResponse.Total as number) || allResults.length;
                  }
                  currentPage++;

                  // Respect API rate limiting: 1 request per 0.5 seconds
                  if (currentPage <= totalPages) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                } else {
                  break;
                }
              } while (currentPage <= totalPages);

              // Create a response object with all results
              response = {
                Total: totalCount,
                Page: 1,
                PageSize: allResults.length,
                TotalPages: 1,
                Results: allResults,
              };
            } else {
              // Fetch single page
              const limit = this.getNodeParameter('limit', itemIndex, 50);
              const qs = { ...baseQs, Page: 1, Size: limit };
              response = await requestBackupRadar.call(this, 'GET', '/backups/bg', { qs });
            }
            break;
          }
```

After deletion, the `case 'getBackups'` block (ending with `break;` at line ~219) should be immediately followed by `case 'getBackup':`.

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/nodes/BackupRadar/BackupRadar.node.ts
git commit -m "feat: remove getBackupsBrightGauge execution branch"
```

---

### Task 3: Bump version and build

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update version in package.json**

Change line 3 from:

```json
  "version": "1.0.0",
```

To:

```json
  "version": "2.0.0",
```

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: build completes with no errors. Output will be in `dist/`.

- [ ] **Step 3: Verify no BrightGauge references remain**

```bash
grep -r "BrightGauge\|brightgauge\|backups/bg" src/
```

Expected: no output. If any matches appear, find and remove them before continuing.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: bump version to 2.0.0 (breaking: remove BrightGauge operation)"
```
