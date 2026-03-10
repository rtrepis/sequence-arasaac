"use strict";
// Lògica de negoci del mòdul de documents
// Cap dependència d'Express — treballa únicament amb models i tipus
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.createDocument = exports.listDocuments = void 0;
const model_1 = require("./model");
// Retorna el llistat de documents de l'usuari (sense el content complet)
const listDocuments = async (userId) => {
    const docs = await model_1.DocumentModel.find({ userId })
        .select("title updatedAt")
        .sort({ updatedAt: -1 })
        .lean();
    return docs.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        updatedAt: doc.updatedAt,
    }));
};
exports.listDocuments = listDocuments;
// Crea un nou document associat a l'usuari
const createDocument = async (userId, input) => {
    const doc = await model_1.DocumentModel.create({ userId, ...input });
    return (0, model_1.serializeDocument)(doc);
};
exports.createDocument = createDocument;
// Retorna un document complet — verifica que pertany a l'usuari
const getDocument = async (userId, id) => {
    const doc = await model_1.DocumentModel.findById(id);
    // Retornem 404 tant si no existeix com si pertany a un altre usuari
    // per no revelar l'existència del document a usuaris no autoritzats
    if (!doc || doc.userId.toString() !== userId) {
        const error = new Error("Document no trobat");
        error.statusCode = 404;
        throw error;
    }
    return (0, model_1.serializeDocument)(doc);
};
exports.getDocument = getDocument;
// Actualitza un document complet — substitució total del contingut
const updateDocument = async (userId, id, input) => {
    // Primer verifiquem ownership
    const existing = await model_1.DocumentModel.findById(id);
    if (!existing || existing.userId.toString() !== userId) {
        const error = new Error("Document no trobat");
        error.statusCode = 404;
        throw error;
    }
    const updated = await model_1.DocumentModel.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
    // No hauria d'arribar aquí, però TypeScript ho requereix
    if (!updated) {
        const error = new Error("Document no trobat");
        error.statusCode = 404;
        throw error;
    }
    return (0, model_1.serializeDocument)(updated);
};
exports.updateDocument = updateDocument;
// Elimina un document — verifica ownership abans d'esborrar
const deleteDocument = async (userId, id) => {
    const doc = await model_1.DocumentModel.findById(id);
    if (!doc || doc.userId.toString() !== userId) {
        const error = new Error("Document no trobat");
        error.statusCode = 404;
        throw error;
    }
    await doc.deleteOne();
};
exports.deleteDocument = deleteDocument;
