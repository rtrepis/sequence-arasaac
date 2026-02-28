import {
  Box,
  Button,
  CardMedia,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./WelcomePage.lang";
import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import NewsCarousel from "../../components/NewsCarousel/NewsCarousel";
import copyrightMessages from "../../components/CopyRightSpeedDial/CopyRightSpeedDial.lang";

const WelcomePage = (): React.ReactElement => {
  const intl = useIntl();
  const isLandScape = window.screen.orientation.type === "landscape-primary";

  // Estableix el títol del document per a lectors de pantalla i barra del navegador
  useEffect(() => {
    document.title = "SequenciAAC";
  }, []);

  const linkArcadeGuide = isLandScape
    ? intl.formatMessage({ ...messages.arcadeLink })
    : "https://demo.arcade.software/UwL1a1HrJ0olTvKdVHlG?embed";

  return (
    <>
      <Box bgcolor={"primary.main"} height={"1em"} width={"100wv"}></Box>
      <Box component="main" id="main-content">
        <Stack
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          height={"70vh"}
          width={"100vw"}
          gap={2}
        >
          <Stack
            display={"flex"}
            alignItems={"center"}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <img src="/favicon.png" alt="logo" height={50} width={70} />
            <Typography component={"h1"} variant={"h3"} fontWeight={800}>
              SequenciAAC
            </Typography>
          </Stack>
          <Typography component="h2" fontWeight={800} textAlign={"center"}>
            <FormattedMessage {...messages.liveMotive} />
          </Typography>
          <Link to={"create-sequence"}>
            <Button
              variant="contained"
              aria-label={intl.formatMessage(messages.start)}
              color="primary"
              sx={{ marginTop: 3, fontWeight: 700 }}
            >
              <FormattedMessage {...messages.start} />
            </Button>
          </Link>
        </Stack>

        <NewsCarousel />

        <Box
          sx={{
            width: "80%",
            mx: "auto",
            py: 4,
            display: "flex",
            flexDirection: "column",
            height: "80vh",
            gap: 4,
          }}
        >
          <Divider textAlign="left">
            <Typography
              variant="h4"
              component="h3"
              fontWeight={700}
              sx={{ px: 2 }}
            >
              <FormattedMessage {...messages.learning} />
            </Typography>
          </Divider>
          <CardMedia
            title="SequenciAAC"
            src={linkArcadeGuide}
            component={"iframe"}
            loading="lazy"
            sx={{
              flexGrow: 1,
              width: "100%",
              colorScheme: "light",
              borderRadius: 4,
            }}
          ></CardMedia>
        </Box>
      </Box>

      {/* Peu de pàgina clàssic */}
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
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  SequenciAAC
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.liveMotive} />
              </Typography>
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
    </>
  );
};

export default WelcomePage;
