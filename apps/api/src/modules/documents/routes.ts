// Router Express per al mòdul de documents
// Totes les rutes requereixen autenticació JWT via authMiddleware

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
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

// Llegir i esborrar es permet sempre; escriure requereix el correu verificat,
// perquè és el que puja imatges a Cloudinary i costa diners.
// Esborrar en queda fora a propòsit: mai s'ha d'impedir a algú alliberar espai.
documentsRouter.get("/", listDocuments);
documentsRouter.post("/", requireVerifiedEmail, createDocument);
documentsRouter.get("/:id", getDocument);
documentsRouter.put("/:id", requireVerifiedEmail, updateDocument);
documentsRouter.delete("/:id", deleteDocument);

export { documentsRouter };
