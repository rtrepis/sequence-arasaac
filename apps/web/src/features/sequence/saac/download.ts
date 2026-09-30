// Descàrrega d'un `.saac` o `.saacstyle` al navegador.
//
// **Sempre `application/octet-stream`**: amb `text/plain`, Android i iOS desaven
// el fitxer com a `nom.saac.txt`, i després no el reconeixien com a document
// (`docs/fonaments/06-compatibilitat-i-dades.md`, «Descàrrega»).
import {
  DOCUMENT_FILE_EXTENSION,
  SAAC_DOWNLOAD_MIME,
  STYLE_FILE_EXTENSION,
} from "./types";

export type SaacFileExtension =
  | typeof DOCUMENT_FILE_EXTENSION
  | typeof STYLE_FILE_EXTENSION;

/**
 * Nom del fitxer: el que ha escrit l'usuari (sense repetir l'extensió si ja
 * l'hi ha posat) o, si no n'ha escrit cap, un amb la data.
 */
export const saacFileName = (
  name: string,
  extension: SaacFileExtension,
  now: Date = new Date(),
): string => {
  const trimmed = name.trim();
  const base =
    trimmed === ""
      ? `SequenciAAC_${now.toISOString().slice(0, -5)}`
      : trimmed.replace(/(\.(saac|saacstyle|txt|json))+$/i, "");
  return `${base}${extension}`;
};

export const saacBlob = (json: string): Blob =>
  new Blob([json], { type: SAAC_DOWNLOAD_MIME });

/** Descarrega el JSON amb el nom i el tipus que toquen. */
export const downloadSaac = (
  json: string,
  name: string,
  extension: SaacFileExtension,
): void => {
  const link = window.document.createElement("a");
  const url = URL.createObjectURL(saacBlob(json));
  link.href = url;
  link.download = saacFileName(name, extension);
  link.click();
  // Més tard, i no tot seguit: alguns navegadors mòbils encara llegeixen la URL
  // després del clic
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
