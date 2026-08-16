// Servei centralitzat de persistència per a la configuració de l'usuari anònim.
// Quan l'usuari és autenticat, la font de veritat és el backend — no s'usa aquest storage.
import { UserUiSettings } from "../../../types/ui";

const USER_UI_KEY = "userUi";

const readFromStorage = (key: string): string | null =>
  sessionStorage.getItem(key) ?? localStorage.getItem(key);

const writeToStorage = (key: string, value: string): void => {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

export const getStoredUserUi = (): UserUiSettings | null => {
  const raw = readFromStorage(USER_UI_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as UserUiSettings;
  } catch {
    return null;
  }
};

/** Codi de l'error que llança saveUserUi quan el navegador no té espai. */
export const STORAGE_FULL_ERROR = "STORAGE_FULL";

export interface StorageError extends Error {
  code: typeof STORAGE_FULL_ERROR;
}

/**
 * Treu el vocabulari personal del que hi ha desat al navegador.
 *
 * Es crida en tancar sessió: recupera l'espai que ocupaven les imatges de les
 * paraules —que és el que deixava l'emmagatzematge ple i impedia desar res més—
 * i evita que el vocabulari d'algú quedi al dispositiu quan ja no hi és.
 */
export const clearStoredWordProfiles = (): void => {
  const stored = getStoredUserUi();
  if (!stored?.wordProfiles?.length) return;

  try {
    saveUserUi({ ...stored, wordProfiles: [] });
  } catch (error) {
    // Neteja oportunista: si no es pot escriure, res del que ve després en depèn
    console.error("No s'ha pogut netejar el vocabulari del navegador:", error);
  }
};

export const saveUserUi = (settings: UserUiSettings): void => {
  try {
    writeToStorage(USER_UI_KEY, JSON.stringify(settings));
  } catch (error) {
    // El navegador dona uns 5 MB per origen i aquí s'hi escriu dues vegades
    // (sessió i local). El vocabulari personal amb imatges els omple de pressa,
    // i llavors qualsevol canvi de configuració deixa de poder-se desar.
    console.error("No s'ha pogut desar la configuració al navegador:", error);
    const storageError = new Error(
      "Emmagatzematge del navegador ple",
    ) as StorageError;
    storageError.code = STORAGE_FULL_ERROR;
    throw storageError;
  }
};
