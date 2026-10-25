# Étape 3 — Connecteurs et Model Router

## Réalisé sur la branche `architecture/v1`

- `src/server/providers/provider-adapter.ts` : contrat commun des adaptateurs et erreurs normalisées.
- `src/server/chat/model-registry.ts` : registre côté serveur pour les modèles déclarés.
- `src/server/chat/model-router.ts` : sélection d'un modèle disponible ou rejet explicite.
- `src/server/chat/fallback-manager.ts` : un seul basculement vers un modèle secondaire, uniquement pour une erreur déclarée comme transitoire.
- `src/server/security/validate-request.ts` : validation de la structure, des rôles et des limites de taille des messages.
- `src/shared/errors.ts` : format commun des erreurs HTTP.
- `src/app/api/chat/route.ts` : route POST côté serveur, réponse JSON et traduction des erreurs.
- `tests/contracts/chat-contracts.test.ts` : cas de validation de requêtes.
- `tests/router/model-router.test.ts` : cas de base du registre et du routeur.

## État et limites actuels

Les fichiers de code de l'étape 3 sont créés. **L'exécution et les tests n'ont pas encore été vérifiés**, car le dépôt d'origine est une application statique et ne possède pas encore de `package.json`, de configuration TypeScript/Next.js ni de pipeline de tests. Il faut donc traiter cette étape comme un squelette serveur prêt à intégrer, pas comme un backend déjà déployé ou opérationnel.

Le registre est volontairement vide : aucun fournisseur n'est connecté et aucune clé API n'a été ajoutée. La route renvoie donc `NO_MODEL_AVAILABLE` tant qu'aucun adaptateur configuré n'est enregistré.

## Sécurité et comportement

- Les adaptateurs sont des modules serveur, pas du code client.
- Le routeur n'accepte pas d'URL fournisseur fournie par le navigateur.
- La route exige du JSON, valide les entrées et ne renvoie pas les détails internes des exceptions.
- Le secours ne tourne pas en boucle et ne simule pas un modèle disponible.
- Le changement de modèle ne contourne pas une limite de coût ou une panne générale.
- Aucune clé réelle ni aucun appel fournisseur payant n'a été ajouté.

## Pour déclarer l'étape 3 entièrement opérationnelle

1. Configurer le backend Node.js/Next.js et les dépendances de build.
2. Relier la route et les modules au build réel.
3. Exécuter les tests automatisés et corriger les éventuelles erreurs TypeScript.
4. Déployer une Preview et vérifier les réponses HTTP sans secret.
5. Ajouter un adaptateur fournisseur à l'étape 4, après configuration sécurisée des secrets.
