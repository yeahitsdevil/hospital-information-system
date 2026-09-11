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
  ["/", "Dashboard", LayoutDashboard],
  ["/patients", "Patients", Users],
  ["/doctors", "Doctors", Stethoscope],
  ["/appointments", "Appointments", CalendarDays],
  ["/prescriptions", "Prescriptions", Activity],
  ["/medicines", "Pharmacy", Pill],
  ["/lab-tests", "Laboratory", FlaskConical],
  ["/beds", "Beds & Wards", BedDouble],
  ["/bills", "Billing", Receipt],
];

export default navItems;