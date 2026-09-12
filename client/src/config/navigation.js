import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Activity,
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

  ["/doctors", "Doctors", Stethoscope, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "accountant",
  ]],

  ["/appointments", "Appointments", CalendarDays, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
  ]],

  ["/prescriptions", "Prescriptions", Activity, [
    "admin",
    "doctor",
    "nurse",
    "pharmacist",
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
  ]],

  ["/beds", "Beds & Wards", BedDouble, [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
  ]],

  ["/bills", "Billing", Receipt, [
    "admin",
    "receptionist",
    "accountant",
  ]],
];

export default navItems;