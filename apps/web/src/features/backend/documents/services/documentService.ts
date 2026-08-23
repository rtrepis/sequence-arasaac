// Capa de servei per al CRUD de documents al backend.
import type { AxiosProgressEvent } from "axios";
import apiClient from "../../api/apiClient";
import {
  DocumentSAAC,
  DocumentThumbnailPict,
} from "../../../../types/document";
import {
  notifyTransferProgress,
  resetTransferProgress,
} from "./documentTransfer";

export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: string;
  // Els documents desats abans que existís la miniatura arriben amb la llista buida
  thumbnail: DocumentThumbnailPict[];
}

// Els documents amb imatges pròpies pesen: sense aquests events, l'usuari no sap
// si la pujada avança o s'ha aturat. El progrés es publica al mòdul compartit
// perquè el diàleg el pugui llegir sense passar cap funció pels thunks.
const uploadProgress = (event: AxiosProgressEvent): void =>
  notifyTransferProgress("upload", event.loaded, event.total);

const downloadProgress = (event: AxiosProgressEvent): void =>
  notifyTransferProgress("download", event.loaded, event.total);

export const listDocuments = async (): Promise<DocumentSummary[]> => {
  const { data } = await apiClient.get<{ documents: DocumentSummary[] }>(
    "/documents",
  );
  return data.documents;
};

export const createDocument = async (
  doc: Omit<DocumentSAAC, "id">,
): Promise<DocumentSAAC> => {
  try {
    const { data } = await apiClient.post<DocumentSAAC>("/documents", doc, {
      onUploadProgress: uploadProgress,
      onDownloadProgress: downloadProgress,
    });
    return data;
  } finally {
    // També quan falla: un progrés a mitges que es quedés a la pantalla diria
    // que encara s'està desant quan ja fa estona que s'ha aturat.
    resetTransferProgress();
  }
};

export const fetchDocument = async (id: string): Promise<DocumentSAAC> => {
  try {
    const { data } = await apiClient.get<DocumentSAAC>(`/documents/${id}`, {
      onDownloadProgress: downloadProgress,
    });
    return data;
  } finally {
    resetTransferProgress();
  }
};

export const updateDocument = async (
  id: string,
  doc: Omit<DocumentSAAC, "id">,
): Promise<DocumentSAAC> => {
  try {
    const { data } = await apiClient.put<DocumentSAAC>(
      `/documents/${id}`,
      doc,
      {
        onUploadProgress: uploadProgress,
        onDownloadProgress: downloadProgress,
      },
    );
    return data;
  } finally {
    resetTransferProgress();
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/documents/${id}`);
};

// Detecta si un id és un MongoDB ObjectId (24 caràcters hexadecimals)
export const isMongoId = (id: string): boolean => /^[a-f\d]{24}$/i.test(id);
