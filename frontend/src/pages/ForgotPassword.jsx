import React, { useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/password/forgot", { email });
      setMessage("📩 Un lien de réinitialisation a été envoyé à votre email.");
    } catch {
      setMessage("❌ Email introuvable.");
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
        <h3 className="mb-4" style={{ color: "#38BDF8" }}>
          🔑 Mot de passe oublié
        </h3>

        {message && <p className="alert alert-info">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre adresse email"
            className="form-control mb-3"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "⏳ Envoi..." : "Envoyer le lien"}
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
