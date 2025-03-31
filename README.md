# Enhanced Learning Platform

This is a Next.js TypeScript application designed as a digital learning platform for students, based on the provided mockup files. It features lesson content, a sidebar for navigation, and a learning assistant component.

## Prerequisites

*   Node.js (Version specified in `.nvmrc` if available, otherwise latest LTS recommended)
*   pnpm (Package manager)

## Getting Started

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Make sure you have `pnpm` installed (`npm install -g pnpm`). Then run:
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    This will start the application locally. Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser to view it.

## Available Scripts

*   `pnpm dev`: Runs the app in development mode.
*   `pnpm build`: Builds the app for production.
*   `pnpm start`: Starts the production server (requires `pnpm build` first).
*   `pnpm lint`: Runs the linter.

## Project Structure

*   `/app`: Contains the core application routes and pages (using Next.js App Router).
*   `/components`: Contains reusable React components, including UI elements (`/ui`) and feature-specific components (`/learning-assistant`).
*   `/contexts`: Holds React Context providers for global state management.
*   `/data`: Contains mock data used by the application.
*   `/hooks`: Stores custom React hooks.
*   `/lib`: Utility functions.
*   `/public`: Static assets like images and fonts.
*   `/styles`: Global CSS styles.
*   `/types`: TypeScript type definitions.