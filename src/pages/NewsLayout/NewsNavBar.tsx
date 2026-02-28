import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Fab,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
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

  // Quan canvia l'article, desplaça suaument al principi de la pàgina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const currentIndex = slug
    ? sortedNews.findIndex((i) => i.slug === slug)
    : -1;

  // Boto esquerra = anterior = article mes recent (index menor al array newest-first)
  const prevSlug =
    currentIndex > 0 ? sortedNews[currentIndex - 1].slug : null;

  // Boto dreta = enrere en el temps = article mes antic (index major)
  // Des de la llista va a la novetat mes recent per comenar a navegar
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
          <Toolbar>
            <Stack
              component="nav"
              aria-label={intl.formatMessage(messages.mainNavigation)}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              {/* Logo - obre el drawer */}
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

              {/* Enllaç a la llista de noticies */}
              <Button
                component={Link}
                to={`/${locale}/news`}
                size="small"
              >
                <FormattedMessage {...messages.news} />
              </Button>
            </Stack>
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

      {/* Boto anterior - fix a la cantonada inferior esquerra */}
      <Fab
        size="medium"
        color="primary"
        disabled={!prevSlug}
        onClick={() => prevSlug && navigate(`/${locale}/news/${prevSlug}`)}
        aria-label={intl.formatMessage({
          id: "news.prevArticle",
          defaultMessage: "Article anterior",
        })}
        sx={{ position: "fixed", bottom: 24, left: 24 }}
      >
        <AiOutlineArrowLeft style={{ fontSize: "1.4rem" }} />
      </Fab>

      {/* Boto seguent (enrere en el temps) - fix a la cantonada inferior dreta */}
      <Fab
        size="medium"
        color="primary"
        disabled={!nextSlug}
        onClick={() => nextSlug && navigate(`/${locale}/news/${nextSlug}`)}
        aria-label={intl.formatMessage({
          id: "news.nextArticle",
          defaultMessage: "Article seguent",
        })}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AiOutlineArrowRight style={{ fontSize: "1.4rem" }} />
      </Fab>
    </>
  );
};

export default NewsNavBar;
