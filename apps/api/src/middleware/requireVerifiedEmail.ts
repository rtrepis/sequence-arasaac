// Exigeix que l'usuari hagi verificat el correu
//
// S'aplica només a les operacions que consumeixen recursos de pagament
// (crear i actualitzar documents, que pugen imatges a Cloudinary), mai a
// l'entrada general. Un compte pendent de verificar pot fer servir l'app amb
// normalitat: bloquejar l'accés sencer a una eina d'AAC perquè un correu
// s'ha entretingut castiga l'usuari equivocat.
//
// Va sempre encadenat DESPRÉS d'authMiddleware, que és qui posa req.userId.

import { Request, Response, NextFunction } from "express";
import { UserModel } from "../modules/auth/model";

export const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId)
      .select("emailVerified status")
      .lean();

    if (!user) {
      res.status(401).json({ errorCode: "USER_NOT_FOUND" });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({ errorCode: "ACCOUNT_SUSPENDED" });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ errorCode: "EMAIL_NOT_VERIFIED" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
