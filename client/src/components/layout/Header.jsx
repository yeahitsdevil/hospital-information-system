import { Bell, Menu, Search, X } from "lucide-react";

function Header({
  open,
  setOpen,
  search,
  setSearch,
  searchResults,
  setSearchResults,
  showSearchResults,
  setShowSearchResults,
  openSearchResult,
  notifications,
  showNotifications,
  setShowNotifications,
  loadNotifications,
  notificationCount,
  nav,
  theme,
  setTheme,
  user,
}) {
  return (
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
                        ? new Date(
                            medicine.expiryDate,
                          ).toLocaleDateString()
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
        onClick={() =>
          setTheme(theme === "light" ? "dark" : "light")
        }
        title={
          theme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* USER AVATAR */}
      <div className="top-avatar">{user.name?.[0] || "A"}</div>
    </header>
  );
}

export default Header;