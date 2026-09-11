import { Activity } from "lucide-react";


function Quick({ title, items }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {items.map((x) => (
        <div className="quick" key={x}>
          <Activity size={16} />
          {x}
        </div>
      ))}
    </div>
  );
}


export default Quick;
