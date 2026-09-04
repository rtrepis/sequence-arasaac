import { useEffect } from "react";
import { FLOATING_CONTROL_CLEARANCE } from "@/style/appShape";
import { setFloatingCorner } from "./floatingCorner";

/**
 * Declara que aquesta capa ocupa el racó inferior dret mentre és a la pantalla,
 * de manera que els avisos del peu s'hi apartin. En desmuntar-se, la reserva
 * desapareix i l'avís torna a ocupar tota l'amplada.
 *
 * L'amplada no es mesura, a diferència de l'alçada de `useFloatingInset`: tots
 * els controls flotants de l'app fan `APP_CONTROL_SIZE` de costat i la reserva
 * ja es deriva d'aquell token. El que canvia d'una capa a l'altra és l'alçada
 * del text, no l'amplada del botó.
 */
export const useFloatingCorner = (id: string): void => {
  useEffect(() => {
    setFloatingCorner(id, FLOATING_CONTROL_CLEARANCE);

    return () => setFloatingCorner(id, null);
  }, [id]);
};
