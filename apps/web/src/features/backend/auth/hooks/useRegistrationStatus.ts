// Estat del registre per a la pàgina de creació de compte: quantes altes
// queden avui, quantes places en total i quan es renova el comptador.
//
// **Mai bloqueja el formulari per desconeixement.** Si la petició falla —el
// servidor de Render pot estar adormit o pot no respondre— es retorna null i la
// pàgina deixa provar-ho: qui mana sobre si hi cap una alta més és el servidor,
// que ho torna a comprovar en rebre-la. Donar per tancat el registre perquè una
// petició informativa ha fallat seria tancar-lo per equivocació.
import { useCallback, useEffect, useState } from "react";
import type { RegistrationStatus } from "@sequence-arasaac/shared-types";
import { getRegistrationStatus } from "../services/authService";

export interface UseRegistrationStatus {
  status: RegistrationStatus | null;
  /** Cert mentre no s'ha rebut ni fallat la primera petició. */
  isLoading: boolean;
  /** Torna a demanar l'estat: en acabar el compte enrere i després d'una alta. */
  refresh: () => void;
}

const useRegistrationStatus = (): UseRegistrationStatus => {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    let cancelled = false;

    void (async (): Promise<void> => {
      try {
        const next = await getRegistrationStatus();
        if (!cancelled) setStatus(next);
      } catch {
        // Silenci a propòsit: no és cap fallada que l'usuari hagi demanat, i el
        // formulari funciona igual sense la xifra
        if (!cancelled) setStatus(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => refresh(), [refresh]);

  return { status, isLoading, refresh };
};

export default useRegistrationStatus;
