import React, { useState, useEffect } from "react";
import { UserCheck, Briefcase, Plus, Building, ShieldCheck, HeartPulse, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";

export default function StaffView() {
  const [employees, setEmployees] = useState([]);
  const [nursesWorkload, setNursesWorkload] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);

  // New Employee Form
  const [empForm, setEmpForm] = useState({
    name: "",
    gender: "M",
    role_name: "Doctor",
    department_name: "Cardiology",
    salary: 100000,
    hire_date: new Date().toISOString().split("T")[0],
    email: "",
    phone: "",
    specialization: "Cardiologist",
    license_no: "",
    consultation_fee: 600,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, nursesData, deptsData, hospsData] = await Promise.all([
        api("/staff-ops/employees"),
        api("/staff-ops/nurses-workload"),
        api("/staff-ops/departments"),
        api("/staff-ops/hospitals"),
      ]);
      setEmployees(empData);
      setNursesWorkload(nursesData);
      setDepartments(deptsData);
      setHospitals(hospsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api("/staff-ops/employees", {
        method: "POST",
        body: JSON.stringify(empForm),
      });

      setSuccess(`Employee ${res.name} onboarded successfully! Superclass distribution trigger created subclass profile.`);
      setShowAddEmpModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>Hierarchical Staff & Resource Allocation (DFD 1.0, 10.0 & Slide 2)</h2>
          <p className="sub-text">
            Employee superclass model with automatic role distribution (Doctor, Medical Staff, Admin) and dynamic nurse workload balancing.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddEmpModal(true)}>
          <Plus size={16} /> Onboard Staff Member
        </button>
      </div>

      {error && <div className="alert-banner alert-danger">{error}</div>}
      {success && <div className="alert-banner alert-success">{success}</div>}

      {/* TABS */}
      <div className="filter-tab-bar">
        <button className={`tab-btn ${activeTab === "employees" ? "active" : ""}`} onClick={() => setActiveTab("employees")}>
          Employee Directory ({employees.length})
        </button>
        <button className={`tab-btn ${activeTab === "nurses" ? "active" : ""}`} onClick={() => setActiveTab("nurses")}>
          Nurse Workload Balancer ({nursesWorkload.length})
        </button>
        <button className={`tab-btn ${activeTab === "departments" ? "active" : ""}`} onClick={() => setActiveTab("departments")}>
          Departments & Facility ({departments.length})
        </button>
      </div>

      {/* 1. EMPLOYEE DIRECTORY */}
      {activeTab === "employees" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Employee Name</th>
                <th>Designation / Role</th>
                <th>Department</th>
                <th>Base Salary</th>
                <th>Hire Date</th>
                <th>Employment Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td><strong>{emp.emp_id}</strong></td>
                  <td><strong>{emp.name}</strong></td>
                  <td>
                    <span className={`role-badge ${emp.role_name?.toLowerCase()}`}>
                      {emp.role_name}
                    </span>
                  </td>
                  <td>{emp.department_name || "General"}</td>
                  <td>₹{(emp.salary || 0).toLocaleString()}</td>
                  <td>{new Date(emp.hire_date || emp.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="status-pill available">{emp.employment_status?.toUpperCase() || "ACTIVE"}</span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty">No employee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. NURSE WORKLOAD BALANCER */}
      {activeTab === "nurses" && (
        <div className="workload-grid">
          {nursesWorkload.map((nw) => (
            <div key={nw.nurse?._id} className="workload-card">
              <div className="workload-header">
                <HeartPulse size={24} color="#1769e0" />
                <span className={`status-pill ${nw.workloadStatus === "Available" ? "available" : "primary"}`}>
                  {nw.workloadStatus}
                </span>
              </div>
              <h3>{nw.nurse?.name}</h3>
              <p className="workload-dept">Dept: {nw.nurse?.department || "Emergency & General Care"}</p>
              <div className="active-assignments-counter">
                <span>Active Patient Assignments:</span>
                <strong>{nw.activeAssignments} Inpatients</strong>
              </div>
              <small style={{ color: "var(--text-muted)", marginTop: "10px", display: "block" }}>
                Auto-assigned by Trigger 21 when new admissions arrive.
              </small>
            </div>
          ))}
        </div>
      )}

      {/* 3. DEPARTMENTS & FACILITY */}
      {activeTab === "departments" && (
        <div>
          {hospitals.length > 0 && (
            <div className="facility-card">
              <h3><Building size={20} /> Primary Medical Facility (Hospital Entity)</h3>
              <p><strong>{hospitals[0]?.h_name}</strong></p>
              <p>{hospitals[0]?.address}</p>
              <p>Contact: {hospitals[0]?.phone} | Email: {hospitals[0]?.email}</p>
            </div>
          )}

          <h3 style={{ marginTop: "20px" }}>Hospital Departments (Page 15)</h3>
          <div className="departments-grid">
            {departments.map((d) => (
              <div key={d._id} className="dept-card">
                <strong>{d.dept_name}</strong>
                <p>{d.description || "Clinical specialty division"}</p>
                <small>Code: {d.department_id}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONBOARD EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleCreateEmployee}>
            <div className="modal-head">
              <h2>Onboard Employee (Superclass Model - Page 17)</h2>
              <button type="button" className="close-btn" onClick={() => setShowAddEmpModal(false)}>×</button>
            </div>

            <div className="grid-2-inputs">
              <label>
                Full Name
                <input
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="e.g. Dr. Siddharth Sen"
                />
              </label>

              <label>
                Gender
                <select
                  value={empForm.gender}
                  onChange={(e) => setEmpForm({ ...empForm, gender: e.target.value })}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </label>

              <label>
                Role (Trigger 4: Subclass Distribution)
                <select
                  value={empForm.role_name}
                  onChange={(e) => setEmpForm({ ...empForm, role_name: e.target.value })}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Admin">Admin</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </label>

              <label>
                Department (Trigger 1: Match Validation)
                <select
                  value={empForm.department_name}
                  onChange={(e) => setEmpForm({ ...empForm, department_name: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d.dept_name}>{d.dept_name}</option>
                  ))}
                  {departments.length === 0 && (
                    <option value="Cardiology">Cardiology</option>
                  )}
                </select>
              </label>

              <label>
                Base Salary (₹)
                <input
                  type="number"
                  required
                  value={empForm.salary}
                  onChange={(e) => setEmpForm({ ...empForm, salary: Number(e.target.value) })}
                />
              </label>

              <label>
                Hire Date (Trigger 3: Not in Future)
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={empForm.hire_date}
                  onChange={(e) => setEmpForm({ ...empForm, hire_date: e.target.value })}
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  placeholder="staff@his.local"
                />
              </label>

              <label>
                Contact Phone
                <input
                  value={empForm.phone}
                  onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                  placeholder="Mobile number"
                />
              </label>
            </div>

            {empForm.role_name === "Doctor" && (
              <div className="grid-2-inputs" style={{ marginTop: "10px", padding: "10px", background: "var(--surface-soft)", borderRadius: "8px" }}>
                <label>
                  Specialization
                  <input
                    value={empForm.specialization}
                    onChange={(e) => setEmpForm({ ...empForm, specialization: e.target.value })}
                    placeholder="e.g. Cardiologist"
                  />
                </label>
                <label>
                  License Number
                  <input
                    value={empForm.license_no}
                    onChange={(e) => setEmpForm({ ...empForm, license_no: e.target.value })}
                    placeholder="e.g. MP-MED-99120"
                  />
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddEmpModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Onboard Employee & Distribute Role</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
