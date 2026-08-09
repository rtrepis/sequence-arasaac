// Base de dades en memòria per als tests d'integració.
//
// Cap test toca MongoDB Atlas: cada execució arrenca un servidor propi, efímer
// i buit. Això permet provar els límits de registre creant desenes d'usuaris
// sense embrutar res ni dependre de la xarxa.

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let server: MongoMemoryServer | null = null;

export const startTestDatabase = async (): Promise<void> => {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri());
};

export const stopTestDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  await server?.stop();
  server = null;
};

// Deixa la base de dades buida entre tests: cada un ha de poder assumir
// que parteix de zero, sobretot els que compten usuaris
export const clearTestDatabase = async (): Promise<void> => {
  const { collections } = mongoose.connection;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
};
