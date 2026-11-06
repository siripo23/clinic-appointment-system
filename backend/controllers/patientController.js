import Patient from '../models/Patient.js';
import { nextSequence } from '../services/idService.js';

export async function listPatients(req, res) {
  try {
    const { search, active } = req.query;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (search?.trim()) {
      const q = search.trim();
      filter.$or = [
        { fullName: new RegExp(q, 'i') },
        { patientId: new RegExp(q, 'i') },
        { 'contact.phone': new RegExp(q, 'i') },
      ];
    }
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPatient(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createPatient(req, res) {
  try {
    const patientId = await nextSequence('patient', 'PAT', 4);
    const patient = await Patient.create({ ...req.body, patientId });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updatePatient(req, res) {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deletePatient(req, res) {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deactivated', patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
