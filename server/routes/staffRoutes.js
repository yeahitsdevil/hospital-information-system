import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getEmployees,
  createEmployee,
  getNursesWithWorkload,
  getDepartments,
  getHospitals,
} from "../controllers/staffController.js";

const router = express.Router();

router.get("/employees", auth, getEmployees);
router.post("/employees", auth, createEmployee);
router.get("/nurses-workload", auth, getNursesWithWorkload);
router.get("/departments", auth, getDepartments);
router.get("/hospitals", auth, getHospitals);

export default router;
