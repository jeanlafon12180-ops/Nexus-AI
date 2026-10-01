# 🤖 Nexus IA

Projet d’intelligence artificielle développé progressivement autour de **Nexus Core**, le moteur central d’intelligence et d’orchestration.

## 🚀 Version actuelle

**Nexus IA V4.3 — Nexus Core Adaptive**

La V4.3 renforce l’intelligence interne de Nexus Core tout en conservant les capacités multimodales et l’architecture de résilience des versions précédentes.

### 🧠 Nexus Core V4.3

- 🎯 **Intent Engine V4.3** : analyse de l’objectif, du domaine, de la complexité, du contexte et du niveau de confiance.
- 🧩 **Mission Graph** : missions découpées en étapes avec dépendances et états de progression.
- 🤖 **Orchestration spécialisée** : sélection dynamique des agents Code, Science, Study, Analysis, Creative ou General.
- 🔗 **Context Advisor V4.3** : meilleure utilisation de l’historique, de la mémoire et des documents pertinents.
- 🎚️ **Adaptive Response** : niveau de détail et structure adaptés à la complexité réelle de la demande.
- 🔍 **Verification V4.3** : contrôle interne des réponses importantes et correction automatique lorsqu’une correction est nécessaire.
- 🛡️ **Resilience / Fallback** : conservation du routage principal et du moteur de secours configuré.
- 🔒 **Honnêteté opérationnelle** : Nexus ne prétend jamais avoir utilisé un outil, testé du code ou effectué une action qui n’a pas réellement eu lieu.
- 🔐 **Mémoire locale** : contexte isolé par profil navigateur ; les préférences de présentation restent locales et non sensibles.

## 📚 Historique des versions

| Version | Évolution principale |
|---|---|
| **V0 → V1.x** | 🧱 Premiers prototypes, chat Web, mémoire, multimodalité, documents, images, vidéo et audio. |
| **V2.x** | 🎙️ LIVE, vision, génération créative, vérification et améliorations générales. |
| **V3.0** | 🌌 Introduction de **Nexus Core**, missions, orchestration et console Admin privée. |
| **V3.1** | 🎯 Mission Engine dynamique et planification structurée. |
| **V3.2** | ⚙️ Exécution des missions avec états et horodatages. |
| **V3.3** | 🛡️ Resilience / Fallback Engine. |
| **V3.4** | 🔍 Verification + Self-Correction et Context Advisor. |
| **V3.5** | 🧠 Relevant Memory. |
| **V3.6** | 🤖 Specialized Agents. |
| **V3.7** | 🌌 Autonomous Nexus Core et orchestration adaptative. |
| **V4.2** | 🎯 Smart Intent : meilleure compréhension de l’objectif, du contexte et de la complexité. |
| **V4.3** | 🧠 **Nexus Core Adaptive** : Intent Engine V4.3, Mission Graph, orchestration multi-agents, réponse adaptative, vérification renforcée et interface alignée. |

## ✨ Capacités

- 💬 Conversation avec Nexus IA
- 🧠 Contexte conversationnel et mémoire locale
- 💻 Génération et analyse de code
- 🎨 Génération et modification d’images
- 🎵 Création musicale
- 🎬 Création vidéo
- 🖼️ Analyse d’images
- 📄 Analyse de PDF, DOCX, ODT et fichiers texte
- 🎥 Analyse vidéo
- 🎙️ Enregistrement et transcription audio
- 🔴 Mode LIVE vocal
- 📷 Vision caméra en LIVE lorsque le navigateur le permet
- 🌌 Nexus Core et missions multi-étapes
- 🤖 Agents spécialisés sous contrôle de Nexus Core
- 🔍 Vérification et auto-correction
- 🛡️ Routage principal + secours
- 🔐 Console Admin privée

## 🏗️ Architecture

- `api/nexus-core.js` — intelligence et orchestration Nexus Core V4.3
- `api/nexus-assist.js` — contexte, agents, intention et vérification
- `api/chat.js` — pipeline conversationnel Nexus Core
- `api/model-router.js` — routage des modèles
- `js/memory.js` — mémoire et contexte local
- `js/app.js` — interface principale
- `index.html` — application Web Nexus IA V4.3
- `admin.html` — console privée Nexus Core V4.3

## 🔐 Confidentialité et fiabilité

La mémoire et les conversations sont isolées par profil navigateur. Les secrets serveur ne doivent jamais être placés dans le code source.

Nexus distingue les informations disponibles, les hypothèses et les limites. Il ne doit jamais présenter une action externe comme effectuée sans exécution réelle.

## 🌐 Publication

Le projet peut être publié sur GitHub Pages pour la partie statique et sur Vercel pour les endpoints serveur.

> Chaque nouvelle version doit compléter cet historique et apporter au moins une amélioration supplémentaire, même si elle n’était pas demandée initialement.
