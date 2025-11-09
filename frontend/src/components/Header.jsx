import React from "react";
import logo from "../assets/logo.png";

export default function Header({ page, setPage }) {
  return (
    <header
      className="navbar navbar-expand-lg navbar-dark shadow-sm fixed-top"
      style={{
        background: "rgba(15, 23, 42, 0.8)", // bleu foncé semi-transparent
        backdropFilter: "blur(10px)", // effet verre dépoli
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "0.3rem",
        paddingBottom: "0.3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1030,
      }}
    >
      <div className="container-fluid px-4 d-flex align-items-center">
        {/* 🏷️ Logo + clic vers Accueil */}
        <a
          className="navbar-brand d-flex align-items-center"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
          style={{ padding: 0, margin: 0 }}
        >
          <img
            src={logo}
            alt="ReservationApp Logo"
            width="100"
            height="100"
            className="me-2"
            style={{
              objectFit: "contain",
              marginTop: "-10px",
              marginBottom: "-10px",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
            }}
          />
        </a>

        {/* 📋 Bouton hamburger mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 🔗 Liens */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarContent"
        >
          <ul className="navbar-nav align-items-center mb-0">
            <li className="nav-item me-2">
              <button
                className={`btn btn-link nav-link ${
                  page === "home" ? "fw-bold text-warning" : "text-light"
                }`}
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.95rem" }}
                onClick={() => setPage("home")}
              >
                Accueil
              </button>
            </li>
            {/* <li className="nav-item me-2">
              <button
                className={`btn btn-link nav-link ${
                  page === "adminSalle" ? "fw-bold text-warning" : "text-light"
                }`}
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.95rem" }}
                onClick={() => setPage("adminSalle")}
              >
                Admin - Salles
              </button>
            </li>
            <li className="nav-item me-2">
              <button
                className={`btn btn-link nav-link ${
                  page === "adminEmploye" ? "fw-bold text-warning" : "text-light"
                }`}
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.95rem" }}
                onClick={() => setPage("adminEmploye")}
              >
                Admin - Employés
              </button>
            </li> */}
            <li className="nav-item me-2">
              <button
                className={`btn btn-link nav-link ${
                  page === "admin" ? "fw-bold text-warning" : "text-light"
                }`}
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.95rem" }}
                onClick={() => setPage("admin")}
              >
                Admin Dashboard
              </button>
            </li>
            <li className="nav-item me-2">
              <button
                className={`btn btn-link nav-link ${
                  page === "emp" ? "fw-bold text-warning" : "text-light"
                }`}
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.95rem" }}
                onClick={() => setPage("emp")}
              >
                EmployeDashbaord
              </button>
            </li>
            <li className="nav-item d-flex align-items-center">
              <button
                className="btn btn-outline-light me-2"
                style={{
                  padding: "0.3rem 0.9rem",
                  fontSize: "0.9rem",
                  borderRadius: "20px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                Se connecter
              </button>
              <button
                className="btn fw-semibold text-dark"
                style={{
                  background:
                    "linear-gradient(145deg, #FFD43B, #FACC15, #EAB308)",
                  padding: "0.35rem 0.9rem",
                  fontSize: "0.9rem",
                  borderRadius: "20px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  border: "none",
                }}
              >
                S'inscrire
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
