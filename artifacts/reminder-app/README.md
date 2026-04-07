# Reminder App

A React Native Expo app for the Minimal Reminder application.

## Overview

The Reminder App is a mobile application built with React Native and Expo that allows users to:
- Create, read, update, and delete reminders
- Organize reminders by categories
- Set priority levels
- Snooze reminders
- Sync reminders with the backend API
- Authenticate with OpenID Connect

## Features

- **React Native & Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing for navigation
- **OIDC Authentication**: Secure authentication flow
- **Secure Storage**: Encrypted token storage with Expo Secure Store
- **Tab Navigation**: Intuitive tab-based interface
- **Reminder Management**: Full CRUD operations on reminders
- **State Management**: Context-based state management

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI: `npm install -g expo-cli`

### Environment Setup

Create a `.env` file:

```bash
EXPO_PUBLIC_ISSUER_URL=https://your-oidc-provider.com
EXPO_PUBLIC_CLIENT_ID=your-client-id
```

### Starting the Dev Server

```bash
cd artifacts/reminder-app
pnpm run dev
```

Scan the QR code with the Expo Go app or press `i` for iOS simulator / `a` for Android emulator.

### Building

```bash
cd artifacts/reminder-app
pnpm run build
```

## Project Structure

```
app/
├── _layout.tsx           # Root layout
├── +not-found.tsx        # 404 page
└── (tabs)/
    ├── _layout.tsx       # Tab navigator
    ├── index.tsx         # Home tab (reminders list)
    ├── search.tsx        # Search tab
    ├── categories.tsx    # Categories tab
    └── settings.tsx      # Settings tab

components/
├── ReminderCard.tsx      # Reminder item component
├── ReminderFormModal.tsx # Create/edit reminder form
├── SnoozeModal.tsx       # Snooze reminder dialog
├── GreetingModal.tsx     # Welcome modal
├── ErrorBoundary.tsx     # Error handling
└── EmptyState.tsx        # Empty state UI

constants/
└── colors.ts            # Color palette

context/
└── RemindersContext.tsx  # Global reminder state

lib/
└── auth.tsx             # Authentication logic

types/
└── reminder.ts          # TypeScript type definitions
```

## Key Components

### ReminderCard
Displays a single reminder with actions (edit, delete, snooze).

### ReminderFormModal
Modal for creating and editing reminders with form validation.

### SnoozeModal
Modal for snoozing a reminder with predefined durations.

### Authentication
OpenID Connect authentication flow with Expo Auth Session.

## Dependencies

- `expo`: Cross-platform framework
- `expo-router`: Routing and navigation
- `expo-auth-session`: OIDC authentication
- `expo-secure-store`: Secure token storage
- `react-native`: Core framework
- `@react-native-community/hooks`: Native hooks

## Deployment

### Expo Go (Development)
```bash
pnpm run dev
```

### Building for Production
```bash
expo eas build
```

### Publishing
```bash
expo publish
```

See [Expo documentation](https://docs.expo.dev) for detailed deployment instructions.

## License

MIT