import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { AiOutlineReload } from "react-icons/ai";
import { disneyNames } from "@/data/disneyNames";
import messages from "./RandomNamesPage.lang";

// Quants noms mostra la targeta
const NAMES_SHOWN = 8;

// Tria `amount` noms a l'atzar sense repetir-ne cap (barreja de Fisher-Yates
// sobre una còpia, per no tocar la llista original)
const pickRandomNames = (
  names: readonly string[],
  amount: number,
): string[] => {
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, amount);
};

const RandomNamesPage = (): React.ReactElement => {
  const intl = useIntl();
  // Inicialització mandrosa: la primera tria es fa un sol cop, en muntar
  const [names, setNames] = useState<string[]>(() =>
    pickRandomNames(disneyNames, NAMES_SHOWN),
  );

  // Títol del document
  useEffect(() => {
    document.title = `${intl.formatMessage(messages.pageTitle)} — SequenciAAC`;
  }, [intl]);

  return (
    <Container component="main" id="main-content" maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardHeader
          title={<FormattedMessage {...messages.cardTitle} />}
          subheader={<FormattedMessage {...messages.cardSubtitle} />}
        />
        <CardContent>
          <List dense>
            {names.map((name) => (
              <ListItem key={name} divider>
                <ListItemText primary={name} />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            startIcon={<AiOutlineReload />}
            onClick={() => setNames(pickRandomNames(disneyNames, NAMES_SHOWN))}
            sx={{ mt: 2 }}
          >
            <FormattedMessage {...messages.shuffle} />
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RandomNamesPage;
