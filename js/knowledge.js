const entries = [
  {
    keys: ['cosinus', 'c est quoi le cosinus', 'definition du cosinus', 'cosinus en maths'],
    answer: '📐 **Cosinus**\n\nDans un triangle rectangle, le cosinus d’un angle est le rapport entre le côté adjacent à l’angle et l’hypoténuse.\n\n**Formule :** cos(angle) = côté adjacent ÷ hypoténuse.\n\n💡 Mémo : **CAH** = Cosinus = Adjacent / Hypoténuse.'
  },
  {
    keys: ['sinus', 'c est quoi le sinus', 'definition du sinus', 'sinus en maths'],
    answer: '📐 **Sinus**\n\nDans un triangle rectangle, le sinus d’un angle est le rapport entre le côté opposé à l’angle et l’hypoténuse.\n\n**Formule :** sin(angle) = côté opposé ÷ hypoténuse.\n\n💡 Mémo : **SOH** = Sinus = Opposé / Hypoténuse.'
  },
  {
    keys: ['tangente', 'c est quoi la tangente', 'definition de la tangente', 'tangente en maths'],
    answer: '📐 **Tangente**\n\nDans un triangle rectangle, la tangente d’un angle est le rapport entre le côté opposé et le côté adjacent.\n\n**Formule :** tan(angle) = côté opposé ÷ côté adjacent.\n\n💡 Mémo : **TOA** = Tangente = Opposé / Adjacent.'
  },
  {
    keys: ['trigonometrie', 'trigo', 'formules de trigonometrie'],
    answer: '📐 **Trigonométrie**\n\nDans un triangle rectangle :\n• cos(angle) = adjacent / hypoténuse\n• sin(angle) = opposé / hypoténuse\n• tan(angle) = opposé / adjacent\n\n💡 Mémo : **CAH – SOH – TOA**.'
  },
  {
    keys: ['pythagore', 'theoreme de pythagore', 'theoreme pythagore', 'c est quoi pythagore'],
    answer: '📏 **Théorème de Pythagore**\n\nDans un triangle rectangle, le carré de la longueur de l’hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.\n\n**Formule :** a² + b² = c², avec c l’hypoténuse.\n\n🧮 Exemple : 3² + 4² = 5², donc un triangle de côtés 3 cm, 4 cm et 5 cm est rectangle.'
  },
  {
    keys: ['reciproque de pythagore', 'reciproque pythagore'],
    answer: '📏 **Réciproque de Pythagore**\n\nSi, dans un triangle, le carré du plus grand côté est égal à la somme des carrés des deux autres côtés, alors le triangle est rectangle.'
  },
  {
    keys: ['thales', 'theoreme de thales', 'theoreme thales'],
    answer: '📏 **Théorème de Thalès**\n\nLorsque deux droites sécantes sont coupées par deux droites parallèles, les longueurs correspondantes des triangles obtenus sont proportionnelles.\n\nIl sert notamment à calculer une longueur inconnue à partir de rapports de longueurs.'
  },
  {
    keys: ['aire rectangle', 'aire d un rectangle', 'formule rectangle'],
    answer: '📐 **Aire d’un rectangle**\n\nAire = longueur × largeur.\n\nExemple : 8 cm × 3 cm = **24 cm²**.'
  },
  {
    keys: ['aire triangle', 'aire d un triangle', 'formule triangle'],
    answer: '📐 **Aire d’un triangle**\n\nAire = (base × hauteur) ÷ 2.'
  },
  {
    keys: ['aire cercle', 'aire d un cercle'],
    answer: '⭕ **Aire d’un disque**\n\nAire = π × rayon².\n\nAvec π ≈ 3,14159.'
  },
  {
    keys: ['classes grammaticales', '10 classes grammaticales', 'dix classes grammaticales', 'classes de mots'],
    answer: '🇫🇷 **Les principales classes grammaticales**\n\nOn distingue notamment :\n1. nom\n2. déterminant\n3. adjectif\n4. pronom\n5. verbe\n6. adverbe\n7. préposition\n8. conjonction de coordination\n9. conjonction de subordination\n10. interjection\n\n💡 Une classe grammaticale indique la nature d’un mot, par exemple « chat » est un nom et « rapidement » est un adverbe.'
  },
  {
    keys: ['nom commun', 'c est quoi un nom'],
    answer: '🇫🇷 **Nom**\n\nUn nom désigne généralement une personne, un animal, une chose, un lieu ou une idée.\n\nExemples : *maison, professeur, chien, liberté*.'
  },
  {
    keys: ['determinant', 'c est quoi un determinant'],
    answer: '🇫🇷 **Déterminant**\n\nLe déterminant accompagne un nom et permet notamment d’indiquer le genre et le nombre.\n\nExemples : *le, la, un, une, des, mon, cette*.'
  },
  {
    keys: ['adjectif', 'c est quoi un adjectif'],
    answer: '🇫🇷 **Adjectif qualificatif**\n\nUn adjectif apporte une précision sur un nom ou un pronom.\n\nExemple : dans « une grande maison », **grande** est un adjectif.'
  },
  {
    keys: ['pronom', 'c est quoi un pronom'],
    answer: '🇫🇷 **Pronom**\n\nUn pronom peut remplacer un nom ou un groupe nominal.\n\nExemples : *je, tu, il, elle, nous, celui-ci, qui*.'
  },
  {
    keys: ['verbe', 'c est quoi un verbe'],
    answer: '🇫🇷 **Verbe**\n\nLe verbe exprime généralement une action ou un état et peut être conjugué.\n\nExemples : *courir, être, réfléchir*.'
  },
  {
    keys: ['adverbe', 'c est quoi un adverbe'],
    answer: '🇫🇷 **Adverbe**\n\nUn adverbe précise notamment un verbe, un adjectif ou un autre adverbe.\n\nExemples : *vite, très, souvent, demain*.'
  },
  {
    keys: ['preposition', 'c est quoi une preposition'],
    answer: '🇫🇷 **Préposition**\n\nUne préposition sert à introduire un complément ou à relier des éléments.\n\nExemples : *à, de, dans, pour, avec, sans, sur*.'
  },
  {
    keys: ['conjonction de coordination', 'conjonctions de coordination', 'mais ou et donc or ni car'],
    answer: '🇫🇷 **Conjonctions de coordination**\n\nLe moyen mnémotechnique classique est : **mais, ou, et, donc, or, ni, car**.\n\nElles servent à relier des mots, groupes ou propositions.'
  },
  {
    keys: ['conjonction de subordination', 'conjonctions de subordination'],
    answer: '🇫🇷 **Conjonction de subordination**\n\nElle introduit une proposition subordonnée.\n\nExemples : *que, quand, lorsque, parce que, puisque, si, afin que*.'
  },
  {
    keys: ['interjection', 'c est quoi une interjection'],
    answer: '🇫🇷 **Interjection**\n\nUne interjection exprime souvent une émotion, une réaction ou un appel.\n\nExemples : *ah !, oh !, bravo !, zut !*.'
  },
  {
    keys: ['revolution francaise', 'revolution française', 'date revolution francaise'],
    answer: '🏛️ **Révolution française**\n\nElle commence en **1789**. Parmi les événements majeurs figurent la prise de la Bastille le 14 juillet 1789 et la Déclaration des droits de l’homme et du citoyen en août 1789.'
  },
  {
    keys: ['premiere guerre mondiale', 'premiere guerre mondiale date', '1ere guerre mondiale'],
    answer: '🌍 **Première Guerre mondiale**\n\nElle se déroule de **1914 à 1918**.'
  },
  {
    keys: ['seconde guerre mondiale', 'deuxieme guerre mondiale', '2e guerre mondiale'],
    answer: '🌍 **Seconde Guerre mondiale**\n\nElle se déroule de **1939 à 1945**.'
  },
  {
    keys: ['cellule', 'c est quoi une cellule', 'cellule svt'],
    answer: '🧬 **Cellule**\n\nLa cellule est l’unité de base du vivant. Certains êtres vivants sont constitués d’une seule cellule, d’autres de très nombreuses cellules spécialisées.'
  },
  {
    keys: ['adn', 'c est quoi adn'],
    answer: '🧬 **ADN**\n\nL’ADN est une molécule qui porte une grande partie de l’information génétique d’un organisme.'
  },
  {
    keys: ['atome', 'c est quoi un atome'],
    answer: '⚛️ **Atome**\n\nUn atome est constitué d’un noyau contenant des protons et des neutrons, entouré d’électrons.'
  },
  {
    keys: ['python', 'c est quoi python'],
    answer: '🐍 **Python**\n\nPython est un langage de programmation généraliste utilisé notamment pour l’automatisation, les données, le Web et l’intelligence artificielle.\n\nExemple : `print("Bonjour !")`'
  },
  {
    keys: ['html', 'c est quoi html'],
    answer: '🌐 **HTML**\n\nHTML est le langage de balisage qui sert à structurer le contenu d’une page Web : titres, paragraphes, liens, images, formulaires, etc.'
  },
  {
    keys: ['css', 'c est quoi css'],
    answer: '🎨 **CSS**\n\nCSS sert principalement à mettre en forme une page Web : couleurs, tailles, espacements, disposition, animations et responsive design.'
  },
  {
    keys: ['javascript', 'java script', 'c est quoi javascript'],
    answer: '⚙️ **JavaScript**\n\nJavaScript permet notamment de rendre une page Web interactive et de programmer des comportements côté navigateur ou côté serveur.'
  },
  {
    keys: ['college saint joseph la salle', 'saint joseph la salle rodez', 'college saint joseph rodez'],
    answer: '🏫 **Collège Saint Joseph La Salle de Rodez**\n\nLe collège se situe au **1, rue Sarrus, 12000 Rodez**. Le numéro indiqué par l’établissement est **05 65 73 30 40**.\n\nℹ️ Ces informations proviennent du site officiel de l’Ensemble scolaire Saint Joseph La Salle de Rodez.'
  }
];

const normalize = (text) => String(text)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, ' ')
  .replace(/[^a-z0-9+\-*/().%\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const distance = (a, b) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
};

const matches = (text, key) => {
  if (text.includes(key)) return true;
  const words = normalize(text).split(' ').filter(Boolean);
  const keyWords = normalize(key).split(' ').filter(Boolean);
  if (words.length < keyWords.length) return false;
  for (let i = 0; i <= words.length - keyWords.length; i++) {
    let ok = true;
    for (let j = 0; j < keyWords.length; j++) {
      const word = words[i + j];
      const target = keyWords[j];
      if (word !== target && (word.length < 4 || distance(word, target) > (target.length <= 5 ? 1 : 2))) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
};

export function findKnowledge(question) {
  const text = normalize(question);
  if (!text) return null;

  let best = null;
  let bestScore = 0;

  for (const entry of entries) {
    for (const key of entry.keys) {
      if (matches(text, normalize(key))) {
        const score = normalize(key).length;
        if (score > bestScore) {
          best = entry.answer;
          bestScore = score;
        }
      }
    }
  }

  return best;
}

export const knowledgeCount = entries.length;
