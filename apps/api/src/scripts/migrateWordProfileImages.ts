// Trasllada a Cloudinary les imatges del vocabulari desades en base64
//
// Fins ara, PUT /user/ui-settings desava customImageUrl tal com arribava: el
// base64 sencer entrava al document d'usuari de MongoDB, sense passar per cap
// quota. Aquest script recull el que hi ha quedat i el puja, deixant al seu lloc
// la URL de Cloudinary i el registre de bytes que fa possible el recompte.
//
// És idempotent: un usuari sense cap base64 se salta, de manera que es pot
// tornar a executar sense duplicar res.
//
// Es migra tota imatge que es trobi, encara que passi de MAX_IMAGE_BYTES: el
// sostre val per al que entra a partir d'ara, i refusar-la aquí deixaria
// precisament el base64 que es vol treure. Les que passen es llisten al final.
//
// Execució:  npm run migrate:word-images  (des d'apps/api)

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { UserModel } from "../modules/auth/model";
import {
  MAX_IMAGE_BYTES,
  base64Bytes,
  isBase64Image,
  sumBytes,
  uploadBase64Slots,
  vocabularyAssetFolder,
  type CloudinaryAsset,
  type ImageSlot,
} from "../shared/imageAssets";

const migrateWordProfileImages = async (): Promise<void> => {
  await connectDatabase();

  // Es llegeixen sencers (no .lean()) per poder desar-los després
  const users = await UserModel.find({
    "wordProfiles.customImageUrl": { $regex: "^data:image/" },
  });

  console.log(`Usuaris amb imatges de vocabulari en base64: ${users.length}\n`);

  let migratedUsers = 0;
  let migratedImages = 0;
  let movedBytes = 0;
  const oversized: string[] = [];
  const failed: string[] = [];

  for (const user of users) {
    const userId = String(user._id);

    const slots: ImageSlot[] = user.wordProfiles.map((profile) => ({
      url: profile.customImageUrl,
      assign: (url: string) => {
        profile.customImageUrl = url;
      },
    }));

    const pending = slots.filter((slot) => isBase64Image(slot.url));
    if (pending.length === 0) continue;

    for (const slot of pending) {
      if (base64Bytes(slot.url as string) > MAX_IMAGE_BYTES) {
        oversized.push(`${user.email} (${base64Bytes(slot.url as string)} bytes)`);
      }
    }

    try {
      const uploaded = await uploadBase64Slots(vocabularyAssetFolder(userId), slots);

      const newAssets: CloudinaryAsset[] = uploaded.map(({ publicId, bytes }) => ({
        publicId,
        bytes,
      }));
      const bytes = sumBytes(newAssets);

      // markModified: els perfils s'han mutat a través de les ranures, i Mongoose
      // no detecta sol els canvis dins d'un array de sub-documents
      user.markModified("wordProfiles");
      user.wordProfileAssets = [...(user.wordProfileAssets ?? []), ...newAssets];

      // usage és un sub-document de Mongoose: escampar-lo amb ... hi copiaria
      // les seves propietats internes en comptes dels quatre comptadors. Els
      // comptes anteriors a la migració d'usuaris poden no tenir-lo.
      if (!user.usage) {
        user.usage = {
          documentsCount: 0,
          wordProfilesCount: user.wordProfiles.length,
          storageBytes: 0,
          assetsCount: 0,
        };
      }
      user.usage.storageBytes += bytes;
      user.usage.assetsCount += newAssets.length;

      await user.save();

      migratedUsers += 1;
      migratedImages += newAssets.length;
      movedBytes += bytes;

      console.log(
        `  ✓ ${user.email} → ${newAssets.length} imatges (${Math.round(bytes / 1024)} KB)`
      );
    } catch (error) {
      // Un usuari que falla no pot aturar la resta: el base64 se li queda on era
      // i es pot reintentar tornant a executar l'script.
      failed.push(user.email);
      console.error(`  ✗ ${user.email}:`, error);
    }
  }

  console.log("\n=== Migració completada ===");
  console.log(`Usuaris migrats:       ${migratedUsers}`);
  console.log(`Imatges traslladades:  ${migratedImages}`);
  console.log(`Alliberats de MongoDB: ${Math.round(movedBytes / 1024)} KB`);

  if (oversized.length > 0) {
    console.log(
      `\nImatges per damunt del sostre de ${Math.round(MAX_IMAGE_BYTES / 1024)} KB ` +
        `(migrades igualment):\n  ${oversized.join("\n  ")}`
    );
  }
  if (failed.length > 0) {
    console.log(`\nUsuaris que han fallat (reintenta l'script):\n  ${failed.join("\n  ")}`);
  }

  await mongoose.disconnect();
};

migrateWordProfileImages().catch((error) => {
  console.error("Error durant la migració:", error);
  process.exit(1);
});
