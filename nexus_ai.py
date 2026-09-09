print("🤖 Nexus AI v0.3")
print("Bienvenue !")
print("Je peux maintenant retenir ton prénom. 🧠")
print()

prenom = ""

while True:
    message = input("Toi : ").lower().strip()

    if message.startswith("je m'appelle "):
        prenom = message.replace("je m'appelle ", "").strip()
        print(f"Nexus AI : Enchanté {prenom} ! 👋")

    elif message in ["bonjour", "salut", "hello", "coucou"]:
        if prenom:
            print(f"Nexus AI : Bonjour {prenom} ! 👋")
        else:
            print("Nexus AI : Bonjour ! 👋")

    elif message in ["qui suis-je", "qui suis je"]:
        if prenom:
            print(f"Nexus AI : Tu m'as dit que tu t'appelles {prenom}. 🧠")
        else:
            print("Nexus AI : Je ne connais pas encore ton prénom.")

    elif message in ["comment ça va", "ça va", "tu vas bien"]:
        print("Nexus AI : Je vais très bien ! 🤖")

    elif message in ["merci", "merci beaucoup"]:
        print("Nexus AI : Avec plaisir ! 😄")

    elif message in ["au revoir", "aurevoir", "bye", "quitter"]:
        print("Nexus AI : À bientôt ! 🚀")
        break

    else:
        print("Nexus AI : Je ne connais pas encore cette question. 🧠")
        import json
import os
import re
from datetime import datetime

# ============================================================
# 🤖 NEXUS AI V5
# ============================================================

VERSION = "5.0"

MEMORY_FILE = "nexus_memory.json"


# ============================================================
# 🧠 MÉMOIRE
# ============================================================

def charger_memoire():
    """Charge la mémoire sauvegardée depuis le fichier JSON."""
    if not os.path.exists(MEMORY_FILE):
        return {
            "prenom": "",
            "nom": "",
            "ville": "",
            "infos": []
        }

    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as fichier:
            return json.load(fichier)
    except (json.JSONDecodeError, OSError):
        return {
            "prenom": "",
            "nom": "",
            "ville": "",
            "infos": []
        }


def sauvegarder_memoire():
    """Sauvegarde la mémoire dans un fichier JSON."""
    try:
        with open(MEMORY_FILE, "w", encoding="utf-8") as fichier:
            json.dump(memoire, fichier, ensure_ascii=False, indent=4)
    except OSError:
        print("Nexus AI : Impossible de sauvegarder ma mémoire. ⚠️")


memoire = charger_memoire()


# ============================================================
# 🧹 NETTOYAGE DU TEXTE
# ============================================================

def nettoyer_texte(texte):
    """Nettoie légèrement le texte de l'utilisateur."""
    texte = texte.lower().strip()
    texte = re.sub(r"\s+", " ", texte)
    return texte


# ============================================================
# 💬 RÉPONSES
# ============================================================

def repondre_salutation():
    if memoire["prenom"]:
        return f"Bonjour {memoire['prenom']} ! 👋"
    return "Bonjour ! 👋"


def repondre_identite():
    if memoire["prenom"]:
        return f"Tu m'as dit que tu t'appelles {memoire['prenom']}. 🧠"
    return "Je ne connais pas encore ton prénom."


def afficher_memoire():
    print("\n🧠 MÉMOIRE DE NEXUS AI")
    print("--------------------------------")

    if memoire["prenom"]:
        print(f"Prénom : {memoire['prenom']}")
    else:
        print("Prénom : inconnu")

    if memoire["nom"]:
        print(f"Nom : {memoire['nom']}")
    else:
        print("Nom : inconnu")

    if memoire["ville"]:
        print(f"Ville : {memoire['ville']}")
    else:
        print("Ville : inconnue")

    if memoire["infos"]:
        print("\nAutres informations :")
        for info in memoire["infos"]:
            print(f"- {info}")
    else:
        print("\nAutres informations : aucune")

    print("--------------------------------\n")


def afficher_aide():
    print("""
🤖 NEXUS AI V5 — AIDE
=====================

Tu peux me dire :

👤 "Je m'appelle Jean"
👤 "Mon prénom est Jean"
👤 "Moi c'est Jean"

🏠 "J'habite à Rodez"
📍 "Ma ville est Rodez"

🧠 "Qui suis-je ?"
🧠 "Mémoire"

ℹ️ "Aide"
ℹ️ "Quelle heure est-il ?"

👋 "Bonjour"
👋 "Salut"
👋 "Hello"

❤️ "Merci"

🚪 "Au revoir"
🚪 "Quitter"

🗑️ "Oublie tout"
""")


# ============================================================
# 🧠 APPRENTISSAGE SIMPLE
# ============================================================

def analyser_information(message):
    # --------------------------------------------------------
    # Prénom
    # --------------------------------------------------------

    motifs_prenom = [
        r"^je m'appelle (.+)$",
        r"^je m apelle (.+)$",
        r"^mon prénom est (.+)$",
        r"^mon prenom est (.+)$",
        r"^moi c'est (.+)$",
        r"^moi cest (.+)$"
    ]

    for motif in motifs_prenom:
        resultat = re.match(motif, message)

        if resultat:
            prenom = resultat.group(1).strip()
            prenom = prenom.capitalize()

            memoire["prenom"] = prenom
            sauvegarder_memoire()

            return f"Enchanté {prenom} ! 👋 Je m'en souviendrai."

    # --------------------------------------------------------
    # Ville
    # --------------------------------------------------------

    motifs_ville = [
        r"^j'habite à (.+)$",
        r"^j'habite a (.+)$",
        r"^ma ville est (.+)$",
        r"^je vis à (.+)$",
        r"^je vis a (.+)$"
    ]

    for motif in motifs_ville:
        resultat = re.match(motif, message)

        if resultat:
            ville = resultat.group(1).strip()
            ville = ville.capitalize()

            memoire["ville"] = ville
            sauvegarder_memoire()

            return f"D'accord ! 🏠 Je retiens que tu habites à {ville}."

    return None


# ============================================================
# 🗑️ EFFACER LA MÉMOIRE
# ============================================================

def effacer_memoire():
    memoire["prenom"] = ""
    memoire["nom"] = ""
    memoire["ville"] = ""
    memoire["infos"] = []

    sauvegarder_memoire()

    return "Ma mémoire a été effacée. 🧹🧠"


# ============================================================
# ⏰ HEURE
# ============================================================

def donner_heure():
    heure = datetime.now().strftime("%H:%M")
    return f"Il est actuellement {heure}. ⏰"


# ============================================================
# 🧠 CERVEAU DE NEXUS
# ============================================================

def traiter_message(message):
    message = nettoyer_texte(message)

    # --------------------------------------------------------
    # Apprentissage
    # --------------------------------------------------------

    information = analyser_information(message)

    if information:
        return information

    # --------------------------------------------------------
    # Salutations
    # --------------------------------------------------------

    if message in [
        "bonjour",
        "salut",
        "hello",
        "coucou",
        "yo",
        "bonsoir"
    ]:
        return repondre_salutation()

    # --------------------------------------------------------
    # Identité
    # --------------------------------------------------------

    if message in [
        "qui suis-je",
        "qui suis je",
        "tu sais qui je suis"
    ]:
        return repondre_identite()

    # --------------------------------------------------------
    # Comment ça va
    # --------------------------------------------------------

    if message in [
        "comment ça va",
        "comment ca va",
        "ça va",
        "ca va",
        "tu vas bien"
    ]:
        return "Je vais très bien ! 🤖 Merci de demander."

    # --------------------------------------------------------
    # Merci
    # --------------------------------------------------------

    if message in [
        "merci",
        "merci beaucoup",
        "thanks"
    ]:
        return "Avec plaisir ! 😄"

    # --------------------------------------------------------
    # Aide
    # --------------------------------------------------------

    if message in [
        "aide",
        "help",
        "que peux tu faire",
        "que sais tu faire"
    ]:
        afficher_aide()
        return None

    # --------------------------------------------------------
    # Mémoire
    # --------------------------------------------------------

    if message in [
        "mémoire",
        "memoire",
        "montre ma mémoire",
        "montre ma memoire"
    ]:
        afficher_memoire()
        return None

    # --------------------------------------------------------
    # Heure
    # --------------------------------------------------------

    if message in [
        "quelle heure est-il",
        "quelle heure est il",
        "il est quelle heure",
        "heure"
    ]:
        return donner_heure()

    # --------------------------------------------------------
    # Oublier
    # --------------------------------------------------------

    if message in [
        "oublie tout",
        "oublie moi",
        "efface ma mémoire",
        "efface ma memoire"
    ]:
        return effacer_memoire()

    # --------------------------------------------------------
    # Quitter
    # --------------------------------------------------------

    if message in [
        "au revoir",
        "aurevoir",
        "bye",
        "quitter",
        "exit",
        "quit"
    ]:
        return "__QUITTER__"

    # --------------------------------------------------------
    # Réponse inconnue
    # --------------------------------------------------------

    return (
        "Je ne connais pas encore cette question. 🧠\n"
        "Tu peux essayer 'aide' pour voir ce que je sais faire."
    )


# ============================================================
# 🚀 LANCEMENT
# ============================================================

print("======================================")
print(f"🤖 NEXUS AI V{VERSION}")
print("======================================")
print("Bienvenue ! 🚀")
print("Ma mémoire est maintenant persistante. 🧠")
print("Tape 'aide' pour voir mes commandes.")
print()

if memoire["prenom"]:
    print(f"Nexus AI : Content de te revoir, {memoire['prenom']} ! 👋")
else:
    print("Nexus AI : Bonjour ! Comment t'appelles-tu ? 👋")

print()

# ============================================================
# 🔄 BOUCLE PRINCIPALE
# ============================================================

while True:
    try:
        message = input("Toi : ")

        if not message.strip():
            print("Nexus AI : Tu n'as rien écrit. 😄")
            continue

        reponse = traiter_message(message)

        if reponse == "__QUITTER__":
            print("Nexus AI : À bientôt ! 🚀")
            break

        if reponse:
            print(f"Nexus AI : {reponse}")

    except KeyboardInterrupt:
        print("\nNexus AI : Arrêt du programme. 👋")
        break

    except Exception as erreur:
        print("Nexus AI : Une erreur est survenue. ⚠️")
        print(f"(Erreur technique : {erreur})")