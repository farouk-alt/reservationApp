import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function AdminStats() {
  const [stats, setStats] = useState({
    salles: 0,
    employes: 0,
    reservations: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/admin/stats");
      setStats(res.data);
    } catch {
      console.error("Erreur lors du chargement des statistiques");
    }
  };

  const cardStyle = {
    background: "rgba(30,41,59,0.95)",
    borderRadius: "15px",
    border: "1px solid rgba(56,189,248,0.2)",
    padding: "25px",
    textAlign: "center",
    color: "#E2E8F0",
    boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
  };

  return (
    <div>
      <h3
        className="fw-bold mb-4"
        style={{ color: "#38BDF8", letterSpacing: "0.5px" }}
      >
        📊 Tableau de bord des statistiques
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h4>🏢 Salles</h4>
          <h2 style={{ color: "#38BDF8" }}>{stats.salles}</h2>
        </div>

        <div style={cardStyle}>
          <h4>👥 Employés</h4>
          <h2 style={{ color: "#4ADE80" }}>{stats.employes}</h2>
        </div>

        <div style={cardStyle}>
          <h4>📅 Réservations</h4>
          <h2 style={{ color: "#FACC15" }}>{stats.reservations}</h2>
        </div>
      </div>
    </div>
  );
}
