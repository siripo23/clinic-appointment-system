import Appointment from '../models/Appointment.js';
import QueueEntry from '../models/QueueEntry.js';
import {
  allocateQueueNumber,
  findActiveQueueForAppointment,
} from '../services/queueService.js';
import { startOfDay, endOfDay, isSameCalendarDay } from '../services/timeUtils.js';

async function populateQueue(entry) {
  return QueueEntry.findById(entry._id)
    .populate('patientId', 'patientId fullName contact')
    .populate('doctorId', 'doctorId fullName specialization')
    .populate('appointmentId', 'appointmentId startTime status');
}

export async function getTodayQueue(req, res) {
  try {
    const today = startOfDay(new Date());
    const entries = await QueueEntry.find({
      queueDate: { $gte: today, $lte: endOfDay(today) },
    })
      .populate('patientId', 'patientId fullName')
      .populate('doctorId', 'doctorId fullName')
      .sort({ doctorId: 1, queueNumber: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDoctorQueue(req, res) {
  try {
    const { date } = req.query;
    const queueDate = startOfDay(date || new Date());
    const entries = await QueueEntry.find({
      doctorId: req.params.doctorId,
      queueDate: { $gte: queueDate, $lte: endOfDay(queueDate) },
    })
      .populate('patientId', 'patientId fullName contact')
      .populate('appointmentId', 'appointmentId startTime reason')
      .sort({ queueNumber: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function checkIn(req, res) {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required' });
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!['Scheduled', 'Checked In', 'Waiting'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Appointment cannot be checked in' });
    }
    if (!isSameCalendarDay(appointment.appointmentDate, new Date())) {
      return res.status(400).json({ message: 'Check-in is only allowed on appointment date' });
    }

    const existing = await findActiveQueueForAppointment(appointmentId);
    if (existing) {
      return res.status(409).json({
        message: 'Patient already has an active queue entry for this appointment',
        queueEntry: await populateQueue(existing),
      });
    }

    const queueDate = startOfDay(new Date());
    const queueNumber = await allocateQueueNumber(appointment.doctorId, queueDate);

    let entry;
    try {
      entry = await QueueEntry.create({
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        queueDate,
        queueNumber,
        status: 'Waiting',
        checkInTime: new Date(),
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ message: 'Queue number conflict, please retry check-in' });
      }
      throw e;
    }

    appointment.status = 'Waiting';
    await appointment.save();

    res.status(201).json(await populateQueue(entry));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateQueueStatus(req, res, updates, allowedFrom) {
  try {
    const entry = await QueueEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' });
    if (!allowedFrom.includes(entry.status)) {
      return res.status(400).json({ message: `Cannot transition from status ${entry.status}` });
    }
    Object.assign(entry, updates);
    await entry.save();

    const appointment = await Appointment.findById(entry.appointmentId);
    if (appointment) {
      if (updates.status === 'Called') appointment.status = 'Waiting';
      if (updates.status === 'In Consultation') appointment.status = 'In Consultation';
      if (updates.status === 'Completed') appointment.status = 'Completed';
      if (updates.status === 'No Show') appointment.status = 'No Show';
      await appointment.save();
    }

    res.json(await populateQueue(entry));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function callPatient(req, res) {
  return updateQueueStatus(
    req,
    res,
    { status: 'Called', calledTime: new Date() },
    ['Waiting']
  );
}

export async function startConsultation(req, res) {
  return updateQueueStatus(
    req,
    res,
    { status: 'In Consultation', consultationStartTime: new Date() },
    ['Called', 'Waiting']
  );
}

export async function completeConsultation(req, res) {
  return updateQueueStatus(
    req,
    res,
    { status: 'Completed', consultationEndTime: new Date() },
    ['In Consultation']
  );
}

export async function markNoShow(req, res) {
  return updateQueueStatus(req, res, { status: 'No Show' }, ['Waiting', 'Called']);
}

export async function callNext(req, res) {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: 'doctorId is required' });
    const queueDate = startOfDay(new Date());
    const next = await QueueEntry.findOne({
      doctorId,
      queueDate: { $gte: queueDate, $lte: endOfDay(queueDate) },
      status: 'Waiting',
    }).sort({ queueNumber: 1 });
    if (!next) return res.status(404).json({ message: 'No waiting patients in queue' });
    req.params.id = next._id.toString();
    return callPatient(req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
