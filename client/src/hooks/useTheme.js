import { useEffect, useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem("his_theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("his_theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
  };
}

export default useTheme;