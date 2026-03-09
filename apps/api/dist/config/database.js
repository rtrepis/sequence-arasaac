"use strict";
// Connexió a MongoDB Atlas via Mongoose
// Atura el procés si la connexió falla en l'arrencada
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        console.log("MongoDB connectat correctament");
    }
    catch (error) {
        console.error("Error en connectar a MongoDB:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
