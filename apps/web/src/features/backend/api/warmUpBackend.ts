// Ping preventiu al backend per escurçar l'espera del desvetllament de Render.
//
// La idea és avançar el cost: si el servidor es comença a despertar quan l'usuari
// obre el formulari d'entrada, mentre escriu el correu i la contrasenya el
// desvetllament ja va avançat i sovint la petició real ja no espera res.
import apiClient from "./apiClient";

// Render adorm el servei als 15 minuts d'inactivitat. Amb 10 s'evita repetir el ping
// dins d'una mateixa sessió activa sense arriscar-se a arribar tard.
const WARM_UP_COOLDOWN_MS = 10 * 60 * 1000;

let lastWarmUpAt: number | null = null;

export const warmUpBackend = async (): Promise<void> => {
  const now = Date.now();
  if (lastWarmUpAt !== null && now - lastWarmUpAt < WARM_UP_COOLDOWN_MS) return;
  lastWarmUpAt = now;

  try {
    // De fons: l'usuari no ha demanat res, així que aquesta petició no ha d'encendre
    // l'avís de desvetllament ni bloquejar cap interfície.
    await apiClient.get("/health", { isBackgroundRequest: true });
  } catch (error) {
    // Un ping fallit no és un problema de l'usuari: si el servidor no hi és,
    // la petició real que vingui després ja ho explicarà pel seu compte.
    console.debug("Ping de desvetllament del servidor fallit:", error);
  }
};
