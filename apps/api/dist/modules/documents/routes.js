"use strict";
// Router Express per al mòdul de documents
// Totes les rutes requereixen autenticació JWT via authMiddleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const controller_1 = require("./controller");
const documentsRouter = (0, express_1.Router)();
exports.documentsRouter = documentsRouter;
// Aplica el middleware d'autenticació a totes les rutes del mòdul
documentsRouter.use(authMiddleware_1.authMiddleware);
documentsRouter.get("/", controller_1.listDocuments);
documentsRouter.post("/", controller_1.createDocument);
documentsRouter.get("/:id", controller_1.getDocument);
documentsRouter.put("/:id", controller_1.updateDocument);
documentsRouter.delete("/:id", controller_1.deleteDocument);
