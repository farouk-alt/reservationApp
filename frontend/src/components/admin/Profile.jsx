import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    nom: "",
    email: "",
    username: "",
  });

  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧩 Load admin info
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/admin/profile");
        setAdmin(res.data);
      } catch {
        setError("⚠️ Impossible de charger votre profil administrateur.");
      }
    };
    fetchAdmin();
  }, []);

  // 🧾 Update admin profile info
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await axios.put("/admin/profile", admin);
      setMessage("✅ Profil mis à jour avec succès !");
      setEditing(false);
      setError(null);
    } catch {
      setError("⚠️ Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Update admin password
  const handlePasswordUpdate = async () => {
    try {
      if (!password.trim()) return setError("Le mot de passe est requis.");
      setLoading(true);
      await axios.put("/admin/password", { password });
      setMessage("✅ Mot de passe mis à jour avec succès !");
      setPassword("");
      setError(null);
    } catch {
      setError("⚠️ Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(30,41,59,0.9)",
        borderRadius: "15px",
        padding: "30px",
        border: "1px solid rgba(56,189,248,0.2)",
        maxWidth: "650px",
        margin: "0 auto",
        color: "#E2E8F0",
        boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
      }}
    >
      <h3 className="fw-bold mb-4" style={{ color: "#38BDF8" }}>
        👤 Profil Administrateur
      </h3>

      {/* 🧾 Editable admin info */}
      <div style={{ lineHeight: "1.8" }}>
        {Object.keys(admin).map((key) => (
          <div className="mb-3" key={key}>
            <label className="fw-semibold text-light">
              {key.charAt(0).toUpperCase() + key.slice(1)} :
            </label>
            {editing ? (
              <input
                type="text"
                className="form-control mt-1"
                value={admin[key]}
                onChange={(e) =>
                  setAdmin({ ...admin, [key]: e.target.value })
                }
                style={{
                  background: "#0f172a",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56,189,248,0.3)",
                  borderRadius: "10px",
                }}
              />
            ) : (
              <p
                className="mb-0"
                style={{ color: "#E2E8F0", marginTop: "5px" }}
              >
                {admin[key] || "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 🔘 Edit / Save buttons */}
      <div className="d-flex justify-content-between mt-3">
        {!editing ? (
          <button
            className="btn fw-semibold"
            onClick={() => setEditing(true)}
            style={{
              background: "linear-gradient(145deg, #38BDF8, #2563EB)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              padding: "8px 16px",
              width: "48%",
            }}
          >
            ✏️ Modifier le profil
          </button>
        ) : (
          <button
            className="btn fw-semibold"
            onClick={handleProfileUpdate}
            disabled={loading}
            style={{
              background: "linear-gradient(145deg, #22c55e, #16a34a)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              padding: "8px 16px",
              width: "48%",
            }}
          >
            💾 {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        )}

        {editing && (
          <button
            className="btn fw-semibold"
            onClick={() => setEditing(false)}
            style={{
              background: "rgba(71,85,105,0.8)",
              border: "none",
              borderRadius: "10px",
              color: "#E2E8F0",
              padding: "8px 16px",
              width: "48%",
            }}
          >
            ❌ Annuler
          </button>
        )}
      </div>

      <hr style={{ borderColor: "rgba(56,189,248,0.2)", margin: "25px 0" }} />

      {/* 🔒 Password section */}
      <h5 className="mt-3 mb-2" style={{ color: "#38BDF8" }}>
        🔒 Changer le mot de passe
      </h5>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        className="form-control mt-2"
        style={{
          background: "#0f172a",
          color: "#E2E8F0",
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: "10px",
          padding: "10px",
        }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="btn fw-semibold mt-3"
        onClick={handlePasswordUpdate}
        disabled={loading}
        style={{
          background: "linear-gradient(145deg, #38BDF8, #2563EB)",
          border: "none",
          borderRadius: "10px",
          color: "white",
          width: "100%",
          padding: "10px 0",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "⏳ Mise à jour..." : "Mettre à jour le mot de passe"}
      </button>

      {/* 🧩 Alerts */}
      {message && (
        <p className="text-success mt-3 text-center fw-semibold">{message}</p>
      )}
      {error && (
        <p className="text-danger mt-3 text-center fw-semibold">{error}</p>
      )}
    </div>
  );
}
