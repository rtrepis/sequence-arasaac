import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { newsItems } from "../../data/newsItems";
import messages from "./NewsCarousel.lang";

const NewsCarousel = (): React.ReactElement => {
  const intl = useIntl();

  // component="section" + aria-labelledby per a navegació amb lectors de pantalla
  return (
    <Box
      component="section"
      aria-labelledby="news-section-title"
      sx={{ width: "80%", mx: "auto", py: 4 }}
    >
      <Typography
        id="news-section-title"
        variant="h5"
        component="h2"
        fontWeight={700}
        textAlign="center"
        sx={{ mb: 3 }}
      >
        <FormattedMessage {...messages.sectionTitle} />
      </Typography>

      <Stack
        direction="row"
        sx={{
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          gap: 2,
          px: 2,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {newsItems.map((item) => (
          <Card
            key={item.slug}
            sx={{
              minWidth: { xs: "85%", sm: "45%", md: "30%" },
              scrollSnapAlign: "start",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Alt text descriptiu: usa el títol de la notícia en comptes de buit */}
            <CardMedia
              component="img"
              height="140"
              image={item.coverImage}
              alt={intl.formatMessage({ id: item.titleId })}
              sx={{ objectFit: "cover", bgcolor: "grey.200" }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                <FormattedMessage id={item.titleId} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
    </Box>
  );
};

export default NewsCarousel;
