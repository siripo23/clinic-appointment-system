import QueueCounter from '../models/QueueCounter.js';
import QueueEntry from '../models/QueueEntry.js';
import { startOfDay } from './timeUtils.js';

const ACTIVE_QUEUE_STATUSES = ['Waiting', 'Called', 'In Consultation'];

export async function allocateQueueNumber(doctorId, queueDate) {
  const day = startOfDay(queueDate);
  const counter = await QueueCounter.findOneAndUpdate(
    { doctorId, queueDate: day },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
}

export async function findActiveQueueForAppointment(appointmentId) {
  return QueueEntry.findOne({
    appointmentId,
    status: { $in: ACTIVE_QUEUE_STATUSES },
  });
}
