# Hospital Information System (HIS) — MERN

A full-stack Hospital Information System based on the requirements in the supplied project presentation.

## Included modules
- Dashboard
- Patient registration and records
- Doctor management
- Appointment scheduling
- Electronic Medical Records (EMR)
- Prescriptions
- Pharmacy inventory and stock alerts
- Laboratory tests and reports
- Ward/bed availability and admissions
- Billing and payment tracking
- Staff workload view
- Role-based authentication foundation
- MongoDB/Mongoose models and REST APIs

## Tech stack
React + Vite, Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs.

## Run
1. Install Node.js 18+ and MongoDB.
2. Copy `server/.env.example` to `server/.env`.
3. In `server`: `npm install` then `npm run seed` then `npm run dev`.
4. In `client`: `npm install` then `npm run dev`.
5. Open the Vite URL shown in the terminal.

Default seeded admin: `admin@his.local` / `Admin@123`

> This is an academic/project implementation. Do not use it for real patient care or production healthcare data without appropriate security, compliance, audit, backup, and clinical validation.
