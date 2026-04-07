# DigiEqub Frontend

A React-based frontend for the DigiEqub application, a digital rotating savings and credit association platform.

## Features

- User authentication
- Dashboard for managing groups and transactions
- Group management
- Transaction tracking
- Admin panel for system administration

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Zustand for state management
- Axios for API calls
- React Router for navigation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint