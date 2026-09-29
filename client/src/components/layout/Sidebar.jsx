import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import navItems from "../../config/navigation";

function Sidebar({ open, setOpen, user, onLogout }) {
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <aside className={open ? "open" : ""}>
      <div className="logo">
        <span>+</span>

        <div>
          <b>MANIT — HIS</b>
          <small>Digital Health System</small>
        </div>
      </div>

      <nav>
        {navItems
          .filter(([, , , allowedRoles]) => allowedRoles.includes(user.role))
          .map(([to, label, Icon]) => (
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
        <Link
          to="/profile"
          className="user-mini user-mini-link"
          onClick={() => setOpen(false)}
          title="Manage My Profile & Availability"
        >
          <div className="avatar-wrapper">
            <div className="avatar">{user.name?.[0] || "A"}</div>
            <span
              className={`sidebar-status-dot ${user.is_available !== false ? "dot-online" : "dot-offline"}`}
              title={user.is_available !== false ? "Status: Available" : "Status: Not Available"}
            />
          </div>

          <div>
            <b>{user.name || "User"}</b>
            <small>
              {user.role || "patient"} • {user.is_available !== false ? "Available" : "Away"}
            </small>
          </div>
        </Link>

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
  );
}

export default Sidebar;
