import {
  Box,
  Button,
  CardMedia,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./WelcomePage.lang";
import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import NewsCarousel from "../../components/NewsCarousel/NewsCarousel";
import Logo from "@/components/Logo";

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
    </>
  );
};

export default WelcomePage;
