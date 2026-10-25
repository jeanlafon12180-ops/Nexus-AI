# Étape 4 — Configuration des fournisseurs IA

## Ajouté sur `architecture/v1`

- `src/server/config/provider-config.ts` lit les clés et modèles depuis les variables d'environnement côté serveur.
- `src/server/providers/openai-compatible-adapter.ts` prend en charge les formats Chat Completions pour OpenAI, xAI/Grok, DeepSeek et Mistral.
- `src/server/providers/claude-adapter.ts` adapte l'API Messages d'Anthropic.
- `src/server/providers/gemini-adapter.ts` adapte l'API Gemini `generateContent`.
- `src/server/chat/model-registry.ts` déclare les six fournisseurs sous des identifiants logiques stables.
- `.env.example` documente les noms des variables sans inclure de secrets.

## Variables d'environnement

Définir les variables dans le gestionnaire de secrets de l'hébergeur ou dans `.env.local` en développement local. Ne jamais committer de clés réelles. Ne jamais utiliser le préfixe `NEXT_PUBLIC_` pour les secrets.

Un fournisseur est disponible uniquement lorsque sa clé API est définie. Le modèle possède une valeur par défaut configurable dans les variables `NEXUS_*_MODEL`.

## Limites et points à vérifier

- Aucune clé API réelle n'a été fournie ni enregistrée ; aucun appel payant à un fournisseur n'a été effectué.
- Les réponses n'ont pas encore été validées en ligne avec les comptes fournisseurs.
- Les quatre adaptateurs OpenAI/Grok/DeepSeek/Mistral utilisent un format de requête compatible OpenAI ; chaque fournisseur peut imposer des différences de paramètres ou de modèle.
- La clé Gemini est transmise dans le paramètre de requête conformément à l'API utilisée : les journaux proxy/HTTP ne doivent jamais enregistrer l'URL complète.
- Le registre est désormais prérempli mais les fournisseurs sans clé restent indisponibles.
- Cette étape ne prétend pas constituer un build complet Next.js ni un déploiement de production.

## Vérification locale effectuée

Après l'ajout des adaptateurs, `npm run typecheck` réussit et `npm test` passe 9 tests sur 9. Ces tests vérifient la validation des entrées et les règles de routage ; ils ne remplacent pas un test d'intégration avec des clés réelles.
