# Mockup Sandbox

A Vite-based web mockup with an interactive component preview system.

## Overview

The Mockup Sandbox is a component preview and prototyping tool that allows developers to:
- View individual UI components in isolation
- Test components with different props and states
- Build and iterate on designs before integrating into the main application

## Features

- **Component Preview**: Access individual components at `/preview/ComponentName`
- **Infinite Canvas**: Interactive canvas for designing and prototyping
- **Hot Module Replacement**: Fast development experience with HMR
- **Tailwind CSS**: Styling with Tailwind utility classes
- **Radix UI Components**: Accessible component primitives

## Development

### Starting the Dev Server

```bash
cd artifacts/mockup-sandbox
PORT=3000 BASE_PATH=/ pnpm run dev
```

Server will be available at `http://localhost:3000`

### Building for Production

```bash
cd artifacts/mockup-sandbox
pnpm run build
```

The built files are output to `dist/` and ready for deployment.

## Accessing Component Previews

Once running, access component previews using:

```
http://localhost:3000/preview/ComponentName
```

### Example Components
- `/preview/ReminderCard` - Reminder card component
- `/preview/ReminderFormModal` - Form modal for creating/editing reminders
- `/preview/Button` - Button component
- `/preview/Card` - Card container component

## Project Structure

```
src/
├── App.tsx              # Main app component with preview renderer
├── main.tsx             # React entry point
├── components/
│   ├── ui/              # Reusable UI components
│   └── mockups/         # Component mockups and examples
├── lib/
│   └── utils.ts         # Utility functions
├── index.css            # Global styles
└── hooks/               # Custom React hooks
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `BASE_PATH`: Base URL path for routing (default: /)

For GitHub Pages deployment, `BASE_PATH` is set to `/Minimal-Reminder/`

### Vite Config

See `vite.config.ts` for Vite configuration including:
- Build output directory (`dist/`)
- Development server settings
- Plugin configuration

## License

MIT