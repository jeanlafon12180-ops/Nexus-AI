# Architecture de Nexus IA — V1

> Statut : proposition d'architecture, étape 1. Ce document décrit la cible ; il ne signifie pas que les composants serveur ou les fournisseurs sont déjà implémentés.

## 1. Objectif

Faire évoluer Nexus IA V0.2 (application statique HTML/CSS/JavaScript avec Nexus Core local) vers une application capable d'appeler plusieurs modèles d'IA, tout en conservant le moteur local, en protégeant les secrets et en préparant un mécanisme de secours.

## 2. État actuel

La branche `main` contient une interface statique et un moteur JavaScript local. Il n'y a actuellement ni backend, ni endpoint `/api/*`, ni fournisseur distant, ni clé API requise. Nexus Core n'est pas un LLM : il fournit des fonctions déterministes (intentions, contexte, mémoire locale, calculs et conversions).

**Règle :** ne pas ajouter de clé API dans le navigateur, dans `index.html`, dans `nexus-core.js`, ni dans Git.

## 3. Architecture cible

```text
Navigateur
  └── Interface Nexus IA
        └── Client applicatif
              │ requête HTTPS (sans secret fournisseur)
              ▼
Backend Nexus IA (Vercel Functions / Node.js)
  ├── Validation de la requête et limites d'usage
  ├── Orchestrateur Nexus
  │     ├── Contexte de conversation
  │     ├── Registre des modèles (Model Registry)
  │     ├── Model Router
  │     └── Gestion des erreurs et des secours
  ├── Adaptateurs de fournisseurs (interface commune)
  ├── Nexus Core local (outils déterministes compatibles)
  └── Journaux techniques minimisés
        │
        ├── Fournisseur externe A (plus tard)
        ├── Fournisseur externe B (plus tard)
        └── Modèle Nexus hébergé séparément (plus tard, si disponible)
```

Les fournisseurs et le modèle de secours sont des intégrations futures : aucun n'est configuré par ce document.

## 4. Responsabilités des composants

- **Interface** : afficher les messages, l'état de chargement et les erreurs ; ne jamais recevoir les clés secrètes.
- **Client applicatif** : envoyer une requête au backend et afficher la réponse.
- **Backend** : point d'entrée de confiance ; valider les entrées, appliquer les limites et appeler les adaptateurs.
- **Orchestrateur Nexus** : coordonner le contexte et choisir le chemin de traitement.
- **Model Registry** : déclarer les modèles disponibles, leurs capacités et leur état de configuration.
- **Model Router** : sélectionner un modèle selon la disponibilité, les capacités demandées et les règles de routage.
- **Adaptateurs** : traduire le format commun de Nexus vers le format propre à chaque fournisseur.
- **Fallback Manager** : traiter les erreurs transitoires et basculer vers une alternative autorisée. Éviter les boucles de tentatives.
- **Nexus Core** : garder les fonctions locales utiles (calcul, conversions et autres outils déterministes) ; ne pas le présenter comme un LLM.
- **Observabilité** : enregistrer le statut, la latence et le type d'erreur sans enregistrer par défaut les clés, les en-têtes secrets ou le contenu privé des conversations.

## 5. Contrat commun d'un adaptateur

Chaque adaptateur devra exposer une interface interne commune, indépendante du fournisseur :

- entrée : messages/contextes validés, modèle demandé, paramètres autorisés ;
- sortie : texte généré, identifiant du modèle, durée et métadonnées minimales ;
- erreurs normalisées : configuration manquante, limite/quota, délai dépassé, fournisseur indisponible, réponse invalide ;
- aucun secret retourné au client.

Le contrat exact sera défini pendant l'étape 2, avant d'implémenter les connecteurs.

## 6. Règles de routage et de secours

1. Valider la requête avant tout appel distant.
2. Sélectionner uniquement un modèle configuré et autorisé.
3. Distinguer les erreurs temporaires des erreurs de configuration ou de quota.
4. Limiter le nombre de tentatives et appliquer un délai maximal.
5. Si le modèle principal échoue, utiliser uniquement une alternative configurée et compatible.
6. Si aucun modèle distant n'est disponible, répondre clairement ou utiliser un outil local adapté ; ne pas inventer une réponse.
7. Un fallback vers un modèle Nexus n'est possible que si ce modèle est réellement exécutable et accessible. Il ne faut pas supposer que le moteur JavaScript actuel est un LLM.

Le changement de fournisseur ne résout pas une panne globale, l'absence de toutes les clés ou l'épuisement de tous les quotas. Ces situations doivent produire une erreur explicite et contrôlée.

## 7. Sécurité

- Les clés restent dans les variables d'environnement du backend Vercel, jamais dans les variables publiques du frontend.
- Ne jamais committer de fichier `.env` contenant des secrets.
- Valider la taille et la forme des requêtes.
- Ajouter des limites de débit et de coût avant d'ouvrir le service à d'autres utilisateurs.
- Ne pas faire confiance au nom de modèle envoyé par le navigateur : le backend applique sa propre liste autorisée.
- Ne pas journaliser les secrets ni les conversations complètes par défaut.
- Les changements de variables d'environnement nécessitent un nouveau déploiement pour être pris en compte.

## 8. GitHub et Vercel

- **GitHub** : code source, documentation, branches de travail et historique des changements.
- **Vercel** : hébergement de l'interface et exécution du backend dans des fonctions Node.js.
- **Branche de travail** : cette proposition est préparée sur `architecture/v1`, sans modifier `main`.
- **Environnements** : valider les changements en Preview avant tout déploiement de production.
- Un modèle nécessitant un runtime spécialisé ou un GPU pourra être hébergé séparément et appelé depuis le backend.

## 9. Décisions retenues pour l'étape 1

- Conserver Nexus Core au lieu de le remplacer.
- Introduire un backend sécurisé avant de connecter des fournisseurs distants.
- Définir un contrat commun aux modèles afin de limiter le couplage.
- Séparer sélection du modèle, adaptateurs et gestion des secours.
- Reporter les clés API à l'étape 4.
- Reporter l'implémentation des fichiers et interfaces détaillés à l'étape 2.
- Ne pas ajouter de dépendance ou de clé API dans cette étape.

## 10. Critères de validation de l'architecture

- Le navigateur ne contient aucun secret fournisseur.
- L'interface ne dépend pas directement d'un fournisseur précis.
- Un modèle peut être ajouté via un adaptateur sans réécrire l'interface.
- Les erreurs de quota, de délai et d'indisponibilité sont distinguées.
- Le secours ne boucle pas et n'affirme pas qu'un modèle est disponible s'il ne l'est pas.
- Nexus Core reste utilisable pour ses fonctions déterministes même si les fournisseurs distants sont indisponibles.

## Prochaine étape

Étape 2 : définir l'arborescence cible et les contrats exacts entre l'interface, le backend, le Model Router, le registre et les adaptateurs. Aucun secret API ne sera ajouté pendant cette étape.
