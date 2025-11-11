# Keystone Access

A modern, secure web application for managing university keys, tracking inventory, and overseeing key assignments.

[cloudflarebutton]

Keystone Access is a sophisticated, visually stunning web application designed for university key management. It provides a centralized system for administrators to track, inventory, and manage the entire lifecycle of keys. The system features a main dashboard for at-a-glance statistics, a comprehensive key inventory with search and filtering, a personnel directory, and a transaction log for all key assignments. Built on Cloudflare Workers and Durable Objects, it ensures high performance, security, and scalability. The user interface is crafted with meticulous attention to detail, using a modern design system to provide an intuitive, efficient, and delightful user experience.

## ✨ Key Features

-   **Dashboard Overview:** At-a-glance statistics for total keys, issued keys, available keys, and overdue keys.
-   **Comprehensive Key Inventory:** A searchable, sortable, and filterable view of all keys in the system.
-   **Personnel Management:** A directory of all individuals who can be assigned keys, with contact and department details.
-   **Transaction Logging:** A complete history of all key assignments, returns, and status changes.
-   **Reporting & Analytics:** Visual reports on key activity, usage by department, and inventory status.
-   **Secure & Scalable:** Built on Cloudflare's serverless platform for high performance and reliability.

## 🚀 Technology Stack

-   **Frontend:**
    -   [React](https://react.dev/)
    -   [React Router](https://reactrouter.com/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
    -   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    -   [Framer Motion](https://www.framer.com/motion/) for animations
    -   [Lucide React](https://lucide.dev/) for icons
-   **Backend:**
    -   [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
-   **Storage:**
    -   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
-   **Tooling:**
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Bun](https://bun.sh/)

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/docs/installation) installed
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated:
    ```bash
    bun install -g wrangler
    wrangler login
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd keystone_access_system
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Run the development server:**
    The development server will start the Vite frontend and the Wrangler server for the backend API concurrently.
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

The project is organized as a monorepo-like structure with clear separation between the frontend, backend, and shared code.

-   `src/`: Contains the entire React frontend application.
    -   `src/pages/`: Main pages/views of the application.
    -   `src/components/`: Reusable React components, including shadcn/ui components.
    -   `src/lib/`: Utility functions and API client.
-   `worker/`: Contains the Hono backend API running on Cloudflare Workers.
    -   `worker/index.ts`: The entry point for the Cloudflare Worker.
    -   `worker/user-routes.ts`: API route definitions.
    -   `worker/entities.ts`: Data models and logic for interacting with Durable Objects.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend to ensure type safety.

## 💻 Development

-   **Frontend:** All frontend code is located in the `src` directory. Pages are built in `src/pages` and can be linked in `src/main.tsx` where the router is configured.
-   **Backend:** The API is built with Hono. To add or modify API endpoints, edit the `worker/user-routes.ts` file.
-   **Data Models:** Entities that map to Durable Object storage are defined in `worker/entities.ts`.
-   **Shared Types:** To maintain type safety between the client and server, define all shared data structures in `shared/types.ts`.

## ☁️ Deployment

This project is configured for seamless deployment to Cloudflare Pages and Workers.

1.  **Build the application:**
    This command bundles the React frontend and the Worker backend for production.
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    This command deploys your application using Wrangler. It will upload the static assets to Cloudflare Pages and the backend API to Cloudflare Workers.
    ```bash
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]