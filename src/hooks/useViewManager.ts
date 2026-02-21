import { useCallback, useState } from "react";
import { ViewSettings } from "../types/ui";
import { useAppDispatch } from "../app/hooks";
import { viewSettingsActionCreator } from "../app/slice/uiSlice";

/**
 * Configuració del hook de gestió de visualització
 */
export interface ViewManagerConfig {
  initialViewSettings: ViewSettings;
  persistToStore?: boolean;
}

/**
 * Resultat del hook de gestió de visualització
 */
export interface ViewManagerState {
  viewSettings: ViewSettings;
  updateViewSetting: <K extends keyof ViewSettings>(
    key: K,
    value: ViewSettings[K],
  ) => void;
  resetViewSettings: () => void;
  persistViewSettings: () => void;
}

/**
 * Hook custom per gestionar l'estat de visualització
 * Segueix el principi de Single Responsibility
 *
 * @param config - Configuració del hook
 * @returns Estat i funcions per gestionar la visualització
 */
export function useViewManager(config: ViewManagerConfig): ViewManagerState {
  const { initialViewSettings, persistToStore = true } = config;
  const dispatch = useAppDispatch();

  const [viewSettings, setViewSettings] =
    useState<ViewSettings>(initialViewSettings);

  /**
   * Actualitza una propietat específica de la configuració de visualització
   */
  const updateViewSetting = useCallback(
    <K extends keyof ViewSettings>(key: K, value: ViewSettings[K]) => {
      setViewSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  /**
   * Reseteja la configuració de visualització als valors inicials
   */
  const resetViewSettings = useCallback(() => {
    setViewSettings(initialViewSettings);
  }, [initialViewSettings]);

  /**
   * Persisteix la configuració actual a la store de Redux
   */
  const persistViewSettings = useCallback(() => {
    if (persistToStore) {
      dispatch(viewSettingsActionCreator(viewSettings));
    }
  }, [dispatch, viewSettings, persistToStore]);

  return {
    viewSettings,
    updateViewSetting,
    resetViewSettings,
    persistViewSettings,
  };
}

/**
 * Hook helper per gestionar l'autor del document
 */
export function useAuthorManager(initialAuthor = "") {
  const [author, setAuthor] = useState(initialAuthor);

  const updateAuthor = useCallback((newAuthor: string) => {
    setAuthor(newAuthor);
  }, []);

  const clearAuthor = useCallback(() => {
    setAuthor("");
  }, []);

  return {
    author,
    updateAuthor,
    clearAuthor,
  };
}
