# 🤖 Nexus IA

Projet d'intelligence artificielle développé progressivement.

## 🚀 Version actuelle

**Nexus IA V1.0**

### Ce qui change en V1.0

- 💬 interface de discussion plein écran, sombre et épurée
- 🧠 contexte conversationnel récent et compréhension plus tolérante
- 💾 mémoire locale par appareil avec migration depuis les anciennes versions
- ❤️ mémoire de préférences en plus du prénom et de la ville
- 🧮 moteur de calcul dédié
- 📚 moteur de connaissances scolaires
- 💻 génération de code guidée (HTML, Python, JavaScript et demandes générales)
- 📋 copie des blocs de code depuis la conversation
- 🎨 mode image avec interface dédiée et détection des demandes de génération
- 📱 design responsive ordinateur et mobile

## 🧠 Limite importante

Le dépôt est publié avec GitHub Pages et son code côté navigateur ne doit pas contenir de clé secrète. Le mode image de V1.0 est donc préparé côté interface, mais une vraie génération doit passer par un endpoint serveur sécurisé connecté à un service de génération d'images.

De même, le cerveau local V1.0 améliore fortement la compréhension par règles, contexte, mémoire, calcul et connaissances, mais il ne remplace pas encore un véritable modèle de langage distant. Une intelligence générative réellement avancée nécessitera un backend sécurisé.

## 📁 Architecture

```text
Nexus-AI/
├── index.html
├── style.css
├── js/
│   ├── app.js
│   ├── brain.js
│   ├── memory.js
│   └── knowledge.js
└── README.md
```

## 🌐 Publication

Le projet est conçu pour être publié avec GitHub Pages.

## 🛣️ Suite du projet

La prochaine étape majeure est de brancher un backend sécurisé pour ajouter un véritable modèle génératif, la génération réelle d'images, la recherche Web, l'analyse de fichiers et une mémoire synchronisée entre appareils.
