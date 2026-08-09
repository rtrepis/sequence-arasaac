// Auditoria d'usuaris — NOMÉS LECTURA, no escriu res a la base de dades
//
// S'ha d'executar abans de la migració: informa de quants usuaris existents
// col·lisionarien en canonicalitzar el correu (mateixa bústia, comptes diferents).
// Si en detecta cap, s'han de resoldre a mà: darrere de cada compte hi pot haver
// documents d'usuaris diferents i fusionar-los automàticament seria destructiu.
//
// Execució:  npm run audit:users  (des d'apps/api)

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { UserModel } from "../modules/auth/model";
import { toCanonicalEmail } from "../shared/emailCanonical";

// Dades mínimes que necessita l'auditoria de cada usuari
interface AuditedUser {
  id: string;
  email: string;
  canonical: string;
  createdAt: Date;
}

const auditUsers = async (): Promise<void> => {
  await connectDatabase();

  const users = await UserModel.find({}).select("email createdAt").lean();

  const audited: AuditedUser[] = users.map((user) => ({
    id: String(user._id),
    email: user.email,
    canonical: toCanonicalEmail(user.email),
    createdAt: user.createdAt,
  }));

  // Agrupa per forma canònica per detectar els comptes que comparteixen bústia
  const byCanonical = new Map<string, AuditedUser[]>();
  for (const user of audited) {
    const group = byCanonical.get(user.canonical) ?? [];
    group.push(user);
    byCanonical.set(user.canonical, group);
  }

  const collisions = [...byCanonical.entries()].filter(
    ([, group]) => group.length > 1
  );

  // Usuaris el correu dels quals canvia en canonicalitzar-se (informatiu, no és cap problema)
  const normalizedCount = audited.filter(
    (user) => user.email !== user.canonical
  ).length;

  console.log("\n=== Auditoria d'usuaris ===");
  console.log(`Usuaris totals:                 ${audited.length}`);
  console.log(`Correus que es normalitzaran:   ${normalizedCount}`);
  console.log(`Col·lisions (mateixa bústia):   ${collisions.length}`);

  if (collisions.length > 0) {
    console.log("\n--- Comptes que comparteixen bústia ---");
    console.log("Cal decidir a mà quin es conserva ABANS de migrar.\n");

    for (const [canonical, group] of collisions) {
      console.log(`  ${canonical}`);
      for (const user of group) {
        console.log(
          `    · ${user.email}  (id: ${user.id}, creat: ${user.createdAt.toISOString()})`
        );
      }
    }

    console.log("\n⚠️  NO executis la migració fins haver resolt aquestes col·lisions.");
  } else {
    console.log("\n✅ Cap col·lisió. Es pot executar la migració amb seguretat.");
  }

  await mongoose.disconnect();
};

auditUsers().catch((error) => {
  console.error("Error durant l'auditoria:", error);
  process.exit(1);
});
