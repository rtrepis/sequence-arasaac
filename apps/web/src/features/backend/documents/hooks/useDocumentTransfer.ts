// Lectura reactiva del progrés de transferència des de components.
import { useSyncExternalStore } from "react";
import {
  DocumentTransferState,
  getTransferState,
  subscribeToTransferProgress,
} from "../services/documentTransfer";

export const useDocumentTransfer = (): DocumentTransferState =>
  useSyncExternalStore(
    subscribeToTransferProgress,
    getTransferState,
    getTransferState,
  );
