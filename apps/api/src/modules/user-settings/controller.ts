// Handlers Express per al mòdul de user-settings
import { Request, Response, NextFunction } from "express";
import {
  deleteAssetSchema,
  replaceAssetSchema,
  updateUiSettingsSchema,
} from "./validators";
import {
  getUiSettings as getUiSettingsService,
  getQuotaStatus as getQuotaStatusService,
  listUserAssets as listUserAssetsService,
  deleteUserAsset as deleteUserAssetService,
  replaceUserAsset as replaceUserAssetService,
  updateUiSettings as updateUiSettingsService,
  deleteAccount as deleteAccountService,
} from "./service";
import type { AppError } from "../../middleware/errorHandler";

// GET /api/user/ui-settings
export const getUiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getUiSettingsService(req.userId as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/ui-settings
export const updateUiSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateUiSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      // Log detallat per facilitar el diagnòstic en dev
      console.error("[user-settings] Validació fallida:", JSON.stringify(parsed.error.errors, null, 2));
      const messages = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      const error = new Error(messages) as AppError;
      error.statusCode = 400;
      return next(error);
    }

    // Els perfils tornen amb les URLs definitives de Cloudinary: sense això el
    // client desaria el mateix base64 un altre cop al desat següent.
    const wordProfiles = await updateUiSettingsService(
      req.userId as string,
      parsed.data
    );
    res.status(200).json({ ok: true, wordProfiles });
  } catch (err) {
    next(err);
  }
};

// GET /api/user/quota — consum i límits del compte
export const getQuotaStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getQuotaStatusService(req.userId as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/user/assets — imatges pròpies del compte, amb el lloc d'on pengen
export const listUserAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assets = await listUserAssetsService(req.userId as string);
    res.status(200).json({ assets });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/user/assets — treu una imatge del compte.
//
// El publicId va al cos i no a la ruta perquè en porta de barres
// (`seq/<userId>/<nom>`), i una ruta amb comodí convidaria a construir-lo des
// del client. Que la imatge sigui d'aquest usuari ho comprova el servei.
export const deleteUserAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = deleteAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("ASSET_INVALID_ID") as AppError;
      error.statusCode = 400;
      error.errorCode = "ASSET_INVALID_ID";
      return next(error);
    }

    await deleteUserAssetService(req.userId as string, parsed.data.publicId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/user/assets — canvia de mida una imatge del compte.
//
// La imatge nova arriba ja reduïda: el client la prepara amb el mateix
// codificador amb què puja les altres, i així el resultat és el mateix que si
// s'hagués pujat amb aquella qualitat. Torna l'asset tal com ha quedat perquè
// la URL canvia i qui la feia servir s'ho ha de poder apuntar.
export const replaceUserAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = replaceAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("ASSET_INVALID_ID") as AppError;
      error.statusCode = 400;
      error.errorCode = "ASSET_INVALID_ID";
      return next(error);
    }

    const asset = await replaceUserAssetService(
      req.userId as string,
      parsed.data.publicId,
      parsed.data.image
    );
    res.status(200).json({ asset });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/user/me
// Esborra el compte de qui fa la petició. Mai el d'un altre: l'identificador
// surt del token, no del cos de la petició.
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteAccountService(req.userId as string);

    // La cookie del refresh token s'ha d'anar amb el compte
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
