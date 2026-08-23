// Esborrany del document en curs, desat al navegador.
//
// Va a IndexedDB i no a sessionStorage/localStorage a propòsit: aquests donen
// uns 5 MB per origen —i compten en UTF-16, o sigui la meitat de caràcters—
// mentre que una sola imatge pujada en base64 ja se'ls menja. IndexedDB
// treballa amb una fracció del disc i s'hi pot desar el document sencer,
// imatges incloses, sense tocar-ne el format.
//
// L'esborrany és una xarxa de seguretat, no un desat: el navegador el pot
// desallotjar (Safari ho fa als 7 dies sense visitar el lloc). Qui mana
// segueixen sent «Descarrega» i «Desa al núvol».
//
// Les imatges pujades no viuen dins del document desat, sinó en un magatzem a
// part, i s'hi escriuen un sol cop. El document en guarda una referència. El
// motiu és de rendiment: desar-ho tot junt volia dir tornar a escriure els
// base64 sencers cada vegada que es movia un slider —desenes de mil·lisegons de
// fil principal cada segon— quan el que canvia són uns quants KB d'ajustos.
// Això és capa d'emmagatzematge i prou: ni el `.saac`, ni el que rep l'API, ni
// `PictApiAra.url` a Redux canvien de forma.
import { DocumentSAAC } from "@/types/document";
import { Sequence } from "@/types/sequence";
import { DurableKind } from "@features/sequence/store/documentStatusSlice";

const DB_NAME = "sequenciaac";
const DB_VERSION = 2;
const STORE_NAME = "drafts";
const IMAGE_STORE_NAME = "draftImages";
const DRAFT_KEY = "currentDocument";

/** Marca una `url` que no és la imatge sinó on trobar-la al magatzem. */
const IMAGE_REF_PREFIX = "draft-image:";

/**
 * Estat de durabilitat que viatja amb l'esborrany. Sense ell, en recarregar la
 * pàgina un document acabat de desar al núvol tornaria a semblar feina que no
 * és enlloc, i l'indicador d'estat mentiria just quan més se'l mira.
 */
export interface DraftMeta {
  savedAt: number;
  durableAt: number | null;
  durableKind: DurableKind | null;
}

export interface DocumentDraft extends DraftMeta {
  document: DocumentSAAC;
}

/**
 * Obre la base de dades. Retorna null en comptes de llançar: si el navegador
 * no en té (mode privat d'algunes versions, emmagatzematge bloquejat), l'app
 * ha de continuar funcionant sencera sense esborrany.
 */
const openDatabase = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME);
      // Els esborranys de la versió 1 no tenen aquest magatzem i porten els
      // base64 a dins del document; es continuen llegint igual
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME))
        db.createObjectStore(IMAGE_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

/**
 * Executa una transacció sobre els dos magatzems i tanca sempre la connexió.
 * El resultat es resol quan la transacció es completa, no quan responen les
 * peticions: fins llavors l'escriptura no és ferma.
 */
const runTransaction = (
  db: IDBDatabase,
  mode: "readonly" | "readwrite",
  work: (drafts: IDBObjectStore, images: IDBObjectStore) => void,
): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const transaction = db.transaction([STORE_NAME, IMAGE_STORE_NAME], mode);
      work(
        transaction.objectStore(STORE_NAME),
        transaction.objectStore(IMAGE_STORE_NAME),
      );

      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };
      transaction.onerror = () => {
        db.close();
        resolve(false);
      };
      transaction.onabort = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });

const isEmbeddedImage = (url: string | undefined): url is string =>
  url !== undefined && url.startsWith("data:");

const SAMPLE_LENGTH = 512;

/**
 * Identificador d'una imatge a partir del seu contingut.
 *
 * Es calcula sobre tres trossos i la llargada, no sobre la cadena sencera:
 * recórrer 700 KB de base64 a cada desat seria tornar a pagar allò que aquest
 * mòdul vol estalviar. Dues imatges diferents amb la mateixa llargada i els
 * mateixos tres trossos no passa amb dades comprimides.
 */
const getImageId = (dataUrl: string): string => {
  const middle = Math.max(
    0,
    Math.floor(dataUrl.length / 2) - SAMPLE_LENGTH / 2,
  );
  const sample =
    dataUrl.slice(0, SAMPLE_LENGTH) +
    dataUrl.slice(middle, middle + SAMPLE_LENGTH) +
    dataUrl.slice(-SAMPLE_LENGTH);

  let hash = 5381;
  for (let index = 0; index < sample.length; index += 1) {
    hash = ((hash << 5) + hash + sample.charCodeAt(index)) | 0;
  }

  return `${dataUrl.length.toString(36)}-${(hash >>> 0).toString(36)}`;
};

interface ExternalizedDocument {
  document: DocumentSAAC;
  images: Map<string, string>;
}

/**
 * Treu les imatges incrustades del document i les substitueix per referències.
 * Construeix objectes nous a cada nivell que toca: el document ve de Redux i
 * no s'hi pot escriure.
 */
const externalizeImages = (document: DocumentSAAC): ExternalizedDocument => {
  const images = new Map<string, string>();

  const content = Object.entries(document.content).reduce<{
    [key: number]: Sequence;
  }>((accumulated, [key, sequence]) => {
    accumulated[Number(key)] = sequence.map((pictogram) => {
      if (!isEmbeddedImage(pictogram.img.url)) return pictogram;

      const id = getImageId(pictogram.img.url);
      images.set(id, pictogram.img.url);

      return {
        ...pictogram,
        img: { ...pictogram.img, url: `${IMAGE_REF_PREFIX}${id}` },
      };
    });

    return accumulated;
  }, {});

  return { document: { ...document, content }, images };
};

/** Torna a posar les imatges dins del document llegit. */
const restoreImages = (
  document: DocumentSAAC,
  images: Map<string, string>,
): DocumentSAAC => {
  const content = Object.entries(document.content).reduce<{
    [key: number]: Sequence;
  }>((accumulated, [key, sequence]) => {
    accumulated[Number(key)] = sequence.map((pictogram) => {
      const { url } = pictogram.img;
      if (url === undefined || !url.startsWith(IMAGE_REF_PREFIX))
        return pictogram;

      const image = images.get(url.slice(IMAGE_REF_PREFIX.length));
      // Si la imatge no hi és (magatzem retallat pel navegador), val més el
      // pictograma sense imatge que perdre la seqüència sencera
      return { ...pictogram, img: { ...pictogram.img, url: image } };
    });

    return accumulated;
  }, {});

  return { ...document, content };
};

/**
 * Desa l'esborrany. Retorna si s'ha pogut desar, perquè qui el crida pugui
 * avisar l'usuari: quedar-se sense espai amb la feina només a la pantalla és
 * exactament el que aquest mòdul ha d'evitar.
 */
export const saveDraft = async (
  document: DocumentSAAC,
  meta: DraftMeta,
): Promise<boolean> => {
  const db = await openDatabase();
  if (!db) return false;

  const { document: skeleton, images } = externalizeImages(document);
  const draft: DocumentDraft = { document: skeleton, ...meta };

  return runTransaction(db, "readwrite", (drafts, imageStore) => {
    drafts.put(draft, DRAFT_KEY);

    // Les claus del magatzem són poques i curtes: llegir-les surt molt més a
    // compte que reescriure les imatges per si de cas
    const storedKeys = imageStore.getAllKeys();
    storedKeys.onsuccess = () => {
      const stored = new Set(storedKeys.result.map(String));

      images.forEach((dataUrl, id) => {
        if (!stored.has(id)) imageStore.put(dataUrl, id);
      });

      // Escombraries: imatges que ja no fa servir cap pictograma
      stored.forEach((id) => {
        if (!images.has(id)) imageStore.delete(id);
      });
    };
  });
};

/** Llegeix l'esborrany desat, o null si no n'hi ha o no s'ha pogut llegir. */
export const readDraft = async (): Promise<DocumentDraft | null> => {
  const db = await openDatabase();
  if (!db) return null;

  let draft: DocumentDraft | undefined;
  const images = new Map<string, string>();

  const ok = await runTransaction(db, "readonly", (drafts, imageStore) => {
    const draftRequest = drafts.get(DRAFT_KEY);
    draftRequest.onsuccess = () => {
      draft = draftRequest.result as DocumentDraft | undefined;
    };

    const keysRequest = imageStore.getAllKeys();
    const valuesRequest = imageStore.getAll();
    valuesRequest.onsuccess = () => {
      keysRequest.result.forEach((key, index) => {
        images.set(String(key), valuesRequest.result[index] as string);
      });
    };
  });

  if (!ok || !draft) return null;

  return { ...draft, document: restoreImages(draft.document, images) };
};

/**
 * Esborra l'esborrany. La fa servir «Document nou»: sense això, un refresc
 * ressuscitaria la feina que l'usuari acaba de decidir deixar enrere.
 */
export const clearDraft = async (): Promise<void> => {
  const db = await openDatabase();
  if (!db) return;

  await runTransaction(db, "readwrite", (drafts, imageStore) => {
    drafts.delete(DRAFT_KEY);
    imageStore.clear();
  });
};
