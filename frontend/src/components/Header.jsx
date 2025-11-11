import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header({ user, onLogout }) {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  return (
    <header
      className="navbar navbar-expand-lg navbar-dark shadow-sm fixed-top"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "0.3rem",
        paddingBottom: "0.3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1030,
      }}
    >
      <div className="container-fluid px-4 d-flex align-items-center">
        {/* 🏷️ Logo — clickable to home */}
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/"
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
        </Link>

        {/* 📋 Mobile toggle */}
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

        {/* 🔗 Navigation links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarContent"
        >
          <ul className="navbar-nav align-items-center mb-0">
            {/* Always visible */}
            <li className="nav-item me-2">
              <Link
                className="btn btn-link nav-link text-light"
                to="/"
                style={{ fontSize: "0.95rem" }}
              >
                Accueil
              </Link>
            </li>

            {/* If connected */}
            {user && (
              <>
                {role === "admin" && (
                  <li className="nav-item me-2">
                    <Link
                      className="btn btn-link nav-link text-light"
                      to="/admin"
                      style={{ fontSize: "0.95rem" }}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                {role === "employe" && (
                  <li className="nav-item me-2">
                    <Link
                      className="btn btn-link nav-link text-light"
                      to="/employe"
                      style={{ fontSize: "0.95rem" }}
                    >
                      Tableau Employé
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    onClick={() => {
                      onLogout();
                      navigate("/login");
                    }}
                    className="btn btn-outline-danger ms-2"
                    style={{
                      padding: "0.3rem 0.9rem",
                      borderRadius: "20px",
                    }}
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            )}

            {/* If not connected */}
            {!user && (
              <li className="nav-item d-flex align-items-center">
                <Link
                  to="/login"
                  className="btn btn-outline-light me-2"
                  style={{
                    padding: "0.3rem 0.9rem",
                    fontSize: "0.9rem",
                    borderRadius: "20px",
                    textDecoration: "none",
                    color: "white",
                  }}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="btn fw-semibold text-dark"
                  style={{
                    background:
                      "linear-gradient(145deg, #FFD43B, #FACC15, #EAB308)",
                    padding: "0.35rem 0.9rem",
                    fontSize: "0.9rem",
                    borderRadius: "20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    border: "none",
                    textDecoration: "none",
                    color: "black",
                  }}
                >
                  S'inscrire
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
