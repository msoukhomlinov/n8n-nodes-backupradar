# API v2 Alignment Design — Remove BrightGauge Operation

**Date:** 2026-05-06
**API specs:** api-v2-20250826.json (old) → api-v2-20260228.json (new)

## Context

BackupRadar API v2 removed the `GET /backups/bg` endpoint between builds 20250826 and 20260228. All other endpoints, parameters, and authentication are unchanged. Schema namespaces shifted internally (`BackupRadar.Models.PublicAPI` → `BackupRadar.PublicApi`) but this is API-documentation-only and has no impact on HTTP calls.

## Breaking Change

| Removed | Impact |
|---|---|
| `GET /backups/bg` | `getBackupsBrightGauge` operation in n8n node calls dead endpoint |

## Design Decision

Remove the `getBackupsBrightGauge` operation entirely. No deprecation shim, no error wrapper — clean delete.

## Files to Delete

- `src/nodes/BackupRadar/description/getBackupsBrightGauge.operation.ts`

## Files to Modify

| File | Change |
|---|---|
| `src/nodes/BackupRadar/description/index.ts` | Remove import block for `getBackupsBrightGaugeOperationOption` and `getBackupsBrightGaugeOperationFields`; remove both inline array references (`options` entry and `...getBackupsBrightGaugeOperationFields` spread) |
| `src/nodes/BackupRadar/BackupRadar.node.ts` | Remove operation from dropdown options; remove `case 'getBackupsBrightGauge'` execution branch |
| `package.json` | Bump to `2.0.0` — removing a public operation is a breaking change per semver |

## Out of Scope

- Docs cleanup (old/new dated API spec files)
- Changelog
- Any changes to remaining 7 operations, credentials, transport, or auth

## Verification

- TypeScript build passes with no errors
- Remaining operations: getBackup, getBackupResults, getBackups, getFilters, getInactiveBackups, getOverview, getRetiredBackups
