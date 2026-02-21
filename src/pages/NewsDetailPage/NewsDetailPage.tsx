import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { newsItems } from "../../data/newsItems";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  back: {
    id: "news.back.button",
    defaultMessage: "Tornar",
    description: "Botó per tornar a la pàgina principal",
  },
});

const NewsDetailPage = (): React.ReactElement => {
  const { slug } = useParams<{ slug: string }>();
  const intl = useIntl();

  // Buscar la notícia pel slug
  const newsItem = newsItems.find((item) => item.slug === slug);

  // Estableix el títol del document quan es carrega la notícia
  useEffect(() => {
    if (newsItem) {
      document.title = `${intl.formatMessage({ id: newsItem.titleId })} — SequenciAAC`;
    }
  }, [newsItem, intl]);

  // Si no es troba, redirigir a la pàgina principal
  if (!newsItem) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container component="main" id="main-content" maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h4" component="h1" fontWeight={700}>
          <FormattedMessage id={newsItem.titleId} />
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          sx={{ maxWidth: "600px" }}
        >
          <FormattedMessage id={newsItem.contentId} />
        </Typography>

        {/* Vista pas a pas si la notícia té steps definits */}
        {newsItem.steps ? (
          <Stack spacing={4} width="100%">
            {newsItem.steps.map((step, index) => (
              <Stack key={index} spacing={2}>
                <Divider />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="body1">
                    <FormattedMessage id={step.descriptionId} />
                  </Typography>
                </Stack>

                {/* Vídeo si existeix, si no imatge estàtica */}
                {step.video ? (
                  <Box
                    component="video"
                    src={step.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                      maxWidth: "100%",
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={step.image.src}
                    alt={intl.formatMessage({ id: step.image.altId })}
                    sx={{
                      maxWidth: "100%",
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        ) : (
          /* Galeria d'imatges per a notícies sense steps */
          newsItem.images.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img.src}
              alt={intl.formatMessage({ id: img.altId })}
              sx={{
                maxWidth: "100%",
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
          ))
        )}

        <Button
          component={Link}
          to="/"
          startIcon={<AiOutlineArrowLeft />}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          <FormattedMessage {...messages.back} />
        </Button>
      </Stack>
    </Container>
  );
};

export default NewsDetailPage;
