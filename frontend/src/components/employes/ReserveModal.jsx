import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../api/axios";

export default function ReserveModal({ show, onClose, salle, onConfirm }) {
    const [form, setForm] = useState({
        date_res: "",
        heure_res: "",
        duree: "",
    });
    const [conflicts, setConflicts] = useState([]);

    // 🔹 Helper: compute end time from start + duree (hours)
    const calculateEnd = (startTime, duree) => {
        if (!startTime) return "";
        const [h, m] = startTime.split(":").map(Number);
        const d = new Date(0, 0, 0, h, m || 0);
        d.setHours(d.getHours() + Number(duree || 0));
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    // 🔁 When fields change, fetch conflicts for that salle & date
    useEffect(() => {
        if (!salle || !salle.id) return;
        if (!form.date_res) {
            setConflicts([]);
            return;
        }

        axios
            .get(`/reservations/conflicts?salle=${salle.id}&date=${form.date_res}`)
            .then((res) => setConflicts(res.data))
            .catch(() => setConflicts([]));
    }, [form.date_res, salle]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });
    const toMinutes = (hhmm) => {
        if (!hhmm) return 0;
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };

    const handleSubmit = () => {
        if (!form.date_res || !form.heure_res || !form.duree) {
            alert("⚠️ Tous les champs sont obligatoires !");
            return;
        }

        const minutes = toMinutes(form.duree);

        onConfirm({
            date_res: form.date_res,
            heure_res: form.heure_res,
            duree_minutes: minutes,
        });
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
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Heure de début</Form.Label>
                        <Form.Control
                            type="time"
                            name="heure_res"
                            value={form.heure_res}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Durée (heures)</Form.Label>
                        <Form.Control
                            type="time"
                            name="duree"
                            step="900"  // 15 minutes
                            value={form.duree}
                            onChange={handleChange}
                        />

                    </Form.Group>
                </Form>

                {/* 🔔 Conflicts display */}
                {conflicts.length > 0 && (
                    <div className="alert alert-warning mt-2">
                        <strong>❗ Créneaux déjà réservés :</strong>
                        <ul className="mb-0">
                            {conflicts.map((c) => (
                                <li key={c.id}>
                                    {c.heure_res} → {calculateEnd(c.heure_res, c.duree)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-dark text-light">
                <Button variant="secondary" onClick={onClose}>
                    Annuler
                </Button>
                <Button variant="info" onClick={handleSubmit}>
                    Confirmer la réservation
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
