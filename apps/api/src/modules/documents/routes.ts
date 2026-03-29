// Router Express per al mòdul de documents
// Totes les rutes requereixen autenticació JWT via authMiddleware

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
} from "./controller";

const documentsRouter = Router();

// Aplica el middleware d'autenticació a totes les rutes del mòdul
documentsRouter.use(authMiddleware);

documentsRouter.get("/", listDocuments);
documentsRouter.post("/", createDocument);
documentsRouter.get("/:id", getDocument);
documentsRouter.put("/:id", updateDocument);
documentsRouter.delete("/:id", deleteDocument);

export { documentsRouter };
