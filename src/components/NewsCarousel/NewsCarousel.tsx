import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight } from "react-icons/ai";
import { newsItems } from "../../data/newsItems";
import messages from "./NewsCarousel.lang";

const NewsCarousel = (): React.ReactElement => {
  const intl = useIntl();

  // component="section" + aria-labelledby per a navegació amb lectors de pantalla
  return (
    <Box
      component="section"
      aria-labelledby="news-section-title"
      sx={{
        width: { xs: "100%", sm: "80%" },
        mx: "auto",
        py: 4,
      }}
    >
      <Divider textAlign="left" sx={{ mb: 3 }}>
        <Typography
          id="news-section-title"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ px: 2 }}
        >
          <FormattedMessage {...messages.sectionTitle} />
        </Typography>
      </Divider>

      <Box>
        {/* Wrapper relatiu per al gradient de fade a la dreta */}
        <Box sx={{ position: "relative" }}>
          <Stack
            direction="row"
            sx={{
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              gap: 2,
              px: 4,
              py: 3,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {newsItems.map((item) => (
              <Card
                key={item.slug}
                elevation={4}
                sx={{
                  minWidth: { xs: "85%", sm: "45%", md: "30%" },
                  scrollSnapAlign: "start",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                }}
              >
                {/* Alt text descriptiu: usa el títol de la notícia en comptes de buit */}
                <CardMedia
                  component="img"
                  image={item.coverImage}
                  alt={intl.formatMessage({ id: item.titleId })}
                  loading="lazy"
                  sx={{
                    height: { xs: 90, sm: 140 },
                    objectFit: "cover",
                    bgcolor: "grey.200",
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    <FormattedMessage id={item.titleId} />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    <FormattedMessage id={item.summaryId} />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/news/${item.slug}`}
                  >
                    <FormattedMessage {...messages.moreInfo} />
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>

          {/* Gradient fade esquerra */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 80,
              background: (theme) =>
                `linear-gradient(to left, transparent, ${theme.palette.background.paper})`,
              pointerEvents: "none",
            }}
          />

          {/* Gradient fade dreta: indica que hi ha més contingut desplaçable */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 80,
              background: (theme) =>
                `linear-gradient(to right, transparent, ${theme.palette.background.paper})`,
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>

      {/* Botó a baix a la dreta per accedir al changelog complet */}
      <Box sx={{ textAlign: "right", mt: 1 }}>
        <Button
          component={Link}
          to="/changelog"
          endIcon={<AiOutlineArrowRight />}
          variant="text"
          size="small"
        >
          <FormattedMessage {...messages.seeAll} />
        </Button>
      </Box>
    </Box>
  );
};

export default NewsCarousel;
