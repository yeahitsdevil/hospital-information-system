import PageTitle from "../common/PageTitle";
import Quick from "./Quick";
import useDashboardData from "../../hooks/useDashboardData";

function Dashboard() {
  const d = useDashboardData();

  const cards = [
    ["Total Patients", d.patients || 0, "Registered patient records"],
    ["Doctors", d.doctors || 0, "Active doctor profiles"],
    ["Appointments", d.appointments || 0, "Scheduled appointments"],
    ["Available Beds", d.availableBeds || 0, "Beds currently available"],
    ["Low Stock", d.lowStock || 0, "Medicines below reorder level"],
    [
      "Billed Revenue",
      `₹${(d.revenue || 0).toLocaleString()}`,
      "Total recorded billing",
    ],
  ];

  return (
    <>
      <PageTitle
        title="Hospital Dashboard"
        sub="Overview of clinical, administrative and financial operations"
      />

      <div className="cards">
        {cards.map((c, i) => (
          <div className="card" key={i}>
            <small>{c[0]}</small>
            <strong>{c[1]}</strong>
            <span>{c[2]}</span>
          </div>
        ))}
      </div>

      <div className="grid2">
        <Quick
          title="Patient Administration"
          items={["Register new patient"]}
        />

        <Quick
          title="Clinical Operations"
          items={[
            "Schedule appointments",
            "Create prescriptions",
            "Order laboratory tests",
          ]}
        />

        <Quick
          title="Resources"
          items={[
            "Check bed availability",
            "Monitor pharmacy stock",
            "Assign staff workload",
          ]}
        />

        <Quick
          title="Finance"
          items={[
            "Generate invoices",
            "Track payments",
            "Review billing records",
          ]}
        />
      </div>
    </>
  );
}

export default Dashboard;