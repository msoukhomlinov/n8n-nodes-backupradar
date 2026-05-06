# n8n-nodes-backupradar

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)

n8n community node for integrating with BackupRadar's API v2. BackupRadar is a backup monitoring and management platform that helps track and manage backup operations across multiple systems and services.

This node provides comprehensive access to BackupRadar's backup data, allowing you to query backups, retrieve backup results, monitor backup status, and integrate backup monitoring into your n8n workflows.

## Version

**3.0.0** - Date range UX for Get Backups (6 May 2026) — see [CHANGELOG](./CHANGELOG.md)

## Features

- **Backup Operations**: Query and retrieve backup information with advanced filtering
- **Date Range Selection**: Preset ranges (Today, Last 1–31/45/60/90 Days), custom days-back, or explicit from/to dates
- **Multi-Chunk Fetching**: Ranges >31 days automatically split into sequential API calls and merged
- **Backup Results**: Access detailed backup execution results and history
- **Filtering & Search**: Filter backups by company, tags, status, backup methods, device types, and more
- **Overview & Analytics**: Get backup overview statistics and analytics
- **Specialised Queries**: Access inactive and retired backups
- **Pagination Support**: Automatic pagination handling for large result sets
- **Rate Limiting**: Built-in rate limiting compliance (0.5s between requests)

## Requirements

- Node.js >= 20.15
- n8n v1+

## Installation

Install in n8n via the GUI or manually:

```bash
npm install n8n-nodes-backupradar
```

## Usage

### Credentials

Configure the `BackupRadarApi` credential with your BackupRadar API key.

### Operations

The Backup Radar node supports the following operations:

- **Get Backups**: Retrieve backups with advanced filtering (companies, tags, status, backup methods, device types, policy types, etc.) and flexible date range selection (presets, days-back, or explicit from/to)
- **Get Backup**: Get detailed information for a specific backup by ID
- **Get Backup Results**: Retrieve backup execution results and history for a specific backup
- **Get Overview**: Get backup overview statistics and summary information
- **Get Filters**: Retrieve available filter options (companies, tags, statuses, backup methods, device types, policy types)
- **Get Inactive Backups**: Query backups that are currently inactive
- **Get Retired Backups**: Retrieve backups that have been retired

All list operations support pagination and can return all results or a limited set.

## Development

```bash
npm install
npm run build
npm run lint
npm run typecheck
npm test
```

## Publish

Ensure the package name follows `n8n-nodes-*` (or `@scope/n8n-nodes-*`), then:

```bash
npm publish --access public
```

## License

Apache-2.0 © Max Soukhomlinov
