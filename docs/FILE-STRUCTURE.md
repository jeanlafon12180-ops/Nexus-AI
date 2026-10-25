# Organisation des fichiers — Nexus IA V1

> Document de conception pour l'étape 2. Cette arborescence est la cible proposée ; elle n'affirme pas que ces fichiers existent déjà dans l'application.

## Principes

- Conserver la version statique actuelle jusqu'à ce qu'une migration contrôlée soit prête.
- Introduire un backend Node.js côté serveur avant les appels aux fournisseurs.
- Séparer les contrats, le routage, les adaptateurs et les fonctions locales.
- Aucun secret dans `public/`, dans le navigateur ou dans Git.
- Garder les premières modifications sur une branche de travail et vérifier le déploiement Preview avant production.

## Arborescence cible proposée

```text
Nexus-AI/
├── public/
│   └── assets/                 # Images, icônes et ressources publiques
├── src/
│   ├── app/
│   │   ├── page.tsx            # Interface principale
│   │   ├── layout.tsx          # Cadre de l'application
│   │   ├── globals.css         # Styles globaux
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # Point d'entrée HTTP du backend
│   ├── components/
│   │   ├── chat/               # Messages, composer, état de chargement
│   │   └── settings/           # Réglages d'interface, sans secrets
│   ├── client/
│   │   └── nexus-api-client.ts # Client HTTP vers /api/chat
│   ├── server/
│   │   ├── chat/
│   │   │   ├── orchestrator.ts # Coordonne une requête
│   │   │   ├── model-router.ts # Sélection du modèle autorisé
│   │   │   ├── model-registry.ts
│   │   │   └── fallback-manager.ts
│   │   ├── providers/
│   │   │   ├── provider-adapter.ts # Contrat commun
│   │   │   └── index.ts            # Enregistrement des adaptateurs
│   │   ├── config/
│   │   │   └── env.ts          # Validation de configuration serveur
│   │   └── security/
│   │       ├── validate-request.ts
│   │       └── rate-limit.ts   # À implémenter avant exposition publique
│   ├── core/
│   │   ├── nexus-core.ts       # Fonctions déterministes réutilisables
│   │   └── local-tools.ts      # Calculs/conversions, si séparés
│   └── shared/
│       ├── chat-contracts.ts   # Types partagés sans secrets
│       └── errors.ts           # Codes d'erreur normalisés
├── tests/
│   ├── contracts/
│   ├── router/
│   └── api/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FILE-STRUCTURE.md
│   └── INTERFACES.md
├── .env.example                # Noms de variables uniquement, valeurs factices
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Décisions importantes

1. **Migration à valider avant implémentation.** Le dépôt actuel est du HTML/CSS/JavaScript statique. Cette cible utilise Next.js et TypeScript ; c'est une évolution d'architecture, pas une simple réorganisation de fichiers.
2. Le dossier `src/app/api/chat/route.ts` correspond au style de routage App Router de Next.js et sera exécuté côté serveur.
3. `src/shared/` contient uniquement les types et utilitaires sûrs à partager. Les adaptateurs fournisseurs restent sous `src/server/`.
4. `public/` est accessible depuis le navigateur : aucun secret ou configuration privée ne doit s'y trouver.
5. Le `.env.example` peut lister des noms tels que `AI_GATEWAY_API_KEY=` uniquement comme exemples vides. Les vraies valeurs seront configurées à l'étape 4 dans Vercel.
6. L'ancien `index.html`, `style.css` et `nexus-core.js` doivent rester préservés dans `main` jusqu'à ce que la migration soit testée. Ne pas écraser le fonctionnement existant sans validation.

## Ordre d'implémentation suggéré

1. Vérifier les scripts et dépendances existants avant d'installer Next.js.
2. Créer les contrats partagés et leurs tests.
3. Créer le point d'entrée serveur sans fournisseur réel.
4. Adapter l'interface pour appeler le client HTTP.
5. Brancher Nexus Core pour les outils déterministes.
6. Ajouter les adaptateurs de modèles à l'étape 3, puis les secrets à l'étape 4.

## Hors périmètre de cette étape

- Aucune clé API réelle.
- Aucun appel vers un fournisseur payant.
- Aucun remplacement de la branche `main`.
- Aucun modèle Nexus de secours prétendument disponible avant qu'un runtime réel soit choisi.
