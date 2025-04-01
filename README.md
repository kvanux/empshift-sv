# Employee Shift Scheduler (Frontend)

A Svelte-based user interface for managing employee shift schedules, also serves to make HTTP request to a backend algorithm that helps generates optimized schedules.

## Overview

This application provides an intuitive web interface for users to:

- Input employee availability and preferences.
- View and manage shift schedules.
- Send requests to a backend API that handles schedule optimization.

## Usage

#### Live demo usage is stable and running at https://empshift-sv-cs50.vercel.app/

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or an alternative package manager like [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/).

## Getting Started

**If you just want to try using the application, live demo is stable and running at:** https://empshift-sv-cs50.vercel.app/

1. Clone the repository:

   ```bash
   git clone https://github.com/kvanux/empshift-sv.git
   cd empshift-sv
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the backend API URL by creating a `.env` file in the root directory:

   ```env
   VITE_API_URL="https://empshift-csp.fly.dev/api/schedule"
   ```

## Start Local Environment

**If you just want to try using the application, live demo is stable and running at:** https://empshift-sv-cs50.vercel.app/

To start the development server:

```bash
npm run dev
```

This will start the server and make the app available at `http://localhost:5173`. Use the `--open` flag to automatically open it in your browser:

```bash
npm run dev -- --open
```


## API Integration

This frontend communicates with a backend API that handles the scheduling logic. Ensure the backend is running and accessible at the URL specified in the `.env` file.

## License

This project is licensed under the MIT License.
