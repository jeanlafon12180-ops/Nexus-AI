# Contrats et interfaces — Nexus IA V1

> Spécification pour l'étape 2. Ces contrats sont des interfaces proposées ; ils ne sont pas encore implémentés dans le code de production.

## 1. Principes de contrat

- Le navigateur parle uniquement à l'endpoint Nexus `POST /api/chat`.
- Le navigateur ne choisit pas librement un endpoint fournisseur et ne transmet aucune clé secrète.
- Le serveur valide la requête et applique sa propre liste de modèles autorisés.
- Les contrats publics contiennent uniquement des données nécessaires à l'interface.
- Les détails propres à un fournisseur sont confinés dans son adaptateur.

## 2. Requête HTTP

`POST /api/chat`

En-tête : `Content-Type: application/json`

Exemple de corps :

```json
{
  "messages": [
    { "role": "user", "content": "Bonjour Nexus" }
  ],
  "model": "auto",
  "conversationId": "optional-client-generated-id"
}
```

Règles :
- `messages` est requis, non vide, et limité en nombre de messages et en taille totale.
- `role` accepte uniquement les rôles explicitement permis par le serveur.
- `content` doit être une chaîne non vide après validation.
- `model` est un identifiant logique choisi dans une liste autorisée côté serveur ; `auto` demande au routeur de choisir.
- `conversationId` est facultatif et ne constitue pas une preuve d'identité.
- Les limites exactes seront fixées avant l'exposition publique.

## 3. Réponse HTTP de succès

```json
{
  "id": "request-id",
  "message": {
    "role": "assistant",
    "content": "Bonjour !"
  },
  "model": {
    "id": "logical-model-id",
    "provider": "provider-id"
  },
  "fallbackUsed": false
}
```

Le serveur ne renvoie jamais la clé API, les en-têtes du fournisseur, le prompt système privé ou des traces internes.

## 4. Erreurs normalisées

Format :

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Le service est temporairement indisponible.",
    "retryable": true,
    "requestId": "request-id"
  }
}
```

Codes proposés :
- `INVALID_REQUEST` — requête invalide.
- `REQUEST_TOO_LARGE` — dépasse la taille autorisée.
- `RATE_LIMITED` — limite d'usage atteinte.
- `MODEL_NOT_ALLOWED` — modèle non autorisé.
- `PROVIDER_NOT_CONFIGURED` — configuration serveur manquante.
- `PROVIDER_RATE_LIMITED` — limite/quota du fournisseur atteint.
- `PROVIDER_TIMEOUT` — délai dépassé.
- `PROVIDER_UNAVAILABLE` — fournisseur indisponible.
- `INVALID_PROVIDER_RESPONSE` — réponse externe invalide.
- `NO_MODEL_AVAILABLE` — aucun modèle utilisable.
- `INTERNAL_ERROR` — erreur interne sans détails sensibles.

Le serveur choisit le statut HTTP adapté ; le client affiche un message compréhensible et ne montre pas de trace technique.

## 5. Contrat d'adaptateur interne

Interface conceptuelle TypeScript :

```ts
export type ProviderErrorCode =
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE";

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateInput {
  messages: ModelMessage[];
  modelId: string;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface GenerateOutput {
  text: string;
  modelId: string;
  providerId: string;
  latencyMs: number;
}

export interface ProviderAdapter {
  readonly providerId: string;
  isConfigured(): boolean;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}
```

Les clés sont lues exclusivement par l'adaptateur côté serveur à partir de la configuration d'environnement. Elles ne font pas partie de `GenerateInput`, `GenerateOutput` ou de la réponse HTTP publique.

## 6. Model Registry et Model Router

Le registre fournit des métadonnées contrôlées côté serveur :
- identifiant logique du modèle ;
- fournisseur ;
- capacités prises en charge ;
- état de configuration ;
- éventuelle priorité de routage.

Le routeur reçoit une demande validée, filtre les modèles non configurés ou incompatibles, puis sélectionne un modèle. Il ne se fie jamais uniquement à une valeur fournie par le navigateur.

## 7. Fallback Manager

- Réessayer au maximum un nombre strictement limité de fois.
- Réessayer uniquement les erreurs transitoires et avec un délai contrôlé.
- Ne pas répéter à l'infini une erreur de clé manquante ou de quota épuisé.
- Basculer uniquement vers un modèle secondaire réellement configuré.
- Indiquer `fallbackUsed: true` si un modèle secondaire a répondu.
- Si aucun modèle n'est disponible, retourner `NO_MODEL_AVAILABLE` ou utiliser un outil local approprié ; ne pas simuler une génération LLM.

## 8. Nexus Core

Nexus Core reste responsable des fonctions déterministes telles que calculs et conversions. Il peut être appelé par l'orchestrateur comme outil local, mais son résultat ne doit pas être confondu avec une réponse d'un modèle de langage.

## 9. Tests de contrat minimaux

- Requête valide : schéma accepté.
- Messages manquants ou invalides : `INVALID_REQUEST`.
- Requête trop grande : `REQUEST_TOO_LARGE`.
- Modèle non autorisé : rejet avant tout appel fournisseur.
- Adaptateur non configuré : aucune requête réseau sortante.
- Timeout/quota/indisponibilité : code d'erreur normalisé.
- Fallback : au plus un basculement par règle de politique.
- Réponse publique : aucun secret ni en-tête fournisseur.
- Tous les fournisseurs indisponibles : erreur contrôlée, jamais une réponse inventée.

## 10. Étape suivante

Étape 3 : implémenter les adaptateurs et le Model Router après validation de ces contrats. Les clés réelles restent reportées à l'étape 4.
