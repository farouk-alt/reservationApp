import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("❌ Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("/password/reset", {
        email,
        token,
        password,
      });

      setMessage("✅ Mot de passe réinitialisé !");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage("❌ Lien expiré ou invalide." , err);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token)
    return <p className="text-light">Lien invalide.</p>;

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
        <h3 className="mb-4" style={{ color: "#38BDF8" }}>
          🔒 Réinitialiser le mot de passe
        </h3>

        {message && <p className="alert alert-info">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="form-control mb-3"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="form-control mb-3"
            style={inputStyle}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              background: "linear-gradient(145deg, #38BDF8, #2563EB)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
            }}
            disabled={loading}
          >
            {loading ? "⏳ Réinitialisation..." : "Changer le mot de passe"}
          </button>
        </form>

        <p className="mt-4">
          <Link to="/" style={{ color: "#38BDF8" }}>
            ← Retour à la connexion
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
