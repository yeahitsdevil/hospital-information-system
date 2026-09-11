import express from "express";
import { crud } from "../services/crudRoutes.js";

import {
  Patient,
  Doctor,
  Appointment,
  Prescription,
  Medicine,
  LabTest,
  Bed,
  Bill,
} from "../models/index.js";

const router = express.Router();

crud(router, "patients", Patient);

crud(router, "doctors", Doctor);

crud(router, "appointments", Appointment, ["patient", "doctor"]);

crud(router, "prescriptions", Prescription, ["patient", "doctor"]);

crud(router, "medicines", Medicine);

crud(router, "lab-tests", LabTest, ["patient"]);

crud(router, "beds", Bed, ["patient"]);

crud(router, "bills", Bill, ["patient"]);

export default router;