import mongoose from 'mongoose';

const idCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('IdCounter', idCounterSchema);
