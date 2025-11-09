# Face-Based Payment System

A biometric payment platform that uses facial recognition to identify users and process transactions via Interledger.

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
