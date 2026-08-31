// Servei centralitzat de persistència per a la configuració de l'usuari anònim.
// Quan l'usuari és autenticat, la font de veritat és el backend — no s'usa aquest storage.
import { UserUiSettings } from "../../../types/ui";

const USER_UI_KEY = "userUi";

/**
 * Clau pròpia per a l'última configuració coneguda del compte.
 *
 * Separada de la de l'anònim a propòsit: en tancar sessió s'han de poder
 * recuperar les preferències de qui feia servir el dispositiu sense compte, tal
 * com estaven. Si les dues coses compartissin calaix, entrar al compte se les
 * menjaria i no hi hauria manera de tornar-hi.
 */
const ACCOUNT_UI_KEY = "accountUi";

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

/**
 * Última configuració coneguda del compte, per pintar l'app amb la cara de qui
 * és **abans** que respongui el servidor.
 *
 * Amb Render adormit, la resposta pot trigar prop d'un minut, i fins llavors
 * l'app es pintava amb la configuració que hi havia al navegador d'abans
 * d'entrar al compte: un altre tema, un altre idioma i, quan arribava la bona,
 * un salt a mitja feina.
 */
export const getStoredAccountUi = (): UserUiSettings | null => {
  const raw = readFromStorage(ACCOUNT_UI_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as UserUiSettings;
  } catch {
    return null;
  }
};

/**
 * Desa la configuració del compte per a la propera arrencada. **Sense el
 * vocabulari**: les imatges en base64 omplen els 5 MB del navegador, i el
 * vocabulari és del compte i no del dispositiu — que en AAC sovint és compartit.
 */
export const saveAccountUi = (settings: UserUiSettings): void => {
  try {
    // Només el que es pinta. Ni `tier` ni `emailVerified` ni `role`: són estat
    // del compte que decideix el servidor a cada petició, i tenir-ne una còpia
    // vella al navegador només podria fer prendre decisions amb dades caducades.
    const { lang, theme, defaultSettings, viewSettings, imageQuality } =
      settings;

    writeToStorage(
      ACCOUNT_UI_KEY,
      JSON.stringify({
        lang,
        theme,
        defaultSettings,
        viewSettings,
        imageQuality,
        wordProfiles: [],
      }),
    );
  } catch (error) {
    // És una caché: si no s'hi pot escriure, l'única conseqüència és que la
    // propera arrencada tornarà a esperar el servidor
    console.error("No s'ha pogut desar la configuració del compte:", error);
  }
};

/**
 * Esborra la caché del compte. Es crida en tancar sessió i quan el refresc
 * silenciós falla: el que és del compte no s'ha de quedar al dispositiu quan el
 * compte ja no hi és.
 */
export const clearStoredAccountUi = (): void => {
  try {
    sessionStorage.removeItem(ACCOUNT_UI_KEY);
    localStorage.removeItem(ACCOUNT_UI_KEY);
  } catch (error) {
    console.error("No s'ha pogut esborrar la configuració del compte:", error);
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
