import Appointment from '../models/Appointment.js';
import { nextSequence } from '../services/idService.js';
import { validateAppointmentBooking } from '../services/appointmentValidation.js';
import { startOfDay, endOfDay } from '../services/timeUtils.js';

export async function listAppointments(req, res) {
  try {
    const { date, doctorId, patientId, status, search } = req.query;
    const filter = {};
    if (date) {
      filter.appointmentDate = {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      };
    }
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    let query = Appointment.find(filter)
      .populate('patientId', 'patientId fullName contact')
      .populate('doctorId', 'doctorId fullName specialization')
      .sort({ appointmentDate: -1, startTime: 1 });

    const appointments = await query;
    let result = appointments;
    if (search?.trim()) {
      const q = search.toLowerCase();
      result = appointments.filter(
        (a) =>
          a.appointmentId?.toLowerCase().includes(q) ||
          a.patientId?.fullName?.toLowerCase().includes(q) ||
          a.doctorId?.fullName?.toLowerCase().includes(q)
      );
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAppointment(req, res) {
  try {
    await validateAppointmentBooking(req.body);
    const appointmentId = await nextSequence('appointment', 'APT', 4);
    const appointment = await Appointment.create({ ...req.body, appointmentId });
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'patientId fullName')
      .populate('doctorId', 'doctorId fullName');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateAppointment(req, res) {
  try {
    const existing = await Appointment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Appointment not found' });
    if (['Cancelled', 'Completed'].includes(existing.status)) {
      return res.status(400).json({ message: 'Cannot edit cancelled or completed appointments' });
    }
    const merged = {
      patientId: req.body.patientId ?? existing.patientId,
      doctorId: req.body.doctorId ?? existing.doctorId,
      appointmentDate: req.body.appointmentDate ?? existing.appointmentDate,
      startTime: req.body.startTime ?? existing.startTime,
      endTime: req.body.endTime ?? existing.endTime,
      reason: req.body.reason ?? existing.reason,
      status: req.body.status ?? existing.status,
    };
    await validateAppointmentBooking(merged, existing._id);
    Object.assign(existing, merged);
    await existing.save();
    const populated = await Appointment.findById(existing._id)
      .populate('patientId', 'patientId fullName')
      .populate('doctorId', 'doctorId fullName');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'Completed') {
      return res.status(400).json({ message: 'Completed appointment cannot be cancelled' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
