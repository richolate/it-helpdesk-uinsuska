# Product Requirement Document (PRD)

## Project Name: IT Helpdesk UIN Suska Riau

### 1. Overview & Objectives
IT Helpdesk UIN Suska Riau is a comprehensive fullstack ticket management system designed to streamline IT support requests from students (Mahasiswa) and lecturers (Dosen) to the IT Administrators and Technicians.

The core objective is to improve resolution response times, ensure transparent status tracking via real-time WebSockets, automate notifications to the support team using a Telegram bot, and maintain a high-quality user experience (handling server cold starts via animated Skeleton Loaders).

---

### 2. User Roles & Persona
The system supports four distinct user roles, split into two main portals:

#### A. User Portal (Mahasiswa & Dosen)
*   **Mahasiswa (Student):** Can file tickets regarding network (Wi-Fi/LAN), academic systems (iRaise), SSO accounts, hardware peripherals, software licensing, and general infrastructure. Can track their active tickets and comment on them.
*   **Dosen (Lecturer):** Has access to the same ticketing portal as students but with lecturer-level credentials. Can file and track tickets.

#### B. Staff Portal (Admin & Technicians)
*   **Admin IT (IT Administrator):** Manages the entire helpdesk system. Assigns incoming tickets to specific technicians, changes ticket statuses, marks recurring problems as system incidents, manages the Knowledge Base (FAQs), registers new support staff, and monitors team performance metrics.
*   **Teknisi (Technician):** Receives assigned tickets. Can resolve tickets directly through the web portal or by sending commands via the Telegram Bot.

---

### 3. Key Feature Scope

#### 1. Landing Page & Role Selector
*   A premium, modern welcome page detailing helpdesk services.
*   Category section showcasing Jaringan, iRaise, Akun, Perangkat, Software, and Infrastruktur.
*   Direct access buttons to login pages depending on user category.

#### 2. Authentication
*   Secure NIP/NIM based login for users and staff.
*   Role-based navigation guarding that redirects unauthorized portal access.

#### 3. Ticket Management Flow
*   **Creation:** User submits a ticket with Title, Category, Priority, Location, Description, and an optional image attachment (base64 encoded).
*   **Assignment:** Admin reviews tickets and assigns them to specialized technicians with optional instructions/notes.
*   **Status Lifecycle:** Tickets move dynamically through statuses: `Open` -> `In Progress` -> `Pending` -> `Resolved` -> `Closed`.
*   **Real-time sync:** Dynamic updates across active sessions using WebSockets.

#### 4. Real-Time Communication & Comments
*   Comments panel on the ticket detail page for chat communication between requesters and assigned staff.
*   Audit Log logging every change made to a ticket (e.g. status changes, assignment, incident logging).

#### 5. Telegram Bot Integration
*   Real-time notifications sent to the Telegram Group when a new ticket is submitted or assigned.
*   Technicians can register their Telegram account (`/daftar <REG-CODE>`) to receive direct alerts.
*   Technicians can mark tickets as resolved by replying `/done <TICKET_ID>` in the Telegram Chat.

#### 6. Knowledge Base (FAQ)
*   User-facing repository of common technical troubleshooting articles.
*   Admin-facing creation, editing, and deletion interface for managing article items.

#### 7. Staff Management & Analytics
*   Add and remove technicians/admins.
*   Track key performance indicators (KPIs) such as SLA compliance (tickets resolved before SLA deadline), average response times, and daily staff activity logs.

---

### 4. Non-Functional Requirements
*   **Real-Time Data Sync:** WebSockets configuration enabling immediate updates without page reloads.
*   **Perceived UX Performance:** Integrated Skeleton Loaders displayed during initial data fetch and route transitions to mask latency, especially for free-tier Render server cold starts.
*   **Responsive Layout:** Smooth layout adjustments across mobile, tablet, and desktop viewports.
*   **Security:** CORS policies restricting backend endpoints to Vercel production domains, password hashing, and inputs size-limit handling.
