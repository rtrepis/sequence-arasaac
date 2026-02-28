import {
  Box,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { FaLinkedin } from "react-icons/fa";
import React from "react";
import { messages } from "../../pages/WelcomePage/WelcomePage.lang";
import copyrightMessages from "../CopyRightSpeedDial/CopyRightSpeedDial.lang";

const WelcomeFooter = (): React.ReactElement => (
  <Box component="footer" sx={{ bgcolor: "#c8e49a" }}>
    {/* Columnes principals */}
    <Box sx={{ maxWidth: 960, mx: "auto", px: 4, py: 5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        gap={4}
      >
        {/* Columna 1: Sobre el projecte */}
        <Stack gap={1.5} flex={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <img src="/img/logo.svg" alt="SequenciAAC" height={22} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
            >
              SequenciAAC
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.liveMotive} />
          </Typography>
          <MuiLink
            href="https://www.linkedin.com/company/sequenciaac/"
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            color="text.secondary"
            underline="hover"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <FaLinkedin />
            LinkedIn SequenciAAC
          </MuiLink>
        </Stack>

        {/* Columna 2: Llicències */}
        <Stack gap={1.5} flex={1}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            <FormattedMessage {...messages.footerLicenses} />
          </Typography>
          <Stack direction="row" alignItems="flex-start" gap={1}>
            <img
              src="/img/arasaac/ara-saac-logo.svg"
              alt="ARASAAC"
              height={20}
              style={{ marginTop: 2 }}
            />
            <MuiLink
              href="https://www.arasaac.org/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              color="text.secondary"
              underline="hover"
            >
              <FormattedMessage {...copyrightMessages.license} />
            </MuiLink>
          </Stack>
        </Stack>

        {/* Columna 3: Crèdits */}
        <Stack gap={1.5} flex={1}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            <FormattedMessage {...messages.footerCredits} />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...copyrightMessages.auth} />
          </Typography>
          <MuiLink
            href="https://www.linkedin.com/in/ramon-trepat-burgues/"
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            color="text.secondary"
            underline="hover"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <FaLinkedin />
            LinkedIn Ramon Trepat
          </MuiLink>
        </Stack>
      </Stack>
    </Box>

    {/* Barra inferior de copyright */}
    <Divider />
    <Box sx={{ bgcolor: "primary.main", py: 1.5, textAlign: "center" }}>
      <Typography variant="caption" color="primary.contrastText">
        © {new Date().getFullYear()} SequenciAAC
      </Typography>
    </Box>
  </Box>
);

export default WelcomeFooter;
