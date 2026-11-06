import mongoose from 'mongoose';

/**
 * Atomic sequence per doctor per day for queue numbers.
 * findOneAndUpdate with $inc avoids race conditions (not count+1 on queue_entries).
 */
const queueCounterSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  queueDate: { type: Date, required: true },
  seq: { type: Number, default: 0 },
});

queueCounterSchema.index({ doctorId: 1, queueDate: 1 }, { unique: true });

export default mongoose.model('QueueCounter', queueCounterSchema);
