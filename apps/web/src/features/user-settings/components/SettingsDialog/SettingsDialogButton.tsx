import { Badge, Tooltip } from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import messages from "./SettingsDialog.lang";
import SettingsDialog from "./SettingsDialog";
import StyledIconButton from "@/style/StyledIconButton";
import UserAvatar from "@components/UserAvatar/UserAvatar";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { updateSettingsActiveTabActionCreator } from "@features/user-settings/store/uiSlice";
import { stylePanelRequestHandledActionCreator } from "@features/sequence/store/styleSlice";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import React from "react";

/** Diàmetre de la rodona de l'usuari dins de la barra */
const AVATAR_SIZE = 30;

/** Diàmetre del distintiu amb la roda dentada, al racó inferior dret */
const GEAR_BADGE_SIZE = 17;

const SettingsDialogButton = (): React.ReactElement => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  // Ref per restaurar el focus al botó d'obertura quan el modal es tanca
  const triggerRef = useRef<HTMLElement | null>(null);
  // Qui l'ha obert si no ha estat la roda dentada (el botó del bàner d'estil):
  // en tancar, el focus hi ha de tornar i no a la barra
  const requesterRef = useRef<HTMLElement | null>(null);

  // El bàner que surt en obrir un document demana el panell «Estil del
  // document». És aquest diàleg qui l'obre perquè és a totes les pàgines amb
  // document (la barra de navegació)
  const stylePanelRequested = useAppSelector(
    (state) => state.style.stylePanelRequested,
  );
  useEffect(() => {
    if (!stylePanelRequested) return;
    const active = document.activeElement;
    requesterRef.current = active instanceof HTMLElement ? active : null;
    dispatch(updateSettingsActiveTabActionCreator("pictograms"));
    setOpen(true);
    dispatch(stylePanelRequestHandledActionCreator());
  }, [stylePanelRequested, dispatch]);

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
    // Si qui l'ha obert ja no hi és (el bàner s'ha tancat), a la roda dentada
    const requester = requesterRef.current;
    requesterRef.current = null;
    if (requester?.isConnected) requester.focus();
    else triggerRef.current?.focus();
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
      <SettingsDialog open={open} onClose={handleClose} />
    </>
  );
};

export default SettingsDialogButton;
