import {
  Patient,
  Doctor,
  Appointment,
  Medicine,
  Bed,
  Bill,
} from "../models/index.js";

export const getDashboard = async (req, res) => {
  const [patients, doctors, appointments, beds, medicines, bills] =
    await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({ status: "scheduled" }),
      Bed.countDocuments({ status: "available" }),
      Medicine.countDocuments({
        $expr: { $lte: ["$quantity", "$reorderLevel"] },
      }),
      Bill.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

  res.json({
    patients,
    doctors,
    appointments,
    availableBeds: beds,
    lowStock: medicines,
    revenue: bills[0]?.total || 0,
  });
};