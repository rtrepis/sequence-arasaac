import { useSyncExternalStore } from "react";
import { isFloatingRaised, subscribeFloatingRaised } from "./floatingRaised";

/**
 * Si alguna capa de baix ocupa ara mitja pantalla o més. És el senyal que fa
 * servir qui s'ha d'apartar quan el panell puja (la barra de l'app, M5), sense
 * haver de saber quin panell és ni on és.
 */
export const useFloatingRaised = (): boolean =>
  useSyncExternalStore(
    subscribeFloatingRaised,
    isFloatingRaised,
    // Al servidor no hi ha cap capa
    () => false,
  );
