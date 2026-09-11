import PageTitle from "../common/PageTitle";

function ResourceHeader({ c, setShow, deleteSelected }) {
  return (
    <PageTitle
      title={c.title}
      action={
        <div className="page-actions">
          <button onClick={() => setShow(true)}>+ Add New</button>

          <button className="delete-btn" onClick={deleteSelected}>
            Delete Selected
          </button>
        </div>
      }
    />
  );
}

export default ResourceHeader;