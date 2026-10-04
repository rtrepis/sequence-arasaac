import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSquenceSettings";
import { PictogramCardDefaults } from "../../types/sequence";
import { ALIGN_H, ALIGN_V } from "../../shared/constants/alignmentMaps";
import { selectDocumentCardDefaults } from "@features/sequence/style/styleSelectors";

/**
 * Pàgina de visualització de seqüències
 * alignmentH i alignmentV són independents i sempre signifiquen H i V
 * independentment de la direcció de la seqüència
 */
const ViewSequencePage = (): React.ReactElement => {
  const { document, documentStatus } = useAppSelector((state) => state);
  // El document es veu sempre amb el seu estil, no amb les preferències de
  // qui el mira (`docs/fonaments/03-model-contingut-estil.md`)
  const defaults: PictogramCardDefaults = useAppSelector(
    selectDocumentCardDefaults,
  );

  // La columna d'ajustos copia el format de pàgina a un estat local en muntar-se
  // i ja no el torna a mirar: muntar-la abans que la restauració de l'esborrany
  // hagi acabat voldria dir quedar-se amb l'A4 encara que la feina fos en A3.
  // Són mil·lisegons, i amb IndexedDB inaccessible la marca arriba igualment.
  if (!documentStatus.draftRestoreSettled) return <></>;

  return (
    // La columna copia la pàgina del document en muntar-se: un altre document
    // (obert des del menú sense sortir d'aquí) la torna a muntar amb la seva
    <ViewSequencesSettings key={document.id}>
      {({ viewSettings, sequenceViewSettings, scale, author }) => (
        <>
          {Object.entries(document.content).map(([key, sequence]) => {
            const seqKey = Number(key);
            // Totes les pestanyes en porten: la columna de vista les resol
            // amb la de l'estil quan no en tenen de pròpia
            const seqView = sequenceViewSettings[seqKey];

            const isRow = viewSettings.direction === "row";
            const justifyContent = isRow
              ? ALIGN_H[seqView.alignmentH]
              : ALIGN_V[seqView.alignmentV];

            return (
              <Box
                key={`sequence-${key}`}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: isRow ? "row" : "column",
                  justifyContent,
                  // Eix creuat sempre a l'inici (dalt si és horitzontal, esquerra si és
                  // vertical): evita el `stretch` per defecte de flex, que igualava
                  // l'alçada de tots els pictogrames de la fila. L'alineació V/H que
                  // tria l'usuari és de bloc i l'aplica `ViewSquenceSettings`.
                  alignItems: "flex-start",
                  columnGap: seqView.pictSpaceBetween * scale * seqView.sizePict,
                  rowGap: seqView.pictSpaceBetween * scale * seqView.sizePict,
                  height: isRow ? "auto" : "100%",
                  width: isRow ? "100%" : "auto",
                }}
              >
                {sequence.map((pictogram) => (
                  <PictogramCard
                    pictogram={pictogram}
                    view={"complete"}
                    defaults={defaults}
                    variant="plane"
                    size={{
                      pictSize: seqView.sizePict,
                      scale: scale,
                    }}
                    key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
                  />
                ))}
              </Box>
            );
          })}
        </>
      )}
    </ViewSequencesSettings>
  );
};

export default ViewSequencePage;
