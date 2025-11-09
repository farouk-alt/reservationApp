import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import SalleModal from "./SalleModal";

export default function SallesList() {
  const [salles, setSalles] = useState([]);
  const [filteredSalles, setFilteredSalles] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    statut: "all",
  });
  const [sort, setSort] = useState({ field: "id", order: "asc" });
  const [, setMessage] = useState(null);
  const [, setError] = useState(null);
  const modalRef = useRef(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchSalles = async () => {
    try {
      const res = await axios.get("/salles");
      setSalles(res.data);
      setFilteredSalles(res.data);
    } catch {
      setError("❌ Impossible de charger les salles");
    }
  };

  useEffect(() => {
    fetchSalles();
  }, []);

  /** 🔍 Filtering + Search + Sorting */
  useEffect(() => {
    let data = [...salles];

    // 🔎 Search
    if (search.trim() !== "") {
      data = data.filter(
        (s) =>
          s.type.toLowerCase().includes(search.toLowerCase()) ||
          s.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🎯 Filters
    if (filters.type !== "all") data = data.filter((s) => s.type === filters.type);
    if (filters.statut !== "all") data = data.filter((s) => s.statut === filters.statut);

    // 🔽 Sorting
    data.sort((a, b) => {
      const field = sort.field;
      const order = sort.order === "asc" ? 1 : -1;
      if (typeof a[field] === "string") {
        return a[field].localeCompare(b[field]) * order;
      }
      return (a[field] - b[field]) * order;
    });

    setFilteredSalles(data);
    setPage(1); // reset to first page when filters/search change
  }, [salles, search, filters, sort]);

  /** 📦 CRUD */
  const handleSave = async (data, id = null) => {
    setMessage(null);
    setError(null);
    try {
      if (id) {
        await axios.put(`/salles/${id}`, data);
        setMessage("✅ Salle modifiée avec succès");
      } else {
        await axios.post("/salles", data);
        setMessage("✅ Salle ajoutée avec succès");
      }
      await fetchSalles();
    } catch {
      setError("⚠️ Erreur lors de l'enregistrement");
    }
  };

  const deleteSalle = async (id) => {
    if (!confirm("Supprimer cette salle ?")) return;
    try {
      await axios.delete(`/salles/${id}`);
      setMessage("🗑️ Salle supprimée");
      fetchSalles();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const editSalle = (salle) => modalRef.current.open(salle);
  const openAddModal = () => modalRef.current.open(null);

  /** 🔁 Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredSalles.length / pageSize));
  const paged = filteredSalles.slice((page - 1) * pageSize, page * pageSize);

  /** ⬆️⬇️ Sorting */
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

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
              Gestion des Salles
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
              ➕ Ajouter une salle
            </button>
          </div>

          {/* 🔎 Search + Filters */}
          <div
            className="d-flex flex-wrap align-items-center gap-3 mb-4"
            style={{
              background: "rgba(15,23,42,0.8)",
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(56,189,248,0.2)",
            }}
          >
            {/* 🔍 Search */}
            <input
              type="text"
              placeholder="🔍 Rechercher par type ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{
                maxWidth: "280px",
                background: "#0f172a",
                color: "#E2E8F0",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
              }}
            />
            {/* 🏷️ Type Filter */}
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
              style={{
                maxWidth: "200px",
                background: "#0f172a",
                color: "#E2E8F0",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
              }}
            >
              <option value="all">Tous les types</option>
              {[...new Set(salles.map((s) => s.type))].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* ⚙️ Statut Filter */}
            <select
              className="form-select"
              value={filters.statut}
              onChange={(e) =>
                setFilters((f) => ({ ...f, statut: e.target.value }))
              }
              style={{
                maxWidth: "180px",
                background: "#0f172a",
                color: "#E2E8F0",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "10px",
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>

            {/* 🔁 Reset */}
            <button
              className="btn btn-outline-info ms-auto"
              onClick={() => {
                setSearch("");
                setFilters({ type: "all", statut: "all" });
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

          {/* ⚙️ Table */}
          <div className="table-responsive mt-3">
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
                  {["id", "code", "type", "capacite", "statut"].map((field) => (
                    <th
                      key={field}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort(field)}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                      {sort.field === field &&
                        (sort.order === "asc" ? "▲" : "▼")}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.length > 0 ? (
                  paged.map((salle) => (
                    <tr key={salle.id}>
                      <td>{salle.id}</td>
                      <td>{salle.code}</td>
                      <td>{salle.type}</td>
                      <td>{salle.capacite}</td>
                      <td>
                        <span
                          className={`badge ${
                            salle.statut === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {salle.statut}
                        </span>
                      </td>
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
                          onClick={() => editSalle(salle)}
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
                          onClick={() => deleteSalle(salle.id)}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-light py-3">
                      Aucune salle trouvée.
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

      <SalleModal ref={modalRef} onSave={handleSave} />
    </div>
  );
}
