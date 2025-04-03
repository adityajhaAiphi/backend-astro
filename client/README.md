# Client Application

This directory contains the front-end client application of our project.

## Overview

The client application is built with modern web technologies and serves as the user interface for our application. It communicates with our backend API to provide a seamless user experience.

## Technology Stack

- React.js
- Redux for state management
- React Router for navigation
- Axios for API requests
- SCSS for styling
- Jest and React Testing Library for testing

## Structure

- `public/` - Static files served directly
- `src/` - Source code
  - `assets/` - Static assets like images, fonts, etc.
  - `components/` - Reusable UI components
  - `pages/` - Main application pages/views
  - `redux/` - Redux store, actions, and reducers
  - `styles/` - CSS/SCSS stylesheets
  - `utils/` - Utility functions and helpers
  - `services/` - API service integrations
  - `hooks/` - Custom React hooks
  - `constants/` - Constants and configuration
  - `contexts/` - React context providers
  - `locales/` - Internationalization files

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher recommended)
- npm or yarn

### Installation

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000` (or another port if specified).

### Building for Production

```bash
# Create a production build
npm run build
# or
yarn build

# Preview production build locally
npm run preview
# or
yarn preview
```

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
VITE_AUTH_DOMAIN=your-auth-domain
VITE_AUTH_CLIENT_ID=your-auth-client-id
# Add other environment variables as needed
```

## Features

- User authentication (login, register, password reset)
- User profile management
- [List other key features of your application]

## Routing

The application uses React Router for navigation. Main routes include:

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile page
- `/dashboard` - User dashboard

## State Management

Redux is used for global state management. The store is organized as follows:

- `auth` - Authentication state
- `user` - User data
- `ui` - UI-related state (loading, modals, etc.)

## API Integration

API services are organized in the `services/` directory:

- `authService.js` - Authentication API calls
- `userService.js` - User-related API calls

## Testing

```bash
# Run tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch
```

## Linting and Formatting

```bash
# Run ESLint
npm run lint
# or
yarn lint

# Fix ESLint issues
npm run lint:fix
# or
yarn lint:fix

# Run Prettier
npm run format
# or
yarn format
```

## Internationalization

The application supports multiple languages using i18next. Add translations to the `locales/` directory.

## Accessibility

This application aims to be fully accessible and adheres to WCAG 2.1 guidelines.

## Browser Support

The application supports the following browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Performance Optimization

- Code splitting using React.lazy and Suspense
- Memoization using React.memo and useMemo
- Efficient re-renders using useCallback
- Image optimization

## Contributing

Please follow the project's coding standards and commit message conventions. Write tests for new features or components and ensure all tests pass before submitting a pull request.

## License


Note: If using Create React App, prefix variables with `REACT_APP_` instead of `VITE_`.