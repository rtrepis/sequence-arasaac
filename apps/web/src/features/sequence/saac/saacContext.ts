// El que el model v3 necessita de l'store per llegir i escriure fitxers: l'estil
// i la pàgina per defecte de l'usuari. Obrir un document no els modifica mai:
// només els fa servir per omplir el que el fitxer no porta.
import type { DefaultSettings, ViewSettings } from "@/types/ui";
import { buildUserDefaultStyle } from "@features/sequence/style/styleModel";
import type { ParseContext } from "./parse";
import { SerializeContext, UserPage, newSaacId } from "./serialize";

/** La part de l'store que fa servir el model (sense `RootState`: evita cicles). */
export interface SaacSourceState {
  ui: { defaultSettings: DefaultSettings; viewSettings: ViewSettings };
}

/** Identificador d'un document nou, amb la mateixa forma de sempre. */
export const newDocumentId = (): string =>
  `${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;

/** La pàgina per defecte de l'usuari: la que hereta un document sense pàgina. */
export const userPageOf = ({ ui }: SaacSourceState): UserPage => ({
  size: ui.viewSettings.pageSize ?? "A4",
  orientation: ui.viewSettings.orientation ?? "landscape",
  direction: ui.viewSettings.direction ?? "row",
});

export const parseContextOf = (state: SaacSourceState): ParseContext => ({
  userDefault: buildUserDefaultStyle(
    state.ui.defaultSettings,
    state.ui.viewSettings,
  ),
  userPage: userPageOf(state),
  newDocumentId,
  now: new Date().toISOString(),
});

export const serializeContextOf = (
  state: SaacSourceState,
): SerializeContext => ({
  userDefault: buildUserDefaultStyle(
    state.ui.defaultSettings,
    state.ui.viewSettings,
  ),
  userPage: userPageOf(state),
  newId: newSaacId,
  now: new Date().toISOString(),
});
