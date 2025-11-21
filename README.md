# Face-Based Payment System

A biometric payment platform that uses facial recognition to identify users and process transactions via Interledger.

# About This project

[One Page Doc](https://docs.google.com/document/d/1S2hedoYSg_eU0Mr8ETCOuv1DbL44KDl4SGwY3fXBGQk/edit?usp=sharing)

## Project Structure

### Documentation
All Product Requirement Documents (PRDs) and implementation plans are located in the `/docs` folder:
- `prd-main.md` - Main product requirements document
- `prd-auth.md` - Authentication requirements
- `prd-frontend.md` - Frontend specifications
- `phase1-implementation.md` - Phase 1 implementation details
- `implementation-roadmap.md` - Overall implementation roadmap

### Playground
The `/playground` folder contains experimental code, prototypes, and testing environments for development and testing purposes.

### Migrations
Database migrations are located in `/playground/migrations`.

# Frontend Repo

The frontend code is located in a separate repository: [face-pay-frontend](https://github.com/mikejauregui/hack2025front)

## Features

- **Facial Recognition Authentication**: Identifies users through AWS Rekognition face matching
- **Interledger Payments**: Processes payments using Open Payments protocol
- **Transaction Management**: Tracks and stores transaction history with metadata
- **Multi-modal Input**: Supports snapshot uploads and optional voice transcripts
- **Client Management**: Manages registered clients with wallet integration

## Tech Stack

**Runtime & Framework**

- Bun (runtime, bundler, package manager)
- React 19 + Wouter (routing)
- TailwindCSS 4 + shadcn/ui components

**Backend**

- Bun.serve() for HTTP server
- PostgreSQL (via `Bun.sql`)
- S3 file storage (via `bun:s3`)

**Integrations**

- AWS Rekognition (facial recognition)
- Interledger Open Payments (payment processing)
- SWR (data fetching)

## Getting Started

Install dependencies:

```bash
bun install
```

Configure environment variables (create `.env`):

```bash
KEY_ID=your_key_id
BASS_URL=your_base_url
```

Start development server:

```bash
bun dev
```

Run production build:

```bash
bun start
```

## API Endpoints

- `POST /api/upload` - Upload snapshot & process payment
- `GET /api/transactions` - List all transactions
- `GET /api/clients` - List registered clients
- `POST /api/grant` - Initiate payment grant flow
- `GET /api/clients/:id/confirm` - Confirm payment grant
- `GET /api/me` - Get current user info

## Troubleshooting

### Port 3000 in use

If you encounter an error that port 3000 is already in use, you can identify and kill the process using the following commands:

```bash
# Find the PID of the process using port 3000
lsof -i :3000

# Kill the process (replace <PID> with the actual process ID)
kill -9 <PID>
```