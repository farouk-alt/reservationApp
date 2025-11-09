import React from "react";
import logo from "../assets/logo.png";
export default function Accueil() {
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background: "linear-gradient(145deg, #0f172a, #1e293b)",
        color: "#E2E8F0",
      }}
    >
      {/* 🏠 Hero Section */}
      <section
        className="flex-grow-1 d-flex align-items-center justify-content-center text-center"
        style={{
          background:
            "linear-gradient(120deg, #2563eb 0%, #1e40af 50%, #0f172a 100%)",
          color: "white",
          padding: "5rem 1rem",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
         <img
                     src={logo}
                     alt="ReservationApp Logo"
                     width="200"
                     height="200"
                     className="me-2"
                     style={{
                       objectFit: "contain",
                       marginTop: "-10px",
                       marginBottom: "-10px",
                       filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
                     }}
                   />
          <h1
            className="fw-bold mb-3 display-5"
            style={{
              textShadow: "0 3px 8px rgba(0,0,0,0.4)",
              letterSpacing: "1px",
            }}
          >
            Gérez vos{" "}
            <span style={{ color: "#FFD43B" }}>Salles</span> et{" "}
            <span style={{ color: "#38BDF8" }}>Réservations</span> facilement
          </h1>
          <p className="lead mb-4">
            Une application intuitive pour les administrateurs et employés,
            permettant de planifier, gérer et visualiser les espaces en temps
            réel.
          </p>
          <a
            href="#features"
            className="btn px-5 py-2 fw-semibold"
            style={{
              background:
                "linear-gradient(145deg, #FFD43B, #FACC15, #EAB308)",
              border: "none",
              borderRadius: "25px",
              color: "#1E293B",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            Commencer maintenant
          </a>
        </div>
      </section>

      {/* 📦 Features */}
      <section id="features" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-light">Fonctionnalités principales</h2>
          <p className="text-muted">
            Des outils puissants et une interface moderne pour gérer vos espaces.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              icon: "🏢",
              title: "Gestion des Salles",
              text: "Créez, modifiez et supprimez les salles de manière centralisée et rapide.",
              color: "#38BDF8",
              link: "/salles",
              btn: "Accéder",
            },
            {
              icon: "📅",
              title: "Réservations",
              text: "Planifiez les réservations et évitez les conflits d’horaires en un clic.",
              color: "#22C55E",
              btn: "Bientôt disponible",
            },
            {
              icon: "📊",
              title: "Statistiques",
              text: "Visualisez l’utilisation et les performances de vos espaces en temps réel.",
              color: "#FFD43B",
              btn: "À venir",
            },
          ].map((f, i) => (
            <div className="col-md-4" key={i}>
              <div
                className="card text-center h-100 border-0"
                style={{
                  background: "#1E293B",
                  borderRadius: "20px",
                  boxShadow:
                    "8px 8px 15px #0f172a, -8px -8px 15px #334155",
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="mb-3 fs-2"
                    style={{
                      color: f.color,
                      textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h5 className="fw-bold text-light">{f.title}</h5>
                  <p className="text-muted small">{f.text}</p>
                  <a
                    href={f.link || "#"}
                    className="btn btn-sm mt-2"
                    style={{
                      background:
                        f.btn.includes("Accéder")
                          ? "linear-gradient(145deg, #38BDF8, #2563EB)"
                          : "transparent",
                      color: f.btn.includes("Accéder")
                        ? "white"
                        : f.color,
                      border:
                        f.btn.includes("Accéder") ? "none" : `1px solid ${f.color}`,
                      borderRadius: "20px",
                      padding: "6px 20px",
                    }}
                  >
                    {f.btn}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔻 Footer */}
      <footer
        className="text-light text-center py-3 mt-auto"
        style={{
          background: "#0f172a",
          borderTop: "1px solid #1e40af",
          boxShadow: "0 -3px 8px rgba(0,0,0,0.3)",
        }}
      >
        <small>
          © {new Date().getFullYear()}{" "}
          <span style={{ color: "#38BDF8" }}>ReservationApp</span> — Tous droits
          réservés.
        </small>
      </footer>
    </div>
  );
}
