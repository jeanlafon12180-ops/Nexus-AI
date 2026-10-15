# Nexus IA — V0.3.1

V0.3.1 améliore le moteur local sans API distante ni clé.

## Changements
- Réponses thématiques revues en informatique, IA, programmation, mathématiques, histoire et climat.
- Calculatrice locale avec parenthèses, priorités et puissances.
- Mémoire locale pour les informations explicitement données.
- Réponses plus utiles et transparentes en cas de sujet inconnu.
- Réponses de suivi pour demander de poursuivre ou approfondir.
- Interface existante conservée.

## Limites
Ce projet reste un moteur JavaScript à règles, pas un LLM. Il ne peut pas connaître spontanément tous les sujets. Pour un saut majeur de capacité, il faudra évaluer un modèle de langage ouvert exécuté localement ou un service externe. Vercel statique ne fournit pas à lui seul la puissance nécessaire à un grand modèle.

## Lancement
Ouvrir index.html dans un navigateur ou lancer python -m http.server 8000.
