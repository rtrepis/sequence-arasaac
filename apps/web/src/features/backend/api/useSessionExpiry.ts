// Lectura reactiva de la caiguda de sessió des de components.
import { useSyncExternalStore } from "react";
import {
  getExpiredSessionCode,
  subscribeToSessionExpiry,
} from "./sessionExpiry";

export const useExpiredSessionCode = (): string | null =>
  useSyncExternalStore(
    subscribeToSessionExpiry,
    getExpiredSessionCode,
    getExpiredSessionCode,
  );
