// Lectura reactiva de l'estat de desvetllament del backend des de components.
import { useSyncExternalStore } from "react";
import {
  getIsBackendWakingUp,
  subscribeToBackendStatus,
} from "./backendStatus";

export const useIsBackendWakingUp = (): boolean =>
  useSyncExternalStore(
    subscribeToBackendStatus,
    getIsBackendWakingUp,
    getIsBackendWakingUp,
  );
