import { Medicine } from "../models/index.js";

export const getAlerts = async (req, res) =>
  res.json({
    lowStock: await Medicine.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    }),
    expiring: await Medicine.find({
      expiryDate: {
        $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      },
    }),
  });