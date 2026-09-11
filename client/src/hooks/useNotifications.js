import { useEffect, useState } from "react";
import { api } from "../lib/api";

function useNotifications() {
  const [notifications, setNotifications] = useState({
    lowStock: [],
    expiring: [],
  });

  const [showNotifications, setShowNotifications] = useState(false);

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

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    loadNotifications,
    notificationCount,
  };
}

export default useNotifications;