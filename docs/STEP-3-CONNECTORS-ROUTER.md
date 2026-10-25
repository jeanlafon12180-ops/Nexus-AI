# Étape 3 — Connecteurs et Model Router

## Réalisé sur la branche `architecture/v1`

- `src/server/providers/provider-adapter.ts` : contrat commun des adaptateurs et erreurs normalisées.
- `src/server/chat/model-registry.ts` : registre côté serveur pour les modèles déclarés.
- `src/server/chat/model-router.ts` : sélection d'un modèle disponible ou rejet explicite.
- `src/server/chat/fallback-manager.ts` : un seul basculement vers un modèle secondaire, uniquement pour une erreur déclarée comme transitoire.

## État actuel

Le registre est volontairement vide : aucun fournisseur n'est connecté et aucune clé API n'a été ajoutée. Les fichiers définissent la logique serveur, mais ne sont pas encore reliés à une route HTTP ou à l'interface. Le dépôt existant est une application statique ; ces fichiers TypeScript nécessitent une configuration de build/backend avant d'être exécutables.

## Sécurité et comportement

- Les adaptateurs sont des modules serveur, pas du code client.
- Le routeur n'accepte pas d'URL fournisseur fournie par le navigateur.
- Aucun endpoint ni secret fournisseur n'est ajouté.
- Le secours ne tourne pas en boucle et ne simule pas de modèle disponible.
- Le changement de modèle ne contourne pas une limite de coût ou une panne générale.

## À faire ensuite

1. Choisir la stratégie de backend et configurer le build TypeScript/Next.js.
2. Ajouter tests unitaires du registre, du routeur et du fallback.
3. Implémenter une route serveur `POST /api/chat` qui valide les entrées.
4. Ajouter un adaptateur fournisseur réel à l'étape 4, après configuration sécurisée des secrets.
