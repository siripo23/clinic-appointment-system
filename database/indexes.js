// users — unique email for login lookup
db.users.createIndex({ email: 1 }, { unique: true });

// patients — unique business patient ID
db.patients.createIndex({ patientId: 1 }, { unique: true });

// doctors — unique business doctor ID
db.doctors.createIndex({ doctorId: 1 }, { unique: true });

// appointments — unique appointment ID and doctor-day queries
db.appointments.createIndex({ appointmentId: 1 }, { unique: true });
db.appointments.createIndex({ doctorId: 1, appointmentDate: 1 });

// queue_entries — unique queue number per doctor per day
db.queue_entries.createIndex(
  { doctorId: 1, queueDate: 1, queueNumber: 1 },
  { unique: true }
);

print('Indexes created (or already exist).');
