# 🤖 Nexus IA

Projet d’intelligence artificielle développé progressivement autour de **Nexus Core**, le moteur central d’intelligence et d’orchestration.

## 🚀 Version actuelle

**Nexus IA V4.9 — Nexus Cognitive Core**

La V4.9 transforme Nexus Core en moteur cognitif plus structuré : reprise de mission, récupération automatique limitée, routage d’agents par score, vérification adaptative et statut Core enrichi, tout en conservant les capacités multimodales et la résilience des versions précédentes.

### 🧠 Nexus Core V4.9

- 🎯 **Intent Engine V4.9** : analyse de l’objectif, du domaine, de la complexité, du contexte et du niveau de confiance.
- 🧩 **Mission Graph V4.9** : missions découpées en étapes avec dépendances, états, progression et reprise.
- 🤖 **Agent Router V4.9** : scoring des agents, sélection d’un agent principal et constitution d’une équipe complémentaire lorsque c’est pertinent.
- 🔗 **Context Advisor V4.9** : meilleure utilisation de l’historique, de la mémoire et des documents pertinents.
- 🎚️ **Adaptive Response** : niveau de détail et structure adaptés à la complexité réelle de la demande.
- 🔍 **Verification V4.9** : contrôle interne des réponses importantes avec mode de vérification adapté au domaine.
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

- `api/nexus-core.js` — intelligence, missions, reprise et récupération Nexus Core V4.9
- `api/nexus-assist.js` — contexte, scoring d’agents, équipe spécialisée, intention et vérification adaptative
- `api/chat.js` — pipeline conversationnel Nexus Core
- `api/model-router.js` — routage des modèles
- `js/memory.js` — mémoire et contexte local
- `js/app.js` — interface principale
- `index.html` — application Web Nexus IA V4.9
- `admin.html` — console privée Nexus Core V4.9

## 🔐 Confidentialité et fiabilité

La mémoire et les conversations sont isolées par profil navigateur. Les secrets serveur ne doivent jamais être placés dans le code source.

Nexus distingue les informations disponibles, les hypothèses et les limites. Il ne doit jamais présenter une action externe comme effectuée sans exécution réelle.

## 🌐 Publication

Le projet peut être publié sur GitHub Pages pour la partie statique et sur Vercel pour les endpoints serveur.

> Chaque nouvelle version doit compléter cet historique et apporter au moins une amélioration supplémentaire, même si elle n’était pas demandée initialement.
\n\n## 🆕 V4.5 — Pipeline de mission\n\n`Demande → contexte → intention → plan → Agent Router → exécution → vérification adaptative → récupération éventuelle → correction → résultat`\n\nLes mécanismes de récupération sont volontairement bornés pour éviter les boucles infinies. Les agents spécialisés restent des rôles orchestrés par Nexus Core et ne sont pas présentés comme des systèmes autonomes indépendants.\n

## 🌌 V4.5 — Nexus Project OS

La V4.9 introduit une couche de gestion de projet au-dessus du Mission Engine.

- 🎯 **Project State** : objectif, contexte et contraintes structurés.
- 📦 **Deliverable Tracking** : suivi des livrables et de leur état.
- 🧭 **Project Checkpoints** : jalons horodatés pour suivre l’avancement.
- 🧠 **Project Brief** : synthèse structurée injectée dans le contexte de Nexus.
- 🔄 **Mission ↔ Project** : une mission peut alimenter l’état d’un projet.
- 🤖 **Agent Router 4.5** : sélection et composition de rôles spécialisés.
- 🛡️ **Recovery** : reprise bornée des étapes en échec.
- 🔒 **État fourni par l’application** : le Core ne prétend pas disposer d’une persistance externe qu’il n’a pas réellement.

Pipeline V4.9 :

`Projet → contexte → intention → plan → Agent Router → mission → checkpoints → vérification → livrables → résultat`

La V4.9 conserve la règle d’honnêteté opérationnelle : un livrable, une vérification ou une action externe ne sont pas déclarés réalisés sans résultat correspondant.


## 🚀 V4.9 — Nexus Workspace & Model Gateway

La V4.9 prépare Nexus IA à fonctionner sans dépendre architecturalement d'un fournisseur unique.

- 🧠 **Nexus Model Gateway V4.9** : couche d'abstraction entre Nexus Core et les fournisseurs de modèles.
- 🔌 **Provider-independent Core** : le Core ne connaît plus les détails HTTP du fournisseur.
- 🔀 **Model Router V4.9** : choisit un fournisseur configuré et applique le fallback.
- 🏗️ **Nexus Workspace** : base préparatoire pour réunir projet, missions, livrables, checkpoints et état du Core.
- 💾 **Project State V4.9** : la clé locale évolue vers le format V4.9.
- 🔒 **Aucune dépendance fictive** : V4.9 ne prétend pas posséder son propre modèle. L'abstraction est prête, les modèles restent configurés séparément.

Architecture cible :

`Nexus Workspace → Nexus Core → Nexus Model Gateway → fournisseur de modèle`

À terme, un moteur Nexus hébergé ou local pourra remplacer un fournisseur externe sans réécrire l'orchestration métier.


## 🧠 V4.9 — Nexus Cognitive Core

La V4.9 suit une règle simple : améliorer l’ensemble du système à chaque version, renforcer fortement Nexus Core, puis ajouter une amélioration originale.

### Cognitive Core
- 🧠 **Cognitive Core V4.9** : boucle structurée Comprendre → Contextualiser → Décider → Exécuter → Vérifier → Adapter.
- 🔁 **Multi-pass Intelligence** : profondeur adaptative selon la complexité ; les tâches simples restent rapides.
- 🗂️ **Context Intelligence** : séparation du contexte immédiat, conversationnel, projet, mémoire et preuves documentaires.
- 🧭 **Decision Engine V4.9** : choix automatique entre réponse directe, mission, analyse, correction, création, outil ou clarification.
- 🤖 **Agent Strategy Composition** : le routage d’agents devient une stratégie plutôt qu’un simple score.
- 🛡️ **Adaptive Recovery** : récupération bornée et réévaluation de stratégie.
- 🔍 **Multi-pass Verification** : vérification renforcée sur les tâches qui le nécessitent.
- 🔌 **Model Gateway V4.9** : abstraction fournisseur conservée et renforcée.

### Project Intelligence
Le Project OS conserve ses objectifs, contraintes, décisions, missions, livrables et checkpoints. Le Workspace V4.9 expose ces éléments localement sans prétendre fournir une persistance serveur inexistante.

### Touche Nexus
**Decision Engine** : une couche centrale décide du niveau d’orchestration nécessaire avant l’exécution, afin d’éviter à la fois le sous-traitement des tâches complexes et la sur-orchestration des demandes simples.

Pipeline V4.9 :

`Projet → contexte structuré → compréhension → décision → plan cognitif → Agent Router → exécution → vérification multi-pass → adaptation → livrable`

> V4.9 n’introduit pas un nouveau modèle fondamental. Il améliore l’intelligence d’orchestration autour des modèles configurés.


## 🚀 V4.9 — Nexus Adaptive Intelligence

V4.9 applique la règle d’évolution globale : Nexus Core est fortement renforcé, puis les systèmes périphériques sont alignés.

### 🧠 Nexus Adaptive Intelligence
- 🎯 **Goal Engine V4.9** : transforme la demande en objectif, critères et résultat attendu.
- 📊 **Self-Evaluation / Quality Engine** : évalue l’alignement du résultat avec l’objectif et déclenche une adaptation bornée si nécessaire.
- 🗂️ **Context Priority Engine** : hiérarchise contexte immédiat, projet, document, conversation et mémoire.
- 🔄 **Adaptive Goal Plan** : amélioration et vérification supplémentaires uniquement lorsque le résultat n’est pas suffisamment aligné.
- ⚠️ **Project Risk Engine** : détecte quelques risques structurels simples dans l’état du projet.
- 🤖 **Goal-driven Agent Strategy** : les agents restent sous le contrôle de Nexus Core mais leur sélection peut être guidée par l’objectif.
- 🔌 **Model Capability Registry** : décrit les capacités disponibles des fournisseurs configurés afin de préparer un routage par capacité.

### 🔐 Fiabilité
L’auto-évaluation V4.9 est bornée. Elle ne transforme pas une heuristique en preuve et ne prétend pas qu’un livrable externe a été exécuté ou testé sans résultat réel.

Pipeline V4.9 :

`Demande → Goal Engine → Context Priority → Decision Engine → Cognitive Plan → Agent Strategy → Model Gateway → Résultat → Verification → Self-Evaluation → Adaptation éventuelle → Réponse`

> V4.9 n’introduit toujours pas de modèle fondamental Nexus propriétaire. Elle renforce la couche d’intelligence et d’orchestration autour des modèles configurés.


## ⚙️ V4.9 — Nexus Runtime

V4.9 fait évoluer Nexus Adaptive Intelligence vers un moteur d'exécution structuré.

### Nexus Runtime
- ⚙️ état de mission et des tâches
- 🧩 graphe de dépendances
- 📡 événements de runtime
- 💾 checkpoints
- 🔄 récupération contrôlée
- ▶️ continuité de mission
- 📊 progression technique
- 🧠 mémoire structurée session/projet/mission/décisions/événements

### Pipeline V4.9

`Demande → Goal → Context Priority → Decision → Runtime Mission → Task Graph → Execution → Events → Verification → Self-Evaluation → Adaptation → Checkpoint → Completion`

### Mission Continuity

Une mission peut conserver un checkpoint technique et reprendre depuis son dernier état connu. V4.9 limite volontairement la récupération et ne prétend pas qu'une action externe a été exécutée lorsqu'aucun résultat réel n'est disponible.

> V4.9 n'introduit toujours pas de modèle fondamental Nexus propriétaire. Le gain vient du Runtime, de la mémoire structurée et de l'orchestration.
