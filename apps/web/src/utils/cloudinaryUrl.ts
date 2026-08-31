// Variants de mida de les imatges pròpies servides per Cloudinary
//
// Les imatges de l'usuari es desen a mida d'impressió (1.800 px de costat llarg,
// ~500 KB): és el que cal per imprimir un pictograma gran, i és el que es baixa
// quan es carrega un document. Però als llistats es pinten dins d'un quadradet
// de 40 px, i baixar-hi mig megabyte per cadascuna és la despesa d'amplada de
// banda més gran que té l'app (troballa L4 de l'estudi de límits).
//
// Cloudinary serveix una variant reduïda posant la transformació a la URL. Es
// genera un sol cop —després la serveix el CDN— i costa 1 crèdit per cada 1.000
// imatges diferents, davant dels ~490 KB per visualització que estalvia.
//
// La transformació NO es desa mai a la base de dades: la mateixa imatge s'ha de
// poder servir a mida completa a l'editor, i lligar el que hi ha desat a una
// mida de pantalla concreta és el que després no es pot desfer.

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";
const UPLOAD_SEGMENT = "/upload/";

// c_limit no amplia mai i conserva la proporció; f_auto i q_auto deixen que
// Cloudinary triï format (WebP/AVIF) i qualitat segons el navegador.
const TRANSFORM = (width: number): string => `w_${width},c_limit,f_auto,q_auto`;

/**
 * URL d'una imatge a la mida que de debò es pinta.
 *
 * Retorna la URL tal qual si no és de Cloudinary: els pictogrames d'ARASAAC els
 * serveix la seva pròpia API, i les imatges locals (`blob:`, els SVG de l'app)
 * no passen per cap CDN. Així els components la poden aplicar sempre, sense
 * haver de saber d'on ve cada imatge.
 *
 * @param displayPx  Costat de la caixa on es pinta, en píxels CSS. Es demana
 *                   el doble perquè es vegi nítida en pantalles de densitat 2×,
 *                   que és el cas de qualsevol iPad.
 */
export const cloudinaryThumbnailUrl = (
  url: string,
  displayPx: number,
): string => {
  if (!url.startsWith(CLOUDINARY_PREFIX)) return url;

  const uploadAt = url.indexOf(UPLOAD_SEGMENT);
  if (uploadAt === -1) return url;

  const cut = uploadAt + UPLOAD_SEGMENT.length;
  return `${url.slice(0, cut)}${TRANSFORM(displayPx * 2)}/${url.slice(cut)}`;
};
