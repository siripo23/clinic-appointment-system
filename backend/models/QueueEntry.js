import mongoose from 'mongoose';

const QUEUE_STATUSES = [
  'Waiting',
  'Called',
  'In Consultation',
  'Completed',
  'No Show',
  'Cancelled',
];

const queueEntrySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    queueDate: { type: Date, required: true },
    queueNumber: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: QUEUE_STATUSES,
      default: 'Waiting',
    },
    checkInTime: { type: Date, required: true },
    calledTime: { type: Date },
    consultationStartTime: { type: Date },
    consultationEndTime: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

queueEntrySchema.index(
  { doctorId: 1, queueDate: 1, queueNumber: 1 },
  { unique: true }
);
queueEntrySchema.index({ appointmentId: 1, status: 1 });
queueEntrySchema.index({ doctorId: 1, queueDate: 1, status: 1 });

export { QUEUE_STATUSES };
export default mongoose.model('QueueEntry', queueEntrySchema);
