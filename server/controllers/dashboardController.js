import {
  Patient,
  Doctor,
  Appointment,
  Medicine,
  Bed,
  Bill,
} from "../models/index.js";

export const getDashboard = async (req, res) => {
  try {
    const role = req.user.role;

    const canReadPatients = [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "lab",
      "accountant",
    ].includes(role);

    const canReadDoctors = [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "accountant",
    ].includes(role);

    const canReadAppointments = [
      "admin",
      "doctor",
      "nurse",
      "receptionist",
    ].includes(role);

    const canReadBeds = ["admin", "doctor", "nurse", "receptionist"].includes(
      role,
    );

    const canReadMedicineAlerts = ["admin", "pharmacist"].includes(role);

    const canReadRevenue = ["admin", "accountant"].includes(role);

    const [patients, doctors, appointments, beds, medicines, bills] =
      await Promise.all([
        canReadPatients ? Patient.countDocuments() : Promise.resolve(null),

        canReadDoctors ? Doctor.countDocuments() : Promise.resolve(null),

        canReadAppointments
          ? Appointment.countDocuments({ status: "scheduled" })
          : Promise.resolve(null),

        canReadBeds
          ? Bed.countDocuments({ status: "available" })
          : Promise.resolve(null),

        canReadMedicineAlerts
          ? Medicine.countDocuments({
              $expr: {
                $lte: ["$quantity", "$reorderLevel"],
              },
            })
          : Promise.resolve(null),

        canReadRevenue
          ? Bill.aggregate([
              {
                $group: {
                  _id: null,
                  total: { $sum: "$total" },
                },
              },
            ])
          : Promise.resolve([]),
      ]);

    res.json({
      patients,
      doctors,
      appointments,
      availableBeds: beds,
      lowStock: medicines,
      revenue: bills[0]?.total ?? null,
    });
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);

    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
