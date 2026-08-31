// Qualitat amb què es pugen les imatges pròpies.
//
// És l'únic ajust de l'app que decideix quant espai gasta l'usuari, i per això
// va al costat del comptador: la xifra del peu diu què vol dir cada nivell en
// pes, que és l'única manera de triar-lo amb criteri.
//
// El que no fa és canviar el que ja hi ha: reduir una imatge és irreversible i
// tornar a comprimir el que ja està desat només perdria detall sense demanar-ho.
import { Stack, ToggleButton, Typography } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  MdOutlineImage,
  MdOutlinePhotoSizeSelectSmall,
  MdOutlinePrint,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateImageQualityActionCreator } from "@features/user-settings/store/uiSlice";
import { ImageQuality } from "../../../types/ui";
import { IMAGE_QUALITY_PRESETS } from "@/utils/imageToBase64";
import { useFormatBytes } from "@features/backend/user-settings/hooks/useFormatBytes";
import SettingRow from "../../SettingsLayout/SettingRow";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import messages from "./SettingCardImageQuality.lang";

const QUALITY_OPTIONS: {
  value: ImageQuality;
  icon: React.ReactNode;
  messageKey: keyof typeof messages;
}[] = [
  { value: "print", icon: <MdOutlinePrint size={22} />, messageKey: "print" },
  {
    value: "standard",
    icon: <MdOutlineImage size={22} />,
    messageKey: "standard",
  },
  {
    value: "compact",
    icon: <MdOutlinePhotoSizeSelectSmall size={22} />,
    messageKey: "compact",
  },
];

const SettingCardImageQuality = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const formatBytes = useFormatBytes();
  const imageQuality = useAppSelector((store) => store.ui.imageQuality);

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: ImageQuality | null,
  ) => {
    if (!value || value === imageQuality) return;
    dispatch(updateImageQualityActionCreator(value));
  };

  return (
    <Stack gap={0.5}>
      <SettingRow
        title={<FormattedMessage {...messages.cardTitle} />}
        control="wide"
      >
        <StyledToggleButtonGroup
          value={imageQuality}
          exclusive
          onChange={handleChange}
          aria-label={intl.formatMessage(messages.ariaLabel)}
        >
          {QUALITY_OPTIONS.map(({ value, icon, messageKey }) => (
            <ToggleButton
              key={value}
              value={value}
              aria-label={intl.formatMessage(messages[messageKey])}
              selected={value === imageQuality}
              sx={{ flexDirection: "column", gap: 0.25, fontSize: "0.6rem" }}
            >
              {icon}
              <FormattedMessage {...messages[messageKey]} />
            </ToggleButton>
          ))}
        </StyledToggleButtonGroup>
      </SettingRow>

      <Typography variant="caption" color="text.secondary">
        {intl.formatMessage(messages.helper, {
          size: formatBytes(IMAGE_QUALITY_PRESETS[imageQuality].targetBytes),
        })}
      </Typography>
    </Stack>
  );
};

export default SettingCardImageQuality;
