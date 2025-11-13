import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import ReservationDetailsModal from "./ReservationDetailsModal";


import EditReservationModal from "./EditReservationModal";
export default function Reservations({ reservations: propReservations }) {
  const [reservations, setLocalReservations] = useState(propReservations || []);
  const [message, setMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [detailsReservation, setDetailsReservation] = useState(null);
  const [filters, setFilters] = useState({
    statut: "all",
    salle: "all",
    date: "",
  });

  const [sortBy, setSortBy] = useState("date_asc");

  const openDetails = (r) => {
    setDetailsReservation(r);
    setDetailsModal(true);
  };

  const openEditModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };
  const saveUpdate = async (form) => {
    try {
      await axios.put(`/reservations/${selectedReservation.id}`, form);

      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`/reservations/employe/${user.id}`);
      setLocalReservations(res.data);

      setShowEditModal(false);
      alert("✅ Réservation modifiée avec succès !");
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Impossible de mettre à jour"));
    }
  };
  const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
  };

  // ✅ Load logged-in employee's reservations
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      axios
        .get(`/reservations/employe/${user.id}`)
        .then((res) => setLocalReservations(res.data))
        .catch(() => setMessage("Aucune réservation trouvée"));
    }
  }, []);

  const deleteReservation = async (id) => {
    if (!window.confirm("Supprimer cette réservation ?")) return;
    await axios.delete(`/reservations/${id}`);
    const user = JSON.parse(localStorage.getItem("user"));
    axios.get(`/reservations/employe/${user.id}`).then((res) => setLocalReservations(res.data));
  };

const cancelReservation = async (id) => {
  if (!window.confirm("Annuler cette réservation ?")) return;
  try {
    await axios.put(`/reservations/${id}/cancel`);
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await axios.get(`/reservations/employe/${user.id}`);
    setLocalReservations(res.data);
  } catch {
    alert("❌ Erreur lors de l'annulation.");
  }
};

  const filteredReservations = reservations
  .filter((r) => {
    if (filters.statut !== "all" && r.statut !== filters.statut) return false;
    if (filters.salle !== "all" && r.salle?.code !== filters.salle) return false;
    if (filters.date && r.date_res !== filters.date) return false;
    return true;
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.date_res) - new Date(b.date_res);
      case "date_desc":
        return new Date(b.date_res) - new Date(a.date_res);
      case "duree_asc":
        return (a.duree_minutes || 0) - (b.duree_minutes || 0);
      case "duree_desc":
        return (b.duree_minutes || 0) - (a.duree_minutes || 0);
      case "statut_asc":
        return a.statut.localeCompare(b.statut);
      default:
        return 0;
    }
  });


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
        📅 Mes Réservations
      </h3>

      {message && (
        <p className="text-center fw-semibold" style={{ color: "#38BDF8" }}>
          {message}
        </p>
      )}
      <div className="d-flex flex-wrap gap-3 mb-4">

        {/* Filter by Status */}
        <select
          className="form-select"
          style={{ maxWidth: "200px" }}
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
        >
          <option value="all">Tous les statuts</option>
          <option value="confirmée">Confirmée</option>
          <option value="annulée">Annulée</option>
          <option value="terminée">Terminée</option>
        </select>

        {/* Filter by Salle */}
        <select
          className="form-select"
          style={{ maxWidth: "200px" }}
          value={filters.salle}
          onChange={(e) => setFilters({ ...filters, salle: e.target.value })}
        >
          <option value="all">Toutes les salles</option>
          {[...new Set(reservations.map((r) => r.salle?.code))].map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        {/* Filter by Date */}
        <input
          type="date"
          className="form-control"
          style={{ maxWidth: "200px" }}
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        {/* Sorting */}
        <select
          className="form-select"
          style={{ maxWidth: "220px" }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_asc">📅 Date (croissant)</option>
          <option value="date_desc">📅 Date (décroissant)</option>
          <option value="duree_desc">⏳ Durée (longue → courte)</option>
          <option value="duree_asc">⏳ Durée (courte → longue)</option>
          <option value="statut_asc">🔖 Statut (A→Z)</option>
        </select>

      </div>

      {/* 📋 Reservations Table */}
      <table className="table table-dark table-striped mt-3 align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Salle</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Durée</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            filteredReservations.map((r) => (
              <tr
                key={r.id}
                style={{
                  opacity: r.statut === "annulée" ? 0.6 : 1,
                  backgroundColor:
                    r.statut === "annulée" ? "rgba(255,193,7,0.1)" : "transparent",
                }}
              >
                <td>{r.id}</td>
                <td>{r.salle?.code || r.num_salle}</td>
                <td>{r.date_res}</td>
                <td>{r.heure_res}</td>
                <td>{formatDuration(r.duree_minutes)}</td>

                <td>
                  <span
                    className={`badge ${r.statut === "confirmée"
                      ? "bg-success"
                      : r.statut === "annulée"
                        ? "bg-warning text-dark"
                        : "bg-primary"
                      }`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {r.statut}
                  </span>
                </td>
                <td className="d-flex gap-2">

                  {/* 🔍 Details */}
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => openDetails(r)}
                  >
                    🔍 Détails
                  </button>


                  {/* ✏️ Modifier */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openEditModal(r)}
                    disabled={r.statut !== "confirmée"}
                  >
                    ✏️ Modifier
                  </button>


                  {/* 🟡 Annuler */}
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => cancelReservation(r.id)}
                    disabled={r.statut === "annulée" || r.statut === "terminée"}
                  >
                    🟡 Annuler
                  </button>

                  {/* ❌ Supprimer */}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteReservation(r.id)}
                  >
                    ❌ Supprimer
                  </button>

                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-light">
                Aucune réservation trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <EditReservationModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        reservation={selectedReservation}
        onSave={saveUpdate}
      />
      <ReservationDetailsModal
        show={detailsModal}
        onClose={() => setDetailsModal(false)}
        reservation={detailsReservation}
      />

    </div>

  );
}
