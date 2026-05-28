# REST API & WebSocket Documentation

## 1. REST HTTP Endpoints

All REST routes are prefixed with `/api`.

### Tickets Management

#### 1. Get All Tickets
*   **Endpoint:** `GET /api/tickets`
*   **Description:** Fetches all helpdesk tickets ordered by creation date descending, including requester info, assignee info, comments, and audit logs.
*   **Response:** `200 OK` (JSON Array of tickets)

#### 2. Create Ticket
*   **Endpoint:** `POST /api/tickets`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "title": "Masalah Wi-Fi Gedung ICT",
      "description": "Tidak bisa tersambung ke SSID UIN-SUSKA",
      "category": "Jaringan",
      "priority": "Medium",
      "location": "Gedung ICT Lantai 2",
      "requesterNimNip": "11850112345",
      "attachmentBase64": "data:image/png;base64,..." // Optional
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true, "ticketId": "#1001" }
    ```

#### 3. Change Ticket Status
*   **Endpoint:** `PUT /api/tickets/:id/status`
*   **Request Body:**
    ```json
    {
      "status": "In Progress",
      "byNimNip": "1980021512345"
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true }
    ```

#### 4. Assign Ticket
*   **Endpoint:** `PUT /api/tickets/:id/assign`
*   **Request Body:**
    ```json
    {
      "assigneeName": "Technician Name",
      "byNimNip": "1980021512345",
      "notes": "Tolong cek switch di lantai 2" // Optional
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true }
    ```

#### 5. Add Comment
*   **Endpoint:** `POST /api/tickets/:id/comments`
*   **Request Body:**
    ```json
    {
      "message": "Saya sudah berada di lokasi, sedang pengecekan.",
      "authorNimNip": "1980021512345"
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true }
    ```

#### 6. Mark Ticket as Incident
*   **Endpoint:** `PUT /api/tickets/:id/incident`
*   **Request Body:**
    ```json
    {
      "incidentNotes": "Kerusakan switch hub utama gedung ICT lantai 2.",
      "byNimNip": "1980021512345"
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true }
    ```

---

### Staff & User Management

#### 1. Get Support Staff List
*   **Endpoint:** `GET /api/users`
*   **Description:** Fetches all users who are registered with the role of `Teknisi` or `Admin IT`.
*   **Response:** `200 OK` (JSON Array of staff users)

#### 2. Register Support Staff
*   **Endpoint:** `POST /api/users`
*   **Request Body:**
    ```json
    {
      "nimNip": "1991051512345",
      "name": "Budi Santoso",
      "email": "budi.s@uin-suska.ac.id",
      "passwordHash": "hashed_password",
      "role": "Teknisi",
      "specialty": "Jaringan",
      "phone": "081234567890"
    }
    ```
*   **Response:** `200 OK`
    ```json
    { "success": true, "telegramRegCode": "REG-1991051512345" }
    ```

#### 3. Delete Support Staff
*   **Endpoint:** `DELETE /api/users/:id`
*   **Description:** Deletes a support staff by their UUID. Reassigns all their tickets to unassigned (`null`).
*   **Response:** `200 OK`
    ```json
    { "success": true, "message": "User deleted successfully" }
    ```

#### 4. Team Performance Metrics
*   **Endpoint:** `GET /api/performance`
*   **Description:** Aggregates and calculates SLA compliance, average resolution times, resolved ticket counts, and activity logs.
*   **Response:** `200 OK`
    ```json
    {
      "adminPerformance": [...],
      "technicianPerformance": [...],
      "dailyLogs": [...]
    }
    ```

---

## 2. WebSocket Real-Time Broadcasts

Backend WebSocket server runs on the same port as the HTTP server.

### Outgoing Broadcast Events
Sent by the backend server when specific database resources change:

*   **Tickets Update:**
    ```json
    {
      "event": "tickets_updated",
      "type": "create" | "status_change" | "assign" | "comment_add" | "incident",
      "id": "#1001",
      "status": "Open" // Included on status changes
    }
    ```
*   **Users Update:**
    ```json
    {
      "event": "users_updated"
    }
    ```

### Client Handling
Upon receiving these events, clients invoke a silent `fetchTickets(true)` to pull the freshest state from the database without disrupting the user layout.
