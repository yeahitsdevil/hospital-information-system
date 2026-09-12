import express from "express";
import { auth, permission } from "../middleware/auth.js";
import { getAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.get(
  "/",
  auth,
  permission(["admin", "pharmacist"]),
  getAlerts,
);

export default router;