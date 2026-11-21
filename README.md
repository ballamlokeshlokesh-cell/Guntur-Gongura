# Guntur Gongura – Smart Restaurant Web App

A smart restaurant ordering and management web application built with HTML, Tailwind CSS, JavaScript, Node.js SQLite, and Google Firebase Cloud Firestore & Authentication.

## Features
- **Customer Table Service:** QR code-based table ordering (`#table1`, `#table2`, etc.) and live service call requests.
- **Staff Portal & Firebase Authentication:** Authenticate staff with Email and Password securely stored in Google Firebase Authentication.
- **Persistent Staff Database:** Manage staff accounts (Add, View, Change Password, Delete).
- **Front of House (Reception):** Review incoming orders, attend service requests, and send tickets to the kitchen.
- **Kitchen Display System (Chef):** Live ticket display by table with cooking status updates.
- **Multi-Engine Database Support:**
  - **Firebase Authentication & Cloud Firestore:** Store staff emails and passwords in Firebase Auth, and sync orders and table calls in real-time across all devices.
  - **Node.js SQLite Server Mode (`staff.db`):** Local central database file using native Node.js SQLite.
  - **Browser Standalone Mode:** Persistent browser storage (`localStorage`) with zero configuration required.

## Live Firebase Integration
Firebase is preconfigured with project credentials in `firebase-config.js` (`staff-id-e2b1b`):
1. **Firebase Authentication:** Automatically saves and validates staff emails and passwords in the cloud.
2. **Cloud Firestore:** For live multi-device syncing of food orders and service calls. Make sure your Firestore Security Rules in the Firebase Console allow read/write:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## Default Credentials
- **Staff Email:** `staff@restaurant.com`
- **Password:** `password123`
- **Admin Email:** `admin@restaurant.com`
- **Password:** `admin123`
