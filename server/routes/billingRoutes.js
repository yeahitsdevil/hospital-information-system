import express from "express";
import { auth, roles } from "../middleware/auth.js";
import {
  getBills,
  getBillById,
  processPayment,
  getBillReceipt,
} from "../controllers/billingController.js";

const router = express.Router();

router.get(
  "/",
  auth,
  roles("admin", "receptionist", "accountant", "patient"),
  getBills,
);
router.get(
  "/:id",
  auth,
  roles("admin", "receptionist", "accountant", "patient"),
  getBillById,
);
router.post(
  "/:id/pay",
  auth,
  roles("admin", "accountant", "patient"),
  processPayment,
);
router.get(
  "/:id/receipt",
  auth,
  roles("admin", "receptionist", "accountant", "patient"),
  getBillReceipt,
);

export default router;
