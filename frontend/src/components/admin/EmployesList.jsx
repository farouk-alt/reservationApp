import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import EmployeModal from "./EmployeModal";

export default function EmployesList() {
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    departement: "all",
  });
  const [sort, setSort] = useState({ field: "id", order: "asc" });
  const [, setMessage] = useState(null);
  const [, setError] = useState(null);
  const modalRef = useRef(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // 🔄 Fetch
  const fetchEmployes = async () => {
    try {
      const res = await axios.get("/employes");
      setEmployes(res.data);
      setFilteredEmployes(res.data);
    } catch {
      setError("❌ Impossible de charger les employés");
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, []);

  // 🔍 Filter + Search + Sort
  useEffect(() => {
    let data = [...employes];

    // 🔎 Search by nom, prenom, username, or email
    if (search.trim() !== "") {
      data = data.filter(
        (e) =>
          e.nom.toLowerCase().includes(search.toLowerCase()) ||
          e.prenom.toLowerCase().includes(search.toLowerCase()) ||
          e.username.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🧩 Filter by département
    if (filters.departement !== "all") {
      data = data.filter((e) => e.departement === filters.departement);
    }

    // ⬆️⬇️ Sort
    data.sort((a, b) => {
      const { field, order } = sort;
      const dir = order === "asc" ? 1 : -1;
      if (typeof a[field] === "string") {
        return a[field].localeCompare(b[field]) * dir;
      }
      return (a[field] - b[field]) * dir;
    });

    setFilteredEmployes(data);
    setPage(1);
  }, [employes, search, filters, sort]);

  // 🧭 Sorting toggle
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // CRUD
  const handleSave = async (data, id = null) => {
    setMessage(null);
    setError(null);
    try {
      if (id) {
        await axios.put(`/employes/${id}`, data);
        setMessage("✅ Employé modifié avec succès");
      } else {
        await axios.post("/employes", data);
        setMessage("✅ Employé ajouté avec succès");
      }
      await fetchEmployes();
    } catch {
      setError("⚠️ Erreur lors de l'enregistrement");
    }
  };

  const deleteEmploye = async (id) => {
    if (!confirm("Supprimer cet employé ?")) return;
    try {
      await axios.delete(`/employes/${id}`);
      setMessage("🗑️ Employé supprimé");
      fetchEmployes();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const editEmploye = (emp) => modalRef.current.open(emp);
  const openAddModal = () => modalRef.current.open(null);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEmployes.length / pageSize));
  const paged = filteredEmployes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div
      className="py-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        color: "#E2E8F0",
      }}
    >
      <div className="container">
        <div
          className="p-4 rounded-4 shadow-lg mb-4 border border-primary-subtle"
          style={{
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          {/* 🔹 Header */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <h2
              className="fw-bold mb-0"
              style={{
                color: "#38BDF8",
                textShadow: "0 2px 6px rgba(56,189,248,0.3)",
              }}
            >
              Gestion des Employés
            </h2>
            <button
              className="btn fw-semibold"
              style={{
                background: "linear-gradient(145deg, #38BDF8, #2563EB)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "0.5rem 1.3rem",
              }}
              onClick={openAddModal}
            >
              ➕ Ajouter un employé
            </button>
          </div>

          {/* 🔍 Search + Filter */}
          <div
            className="d-flex flex-wrap align-items-center gap-3 mb-4"
            style={{
              background: "rgba(15,23,42,0.8)",
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(56,189,248,0.2)",
            }}
          >
            {/* 🔎 Search */}
            <input
              type="text"
              placeholder="🔍 Rechercher (nom, prénom, email, username...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{
                maxWidth: "300px",
                background: "#0f172a",
                color: "#E2E8F0",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
              }}
            />

            {/* 🧩 Département Filter */}
            <select
              className="form-select"
              value={filters.departement}
              onChange={(e) =>
                setFilters((f) => ({ ...f, departement: e.target.value }))
              }
              style={{
                maxWidth: "200px",
                background: "#0f172a",
                color: "#E2E8F0",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
              }}
            >
              <option value="all">Tous les départements</option>
              {[...new Set(employes.map((e) => e.departement))].map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            {/* 🔁 Reset */}
            <button
              className="btn btn-outline-info ms-auto"
              onClick={() => {
                setSearch("");
                setFilters({ departement: "all" });
                setSort({ field: "id", order: "asc" });
              }}
              style={{
                borderRadius: "10px",
                borderColor: "rgba(56,189,248,0.5)",
              }}
            >
              Réinitialiser
            </button>
          </div>

          {/* 🧾 Table */}
          <div className="table-responsive mt-4">
            <table
              className="table table-borderless align-middle text-center"
              style={{ color: "#E2E8F0" }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg, #1E3A8A 0%, #1E40AF 100%)",
                    color: "#E0F2FE",
                    fontWeight: "600",
                  }}
                >
                  {["id", "nom", "prenom", "departement", "username", "email"].map(
                    (field) => (
                      <th
                        key={field}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSort(field)}
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                        {sort.field === field &&
                          (sort.order === "asc" ? "▲" : "▼")}
                      </th>
                    )
                  )}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.length > 0 ? (
                  paged.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.nom}</td>
                      <td>{emp.prenom}</td>
                      <td>{emp.departement}</td>
                      <td>{emp.username}</td>
                      <td>{emp.email}</td>
                      <td>
                        <button
                          className="btn btn-sm me-2"
                          style={{
                            background:
                              "linear-gradient(145deg, #38BDF8, #2563EB)",
                            color: "white",
                            borderRadius: "10px",
                            padding: "4px 10px",
                          }}
                          onClick={() => editEmploye(emp)}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{
                            background:
                              "linear-gradient(145deg, #F87171, #DC2626)",
                            color: "white",
                            borderRadius: "10px",
                            padding: "4px 10px",
                          }}
                          onClick={() => deleteEmploye(emp.id)}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-light py-3">
                      Aucun employé trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link bg-dark text-light border-0"
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  ◀
                </button>
              </li>
              {Array.from({ length: totalPages }).map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${page === i + 1 ? "active" : ""}`}
                >
                  <button
                    className={`page-link ${
                      page === i + 1
                        ? "bg-warning text-dark border-0 fw-bold"
                        : "bg-dark text-light border-0"
                    }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  page === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link bg-dark text-light border-0"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  ▶
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <EmployeModal ref={modalRef} onSave={handleSave} />
    </div>
  );
}
