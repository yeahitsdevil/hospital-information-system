import React from "react";
import { Link } from "react-router-dom";
import ManitBanner from "./ManitBanner";
import useDashboardData from "../../hooks/useDashboardData";
import {
  Users,
  Stethoscope,
  CalendarDays,
  BedDouble,
  Pill,
  Receipt,
  UserCheck,
  FlaskConical,
  Activity,
  ArrowRight,
  UserCircle,
  Plus,
  Clock,
  ShieldCheck,
} from "lucide-react";
import navItems from "../../config/navigation";

// Build map of allowed roles per route
const routeRolesMap = {};
navItems.forEach(([route, , , roles]) => {
  routeRolesMap[route] = roles;
});

export default function Dashboard() {
  const d = useDashboardData();
  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const role = user.role || "patient";

  const isRoleAllowed = (route) => {
    const allowed = routeRolesMap[route];
    return allowed ? allowed.includes(role) : false;
  };

  // Staff / Admin KPI cards
  const allCards = [
    {
      id: "patients",
      title: "Total Patients",
      value: d.patients || 0,
      sub: `${d.opdPatients || 0} OPD • ${d.ipdPatients || 0} Inpatients`,
      icon: Users,
      link: "/patients",
      color: "#1769e0",
      roles: ["admin", "doctor", "nurse", "receptionist", "pharmacist", "lab", "accountant"],
    },
    {
      id: "doctors",
      title: "Active Doctors",
      value: d.doctors || 0,
      sub: "Across all clinical specialties",
      icon: Stethoscope,
      link: "/doctors",
      color: "#059669",
      roles: ["admin", "doctor", "nurse", "receptionist", "pharmacist", "accountant", "patient"],
    },
    {
      id: "appointments",
      title: role === "patient" ? "My Appointments" : "Appointments Scheduled",
      value: role === "patient" ? "View Active" : (d.appointments || 0),
      sub: role === "patient" ? "Book 30-min consultation slots" : "30-minute consultation slots",
      icon: CalendarDays,
      link: "/appointments",
      color: "#d97706",
      roles: ["admin", "doctor", "nurse", "receptionist", "patient"],
    },
    {
      id: "beds",
      title: "Available Rooms & Beds",
      value: d.availableBeds || 0,
      sub: `${d.occupiedBeds || 0} Occupied • ${d.icuAvailable || 0} ICU Free`,
      icon: BedDouble,
      link: "/beds",
      color: "#7c3aed",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      id: "medicines",
      title: "Pharmacy Stock Alerts",
      value: d.lowStock || 0,
      sub: `${d.expiringMedicines || 0} Expiring soon (Safety Check)`,
      icon: Pill,
      link: "/medicines",
      color: "#dc2626",
      roles: ["admin", "doctor", "nurse", "pharmacist"],
    },
    {
      id: "bills",
      title: role === "patient" ? "My Medical Invoices" : "Billed Healthcare Revenue",
      value: role === "patient" ? "View Bills" : `₹${(d.revenue || 0).toLocaleString()}`,
      sub: role === "patient" ? "Consultation & OPD receipts" : `${d.pendingBills || 0} Invoices pending payment`,
      icon: Receipt,
      link: "/bills",
      color: "#2563eb",
      roles: ["admin", "receptionist", "accountant", "patient"],
    },
    {
      id: "profile",
      title: "My Profile & Status",
      value: user.is_available !== false ? "● Available" : "● Not Available",
      sub: `Role: ${role.toUpperCase()} • Click to update`,
      icon: UserCircle,
      link: "/profile",
      color: "#0891b2",
      roles: ["admin", "doctor", "nurse", "receptionist", "pharmacist", "lab", "accountant", "patient"],
    },
  ];

  // Filter KPI cards strictly according to user role
  const visibleCards = allCards.filter((c) => c.roles.includes(role));

  // DFD Operational Panels
  const allPanels = [
    {
      id: "patient-appointment",
      title: "Book Doctor Consultation (DFD 3.0)",
      desc: "Select a specialist doctor from available schedules and confirm your 30-minute consultation slot with automatic conflict prevention.",
      link: "/appointments",
      btnText: "Book Consultation Slot",
      icon: CalendarDays,
      color: "#d97706",
      roles: ["patient"],
    },
    {
      id: "patient-doctors",
      title: "Doctor Directory & Live Availability",
      desc: "Check available physicians, specialties, OPD consulting hours, and fees. Live status indicator shows if doctor is currently available or off-duty.",
      link: "/doctors",
      btnText: "Browse Doctors & Schedules",
      icon: Stethoscope,
      color: "#059669",
      roles: ["patient"],
    },
    {
      id: "patient-bills",
      title: "My Invoices & Payment Slips",
      desc: "Access your official outpatient consultation slips, pharmacy bills, and payment records with tax breakdown.",
      link: "/bills",
      btnText: "View Invoices & Receipts",
      icon: Receipt,
      color: "#2563eb",
      roles: ["patient"],
    },
    {
      id: "manage-profile",
      title: "Manage Profile & Duty Availability",
      desc: "Update your personal details, contact numbers, emergency contacts, medical records, and toggle your live duty/availability status.",
      link: "/profile",
      btnText: "Open My Profile",
      icon: UserCircle,
      color: "#0891b2",
      roles: ["patient", "doctor", "nurse", "receptionist", "pharmacist", "lab", "accountant", "admin"],
    },
    {
      id: "patients-admin",
      title: "Patient Administration (DFD 2.0)",
      desc: "Register new patients, manage Outpatient (OPD) and Inpatient (IPD) clinical workflows, and record longitudinal medical histories.",
      link: "/patients",
      btnText: "Patient Records & EMR",
      icon: Users,
      color: "#1769e0",
      roles: ["admin", "doctor", "nurse", "receptionist", "pharmacist", "lab", "accountant"],
    },
    {
      id: "staff-appointments",
      title: "Appointment Scheduling (DFD 3.0)",
      desc: "Book 30-minute consultation slots with automatic conflict detection, doctor daily quota (max 20/day), and printable slips.",
      link: "/appointments",
      btnText: "Consultation Slots & Slips",
      icon: CalendarDays,
      color: "#d97706",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      id: "beds-module",
      title: "Inpatient Care & Wards (DFD 8.0 & 11)",
      desc: "Real-time room occupancy, ICU allocation, automated nurse workload balancing (Trigger 21), and stay duration billing on discharge.",
      link: "/beds",
      btnText: "Room Board & Admissions",
      icon: BedDouble,
      color: "#7c3aed",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      id: "lab-module",
      title: "Laboratory Services (DFD 6.0)",
      desc: "Order standard diagnostic tests (CBC, Lipid, LFT, X-Ray), submit lab findings with technician role verification, and auto-bill charges.",
      link: "/lab-tests",
      btnText: "Diagnostic Tests & Reports",
      icon: FlaskConical,
      color: "#059669",
      roles: ["admin", "doctor", "nurse", "lab"],
    },
    {
      id: "pharmacy-module",
      title: "Pharmacy & Prescriptions (DFD 5.0 & 7.0)",
      desc: "Medicine inventory with batch and expiry tracking, automatic expired medicine blocking (Trigger 11), and real-time stock deduction.",
      link: "/medicines",
      btnText: "Pharmacy & Dispensing",
      icon: Pill,
      color: "#dc2626",
      roles: ["admin", "doctor", "nurse", "pharmacist"],
    },
    {
      id: "billing-module",
      title: "Consolidated Billing (DFD 9.0 & 12)",
      desc: "Unified billing engine auto-aggregating consultation, pharmacy, laboratory, and room stay charges with official tax invoices.",
      link: "/bills",
      btnText: "Invoices & Payment Receipts",
      icon: Receipt,
      color: "#2563eb",
      roles: ["admin", "receptionist", "accountant"],
    },
    {
      id: "staff-module",
      title: "Hierarchical Staff & Workload (Slide 2)",
      desc: "Employee superclass model with automatic role distribution (Doctor, Medical Staff, Admin) and dynamic nurse workload balancing.",
      link: "/staff",
      btnText: "Staff Directory & Workload",
      icon: UserCheck,
      color: "#0891b2",
      roles: ["admin", "doctor", "nurse", "accountant"],
    },
  ];

  // Filter panels strictly according to user role
  const visiblePanels = allPanels.filter((p) => p.roles.includes(role));

  return (
    <div className="dashboard-container">
      {/* MANIT BHOPAL PROJECT BRANDING & SPECIFICATION BANNER */}
      <ManitBanner />

      {/* USER ROLE GREETING & STATUS BANNER */}
      <div className="user-welcome-banner">
        <div className="welcome-text-group">
          <h2>Welcome, {user.name || "User"}!</h2>
          <p>
            Logged in as <strong className="role-tag">{role.toUpperCase()}</strong> • Hospital Information System
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/profile" className="btn-secondary-sm">
            <UserCircle size={15} /> My Profile
          </Link>
          {role === "patient" && (
            <Link to="/appointments" className="btn-primary-sm">
              <Plus size={15} /> Book Appointment
            </Link>
          )}
        </div>
      </div>

      {/* KPI METRICS OVERVIEW: Strictly role-tailored */}
      <div className="cards-grid-kpi">
        {visibleCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link to={c.link} className="kpi-card" key={i}>
              <div className="kpi-card-top">
                <small>{c.title}</small>
                <div className="kpi-icon-wrap" style={{ background: `${c.color}15`, color: c.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <strong className="kpi-value">{c.value}</strong>
              <span className="kpi-sub">{c.sub}</span>
            </Link>
          );
        })}
      </div>

      {/* OPERATIONAL MODULES / QUICK ACTIONS: Strictly role-tailored */}
      <div className="dfd-modules-grid">
        {visiblePanels.map((panel) => {
          const Icon = panel.icon;
          return (
            <div className="dfd-panel" key={panel.id}>
              <div className="panel-title-row">
                <Icon size={20} color={panel.color} />
                <h3>{panel.title}</h3>
              </div>
              <p className="panel-desc">{panel.desc}</p>
              <div className="panel-links">
                <Link to={panel.link} className="panel-btn">
                  {panel.btnText} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}