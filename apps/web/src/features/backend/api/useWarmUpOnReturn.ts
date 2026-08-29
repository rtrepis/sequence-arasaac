// Desperta el servidor quan l'usuari torna a la pestanya després d'una estona.
//
// Render adorm el servei als 15 minuts sense trànsit, i tornar d'una absència
// vol dir gairebé sempre haver passat d'aquest llindar: el primer «Desa al
// núvol» pagava el minut sencer de desvetllament amb el diàleg obert i la feina
// encara sense còpia. El ping ja existia (`warmUpBackend`), però només el
// cridaven l'entrada al compte i el registre — el moment en què l'usuari ja
// espera esperar.
import { useEffect } from "react";
import { getAccessToken } from "./apiClient";
import { warmUpBackend } from "./warmUpBackend";

/**
 * Absència a partir de la qual val la pena despertar el servidor.
 *
 * No es fa a cada canvi de pestanya a propòsit: en tauleta —el dispositiu típic
 * aquí— es canvia d'aplicació desenes de vegades al dia, i cada ping manté
 * Render despert gastant hores del pla gratuït tant si serveixen com si no. Per
 * sota d'aquests minuts, o el servidor encara és despert o el ping arribaria
 * massa just per estalviar res.
 */
const HIDDEN_ENOUGH_MS = 5 * 60 * 1000;

export const useWarmUpOnReturn = (): void => {
  useEffect(() => {
    let hiddenSince: number | null = null;

    const handleVisibilityChange = (): void => {
      if (window.document.visibilityState === "hidden") {
        hiddenSince = Date.now();
        return;
      }

      if (hiddenSince === null) return;

      const awayFor = Date.now() - hiddenSince;
      hiddenSince = null;

      if (awayFor < HIDDEN_ENOUGH_MS) return;
      // Sense sessió no hi ha res a esperar del servidor: l'app funciona
      // sencera sense compte. I des que el refresc fallit neteja el token, una
      // sessió morta tampoc no desperta ningú.
      if (getAccessToken() === null) return;

      void warmUpBackend();
    };

    window.document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () =>
      window.document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
  }, []);
};
