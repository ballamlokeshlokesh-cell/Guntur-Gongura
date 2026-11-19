# Guntur Gongura – Smart Restaurant Web App

A smart restaurant ordering and management web application built with HTML, Tailwind CSS, JavaScript, Node.js SQLite, and Google Firebase Cloud Firestore.

## Features
- **Customer Table Service:** QR code-based table ordering (`#table1`, `#table2`, etc.) and live service call requests.
- **Staff Portal & Database:** Authenticate staff with Staff ID and Password.
- **Persistent Staff Database:** Manage staff accounts (Add, View, Change Password, Delete).
- **Front of House (Reception):** Review incoming orders, attend service requests, and send tickets to the kitchen.
- **Kitchen Display System (Chef):** Live ticket display by table with cooking status updates.
- **Multi-Engine Database Support:**
  - **Firebase Cloud Firestore:** Live cloud sync for orders, table calls, and staff across all devices over the internet.
  - **Node.js SQLite Server Mode (`staff.db`):** Local central database file using native Node.js SQLite.
  - **Browser Standalone Mode:** Persistent browser storage (`localStorage`) with zero configuration required.

## Live Firebase Integration
To connect Google Firebase:
1. Open the app and log in as staff (`staff` / `password123`).
2. Go to the **🗄️ Staff Database** tab.
3. Under **"☁️ Google Firebase Cloud Database"**, paste your `firebaseConfig` JSON from the Firebase Console.
4. Click **Save & Connect Cloud**. The app instantly synchronizes all staff, table calls, and food orders in real-time!

## Default Credentials
- **Staff ID:** `staff`
- **Password:** `password123`
- **Admin ID:** `admin`
- **Password:** `admin123`
