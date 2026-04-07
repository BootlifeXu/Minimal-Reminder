# API Server

Express.js API server for the Minimal Reminder application with OpenID Connect authentication.

## Overview

The API Server provides:
- REST API endpoints for reminder management
- OpenID Connect (OIDC) authentication
- Mobile auth token exchange
- User management
- Secure database operations with Drizzle ORM

## Features

- **Express.js Framework**: Fast, minimalist web framework
- **OIDC Authentication**: Secure authentication using OpenID Connect
- **Type-Safe Database**: Drizzle ORM with PostgreSQL
- **Request Logging**: Pino HTTP logger for request tracking
- **CORS Support**: Cross-origin resource sharing configuration

## Development

### Environment Setup

Create a `.env` file with the following variables:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/reminders
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_ISSUER_URL=https://your-oidc-provider.com
```

### Starting the Dev Server

```bash
cd artifacts/api-server
pnpm run dev
```

Server will be available at `http://localhost:3001`

### Building for Production

```bash
cd artifacts/api-server
pnpm run build
```

Output files are in the `dist/` directory.

### Running Production Build

```bash
cd artifacts/api-server
pnpm run start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/login` - Initiate login flow
- `POST /api/mobile-auth/token-exchange` - Mobile app token exchange
- `GET /api/me` - Get current user info
- `POST /api/logout` - Logout user

### Reminders
- `GET /api/reminders` - List user's reminders
- `POST /api/reminders/sync` - Sync reminders from client
- `PUT /api/reminders/:id` - Update a reminder
- `DELETE /api/reminders/:id` - Delete a reminder

## Dependencies

- `express`: Web framework
- `drizzle-orm`: ORM for database operations
- `openid-client`: OIDC client library
- `pino`: Structured logging
- `cors`: CORS middleware

## License

MIT