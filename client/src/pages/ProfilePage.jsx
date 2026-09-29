import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Heart,
  Stethoscope,
  Key,
  MapPin,
  Calendar,
  Save,
  Check,
  X,
  Activity,
} from "lucide-react";
import { api } from "../lib/api";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [userData, setUserData] = useState({});
  const [roleDetails, setRoleDetails] = useState({});
  const [role, setRole] = useState("patient");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusNote, setStatusNote] = useState("Available");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Patient fields
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");

  // Doctor fields
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [consultationFee, setConsultationFee] = useState(500);
  const [licenseNo, setLicenseNo] = useState("");
  const [availableDays, setAvailableDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  // Staff fields
  const [staffType, setStaffType] = useState("");

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api("/users/profile");
      const u = res.user || {};
      const p = res.roleDetails || {};
      const r = res.role || u.role || "patient";

      setUserData(u);
      setRoleDetails(p);
      setRole(r);

      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || p.phone || "");
      setIsAvailable(u.is_available ?? p.is_available ?? true);
      setStatusNote(u.status_note || p.status_note || "Available");

      if (r === "patient") {
        setDob(p.dob ? new Date(p.dob).toISOString().split("T")[0] : "");
        setGender(p.gender || "Male");
        setBloodGroup(p.blood_group || p.bloodGroup || "O+");
        setAddress(p.address || "");
        setEmergencyContact(p.emergency_contact || p.emergencyContact || "");
        setAllergies(p.allergies || "None");
      } else if (r === "doctor") {
        setSpecialization(p.specialization || "General Medicine");
        setDepartment(p.department || "Medicine");
        setConsultationFee(p.consultation_fee || p.consultationFee || 500);
        setLicenseNo(p.license_no || "");
        if (p.availableDays && Array.isArray(p.availableDays)) {
          setAvailableDays(p.availableDays);
        }
      } else {
        setDepartment(p.department || p.department_name || "");
        setStaffType(p.staff_type || p.role_name || r);
      }
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const nextStatus = !isAvailable;
      setIsAvailable(nextStatus);
      const nextNote = nextStatus ? "Available" : "Not Available (Away)";
      setStatusNote(nextNote);

      await api("/users/availability", {
        method: "PATCH",
        body: JSON.stringify({ is_available: nextStatus, status_note: nextNote }),
      });

      // Update cached user in localStorage
      const cached = JSON.parse(localStorage.getItem("his_user") || "{}");
      cached.is_available = nextStatus;
      cached.status_note = nextNote;
      localStorage.setItem("his_user", JSON.stringify(cached));

      setSuccess(`Your status is now ${nextStatus ? "Available" : "Not Available"}`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        phone,
        is_available: isAvailable,
        status_note: statusNote,
        ...(password ? { password } : {}),
      };

      if (role === "patient") {
        payload.dob = dob;
        payload.gender = gender;
        payload.blood_group = bloodGroup;
        payload.address = address;
        payload.emergency_contact = emergencyContact;
        payload.allergies = allergies;
      } else if (role === "doctor") {
        payload.specialization = specialization;
        payload.department = department;
        payload.consultation_fee = Number(consultationFee);
        payload.consultationFee = Number(consultationFee);
        payload.license_no = licenseNo;
        payload.availableDays = availableDays;
      }

      const updated = await api("/users/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // Update cached user in localStorage
      const cached = JSON.parse(localStorage.getItem("his_user") || "{}");
      cached.name = updated.user.name;
      cached.phone = updated.user.phone;
      cached.is_available = updated.is_available;
      cached.status_note = updated.status_note;
      localStorage.setItem("his_user", JSON.stringify(cached));

      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const getRoleBadgeTitle = (r) => {
    switch (r) {
      case "patient": return "Patient Profile & Medical ID";
      case "doctor": return "Doctor / Physician Profile";
      case "nurse": return "Nurse Clinical Profile";
      case "receptionist": return "Front Desk & Receptionist Profile";
      case "pharmacist": return "Pharmacist Profile";
      case "lab": return "Laboratory Technician Profile";
      case "accountant": return "Billing & Finance Officer Profile";
      case "admin": return "System Administrator Profile";
      default: return `${r.toUpperCase()} Profile`;
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="card-placeholder" style={{ padding: "40px", textAlign: "center" }}>
          Loading profile information...
        </div>
      </div>
    );
  }

  return (
    <div className="module-container profile-container">
      {/* HEADER SECTION */}
      <div className="module-header profile-head-banner">
        <div className="profile-title-group">
          <div className="profile-avatar-large">
            {name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="profile-badge-row">
              <span className={`status-pill role-pill ${role}`}>
                {role.toUpperCase()}
              </span>
              <span className={`status-pill ${isAvailable ? "available" : "occupied"}`}>
                ● {isAvailable ? "AVAILABLE" : "NOT AVAILABLE"}
              </span>
            </div>
            <h2>{name}</h2>
            <p className="sub-text">{getRoleBadgeTitle(role)} • {email}</p>
          </div>
        </div>

        {/* QUICK AVAILABILITY STATUS TOGGLE CARD */}
        <div className="availability-card">
          <div className="availability-info">
            <span className="availability-label">Current Duty / Availability:</span>
            <strong className={isAvailable ? "text-success" : "text-danger"}>
              {isAvailable ? "Available" : "Not Available"}
            </strong>
            <small className="availability-note">{statusNote}</small>
          </div>
          <button
            type="button"
            className={`btn-availability-toggle ${isAvailable ? "btn-active" : "btn-inactive"}`}
            onClick={handleToggleAvailability}
            title="Click to toggle availability status"
          >
            {isAvailable ? <Check size={16} /> : <X size={16} />}
            {isAvailable ? "Set Not Available" : "Set Available"}
          </button>
        </div>
      </div>

      {error && <div className="alert-banner alert-danger"><AlertTriangle size={18} /> {error}</div>}
      {success && <div className="alert-banner alert-success"><CheckCircle size={18} /> {success}</div>}

      <form onSubmit={handleSaveProfile} className="profile-form-grid">
        {/* SECTION 1: ACCOUNT & CONTACT INFO */}
        <div className="profile-card">
          <div className="card-head">
            <User size={18} color="#1769e0" />
            <h3>Basic Information</h3>
          </div>

          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              value={email}
              disabled
              title="Email address cannot be changed"
            />
            <small className="field-hint">Used for login and identification.</small>
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
          </label>

          <label>
            Availability Status Note
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Available for consultations, In surgery, On leave"
            />
          </label>
        </div>

        {/* SECTION 2: ROLE SPECIFIC DETAILS */}
        {role === "patient" && (
          <div className="profile-card">
            <div className="card-head">
              <Heart size={18} color="#dc2626" />
              <h3>Patient Health & Medical Record</h3>
            </div>

            <div className="patient-id-banner">
              <strong>Patient Registration ID:</strong>
              <span className="id-tag">{roleDetails.patient_id || roleDetails.patientId || "PAT-NEW"}</span>
            </div>

            <div className="form-row-2">
              <label>
                Date of Birth
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </label>

              <label>
                Gender
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="form-row-2">
              <label>
                Blood Group
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </label>

              <label>
                Emergency Contact Number
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. 9123456789"
                />
              </label>
            </div>

            <label>
              Residential Address
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State"
              />
            </label>

            <label>
              Known Allergies / Medical Conditions
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Asthma, Hypertension"
                rows={2}
              />
            </label>
          </div>
        )}

        {role === "doctor" && (
          <div className="profile-card">
            <div className="card-head">
              <Stethoscope size={18} color="#059669" />
              <h3>Doctor Professional Credentials & Schedule</h3>
            </div>

            <label>
              Specialization
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Cardiologist, General Physician, Pediatrician"
                required
              />
            </label>

            <label>
              Department
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology, Medicine, Pediatrics"
                required
              />
            </label>

            <div className="form-row-2">
              <label>
                Consultation Fee (₹)
                <input
                  type="number"
                  min="0"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  required
                />
              </label>

              <label>
                Medical License No.
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="e.g. MCI-2024-9843"
                />
              </label>
            </div>

            <label>
              Available Consultation Days
              <div className="days-picker">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`day-chip ${availableDays.includes(day) ? "selected" : ""}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </label>
          </div>
        )}

        {["nurse", "pharmacist", "lab", "receptionist", "accountant", "admin"].includes(role) && (
          <div className="profile-card">
            <div className="card-head">
              <Shield size={18} color="#7c3aed" />
              <h3>Staff Department & Duty Info</h3>
            </div>

            <label>
              Department / Section
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Nursing Station 2, Central Pharmacy, Biochemistry Lab"
              />
            </label>

            <label>
              Hospital Role & Designation
              <input
                type="text"
                value={staffType || role}
                disabled
              />
            </label>

            <div className="duty-notice">
              <Clock size={16} />
              <span>
                Toggle your duty status using the Availability button to show team members and patients if you are currently on-duty or away.
              </span>
            </div>
          </div>
        )}

        {/* SECTION 3: SECURITY & PASSWORD CHANGE */}
        <div className="profile-card full-width">
          <div className="card-head">
            <Key size={18} color="#d97706" />
            <h3>Security & Password</h3>
          </div>

          <div className="form-row-2">
            <label>
              New Password (Leave blank to keep current)
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </label>
          </div>

          <div className="profile-actions-bar">
            <button
              type="submit"
              className="btn-primary btn-save-profile"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
