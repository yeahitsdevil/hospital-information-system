import React, { useState } from "react";
import { GraduationCap, Award, Users, BookOpen, Layers, Zap, Database, X } from "lucide-react";

export default function ManitBanner() {
  const [showSpecModal, setShowSpecModal] = useState(false);

  return (
    <>
      <div className="manit-project-banner">
        <div className="manit-header-content">
          <div className="manit-seal">
            <GraduationCap size={32} color="#1769e0" />
          </div>
          <div>
            <span className="manit-institute-label">
              MAULANA AZAD NATIONAL INSTITUTE OF TECHNOLOGY (MANIT) BHOPAL
            </span>
            <h1 className="manit-project-title">Hospital Information System (HIS)</h1>
            <p className="manit-project-desc">
              Integrated Digital Healthcare Platform for clinical, administrative, and financial automation.
            </p>
          </div>
        </div>

        <div className="manit-meta-row">
          <div className="manit-meta-item">
            <Award size={16} />
            <span>
              Mentors: <strong>Dr. Jay Kumar Jain</strong> & <strong>Dr. Kuldeep Singh Yadav</strong>
            </span>
          </div>

          <div className="manit-meta-item">
            <Users size={16} />
            <span>
              Project Team: <strong>Ashutosh, Nikita, Bhavishya, Akarshan, Sumit, Nitish</strong>
            </span>
          </div>

          <button
            type="button"
            className="btn-spec-view"
            onClick={() => setShowSpecModal(true)}
          >
            <BookOpen size={15} /> System Spec & Triggers (35)
          </button>
        </div>
      </div>

      {/* SPECIFICATION MODAL */}
      {showSpecModal && (
        <div className="modal">
          <div className="modal-card spec-modal-card">
            <div className="modal-head">
              <div>
                <h2>HIS Architecture & PDF Specification Reference</h2>
                <small>MANIT Bhopal — Academic System Design</small>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowSpecModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="spec-modal-body">
              {/* Mentors & Team Section */}
              <div className="spec-section-box">
                <h3><Users size={18} /> Project Governance & Development Team</h3>
                <div className="team-grid">
                  <div className="team-col">
                    <strong>Mentors:</strong>
                    <ul>
                      <li>Dr. Jay Kumar Jain</li>
                      <li>Dr. Kuldeep Singh Yadav</li>
                    </ul>
                  </div>
                  <div className="team-col">
                    <strong>Student Developers:</strong>
                    <ul>
                      <li>1. Ashutosh Sharma (25204031148)</li>
                      <li>2. Nikita Patidar (25204031132)</li>
                      <li>3. Bhavishya Sisodiya (25204031140)</li>
                      <li>4. Akarshan Pathak (25204031107)</li>
                      <li>5. Sumit Sahai (25204031124)</li>
                      <li>6. Nitish Kumar (25204031115)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Dictionary Summary (27 Entities) */}
              <div className="spec-section-box">
                <h3><Database size={18} /> 27 Relational Entities Implemented (Pages 15-28)</h3>
                <div className="entity-chips-grid">
                  <span className="spec-chip">1. Hospital</span>
                  <span className="spec-chip">2. Department</span>
                  <span className="spec-chip">3. Role</span>
                  <span className="spec-chip">4. Role_department</span>
                  <span className="spec-chip">5. Room</span>
                  <span className="spec-chip highlight">6. Employee (Superclass)</span>
                  <span className="spec-chip highlight">7. Doctor (Subclass)</span>
                  <span className="spec-chip highlight">8. Medical_staff (Subclass)</span>
                  <span className="spec-chip highlight">9. Admin (Subclass)</span>
                  <span className="spec-chip">10. Patient</span>
                  <span className="spec-chip">11. Medical_history</span>
                  <span className="spec-chip">12. Appointment</span>
                  <span className="spec-chip">13. Admission</span>
                  <span className="spec-chip">14. Nurse_assignment</span>
                  <span className="spec-chip">15. Test_type</span>
                  <span className="spec-chip">16. Lab_test</span>
                  <span className="spec-chip">17. Medicine</span>
                  <span className="spec-chip">18. Pharmacy</span>
                  <span className="spec-chip">19. Pharmacy_staff</span>
                  <span className="spec-chip">20. Pharmacy_medicine_stock</span>
                  <span className="spec-chip">21. Prescription</span>
                  <span className="spec-chip">22. Prescription_medicine</span>
                  <span className="spec-chip">23. Bill</span>
                  <span className="spec-chip charge">24. Appointment_charge</span>
                  <span className="spec-chip charge">25. Medicine_charge</span>
                  <span className="spec-chip charge">26. Test_charge</span>
                  <span className="spec-chip charge">27. Admission_charge</span>
                </div>
              </div>

              {/* Automated Triggers Engine (35 Rules) */}
              <div className="spec-section-box">
                <h3><Zap size={18} /> 35 Automated Triggers Engine (Pages 29-30)</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  All 35 triggers specified in the PDF presentation are actively executed by the backend TriggerEngine service:
                </p>
                <div className="triggers-scroll-list">
                  <div className="trigger-row"><span>1-2. trg_validate_role_department & update</span> <small>Enforces valid role-department match on employee hire/update</small></div>
                  <div className="trigger-row"><span>3. trg_check_hire_date</span> <small>Blocks future hire dates</small></div>
                  <div className="trigger-row"><span>4. trg_employee_role_distribution</span> <small>Auto-inserts into Doctor, MedicalStaff, or AdminStaff subclasses</small></div>
                  <div className="trigger-row"><span>5-6. trg_validate_medical_staff & check_pharmacist</span> <small>Validates staff types and restricts pharmacy staff to pharmacists</small></div>
                  <div className="trigger-row"><span>7. trg_no_past_appointment</span> <small>Blocks booking appointments for past dates</small></div>
                  <div className="trigger-row"><span>8. trg_doctor_schedule</span> <small>Prevents overlapping 30-min consultation slots for the same doctor</small></div>
                  <div className="trigger-row"><span>9. trg_limit_doctor_daily_appointments</span> <small>Strictly enforces maximum 20 appointments/day per doctor</small></div>
                  <div className="trigger-row"><span>10. trg_add_appointment_charge</span> <small>Automatically generates consultation fee on active patient bill</small></div>
                  <div className="trigger-row"><span>11-13. Pharmacy Triggers (expired, stock, reduce)</span> <small>Blocks expired drugs, verifies stock, decrements inventory & auto-bills</small></div>
                  <div className="trigger-row"><span>14-15. Lab Triggers (technician, add charge)</span> <small>Enforces Lab Technician role & automatically adds test fee to bill</small></div>
                  <div className="trigger-row"><span>16-18. Admission Triggers (single active, room status)</span> <small>Prevents concurrent admissions, marks room occupied, updates patient to IPD</small></div>
                  <div className="trigger-row"><span>19-20. Discharge Triggers (validate, free room)</span> <small>Ensures discharge date &gt; admission date and sets room back to available</small></div>
                  <div className="trigger-row"><span>21. trg_auto_assign_nurse</span> <small>Automatically assigns active nurse with lowest current patient workload</small></div>
                  <div className="trigger-row"><span>22-23. Inpatient Billing Triggers</span> <small>Auto-creates master bill on admit and calculates room stay fee on discharge</small></div>
                  <div className="trigger-row"><span>24-35. trg_bill_*_insert/update/delete</span> <small>Automatically recalculates bill total whenever any consultation, med, lab or room charge changes</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
