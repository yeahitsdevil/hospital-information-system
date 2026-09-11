import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function useGlobalSearch() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const nav = useNavigate();

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

  const openSearchResult = (result) => {
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);

    nav(result.route);
  };

  return {
    search,
    setSearch,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    openSearchResult,
  };
}

export default useGlobalSearch;