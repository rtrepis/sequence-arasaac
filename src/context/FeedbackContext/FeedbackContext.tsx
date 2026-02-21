import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  ReactElement,
} from "react";

// Tipus per al Snackbar
export type SnackbarSeverity = "success" | "error" | "warning" | "info";

export interface SnackbarOptions {
  message: string;
  severity?: SnackbarSeverity;
  duration?: number;
}

// Tipus per al Progress
export interface ProgressOptions {
  current: number;
  total: number;
  message?: string;
}

// Tipus per al Backdrop
export interface BackdropOptions {
  message?: string;
}

// Estat del context
interface FeedbackState {
  snackbar: {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
    duration: number;
  };
  progress: {
    open: boolean;
    current: number;
    total: number;
    message: string;
  };
  backdrop: {
    open: boolean;
    message: string;
  };
}

// Interfície del context
interface FeedbackContextValue {
  state: FeedbackState;
  showSnackbar: (options: SnackbarOptions) => void;
  hideSnackbar: () => void;
  showProgress: (options: ProgressOptions) => void;
  updateProgress: (current: number) => void;
  hideProgress: () => void;
  showBackdrop: (options?: BackdropOptions) => void;
  hideBackdrop: () => void;
}

// Estat inicial
const initialState: FeedbackState = {
  snackbar: {
    open: false,
    message: "",
    severity: "info",
    duration: 3000,
  },
  progress: {
    open: false,
    current: 0,
    total: 0,
    message: "",
  },
  backdrop: {
    open: false,
    message: "",
  },
};

// Crear el context
const FeedbackContext = createContext<FeedbackContextValue | undefined>(
  undefined
);

// Props del Provider
interface FeedbackProviderProps {
  children: ReactNode;
}

// Provider component
export const FeedbackProvider = ({
  children,
}: FeedbackProviderProps): ReactElement => {
  const [state, setState] = useState<FeedbackState>(initialState);

  // Snackbar handlers
  const showSnackbar = useCallback((options: SnackbarOptions) => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        open: true,
        message: options.message,
        severity: options.severity ?? "info",
        duration: options.duration ?? 3000,
      },
    }));
  }, []);

  const hideSnackbar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  }, []);

  // Progress handlers
  const showProgress = useCallback((options: ProgressOptions) => {
    setState((prev) => ({
      ...prev,
      progress: {
        open: true,
        current: options.current,
        total: options.total,
        message: options.message ?? "",
      },
    }));
  }, []);

  const updateProgress = useCallback((current: number) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        current,
      },
    }));
  }, []);

  const hideProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        open: false,
        current: 0,
        total: 0,
      },
    }));
  }, []);

  // Backdrop handlers
  const showBackdrop = useCallback((options?: BackdropOptions) => {
    setState((prev) => ({
      ...prev,
      backdrop: {
        open: true,
        message: options?.message ?? "",
      },
    }));
  }, []);

  const hideBackdrop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      backdrop: {
        ...prev.backdrop,
        open: false,
      },
    }));
  }, []);

  const value: FeedbackContextValue = {
    state,
    showSnackbar,
    hideSnackbar,
    showProgress,
    updateProgress,
    hideProgress,
    showBackdrop,
    hideBackdrop,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Hook per usar el context
export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedback ha de ser usat dins de FeedbackProvider");
  }
  return context;
};

export default FeedbackContext;
