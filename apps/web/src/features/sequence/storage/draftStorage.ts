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
import { DocumentSAAC } from "@/types/document";
import { DurableKind } from "@features/sequence/store/documentStatusSlice";

const DB_NAME = "sequenciaac";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "currentDocument";

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
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

/**
 * Executa una operació dins d'una transacció i tanca sempre la connexió.
 * El resultat es resol quan la transacció es completa, no quan la petició
 * respon: fins llavors l'escriptura no és ferma.
 */
const runTransaction = <TResult>(
  db: IDBDatabase,
  mode: "readonly" | "readwrite",
  operation: (store: IDBObjectStore) => IDBRequest<TResult>,
): Promise<{ ok: boolean; result?: TResult }> =>
  new Promise((resolve) => {
    let request: IDBRequest<TResult>;

    try {
      const transaction = db.transaction(STORE_NAME, mode);
      request = operation(transaction.objectStore(STORE_NAME));

      transaction.oncomplete = () => {
        db.close();
        resolve({ ok: true, result: request.result });
      };
      transaction.onerror = () => {
        db.close();
        resolve({ ok: false });
      };
      transaction.onabort = () => {
        db.close();
        resolve({ ok: false });
      };
    } catch {
      db.close();
      resolve({ ok: false });
    }
  });

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

  const draft: DocumentDraft = { document, ...meta };
  const { ok } = await runTransaction(db, "readwrite", (store) =>
    store.put(draft, DRAFT_KEY),
  );

  return ok;
};

/** Llegeix l'esborrany desat, o null si no n'hi ha o no s'ha pogut llegir. */
export const readDraft = async (): Promise<DocumentDraft | null> => {
  const db = await openDatabase();
  if (!db) return null;

  const { ok, result } = await runTransaction<DocumentDraft | undefined>(
    db,
    "readonly",
    (store) => store.get(DRAFT_KEY),
  );

  return ok && result ? result : null;
};

/**
 * Esborra l'esborrany. La fa servir «Document nou»: sense això, un refresc
 * ressuscitaria la feina que l'usuari acaba de decidir deixar enrere.
 */
export const clearDraft = async (): Promise<void> => {
  const db = await openDatabase();
  if (!db) return;

  await runTransaction(db, "readwrite", (store) => store.delete(DRAFT_KEY));
};
