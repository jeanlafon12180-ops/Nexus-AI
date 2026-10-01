# 🤖 Nexus IA

Projet d’intelligence artificielle développé progressivement autour de **Nexus Core**, le moteur central d’intelligence et d’orchestration.

## 🚀 Version actuelle

**Nexus IA V4.6 — Nexus Core Intelligence**

La V4.6 transforme Nexus Core en moteur de missions plus structuré : reprise de mission, récupération automatique limitée, routage d’agents par score, vérification adaptative et statut Core enrichi, tout en conservant les capacités multimodales et la résilience des versions précédentes.

### 🧠 Nexus Core V4.6

- 🎯 **Intent Engine V4.6** : analyse de l’objectif, du domaine, de la complexité, du contexte et du niveau de confiance.
- 🧩 **Mission Graph V4.6** : missions découpées en étapes avec dépendances, états, progression et reprise.
- 🤖 **Agent Router V4.6** : scoring des agents, sélection d’un agent principal et constitution d’une équipe complémentaire lorsque c’est pertinent.
- 🔗 **Context Advisor V4.6** : meilleure utilisation de l’historique, de la mémoire et des documents pertinents.
- 🎚️ **Adaptive Response** : niveau de détail et structure adaptés à la complexité réelle de la demande.
- 🔍 **Verification V4.6** : contrôle interne des réponses importantes avec mode de vérification adapté au domaine.
- 🛡️ **Auto-Recovery + Fallback** : récupération limitée d’une étape en échec et maintien du routage de secours.
- 🔒 **Honnêteté opérationnelle** : Nexus ne prétend jamais avoir utilisé un outil, testé du code ou effectué une action qui n’a pas réellement eu lieu.
- ▶️ **Mission Resume** : reprise d’une mission fournie par l’application sans mélanger ses états avec une autre session.
- 🔐 **Mémoire locale** : contexte isolé par profil navigateur ; les données persistantes restent limitées à ce que l’application fournit réellement au Core.

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
| **V4.5** | 🧠 **Nexus Core Adaptive** : Intent Engine V4.5, Mission Graph, orchestration multi-agents, réponse adaptative, vérification renforcée et interface alignée. |

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

- `api/nexus-core.js` — intelligence, missions, reprise et récupération Nexus Core V4.6
- `api/nexus-assist.js` — contexte, scoring d’agents, équipe spécialisée, intention et vérification adaptative
- `api/chat.js` — pipeline conversationnel Nexus Core
- `api/model-router.js` — routage des modèles
- `js/memory.js` — mémoire et contexte local
- `js/app.js` — interface principale
- `index.html` — application Web Nexus IA V4.6
- `admin.html` — console privée Nexus Core V4.6

## 🔐 Confidentialité et fiabilité

La mémoire et les conversations sont isolées par profil navigateur. Les secrets serveur ne doivent jamais être placés dans le code source.

Nexus distingue les informations disponibles, les hypothèses et les limites. Il ne doit jamais présenter une action externe comme effectuée sans exécution réelle.

## 🌐 Publication

Le projet peut être publié sur GitHub Pages pour la partie statique et sur Vercel pour les endpoints serveur.

> Chaque nouvelle version doit compléter cet historique et apporter au moins une amélioration supplémentaire, même si elle n’était pas demandée initialement.
\n\n## 🆕 V4.5 — Pipeline de mission\n\n`Demande → contexte → intention → plan → Agent Router → exécution → vérification adaptative → récupération éventuelle → correction → résultat`\n\nLes mécanismes de récupération sont volontairement bornés pour éviter les boucles infinies. Les agents spécialisés restent des rôles orchestrés par Nexus Core et ne sont pas présentés comme des systèmes autonomes indépendants.\n

## 🌌 V4.5 — Nexus Project OS

La V4.6 introduit une couche de gestion de projet au-dessus du Mission Engine.

- 🎯 **Project State** : objectif, contexte et contraintes structurés.
- 📦 **Deliverable Tracking** : suivi des livrables et de leur état.
- 🧭 **Project Checkpoints** : jalons horodatés pour suivre l’avancement.
- 🧠 **Project Brief** : synthèse structurée injectée dans le contexte de Nexus.
- 🔄 **Mission ↔ Project** : une mission peut alimenter l’état d’un projet.
- 🤖 **Agent Router 4.5** : sélection et composition de rôles spécialisés.
- 🛡️ **Recovery** : reprise bornée des étapes en échec.
- 🔒 **État fourni par l’application** : le Core ne prétend pas disposer d’une persistance externe qu’il n’a pas réellement.

Pipeline V4.6 :

`Projet → contexte → intention → plan → Agent Router → mission → checkpoints → vérification → livrables → résultat`

La V4.6 conserve la règle d’honnêteté opérationnelle : un livrable, une vérification ou une action externe ne sont pas déclarés réalisés sans résultat correspondant.


## 🚀 V4.6 — Nexus Workspace & Model Gateway

La V4.6 prépare Nexus IA à fonctionner sans dépendre architecturalement d'un fournisseur unique.

- 🧠 **Nexus Model Gateway V4.6** : couche d'abstraction entre Nexus Core et les fournisseurs de modèles.
- 🔌 **Provider-independent Core** : le Core ne connaît plus les détails HTTP du fournisseur.
- 🔀 **Model Router V4.6** : choisit un fournisseur configuré et applique le fallback.
- 🏗️ **Nexus Workspace** : base préparatoire pour réunir projet, missions, livrables, checkpoints et état du Core.
- 💾 **Project State V4.6** : la clé locale évolue vers le format V4.6.
- 🔒 **Aucune dépendance fictive** : V4.6 ne prétend pas posséder son propre modèle. L'abstraction est prête, les modèles restent configurés séparément.

Architecture cible :

`Nexus Workspace → Nexus Core → Nexus Model Gateway → fournisseur de modèle`

À terme, un moteur Nexus hébergé ou local pourra remplacer un fournisseur externe sans réécrire l'orchestration métier.
