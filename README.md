# 🤖 Nexus IA

Projet d'intelligence artificielle développé progressivement.

## 🚀 Historique des versions

| Version | Évolution principale |
|---|---|
| **V0** | 🔒 Première page Web de Nexus IA, affichant « Accès fermé ». [Voir la page archivée](v0.html). |
| **V0.1** | 🧠 Premier prototype local : réponses simples, identité de Nexus et mémorisation du prénom. |
| **V0.2** | 💬 Amélioration des échanges et de la mémoire locale. |
| **V0.3** | 🧠 Base de connaissances et réponses plus structurées. |
| **V0.4** | 🌐 Passage vers une interface Web plus complète. |
| **V0.5** | 💻 Premières fonctions orientées code et amélioration de l'interface. |
| **V0.6** | 🤖 Connexion à un backend IA pour obtenir de vraies réponses génératives. |
| **V0.7** | 🧠 Amélioration du contexte conversationnel et de la fiabilité des réponses. |
| **V0.8** | 🎨 Préparation puis intégration des fonctions de génération d'images. |
| **V0.9** | 🚀 Base du projet Nexus IA moderne : interface sombre, chat et backend serveur. |
| **V1.0** | 🎉 Première version majeure de Nexus IA. Chat Web fonctionnel avec architecture serveur. |
| **V1.1** | 💻 Génération de code plus fiable, vérifications du code, mémoire et interface améliorées. |
| **V1.2** | 🎨 Amélioration de la génération d'images. |
| **V1.3** | 🖼️ Analyse, questions et modification d'images avec IA multimodale. |
| **V1.4** | 📎 Prise en charge des images et documents : PDF, DOCX, ODT, TXT, MD, CSV et JSON. Jusqu'à 20 images à analyser ensemble. |
| **V1.5** | ⚙️ Amélioration générale de Nexus IA : IA, code, images, documents, interface, performances et fiabilité. |
| **V1.6** | 🎥 Prise en charge des vidéos, avec analyse par extraction d'images. Jusqu'à 5 vidéos ou 20 photos. Ajout de l'étoile multicolore animée pendant la réflexion. |
| **V1.7** | 🎙️ Prise en charge de l'audio : enregistrement depuis le micro, fichiers audio et transcription. |
| **V1.8** | 🔴 **LIVE** : conversation vocale en direct, écoute continue, traitement automatique des phrases, réponse vocale et traînée multicolore réactive au son du micro. |
| **V1.9–V1.9.7** | 📱 Améliorations mobiles, LIVE, audio serveur et compatibilité iPhone/Safari. |
| **V2.0** | 🧠 Nouveau moteur de raisonnement, meilleur contexte, modèles plus performants, génération d'images et création vidéo. |
| **V2.1** | 🔴 **Nouveau LIVE plein écran**, nouvel orb lumineux réactif, bouton d'enregistrement d'écran et architecture préparée pour un futur moteur Nexus indépendant. |
| **V2.2** | 📷 **Vision LIVE** : caméra avant/arrière, aperçu en direct, zoom matériel quand disponible et transmission d'une image caméra récente à Nexus pour analyser la scène pendant le LIVE. |
| **V2.3** | 🚀 **Amélioration générale majeure** : intelligence et contexte renforcés, multimodalité et LIVE mieux préparés, génération contrôlable, interface actualisée, meilleure gestion des réponses et architecture plus robuste pour les prochaines évolutions. |
| **V2.4** | 🛠️ **Amélioration générale** : raisonnement adaptatif, contrôle des générations, continuité conversationnelle renforcée et fiabilité globale améliorée. |
| **V2.5** | 🧠 **Intelligence renforcée** : vérification interne en deux passes, contrôle plus strict des faits, calculs, code et sciences, réponses complexes plus profondes et température abaissée pour privilégier la précision. Petit bonus : meilleure détection des incertitudes pour éviter les inventions. |
| **V2.6** | 🚀 **Amélioration générale** : moteur plus robuste, profondeur adaptative mieux utilisée, délai réseau contrôlé, rendu Markdown amélioré, interface/version actualisées et meilleure continuité globale. Petit bonus : les titres Markdown sont maintenant correctement affichés dans les réponses. |
| **V2.7** | 🎵 **Création musicale IA** : Nexus peut maintenant composer de la musique à partir d’une description, générer un fichier audio et l’écouter directement dans la conversation. Petit bonus : ajout d’un bouton dédié « Création musicale » dans le menu 📎. |
| **V3.0** | 🌌 **Nexus Core** : nouvelle architecture d’orchestration, mode Mission, planification multi-étapes, vérification, contrat de moteur indépendant, console privée de diagnostics et isolation renforcée des historiques par profil navigateur. Petit bonus : mode concentration fonctionnel et console Admin protégée par mot de passe serveur. |

| **V3.1** | 🎯 **Mission Engine** : plans de mission dynamiques, priorités, orchestration structurée, affichage du plan réel dans l’interface et diagnostics GitHub dans la console privée. Petit bonus : le moteur distingue automatiquement une demande simple d’une mission complexe. |
| **V3.2** | ⚙️ **Mission Execution Engine** : les missions ont maintenant un identifiant, un cycle de vie et des états `pending`, `running`, `completed`, `failed` et `skipped`. Le backend suit le démarrage et la finalisation d’une mission et l’interface affiche l’état de chaque étape. Petit bonus : chaque étape possède un identifiant et des horodatages pour préparer la reprise et le suivi futur. |
| **V3.3** | 🛡️ **Nexus Resilience / Fallback Engine** : GPT-5.6 Sol devient le moteur principal direct via OpenAI quand `OPENAI_API_KEY` est configurée. En cas d’indisponibilité, Nexus tente automatiquement un moteur de secours compatible configuré (`NEXUS_FALLBACK_API_URL`, `NEXUS_FALLBACK_API_KEY`, `NEXUS_FALLBACK_MODEL`). Petit bonus : le routage réel et l’activation du secours sont visibles dans les diagnostics Admin et l’interface. |
| **V3.4** | 🧠 **Verification + Self-Correction Engine** : Nexus vérifie les réponses complexes avant de les finaliser et peut les corriger automatiquement. Nouveau **Context Advisor** : lorsque la demande semble ambiguë ou manque de contexte, Nexus fournit au moteur principal des informations supplémentaires issues du contexte disponible, de l’historique, de la mémoire locale et des documents fournis. Petit bonus : le statut de vérification et du Context Advisor est renvoyé par l’API. |
| **V3.5** | 🧠 **Relevant Memory** : sélection des souvenirs locaux les plus pertinents pour la demande actuelle, avec priorité au contexte récent et gestion des contradictions. |
| **V3.6** | 🤖 **Specialized Agents** : Nexus sélectionne automatiquement un agent spécialisé pour le code, les sciences, les études, l’analyse ou les demandes générales, sous le contrôle du Nexus Core. |
| **V3.7** | 🌌 **Autonomous Nexus Core** : orchestration adaptative, choix automatique de stratégie, planification selon la complexité, agents spécialisés et vérification/correction intégrés dans une boucle de décision contrôlée. |

## 📌 Version actuelle

**Nexus IA V3.7**

La V3.7 est maintenant intégrée au projet.

## V3.7 — Nexus Core autonome

La V3.7 finalise l’orchestration du cœur Nexus : le backend choisit automatiquement une stratégie adaptée à la complexité, active un agent spécialisé lorsque cela apporte une valeur réelle, puis vérifie et corrige les réponses complexes si nécessaire. Le modèle reste interchangeable : le cœur Nexus conserve les règles d’orchestration indépendamment du fournisseur.

### Orchestration V3.7
- 🧭 Stratégie adaptative selon la complexité
- 🤖 Sélection automatique d’un agent spécialisé
- 🎯 Planification et missions multi-étapes
- 🔍 Vérification interne des tâches complexes
- 🛠️ Correction automatique lorsque le contrôle détecte un problème utile à corriger
- 🛡️ Routage principal + moteur de secours conservé
- 🔒 Aucun outil ou accès externe n’est prétendu sans exécution réelle

## ✨ Capacités actuelles

- 💬 Conversation avec Nexus IA
- 🧠 Mémoire locale et contexte conversationnel
- 💻 Génération de code
- 🎨 Génération d'images
- 🎵 Création de musique par IA
- 🖼️ Analyse d'images
- ✏️ Modification d'images par instructions
- 📄 Lecture de PDF, Word, LibreOffice et fichiers texte
- 🖼️ Analyse de plusieurs images à la fois, jusqu'à 20 photos
- 🎥 Analyse de vidéos, jusqu'à 5 vidéos
- 🎙️ Enregistrement audio depuis le navigateur
- 🎵 Import de fichiers audio
- 📝 Transcription audio
- ✨ Animation étoile multicolore pendant la réflexion
- 🔴 Mode LIVE vocal
- 👂 Écoute continue en français
- 🔊 Réponse vocale de Nexus
- 🌈 Traînée multicolore animée réactive au volume du micro
- ⏹️ Arrêt immédiat du mode LIVE
- 📱 Interface LIVE adaptée au mobile et au bureau
- 🌐 LIVE plein écran avec nouvelle interface
- ✨ Orb lumineux réactif au son
- 📹 Enregistrement d'écran depuis le LIVE quand le navigateur le permet
- 🧠 Nexus Core indépendant du moteur IA externe
- ⌨️ Touche Échap pour quitter rapidement le LIVE sur ordinateur
- 📷 Caméra avant et arrière dans le LIVE
- 🔍 Zoom de caméra lorsque le navigateur/appareil l'autorise
- 👁️ Nexus peut analyser une image récente de la caméra lors d'une question vocale
- 🧠 Historique conversationnel transmis avec les rôles utilisateur/assistant pour une meilleure continuité
- ⚙️ Profondeur de réponse adaptative selon la complexité de la demande\n- 🌌 Nexus Core et planification de missions multi-étapes\n- 🔐 Historique isolé par profil navigateur, sans clé historique globale héritée\n- 🛡️ Console Admin privée avec diagnostics serveur protégés par mot de passe

## 🔴 V2.1 — LIVE

La V2.1 transforme le LIVE de Nexus IA en une interface vocale plein écran.

- 🔴 Activation/désactivation du LIVE
- 🎙️ Reconnaissance vocale française continue
- 👂 Nexus écoute sans demander de cliquer sur Envoyer à chaque phrase
- 🤖 Les phrases reconnues sont automatiquement envoyées au backend IA
- 🧠 L'étoile de réflexion existante s'affiche pendant le traitement serveur
- 🔊 Nexus lit ses réponses avec la synthèse vocale du navigateur
- 🌈 Le trail multicolore réagit en temps réel au niveau sonore du micro
- ⏹️ Bouton Arrêter pour couper le micro et la synthèse vocale
- 💬 Les messages restent visibles dans la conversation
- 📱 Contrôles responsive pour ordinateur et mobile

> Cet historique doit être complété à chaque sortie de nouvelle version. Chaque mise à jour doit aussi apporter au moins une petite amélioration supplémentaire, même si elle n'était pas demandée initialement.

## 🌐 Publication

Le projet peut être publié sur GitHub Pages pour la partie statique et sur Vercel pour les endpoints serveur.

## 🏗️ Principe du projet

Nexus IA évolue progressivement : chaque nouvelle version ajoute une capacité importante sans supprimer les fonctions déjà disponibles.


## V2.8 — amélioration générale
- Interface et cohérence de version mises à jour.
- Ajout de l’export d’une conversation en fichier texte depuis le menu Outils.
- Ajout du bouton de création vidéo dans le menu de pièces jointes.
- Bonus : raccourci d’export disponible aussi dans le menu mobile.


## V2.9 — amélioration générale
- Version globale et cache des scripts mis à jour.
- Export des conversations enrichi avec l’horodatage de chaque message.
- Interface de génération plus réactive visuellement.
- Mode concentration ajouté pour réduire les distractions pendant une session.
- 🎁 Bonus : le mode concentration recentre automatiquement la zone de discussion.
\n\n## V3.0 — Nexus Core\n\nLa V3.0 inaugure une nouvelle architecture : Nexus n’est plus seulement une interface de chat, il dispose d’un cœur d’orchestration préparé pour gérer des missions complexes, vérifier ses résultats et évoluer vers un moteur Nexus indépendant.\n\n### 🔐 Confidentialité des conversations\nLes conversations locales sont maintenant isolées par un identifiant de profil navigateur. La migration V3 ne réutilise plus l’ancienne clé globale qui pouvait mélanger des historiques entre profils. Le serveur ne stocke pas l’historique envoyé au moteur : l’application transmet uniquement le contexte nécessaire à la requête.\n\n### 🛡️ Console privée\nUne console `/admin.html` est disponible pour le propriétaire du projet. Elle utilise `NEXUS_ADMIN_PASSWORD` côté serveur et affiche l’état des moteurs, l’environnement et les diagnostics. Le mot de passe ne doit jamais être placé dans le code source.\n\n> Pour activer la console, ajouter `NEXUS_ADMIN_PASSWORD` dans les variables d’environnement Vercel puis redéployer. Vercel recommande de conserver les secrets dans les variables d’environnement plutôt que dans le dépôt.\n

## V3.2 — Mission Execution Engine

La V3.2 fait évoluer la planification V3.1 vers un cycle de mission suivi côté Nexus Core : création, démarrage, suivi des étapes et finalisation. Les états restent honnêtes : Nexus ne prétend pas avoir effectué une action externe si aucun outil ne l’a réellement exécutée.

### États d’une mission

- `pending` : étape en attente
- `running` : étape active
- `completed` : étape terminée
- `failed` : étape interrompue
- `skipped` : étape ignorée

Chaque étape possède un identifiant, un ordre et des horodatages. Cette base prépare l’ajout d’outils et d’actions structurées dans les versions suivantes.


## V3.3 — Nexus Resilience / Fallback Engine

La V3.3 sépare clairement le cœur Nexus du fournisseur de modèle. Le modèle principal est **GPT-5.6 Sol** via l’API OpenAI. Si le moteur principal échoue ou devient indisponible pour la requête en cours, Nexus essaie automatiquement le moteur de secours configuré.

### Routage

- Principal : `OPENAI_API_KEY` + `gpt-5.6-sol`
- Secours configurable : `NEXUS_FALLBACK_API_URL` + `NEXUS_FALLBACK_API_KEY` + `NEXUS_FALLBACK_MODEL`
- Pont de compatibilité temporaire : `POLLINATIONS_API_KEY`
- Le pont historique n’est pas présenté comme un modèle interne Nexus.
- Une résilience persistante entre plusieurs instances nécessitera plus tard un stockage partagé pour un circuit breaker et des métriques de santé.

### Bonus V3.3

Le routage indique désormais quel moteur a réellement répondu. L’interface signale l’activation du mode secours et la console Admin expose la configuration des moteurs sans afficher les clés secrètes.


## V3.4 — Verification + Self-Correction Engine

La V3.4 ajoute une deuxième couche au-dessus du modèle principal : Nexus Core peut préparer le contexte nécessaire avant la génération, puis vérifier le brouillon et demander une correction finale lorsque des problèmes importants sont détectés.

### Context Advisor

Quand une demande présente des signes d’ambiguïté, Nexus rassemble les informations pertinentes déjà disponibles : historique récent, mémoire locale, mode détecté et document fourni. Ces éléments sont transmis au moteur principal comme contexte supplémentaire. Nexus ne prétend pas inventer des connaissances internes inexistantes : il exploite uniquement les informations réellement disponibles.

### Vérification et auto-correction

Pour les tâches complexes ou nécessitant davantage de contexte, Nexus lance une vérification séparée. Si le vérificateur détecte une correction utile, une nouvelle réponse finale est générée à partir du brouillon et des corrections. Le raisonnement privé du vérificateur n’est jamais affiché à l’utilisateur.
