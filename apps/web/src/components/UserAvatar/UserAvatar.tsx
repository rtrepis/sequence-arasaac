import React from "react";
import { Avatar } from "@mui/material";

/**
 * Rodona de l'usuari amb sessió iniciada: les dues primeres lletres del correu.
 *
 * És **la mateixa rodona a tot arreu** —al drawer i a la barra— perquè és el
 * senyal de «tens sessió iniciada»: si al menú fos d'una manera i a la barra
 * d'una altra, no es llegiria com la mateixa cosa.
 *
 * El color no s'hi tria mai a mà: sobre el paper de configuració la rodona és
 * verda amb la tinta fosca de sempre (`primary.contrastText`, 7,2:1), i sobre
 * el verd de la NavBar s'inverteix (`onPrimary`), perquè una rodona verda
 * damunt de la barra verda no es veuria.
 */
interface UserAvatarProps {
  /** Correu del compte; `null` mentre no se'n sap res */
  email: string | null;
  /** Diàmetre en píxels */
  size?: number;
  /** Cert quan la rodona va sobre una superfície verda (la NavBar) */
  onPrimary?: boolean;
}

/** Proporció de la lletra respecte del diàmetre (28 px → 12 px, el d'abans) */
const INITIALS_RATIO = 0.43;

const UserAvatar = ({
  email,
  size = 28,
  onPrimary = false,
}: UserAvatarProps): React.ReactElement => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: `${Math.round(size * INITIALS_RATIO)}px`,
      fontWeight: 700,
      bgcolor: onPrimary ? "primary.contrastText" : "primary.main",
      color: onPrimary ? "primary.main" : "primary.contrastText",
    }}
  >
    {email ? email.slice(0, 2).toUpperCase() : "?"}
  </Avatar>
);

export default UserAvatar;
