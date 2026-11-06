import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { getDayOfWeek, parseTimeToMinutes, timesOverlap, startOfDay, endOfDay } from './timeUtils.js';

const BLOCKING_STATUSES = ['Scheduled', 'Checked In', 'Waiting', 'In Consultation'];

export async function validateAppointmentBooking(data, excludeAppointmentId = null) {
  const { patientId, doctorId, appointmentDate, startTime, endTime } = data;

  const patient = await Patient.findById(patientId);
  if (!patient || !patient.isActive) {
    throw new Error('Patient not found or inactive');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive) {
    throw new Error('Doctor not found or inactive');
  }

  if (parseTimeToMinutes(startTime) >= parseTimeToMinutes(endTime)) {
    throw new Error('End time must be after start time');
  }

  const dayName = getDayOfWeek(appointmentDate);
  const slot = doctor.availability.find((a) => a.dayOfWeek === dayName);
  if (!slot) {
    throw new Error(`Doctor is not available on ${dayName}`);
  }

  const slotStart = parseTimeToMinutes(slot.startTime);
  const slotEnd = parseTimeToMinutes(slot.endTime);
  const apptStart = parseTimeToMinutes(startTime);
  const apptEnd = parseTimeToMinutes(endTime);

  if (apptStart < slotStart || apptEnd > slotEnd) {
    throw new Error('Appointment time is outside doctor working hours');
  }

  const dayStart = startOfDay(appointmentDate);
  const dayEnd = endOfDay(appointmentDate);

  const conflictQuery = {
    doctorId,
    appointmentDate: { $gte: dayStart, $lte: dayEnd },
    status: { $in: BLOCKING_STATUSES },
  };
  if (excludeAppointmentId) {
    conflictQuery._id = { $ne: excludeAppointmentId };
  }

  const existing = await Appointment.find(conflictQuery);
  for (const appt of existing) {
    if (timesOverlap(startTime, endTime, appt.startTime, appt.endTime)) {
      throw new Error('Doctor already has an overlapping appointment at this time');
    }
  }

  return { patient, doctor };
}
