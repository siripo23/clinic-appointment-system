import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    contact: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    consultationFee: { type: Number, required: true, min: 0 },
    availability: {
      type: [availabilitySchema],
      validate: [(v) => v.length > 0, 'At least one availability slot is required'],
    },
    appointmentDurationMinutes: { type: Number, default: 30, min: 15 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Doctor', doctorSchema);
