// Les imatges que puja l'usuari viuen a Cloudinary, mai a MongoDB
//
// Aquest fitxer és l'única porta per on una imatge entra o surt del núvol, i el
// comparteixen els documents i el vocabulari personal. Abans cada mòdul feia la
// seva: el de documents pujava a Cloudinary, i el de vocabulari desava el base64
// dins del document d'usuari. Això últim no passava per cap quota i topava amb
// el límit de 16 MB per document de MongoDB a la vint-i-quatrena imatge, molt
// abans del límit de 200 paraules que l'aplicació deia tenir.

import { cloudinary } from "./cloudinaryClient";
import type { AppError } from "../middleware/errorHandler";

// Pes màxim d'una imatge pujada, ja descodificada.
//
// El front ja les redimensiona i comprimeix, però és aquest sostre el que ho fa
// cert: sense una comprovació al servidor, «una imatge» no vol dir cap pes en
// concret i qualsevol límit expressat en nombre d'imatges deixa de protegir res.
export const MAX_IMAGE_BYTES = 500 * 1024;

// Sostre dur de la cadena d'un data URL als validadors. És deliberadament més
// ample que MAX_IMAGE_BYTES: qui passi del pes ha de rebre IMAGE_TOO_LARGE, que
// diu què li passa i què pot fer, i no un error de validació genèric amb una
// llargada de caràcters. Això només atura l'absurd abans d'arribar-hi.
export const MAX_IMAGE_DATA_URL_LENGTH = 2 * 1024 * 1024;

// Imatges per petició a l'API de Cloudinary (el seu màxim és 100)
const RESOURCES_PER_REQUEST = 100;

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";
const BASE64_PREFIX = "data:image/";

// Imatge pujada: el publicId serveix per esborrar-la i els bytes per restar-los
// del consum de l'usuari. Sense els bytes, el comptador només creixeria.
export interface CloudinaryAsset {
  publicId: string;
  bytes: number;
}

interface UploadedAsset extends CloudinaryAsset {
  url: string;
  // Píxels de la imatge tal com ha quedat desada, que és el que decideix a
  // quina mida s'imprimeix bé
  width: number;
  height: number;
}

// Mides d'una imatge ja pujada, per dir-ne la mida d'impressió sense haver-la
// de baixar
export interface ImageDimensions {
  width: number;
  height: number;
}

// Una ranura d'imatge dins d'una estructura qualsevol: qui la crea sap on és la
// URL i com substituir-la. Així la lògica de Cloudinary no ha de conèixer ni la
// forma del content d'un document ni la d'un perfil de paraula, i les dues
// poden compartir exactament el mateix camí.
export interface ImageSlot {
  url?: string;
  assign: (url: string) => void;
}

const imageError = (errorCode: string, statusCode: number): AppError => {
  const error = new Error(errorCode) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

export const isBase64Image = (url?: string): boolean =>
  url?.startsWith(BASE64_PREFIX) ?? false;

export const isCloudinaryUrl = (url?: string): boolean =>
  url?.startsWith(CLOUDINARY_PREFIX) ?? false;

// Extreu el public_id de Cloudinary a partir de la URL segura
// Exemple: "https://res.cloudinary.com/cloud/image/upload/v123/seq/abc.jpg" → "seq/abc"
export const extractPublicId = (url: string): string => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match?.[1] ?? "";
};

// Pes real d'un data URL: el base64 ocupa 4 caràcters per cada 3 bytes de dades.
// Es calcula sobre la llargada de la cadena, sense descodificar-la: descodificar
// per saber si una cosa és massa grossa seria pagar precisament el que s'evita.
export const base64Bytes = (dataUrl: string): number => {
  const base64Length = dataUrl.length - dataUrl.indexOf(",") - 1;
  return Math.floor((base64Length * 3) / 4);
};

// Pes de les imatges noves que porta una petició, abans de pujar-ne cap.
// Serveix per rebutjar-la sense haver tocat Cloudinary: pujar primer i rebutjar
// després deixaria imatges orfes ja pagades.
export const estimateIncomingBytes = (slots: ImageSlot[]): number =>
  slots.reduce(
    (total, slot) =>
      isBase64Image(slot.url) ? total + base64Bytes(slot.url as string) : total,
    0
  );

// Rebutja la petició si alguna imatge passa del sostre per imatge.
// Es comprova abans que la quota perquè el missatge sigui el que toca: qui puja
// una foto massa grossa no s'ha quedat sense espai, ha de tornar a exportar-la.
export const assertImagesWithinSize = (slots: ImageSlot[]): void => {
  for (const slot of slots) {
    if (isBase64Image(slot.url) && base64Bytes(slot.url as string) > MAX_IMAGE_BYTES) {
      throw imageError("IMAGE_TOO_LARGE", 413);
    }
  }
};

// Puja les imatges base64 de les ranures i hi escriu la URL definitiva.
// Retorna només les acabades de pujar, per poder-ne comptar el pes real: el que
// diu Cloudinary, no el que havíem estimat abans de comprimir.
export const uploadBase64Slots = async (
  folder: string,
  slots: ImageSlot[]
): Promise<UploadedAsset[]> => {
  const uploaded: UploadedAsset[] = [];

  for (const slot of slots) {
    if (!isBase64Image(slot.url)) continue;

    const result = await cloudinary.uploader.upload(slot.url as string, {
      folder,
      resource_type: "image",
    });

    slot.assign(result.secure_url);
    uploaded.push({
      publicId: result.public_id,
      bytes: result.bytes,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  }

  return uploaded;
};

// Puja una imatge base64 solta i en torna la URL, el pes i les mides reals.
//
// És el camí d'una imatge que substitueix una altra —canviar-la de mida— i no
// pot passar per `uploadBase64Slots`: allà una ranura és un lloc dins d'una
// estructura, i aquí encara no se sap quin lloc serà fins que la nova imatge
// existeix. Els bytes i els píxels són els que diu Cloudinary, mai els que
// havíem estimat abans de comprimir.
export const uploadBase64Image = async (
  folder: string,
  dataUrl: string
): Promise<UploadedAsset> => {
  if (!isBase64Image(dataUrl)) {
    throw imageError("IMAGE_INVALID", 400);
  }

  if (base64Bytes(dataUrl) > MAX_IMAGE_BYTES) {
    throw imageError("IMAGE_TOO_LARGE", 413);
  }

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: "image",
  });

  return {
    publicId: result.public_id,
    bytes: result.bytes,
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };
};

// Mides de les imatges ja pujades, en una sola petició a Cloudinary.
//
// Les mides no es desen a la base de dades a propòsit: els bytes sí que s'hi
// desen perquè el comptador de consum els ha de poder restar en esborrar, però
// els píxels només serveixen per ensenyar-los, i desar-los voldria dir una
// migració per a tot el que ja s'ha pujat. Aquí surten d'una sola crida per a
// tota la llista, també per a les imatges antigues.
//
// No llança mai: si Cloudinary no respon, la llista d'imatges s'ha de poder
// veure igualment —amb el pes, que és el que decideix què s'esborra— i el que
// falta és la mida d'impressió, no la llista.
export const fetchImageDimensions = async (
  publicIds: string[]
): Promise<Map<string, ImageDimensions>> => {
  const dimensions = new Map<string, ImageDimensions>();
  if (publicIds.length === 0) return dimensions;

  try {
    // L'API de Cloudinary n'accepta cent per petició; un compte del pla gratuït
    // no hi arriba, però el tall ha de ser aquí i no en la confiança que no hi arribi
    for (let start = 0; start < publicIds.length; start += RESOURCES_PER_REQUEST) {
      const batch = publicIds.slice(start, start + RESOURCES_PER_REQUEST);
      const { resources } = await cloudinary.api.resources_by_ids(batch, {
        resource_type: "image",
      });

      for (const resource of resources) {
        dimensions.set(resource.public_id, {
          width: resource.width,
          height: resource.height,
        });
      }
    }
  } catch (error) {
    console.error("[imageAssets] No s'han pogut llegir les mides:", error);
  }

  return dimensions;
};

// Elimina una imatge pel seu public_id — no falla si ja no existeix
export const deleteCloudinaryAsset = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

// Elimina un conjunt d'URLs de Cloudinary — no falla si alguna ja no existeix
export const deleteCloudinaryImages = async (urls: string[]): Promise<void> => {
  for (const url of urls) {
    await deleteCloudinaryAsset(extractPublicId(url));
  }
};

// Suma els bytes d'un conjunt d'imatges
export const sumBytes = (assets: CloudinaryAsset[]): number =>
  assets.reduce((total, asset) => total + asset.bytes, 0);

// Carpeta de Cloudinary d'un usuari. Totes les seves imatges hi pengen, de manera
// que esborrar el compte és esborrar aquest prefix (vegeu user-settings/service).
export const userAssetFolder = (userId: string): string => `seq/${userId}`;

// Les imatges del vocabulari van a una subcarpeta perquè es puguin distingir de
// les dels documents mirant el panell de Cloudinary, sense haver de creuar-les
// amb la base de dades.
export const vocabularyAssetFolder = (userId: string): string =>
  `seq/${userId}/vocabulary`;
