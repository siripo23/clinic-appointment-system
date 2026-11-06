// 1) Count appointments by status — groups all appointments by status field
const byStatus = db.appointments.aggregate([
  { $group: { _id: '$status', total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);
printjson(byStatus.toArray());

// 2) Appointments per doctor — join doctors collection then group
const byDoctor = db.appointments.aggregate([
  {
    $lookup: {
      from: 'doctors',
      localField: 'doctorId',
      foreignField: '_id',
      as: 'doctor',
    },
  },
  { $unwind: '$doctor' },
  { $group: { _id: '$doctor.fullName', total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);
printjson(byDoctor.toArray());

// 3) Daily appointment counts — format date string and group
const daily = db.appointments.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
      total: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);
printjson(daily.toArray());

// 4) Average waiting time (minutes) from check-in to consultation start
const waiting = db.queue_entries.aggregate([
  {
    $match: {
      consultationStartTime: { $exists: true },
      checkInTime: { $exists: true },
    },
  },
  {
    $project: {
      waitMin: {
        $divide: [{ $subtract: ['$consultationStartTime', '$checkInTime'] }, 1000 * 60],
      },
    },
  },
  { $group: { _id: null, avgWaitMin: { $avg: '$waitMin' } } },
]);
printjson(waiting.toArray());
