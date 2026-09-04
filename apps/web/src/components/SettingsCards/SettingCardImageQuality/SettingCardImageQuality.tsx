// Qualitat amb què es pugen les imatges pròpies.
//
// És l'únic ajust de l'app que decideix quant espai gasta l'usuari, i per això
// va al costat del comptador. El peu diu què vol dir cada nivell en dues
// unitats: **fins a quants centímetres s'imprimeix bé** i quant pesa. La
// primera és la que permet triar amb criteri a qui no pensa en kilobytes, que
// és pràcticament tothom: el que es decideix aquí no és un pes, és si el
// pictograma es veurà bé al full.
//
// El que no fa és canviar el que ja hi ha: reduir una imatge és irreversible i
// tornar a comprimir el que ja està desat perdria detall sense demanar-ho. Amb
// sessió, però, sí que es diu on es pot fer d'una en una.
import { Stack, ToggleButton, Tooltip, Typography } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateImageQualityActionCreator } from "@features/user-settings/store/uiSlice";
import { ImageQuality } from "../../../types/ui";
import { IMAGE_QUALITY_PRESETS } from "@/utils/imageToBase64";
import { useFormatBytes } from "@features/backend/user-settings/hooks/useFormatBytes";
import { useFormatPrintSize } from "@features/backend/user-settings/hooks/useFormatPrintSize";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import SettingRow from "../../SettingsLayout/SettingRow";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import { IMAGE_QUALITY_OPTIONS, qualityToggleSx } from "./imageQualityOptions";
import messages from "./SettingCardImageQuality.lang";

const SettingCardImageQuality = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const formatBytes = useFormatBytes();
  const formatPrintSize = useFormatPrintSize();
  const imageQuality = useAppSelector((store) => store.ui.imageQuality);
  // Canviar de mida el que ja s'ha pujat només existeix al núvol: sense sessió,
  // dir on es fa seria enviar l'usuari a una secció que no li surt
  const isAuthenticated = useAppSelector(selectIsLoggedIn);

  const preset = IMAGE_QUALITY_PRESETS[imageQuality];

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
          {IMAGE_QUALITY_OPTIONS.map(({ value, icon, label }) => (
            // `describeChild`: el botó porta text, i sense això el tooltip li
            // prendria el nom accessible i el nom del nivell es perdria
            <Tooltip
              key={value}
              describeChild
              title={intl.formatMessage(messages.optionHint, {
                width: formatPrintSize(IMAGE_QUALITY_PRESETS[value].maxSidePx),
              })}
            >
              <ToggleButton
                value={value}
                aria-label={intl.formatMessage(label)}
                selected={value === imageQuality}
                sx={qualityToggleSx}
              >
                {icon}
                <FormattedMessage {...label} />
              </ToggleButton>
            </Tooltip>
          ))}
        </StyledToggleButtonGroup>
      </SettingRow>

      <Typography variant="caption" color="text.secondary">
        {intl.formatMessage(messages.helper, {
          width: formatPrintSize(preset.maxSidePx),
          size: formatBytes(preset.targetBytes),
        })}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        <FormattedMessage
          {...(isAuthenticated
            ? messages.existingResizable
            : messages.existingUnchanged)}
        />
      </Typography>
    </Stack>
  );
};

export default SettingCardImageQuality;
