/**
 * Utilitats per convertir imatges a base64 amb una mida fixa i acotada.
 * Garanteix la persistència de les imatges personalitzades als documents.
 */

/**
 * Costat llarg màxim d'una imatge pujada, en píxels.
 *
 * El pictograma més gran que es pot imprimir avui és de 150,8 mm de costat
 * (150 px CSS × SIZE_PICT_MAX 3,8, a 96 dpi). Amb 1.800 px hi surt a 303 dpi,
 * per damunt del sostre del propi PDF (html2canvas hi treballa a scale 3 sobre
 * una pàgina de 96 dpi, o sigui 288 dpi com a màxim). Pujar d'aquí només
 * afegiria pes: píxels que cap sortida no arriba a fer servir.
 *
 * La mida és FIXA per a totes les imatges, no depèn de quantes n'hi hagi al
 * document: quan es puja encara no se sap a quina mida s'imprimirà —
 * `sizePict` es toca després, a la pàgina de vista— i reduir és irreversible.
 */
export const MAX_IMAGE_SIDE_PX = 1800;

/** Pes al qual s'apunta per imatge, ajustant la qualitat de codificació. */
const TARGET_BYTES = 500 * 1024;

const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

const JPEG_MIME = "image/jpeg";
const WEBP_MIME = "image/webp";
const PNG_MIME = "image/png";

/**
 * Carrega una imatge des d'un File i retorna un HTMLImageElement.
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Error carregant la imatge"));
    };

    img.src = url;
  });
};

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Dimensions de destí: es redueix sempre que el costat llarg passi del màxim,
 * i mai s'amplia — inventar píxels no afegeix detall i multiplica el pes.
 */
const fitToMaxSide = (width: number, height: number): ImageDimensions => {
  const longestSide = Math.max(width, height);
  if (longestSide <= MAX_IMAGE_SIDE_PX) return { width, height };

  const ratio = MAX_IMAGE_SIDE_PX / longestSide;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

/**
 * Dibuixa la imatge al canvas ja a la mida de destí.
 */
const drawToCanvas = (
  img: HTMLImageElement,
  { width, height }: ImageDimensions,
): CanvasRenderingContext2D => {
  const canvas = window.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No s'ha pogut crear el context del canvas");
  }

  // Una reducció d'una foto de mòbil a 1.800 px és un salt gran: sense
  // suavitzat d'alta qualitat les vores del dibuix queden dentades
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  return ctx;
};

/**
 * Comprova si la imatge dibuixada té alguna zona transparent.
 */
const hasTransparency = (
  ctx: CanvasRenderingContext2D,
  { width, height }: ImageDimensions,
): boolean => {
  const { data } = ctx.getImageData(0, 0, width, height);

  // El canal alfa és el quart byte de cada píxel
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }

  return false;
};

/**
 * Calcula la mida en bytes d'una cadena base64.
 */
const getBase64SizeInBytes = (base64String: string): number => {
  const base64Data = base64String.split(",")[1] || base64String;
  return Math.ceil((base64Data.length * 3) / 4);
};

/**
 * Codifica el canvas abaixant la qualitat fins a apuntar al pes objectiu.
 * Mai baixa de MIN_QUALITY: una imatge il·legible no serveix de res.
 */
const encodeWithTargetSize = (
  canvas: HTMLCanvasElement,
  mimeType: string,
): string => {
  let quality = INITIAL_QUALITY;
  let result = canvas.toDataURL(mimeType, quality);

  while (getBase64SizeInBytes(result) > TARGET_BYTES && quality > MIN_QUALITY) {
    quality = Math.round((quality - QUALITY_STEP) * 10) / 10;
    result = canvas.toDataURL(mimeType, quality);
  }

  return result;
};

/**
 * Tria de format: les imatges opaques van a JPEG; les que tenen transparència
 * (retalls de pictogrames) l'han de conservar, i el JPEG les hi pintaria un
 * fons negre. WebP guarda l'alfa amb pes de foto; si el navegador no el sap
 * codificar, toDataURL retorna un PNG sense avisar —es detecta pel prefix— i
 * el PNG es dona per bo.
 */
const encode = (
  ctx: CanvasRenderingContext2D,
  dimensions: ImageDimensions,
): string => {
  const { canvas } = ctx;

  if (!hasTransparency(ctx, dimensions)) {
    return encodeWithTargetSize(canvas, JPEG_MIME);
  }

  const webp = encodeWithTargetSize(canvas, WEBP_MIME);
  if (webp.startsWith(`data:${WEBP_MIME}`)) return webp;

  return canvas.toDataURL(PNG_MIME);
};

/**
 * Converteix un File (imatge) a una cadena base64, sempre acotada a
 * MAX_IMAGE_SIDE_PX de costat llarg.
 */
export const fileToBase64 = async (file: File): Promise<string> => {
  const img = await loadImage(file);
  const dimensions = fitToMaxSide(img.naturalWidth, img.naturalHeight);
  const ctx = drawToCanvas(img, dimensions);

  return encode(ctx, dimensions);
};

/**
 * Comprova si una URL és vàlida per renderitzar.
 * Retorna false per URLs blob (temporals i no persistents).
 */
export const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  // Data URLs base64 són vàlides
  if (url.startsWith("data:image/")) return true;

  // URLs ARASAAC són vàlides
  if (url.includes("arasaac.org")) return true;

  // URLs blob són invàlides després de recarregar la pàgina
  if (url.startsWith("blob:")) return false;

  // Altres URLs https poden ser vàlides
  if (url.startsWith("https://")) return true;

  return false;
};
