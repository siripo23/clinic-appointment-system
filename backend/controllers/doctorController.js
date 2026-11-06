import Doctor from '../models/Doctor.js';
import { nextSequence } from '../services/idService.js';

export async function listDoctors(req, res) {
  try {
    const { search, active } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (search?.trim()) {
      const q = search.trim();
      filter.$or = [
        { fullName: new RegExp(q, 'i') },
        { doctorId: new RegExp(q, 'i') },
        { specialization: new RegExp(q, 'i') },
      ];
    }
    const doctors = await Doctor.find(filter).sort({ fullName: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createDoctor(req, res) {
  try {
    const doctorId = await nextSequence('doctor', 'DOC', 3);
    const doctor = await Doctor.create({ ...req.body, doctorId });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deactivated', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
