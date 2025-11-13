<!DOCTYPE html>
<html>
<body>
    <h2>Réinitialisation du mot de passe</h2>

    <p>Bonjour {{ $user->prenom }} {{ $user->nom }},</p>

    <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>

    <p><a href="{{ $link }}">{{ $link }}</a></p>

    <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
</body>
</html>
