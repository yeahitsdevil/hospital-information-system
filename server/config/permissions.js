export const permissions = {
  patients: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "lab",
      "accountant",
    ],
    create: ["admin", "receptionist"],
    update: ["admin", "doctor", "nurse", "receptionist"],
    delete: ["admin"],
  },

  doctors: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "accountant",
      "patient",
    ],
    create: ["admin"],
    update: ["admin", "doctor"],
    delete: ["admin"],
  },

  appointments: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "accountant",
      "patient",
    ],
    create: [],
    update: ["admin", "nurse", "receptionist"],
    delete: ["admin"],
  },

  prescriptions: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "lab",
      "patient",
      "pharmacist",
    ],
    create: [],
    update: [],
    delete: ["admin"],
  },

  medicines: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "pharmacist",
    ],
    create: ["admin", "pharmacist"],
    update: ["admin", "pharmacist"],
    delete: ["admin"],
  },

  "lab-tests": {
    read: [
      "admin",
      "doctor",
      "nurse",
      "lab",
      "receptionist",
      "patient",
    ],
    create: [],
    update: [],
    delete: ["admin"],
  },

  beds: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
    ],
    create: ["admin"],
    update: ["admin", "nurse"],
    delete: ["admin"],
  },

  bills: {
    read: [
      "admin",
      "receptionist",
      "accountant",
      "patient",
    ],
    create: ["admin", "accountant"],
    update: ["admin", "accountant"],
    delete: ["admin"],
  },
};
