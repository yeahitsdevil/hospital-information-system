import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import DashboardPage from "../pages/DashboardPage";
import ResourcePage from "../pages/ResourcePage";
import AppShell from "../components/layout/AppShell";

import { configs } from "../config/resourceConfig";

function AppRoutes() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("his_token"),
  );

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
    <AppShell onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        {Object.keys(configs).map((k) => (
          <Route
            key={k}
            path={"/" + k}
            element={<ResourcePage type={k} />}
          />
        ))}
      </Routes>
    </AppShell>
  );
}

export default AppRoutes;