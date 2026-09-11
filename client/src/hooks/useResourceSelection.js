import { useState } from "react";

function useResourceSelection(filteredRows) {
  const [selected, setSelected] = useState([]);

  const visibleIds = filteredRows.map((r) => r._id);

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selected.includes(id));

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      // Remove visible records from selection
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Add visible records to selection
      setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  return {
    selected,
    setSelected,
    visibleIds,
    allVisibleSelected,
    toggleSelect,
    toggleSelectAll,
  };
}

export default useResourceSelection;