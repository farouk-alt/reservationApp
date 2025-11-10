import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    num_emp: "",
    num_salle: "",
    date_res: "",
    heure_res: "",
    duree: "",
    statut: "confirmée"
  });
  const [message, setMessage] = useState(null);

  // Fetch all reservations
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get("/reservations");
      setReservations(res.data);
    } catch {
      setMessage("⚠️ Erreur lors du chargement des réservations");
    }
  };

  // Create reservation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/reservations", form);
      setMessage("✅ Réservation ajoutée !");
      fetchReservations();
      setForm({
        num_emp: "",
        num_salle: "",
        date_res: "",
        heure_res: "",
        duree: "",
        statut: "confirmée",
      });
    } catch {
      setMessage("❌ Erreur lors de l’ajout");
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm("Supprimer cette réservation ?")) return;
    await axios.delete(`/reservations/${id}`);
    fetchReservations();
  };

  return (
    <div
      style={{
        background: "rgba(30,41,59,0.9)",
        color: "#E2E8F0",
        padding: "30px",
        borderRadius: "15px",
        border: "1px solid rgba(56,189,248,0.2)",
      }}
    >
      <h3 className="fw-bold mb-4" style={{ color: "#38BDF8" }}>
        📅 Réservations
      </h3>

      {/* ✅ Add Form */}
      <form
        onSubmit={handleSubmit}
        className="d-flex flex-wrap gap-2 align-items-end mb-4"
      >
        <input
          type="number"
          placeholder="ID Employé"
          value={form.num_emp}
          onChange={(e) => setForm({ ...form, num_emp: e.target.value })}
          className="form-control"
          style={{ maxWidth: "150px" }}
        />
        <input
          type="number"
          placeholder="ID Salle"
          value={form.num_salle}
          onChange={(e) => setForm({ ...form, num_salle: e.target.value })}
          className="form-control"
          style={{ maxWidth: "150px" }}
        />
        <input
          type="date"
          value={form.date_res}
          onChange={(e) => setForm({ ...form, date_res: e.target.value })}
          className="form-control"
          style={{ maxWidth: "180px" }}
        />
        <input
          type="time"
          value={form.heure_res}
          onChange={(e) => setForm({ ...form, heure_res: e.target.value })}
          className="form-control"
          style={{ maxWidth: "150px" }}
        />
        <input
          type="number"
          placeholder="Durée (h)"
          value={form.duree}
          onChange={(e) => setForm({ ...form, duree: e.target.value })}
          className="form-control"
          style={{ maxWidth: "120px" }}
        />
        <button
          type="submit"
          className="btn btn-info fw-semibold"
          style={{
            background: "linear-gradient(145deg, #38BDF8, #2563EB)",
            color: "white",
            borderRadius: "10px",
            padding: "8px 20px",
          }}
        >
          Ajouter
        </button>
      </form>

      {message && (
        <p className="text-center fw-semibold" style={{ color: "#38BDF8" }}>
          {message}
        </p>
      )}

      {/* 📋 Reservations Table */}
      <table className="table table-dark table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employé</th>
            <th>Salle</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Durée</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.num_emp}</td>
              <td>{r.num_salle}</td>
              <td>{r.date_res}</td>
              <td>{r.heure_res}</td>
              <td>{r.duree} h</td>
              <td>{r.statut}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteReservation(r.id)}
                >
                  ❌ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
