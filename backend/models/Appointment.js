import mongoose from 'mongoose';

const APPOINTMENT_STATUSES = [
  'Scheduled',
  'Checked In',
  'Waiting',
  'In Consultation',
  'Completed',
  'Cancelled',
  'No Show',
];

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, unique: true, trim: true },
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
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

export { APPOINTMENT_STATUSES };
export default mongoose.model('Appointment', appointmentSchema);
