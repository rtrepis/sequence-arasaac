// Connexió a MongoDB Atlas via Mongoose
// Atura el procés si la connexió falla en l'arrencada

import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connectat correctament");
  } catch (error) {
    console.error("Error en connectar a MongoDB:", error);
    process.exit(1);
  }
};
