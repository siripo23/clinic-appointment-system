import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import QueueEntry from '../models/QueueEntry.js';
import IdCounter from '../models/IdCounter.js';
import QueueCounter from '../models/QueueCounter.js';
import { startOfDay } from '../services/timeUtils.js';

dotenv.config();

const SEED_MARKER_EMAIL = 'seed@clinic.local';

async function clearSeedData() {
  await QueueEntry.deleteMany({});
  await Appointment.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});
  await User.deleteMany({ email: { $ne: SEED_MARKER_EMAIL } });
  await IdCounter.deleteMany({});
  await QueueCounter.deleteMany({});
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const receptionHash = await bcrypt.hash('Reception@123', 10);

  await User.findOneAndUpdate(
    { email: 'admin@clinic.com' },
    {
      name: 'Dr. Ananya Rao',
      email: 'admin@clinic.com',
      passwordHash,
      role: 'admin',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'reception@clinic.com' },
    {
      name: 'Priya Sharma',
      email: 'reception@clinic.com',
      passwordHash: receptionHash,
      role: 'receptionist',
      isActive: true,
    },
    { upsert: true, new: true }
  );
}

const doctorData = [
  {
    doctorId: 'DOC001',
    fullName: 'Dr. Rajesh Kumar',
    specialization: 'General Physician',
    contact: { phone: '9876500001', email: 'rajesh@cityclinic.in' },
    consultationFee: 500,
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '13:00' },
    ],
  },
  {
    doctorId: 'DOC002',
    fullName: 'Dr. Meera Iyer',
    specialization: 'Pediatrics',
    contact: { phone: '9876500002', email: 'meera@cityclinic.in' },
    consultationFee: 600,
    availability: [
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '12:00' },
    ],
  },
  {
    doctorId: 'DOC003',
    fullName: 'Dr. Arjun Nair',
    specialization: 'Orthopedics',
    contact: { phone: '9876500003', email: 'arjun@cityclinic.in' },
    consultationFee: 800,
    availability: [
      { dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    doctorId: 'DOC004',
    fullName: 'Dr. Kavitha Reddy',
    specialization: 'Dermatology',
    contact: { phone: '9876500004', email: 'kavitha@cityclinic.in' },
    consultationFee: 700,
    availability: [
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 'Friday', startTime: '14:00', endTime: '17:00' },
    ],
  },
  {
    doctorId: 'DOC005',
    fullName: 'Dr. Suresh Menon',
    specialization: 'Cardiology',
    contact: { phone: '9876500005', email: 'suresh@cityclinic.in' },
    consultationFee: 900,
    availability: [
      { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '13:00' },
    ],
  },
];

const patientNames = [
  'Aarav Patel', 'Diya Singh', 'Vihaan Gupta', 'Ananya Desai', 'Ishaan Joshi',
  'Saanvi Kulkarni', 'Kabir Shah', 'Myra Rao', 'Advik Mehta', 'Kiara Nambiar',
  'Rohan Verma', 'Tara Pillai', 'Arnav Bhat', 'Nisha Hegde', 'Yash Malhotra',
  'Pooja Srinivas', 'Karan Choudhury', 'Lakshmi Gowda', 'Dev Prasad', 'Ritu Agarwal',
];

async function seedDoctors() {
  for (const d of doctorData) {
    await Doctor.findOneAndUpdate({ doctorId: d.doctorId }, d, { upsert: true, new: true });
  }
  await IdCounter.findOneAndUpdate({ key: 'doctor' }, { seq: 5 }, { upsert: true });
}

async function seedPatients() {
  const patients = [];
  for (let i = 0; i < patientNames.length; i++) {
    const patientId = `PAT${String(i + 1).padStart(4, '0')}`;
    const doc = {
      patientId,
      fullName: patientNames[i],
      dateOfBirth: new Date(1980 + (i % 25), i % 12, (i % 28) + 1),
      gender: i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Other',
      contact: {
        phone: `9876510${String(i).padStart(3, '0')}`,
        email: `patient${i + 1}@example.in`,
      },
      address: {
        street: `${10 + i} MG Road`,
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570001',
      },
      isActive: true,
    };
    patients.push(await Patient.findOneAndUpdate({ patientId }, doc, { upsert: true, new: true }));
  }
  await IdCounter.findOneAndUpdate({ key: 'patient' }, { seq: 20 }, { upsert: true });
  return patients;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function seedAppointments(patients, doctors) {
  const statuses = [
    'Scheduled', 'Scheduled', 'Checked In', 'Waiting', 'In Consultation',
    'Completed', 'Completed', 'Cancelled', 'No Show', 'Scheduled',
  ];
  const today = startOfDay(new Date());
  const appointments = [];

  for (let i = 0; i < 30; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const dayOffset = i < 10 ? 0 : i < 20 ? -1 : 1;
    const appointmentDate = addDays(today, dayOffset);
    const hour = 9 + (i % 4);
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour).padStart(2, '0')}:30`;
    const appointmentId = `APT${String(i + 1).padStart(4, '0')}`;

    const appt = await Appointment.findOneAndUpdate(
      { appointmentId },
      {
        appointmentId,
        patientId: patient._id,
        doctorId: doctor._id,
        appointmentDate,
        startTime,
        endTime,
        reason: ['Routine checkup', 'Follow-up', 'Fever', 'Joint pain', 'Skin rash'][i % 5],
        status: statuses[i % statuses.length],
      },
      { upsert: true, new: true }
    );
    appointments.push(appt);
  }
  await IdCounter.findOneAndUpdate({ key: 'appointment' }, { seq: 30 }, { upsert: true });
  return appointments;
}

async function seedQueue(appointments) {
  const today = startOfDay(new Date());
  const todayAppts = appointments.filter(
    (a) => startOfDay(a.appointmentDate).getTime() === today.getTime()
  );

  const perDoctorSeq = new Map();
  let created = 0;
  for (const appt of todayAppts) {
    if (created >= 15) break;
    if (['Cancelled', 'No Show'].includes(appt.status)) continue;
    created += 1;
    const docKey = appt.doctorId.toString();
    const nextNum = (perDoctorSeq.get(docKey) || 0) + 1;
    perDoctorSeq.set(docKey, nextNum);
    const count = nextNum;
    const checkIn = new Date();
    checkIn.setHours(9, count * 5, 0, 0);

    const status =
      appt.status === 'Completed'
        ? 'Completed'
        : appt.status === 'In Consultation'
          ? 'In Consultation'
          : appt.status === 'Waiting'
            ? 'Waiting'
            : 'Waiting';

    await QueueEntry.findOneAndUpdate(
      { appointmentId: appt._id },
      {
        appointmentId: appt._id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        queueDate: today,
        queueNumber: count,
        status,
        checkInTime: checkIn,
        calledTime: status !== 'Waiting' ? new Date(checkIn.getTime() + 5 * 60000) : undefined,
        consultationStartTime:
          status === 'In Consultation' || status === 'Completed'
            ? new Date(checkIn.getTime() + 10 * 60000)
            : undefined,
        consultationEndTime:
          status === 'Completed' ? new Date(checkIn.getTime() + 25 * 60000) : undefined,
      },
      { upsert: true, new: true }
    );

    await QueueCounter.findOneAndUpdate(
      { doctorId: appt.doctorId, queueDate: today },
      { $max: { seq: count } },
      { upsert: true }
    );
  }
  console.log(`Queue entries seeded: ${created}`);
}

async function run() {
  await connectDB();
  console.log('Clearing previous demo data (users preserved except re-seeded accounts)...');
  await clearSeedData();
  await seedUsers();
  await seedDoctors();
  const doctors = await Doctor.find().sort({ doctorId: 1 });
  const patients = await seedPatients();
  const appointments = await seedAppointments(patients, doctors);
  await seedQueue(appointments);

  console.log('\nSeed completed successfully.');
  console.log('Demo credentials:');
  console.log('  Admin:       admin@clinic.com / Admin@123');
  console.log('  Receptionist: reception@clinic.com / Reception@123');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
