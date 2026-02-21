import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { AiOutlineArrowRight } from "react-icons/ai";
import { newsItems, NewsCategory } from "../../data/newsItems";
import messages from "./ChangelogPage.lang";

// Retorna la clau de traducció de la categoria
const categoryMessageId = (category: NewsCategory): string => {
  switch (category) {
    case "nova":
      return "changelog.category.nova";
    case "millora":
      return "changelog.category.millora";
    case "correccio":
      return "changelog.category.correccio";
  }
};

// Retorna el color MUI del badge segons la categoria
const categoryColor = (
  category: NewsCategory
): "primary" | "info" | "warning" => {
  switch (category) {
    case "nova":
      return "primary";
    case "millora":
      return "info";
    case "correccio":
      return "warning";
  }
};

// Agrupa les notícies per "mes any" (ex: "Gener 2025"), ordenades de més nova a més antiga
const groupByMonth = (
  items: typeof newsItems
): { label: string; items: typeof newsItems }[] => {
  const sorted = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groups: Map<string, typeof newsItems> = new Map();
  for (const item of sorted) {
    const date = new Date(item.date);
    // Format "Gener 2025" en locale del navegador — el component usa react-intl externament
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([key, groupItems]) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    // Format el nom del mes en majúscula inicial
    const label = date.toLocaleDateString("ca", {
      month: "long",
      year: "numeric",
    });
    return { label: label.charAt(0).toUpperCase() + label.slice(1), items: groupItems };
  });
};

const ChangelogPage = (): React.ReactElement => {
  const intl = useIntl();
  const groups = groupByMonth(newsItems);

  // Títol del document
  useEffect(() => {
    document.title = `${intl.formatMessage(messages.pageTitle)} — SequenciAAC`;
  }, [intl]);

  return (
    <Container component="main" id="main-content" maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 5 }}>
        <FormattedMessage {...messages.pageTitle} />
      </Typography>

      <Stack spacing={5}>
        {groups.map((group) => (
          <Box key={group.label} component="section" aria-label={group.label}>
            {/* Capçalera de mes */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                fontWeight={700}
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {group.label}
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>

            {/* Entrades del mes */}
            <Stack spacing={4}>
              {group.items.map((item) => (
                <Stack key={item.slug} direction="row" spacing={2} alignItems="flex-start">
                  {/* Punt de la timeline */}
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />

                  {/* Contingut de l'entrada */}
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={
                          <FormattedMessage id={categoryMessageId(item.category)} />
                        }
                        color={categoryColor(item.category)}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="h6" component="h2" fontWeight={600}>
                        <FormattedMessage id={item.titleId} />
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id={item.summaryId} />
                    </Typography>

                    <Box>
                      <Button
                        component={Link}
                        to={`/news/${item.slug}`}
                        endIcon={<AiOutlineArrowRight />}
                        size="small"
                        sx={{ px: 0 }}
                      >
                        <FormattedMessage {...messages.readMore} />
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default ChangelogPage;
