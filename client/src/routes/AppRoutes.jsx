import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import ResourcePage from "../pages/ResourcePage";
import AppShell from "../components/layout/AppShell";

import { configs } from "../config/resourceConfig";
import navItems from "../config/navigation";

function AppRoutes() {
  const [token, setToken] = useState(() => localStorage.getItem("his_token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("his_user")) || {};
    } catch {
      return {};
    }
  });

  const handleLogin = (newToken) => {
    setToken(newToken);

    try {
      setUser(JSON.parse(localStorage.getItem("his_user")) || {});
    } catch {
      setUser({});
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser({});
  };

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <AppShell onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        {Object.keys(configs).map((k) => {
          const navItem = navItems.find(([path]) => path === `/${k}`);

          const allowedRoles = navItem?.[3] || [];

          if (!allowedRoles.includes(user.role)) {
            return (
              <Route
                key={k}
                path={"/" + k}
                element={<Navigate to="/" replace />}
              />
            );
          }

          return (
            <Route key={k} path={"/" + k} element={<ResourcePage type={k} />} />
          );
        })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default AppRoutes;
