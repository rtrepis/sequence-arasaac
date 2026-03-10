"use strict";
// Handlers Express per al mòdul de documents
// Delega tota la lògica al service — el controller només gestiona req/res
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.createDocument = exports.listDocuments = void 0;
const validators_1 = require("./validators");
const service_1 = require("./service");
// Helper per verificar que l'usuari autenticat és present
// authMiddleware garanteix userId, però TypeScript ho requereix explícitament
const requireUserId = (req, next) => {
    if (!req.userId) {
        const error = new Error("No autenticat");
        error.statusCode = 401;
        next(error);
        return null;
    }
    return req.userId;
};
// GET /api/documents
// Retorna el llistat de documents de l'usuari (id, title, updatedAt)
const listDocuments = async (req, res, next) => {
    try {
        const userId = requireUserId(req, next);
        if (!userId)
            return;
        const documents = await (0, service_1.listDocuments)(userId);
        res.status(200).json({ documents });
    }
    catch (err) {
        next(err);
    }
};
exports.listDocuments = listDocuments;
// POST /api/documents
// Crea un nou document i el retorna complet
const createDocument = async (req, res, next) => {
    try {
        const userId = requireUserId(req, next);
        if (!userId)
            return;
        const parsed = validators_1.createDocumentSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const document = await (0, service_1.createDocument)(userId, parsed.data);
        res.status(201).json(document);
    }
    catch (err) {
        next(err);
    }
};
exports.createDocument = createDocument;
// GET /api/documents/:id
// Retorna un document complet si pertany a l'usuari
const getDocument = async (req, res, next) => {
    try {
        const userId = requireUserId(req, next);
        if (!userId)
            return;
        const document = await (0, service_1.getDocument)(userId, req.params.id);
        res.status(200).json(document);
    }
    catch (err) {
        next(err);
    }
};
exports.getDocument = getDocument;
// PUT /api/documents/:id
// Actualitza un document complet i el retorna
const updateDocument = async (req, res, next) => {
    try {
        const userId = requireUserId(req, next);
        if (!userId)
            return;
        const parsed = validators_1.updateDocumentSchema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors[0]?.message ?? "Dades invàlides");
            error.statusCode = 400;
            return next(error);
        }
        const document = await (0, service_1.updateDocument)(userId, req.params.id, parsed.data);
        res.status(200).json(document);
    }
    catch (err) {
        next(err);
    }
};
exports.updateDocument = updateDocument;
// DELETE /api/documents/:id
// Elimina un document — retorna 204 sense cos
const deleteDocument = async (req, res, next) => {
    try {
        const userId = requireUserId(req, next);
        if (!userId)
            return;
        await (0, service_1.deleteDocument)(userId, req.params.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDocument = deleteDocument;
