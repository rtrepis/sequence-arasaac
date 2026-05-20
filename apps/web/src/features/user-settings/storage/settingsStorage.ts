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

export const saveUserUi = (settings: UserUiSettings): void => {
  writeToStorage(USER_UI_KEY, JSON.stringify(settings));
};
