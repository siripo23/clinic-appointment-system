import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    contact: { type: contactSchema, required: true },
    address: { type: addressSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

patientSchema.index({ fullName: 'text', 'contact.phone': 'text' });

export default mongoose.model('Patient', patientSchema);
