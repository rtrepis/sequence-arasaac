"use strict";
// Handler global d'errors Express
// Ha de tenir 4 paràmetres per ser reconegut com a error handler per Express
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    const statusCode = err.statusCode ?? 500;
    // Ocultar detalls interns dels errors 500 a producció
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Error intern del servidor"
        : (err.message ?? "Error desconegut");
    res.status(statusCode).json({ message });
};
exports.errorHandler = errorHandler;
