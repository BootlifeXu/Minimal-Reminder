# Minimal Reminder

A minimal reminder application with API server, React Native app, and mockup sandbox.

## Project Structure

This is a monorepo containing:

- `api-server`: Express.js API server with authentication
- `reminder-app`: React Native Expo app
- `mockup-sandbox`: Vite-based web mockup with component preview system
- `lib/`: Shared libraries (API client, schemas, database)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build all packages:
   ```bash
   pnpm run build
   ```

3. For development, see individual package READMEs.

## Component Preview Server

The mockup sandbox includes a component preview server that renders individual components for the workspace canvas.

### Accessing Component Previews

Component previews are available at:
```
https://bootlifexu.github.io/Minimal-Reminder/preview/ComponentName
```

### Example
- View the reminder card component: `/Minimal-Reminder/preview/ReminderCard`
- View the form modal: `/Minimal-Reminder/preview/ReminderFormModal`

This allows developers to view and test individual components in isolation without running the full application.

## License

MIT