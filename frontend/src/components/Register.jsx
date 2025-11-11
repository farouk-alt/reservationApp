import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import logo from "../assets/logo.png";

export default function Register({ onRegisterSuccess }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    departement: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/employe/register", form);

      const { token, role, employe } = res.data;

      // Save in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(employe));

      // ✅ Update parent App state instantly
      if (onRegisterSuccess) onRegisterSuccess(employe, role);

      // 🚀 Navigate immediately to dashboard
      navigate("/employe");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur : email ou nom d’utilisateur déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(180deg, #0f172a, #1e293b)",
      }}
    >
      <div
        className="p-4 rounded-4 shadow-lg text-center"
        style={{
          background: "rgba(30,41,59,0.85)",
          border: "1px solid rgba(56,189,248,0.3)",
          backdropFilter: "blur(10px)",
          width: "100%",
          maxWidth: "480px",
          color: "#E2E8F0",
        }}
      >
        <div className="mb-3">
          <img
            src={logo}
            alt="ReservationApp Logo"
            width="90"
            height="90"
            style={{ filter: "drop-shadow(0 2px 8px rgba(56,189,248,0.5))" }}
          />
          <h4 className="mt-3" style={{ color: "#38BDF8", fontWeight: "700" }}>
            Créer un compte Employé
          </h4>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-2">
            <div className="col">
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                className="form-control"
                value={form.nom}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                className="form-control"
                value={form.prenom}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <input
            type="text"
            name="departement"
            placeholder="Département"
            className="form-control mb-2"
            value={form.departement}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="username"
            placeholder="Nom d’utilisateur"
            className="form-control mb-2"
            value={form.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-2"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="form-control mb-4"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-semibold"
            style={{
              background: "linear-gradient(145deg, #38BDF8, #2563EB)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(56,189,248,0.3)",
            }}
          >
            {loading ? "⏳ Création..." : "Créer le compte"}
          </button>
        </form>

        <p className="mt-3" style={{ fontSize: "0.9rem" }}>
          Déjà inscrit ?{" "}
          <Link
            to="/login"
            style={{ color: "#38BDF8", textDecoration: "none" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "rgba(15,23,42,0.9)",
  color: "#E2E8F0",
  border: "1px solid rgba(56,189,248,0.3)",
  borderRadius: "10px",
}

