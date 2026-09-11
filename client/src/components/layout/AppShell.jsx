import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

import useTheme from "../../hooks/useTheme";
import useGlobalSearch from "../../hooks/useGlobalSearch";
import useNotifications from "../../hooks/useNotifications";

function AppShell({ children, onLogout }) {
  const [open, setOpen] = useState(false);

  const {
    search,
    setSearch,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    openSearchResult,
  } = useGlobalSearch();

  const { theme, setTheme } = useTheme();

  const {
    notifications,
    showNotifications,
    setShowNotifications,
    loadNotifications,
    notificationCount,
  } = useNotifications();

  const user = JSON.parse(localStorage.getItem("his_user") || "{}");

  const nav = useNavigate();

  return (
    <div className="app">
      <Sidebar
        open={open}
        setOpen={setOpen}
        user={user}
        onLogout={onLogout}
      />

      <main>
        <Header
          open={open}
          setOpen={setOpen}
          search={search}
          setSearch={setSearch}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          openSearchResult={openSearchResult}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          loadNotifications={loadNotifications}
          notificationCount={notificationCount}
          nav={nav}
          theme={theme}
          setTheme={setTheme}
          user={user}
        />

        <section className="content">{children}</section>
      </main>
    </div>
  );
}

export default AppShell;