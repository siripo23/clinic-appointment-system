# Clinic Appointment and Patient Queue Management System
### Complete Project Details

---

## 1. Project Overview

This is a full-stack web application built as an academic project for the **NoSQL Database Management System** subject. It demonstrates real-world usage of MongoDB through a practical clinic management workflow — managing patients, doctors, appointments, and a live patient queue.

---

## 2. Project Title

**Clinic Appointment and Patient Queue Management System Using MongoDB**

---

## 3. Objectives

- Manage patients, doctors, and appointments using REST APIs
- Run a per-doctor daily patient queue with safe queue number allocation
- Demonstrate MongoDB CRUD operations, embedded documents, references, aggregation pipelines, indexes, and schema validation
- Support two user roles: Administrator and Receptionist with JWT-based authentication

---

## 4. Technology Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js, Vite, JavaScript, HTML5, CSS3         |
| UI Library | React Router DOM, Axios, Recharts, Lucide React |
| Backend    | Node.js, Express.js, Mongoose                   |
| Auth       | JWT (JSON Web Token), bcryptjs                  |
| Database   | MongoDB (clinic_management)                     |
| Dev Tools  | MongoDB Compass, dotenv                         |

---

## 5. Project Structure

```
clinic-appointment-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          → Sidebar + header shell
│   │   │   ├── ProtectedRoute.jsx  → Auth + role guard
│   │   │   └── StatusBadge.jsx     → Coloured status pill
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       → Login form
│   │   │   ├── DashboardPage.jsx   → Stats + charts
│   │   │   ├── PatientsPage.jsx    → Patient CRUD
│   │   │   ├── DoctorsPage.jsx     → Doctor CRUD
│   │   │   ├── AppointmentsPage.jsx→ Appointment booking
│   │   │   ├── QueuePage.jsx       → Live queue management
│   │   │   └── ReportsPage.jsx     → Analytics charts
│   │   ├── services/
│   │   │   ├── api.js              → Axios instance with JWT
│   │   │   └── AuthContext.jsx     → Auth state (React context)
│   │   ├── App.jsx                 → Route definitions
│   │   ├── main.jsx                → React entry point
│   │   └── index.css               → Global styles
│   ├── index.html
│   ├── vite.config.js              → Vite + /api proxy
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js                   → MongoDB connection
│   ├── models/
│   │   ├── User.js                 → users collection
│   │   ├── Patient.js              → patients collection
│   │   ├── Doctor.js               → doctors collection
│   │   ├── Appointment.js          → appointments collection
│   │   ├── QueueEntry.js           → queue_entries collection
│   │   ├── QueueCounter.js         → atomic queue number counter
│   │   └── IdCounter.js            → atomic ID generator
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── queueController.js
│   │   ├── dashboardController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── queueRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   └── auth.js                 → JWT verify + role check
│   ├── services/
│   │   ├── idService.js            → atomic ID generation
│   │   ├── queueService.js         → queue number allocation
│   │   ├── appointmentValidation.js→ conflict detection
│   │   └── timeUtils.js            → date/time helpers
│   ├── scripts/
│   │   └── seed.js                 → demo data seeder
│   ├── app.js                      → Express app setup
│   ├── server.js                   → Server entry point
│   └── package.json
│
├── database/
│   ├── crud-examples.js            → CRUD demo scripts
│   ├── aggregation-examples.js     → Aggregation pipeline demos
│   └── indexes.js                  → Index creation scripts
│
├── README.md
├── PROJECT_DETAILS.md              → This file
└── .gitignore
```

---

## 6. MongoDB Database Design

**Database name:** `clinic_management`

### Collection 1: users
Stores staff login accounts.

```json
{
  "name": "Dr. Ananya Rao",
  "email": "admin@clinic.com",
  "passwordHash": "$2a$10$...",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

- Unique index on `email`
- Passwords hashed with bcrypt (never stored in plaintext)
- Roles: `admin` or `receptionist`

---

### Collection 2: patients
Stores patient demographics with **embedded** contact and address.

```json
{
  "patientId": "PAT0001",
  "fullName": "Aarav Patel",
  "dateOfBirth": "1990-05-15",
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
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `contact` and `address` are **embedded documents**
- Unique index on `patientId`
- Text index on `fullName` and `contact.phone` for search

---

### Collection 3: doctors
Stores doctor information with **embedded** weekly availability array.

```json
{
  "doctorId": "DOC001",
  "fullName": "Dr. Rajesh Kumar",
  "specialization": "General Physician",
  "contact": {
    "phone": "9876500001",
    "email": "rajesh@cityclinic.in"
  },
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

- `availability` is an **embedded array of sub-documents**
- Unique index on `doctorId`

---

### Collection 4: appointments
Stores appointment bookings using **references** to patients and doctors.

```json
{
  "appointmentId": "APT0001",
  "patientId": ObjectId("..."),
  "doctorId": ObjectId("..."),
  "appointmentDate": "2024-10-26T00:00:00Z",
  "startTime": "09:00",
  "endTime": "09:30",
  "reason": "Routine checkup",
  "status": "Scheduled",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `patientId` and `doctorId` are **ObjectId references** (not embedded)
- `populate()` used to fetch patient/doctor details with appointments
- Indexes on `(doctorId, appointmentDate)`, `(patientId, appointmentDate)`, `(status, appointmentDate)`
- Appointment statuses: `Scheduled`, `Checked In`, `Waiting`, `In Consultation`, `Completed`, `Cancelled`, `No Show`

---

### Collection 5: queue_entries
Manages the live patient queue per doctor per day.

```json
{
  "appointmentId": ObjectId("..."),
  "patientId": ObjectId("..."),
  "doctorId": ObjectId("..."),
  "queueDate": "2024-10-26T00:00:00Z",
  "queueNumber": 3,
  "status": "Waiting",
  "checkInTime": "2024-10-26T09:15:00Z",
  "calledTime": null,
  "consultationStartTime": null,
  "consultationEndTime": null
}
```

- **Unique compound index** on `(doctorId, queueDate, queueNumber)` — prevents duplicate queue numbers
- Queue statuses: `Waiting`, `Called`, `In Consultation`, `Completed`, `No Show`, `Cancelled`

---

### Supporting Collections (implementation detail)

| Collection | Purpose |
|---|---|
| `idcounters` | Atomic sequence for PAT, DOC, APT prefixes |
| `queuecounters` | Atomic queue number per doctor per day |

---

## 7. Collection Relationships

```
USERS ──────────────────────────── (auth only, no direct link)

PATIENTS ──────────────────────────────────────────────────┐
    patientId (ref) ──► APPOINTMENTS ◄── doctorId (ref)    │
                              │                             │
                      appointmentId (ref)             patientId (ref)
                              │                             │
                         QUEUE_ENTRIES ◄─────────────── doctorId (ref)

DOCTORS ────────────────────────────────────────────────────┘
```

**Embedded vs Referenced:**

| Data | Strategy | Reason |
|---|---|---|
| Patient contact & address | Embedded | Small, belongs to one patient, always fetched together |
| Doctor availability | Embedded array | Fixed weekly schedule, always needed with doctor |
| Appointments | Referenced | Many appointments per patient/doctor; avoids unbounded arrays |
| Queue entries | Referenced | Separate lifecycle from appointments; needed for reporting |

---

## 8. MongoDB Concepts Demonstrated

### 1. CRUD Operations
- **Create:** Register patients (`POST /api/patients`), book appointments (`POST /api/appointments`)
- **Read:** List/search patients, doctors, appointments with filters
- **Update:** Edit patient details, reschedule appointments, update queue status
- **Delete:** Soft delete (deactivate) patients and doctors

### 2. Embedded Documents
- Patient `contact` and `address` stored inside the patient document
- Doctor `availability` stored as an array inside the doctor document
- Why: These sub-documents are small, tightly related, and always accessed with the parent

### 3. References + populate()
- `appointments.patientId` → ObjectId reference to `patients`
- `appointments.doctorId` → ObjectId reference to `doctors`
- `Appointment.find().populate('patientId').populate('doctorId')` fetches linked documents in one query
- Why: Appointments are separate documents to avoid unbounded array growth on patient records

### 4. Aggregation Pipelines
- **Appointments by status:** `$group` on `status` field, `$sort` by count
- **Appointments by doctor:** `$lookup` to join doctors, `$group` by doctor name
- **Daily trends:** `$group` by `$dateToString` of `appointmentDate`
- **Average waiting time:** `$match` completed entries, `$project` to calculate minutes, `$group` for average
- Stages used: `$match`, `$group`, `$project`, `$sort`, `$lookup`, `$unwind`

### 5. Indexes
| Index | Collection | Type | Purpose |
|---|---|---|---|
| `email` | users | Unique | Fast login lookup |
| `patientId` | patients | Unique | Prevent duplicate IDs |
| `doctorId` | doctors | Unique | Prevent duplicate IDs |
| `appointmentId` | appointments | Unique | Prevent duplicate IDs |
| `(doctorId, appointmentDate)` | appointments | Compound | Fast doctor schedule lookup |
| `(doctorId, queueDate, queueNumber)` | queue_entries | Unique Compound | Safe queue number allocation |

### 6. Mongoose Validation
- Required fields on all schemas
- Enum validation for `status`, `gender`, `role`, `dayOfWeek`
- Min value 0 on `consultationFee`
- Min value 1 on `queueNumber`
- Custom validator: doctor must have at least one availability slot

---

## 9. User Roles & Permissions

| Feature | Admin | Receptionist |
|---|---|---|
| Dashboard | ✅ | ✅ |
| View patients | ✅ | ✅ |
| Add/edit patients | ✅ | ✅ |
| Deactivate patients | ✅ | ❌ |
| View doctors | ✅ | ✅ |
| Add/edit/deactivate doctors | ✅ | ❌ |
| Book/edit appointments | ✅ | ✅ |
| Cancel appointments | ✅ | ✅ |
| Queue operations | ✅ | ✅ |
| Reports & analytics | ✅ | ❌ |

---

## 10. REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |
| GET | `/api/patients` | Auth | List/search patients |
| GET | `/api/patients/:id` | Auth | Get one patient |
| POST | `/api/patients` | Auth | Register patient |
| PUT | `/api/patients/:id` | Auth | Update patient |
| DELETE | `/api/patients/:id` | Admin | Deactivate patient |
| GET | `/api/doctors` | Auth | List/search doctors |
| GET | `/api/doctors/:id` | Auth | Get one doctor |
| POST | `/api/doctors` | Admin | Add doctor |
| PUT | `/api/doctors/:id` | Admin | Update doctor |
| DELETE | `/api/doctors/:id` | Admin | Deactivate doctor |
| GET | `/api/appointments` | Auth | List appointments (filters: date, doctor, status) |
| GET | `/api/appointments/:id` | Auth | Get one appointment |
| POST | `/api/appointments` | Auth | Book appointment |
| PUT | `/api/appointments/:id` | Auth | Reschedule/edit |
| PATCH | `/api/appointments/:id/cancel` | Auth | Cancel |
| GET | `/api/queue/today` | Auth | Today's full queue |
| GET | `/api/queue/doctor/:doctorId` | Auth | Queue for one doctor |
| POST | `/api/queue/check-in` | Auth | Check in patient |
| POST | `/api/queue/call-next` | Auth | Auto-call next waiting |
| PATCH | `/api/queue/:id/call` | Auth | Call specific patient |
| PATCH | `/api/queue/:id/start-consultation` | Auth | Start consultation |
| PATCH | `/api/queue/:id/complete` | Auth | Complete consultation |
| PATCH | `/api/queue/:id/no-show` | Auth | Mark no-show |
| GET | `/api/dashboard/stats` | Auth | Dashboard statistics |
| GET | `/api/analytics/appointments-by-status` | Admin | Aggregation report |
| GET | `/api/analytics/appointments-by-doctor` | Admin | Aggregation report |
| GET | `/api/analytics/daily-trends` | Admin | Aggregation report |
| GET | `/api/analytics/waiting-time` | Admin | Avg waiting time |

---

## 11. Queue Management Flow

```
Scheduled appointment
        │
        ▼
   [ Check In ]  → queueNumber auto-assigned (atomic $inc)
        │
        ▼
     Waiting  ──────────────────► No Show
        │
        ▼
   [ Call Patient ]
        │
        ▼
      Called
        │
        ▼
   [ Start Consultation ]
        │
        ▼
   In Consultation
        │
        ▼
   [ Complete ]
        │
        ▼
     Completed
```

**Queue number safety:** Uses `QueueCounter.findOneAndUpdate` with `$inc` and `upsert: true`. This is atomic — no two check-ins can get the same number even if they happen simultaneously. The unique compound index `(doctorId, queueDate, queueNumber)` acts as a final safety net.

---

## 12. Appointment Conflict Prevention

Before saving any appointment, the backend:
1. Checks the doctor exists and is active
2. Checks the patient exists and is active
3. Verifies the appointment day matches the doctor's working days
4. Verifies start/end times are within the doctor's working hours
5. Queries all existing non-cancelled appointments for that doctor on that date
6. Checks for time overlap using: `startA < endB AND startB < endA`

---

## 13. Authentication Flow

```
1. User submits email + password
2. Backend finds user by email in users collection
3. bcrypt.compare() verifies password against stored hash
4. JWT signed with { id, email, role, name } payload
5. Frontend stores token in localStorage
6. Every API request sends: Authorization: Bearer <token>
7. authRequired middleware verifies and decodes token
8. requireRoles middleware checks role for protected routes
```

---

## 14. Seed Data

The seed script (`backend/scripts/seed.js`) inserts:

| Data | Count |
|---|---|
| Users (admin + receptionist) | 2 |
| Doctors | 5 |
| Patients | 20 |
| Appointments | 30 (today + yesterday + tomorrow) |
| Queue entries | ~8 (today's check-ins) |

**Safe to re-run** — uses `findOneAndUpdate` with `upsert: true`, clears old demo data first.

---

## 15. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | admin@clinic.com | Admin@123 |
| Receptionist | reception@clinic.com | Reception@123 |

---

## 16. How to Run the Project

### Prerequisites
- Node.js 18+
- MongoDB Community Server running on port 27017

### Step 1 — Backend
```bash
cd backend
npm install
node scripts/seed.js       # populate demo data
npm run dev                # starts on http://localhost:5000
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

### Step 3 — Open browser
Go to: **http://localhost:5173**

---

## 17. View Database in MongoDB Compass

1. Open **MongoDB Compass**
2. Connect using: `mongodb://127.0.0.1:27017`
3. Open database: `clinic_management`
4. Browse collections: `patients`, `doctors`, `appointments`, `queue_entries`, `users`

**Key things to show in Compass during presentation:**
- Patient document → embedded `contact` and `address` sub-documents
- Doctor document → embedded `availability` array
- Appointment document → `patientId` and `doctorId` as ObjectId references
- Queue entry → timestamps (`checkInTime`, `consultationStartTime`)
- Indexes tab on any collection → unique and compound indexes

---

## 18. Common Errors & Solutions

| Error | Solution |
|---|---|
| `MongoServerSelectionError` | Start MongoDB service |
| `401 Unauthorized` | Token expired — log in again |
| `Appointment conflict` | Choose a time within doctor's availability hours |
| `Check-in rejected` | Appointment must be today and status must be Scheduled |
| `Doctor not available on Monday` | Doctor has no availability slot for that day |
| Frontend shows blank page | Check backend is running on port 5000 |

---

## 19. Viva Talking Points

1. **Why MongoDB?** Schema flexibility suits healthcare data where patient records vary. Embedded documents improve read performance for commonly accessed data.

2. **Why embed contact in patient?** Contact details are small, always accessed with the patient, and belong to exactly one patient — ideal for embedding.

3. **Why reference appointments?** A patient can have hundreds of appointments over time. Embedding them would create an unbounded growing array inside the patient document, which is a MongoDB anti-pattern.

4. **How does populate() work?** Mongoose does a second query behind the scenes — it fetches the referenced documents by ObjectId and replaces the ID field with the full document.

5. **How are queue numbers safe?** MongoDB's `findOneAndUpdate` with `$inc` is atomic at the document level. No two operations can increment the counter at the same time, guaranteeing unique numbers.

6. **What is an aggregation pipeline?** A sequence of stages that transform documents — like a pipeline in a factory. Each stage passes its output to the next stage.

7. **Why use indexes?** Without an index, MongoDB scans every document (collection scan). An index lets MongoDB jump directly to matching documents — much faster for large collections.

8. **How is the password stored?** bcryptjs hashes the password with a salt before storing. Even if the database is compromised, the original password cannot be recovered.

---

*Project built for: NoSQL Database Management System — Academic Submission*
