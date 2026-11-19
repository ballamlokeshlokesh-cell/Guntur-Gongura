# Guntur Gongura – Smart Restaurant Web App

A smart restaurant ordering and management web application built with HTML, Tailwind CSS, JavaScript, and Node.js with SQLite.

## Features
- **Customer Table Service:** QR code-based table ordering and live service call requests.
- **Staff Portal & Database:** Authenticate staff with Staff ID and Password.
- **Persistent Staff Database:** Manage staff accounts (Add, View, Change Password, Delete) stored persistently in the database.
- **Front of House (Reception):** Review incoming orders, attend service requests, and send tickets to the kitchen.
- **Kitchen Display System (Chef):** Live ticket display by table with cooking status updates.
- **Dual Mode Database:**
  - **Standalone Mode:** Works instantly in any browser with persistent client-side storage (`localStorage`).
  - **Central Server Mode:** Node.js native SQLite database (`staff.db`) for multi-device networking.

## Running Locally

### Direct Browser Mode
Simply open `index.html` in your web browser.

### Node.js SQLite Server Mode
Run:
```bash
node server.js
```
Then visit `http://localhost:3000` in your browser.

## Default Credentials
- **Staff ID:** `staff`
- **Password:** `password123`
- **Admin ID:** `admin`
- **Password:** `admin123`
