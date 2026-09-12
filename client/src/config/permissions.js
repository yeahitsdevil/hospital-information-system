export const permissions = {
  patients: {
    create: ["admin", "receptionist"],
    update: ["admin", "doctor", "nurse", "receptionist"],
    delete: ["admin"],
  },

  doctors: {
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
  },

  appointments: {
    create: ["admin", "doctor", "receptionist"],
    update: ["admin", "doctor", "nurse", "receptionist"],
    delete: ["admin"],
  },

  prescriptions: {
    create: ["admin", "doctor"],
    update: ["admin", "doctor"],
    delete: ["admin"],
  },

  medicines: {
    create: ["admin", "pharmacist"],
    update: ["admin", "pharmacist"],
    delete: ["admin"],
  },

  "lab-tests": {
    create: ["admin", "doctor", "lab"],
    update: ["admin", "doctor", "lab"],
    delete: ["admin"],
  },

  beds: {
    create: ["admin"],
    update: ["admin", "nurse"],
    delete: ["admin"],
  },

  bills: {
    create: ["admin", "accountant"],
    update: ["admin", "accountant"],
    delete: ["admin"],
  },
};