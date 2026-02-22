import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { newsItems } from "../../data/newsItems";

const messages = defineMessages({
  back: {
    id: "news.back.button",
    defaultMessage: "Tornar",
    description: "Botó per tornar a la llista de notícies",
  },
  prevArticle: {
    id: "news.prevArticle",
    defaultMessage: "Article anterior",
    description: "Botó per anar a l'article anterior",
  },
  nextArticle: {
    id: "news.nextArticle",
    defaultMessage: "Article següent",
    description: "Botó per anar a l'article següent",
  },
});

const NewsDetailPage = (): React.ReactElement => {
  const { slug, locale } = useParams<{ slug: string; locale: string }>();
  const intl = useIntl();

  // Buscar la notícia pel slug
  const newsItem = newsItems.find((item) => item.slug === slug);

  // Llista ordenada de més nova a més antiga per a la navegació prev/next
  const sorted = [...newsItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const currentIndex = sorted.findIndex((i) => i.slug === slug);
  const prevItem = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
  const nextItem = currentIndex > 0 ? sorted[currentIndex - 1] : null;

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

        {/* Navegació prev/next entre articles */}
        <Stack
          direction="row"
          justifyContent="space-between"
          width="100%"
          sx={{ mt: 2 }}
        >
          {prevItem ? (
            <Button
              component={Link}
              to={`/${locale}/news/${prevItem.slug}`}
              startIcon={<AiOutlineArrowLeft />}
            >
              <FormattedMessage {...messages.prevArticle} />
            </Button>
          ) : (
            <Box />
          )}
          {nextItem && (
            <Button
              component={Link}
              to={`/${locale}/news/${nextItem.slug}`}
              endIcon={<AiOutlineArrowRight />}
            >
              <FormattedMessage {...messages.nextArticle} />
            </Button>
          )}
        </Stack>

        {/* Botó per tornar a la llista de notícies */}
        <Button
          component={Link}
          to={`/${locale}/news`}
          startIcon={<AiOutlineArrowLeft />}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          <FormattedMessage {...messages.back} />
        </Button>
      </Stack>
    </Container>
  );
};

export default NewsDetailPage;
