import Appointment from '../models/Appointment.js';
import QueueEntry from '../models/QueueEntry.js';

export async function appointmentsByStatus(req, res) {
  try {
    const data = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function appointmentsByDoctor(req, res) {
  try {
    const data = await Appointment.aggregate([
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
          doctorId: { $first: '$doctor.doctorId' },
          count: { $sum: 1 },
        },
      },
      { $project: { doctor: '$_id', doctorId: 1, count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function dailyTrends(req, res) {
  try {
    const data = await Appointment.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { date: '$_id', count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function averageWaitingTime(req, res) {
  try {
    const data = await QueueEntry.aggregate([
      {
        $match: {
          consultationStartTime: { $exists: true, $ne: null },
          checkInTime: { $exists: true },
        },
      },
      {
        $project: {
          waitingMinutes: {
            $divide: [
              { $subtract: ['$consultationStartTime', '$checkInTime'] },
              1000 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageWaitingMinutes: { $avg: '$waitingMinutes' },
          sampleSize: { $sum: 1 },
        },
      },
    ]);
    const result = data[0] || { averageWaitingMinutes: 0, sampleSize: 0 };
    res.json({
      averageWaitingMinutes: Math.round(result.averageWaitingMinutes || 0),
      sampleSize: result.sampleSize,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
