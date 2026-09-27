# Nexus IA — application native

La branche `mobile-app` contient l'interface mobile et la configuration Capacitor de Nexus IA.

## Objectif

Conserver le moteur Nexus IA existant tout en l'emballant dans une vraie application iOS/Android.

## Développement local

1. Installer Node.js.
2. À la racine du dépôt : `npm install`
3. Synchroniser Capacitor : `npm run cap:sync`
4. Android : `npm run cap:android`
5. iOS : `npm run cap:ios`

La production Vercel continue d'utiliser les fichiers web existants. La branche `main` reste indépendante.
