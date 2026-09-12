import PageTitle from "../common/PageTitle";

function ResourceHeader({
  c,
  setShow,
  deleteSelected,
  canCreate,
  canDelete,
}) {
  return (
    <PageTitle
      title={c.title}
      action={
        <div className="page-actions">
          {canCreate && (
            <button onClick={() => setShow(true)}>+ Add New</button>
          )}

          {canDelete && (
            <button className="delete-btn" onClick={deleteSelected}>
              Delete Selected
            </button>
          )}
        </div>
      }
    />
  );
}

export default ResourceHeader;