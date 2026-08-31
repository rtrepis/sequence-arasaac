// Quant li queda al compte: espai per a imatges, seqüències i paraules.
//
// Fins ara aquests tres números només existien al panell d'administració, i
// l'usuari els descobria en forma d'error en desar. Aquí es veuen abans:
// l'espai és l'únic límit que no es pot deduir mirant l'app (les seqüències i
// les paraules ja es veuen al seu llistat), i per això és l'únic amb barra.
//
// El color mai no és l'únic canal: al costat de la barra sempre hi ha la xifra,
// perquè «que et queda poc» s'ha de poder llegir sense distingir el groc.
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";
import { settingRowInline } from "@components/SettingsLayout";
import { cardTitle } from "@components/SettingsCards/SettingsCards.styled";
import { useAccountQuota } from "../hooks/useAccountQuota";
import { useFormatBytes } from "../hooks/useFormatBytes";
import messages from "./AccountUsage.lang";

/** Part de l'espai a partir de la qual val la pena avisar que s'acaba. */
const TIGHT_RATIO = 0.8;

interface ReadOnlyRowProps {
  title: string;
  value: string;
}

/**
 * Fila de només lectura: mateix repartiment que `SettingRow` —títol a
 * l'esquerra, xifra a la dreta— però sense `FormLabel`, perquè aquí no hi ha
 * cap control a etiquetar i anunciar-lo com a etiqueta d'un camp seria mentida.
 */
const ReadOnlyRow = ({
  title,
  value,
}: ReadOnlyRowProps): React.ReactElement => (
  <Box sx={{ ...settingRowInline, flexDirection: "row", alignItems: "center" }}>
    <Typography sx={cardTitle}>{title}</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

const AccountStorageSummary = (): React.ReactElement | null => {
  const intl = useIntl();
  const formatBytes = useFormatBytes();
  const quota = useAccountQuota();

  // Sense sessió no hi ha cap límit a ensenyar, i mentre el servidor no ha
  // respost tampoc: un zero inventat es llegiria com un compte buit
  if (!quota.hasQuota) return null;

  const barColor =
    quota.remainingBytes === 0
      ? "error"
      : quota.storageRatio >= TIGHT_RATIO
        ? "warning"
        : "primary";

  return (
    <Stack gap={1}>
      <ReadOnlyRow
        title={intl.formatMessage(messages.storageTitle)}
        value={intl.formatMessage(messages.bytesOfLimit, {
          used: formatBytes(quota.storageUsedBytes),
          limit: formatBytes(quota.storageLimitBytes),
        })}
      />

      <LinearProgress
        variant="determinate"
        value={quota.storageRatio * 100}
        color={barColor}
        aria-hidden
      />

      <Typography variant="caption" color="text.secondary">
        {intl.formatMessage(messages.remainingImages, {
          count: quota.remainingImages ?? 0,
        })}
      </Typography>

      <ReadOnlyRow
        title={intl.formatMessage(messages.documentsTitle)}
        value={intl.formatMessage(messages.countOfLimit, {
          used: quota.documentsUsed,
          limit: quota.documentsLimit,
        })}
      />

      <ReadOnlyRow
        title={intl.formatMessage(messages.wordsTitle)}
        value={intl.formatMessage(messages.countOfLimit, {
          used: quota.wordProfilesUsed,
          limit: quota.wordProfilesLimit,
        })}
      />
    </Stack>
  );
};

export default AccountStorageSummary;
