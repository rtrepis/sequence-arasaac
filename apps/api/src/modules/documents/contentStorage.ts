// Compactació del contingut d'un document abans de desar-lo a MongoDB
//
// Mesurat amb BSON.calculateObjectSize sobre un document de 32 pictogrames en 4
// seqüències: 28,7 KB, dels quals gairebé sis de cada deu bytes eren còpies —
// ajustos idèntics als del propi document i identificadors de resultats de cerca
// d'ARASAAC. Compactat en queden 16,3 KB, i els comptes que caben als 512 MB del
// pla gratuït d'Atlas passen de ~5.750 a ~9.700.
//
// **És capa d'emmagatzematge i prou.** Ni el fitxer .saac, ni el que retorna
// l'API, ni el que hi ha a Redux canvien de forma: el que es treu en desar es
// torna a posar en llegir, a partir del defaultSettings que el propi document ja
// guarda. Un .saac descarregat abans o després d'aquest canvi és idèntic, i un
// document desat abans es llegeix igual que sempre.

// Quants resultats de cerca d'ARASAAC es conserven per pictograma.
//
// L'array desa TOTS els identificadors que va retornar la cerca, que poden ser
// cent. Només els llegeix la graella de PictogramSearch, per triar un pictograma
// alternatiu, i allà hi ha el botó d'ampliar la cerca per si cal anar més enllà.
// Dotze omplen un parell de files de la graella; la resta era una caché d'una
// petició gratuïta, desada per sempre.
export const MAX_STORED_BEST_ID_PICTS = 12;

// Formes mínimes que necessiten aquestes funcions. Es declaren aquí i no
// s'importen de shared-types perquè el contingut arriba de dues bandes —validat
// per Zod en escriure, serialitzat per Mongoose en llegir— i els dos tipus
// difereixen en detalls (FontFamily contra string) que aquí no importen.
interface ComparableFont {
  family: string;
  color: string;
  size: number;
}

interface ComparableBorder {
  color: string;
  radius: number;
  size: number;
}

interface CompactableSettings {
  numbered?: boolean;
  font?: ComparableFont;
  numberFont?: ComparableFont;
  borderOut?: ComparableBorder;
  borderIn?: ComparableBorder;
}

export interface CompactableDefaults {
  numbered?: boolean;
  font?: ComparableFont;
  numberFont?: ComparableFont;
  borderOut?: ComparableBorder;
  borderIn?: ComparableBorder;
}

interface CompactablePict {
  img: { searched: { bestIdPicts: number[] } };
  settings: CompactableSettings;
}

// El contingut arriba indexat per string (Zod, JSON) o per number (el tipus del
// client). Es declaren les dues formes aquí i el recorregut fa una sola conversió
// a dins, en comptes d'obligar cada consumidor a fer-ne una.
export type CompactableContent =
  | { [key: string]: CompactablePict[] }
  | { [key: number]: CompactablePict[] };

// Comparació camp a camp i no per JSON.stringify: el mateix objecte pot arribar
// amb les claus en un ordre des de Zod i en un altre des de Mongoose, i llavors
// dos valors iguals es compararien com a diferents.
const sameFont = (a?: ComparableFont, b?: ComparableFont): boolean =>
  !!a && !!b && a.family === b.family && a.color === b.color && a.size === b.size;

const sameBorder = (a?: ComparableBorder, b?: ComparableBorder): boolean =>
  !!a && !!b && a.color === b.color && a.radius === b.radius && a.size === b.size;

// Ajustos que s'ometen quan valen el mateix que els del document.
//
// Hi són aquests cinc i no tots: `textPosition` es llegeix al PictogramCard
// **sense cap fallback**, de manera que un document que el perdés es dibuixaria
// sense text; i `fontSize` i `fontFamily` no tenen equivalent al document, o sigui
// que no hi ha res amb què comparar-los. Els cinc que queden són on hi ha el pes
// —quatre són objectes— i tots tenen fallback al client.
const compactSettings = (
  settings: CompactableSettings,
  defaults: CompactableDefaults
): void => {
  if (settings.numbered === defaults.numbered) delete settings.numbered;
  if (sameFont(settings.font, defaults.font)) delete settings.font;
  if (sameFont(settings.numberFont, defaults.numberFont)) delete settings.numberFont;
  if (sameBorder(settings.borderOut, defaults.borderOut)) delete settings.borderOut;
  if (sameBorder(settings.borderIn, defaults.borderIn)) delete settings.borderIn;
};

// Torna a posar el que es va ometre. Només omple el que falta: un document desat
// abans d'aquest canvi porta tots els ajustos explícits i ha de sortir igual que
// hi va entrar.
const expandSettings = (
  settings: CompactableSettings,
  defaults: CompactableDefaults
): void => {
  // Còpia i no referència: si no, els trenta-dos pictogrames d'un document
  // apuntarien tots al mateix objecte de lletra del defaultSettings, i tocar-ne
  // un de sol els canviaria tots. Avui la resposta se serialitza tot seguit i no
  // es notaria, però és la mena de compartició que després costa un dia trobar.
  const copyFont = (value?: ComparableFont) => (value ? { ...value } : undefined);
  const copyBorder = (value?: ComparableBorder) => (value ? { ...value } : undefined);

  settings.numbered = settings.numbered ?? defaults.numbered;
  settings.font = settings.font ?? copyFont(defaults.font);
  settings.numberFont = settings.numberFont ?? copyFont(defaults.numberFont);
  settings.borderOut = settings.borderOut ?? copyBorder(defaults.borderOut);
  settings.borderIn = settings.borderIn ?? copyBorder(defaults.borderIn);

  // Un valor que no hi era i que el document tampoc no defineix no s'inventa:
  // deixar-hi undefined explícit el faria viatjar a la resposta per res.
  if (settings.numbered === undefined) delete settings.numbered;
  if (settings.font === undefined) delete settings.font;
  if (settings.numberFont === undefined) delete settings.numberFont;
  if (settings.borderOut === undefined) delete settings.borderOut;
  if (settings.borderIn === undefined) delete settings.borderIn;
};

// Retalla els resultats de cerca desats.
//
// Els valors sentinella són arrays d'un sol element —-1 «no trobat» i 0 «sense
// resultats»— i el retall els deixa intactes perquè conserva sempre els primers.
const compactSearch = (pict: CompactablePict): void => {
  const { bestIdPicts } = pict.img.searched;
  if (bestIdPicts.length > MAX_STORED_BEST_ID_PICTS) {
    pict.img.searched.bestIdPicts = bestIdPicts.slice(0, MAX_STORED_BEST_ID_PICTS);
  }
};

const eachPict = (
  content: CompactableContent,
  visit: (pict: CompactablePict) => void
): void => {
  const sequencesByKey = content as Record<string, CompactablePict[]>;
  for (const sequences of Object.values(sequencesByKey)) {
    for (const pict of sequences) {
      if (pict?.img?.searched && pict.settings) visit(pict);
    }
  }
};

/**
 * Treu del contingut el que es pot derivar o recuperar. Modifica l'estructura
 * directament, com fa la pujada d'imatges: ja és una còpia validada per Zod.
 *
 * Sense `defaults` —documents antics que no en porten— només retalla els
 * resultats de cerca: sense valors del document amb què comparar, ometre un
 * ajust voldria dir perdre'l.
 */
export const compactContent = (
  content: CompactableContent,
  defaults?: CompactableDefaults
): void => {
  eachPict(content, (pict) => {
    compactSearch(pict);
    if (defaults) compactSettings(pict.settings, defaults);
  });
};

/**
 * Torna a completar el contingut llegit de la base de dades. És l'invers exacte
 * de `compactContent` mentre el `defaultSettings` del document no canviï, que és
 * el cas de qualsevol lectura.
 */
export const expandContent = (
  content: CompactableContent,
  defaults?: CompactableDefaults
): void => {
  if (!defaults) return;
  eachPict(content, (pict) => expandSettings(pict.settings, defaults));
};
