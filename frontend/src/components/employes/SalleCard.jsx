import React from "react";

export default function SalleCard({ salle, onReserve }) {
  const colors = {
    active: "linear-gradient(145deg, #38BDF8, #2563EB)",
    inactive: "linear-gradient(145deg, #64748B, #475569)",
  };

  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        background: "rgba(30,41,59,0.9)",
        borderRadius: "18px",
        color: "#E2E8F0",
        border: "1px solid rgba(56,189,248,0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        width: "100%",
        maxWidth: "100%",
        minHeight: "220px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(56,189,248,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
      }}
    >
      <div className="card-body d-flex flex-column justify-content-between">
        {/* 🏷️ Header */}
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5
              className="card-title fw-bold mb-0"
              style={{ color: "#F1F5F9" }}
            >
              {salle.type}
            </h5>

            {/* Code + Statut group */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded text-light"
                style={{
                  background: "rgba(56,189,248,0.15)",
                  color: "#38BDF8",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.6rem",
                  lineHeight: 1,
                }}
              >
                {salle.code}
              </span>

              <span
                className="rounded text-uppercase"
                style={{
                  background:
                    salle.statut === "active"
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color: salle.statut === "active" ? "#4ADE80" : "#F87171",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.6rem",
                  lineHeight: 1,
                }}
              >
                {salle.statut}
              </span>
            </div>
          </div>

          {/* 👥 Capacity Info */}
          <p className="card-text mb-2">
            <i className="bi bi-people-fill me-1 text-info"></i>
            Capacité: <strong>{salle.capacite}</strong>
          </p>

          {/* 📄 Description */}
          <p
            className="small mb-0"
            style={{
              lineHeight: "1.4",
              color: "rgba(255,255,255,0.9)", // bright white with slight softness
            }}
          >
            Une salle {salle.statut === "active" ? "disponible" : "occupée"}{" "}
            pour vos réunions et projets.
          </p>
        </div>

        {/* 🔘 Reserve Button */}
        <button
          className="btn w-100 mt-3 fw-semibold"
          style={{
            background:
              salle.statut === "active" ? colors.active : colors.inactive,
            color: "white",
            borderRadius: "12px",
            padding: "0.6rem 1rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.filter = "brightness(1.15)";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.target.style.filter = "brightness(1)";
            e.target.style.transform = "scale(1)";
          }}
          disabled={salle.statut !== "active"}
          onClick={() => onReserve?.(salle)}
        >
          {salle.statut === "active" ? "Réserver" : "Indisponible"}
        </button>
      </div>
    </div>
  );
}
