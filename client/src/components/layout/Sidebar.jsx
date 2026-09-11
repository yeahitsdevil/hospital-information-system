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
  );
}

export default Sidebar;