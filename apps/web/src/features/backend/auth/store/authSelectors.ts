// Selectors de sessió
//
// Fitxer a part i no dins de l'`authSlice` a propòsit: el consumeixen també els
// thunks d'altres features, i importar-los del slice hi faria dependre mig front
// del mòdul que crea l'estat d'auth.
import type { RootState } from "@app/store";
import { ACCOUNTS_ENABLED } from "@/configs/accountsConfig";

/**
 * Únic lloc on es decideix si hi ha sessió de compte.
 *
 * Amb les funcions de compte apagades no n'hi ha mai: així, tot el que ja
 * penjava d'aquesta condició —desar i carregar del núvol, vocabulari personal,
 * quota, qualitat d'imatge, sincronització de preferències— queda apagat sense
 * tocar-ne la lògica.
 *
 * Compte: `!selectIsLoggedIn` **no** vol dir «ensenya la porta d'entrada». Amb
 * els comptes apagats no hi ha sessió i tampoc no hi ha entrada; qui pinti el
 * botó d'entrar ha de mirar `ACCOUNTS_ENABLED` a més d'això.
 */
export const selectIsLoggedIn = (state: RootState): boolean =>
  ACCOUNTS_ENABLED && state.auth.accessToken !== null;
