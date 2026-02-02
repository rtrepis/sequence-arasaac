/**
 * Utilitats per convertir imatges a base64 amb compressió automàtica.
 * Garanteix la persistència de les imatges personalitzades als documents.
 */

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB màxim

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

/**
 * Comprimeix una imatge a una qualitat específica usant canvas.
 * Retorna el data URL resultant.
 */
const compressToDataUrl = (
  img: HTMLImageElement,
  quality: number
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No s'ha pogut crear el context del canvas");
  }

  ctx.drawImage(img, 0, 0);

  // Usem JPEG per millor compressió
  return canvas.toDataURL("image/jpeg", quality);
};

/**
 * Calcula la mida en bytes d'una cadena base64.
 */
const getBase64SizeInBytes = (base64String: string): number => {
  const base64Data = base64String.split(",")[1] || base64String;
  return Math.ceil((base64Data.length * 3) / 4);
};

/**
 * Converteix un File (imatge) a una cadena base64.
 * Si la imatge supera maxSizeBytes, es comprimeix automàticament.
 */
export const fileToBase64 = async (
  file: File,
  maxSizeBytes: number = MAX_SIZE_BYTES
): Promise<string> => {
  // Primer, intentem llegir directament sense compressió
  const directResult = await readFileAsDataUrl(file);

  if (getBase64SizeInBytes(directResult) <= maxSizeBytes) {
    return directResult;
  }

  // Si supera el límit, comprimim
  const img = await loadImage(file);
  let quality = 0.9;
  let result = compressToDataUrl(img, quality);

  // Reduïm qualitat iterativament fins assolir la mida objectiu
  while (getBase64SizeInBytes(result) > maxSizeBytes && quality > 0.1) {
    quality -= 0.1;
    result = compressToDataUrl(img, quality);
  }

  return result;
};

/**
 * Llegeix un File directament com a data URL sense compressió.
 */
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Error llegint la imatge"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error llegint la imatge"));
    };

    reader.readAsDataURL(file);
  });
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
