import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
} from "react-router-dom";
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
import "./styles.css";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
async function api(path, opts = {}) {
  const token = localStorage.getItem("his_token");
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.message || "Request failed");
  return d;
}
function Login({ onLogin }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@his.local"),
    [password, setPassword] = useState("Admin@123"),
    [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("his_token", d.token);
      localStorage.setItem("his_user", JSON.stringify(d.user));
      onLogin(d.token);
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="login">
      <div className="login-card">
        <div className="brand-mark">+</div>
        <h1>HIS</h1>
        <p>Hospital Information System</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {err && <div className="error">{err}</div>}
          <button>Sign in</button>
        </form>
        <small>Demo: admin@his.local / Admin@123</small>
      </div>
    </div>
  );
}
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

function Shell({ children, onLogout }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("his_theme") || "light",
  );

  const [notifications, setNotifications] = useState({
    lowStock: [],
    expiring: [],
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const loc = useLocation();
  const user = JSON.parse(localStorage.getItem("his_user") || "{}");
  const nav = useNavigate();

  // ==========================================
  // THEME
  // ==========================================
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("his_theme", theme);
  }, [theme]);

  // ==========================================
  // GLOBAL SEARCH
  // ==========================================
  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const resources = [
          {
            type: "patients",
            label: "Patient",
            route: "/patients",
          },
          {
            type: "doctors",
            label: "Doctor",
            route: "/doctors",
          },
          {
            type: "appointments",
            label: "Appointment",
            route: "/appointments",
          },
          {
            type: "prescriptions",
            label: "Prescription",
            route: "/prescriptions",
          },
          {
            type: "medicines",
            label: "Medicine",
            route: "/medicines",
          },
          {
            type: "lab-tests",
            label: "Lab Test",
            route: "/lab-tests",
          },
          {
            type: "beds",
            label: "Bed",
            route: "/beds",
          },
          {
            type: "bills",
            label: "Bill",
            route: "/bills",
          },
        ];

        const results = await Promise.all(
          resources.map(async (resource) => {
            try {
              const data = await api("/" + resource.type);

              return data
                .filter((item) =>
                  JSON.stringify(item).toLowerCase().includes(query),
                )
                .slice(0, 5)
                .map((item) => ({
                  ...item,
                  resourceType: resource.label,
                  route: resource.route,
                }));
            } catch {
              return [];
            }
          }),
        );

        const flattened = results.flat();

        setSearchResults(flattened.slice(0, 15));
        setShowSearchResults(true);
      } catch (e) {
        console.error("Global search failed:", e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  const loadNotifications = async () => {
    try {
      const data = await api("/alerts");

      setNotifications({
        lowStock: data.lowStock || [],
        expiring: data.expiring || [],
      });
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const notificationCount =
    notifications.lowStock.length + notifications.expiring.length;

  // ==========================================
  // OPEN SEARCH RESULT
  // ==========================================
  const openSearchResult = (result) => {
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);

    nav(result.route);
  };

  return (
    <div className="app">
      <aside className={open ? "open" : ""}>
        <div className="logo">
          <span>+</span>

          <div>
            <b>HIS</b>
            <small>Care Management</small>
          </div>
        </div>

        <nav>
          {navItems.map(([to, label, Icon]) => (
            <Link
              key={to}
              onClick={() => setOpen(false)}
              className={loc.pathname === to ? "active" : ""}
              to={to}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user.name?.[0] || "A"}</div>

            <div>
              <b>{user.name || "Admin"}</b>
              <small>{user.role || "admin"}</small>
            </div>
          </div>

          <button
            className="logout"
            onClick={() => {
              localStorage.removeItem("his_token");
              localStorage.removeItem("his_user");
              onLogout();
              nav("/login");
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main>
        <header>
          {/* MOBILE MENU */}
          <button className="mobile" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>

          {/* ==========================================
              GLOBAL SEARCH
          ========================================== */}
          <div className="header-search-wrapper">
            <div className="search">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                placeholder="Search patients, doctors, records..."
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {showSearchResults && search.trim() && (
              <div className="global-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.route}-${result._id}`}
                      className="search-result"
                      onClick={() => openSearchResult(result)}
                    >
                      <div>
                        <strong>
                          {result.name ||
                            result.testName ||
                            result.bedNumber ||
                            result.status ||
                            "Record"}
                        </strong>

                        <small>{result.resourceType}</small>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="no-search-results">No records found.</div>
                )}
              </div>
            )}
          </div>

          {/* ==========================================
              NOTIFICATIONS
          ========================================== */}
          <div className="notification-wrapper">
            <button
              className="notification-button"
              onClick={() => {
                setShowNotifications(!showNotifications);

                if (!showNotifications) {
                  loadNotifications();
                }
              }}
            >
              <Bell size={20} />

              {notificationCount > 0 && (
                <span className="notification-badge">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <strong>Notifications</strong>

                  <button onClick={() => setShowNotifications(false)}>×</button>
                </div>

                {/* LOW STOCK */}
                {notifications.lowStock.length > 0 && (
                  <div className="notification-section">
                    <h4>Low Stock</h4>

                    {notifications.lowStock.map((medicine) => (
                      <button
                        key={medicine._id}
                        className="notification-item"
                        onClick={() => {
                          setShowNotifications(false);
                          nav("/medicines");
                        }}
                      >
                        <strong>{medicine.name}</strong>

                        <span>Only {medicine.quantity} remaining</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* EXPIRING MEDICINES */}
                {notifications.expiring.length > 0 && (
                  <div className="notification-section">
                    <h4>Expiring Medicines</h4>

                    {notifications.expiring.map((medicine) => (
                      <button
                        key={medicine._id}
                        className="notification-item"
                        onClick={() => {
                          setShowNotifications(false);
                          nav("/medicines");
                        }}
                      >
                        <strong>{medicine.name}</strong>

                        <span>
                          Expiry:{" "}
                          {medicine.expiryDate
                            ? new Date(medicine.expiryDate).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* NO NOTIFICATIONS */}
                {notificationCount === 0 && (
                  <div className="no-notifications">
                    <Bell size={24} />

                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* THEME TOGGLE */}
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

      

          {/* USER AVATAR */}
          <div className="top-avatar">{user.name?.[0] || "A"}</div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}

function Dashboard() {
  const [d, setD] = useState({});
  useEffect(() => {
    api("/dashboard").then(setD).catch(console.error);
  }, []);
  const cards = [
    ["Total Patients", d.patients || 0, "Registered patient records"],
    ["Doctors", d.doctors || 0, "Active doctor profiles"],
    ["Appointments", d.appointments || 0, "Scheduled appointments"],
    ["Available Beds", d.availableBeds || 0, "Beds currently available"],
    ["Low Stock", d.lowStock || 0, "Medicines below reorder level"],
    [
      "Billed Revenue",
      `₹${(d.revenue || 0).toLocaleString()}`,
      "Total recorded billing",
    ],
  ];
  return (
    <>
      <PageTitle
        title="Hospital Dashboard"
        sub="Overview of clinical, administrative and financial operations"
      />
      <div className="cards">
        {cards.map((c, i) => (
          <div className="card" key={i}>
            <small>{c[0]}</small>
            <strong>{c[1]}</strong>
            <span>{c[2]}</span>
          </div>
        ))}
      </div>
      <div className="grid2">
        <Quick
          title="Patient Administration"
          items={["Register new patient"]}
        />
        <Quick
          title="Clinical Operations"
          items={[
            "Schedule appointments",
            "Create prescriptions",
            "Order laboratory tests",
          ]}
        />
        <Quick
          title="Resources"
          items={[
            "Check bed availability",
            "Monitor pharmacy stock",
            "Assign staff workload",
          ]}
        />
        <Quick
          title="Finance"
          items={[
            "Generate invoices",
            "Track payments",
            "Review billing records",
          ]}
        />
      </div>
    </>
  );
}
function Quick({ title, items }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {items.map((x) => (
        <div className="quick" key={x}>
          <Activity size={16} />
          {x}
        </div>
      ))}
    </div>
  );
}
function PageTitle({ title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
const configs = {
  patients: {
    title: "Patients",
    sub: "Patient registration and electronic medical records",
    fields: [
      "name",
      "phone",
      "email",
      "gender",
      "bloodGroup",
      "dob",
      "address",
      "allergies",
      "history",
    ],
  },
  doctors: {
    title: "Doctors",
    sub: "Centralized doctor management and schedules",
    fields: [
      "name",
      "specialization",
      "department",
      "phone",
      "email",
      "consultationFee",
    ],
  },
  appointments: {
    title: "Appointments",
    sub: "Online/offline booking and appointment tracking",
    fields: ["patient", "doctor", "date", "reason", "status"],
  },
  prescriptions: {
    title: "Prescriptions",
    sub: "Digital prescriptions linked to patients and pharmacy",
    fields: ["patient", "doctor", "instructions"],
  },
  medicines: {
    title: "Pharmacy Inventory",
    sub: "Medicine inventory, pricing and stock alerts",
    fields: [
      "name",
      "batchNo",
      "category",
      "quantity",
      "reorderLevel",
      "unitPrice",
      "expiryDate",
    ],
  },
  "lab-tests": {
    title: "Laboratory",
    sub: "Test orders and patient-linked laboratory reports",
    fields: ["patient", "testName", "status", "result"],
  },
  beds: {
    title: "Beds & Wards",
    sub: "Real-time room and bed availability",
    fields: ["ward", "bedNumber", "type", "status"],
  },
  bills: {
    title: "Billing",
    sub: "Invoices and payment tracking",
    fields: ["patient", "status", "paymentMethod"],
  },
};

function Resource({ type }) {
  const c = configs[type];

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState([]);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({});

  const load = () => {
    api("/" + type)
      .then((data) => {
        setRows(data);
        setSelected([]);
      })
      .catch((e) => alert(e.message));
  };

  const loadPatients = () => {
    api("/patients")
      .then(setPatients)
      .catch((e) => console.error("Failed to load patients:", e));
  };

  const registerPatient = async (e) => {
    e.preventDefault();

    try {
      const patient = await api("/patients", {
        method: "POST",
        body: JSON.stringify(newPatientForm),
      });

      // Add the newly created patient to the dropdown
      setPatients((prev) => [...prev, patient]);

      // Automatically select the new patient
      setForm((prev) => ({
        ...prev,
        patient: patient._id,
      }));

      // Close patient registration modal
      setShowPatientForm(false);

      // Clear patient form
      setNewPatientForm({});

      alert("Patient registered successfully.");
    } catch (e) {
      alert(e.message);
    }
  };

  const loadDoctors = () => {
    api("/doctors")
      .then(setDoctors)
      .catch((e) => console.error("Failed to load doctors:", e));
  };

  useEffect(() => {
    load();

    if (
      ["appointments", "prescriptions", "lab-tests", "bills"].includes(type)
    ) {
      loadPatients();
    }

    if (["appointments", "prescriptions"].includes(type)) {
      loadDoctors();
    }
  }, [type]);

  // ==========================================
  // SEARCHED / FILTERED RECORDS
  // ==========================================

  const filteredRows = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
  );

  // ==========================================
  // SELECT ONE
  // ==========================================

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // ==========================================
  // SELECT ALL VISIBLE RECORDS
  // ==========================================

  const toggleSelectAll = () => {
    const visibleIds = filteredRows.map((r) => r._id);

    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

    if (allVisibleSelected) {
      // Remove visible records from selection
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Add visible records to selection
      setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // ==========================================
  // DELETE ONE
  // ==========================================

  const deleteOne = async (id) => {
    const record = rows.find((r) => r._id === id);

    const displayName =
      record?.name ||
      record?.patientId ||
      record?.testName ||
      record?.bedNumber ||
      "this record";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${displayName}?`,
    );

    if (!confirmed) return;

    try {
      await api("/" + type + "/" + id, {
        method: "DELETE",
      });

      alert("Record deleted successfully.");

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // DELETE SELECTED
  // ==========================================

  const deleteSelected = async () => {
    if (selected.length === 0) {
      alert("Please select at least one record.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected record(s)?`,
    );

    if (!confirmed) return;

    try {
      const result = await api("/" + type + "/bulk-delete", {
        method: "POST",
        body: JSON.stringify({
          ids: selected,
        }),
      });

      alert(result.message);

      setSelected([]);

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // CREATE RECORD
  // ==========================================

  const save = async (e) => {
    e.preventDefault();

    try {
      let body = { ...form };

      if (type === "bills") {
        body.items = [
          {
            description: "Hospital services",
            category: "General",
            amount: Number(form.amount || 0),
          },
        ];

        body.total = Number(form.amount || 0);
      }

      await api("/" + type, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setShow(false);
      setForm({});

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const visibleIds = filteredRows.map((r) => r._id);

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const renderInput = (f) => {
    // ============================
    // PATIENT DROPDOWN
    // ============================
    if (f === "patient") {
      return (
        <select
          value={form[f] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
          required
        >
          <option value="">Select patient</option>

          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.name}
              {patient.patientId ? ` (${patient.patientId})` : ""}
            </option>
          ))}
        </select>
      );
    }

    // ============================
    // DOCTOR DROPDOWN
    // ============================
    if (f === "doctor") {
      return (
        <select
          value={form[f] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
          required
        >
          <option value="">Select doctor</option>

          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name}
              {doctor.specialization ? ` - ${doctor.specialization}` : ""}
            </option>
          ))}
        </select>
      );
    }

    // ============================
    // APPOINTMENT STATUS
    // ============================
    if (type === "appointments" && f === "status") {
      return (
        <select
          value={form[f] || "scheduled"}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
        >
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      );
    }

    // ============================
    // PRESCRIPTION
    // ============================
    if (type === "prescriptions" && f === "instructions") {
      return (
        <textarea
          value={form[f] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
        />
      );
    }

    // ============================
    // LAB TEST STATUS
    // ============================
    if (type === "lab-tests" && f === "status") {
      return (
        <select
          value={form[f] || "ordered"}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
        >
          <option value="ordered">Ordered</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      );
    }

    // ============================
    // BED STATUS
    // ============================
    if (type === "beds" && f === "status") {
      return (
        <select
          value={form[f] || "available"}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      );
    }

    // ============================
    // BILL STATUS
    // ============================
    if (type === "bills" && f === "status") {
      return (
        <select
          value={form[f] || "pending"}
          onChange={(e) =>
            setForm({
              ...form,
              [f]: e.target.value,
            })
          }
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
        </select>
      );
    }

    // ============================
    // NORMAL INPUT
    // ============================
    return (
      <input
        type={
          f.toLowerCase().includes("date") || f === "dob"
            ? "date"
            : f === "email"
              ? "email"
              : f === "consultationFee" ||
                  f === "quantity" ||
                  f === "reorderLevel" ||
                  f === "unitPrice"
                ? "number"
                : "text"
        }
        value={form[f] || ""}
        onChange={(e) =>
          setForm({
            ...form,
            [f]: e.target.value,
          })
        }
      />
    );
  };

  return (
    <>
      <PageTitle
        title={c.title}
        sub={c.sub}
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            {selected.length > 0 && (
              <button className="delete-selected-btn" onClick={deleteSelected}>
                Delete Selected ({selected.length})
              </button>
            )}

            <button onClick={() => setShow(true)}>+ Add New</button>
          </div>
        }
      />

      {/* SEARCH */}
      <div className="toolbar">
        <div className="search local">
          <Search size={17} />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search records..."
          />
        </div>

        <span>
          {filteredRows.length} of {rows.length} records
        </span>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </th>

              {c.fields.slice(0, 6).map((f) => (
                <th key={f}>{f.replace(/([A-Z])/g, " $1")}</th>
              ))}

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r) => (
              <tr key={r._id}>
                {/* CHECKBOX */}
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(r._id)}
                    onChange={() => toggleSelect(r._id)}
                  />
                </td>

                {/* DATA */}
                {c.fields.slice(0, 6).map((f) => (
                  <td key={f}>
                    {typeof r[f] === "object" && r[f]
                      ? r[f].name || r[f].patientId || "Linked record"
                      : String(r[f] ?? "—")}
                  </td>
                ))}

                {/* ACTIONS */}
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteOne(r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={c.fields.slice(0, 6).length + 2} className="empty">
                  {q
                    ? "No records match your search."
                    : "No records yet. Use “Add New” to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {show && (
        <div className="modal">
          <form className="modal-card" onSubmit={save}>
            <div className="modal-head">
              <h2>Add {c.title.slice(0, -1)}</h2>

              <button type="button" onClick={() => setShow(false)}>
                ×
              </button>
            </div>

            {c.fields.map((f) => (
              <label key={f}>
                {f.replace(/([A-Z])/g, " $1")}

                {renderInput(f)}

                {type === "appointments" && f === "patient" && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowPatientForm(true)}
                  >
                    + Register New Patient
                  </button>
                )}
              </label>
            ))}

            {type === "bills" && (
              <label>
                amount
                <input
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                />
              </label>
            )}

            <button>Create Record</button>
          </form>
        </div>
      )}

      {showPatientForm && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-head">
              <h2>Register New Patient</h2>

              <button
                type="button"
                onClick={() => {
                  setShowPatientForm(false);
                  setNewPatientForm({});
                }}
              >
                ×
              </button>
            </div>

            <label>
              Name
              <input
                type="text"
                required
                value={newPatientForm.name || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Phone
              <input
                type="text"
                value={newPatientForm.phone || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    phone: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={newPatientForm.email || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    email: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Date of Birth
              <input
                type="date"
                value={newPatientForm.dob || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    dob: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Gender
              <select
                value={newPatientForm.gender || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    gender: e.target.value,
                  })
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Blood Group
              <select
                value={newPatientForm.bloodGroup || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    bloodGroup: e.target.value,
                  })
                }
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>

            <label>
              Address
              <input
                type="text"
                value={newPatientForm.address || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    address: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Emergency Contact
              <input
                type="text"
                value={newPatientForm.emergencyContact || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    emergencyContact: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Allergies
              <input
                type="text"
                value={newPatientForm.allergies || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    allergies: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Medical History
              <textarea
                value={newPatientForm.history || ""}
                onChange={(e) =>
                  setNewPatientForm({
                    ...newPatientForm,
                    history: e.target.value,
                  })
                }
              />
            </label>

            <button type="button" onClick={registerPatient}>
              Register Patient
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("his_token"));

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <Shell onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {Object.keys(configs).map((k) => (
          <Route key={k} path={"/" + k} element={<Resource type={k} />} />
        ))}
      </Routes>
    </Shell>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
