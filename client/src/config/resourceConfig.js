const configs = {
  patients: {
    title: "Patients",
    sub: "Patient registration and electronic medical records",
    fields: [
      "name",
      "phone",
      "email",
      "gender",
      "bloodGroup",
      "dob",
      "address",
      "allergies",
      "history",
    ],
  },
  doctors: {
    title: "Doctors",
    sub: "Centralized doctor management and schedules",
    fields: [
      "name",
      "specialization",
      "department",
      "phone",
      "email",
      "consultationFee",
    ],
  },
  appointments: {
    title: "Appointments",
    sub: "Online/offline booking and appointment tracking",
    fields: ["patient", "doctor", "date", "reason", "status"],
  },
  prescriptions: {
    title: "Prescriptions",
    sub: "Digital prescriptions linked to patients and pharmacy",
    fields: ["patient", "doctor", "instructions"],
  },
  medicines: {
    title: "Pharmacy Inventory",
    sub: "Medicine inventory, pricing and stock alerts",
    fields: [
      "name",
      "batchNo",
      "category",
      "quantity",
      "reorderLevel",
      "unitPrice",
      "expiryDate",
    ],
  },
  "lab-tests": {
    title: "Laboratory",
    sub: "Test orders and patient-linked laboratory reports",
    fields: ["patient", "testName", "status", "result"],
  },
  beds: {
    title: "Beds & Wards",
    sub: "Real-time room and bed availability",
    fields: ["ward", "bedNumber", "type", "status"],
  },
  bills: {
    title: "Billing",
    sub: "Invoices and payment tracking",
    fields: ["patient", "status", "paymentMethod"],
  },
};

export { configs };