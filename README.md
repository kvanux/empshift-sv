# Employee Shift Scheduler (Frontend)

A Svelte-based user interface for managing employee shift schedules. This project serves as the frontend for interacting with a backend algorithm that generates optimized schedules.

## Overview

This application provides an intuitive web interface for users to:

- Input employee availability and preferences.
- View and manage shift schedules.
- Send requests to a backend API that handles schedule optimization.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or an alternative package manager like [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/).

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd empshift-fe/empshift-sv
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the backend API URL by creating a `.env` file in the root directory:

   ```env
   VITE_API_URL="http://localhost:8080/api/schedule"
   ```

## Developing

To start the development server:

```bash
npm run dev
```

This will start the server and make the app available at `http://localhost:5173`. Use the `--open` flag to automatically open it in your browser:

```bash
npm run dev -- --open
```

## Building

To create a production build of the app:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

## Deployment

To deploy the app, you may need to configure a SvelteKit adapter for your target environment. The project currently uses the `@sveltejs/adapter-auto` adapter.

## API Integration

This frontend communicates with a backend API that handles the scheduling logic. Ensure the backend is running and accessible at the URL specified in the `.env` file.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.