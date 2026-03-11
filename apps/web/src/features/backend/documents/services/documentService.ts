// Capa de servei per al CRUD de documents al backend.
import apiClient from "../../api/apiClient";
import { DocumentSAAC } from "../../../../types/document";

export interface DocumentSummary {
  id: string;
  title?: string;
  updatedAt: string;
}

export const listDocuments = async (): Promise<DocumentSummary[]> => {
  const { data } = await apiClient.get<{ documents: DocumentSummary[] }>(
    "/documents",
  );
  return data.documents;
};

export const createDocument = async (
  doc: Omit<DocumentSAAC, "id">,
): Promise<DocumentSAAC> => {
  const { data } = await apiClient.post<DocumentSAAC>("/documents", doc);
  return data;
};

export const fetchDocument = async (id: string): Promise<DocumentSAAC> => {
  const { data } = await apiClient.get<DocumentSAAC>(`/documents/${id}`);
  return data;
};

export const updateDocument = async (
  id: string,
  doc: Omit<DocumentSAAC, "id">,
): Promise<DocumentSAAC> => {
  const { data } = await apiClient.put<DocumentSAAC>(`/documents/${id}`, doc);
  return data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/documents/${id}`);
};

// Detecta si un id és un MongoDB ObjectId (24 caràcters hexadecimals)
export const isMongoId = (id: string): boolean =>
  /^[a-f\d]{24}$/i.test(id);
