import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import QueueEntry from '../models/QueueEntry.js';
import { startOfDay, endOfDay } from '../services/timeUtils.js';

export async function getStats(req, res) {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      waitingPatients,
      completedToday,
      byStatus,
      byDoctor,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: 'Cancelled' },
      }),
      QueueEntry.countDocuments({
        queueDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['Waiting', 'Called'] },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
        status: 'Completed',
      }),
      Appointment.aggregate([
        { $match: { appointmentDate: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        { $match: { appointmentDate: { $gte: todayStart, $lte: todayEnd } } },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $group: {
            _id: '$doctor.fullName',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      waitingPatients,
      completedToday,
      appointmentsByStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      appointmentsByDoctor: byDoctor.map((d) => ({ doctor: d._id, count: d.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
