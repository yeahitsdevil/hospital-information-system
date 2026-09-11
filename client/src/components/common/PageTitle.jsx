function PageTitle({ title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}


export default PageTitle;