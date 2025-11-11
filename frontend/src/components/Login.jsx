import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import logo from "../assets/logo.png";

export default function Login({ onLoginSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let endpoint = "/employe/login";
    let role = "employe";
    let payload = { login, password }; // default

    if (login === "admin@example.com") {
      endpoint = "/admin/login";
      role = "admin";
      payload = { email: login, password }; // 👈 send email instead
    }

    const res = await axios.post(endpoint, payload);
    const userData = res.data[role];

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userData));

    if (onLoginSuccess) onLoginSuccess(userData, role);

    navigate(role === "admin" ? "/admin" : "/employe");
  } catch (err) {
    console.error(err);
    alert("⚠️ Identifiants invalides ou problème serveur");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: "linear-gradient(180deg, #0f172a, #1e293b)" }}
    >
      <div
        className="p-4 rounded-4 shadow-lg text-center"
        style={{
          background: "rgba(30,41,59,0.85)",
          border: "1px solid rgba(56,189,248,0.3)",
          width: "100%",
          maxWidth: "420px",
          color: "#E2E8F0",
        }}
      >
        <div className="mb-3">
          <img src={logo} alt="ReservationApp Logo" width="90" height="90" />
          <h4 className="mt-3" style={{ color: "#38BDF8", fontWeight: "700" }}>
            Connexion
          </h4>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email ou Nom d'utilisateur"
            className="form-control mb-3"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="form-control mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            }}
          >
            {loading ? "⏳ Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-3" style={{ fontSize: "0.9rem" }}>
          Pas de compte ?{" "}
          <Link to="/register" style={{ color: "#38BDF8", textDecoration: "none" }}>
            Créer un compte
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
};
