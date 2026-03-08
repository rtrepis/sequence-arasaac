import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { newsItems } from "../../data/newsItems";

const NewsDetailPage = (): React.ReactElement => {
  const { slug, locale } = useParams<{ slug: string; locale: string }>();
  const intl = useIntl();

  // Buscar la notícia pel slug
  const newsItem = newsItems.find((item) => item.slug === slug);

  // Estableix el títol del document quan es carrega la notícia
  useEffect(() => {
    if (newsItem) {
      document.title = `${intl.formatMessage({ id: newsItem.titleId })} — SequenciAAC`;
    }
  }, [newsItem, intl]);

  // Si no es troba, redirigir a la llista de notícies
  if (!newsItem) {
    return <Navigate to={`/${locale ?? "es"}/news`} replace />;
  }

  return (
    <>
      <Container
        component="main"
        id="main-content"
        maxWidth="md"
        sx={{ py: 4 }}
      >
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
                        maxWidth: "min(680px, 100%)",
                        width: "100%",
                        alignSelf: "center",
                        borderRadius: 1,
                        boxShadow: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={step.image.src}
                      alt={intl.formatMessage({ id: step.image.altId })}
                      sx={{
                        maxWidth: "min(680px, 100%)",
                        width: "100%",
                        alignSelf: "center",
                        borderRadius: 1,
                        boxShadow: 3,
                        border: "1px solid",
                        borderColor: "divider",
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
                  maxWidth: "min(680px, 100%)",
                  width: "100%",
                  alignSelf: "center",
                  borderRadius: 1,
                  boxShadow: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ))
          )}
        </Stack>
      </Container>
    </>
  );
};

export default NewsDetailPage;
