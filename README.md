# Nexus IA — V0.2

Nexus IA V0.2 est une base d'assistant **100 % locale**, conçue pour fonctionner directement dans le navigateur.

> **État actuel :** aucun fournisseur d'IA distant, aucune clé API et aucun endpoint serveur dans la V0.2.

## ✨ Fonctionnalités

- 🧠 Nexus Core local en JavaScript
- 💾 mémoire persistante via `localStorage`
- 🗣️ détection d'intentions et contexte de conversation
- ✍️ tolérance à plusieurs petites fautes de frappe
- 🧮 calculatrice locale
- 🔢 conversions d'unités courantes
- 🕐 date et heure locales
- 📍 mémorisation de faits explicitement fournis par l'utilisateur
- 🛡️ fallback honnête lorsque le moteur ne sait pas répondre
- 📦 aucune dépendance obligatoire
- 🌐 aucune requête réseau effectuée par le Core

## 🚀 Installation et lancement

### Prérequis

Aucun runtime serveur n'est nécessaire pour la V0.2. Un navigateur moderne suffit.

### Méthode 1 — ouverture directe

Télécharge ou clone le dépôt, puis ouvre `index.html` dans Firefox, Chrome, Edge ou un autre navigateur moderne.

### Méthode 2 — serveur local

Depuis le dossier du projet, lance par exemple :

```bash
python -m http.server 8000
```

Puis ouvre :

```
http://localhost:8000
```

Le projet est statique : il n'y a pas de backend à démarrer.

## 🔐 Variables d'environnement

**V0.2 n'en utilise aucune.**

| Variable | Nécessaire | Utilisation |
|---|---:|---|
| Aucune | Non | Le Core fonctionne localement sans secret ni API |

Les anciennes variables `OPENAI_API_KEY`, `POLLINATIONS_API_KEY` et `NEXUS_FALLBACK_API_KEY` appartenaient à une architecture historique et **ne font pas partie de V0.2**.

## 🤖 Modèle / API utilisé

**Modèle distant : aucun.**

**API distante : aucune.**

Le moteur actuel est un ensemble de modules JavaScript locaux : normalisation du texte, détection d'intentions, mémoire, contexte, calcul et conversions.

Nexus IA V0.2 **n'est donc pas encore un LLM**. Pour obtenir une véritable génération de langage sans API cloud, la prochaine étape technique est d'intégrer un modèle de langage exécuté localement.

## 🌐 Démo

La V0.2 est conçue pour être déployée comme site statique sur Vercel.

**URL de démonstration :** à renseigner après confirmation de l'URL publique Vercel.

> Le projet Vercel existe, mais son URL publique n'a pas pu être vérifiée depuis l'accès actuel. Aucune URL ne doit être inventée dans la documentation.

## 🖼️ Aperçu

Le fichier `docs/screenshot.svg` fournit un aperçu statique de l'interface V0.2.

Pour une véritable capture d'écran, remplace ce fichier par une capture du site déployé.

## 🛡️ Sécurité

- Aucun secret n'est stocké dans le code de V0.2.
- Aucun endpoint `/api/*` n'est présent dans l'arbre actuel.
- Aucune requête vers OpenAI, Gemini ou Pollinations n'est effectuée par le Core actuel.
- Les anciennes implémentations serveur appartiennent à l'historique du projet et ne sont plus présentes dans `main`.
- Si une clé a déjà été utilisée dans un ancien déploiement, elle doit être révoquée depuis son fournisseur avant toute réutilisation.

## 📁 Structure

```text
Nexus-AI/
├── index.html
├── nexus-core.js
├── style.css
├── README.md
├── LICENSE
├── .gitignore
└── docs/
    └── screenshot.svg
```

## 🧠 Architecture

```text
Interface
   │
   ▼
Nexus Core
   ├── Normalisation
   ├── Intentions
   ├── Contexte
   ├── Mémoire locale
   ├── Calcul
   └── Conversions
```

L'interface et le moteur restent séparés afin de pouvoir ajouter plus tard de nouveaux modules sans reconstruire toute l'application.

## 📜 Licence

Nexus IA est distribué sous licence MIT. Voir [LICENSE](LICENSE).

## 🔗 Dépôt

[GitHub — Nexus-AI](https://github.com/jeanlafon12180-ops/Nexus-AI)
