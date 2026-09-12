import { Medicine } from "../models/index.js";

export const getAlerts = async (req, res) => {
  try {
    const [lowStock, expiring] = await Promise.all([
      Medicine.find({
        $expr: { $lte: ["$quantity", "$reorderLevel"] },
      }),

      Medicine.find({
        expiryDate: {
          $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        },
      }),
    ]);

    res.json({
      lowStock,
      expiring,
    });
  } catch (error) {
    console.error("GET /api/alerts failed:", error);

    res.status(500).json({
      message: "Failed to load alerts",
    });
  }
};