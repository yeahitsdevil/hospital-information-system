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
    ],
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
  },

  appointments: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
    ],
    create: ["admin", "doctor", "receptionist"],
    update: ["admin", "doctor", "nurse", "receptionist"],
    delete: ["admin"],
  },

  prescriptions: {
    read: [
      "admin",
      "doctor",
      "nurse",
      "pharmacist",
    ],
    create: ["admin", "doctor"],
    update: ["admin", "doctor"],
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
    ],
    create: ["admin", "doctor", "lab"],
    update: ["admin", "doctor", "lab"],
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
    ],
    create: ["admin", "accountant"],
    update: ["admin", "accountant"],
    delete: ["admin"],
  },
};