import { api } from "../lib/api";

function useResourceCrud({
  type,
  rows,
  selected,
  setSelected,
  form,
  setShow,
  setForm,
  load,
}) {
  const deleteOne = async (id) => {
    const record = rows.find((r) => r._id === id);

    const displayName =
      record?.name ||
      record?.patientId ||
      record?.testName ||
      record?.bedNumber ||
      "this record";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${displayName}?`,
    );

    if (!confirmed) return;

    try {
      await api("/" + type + "/" + id, {
        method: "DELETE",
      });

      alert("Record deleted successfully.");

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteSelected = async () => {
    if (selected.length === 0) {
      alert("Please select at least one record.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected record(s)?`,
    );

    if (!confirmed) return;

    try {
      const result = await api("/" + type + "/bulk-delete", {
        method: "POST",
        body: JSON.stringify({
          ids: selected,
        }),
      });

      alert(result.message);

      setSelected([]);

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      let body = { ...form };

      if (type === "bills") {
        body.items = [
          {
            description: "Hospital services",
            category: "General",
            amount: Number(form.amount || 0),
          },
        ];

        body.total = Number(form.amount || 0);
      }

      await api("/" + type, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setShow(false);
      setForm({});

      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return {
    deleteOne,
    deleteSelected,
    save,
  };
}

export default useResourceCrud;