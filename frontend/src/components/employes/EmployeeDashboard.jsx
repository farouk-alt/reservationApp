import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import EmployeeSidebar from "./EmployeeSidebar";
import SalleCard from "./SalleCard";
import Profile from "./Profile";
import Reservations from "./Reservations";
import Stats from "./Stats";

export default function EmployeeDashboard() {
  const [active, setActive] = useState("salles");
  const [collapsed, setCollapsed] = useState(false);
  const [salles, setSalles] = useState([]);
  const [filteredSalles, setFilteredSalles] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    statut: "all",
    capacite: "all",
    type: "all",
  });

  useEffect(() => {
    if (active === "salles") fetchSalles();
  }, [active]);

  const fetchSalles = async () => {
    try {
      const res = await axios.get("/salles");
      setSalles(res.data);
      setFilteredSalles(res.data);
    } catch {
      console.error("❌ Erreur lors du chargement des salles");
    }
  };

  /** 🔎 Apply all filters and search */
  useEffect(() => {
    let data = [...salles];

    // Filter by search text
    if (search.trim() !== "") {
      data = data.filter(
        (s) =>
          s.type.toLowerCase().includes(search.toLowerCase()) ||
          (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by statut
    if (filters.statut !== "all") {
      data = data.filter((s) => s.statut === filters.statut);
    }

    // Filter by capacité
    if (filters.capacite !== "all") {
      if (filters.capacite === "small")
        data = data.filter((s) => s.capacite <= 20);
      if (filters.capacite === "medium")
        data = data.filter((s) => s.capacite > 20 && s.capacite <= 40);
      if (filters.capacite === "large")
        data = data.filter((s) => s.capacite > 40);
    }

    // Filter by type
    if (filters.type !== "all") {
      data = data.filter((s) => s.type === filters.type);
    }

    setFilteredSalles(data);
  }, [search, filters, salles]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        color: "#E2E8F0",
        width: "99vw",
        overflowX: "hidden",
        display: "flex",
      }}
    >
      {/* 🧭 Sidebar */}
      <EmployeeSidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* 🧱 Main Content */}
      <div
        className="container-fluid"
        style={{
          marginLeft: collapsed ? "80px" : "230px",
          transition: "margin-left 0.3s ease",
          padding: "30px 20px",
          width: collapsed ? "calc(100vw - 80px)" : "calc(100vw - 230px)",
          overflowX: "hidden",
        }}
      >
        {active === "salles" && (
          <>
            <h3
              className="fw-bold mb-4"
              style={{
                color: "#38BDF8",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              🏢 Salles Disponibles
            </h3>

            {/* 🔍 Search & Filters */}
            <div
              className="d-flex flex-wrap align-items-center mb-4 gap-3"
              style={{
                background: "rgba(30,41,59,0.8)",
                padding: "15px 20px",
                borderRadius: "15px",
                border: "1px solid rgba(56,189,248,0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {/* 🔎 Search */}
              <input
                type="text"
                placeholder="🔍 Rechercher une salle (nom, code...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control search-input"
                style={{
                  maxWidth: "300px",
                  background: "#0f172a",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
              />

              <style>
                {`
                    .search-input::placeholder {
                    color: #E2E8F0 !important; /* bright light gray-blue */
                    opacity: 1 !important;
                    }
                    .search-input:-ms-input-placeholder { /* IE 10+ */
                    color: #E2E8F0 !important;
                    }
                    .search-input::-ms-input-placeholder { /* Edge */
                    color: #E2E8F0 !important;
                    }
                `}
              </style>

              {/* ⚙️ Statut */}
              <select
                className="form-select"
                value={filters.statut}
                onChange={(e) => handleFilterChange("statut", e.target.value)}
                style={{
                  maxWidth: "150px",
                  background: "#0f172a",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px",
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>

              {/* 🧩 Capacité */}
              <select
                className="form-select"
                value={filters.capacite}
                onChange={(e) => handleFilterChange("capacite", e.target.value)}
                style={{
                  maxWidth: "150px",
                  background: "#0f172a",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px",
                }}
              >
                <option value="all">Toutes capacités</option>
                <option value="small">≤ 20 places</option>
                <option value="medium">21 à 40</option>
                <option value="large">{">"} 40</option>
              </select>

              {/* 🏷️ Type */}
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                style={{
                  maxWidth: "180px",
                  background: "#0f172a",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px",
                }}
              >
                <option value="all">Tous types</option>
                {[...new Set(salles.map((s) => s.type))].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* 🔁 Reset Filters */}
              <button
                className="btn btn-outline-info ms-auto"
                onClick={() => {
                  setSearch("");
                  setFilters({ statut: "all", capacite: "all", type: "all" });
                }}
                style={{
                  borderRadius: "10px",
                  borderColor: "rgba(56,189,248,0.5)",
                }}
              >
                Réinitialiser
              </button>
            </div>

            {/* ✅ Grid Layout - 4 Cards Per Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
                justifyContent: "center",
                justifyItems: "center",
                alignItems: "start",
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
              }}
            >
              {filteredSalles.length > 0 ? (
                filteredSalles.map((salle) => (
                  <SalleCard key={salle.id} salle={salle} />
                ))
              ) : (
                <p className="text-center mt-4 text-light">
                  Aucune salle ne correspond à votre recherche.
                </p>
              )}
            </div>
          </>
        )}

        {active === "reservations" && <Reservations />}
        {active === "profile" && <Profile />}
        {active === "stats" && <Stats />}
      </div>
    </div>
  );
}
