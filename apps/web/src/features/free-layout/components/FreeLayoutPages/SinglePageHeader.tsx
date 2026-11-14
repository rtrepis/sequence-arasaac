import React, { useState } from "react";
import { Box } from "@mui/material";
import { MdAdd } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import { addSheetThunk } from "@features/free-layout/store/freeLayoutThunks";
import AddSequenceDialog from "@features/free-layout/components/AddSequenceDialog";
import PageHeader from "./PageHeader";
import messages from "./FreeLayoutPages.lang";

interface SinglePageHeaderProps {
  /** On va: a sobre del full, la capçalera; a sota, «Afegeix una pàgina» */
  slot: "header" | "footer";
  /** Clicar el títol: la pàgina, a dalt de tot i tan gran com hi càpiga */
  onFocusPage?: () => void;
}

/**
 * La capçalera de la pàgina única d'un document sense pàgines pròpies (la de
 * sempre): la mateixa que la de les altres pàgines, perquè des de l'inici es
 * puguin afegir pàgines, passar-la a blocs o afegir-hi seqüències. Qualsevol
 * d'aquestes accions fa explícita la pàgina (`explicitPages`). A sota del
 * full, a l'escriptori, «Afegeix una pàgina», com a les pàgines del document.
 */
const SinglePageHeader = ({
  slot,
  onFocusPage,
}: SinglePageHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const [adding, setAdding] = useState(false);

  if (slot === "footer")
    return (
      <Box sx={{ "@media print": { display: "none" } }}>
        <StyledButton
          color="inherit"
          startIcon={<MdAdd />}
          onClick={() => {
            dispatch(addSheetThunk(0));
            showSnackbar({
              message: intl.formatMessage(messages.pageAdded, { number: 2 }),
              severity: "success",
            });
          }}
        >
          {intl.formatMessage(messages.addPage)}
        </StyledButton>
      </Box>
    );

  return (
    <Box sx={{ marginBottom: 1 }}>
      <PageHeader
        sheetIndex={0}
        sheetCount={1}
        continuous
        onAddSequence={() => setAdding(true)}
        onFocusPage={onFocusPage}
      />
      <AddSequenceDialog
        sheetIndex={adding ? 0 : null}
        onClose={() => setAdding(false)}
      />
    </Box>
  );
};

export default SinglePageHeader;
