import { Badge, Tooltip } from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import DefaultSettingsDialog from "./DefaultSettingsDialog";
import StyledIconButton from "@/style/StyledIconButton";
import UserAvatar from "@components/UserAvatar/UserAvatar";
import { useAppSelector } from "../../app/hooks";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import React from "react";

/** Diàmetre de la rodona de l'usuari dins de la barra */
const AVATAR_SIZE = 30;

/** Diàmetre del distintiu amb la roda dentada, al racó inferior dret */
const GEAR_BADGE_SIZE = 17;

const DefaultSettingsModal = (): React.ReactElement => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  // Ref per restaurar el focus al botó d'obertura quan el modal es tanca
  const triggerRef = useRef<HTMLElement | null>(null);

  const userEmail = useAppSelector((state) => state.auth.userEmail);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  // Amb sessió, el nom del botó diu també amb quin compte s'ha entrat: és
  // l'única confirmació que hi ha sense obrir el menú, i el tooltip d'un botó
  // només-icona és el seu nom accessible.
  const label = isLoggedIn
    ? intl.formatMessage(messages.settingsLoggedIn, { email: userEmail ?? "" })
    : intl.formatMessage(messages.settings);

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Tooltip title={label}>
        <StyledIconButton
          ref={(el: HTMLElement | null) => {
            triggerRef.current = el;
          }}
          color="inherit"
          aria-label={label}
          onClick={() => setOpen(true)}
        >
          {isLoggedIn ? (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              sx={{
                "& .MuiBadge-badge": {
                  width: GEAR_BADGE_SIZE,
                  height: GEAR_BADGE_SIZE,
                  minWidth: GEAR_BADGE_SIZE,
                  padding: 0,
                  borderRadius: "50%",
                  // El verd de la barra: el distintiu no s'hi veu com una
                  // pastilla, sinó com una osca que separa la roda dentada de
                  // la rodona fosca. Damunt hi va la tinta de sobre el verd.
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: `${GEAR_BADGE_SIZE - 5}px`,
                },
              }}
              badgeContent={<AiOutlineSetting aria-hidden />}
            >
              <UserAvatar email={userEmail} size={AVATAR_SIZE} onPrimary />
            </Badge>
          ) : (
            <AiOutlineSetting />
          )}
        </StyledIconButton>
      </Tooltip>
      <DefaultSettingsDialog open={open} onClose={handleClose} />
    </>
  );
};

export default DefaultSettingsModal;
