<!DOCTYPE html>
<html>
<body>
    <h2>Réservation confirmée ✅</h2>

    <p>Bonjour {{ $reservation->employe->prenom }} {{ $reservation->employe->nom }},</p>

    <p>Votre réservation a été enregistrée :</p>

    <ul>
        <li>Salle : {{ $reservation->salle->code ?? $reservation->num_salle }}</li>
        <li>Date : {{ $reservation->date_res }}</li>
        <li>Heure : {{ $reservation->heure_res }}</li>
        <li>Durée : {{ $reservation->duree_minutes }} minutes</li>
    </ul>

    <p>Merci d’utiliser ReservationApp.</p>
</body>
</html>
