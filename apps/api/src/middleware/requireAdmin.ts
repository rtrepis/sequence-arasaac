// Exigeix rol d'administrador
//
// Va sempre encadenat DESPRÉS d'authMiddleware, que és qui posa req.userId.
// A diferència de l'autenticació general, aquí sí que es consulta la base de
// dades a cada petició: són quatre crides al dia i el que hi ha darrere és el
// poder de suspendre comptes. Un rol dins del token duraria fins a 15 minuts
// després de retirar-lo.

import { Request, Response, NextFunction } from "express";
import { UserModel } from "../modules/auth/model";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId).select("role status").lean();

    // Mateixa resposta si l'usuari no existeix, no és admin o està suspès:
    // qui no hi té accés no ha de poder deduir res del codi d'error
    if (!user || user.role !== "admin" || user.status === "suspended") {
      res.status(403).json({ errorCode: "FORBIDDEN" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
