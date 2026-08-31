/**
 * Utilitats per convertir imatges a base64 amb una mida fixa i acotada.
 * Garanteix la persistència de les imatges personalitzades als documents.
 */
import type { ImageQuality } from "@sequence-arasaac/shared-types";

/**
 * Costat llarg i pes objectiu de cada nivell de qualitat.
 *
 * `print` és el de sempre i continua sent el valor per defecte: el pictograma
 * més gran que es pot imprimir avui fa 150,8 mm de costat (150 px CSS ×
 * SIZE_PICT_MAX 3,8, a 96 dpi), i 1.800 px hi surten a 303 dpi, per damunt del
 * sostre del propi PDF (html2canvas treballa a scale 3 sobre una pàgina de
 * 96 dpi, o sigui 288 dpi com a màxim). Pujar d'aquí només afegiria pes.
 *
 * Els altres dos nivells NO són una progressió automàtica segons quantes
 * imatges hi hagi —quan es puja encara no se sap a quina mida s'imprimirà, i
 * reduir és irreversible—: són una tria de l'usuari, que és l'únic que sap si
 * imprimirà a mida gran o si el que li falta és espai. Les xifres surten del
 * que cada nivell dona a la impressió: 1.200 px són 202 dpi (una targeta de
 * mida corrent, ~75 mm, hi surt a 400 dpi) i 800 px, 135 dpi (prou per a
 * pantalla i per a pictogrames petits).
 *
 * Cap dels tres passa de MAX_IMAGE_BYTES (500 KB), que és el sostre que el
 * servidor fa complir: si un nivell el passés, «una imatge» deixaria de voler
 * dir un pes concret.
 */
export const IMAGE_QUALITY_PRESETS: Record<
  ImageQuality,
  { maxSidePx: number; targetBytes: number }
> = {
  print: { maxSidePx: 1800, targetBytes: 500 * 1024 },
  standard: { maxSidePx: 1200, targetBytes: 250 * 1024 },
  compact: { maxSidePx: 800, targetBytes: 120 * 1024 },
};

/**
 * Pes màxim d'una imatge pujada, el mateix que fa complir el servidor
 * (`MAX_IMAGE_BYTES` d'`apps/api/src/shared/imageAssets.ts`).
 *
 * Es repeteix aquí a propòsit: el client l'ha de poder comprovar abans d'enviar
 * res, i el servidor l'ha de fer complir encara que el client no ho faci. Els
 * tres nivells de qualitat hi queden per sota, però una imatge amb
 * transparència que acabi en PNG —quan el navegador no sap codificar WebP— no
 * passa per cap pes objectiu i el pot superar.
 */
export const MAX_UPLOAD_IMAGE_BYTES = 500 * 1024;

/** Qualitat amb què es puja mentre l'usuari no en triï cap altra. */
export const DEFAULT_IMAGE_QUALITY: ImageQuality = "print";

/** Nivells en ordre de més a menys pes, per poder-ne provar un de més petit. */
export const IMAGE_QUALITY_ORDER: ImageQuality[] = [
  "print",
  "standard",
  "compact",
];

const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

const JPEG_MIME = "image/jpeg";
const WEBP_MIME = "image/webp";
const PNG_MIME = "image/png";

/**
 * Carrega una imatge des d'un File o d'un data URL i retorna un HTMLImageElement.
 *
 * Accepta les dues coses perquè el camí de la pujada i el de tornar a comprimir
 * una imatge ja convertida han de ser el mateix: si es codifiquessin per separat,
 * la versió comprimida podria no coincidir amb la que es pujaria de nou.
 */
const loadImage = (source: File | string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isFile = typeof source !== "string";
    const url = isFile ? URL.createObjectURL(source) : source;

    img.onload = () => {
      if (isFile) URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      if (isFile) URL.revokeObjectURL(url);
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
const fitToMaxSide = (
  width: number,
  height: number,
  maxSidePx: number,
): ImageDimensions => {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxSidePx) return { width, height };

  const ratio = maxSidePx / longestSide;
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
 * Mida en bytes d'una cadena base64.
 *
 * Exportada perquè és el que decideix si una imatge cap a l'espai que queda al
 * compte, i això s'ha de poder saber abans d'enviar-la enlloc.
 */
export const getBase64SizeInBytes = (base64String: string): number => {
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
  targetBytes: number,
): string => {
  let quality = INITIAL_QUALITY;
  let result = canvas.toDataURL(mimeType, quality);

  while (getBase64SizeInBytes(result) > targetBytes && quality > MIN_QUALITY) {
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
  targetBytes: number,
): string => {
  const { canvas } = ctx;

  if (!hasTransparency(ctx, dimensions)) {
    return encodeWithTargetSize(canvas, JPEG_MIME, targetBytes);
  }

  const webp = encodeWithTargetSize(canvas, WEBP_MIME, targetBytes);
  if (webp.startsWith(`data:${WEBP_MIME}`)) return webp;

  return canvas.toDataURL(PNG_MIME);
};

/**
 * Converteix una imatge (un File o un data URL ja convertit) a base64, acotada
 * al costat llarg i al pes del nivell de qualitat demanat.
 */
export const encodeImage = async (
  source: File | string,
  quality: ImageQuality = DEFAULT_IMAGE_QUALITY,
): Promise<string> => {
  const { maxSidePx, targetBytes } = IMAGE_QUALITY_PRESETS[quality];
  const img = await loadImage(source);
  const dimensions = fitToMaxSide(
    img.naturalWidth,
    img.naturalHeight,
    maxSidePx,
  );
  const ctx = drawToCanvas(img, dimensions);

  return encode(ctx, dimensions, targetBytes);
};

/**
 * Converteix un File (imatge) a una cadena base64 amb el nivell de qualitat
 * triat per l'usuari.
 */
export const fileToBase64 = async (
  file: File,
  quality: ImageQuality = DEFAULT_IMAGE_QUALITY,
): Promise<string> => encodeImage(file, quality);

/**
 * Nivell més gran que faria caber la imatge dins dels bytes disponibles, o null
 * si no n'hi ha cap.
 *
 * Es prova de veritat, codificant: el pes objectiu de cada nivell és una fita,
 * no una promesa —una foto amb molt detall es pot quedar per sobre encara que
 * la qualitat hagi baixat al mínim—, i oferir una reducció que després no cap
 * seria pitjor que no oferir-ne cap.
 */
export const encodeToFit = async (
  dataUrl: string,
  availableBytes: number,
  from: ImageQuality,
): Promise<{
  dataUrl: string;
  quality: ImageQuality;
  bytes: number;
} | null> => {
  const smaller = IMAGE_QUALITY_ORDER.slice(
    IMAGE_QUALITY_ORDER.indexOf(from) + 1,
  );

  for (const quality of smaller) {
    const encoded = await encodeImage(dataUrl, quality);
    const bytes = getBase64SizeInBytes(encoded);
    if (bytes <= availableBytes) return { dataUrl: encoded, quality, bytes };
  }

  return null;
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
