# 🤖 Nexus IA

Projet d'intelligence artificielle développé progressivement.

## 🚀 Version actuelle

**Nexus IA v0.8**

### Principales améliorations

- 🧠 mémoire locale isolée par appareil
- 💬 historique de conversation isolé par appareil
- 🔄 migration automatique de la mémoire V0.7 sur le premier appareil utilisé
- ✍️ meilleure compréhension et tolérance aux fautes
- 🧮 moteur de calcul dédié et plus sûr
- 📚 moteur de connaissances
- 🎓 notions scolaires : mathématiques, français, histoire, sciences et informatique
- 🏫 quelques informations locales et pratiques
- 🛠️ architecture modulaire
- 📱 interface Web responsive
- 🧩 traitement de plusieurs questions
- 🖼️ architecture préparée pour l'intégration d'images en V1
- 💻 architecture préparée pour l'intégration du code en V1

## 🧠 Mémoire V0.8

Nexus IA crée un identifiant local pour chaque appareil et utilise des clés de stockage différentes pour cet appareil. La mémoire et l'historique ne sont donc pas partagés entre deux appareils simplement parce qu'ils ouvrent le même site.

Cette mémoire reste locale au navigateur. Pour synchroniser la mémoire entre plusieurs appareils, il faudra une vraie connexion utilisateur et un backend en V1.

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

La V0.8 prépare une mémoire locale par appareil. La V1 pourra ajouter un véritable moteur d'IA génératif, l'analyse d'images, des fonctions liées au code, la recherche Web, les fichiers et un backend sécurisé avec comptes et synchronisation.
