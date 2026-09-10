const entries = [
  {
    keys: ['cosinus', 'c est quoi le cosinus', 'definition du cosinus', 'cosinus en maths'],
    answer: '📐 **Cosinus**\n\nDans un triangle rectangle, le cosinus d’un angle est le rapport entre le côté adjacent à cet angle et l’hypoténuse.\n\n**Formule :** cos(angle) = côté adjacent ÷ hypoténuse.\n\n💡 Mémo : **CAH** = Cosinus = Adjacent / Hypoténuse.'
  },
  {
    keys: ['sinus', 'c est quoi le sinus', 'definition du sinus'],
    answer: '📐 **Sinus**\n\nDans un triangle rectangle, le sinus d’un angle est le rapport entre le côté opposé à cet angle et l’hypoténuse.\n\n**Formule :** sin(angle) = côté opposé ÷ hypoténuse.\n\n💡 Mémo : **SOH** = Sinus = Opposé / Hypoténuse.'
  },
  {
    keys: ['tangente', 'c est quoi la tangente', 'definition de la tangente'],
    answer: '📐 **Tangente**\n\nDans un triangle rectangle, la tangente d’un angle est le rapport entre le côté opposé et le côté adjacent.\n\n**Formule :** tan(angle) = côté opposé ÷ côté adjacent.\n\n💡 Mémo : **TOA** = Tangente = Opposé / Adjacent.'
  },
  {
    keys: ['trigonometrie', 'trigo', 'formules de trigonometrie'],
    answer: '📐 **Trigonométrie**\n\nDans un triangle rectangle :\n• cos(angle) = adjacent / hypoténuse\n• sin(angle) = opposé / hypoténuse\n• tan(angle) = opposé / adjacent\n\n💡 Mémo : **CAH – SOH – TOA**.'
  },
  {
    keys: ['pythagore', 'theoreme de pythagore', 'theoreme pythagore', 'c est quoi pythagore'],
    answer: '📏 **Théorème de Pythagore**\n\nDans un triangle rectangle, le carré de la longueur de l’hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.\n\n**Formule :** a² + b² = c², avec c l’hypoténuse.\n\n🧮 Exemple : 3² + 4² = 5².'
  },
  {
    keys: ['reciproque de pythagore', 'reciproque pythagore'],
    answer: '📏 **Réciproque de Pythagore**\n\nSi, dans un triangle, le carré du plus grand côté est égal à la somme des carrés des deux autres côtés, alors le triangle est rectangle.'
  },
  {
    keys: ['contraposée pythagore', 'contraposée de pythagore'],
    answer: '📏 **Contraposée de Pythagore**\n\nSi, dans un triangle, le carré du plus grand côté n’est pas égal à la somme des carrés des deux autres côtés, alors le triangle n’est pas rectangle.'
  },
  {
    keys: ['thales', 'theoreme de thales', 'theoreme thales'],
    answer: '📏 **Théorème de Thalès**\n\nLorsque deux droites sécantes sont coupées par deux droites parallèles, les longueurs correspondantes sont proportionnelles.\n\n💡 Il sert notamment à calculer une longueur inconnue à partir de rapports de longueurs.'
  },
  {
    keys: ['reciproque de thales', 'reciproque thales'],
    answer: '📏 **Réciproque de Thalès**\n\nSi les rapports de longueurs correspondantes sont égaux dans la configuration étudiée, on peut conclure que les deux droites concernées sont parallèles.'
  },
  {
    keys: ['triangle rectangle', 'c est quoi un triangle rectangle'],
    answer: '📐 **Triangle rectangle**\n\nUn triangle rectangle est un triangle qui possède un angle droit, c’est-à-dire un angle de **90°**.\n\nLe côté opposé à l’angle droit s’appelle l’**hypoténuse**.'
  },
  {
    keys: ['triangle isocele', 'triangle isocèle', 'c est quoi un triangle isocele'],
    answer: '📐 **Triangle isocèle**\n\nUn triangle isocèle possède **deux côtés de même longueur**. Les angles opposés à ces côtés sont également égaux.'
  },
  {
    keys: ['triangle equilateral', 'triangle équilatéral', 'c est quoi un triangle equilateral'],
    answer: '📐 **Triangle équilatéral**\n\nUn triangle équilatéral possède **trois côtés de même longueur** et **trois angles de 60°**.'
  },
  {
    keys: ['parallelogramme', 'parallelogramme definition', 'c est quoi un parallelogramme'],
    answer: '📐 **Parallélogramme**\n\nUn parallélogramme est un quadrilatère dont les **côtés opposés sont parallèles** deux à deux.\n\nSes diagonales se coupent en leur milieu.'
  },
  {
    keys: ['rectangle', 'proprietes rectangle', 'c est quoi un rectangle'],
    answer: '📐 **Rectangle**\n\nUn rectangle est un quadrilatère qui possède **quatre angles droits**.\n\nSes côtés opposés sont de même longueur et ses diagonales sont de même longueur.'
  },
  {
    keys: ['losange', 'c est quoi un losange'],
    answer: '📐 **Losange**\n\nUn losange est un quadrilatère dont les **quatre côtés ont la même longueur**.\n\nSes diagonales sont perpendiculaires et se coupent en leur milieu.'
  },
  {
    keys: ['carre', 'carré', 'c est quoi un carre'],
    answer: '📐 **Carré**\n\nUn carré possède **quatre côtés de même longueur** et **quatre angles droits**.\n\nC’est à la fois un rectangle et un losange.'
  },
  {
    keys: ['aire rectangle', 'aire d un rectangle', 'formule rectangle'],
    answer: '📐 **Aire d’un rectangle**\n\n**Aire = longueur × largeur.**\n\nExemple : 8 cm × 3 cm = **24 cm²**.'
  },
  {
    keys: ['perimetre rectangle', 'perimetre d un rectangle'],
    answer: '📐 **Périmètre d’un rectangle**\n\n**P = 2 × (longueur + largeur).**'
  },
  {
    keys: ['aire carre', 'aire du carre'],
    answer: '📐 **Aire d’un carré**\n\n**Aire = côté × côté = côté².**'
  },
  {
    keys: ['aire triangle', 'aire d un triangle', 'formule triangle'],
    answer: '📐 **Aire d’un triangle**\n\n**Aire = (base × hauteur) ÷ 2.**'
  },
  {
    keys: ['aire cercle', 'aire d un cercle', 'aire disque'],
    answer: '⭕ **Aire d’un disque**\n\n**Aire = π × rayon².**\n\nAvec π ≈ 3,14159.'
  },
  {
    keys: ['perimetre cercle', 'circonference cercle'],
    answer: '⭕ **Périmètre d’un cercle**\n\n**P = 2 × π × rayon** ou **P = π × diamètre**.'
  },
  {
    keys: ['classes grammaticales', '10 classes grammaticales', 'dix classes grammaticales', 'classes de mots'],
    answer: '🇫🇷 **Les 10 classes grammaticales**\n\n1. nom\n2. déterminant\n3. adjectif\n4. pronom\n5. verbe\n6. adverbe\n7. préposition\n8. conjonction de coordination\n9. conjonction de subordination\n10. interjection\n\n💡 La classe grammaticale indique la **nature** d’un mot.'
  },
  {
    keys: ['sujet', 'c est quoi le sujet en grammaire'],
    answer: '🇫🇷 **Le sujet**\n\nLe sujet est le mot ou groupe de mots qui indique généralement **qui fait l’action** ou de qui l’on parle.\n\nExemple : « **Léa** mange une pomme. » → Léa est le sujet.'
  },
  {
    keys: ['cod', 'complement objet direct', 'complement d objet direct'],
    answer: '🇫🇷 **COD**\n\nLe complément d’objet direct complète un verbe **sans préposition**.\n\nExemple : « Je lis **un livre**. » → « un livre » est le COD.'
  },
  {
    keys: ['coi', 'complement objet indirect', 'complement d objet indirect'],
    answer: '🇫🇷 **COI**\n\nLe complément d’objet indirect complète le verbe **avec une préposition**, souvent « à » ou « de ».\n\nExemple : « Je parle **à mon ami**. » → « à mon ami » est le COI.'
  },
  {
    keys: ['passe compose', 'passé composé', 'temps passe compose'],
    answer: '🇫🇷 **Passé composé**\n\nLe passé composé est formé d’un **auxiliaire (avoir ou être) au présent + participe passé**.\n\nExemple : « J’ai mangé. » / « Je suis parti. »'
  },
  {
    keys: ['imparfait', 'temps imparfait'],
    answer: '🇫🇷 **Imparfait**\n\nL’imparfait sert notamment à exprimer une action habituelle, une description ou une action en cours dans le passé.\n\nExemple : « Quand j’étais petit, je jouais souvent dehors. »'
  },
  {
    keys: ['futur simple', 'futur', 'temps futur simple'],
    answer: '🇫🇷 **Futur simple**\n\nLe futur simple exprime une action qui aura lieu plus tard.\n\nExemple : « Demain, je **partirai**. »'
  },
  {
    keys: ['revolution francaise', 'revolution française', 'date revolution francaise'],
    answer: '🏛️ **Révolution française**\n\nElle commence en **1789**. La prise de la Bastille a lieu le **14 juillet 1789**.'
  },
  {
    keys: ['premiere guerre mondiale', '1ere guerre mondiale', 'premiere guerre mondiale date'],
    answer: '🌍 **Première Guerre mondiale**\n\nElle se déroule de **1914 à 1918**.'
  },
  {
    keys: ['seconde guerre mondiale', 'deuxieme guerre mondiale', '2e guerre mondiale'],
    answer: '🌍 **Seconde Guerre mondiale**\n\nElle se déroule de **1939 à 1945**.'
  },
  {
    keys: ['renaissance', 'c est quoi la renaissance histoire'],
    answer: '🏛️ **Renaissance**\n\nLa Renaissance est une période culturelle et artistique qui se développe en Europe à partir du XVe siècle, avec un renouveau des arts, des sciences et des idées inspiré notamment de l’Antiquité.'
  },
  {
    keys: ['cellule', 'c est quoi une cellule', 'cellule svt'],
    answer: '🧬 **Cellule**\n\nLa cellule est l’unité de base du vivant. Certains organismes sont unicellulaires et d’autres sont constitués d’un grand nombre de cellules.'
  },
  {
    keys: ['adn', 'c est quoi adn'],
    answer: '🧬 **ADN**\n\nL’ADN est une molécule qui porte une grande partie de l’information génétique d’un organisme.'
  },
  {
    keys: ['photosynthese', 'photosynthèse', 'c est quoi la photosynthese'],
    answer: '🌱 **Photosynthèse**\n\nLa photosynthèse est le processus par lequel les végétaux chlorophylliens utilisent notamment la lumière pour fabriquer de la matière organique à partir de dioxyde de carbone et d’eau, avec libération de dioxygène.'
  },
  {
    keys: ['atome', 'c est quoi un atome'],
    answer: '⚛️ **Atome**\n\nUn atome possède un noyau contenant des protons et des neutrons, entouré d’électrons.'
  },
  {
    keys: ['masse volumique', 'densite', 'masse volumique definition'],
    answer: '🧪 **Masse volumique**\n\nLa masse volumique mesure la masse d’un matériau par unité de volume.\n\n**Formule :** ρ = m ÷ V.'
  },
  {
    keys: ['vitesse', 'formule vitesse', 'calcul vitesse'],
    answer: '🚗 **Vitesse**\n\nLa vitesse moyenne se calcule avec : **v = distance ÷ durée**.\n\nOn peut par exemple obtenir une vitesse en km/h ou en m/s.'
  },
  {
    keys: ['force', 'c est quoi une force en physique'],
    answer: '⚙️ **Force**\n\nUne force est une action mécanique capable de modifier le mouvement d’un objet ou de le déformer. Elle se mesure en **newtons (N)**.'
  },
  {
    keys: ['python', 'c est quoi python'],
    answer: '🐍 **Python**\n\nPython est un langage de programmation généraliste utilisé notamment pour l’automatisation, les données, le Web et l’intelligence artificielle.\n\nExemple : `print("Bonjour !")`'
  },
  {
    keys: ['html', 'c est quoi html'],
    answer: '🌐 **HTML**\n\nHTML sert à structurer le contenu d’une page Web : titres, paragraphes, liens, images, formulaires, etc.'
  },
  {
    keys: ['css', 'c est quoi css'],
    answer: '🎨 **CSS**\n\nCSS sert à mettre en forme une page Web : couleurs, tailles, espacements, disposition, animations et responsive design.'
  },
  {
    keys: ['javascript', 'java script', 'c est quoi javascript'],
    answer: '⚙️ **JavaScript**\n\nJavaScript permet notamment de rendre une page Web interactive et de programmer des comportements côté navigateur ou côté serveur.'
  },
  {
    keys: ['college saint joseph la salle', 'saint joseph la salle rodez', 'college saint joseph rodez'],
    answer: '🏫 **Collège Saint Joseph La Salle de Rodez**\n\nLe collège se situe au **1, rue Sarrus, 12000 Rodez**.\n\nℹ️ Cette information est à vérifier sur le site officiel de l’établissement si l’adresse doit être utilisée pour un déplacement.'
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
      if (word !== target && (word.length < 3 || distance(word, target) > (target.length <= 5 ? 1 : 2))) {
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
      const normalizedKey = normalize(key);
      if (matches(text, normalizedKey)) {
        const score = normalizedKey.length;
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
