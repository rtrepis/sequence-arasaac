import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";
import messages from "./NewsNavBar.lang";
import HideOnScroll from "../../components/utils/HiddenOnScroll/HiddenOnScroll";
import AppNavigationDrawer from "../../components/AppNavigationDrawer/AppNavigationDrawer";
import { newsItems } from "../../data/newsItems";

interface BarProps {
  children: React.ReactElement;
}

// Llista de noticies ordenada de mes nova a mes antiga (estatic, calculat una vegada)
const sortedNews = [...newsItems].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

// Barra de navegació lleugera per a la seccio de noticies (/:locale/news i /:locale/news/:slug)
const NewsNavBar = (props: BarProps): React.ReactElement => {
  const { locale, slug } = useParams<{ locale: string; slug?: string }>();
  const navigate = useNavigate();
  const intl = useIntl();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentIndex = slug
    ? sortedNews.findIndex((i) => i.slug === slug)
    : -1;

  // ◀ esquerra = anterior = mes recent (index menor al array newest-first)
  const prevSlug =
    currentIndex > 0 ? sortedNews[currentIndex - 1].slug : null;

  // ▶ dreta = enrere en el temps = mes antic (index major)
  // Des de la llista (sense slug) va a la novetat mes recent per comenar a navegar
  const nextSlug =
    currentIndex !== -1 && currentIndex < sortedNews.length - 1
      ? sortedNews[currentIndex + 1].slug
      : currentIndex === -1 && sortedNews.length > 0
        ? sortedNews[0].slug
        : null;

  return (
    <>
      {/* Acces rapid al contingut principal (accessibilitat) */}
      <a href="#main-content" className="skip-link">
        <FormattedMessage {...messages.skipToContent} />
      </a>

      <HideOnScroll {...props.children}>
        <AppBar color="transparent" elevation={0}>
          <Box bgcolor={"primary.main"} height={"1em"} width={"100vw"} />
          <Toolbar sx={{ justifyContent: "space-between" }}>

            {/* Costat esquerre: logo + navegació entre noticies */}
            <Stack
              component="nav"
              aria-label={intl.formatMessage(messages.mainNavigation)}
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              {/* Logo - sempre clicable (obre el drawer) */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label={intl.formatMessage(messages.openMenu)}
                sx={{ p: 0.5 }}
              >
                <img
                  src="/favicon.png"
                  alt="SequenciAAC"
                  height={25}
                  width={34}
                />
              </IconButton>

              {/* ◀ Novetats ▶ */}
              <Stack
                direction="row"
                alignItems="center"
                sx={{ gap: 0 }}
              >
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!prevSlug}
                  onClick={() =>
                    prevSlug && navigate(`/${locale}/news/${prevSlug}`)
                  }
                  aria-label={intl.formatMessage({
                    id: "news.prevArticle",
                    defaultMessage: "Article anterior",
                  })}
                  sx={{ p: 0.5 }}
                >
                  <AiFillLeftCircle style={{ fontSize: "1.4rem" }} />
                </IconButton>

                <Button
                  component={Link}
                  to={`/${locale}/news`}
                  size="small"
                  sx={{ px: 1 }}
                >
                  <FormattedMessage {...messages.news} />
                </Button>

                <IconButton
                  size="small"
                  color="primary"
                  disabled={!nextSlug}
                  onClick={() =>
                    nextSlug && navigate(`/${locale}/news/${nextSlug}`)
                  }
                  aria-label={intl.formatMessage({
                    id: "news.nextArticle",
                    defaultMessage: "Article seguent",
                  })}
                  sx={{ p: 0.5 }}
                >
                  <AiFillRightCircle style={{ fontSize: "1.4rem" }} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Costat dret: boto crear sequencia */}
            <Button
              component={Link}
              to={`/${locale}/create-sequence`}
              size="small"
              variant="outlined"
            >
              <FormattedMessage {...messages.start} />
            </Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Box sx={{ height: "1em" }} />
      <Toolbar />

      {/* Drawer de navegacio compartit */}
      <AppNavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <Container id="main-content" component="main" maxWidth={"xl"}>
        {props.children}
      </Container>
    </>
  );
};

export default NewsNavBar;
