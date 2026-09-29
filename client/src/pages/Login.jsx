import React from "react";
import useLogin from "../hooks/useLogin";
import { UserPlus, LogIn, Stethoscope, Heart, Shield, CheckCircle } from "lucide-react";

const todayLocal = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

function Login({ onLogin }) {
  const {
    isRegister,
    setIsRegister,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    phone,
    setPhone,
    role,
    setRole,
    gender,
    setGender,
    dob,
    setDob,
    bloodGroup,
    setBloodGroup,
    address,
    setAddress,
    emergencyContact,
    setEmergencyContact,
    specialization,
    setSpecialization,
    department,
    setDepartment,
    consultationFee,
    setConsultationFee,
    err,
    setErr,
    loading,
    submit,
  } = useLogin(onLogin);

  const fillDemo = (demoEmail, demoPass) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErr("");
  };

  return (
    <div className="login">
      <div className={`login-card ${isRegister ? "register-card" : ""}`}>
        <div className="brand-mark">+</div>
        <h1>HIS</h1>
        <p>Hospital Information System • MANIT Bhopal</p>

        {/* MODE TOGGLE TABS */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(false);
              setErr("");
            }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(true);
              setErr("");
              if (!name) setName("John Doe");
              if (!email || email.includes("@his.local")) setEmail("");
              setPassword("Demo@123");
            }}
          >
            <UserPlus size={15} /> Register New User
          </button>
        </div>

        <form onSubmit={submit}>
          {isRegister ? (
            <>
              {/* REGISTRATION FORM */}
              <label>
                Select Role
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-selector-input"
                >
                  <option value="patient">Patient (Book appointments and view medical records)</option>
                </select>
              </label>

              <label>
                Full Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </label>

              <div className="form-row-2">
                <label>
                  Email Address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. patient@example.com"
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g. 9876543210"
                  />
                </label>
              </div>

              <label>
                Password (min 6 characters)
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </label>

              {/* PATIENT SPECIFIC FIELDS */}
              {role === "patient" && (
                <div className="role-specific-inputs patient-subform">
                  <div className="subform-title">
                    <Heart size={14} color="#dc2626" />
                    <span>Patient Profile Details (Auto-Created)</span>
                  </div>

                  <div className="form-row-2">
                    <label>
                      Date of Birth
                      <input
                        type="date"
                        max={todayLocal()}
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
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
                      Emergency Contact
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Emergency Phone No."
                      />
                    </label>
                  </div>

                  <label>
                    Residential Address
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 124 Park Ave, Bhopal"
                    />
                  </label>
                </div>
              )}

              <p className="sub-text">Patient accounts are created here. Hospital staff accounts are created by an administrator.</p>

              {err && <div className="error">{err}</div>}

              <button type="submit" disabled={loading} className="btn-auth-submit">
                {loading ? "Registering..." : "Complete Registration & Enter Portal"}
              </button>
            </>
          ) : (
            <>
              {/* LOGIN FORM */}
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>

              {err && <div className="error">{err}</div>}

              <button type="submit" disabled={loading} className="btn-auth-submit">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </>
          )}
        </form>

        {/* DEMO ACCOUNTS QUICK SHORTCUTS */}
        <div className="demo-credentials-section">
          <small className="demo-header">One-Click Test Accounts:</small>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("admin@his.local", "Admin@123")}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("doctor@his.local", "Demo@123")}
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("patient@his.local", "Demo@123")}
            >
              ❤️ Patient
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("nurse@his.local", "Demo@123")}
            >
              💉 Nurse
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("reception@his.local", "Demo@123")}
            >
              🛎️ Reception
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("lab@his.local", "Demo@123")}
            >
              🧪 Lab
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("pharmacy@his.local", "Demo@123")}
            >
              💊 Pharmacy
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemo("accounts@his.local", "Demo@123")}
            >
              🧾 Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
