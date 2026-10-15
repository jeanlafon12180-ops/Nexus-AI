# Nexus IA — V0.3

V0.3 améliore le moteur JavaScript local sans introduire de service distant ni de clé API.

## Améliorations
- Réponses thématiques plus détaillées (informatique, IA, programmation, histoire et notions de mathématiques).
- Calculatrice locale avec parenthèses, priorités opératoires, puissances et contrôle des divisions par zéro.
- Mémoire locale explicite pour le prénom, les goûts et le projet.
- Réponses transparentes lorsqu'une question dépasse les connaissances intégrées.
- Interface et style conservés ; aucune dépendance obligatoire.

## Limites importantes
V0.3 reste un moteur à règles, pas un grand modèle de langage. Il ne peut pas connaître spontanément énormément de sujets ni apprendre de nouvelles connaissances comme un LLM. Pour un assistant généraliste beaucoup plus puissant sans API cloud, la prochaine étape est d'évaluer l'exécution d'un modèle ouvert dans un environnement compatible. Les modèles de langage locaux peuvent demander beaucoup de mémoire et de calcul et ne sont pas forcément exécutables dans un simple hébergement statique Vercel.

## Lancement
Ouvrir `index.html` dans un navigateur moderne ou servir le dossier avec `python -m http.server 8000`.

## Architecture
- `index.html` : interface
- `style.css` : présentation
- `nexus-core.js` : moteur local

Aucune requête réseau ni clé API n'est utilisée par le moteur.
