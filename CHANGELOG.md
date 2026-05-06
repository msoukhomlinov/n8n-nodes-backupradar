# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [3.0.0] - 2026-05-06

### Changed (Breaking)
- `getBackups`: replaced `HistoryDays` and `date` parameters with a date range selector (`dateRangeMode`, `presetRange`, `daysBack`, `dateFrom`, `dateTo`). Existing workflows using those fields must be updated.

### Added
- Date range presets: Today, Last 1–31 Days, Last 45/60/90 Days
- Automatic multi-API chunking for ranges >31 days (API maximum per call)
- Cross-chunk history merging with deduplication by `backupId`
- DST-safe date arithmetic; validates overflow and inverted date ranges

## [2.0.0] - 2026-05-06

### Removed (Breaking)
- Removed `getBackupsBrightGauge` operation (BackupRadar API endpoint removed)

## [1.0.0] - 2025-11-14

### Added

- Initial release of BackupRadar n8n community node
- Support for BackupRadar API v2 operations
- Operations: Get Backup, Get Backups, Get Backup Results, Get Overview, Get Filters, Get Inactive Backups, Get Retired Backups, Get Backups BrightGauge
- BackupRadarApi credential for authentication
