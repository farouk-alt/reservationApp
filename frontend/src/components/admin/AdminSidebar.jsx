import React from "react";
import { motion as Motion } from "framer-motion";

export default function AdminSidebar({ active, setActive, collapsed, setCollapsed }) {
  // Admin-specific menu items (can be changed later)
  const menuItems = [
    { key: "stats", label: "Statistiques", icon: "📊" },
    { key: "salles", label: "Salles", icon: "🏢" },
    { key: "employes", label: "Employés", icon: "👥" },
    { key: "profile", label: "Profil", icon: "👤" },
  ];

  return (
    <Motion.div
      animate={{ width: collapsed ? "80px" : "230px" }}
      transition={{ duration: 0.3, type: "spring" }}
      className="d-flex flex-column py-3 position-fixed"
      style={{
        height: "100vh",
        top: "90px",
        left: 0,
        background: "rgba(15,23,42,0.97)",
        borderRight: "1px solid rgba(56,189,248,0.25)",
        backdropFilter: "blur(10px)",
        color: "#E2E8F0",
        boxShadow: "4px 0 15px rgba(0,0,0,0.4)",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Header / Collapse Button */}
      <div
        className="d-flex align-items-center justify-content-between px-3 mb-4"
        style={{ height: "45px" }}
      >
        {!collapsed && (
          <span
            className="fw-bold"
            style={{ fontSize: "1rem", color: "#E2E8F0" }}
          >
            Admin Panel
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-sm text-light p-1"
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.3rem",
            transition: "transform 0.3s",
          }}
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Menu */}
      <ul className="nav flex-column px-2" style={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <li key={item.key} className="nav-item mb-2 d-flex align-items-center">
            <button
              onClick={() => setActive(item.key)}
              className={`btn w-100 d-flex align-items-center ${
                active === item.key
                  ? "text-warning fw-bold"
                  : "text-light fw-semibold"
              }`}
              style={{
                border: "none",
                background: "transparent",
                borderRadius: "10px",
                padding: "10px 15px",
                transition: "all 0.25s ease-in-out",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(56,189,248,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  fontSize: "1.3rem",
                  marginRight: collapsed ? 0 : "12px",
                }}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto text-center pb-3">
        <button
          className="btn btn-outline-light btn-sm mb-2"
          style={{
            borderRadius: "10px",
            borderColor: "rgba(56,189,248,0.4)",
            width: collapsed ? "40px" : "80%",
            transition: "all 0.3s ease",
          }}
          title="Déconnexion"
        >
          🚪
          {!collapsed && <span className="ms-2">Déconnexion</span>}
        </button>
        {!collapsed && (
          <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>
            © 2025 ReservationApp
          </small>
        )}
      </div>
    </Motion.div>
  );
}
