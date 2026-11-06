import IdCounter from '../models/IdCounter.js';

export async function nextSequence(key, prefix, pad = 3) {
  const counter = await IdCounter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `${prefix}${String(counter.seq).padStart(pad, '0')}`;
}
