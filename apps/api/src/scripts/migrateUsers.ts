// Migració dels usuaris existents als camps d'identitat i consum
//
// Omple emailCanonical, status, emailVerified i usage als comptes creats abans
// d'aquests camps. Els comptes que ja hi eren es donen per verificats: fer-los
// verificar retroactivament els deixaria sense poder desar sense haver fet res.
//
// IMPORTANT: executar "npm run audit:users" abans. Si hi ha col·lisions de bústia,
// l'índex únic sobre emailCanonical fallarà i la migració s'aturarà a mitges.
//
// Execució:  npm run migrate:users  (des d'apps/api)

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { UserModel } from "../modules/auth/model";
import { DocumentModel } from "../modules/documents/model";
import { toCanonicalEmail } from "../shared/emailCanonical";

const migrateUsers = async (): Promise<void> => {
  await connectDatabase();

  // Es llegeixen els documents sencers (no .lean()) per poder desar-los després
  const users = await UserModel.find({});

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // Ja migrat: no el toquem per no reescriure comptadors correctes amb valors calculats
    if (user.emailCanonical) {
      skipped += 1;
      continue;
    }

    const documentsCount = await DocumentModel.countDocuments({ userId: user._id });

    user.emailCanonical = toCanonicalEmail(user.email);
    user.emailVerified = true;
    user.status = "active";
    user.role = user.role ?? "user";
    user.tokenVersion = user.tokenVersion ?? 0;
    user.failedLoginAttempts = 0;
    user.usage = {
      documentsCount,
      wordProfilesCount: user.wordProfiles?.length ?? 0,
      // El pes real de les imatges ja pujades no es pot saber retroactivament sense
      // consultar Cloudinary una per una. Comencen a zero i el comptador es fa exacte
      // a mesura que l'usuari crea o esborra documents.
      storageBytes: 0,
      assetsCount: 0,
    };

    await user.save();
    migrated += 1;

    console.log(`  ✓ ${user.email} → ${user.emailCanonical} (${documentsCount} documents)`);
  }

  console.log("\n=== Migració completada ===");
  console.log(`Usuaris migrats:      ${migrated}`);
  console.log(`Ja estaven migrats:   ${skipped}`);

  await mongoose.disconnect();
};

migrateUsers().catch((error) => {
  console.error("Error durant la migració:", error);
  process.exit(1);
});
