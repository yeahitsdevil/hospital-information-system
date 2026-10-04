import mongoose from "mongoose";
import {
  Employee,
  Doctor,
  MedicalStaff,
  AdminStaff,
  Department,
  Hospital,
  NurseAssignment,
} from "../models/index.js";
import { TriggerEngine } from "../services/triggerEngine.js";

export const getEmployees = async (req, res) => {
  try {
    const list = await Employee.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { role_name, department_name, hire_date } = req.body;

    // RUN TRIGGER 1: Validate role matches department
    await TriggerEngine.validateRoleDepartment(role_name, department_name);

    // RUN TRIGGER 3: Validate hire date is not in future
    TriggerEngine.validateHireDate(hire_date);

    const count = await Employee.countDocuments();
    const emp_id =
      req.body.emp_id || `EMP-${String(count + 1001).padStart(4, "0")}`;

    const newEmp = await Employee.create({
      ...req.body,
      emp_id,
      hire_date: hire_date || new Date(),
    });

    // RUN TRIGGER 4: Auto insert into Doctor, MedicalStaff, or AdminStaff subclass tables
    await TriggerEngine.distributeEmployeeRole(newEmp, req.body);

    res.status(201).json(newEmp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getNursesWithWorkload = async (req, res) => {
  try {
    const nurses = await MedicalStaff.find({ staff_type: "Nurse" }).populate(
      "emp_id",
    );

    const nurseStats = await Promise.all(
      nurses.map(async (nurse) => {
        const activeCount = await NurseAssignment.countDocuments({
          nurse_emp_id: nurse._id,
          active: true,
        });
        return {
          nurse,
          activeAssignments: activeCount,
          workloadStatus:
            activeCount === 0
              ? "Available"
              : activeCount <= 2
                ? "Balanced"
                : "High",
        };
      }),
    );

    res.json(nurseStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const list = await Department.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const list = await Hospital.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
