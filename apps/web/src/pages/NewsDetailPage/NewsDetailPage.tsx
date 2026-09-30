import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { localizedNewsSrc, NewsImage, newsItems } from "../../data/newsItems";
import { newsRichText } from "./newsRichText";

const stepNumber = {
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
};

/**
 * El text llarg d'una notícia per apartats, amb pes normal: el `body1` del
 * tema és negreta, i llavors les negretes del text no destacaven
 */
const longText = { fontWeight: 400 };

/** Una imatge de la notícia, en l'idioma de qui la llegeix */
const NewsPicture = ({
  image,
  locale,
}: {
  image: NewsImage;
  locale: string;
}): React.ReactElement => {
  const intl = useIntl();
  return (
    <Box
      component="img"
      src={localizedNewsSrc(image.src, locale)}
      alt={intl.formatMessage({ id: image.altId })}
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
  );
};

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
            component="div"
            variant="body1"
            textAlign="center"
            sx={{ maxWidth: "600px" }}
          >
            <FormattedMessage id={newsItem.contentId} values={newsRichText} />
          </Typography>

          {/* Vista pas a pas si la notícia té steps definits */}
          {newsItem.steps ? (
            <Stack spacing={4} width="100%">
              {newsItem.steps.map((step, index) => (
                <Stack key={index} spacing={2}>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={stepNumber}>{index + 1}</Box>
                    {step.titleId ? (
                      <Typography variant="h5" component="h2" fontWeight={700}>
                        <FormattedMessage id={step.titleId} />
                      </Typography>
                    ) : (
                      <Typography component="div" variant="body1">
                        <FormattedMessage
                          id={step.descriptionId}
                          values={newsRichText}
                        />
                      </Typography>
                    )}
                  </Stack>

                  {/* Amb títol, el text va a sota, a tota l'amplada */}
                  {step.titleId && (
                    <Typography component="div" variant="body1" sx={longText}>
                      <FormattedMessage
                        id={step.descriptionId}
                        values={newsRichText}
                      />
                    </Typography>
                  )}

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
                    [step.image, ...(step.moreImages ?? [])].map((image) => (
                      <NewsPicture
                        key={image.src}
                        image={image}
                        locale={intl.locale}
                      />
                    ))
                  )}
                </Stack>
              ))}
            </Stack>
          ) : (
            /* Galeria d'imatges per a notícies sense steps */
            newsItem.images.map((image) => (
              <NewsPicture key={image.src} image={image} locale={intl.locale} />
            ))
          )}

          {newsItem.faq && (
            <Stack spacing={2} width="100%">
              <Divider />
              <Typography variant="h5" component="h2" fontWeight={700}>
                <FormattedMessage id={newsItem.faq.titleId} />
              </Typography>
              {newsItem.faq.questions.map((question) => (
                <Box key={question.questionId}>
                  <Typography variant="h6" component="h3" fontWeight={700}>
                    <FormattedMessage id={question.questionId} />
                  </Typography>
                  <Typography component="div" variant="body1" sx={longText}>
                    <FormattedMessage
                      id={question.answerId}
                      values={newsRichText}
                    />
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}

          {newsItem.closingId && (
            <Stack spacing={2} width="100%">
              <Divider />
              <Typography component="div" variant="body1" sx={longText}>
                <FormattedMessage
                  id={newsItem.closingId}
                  values={newsRichText}
                />
              </Typography>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default NewsDetailPage;
