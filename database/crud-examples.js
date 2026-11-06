// CREATE — insert a new patient with embedded contact and address
db.patients.insertOne({
  patientId: 'PAT9999',
  fullName: 'Sample Patient',
  dateOfBirth: ISODate('1995-06-15'),
  gender: 'Female',
  contact: { phone: '9000000000', email: 'sample@example.in' },
  address: { street: 'Demo Street', city: 'Mysuru', state: 'Karnataka', pincode: '570001' },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// READ — find active patients in Mysuru
db.patients.find({ isActive: true, 'address.city': 'Mysuru' });

// UPDATE — change phone number for a patient
db.patients.updateOne(
  { patientId: 'PAT9999' },
  { $set: { 'contact.phone': '9111111111', updatedAt: new Date() } }
);

// DELETE — soft delete (deactivate) instead of removing history
db.patients.updateOne({ patientId: 'PAT9999' }, { $set: { isActive: false } });

print('CRUD examples executed. Remove PAT9999 test record if not needed.');
