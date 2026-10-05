# Nexus IA — V0

Nexus IA V0 est une base 100 % locale.

## Zéro API
- aucune API OpenAI
- aucune API Gemini
- aucune clé API
- aucun appel réseau effectué par le Core
- aucune dépendance obligatoire

## Nexus Core V0 amélioré
- classement d'intentions avec score
- plusieurs formulations d'une même demande
- contexte des derniers tours
- mémoire persistante locale via localStorage
- mémorisation du prénom, goûts, préférences et projet
- effacement de la mémoire
- calculatrice locale avec priorités opératoires, parenthèses et puissances
- réponses variées
- détection honnête des limites
- interface interne window.NexusCore pour les futurs modules

## Limite importante
Cette V0 n'est pas encore un grand modèle de langage. Des règles JavaScript seules ne peuvent pas reproduire les capacités d'un LLM moderne. Pour rester sans API distante tout en obtenant une vraie génération de langage, la prochaine étape majeure sera un modèle de langage exécuté localement.

La structure actuelle permet d'ajouter ce module sans reconstruire toute l'application.