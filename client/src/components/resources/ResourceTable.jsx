function ResourceTable({
  c,
  filteredRows,
  selected,
  allVisibleSelected,
  toggleSelect,
  toggleSelectAll,
  deleteOne,
  q,
  canDelete,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
              />
            </th>

            {c.fields.slice(0, 6).map((f) => (
              <th key={f}>{f.replace(/([A-Z])/g, " $1")}</th>
            ))}

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((r) => (
            <tr key={r._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(r._id)}
                  onChange={() => toggleSelect(r._id)}
                />
              </td>

              {c.fields.slice(0, 6).map((f) => (
                <td key={f}>
                  {typeof r[f] === "object" && r[f]
                    ? r[f].name || r[f].patientId || "Linked record"
                    : String(r[f] ?? "—")}
                </td>
              ))}

              <td>
                {canDelete && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteOne(r._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}

          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={c.fields.slice(0, 6).length + 2} className="empty">
                {q
                  ? "No records match your search."
                  : "No records yet. Use “Add New” to create one."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ResourceTable;
