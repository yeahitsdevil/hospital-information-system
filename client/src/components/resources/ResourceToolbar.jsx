import { Search } from "lucide-react";

function ResourceToolbar({
  q,
  setQ,
  filteredRows,
  rows,
}) {
  return (
    <div className="toolbar">
      <div className="search local">
        <Search size={17} />

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search records..."
        />
      </div>

      <span>
        {filteredRows.length} of {rows.length} records
      </span>
    </div>
  );
}

export default ResourceToolbar;