import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  UserCheck,
  UserCircle,
} from "lucide-react";

const navItems = [
  ["/", "Dashboard", LayoutDashboard, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab",
    "accountant",
    "patient",
  ]],

  ["/appointments", "Appointments", CalendarDays, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "accountant",
    "patient",
  ]],

  ["/prescriptions", "Prescriptions", FileText, ["admin", "doctor", "nurse", "receptionist", "lab", "pharmacist", "patient"]],

  ["/doctors", "Doctors & Specialists", Stethoscope, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "accountant",
    "patient",
  ]],

  ["/patients", "Patients", Users, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab",
    "accountant",
  ]],

  ["/medicines", "Pharmacy", Pill, [
    "admin",
    "doctor",
    "nurse",
    "pharmacist",
  ]],

  ["/lab-tests", "Laboratory", FlaskConical, [
    "admin",
    "doctor",
    "nurse",
    "lab",
    "receptionist",
    "patient",
  ]],

  ["/beds", "Inpatient & Wards", BedDouble, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
  ]],

  ["/bills", "Billing & Invoices", Receipt, [
    "admin",
    "receptionist",
    "accountant",
    "patient",
  ]],

  ["/staff", "Staff & Workload", UserCheck, [
    "admin",
    "doctor",
    "nurse",
    "accountant",
  ]],

  ["/profile", "My Profile", UserCircle, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab",
    "accountant",
    "patient",
  ]],
];

export default navItems;
