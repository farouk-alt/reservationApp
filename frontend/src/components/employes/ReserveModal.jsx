import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../api/axios";

export default function ReserveModal({ show, onClose, salle, onConfirm }) {
    const [form, setForm] = useState({
        date_res: "",
        heure_res: "",
        duree_minutes: "",
    });
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Helper: compute end time from start + duration (minutes)
    const calculateEnd = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return "";
        const [h, m] = startTime.split(":").map(Number);
        const d = new Date(0, 0, 0, h, m || 0);
        d.setMinutes(d.getMinutes() + Number(durationMinutes));
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    // 🔹 Format duration for display
    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (m === 0) return `${h}h`;
        if (h === 0) return `${m}min`;
        return `${h}h ${m}min`;
    };

    // 🔁 Fetch conflicts when date changes
    useEffect(() => {
        if (!salle || !salle.id || !form.date_res) {
            setConflicts([]);
            return;
        }

        axios
            .get(`/reservations/conflicts?salle=${salle.id}&date=${form.date_res}`)
            .then((res) => setConflicts(res.data || []))
            .catch((err) => {
                console.error("Error fetching conflicts:", err);
                setConflicts([]);
            });
    }, [form.date_res, salle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.date_res || !form.heure_res || !form.duree_minutes) {
            alert("⚠️ Tous les champs sont obligatoires !");
            return;
        }

        const duration = Number(form.duree_minutes);
        if (duration < 30 || duration > 360) {
            alert("⚠️ La durée doit être entre 30 minutes et 6 heures (360 minutes)");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                num_salle: salle.id,
                date_res: form.date_res,
                heure_res: form.heure_res,
                duree_minutes: duration,
            };

            console.log("Sending reservation:", payload);

            const response = await axios.post('/reservations', payload);
            
            console.log("Reservation response:", response);

            // Check if successful
            if (response.status === 201 || response.status === 200) {
                alert('✅ ' + (response.data.message || 'Réservation créée avec succès !'));
                
                // Reset form
                setForm({
                    date_res: "",
                    heure_res: "",
                    duree_minutes: "",
                });
                
                // Call parent's onConfirm to refresh data
                if (onConfirm) {
                    await onConfirm(payload);
                }
                
                onClose();
            }
            
        } catch (error) {
            console.error("Reservation error:", error);
            console.error("Error response:", error.response);
            
            // Handle different error types
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 422 || status === 400) {
                    // Validation errors
                    if (data.errors) {
                        const errorMessages = Object.values(data.errors).flat().join('\n');
                        alert(`❌ Erreur de validation:\n${errorMessages}`);
                    } else {
                        alert(`❌ ${data.error || data.message || 'Erreur de validation'}`);
                    }
                } else if (status === 403) {
                    // Forbidden (Sunday, time limit, daily limit)
                    alert(`❌ ${data.error || data.message || 'Action non autorisée'}`);
                } else if (status === 409) {
                    // Conflict (overlap)
                    alert(`❌ ${data.error || data.message || 'Conflit de réservation'}`);
                } else {
                    alert(`❌ ${data.error || data.message || 'Erreur lors de la réservation'}`);
                }
            } else {
                alert("❌ Erreur de connexion au serveur");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="bg-dark text-light">
                <Modal.Title>Réserver {salle?.code}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-dark text-light">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="date_res"
                            value={form.date_res}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <Form.Text className="text-muted">
                            Maximum 14 jours à l'avance
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Heure de début</Form.Label>
                        <Form.Control
                            type="time"
                            name="heure_res"
                            value={form.heure_res}
                            onChange={handleChange}
                            required
                        />
                        <Form.Text className="text-muted">
                            Avant 17h00
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Durée</Form.Label>
                        <Form.Select
                            name="duree_minutes"
                            value={form.duree_minutes}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Sélectionner une durée...</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 heure</option>
                            <option value="90">1h 30min</option>
                            <option value="120">2 heures</option>
                            <option value="150">2h 30min</option>
                            <option value="180">3 heures</option>
                            <option value="210">3h 30min</option>
                            <option value="240">4 heures</option>
                            <option value="270">4h 30min</option>
                            <option value="300">5 heures</option>
                            <option value="330">5h 30min</option>
                            <option value="360">6 heures</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Show time slot preview */}
                    {form.heure_res && form.duree_minutes && (
                        <div className="alert alert-info mb-3">
                            <strong>📅 Créneau:</strong> {form.heure_res} → {calculateEnd(form.heure_res, form.duree_minutes)}
                            <br />
                            <strong>⏱️ Durée:</strong> {formatDuration(form.duree_minutes)}
                        </div>
                    )}
                </Form>

                {/* 🔔 Conflicts display */}
                {conflicts.length > 0 && (
                    <div className="alert alert-warning mt-2">
                        <strong>❗ Créneaux déjà réservés ce jour:</strong>
                        <ul className="mb-0 mt-2">
                            {conflicts
                                .filter(c => c.statut !== 'annulée') // Only show active reservations
                                .map((c) => (
                                    <li key={c.id}>
                                        {c.heure_res} → {calculateEnd(c.heure_res, c.duree_minutes)}
                                        {' '}({formatDuration(c.duree_minutes)})
                                    </li>
                                ))}
                        </ul>
                        {conflicts.every(c => c.statut === 'annulée') && (
                            <p className="mb-0 mt-2 text-muted">
                                (Toutes les réservations de ce jour ont été annulées)
                            </p>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-dark text-light">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Annuler
                </Button>
                <Button variant="info" onClick={handleSubmit} disabled={loading}>
                    {loading ? "⏳ En cours..." : "Confirmer la réservation"}
                </Button>
            </Modal.Footer>

            <style>
                {`
                    input[type="date"]::-webkit-calendar-picker-indicator,
                    input[type="time"]::-webkit-calendar-picker-indicator {
                        filter: invert(1);
                        cursor: pointer;
                    }
                `}
            </style>
        </Modal>
    );
}