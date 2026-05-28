# IT Helpdesk UIN Suska Riau

Welcome to the **IT Helpdesk UIN Suska Riau** repository! This is a modern, fullstack ticket management system designed for students, lecturers, IT administrators, and technicians.

It features **real-time synchronization using WebSockets**, an **integrated Telegram Bot** for notifications and remote ticket resolutions, and **premium Skeleton Loading components** to ensure a high-quality user experience during network delays or server cold starts.

---

## Documentation Registry
For in-depth details, please refer to the following repository documentation:
*   **[PRD (Product Requirement Document)](file:///d:/TELYU/Semester%208/Capstone/it_helpdesk/PRD.md):** Features list, scope, and user roles.
*   **[ARCHITECTURE.md](file:///d:/TELYU/Semester%208/Capstone/it_helpdesk/ARCHITECTURE.md):** High-level component architecture and communication protocols.
*   **[API.md](file:///d:/TELYU/Semester%208/Capstone/it_helpdesk/API.md):** REST HTTP endpoints and WebSocket events.
*   **[DATABASE.md](file:///d:/TELYU/Semester%208/Capstone/it_helpdesk/DATABASE.md):** Database entity relationships and Drizzle schema structures.

---

## Tech Stack Overview
*   **Frontend:** Vue 3 (Composition API + TypeScript), Pinia (State Management), Vue Router, Tailwind CSS + Vanilla CSS, Lucide Icons, Chart.js.
*   **Backend:** Node.js, Express.js (REST API), native WebSockets (`ws` library), Drizzle ORM (PostgreSQL client).
*   **Integrations:** Telegraf for Telegram Bot automation.

---

## Local Development Setup

### Prerequisites
*   Node.js (v18 or higher)
*   npm or pnpm
*   A running PostgreSQL database instance

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables. Create a `.env` file based on `.env.example`:
    ```ini
    DATABASE_URL=postgresql://user:password@localhost:5432/it_helpdesk
    PORT=3000
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    TELEGRAM_GROUP_ID=your_telegram_group_id
    FRONTEND_URL=http://localhost:5173
    ```
4.  Generate and apply database migrations using Drizzle Kit:
    ```bash
    npm run db:generate
    npm run db:push
    ```
5.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000` and launch both the REST API, WebSocket server, and the Telegram Bot loop.

### 2. Frontend Setup

1.  Navigate back to the workspace root directory:
    ```bash
    cd ..
    ```
2.  Install root dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    The frontend client will spin up on `http://localhost:5173`. Open this URL in your browser to interact with the application.

---

## Deployments Guide
*   **Frontend Deployment:** Configured for Vercel. Connects dynamically to backend APIs using `VITE_API_URL` and `VITE_WS_URL`.
*   **Backend Deployment:** Configured for Render Web Services. Supports CORS policies, dynamic port binding, and WebSocket connection state persistence.
