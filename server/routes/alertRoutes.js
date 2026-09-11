import express from "express";
import { auth } from "../middleware/auth.js";
import { getAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.get("/", auth, getAlerts);

export default router;