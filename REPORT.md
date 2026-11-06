# Clinic Appointment and Patient Queue Management System Using MongoDB

### Project Report
### Subject: NoSQL Database Management System

---

| | |
|---|---|
| **Project Title** | Clinic Appointment and Patient Queue Management System |
| **Database Used** | MongoDB (NoSQL) |
| **Subject** | NoSQL Database Management System |

---

## TABLE OF CONTENTS

1. Introduction
2. Objectives
3. System Requirements
4. Implementation
5. Result
6. Conclusion

---

## 1. INTRODUCTION

### 1.1 Overview

In today's fast-paced healthcare environment, managing patient appointments and clinic queues manually leads to long waiting times, scheduling conflicts, and poor patient experience. A digital system that automates these processes is essential for any modern clinic.

This project presents a **Clinic Appointment and Patient Queue Management System** — a full-stack web application that allows clinic staff to register patients, schedule appointments, manage doctor availability, and run a real-time patient queue. The system is built using **MongoDB** as the primary database, demonstrating the practical application of NoSQL concepts in a real-world scenario.

### 1.2 Problem Statement

Traditional clinic management using paper records or basic spreadsheets suffers from:

- Appointment double-booking and scheduling conflicts
- No real-time visibility into patient waiting status
- Difficulty searching and retrieving patient records quickly
- No role-based access control for different staff members
- Inability to generate reports and analytics from patient data

### 1.3 Proposed Solution

A web-based clinic management system that:

- Stores all clinic data in a MongoDB NoSQL database
- Provides a clean, responsive interface for clinic staff
- Enforces role-based access (Administrator and Receptionist)
- Manages appointments with automatic conflict detection
- Runs a live per-doctor patient queue with auto-assigned queue numbers
- Generates analytics reports using MongoDB aggregation pipelines

### 1.4 Why MongoDB (NoSQL)?

MongoDB was chosen over a traditional relational database for the following reasons:

- **Flexible schema:** Patient records can have varying fields without altering table structures
- **Embedded documents:** Patient contact details and doctor availability can be stored within the same document, reducing the need for joins
- **Scalability:** MongoDB scales horizontally, suitable for growing clinic data
- **JSON-like documents:** Natural mapping to JavaScript objects used throughout the application
- **Rich query language:** Supports powerful aggregation pipelines for reporting
- **Developer productivity:** Mongoose ODM provides schema validation and easy data modeling

---

## 2. OBJECTIVES

The primary objectives of this project are:

### 2.1 Academic Objectives

- To demonstrate the practical use of a **NoSQL database (MongoDB)** in a real-world application
- To implement and explain the six core MongoDB concepts:
  1. CRUD Operations
  2. Embedded Documents
  3. Document References and `populate()`
  4. Aggregation Pipelines
  5. Indexes
  6. Schema Validation

### 2.2 Functional Objectives

- **Patient Management:** Register, search, edit, and deactivate patient records
- **Doctor Management:** Add doctors with specializations, consultation fees, and weekly availability
- **Appointment Booking:** Book appointments with automatic validation against doctor availability and conflict detection
- **Queue Management:** Check in patients, assign queue numbers atomically, track real-time consultation status
- **Dashboard:** Display live statistics — total patients, doctors, today's appointments, waiting count
- **Reports:** Generate analytics using MongoDB aggregation pipelines

### 2.3 Technical Objectives

- Build a complete **REST API** backend using Node.js and Express.js
- Implement **JWT-based authentication** with role-based authorization
- Demonstrate **embedded documents** for patient contact/address and doctor availability
- Demonstrate **document references** with Mongoose `populate()` for appointments
- Use **atomic database operations** (`$inc` with `findOneAndUpdate`) for safe queue number allocation
- Create **compound unique indexes** to prevent data integrity issues
- Write **aggregation pipeline** queries for reporting

---

## 3. SYSTEM REQUIREMENTS

### 3.1 Hardware Requirements

| Component | Minimum Requirement |
|---|---|
| Processor | Intel Core i3 or equivalent |
| RAM | 4 GB |
| Storage | 10 GB free disk space |
| Network | Internet connection (for initial setup) |
| Display | 1280 × 720 resolution or higher |

### 3.2 Software Requirements

| Software | Version | Purpose |
|---|---|---|
| Node.js | 18 or higher | Backend runtime |
| MongoDB Community Server | 6.0 or higher | Database server |
| MongoDB Compass | Latest | Database GUI viewer |
| Web Browser | Chrome / Firefox / Edge | Frontend access |
| Code Editor | VS Code (recommended) | Development |

### 3.3 Technology Stack

**Frontend:**
- React.js 18 — UI component library
- Vite 5 — Fast build tool and dev server
- React Router DOM 6 — Client-side routing
- Axios — HTTP client for API calls
- Recharts — Chart library for dashboard and reports
- Lucide React — Icon library
- CSS3 — Custom responsive styling

**Backend:**
- Node.js — JavaScript runtime
- Express.js 4 — Web framework for REST APIs
- Mongoose 8 — MongoDB ODM (Object Document Mapper)
- bcryptjs — Password hashing
- jsonwebtoken (JWT) — Authentication tokens
- dotenv — Environment variable management
- cors — Cross-origin resource sharing

**Database:**
- MongoDB — NoSQL document database
- Database name: `clinic_management`
- Collections: `users`, `patients`, `doctors`, `appointments`, `queue_entries`

### 3.4 NPM Dependencies

**Backend (`backend/package.json`):**
```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.21.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.7.0"
}
```

**Frontend (`frontend/package.json`):**
```json
{
  "axios": "^1.7.7",
  "lucide-react": "^0.454.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.27.0",
  "recharts": "^2.13.0"
}
```

### 3.5 Environment Configuration

The backend uses a `.env` file for configuration:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clinic_management
JWT_SECRET=clinic_dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=8h
```

---

## 4. IMPLEMENTATION

### 4.1 System Architecture

```
┌─────────────────────┐        HTTP/REST        ┌──────────────────────┐
│   React Frontend    │ ──── Axios + JWT ──────► │  Express.js Backend  │
│   (Port 5173)       │ ◄─── JSON Response ───── │   (Port 5000)        │
└─────────────────────┘                          └──────────┬───────────┘
                                                            │ Mongoose ODM
                                                            ▼
                                                 ┌──────────────────────┐
                                                 │      MongoDB         │
                                                 │  clinic_management   │
                                                 └──────────────────────┘
```

The browser never communicates with MongoDB directly. All data flows through the Express REST API, which uses Mongoose to interact with MongoDB.

### 4.2 Database Design

#### Collections and Schema

**Collection 1 — users**

Stores staff login credentials. Passwords are hashed using bcrypt before storage.

```json
{
  "_id": ObjectId,
  "name": "Dr. Ananya Rao",
  "email": "admin@clinic.com",
  "passwordHash": "$2a$10$...",
  "role": "admin",
  "isActive": true,
  "createdAt": ISODate
}
```

**Collection 2 — patients**

Stores patient demographics. `contact` and `address` are **embedded sub-documents**.

```json
{
  "_id": ObjectId,
  "patientId": "PAT0001",
  "fullName": "Aarav Patel",
  "dateOfBirth": ISODate,
  "gender": "Male",
  "contact": {
    "phone": "9876510000",
    "email": "patient1@example.in"
  },
  "address": {
    "street": "10 MG Road",
    "city": "Mysuru",
    "state": "Karnataka",
    "pincode": "570001"
  },
  "isActive": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Collection 3 — doctors**

Stores doctor information. `availability` is an **embedded array of sub-documents**.

```json
{
  "_id": ObjectId,
  "doctorId": "DOC001",
  "fullName": "Dr. Rajesh Kumar",
  "specialization": "General Physician",
  "contact": { "phone": "9876500001", "email": "rajesh@cityclinic.in" },
  "consultationFee": 500,
  "appointmentDurationMinutes": 30,
  "availability": [
    { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "13:00" },
    { "dayOfWeek": "Wednesday", "startTime": "09:00", "endTime": "13:00" },
    { "dayOfWeek": "Friday", "startTime": "09:00", "endTime": "13:00" }
  ],
  "isActive": true
}
```

**Collection 4 — appointments**

Uses **ObjectId references** to link patients and doctors.

```json
{
  "_id": ObjectId,
  "appointmentId": "APT0001",
  "patientId": ObjectId("..."),
  "doctorId": ObjectId("..."),
  "appointmentDate": ISODate,
  "startTime": "09:00",
  "endTime": "09:30",
  "reason": "Routine checkup",
  "status": "Scheduled",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Collection 5 — queue_entries**

Tracks real-time patient queue with timestamps.

```json
{
  "_id": ObjectId,
  "appointmentId": ObjectId("..."),
  "patientId": ObjectId("..."),
  "doctorId": ObjectId("..."),
  "queueDate": ISODate,
  "queueNumber": 3,
  "status": "Waiting",
  "checkInTime": ISODate,
  "calledTime": null,
  "consultationStartTime": null,
  "consultationEndTime": null
}
```

### 4.3 MongoDB Concepts Implemented

#### A. CRUD Operations

| Operation | Example |
|---|---|
| Create | `Patient.create({ patientId, fullName, ... })` |
| Read | `Patient.find({ isActive: true })` |
| Update | `Appointment.findByIdAndUpdate(id, { status: 'Cancelled' })` |
| Delete (soft) | `Patient.findByIdAndUpdate(id, { isActive: false })` |

#### B. Embedded Documents

Patient contact and address are embedded because:
- They are small and always accessed with the patient
- They belong to exactly one patient
- No need to query them independently

```javascript
// Mongoose schema with embedded sub-documents
const patientSchema = new Schema({
  contact: {
    phone: { type: String, required: true },
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  }
});
```

#### C. References and populate()

Appointments store ObjectId references to avoid unbounded arrays:

```javascript
// Storing references
const appointmentSchema = new Schema({
  patientId: { type: ObjectId, ref: 'Patient', required: true },
  doctorId:  { type: ObjectId, ref: 'Doctor',  required: true }
});

// Fetching with populate() — Mongoose does two queries internally
const appointments = await Appointment
  .find(filter)
  .populate('patientId', 'fullName patientId')
  .populate('doctorId', 'fullName specialization');
```

#### D. Aggregation Pipelines

Four aggregation pipelines are implemented for the Reports page:

**1. Appointments by Status:**
```javascript
Appointment.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $project: { status: '$_id', count: 1, _id: 0 } },
  { $sort: { count: -1 } }
])
```

**2. Appointments by Doctor (with $lookup join):**
```javascript
Appointment.aggregate([
  { $lookup: { from: 'doctors', localField: 'doctorId',
               foreignField: '_id', as: 'doctor' } },
  { $unwind: '$doctor' },
  { $group: { _id: '$doctor.fullName', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

**3. Daily Appointment Trends:**
```javascript
Appointment.aggregate([
  { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
      count: { $sum: 1 }
  }},
  { $sort: { _id: 1 } }
])
```

**4. Average Patient Waiting Time:**
```javascript
QueueEntry.aggregate([
  { $match: { consultationStartTime: { $exists: true } } },
  { $project: {
      waitingMinutes: {
        $divide: [{ $subtract: ['$consultationStartTime', '$checkInTime'] }, 60000]
      }
  }},
  { $group: { _id: null, averageWaitingMinutes: { $avg: '$waitingMinutes' } } }
])
```

#### E. Indexes

```javascript
// Unique index — users
userSchema.index({ email: 1 }, { unique: true });

// Unique index — patients
patientSchema.index({ patientId: 1 }, { unique: true });

// Compound index — appointments (fast doctor schedule lookup)
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

// Unique compound index — queue entries (prevents duplicate queue numbers)
queueEntrySchema.index(
  { doctorId: 1, queueDate: 1, queueNumber: 1 },
  { unique: true }
);
```

#### F. Schema Validation

```javascript
// Enum validation
status: { type: String, enum: ['Scheduled','Checked In','Waiting',
          'In Consultation','Completed','Cancelled','No Show'] }

// Min value validation
consultationFee: { type: Number, min: 0 }

// Required field validation
fullName: { type: String, required: true, trim: true }

// Custom array validation
availability: {
  validate: [(v) => v.length > 0, 'At least one availability slot required']
}
```

### 4.4 Queue Number Allocation (Atomic Operation)

Queue numbers are generated atomically using `$inc` to prevent race conditions:

```javascript
// Safe atomic increment — no two check-ins can get the same number
const counter = await QueueCounter.findOneAndUpdate(
  { doctorId, queueDate },
  { $inc: { seq: 1 } },
  { upsert: true, new: true }
);
return counter.seq; // unique queue number
```

This is safer than counting existing documents and adding 1, which can produce duplicates under concurrent requests.

### 4.5 Authentication Implementation

```
1. POST /api/auth/login  →  email + password
2. Backend: bcrypt.compare(password, passwordHash)
3. If match: jwt.sign({ id, email, role, name }, JWT_SECRET)
4. Frontend stores token in localStorage
5. Every request: Authorization: Bearer <token>
6. authRequired middleware: jwt.verify(token, JWT_SECRET)
7. requireRoles middleware: checks req.user.role
```

### 4.6 Appointment Conflict Detection

Before saving any appointment, the backend validates:
1. Patient and doctor both exist and are active
2. Appointment day matches doctor's working days
3. Start and end times are within doctor's working hours
4. No existing appointment overlaps for that doctor at that time

### 4.7 Frontend Pages

| Page | Description |
|---|---|
| Login | Email/password login with JWT |
| Dashboard | Summary stats cards + pie and bar charts |
| Patients | Table with search, add, edit, deactivate |
| Doctors | Table with search, add, edit, availability management |
| Appointments | Table with filters (date, doctor, status), book, reschedule, cancel |
| Queue | Check-in panel, live queue table, call/start/complete/no-show actions |
| Reports | Bar and line charts from aggregation pipeline data |

### 4.8 Seed Data

A seed script (`backend/scripts/seed.js`) populates:

| Data | Count |
|---|---|
| Users | 2 (1 admin, 1 receptionist) |
| Doctors | 5 (different specializations) |
| Patients | 20 (fictional Indian names) |
| Appointments | 30 (various statuses) |
| Queue entries | ~8 (today's check-ins) |

---

## 5. RESULT

### 5.1 Working Features

All planned features were successfully implemented and tested:

| Module | Feature | Status |
|---|---|---|
| Authentication | Login with email/password | ✅ Working |
| Authentication | JWT token generation and validation | ✅ Working |
| Authentication | Role-based access (Admin/Receptionist) | ✅ Working |
| Patients | Register new patient | ✅ Working |
| Patients | Search by name, ID, phone | ✅ Working |
| Patients | Edit patient details | ✅ Working |
| Patients | Soft deactivate patient | ✅ Working |
| Doctors | Add doctor with availability | ✅ Working |
| Doctors | Edit doctor information | ✅ Working |
| Doctors | Deactivate doctor | ✅ Working |
| Appointments | Book appointment with conflict check | ✅ Working |
| Appointments | Filter by date, doctor, status | ✅ Working |
| Appointments | Reschedule appointment | ✅ Working |
| Appointments | Cancel appointment | ✅ Working |
| Queue | Check in patient (auto queue number) | ✅ Working |
| Queue | Call next patient | ✅ Working |
| Queue | Start and complete consultation | ✅ Working |
| Queue | Mark no-show | ✅ Working |
| Queue | Waiting time calculation | ✅ Working |
| Dashboard | Live statistics from MongoDB | ✅ Working |
| Dashboard | Appointments by status (pie chart) | ✅ Working |
| Dashboard | Appointments by doctor (bar chart) | ✅ Working |
| Reports | Appointments by status | ✅ Working |
| Reports | Appointments by doctor | ✅ Working |
| Reports | Daily appointment trends | ✅ Working |
| Reports | Average waiting time | ✅ Working |

### 5.2 API Test Results

All REST API endpoints were tested and returned correct responses:

| Endpoint | HTTP Status | Result |
|---|---|---|
| POST /api/auth/login | 200 | JWT token returned |
| GET /api/patients | 200 | 20 patients returned |
| GET /api/doctors | 200 | 5 doctors returned |
| GET /api/appointments | 200 | 30 appointments returned |
| GET /api/queue/today | 200 | Queue entries returned |
| GET /api/dashboard/stats | 200 | All stats returned |
| GET /api/analytics/appointments-by-status | 200 | 7 status groups |
| GET /api/analytics/appointments-by-doctor | 200 | 5 doctor groups |
| GET /api/analytics/daily-trends | 200 | 3 date entries |
| GET /api/analytics/waiting-time | 200 | Avg: 10 min |

### 5.3 Database Verification (MongoDB Compass)

After running the seed script, the following documents were confirmed in MongoDB Compass:

| Collection | Documents |
|---|---|
| users | 2 |
| patients | 20 |
| doctors | 5 |
| appointments | 30 |
| queue_entries | 8 |
| idcounters | 3 |
| queuecounters | 5 |

### 5.4 MongoDB Concepts Demonstrated

| Concept | Demonstrated In | Verified |
|---|---|---|
| CRUD Operations | Patient, Doctor, Appointment APIs | ✅ |
| Embedded Documents | Patient contact/address, Doctor availability | ✅ |
| References + populate() | Appointment ↔ Patient, Doctor | ✅ |
| Aggregation Pipelines | Reports page (4 pipelines) | ✅ |
| Indexes | Unique IDs, compound queue index | ✅ |
| Schema Validation | Mongoose enums, required, min | ✅ |

### 5.5 Application Screenshots Summary

- **Login Page** — Clean login form with clinic branding
- **Dashboard** — 5 stat cards, pie chart (by status), bar chart (by doctor)
- **Patients Page** — Searchable table, modal form for add/edit
- **Doctors Page** — Doctor list with embedded availability management
- **Appointments Page** — Filters bar, appointment table with status badges
- **Queue Page** — Check-in panel, live queue table with action buttons
- **Reports Page** — Three charts generated from aggregation pipelines

---

## 6. CONCLUSION

### 6.1 Summary

This project successfully demonstrates the development of a complete, functional **Clinic Appointment and Patient Queue Management System** using MongoDB as the NoSQL database. The application covers the entire clinic workflow — from patient registration to appointment booking to real-time queue management and reporting.

All six core MongoDB concepts required for the NoSQL Database Management System subject were implemented and demonstrated:

1. **CRUD Operations** — through patient, doctor, and appointment management
2. **Embedded Documents** — patient contact/address and doctor availability stored within parent documents
3. **References and populate()** — appointments linked to patients and doctors via ObjectId references
4. **Aggregation Pipelines** — four pipelines generating meaningful reports and analytics
5. **Indexes** — unique indexes, compound indexes, and a unique compound index for queue safety
6. **Schema Validation** — Mongoose validators ensuring data integrity throughout

### 6.2 Key Learnings

- MongoDB's document model is highly flexible and maps naturally to real-world objects like patient records
- Choosing between embedding and referencing requires careful consideration of access patterns and data growth
- Aggregation pipelines are powerful for transforming and summarizing data without a separate reporting database
- Atomic operations (`$inc` with `findOneAndUpdate`) are essential for concurrent data safety, such as queue number allocation
- JWT authentication with role-based authorization provides a practical security model for multi-user systems

### 6.3 Advantages of Using MongoDB for This Project

- **No rigid schema:** Adding new patient fields requires no migration scripts
- **Embedded documents:** Patient contact lookup requires reading only one document, not a join
- **Aggregation framework:** Built-in analytics capability without a separate reporting tool
- **Mongoose ODM:** Schema validation at the application layer catches errors before they reach the database
- **Scalability:** MongoDB can handle clinic data growth without architectural changes

### 6.4 Limitations and Future Scope

**Current Limitations:**
- Single clinic (no multi-branch support)
- No SMS or email appointment reminders
- No payment or billing module
- Reports cover only basic analytics

**Future Enhancements:**
- Add SMS/email notifications for appointment reminders
- Implement billing and invoice generation
- Add prescription and medical records management
- Support multiple clinic branches with tenant isolation
- Add appointment booking via patient-facing mobile app
- Introduce MongoDB Atlas for cloud-hosted database
- Add real-time queue display board using WebSockets

### 6.5 Closing Statement

This project demonstrates that MongoDB is a practical and effective choice for building healthcare management systems. Its flexible document model, powerful aggregation framework, and strong indexing capabilities make it well-suited for data that is hierarchical, varied, and read-heavy. The system built in this project is functional, beginner-friendly, and covers all the NoSQL concepts required for academic demonstration and viva examination.

---

*End of Report*

---

**Demo Credentials:**

| Role | Email | Password |
|---|---|---|
| Administrator | admin@clinic.com | Admin@123 |
| Receptionist | reception@clinic.com | Reception@123 |

**Run the project:**
- Backend: `cd backend && npm run dev` → http://localhost:5000
- Frontend: `cd frontend && npm run dev` → http://localhost:5173
