import { Box, Button, CardMedia, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "./WelcomePage.lang";
import { Link } from "react-router-dom";
import React from "react";

const WelcomePage = (): React.ReactElement => {
  const intl = useIntl();
  const isLandScape = window.screen.orientation.type === "landscape-primary";

  const linkArcadeGuide = isLandScape
    ? intl.formatMessage({ ...messages.arcadeLink })
    : "https://demo.arcade.software/UwL1a1HrJ0olTvKdVHlG?embed";

  return (
    <>
      <Box bgcolor={"primary.main"} height={"1em"} width={"100wv"}></Box>
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
        <Link to={"../create-sequence"}>
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
      <Stack
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        height={"80vh"}
        width={"100vw"}
        gap={2}
      >
        <Typography component="h3">
          <FormattedMessage {...messages.learning} />
        </Typography>
        <CardMedia
          title="SequenciAAC"
          src={linkArcadeGuide}
          component={"iframe"}
          sx={{
            width: "80%",
            height: "95%",
            "color-scheme": "light",
            borderRadius: 4,
          }}
        ></CardMedia>
      </Stack>
    </>
  );
};

export default WelcomePage;
