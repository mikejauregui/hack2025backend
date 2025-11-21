# Agent Instructions

## Project Documentation

### PRD Files
All Product Requirement Documents (PRDs) and implementation plans are located in the `/docs` folder:
- `prd-main.md` - Main product requirements document
- `prd-auth.md` - Authentication requirements
- `prd-frontend.md` - Frontend specifications
- `phase1-implementation.md` - Phase 1 implementation details
- `implementation-roadmap.md` - Overall implementation roadmap

### Playground
The `/playground` folder contains experimental code, prototypes, and testing environments.

### Migrations
Database migrations are located in `/playground/migrations`.

## Troubleshooting

### Port 3000 in use
If you cannot run the server on port 3000:
1. Run `lsof -i :3000` to get the PID of the process using the port.
2. Kill the process using `kill -9 <PID>`.
