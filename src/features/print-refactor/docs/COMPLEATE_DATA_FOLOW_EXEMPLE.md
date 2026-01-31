/\*\*

- EXEMPLE COMPLET: Flux de Dades des de ViewSequencesSettings fins a PictogramCard
-
- Aquest exemple mostra com els valors calculats flueixen pel sistema
- utilitzant el patró Render Prop (Children as Function)
  \*/

// ============================================================================
// STEP 1: ViewSequencesSettings - Calcula i Proporciona Valors
// ============================================================================

import React from "react";
import { useViewManager } from "../../hooks/useViewManager";
import { useScaleCalculator } from "../../hooks/useScaleCalculator";
import { usePageFormat } from "../../hooks/usePageFormat";
import { useAuthorManager } from "../../hooks/useViewManager";

interface ViewSequencesSettingsChildrenProps {
viewSettings: ViewSettings; // { sizePict, columnGap, rowGap }
scale: number; // Escala calculada
author: string; // Autor
}

interface ViewSequencesSettingsProps {
// Children és una FUNCIÓ, no elements React
children: (props: ViewSequencesSettingsChildrenProps) => React.ReactElement;
}

const ViewSequencesSettings = ({ children }: ViewSequencesSettingsProps) => {
// 1. Obtenir configuració inicial
const initialViewSettings = useAppSelector((state) => state.ui.viewSettings);

// 2. Gestionar viewSettings (sizePict, columnGap, rowGap)
const { viewSettings, updateViewSetting } = useViewManager({
initialViewSettings,
});

// 3. Gestionar format de pàgina
const { pageFormat } = usePageFormat();

// 4. Calcular escala basant-se en format i pantalla
const { scale: calculatedScale } = useScaleCalculator(
pageFormat,
screenWidth,
screenHeight
);

// 5. Gestionar mode fullscreen
const { isFullscreen, currentScale } = useFullscreen();

// 6. Gestionar autor
const { author } = useAuthorManager();

// 7. Determinar escala activa (normal vs fullscreen)
const activeScale = isFullscreen ? currentScale : calculatedScale;

return (
<>
{/_ Controls UI: sliders, buttons, etc. _/}
<div className="controls">
<Slider
name="sizePict"
value={viewSettings.sizePict}
onChange={(e, value) => updateViewSetting('sizePict', value)}
min={0.5}
max={2}
step={0.01}
/>
{/_ Més controls... _/}
</div>

      {/* Contenidor de previsualització */}
      <Stack className="preview-container">
        {/*
          CLAU: Cridem children com a FUNCIÓ i li passem les props
          Això permet que el component pare (ViewSequencePage)
          accedeixi als valors calculats aquí
        */}
        {children({
          viewSettings,      // ← Valors dels sliders
          scale: activeScale, // ← Escala calculada
          author,            // ← Autor del document
        })}
      </Stack>
    </>

);
};

export default ViewSequencesSettings;

// ============================================================================
// STEP 2: ViewSequencePage - Rep i Usa els Valors
// ============================================================================

import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSequencesSettings.refactored";

const ViewSequencePage = () => {
// Obtenir les seqüències de pictogrames del store
const { document } = useAppSelector((state) => state);

return (
<ViewSequencesSettings>
{/_
PATRÓ RENDER PROP: - Children és una FUNCIÓ - Rep com a paràmetre un objecte amb { viewSettings, scale, author } - Retorna JSX que pot usar aquests valors
_/}
{({ viewSettings, scale, author }) => (
<>
{/_ Iterem per cada seqüència _/}
{Object.entries(document.content).map(([key, sequence]) => (
<Box
key={`sequence-${key}`}
sx={{
                display: "flex",
                flexWrap: "wrap",
                // IMPORTANT: Usem scale per calcular gaps
                columnGap: viewSettings.columnGap * scale,
                rowGap: viewSettings.rowGap * scale,
              }} >
{/_ Iterem per cada pictograma _/}
{sequence.map((pictogram) => (
<PictogramCard
pictogram={pictogram}
view={"complete"}
variant="plane"

                  {/*
                    CLAU: Passem l'objecte size amb els valors rebuts
                    - pictSize: Controls la mida base del pictograma
                    - scale: Ajusta segons el format de pàgina i pantalla
                  */}
                  size={{
                    pictSize: viewSettings.sizePict,  // Del slider (0.5 - 2.0)
                    scale: scale,                     // Calculat dinàmicament
                  }}

                  key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
                />
              ))}
            </Box>
          ))}

          {/* Component de copyright que també usa author */}
          <CopyRight author={author} />
        </>
      )}
    </ViewSequencesSettings>

);
};

export default ViewSequencePage;

// ============================================================================
// STEP 3: PictogramCard - Rep i Aplica els Valors de Size
// ============================================================================

interface PictogramCardProps {
pictogram: PictSequence;
view: "complete" | "header" | "footer" | "none";
variant?: "plane";
size?: {
pictSize?: number; // Mida base del pictograma (del slider)
scale?: number; // Escala de la pàgina (calculada)
};
}

const PictogramCard = ({
pictogram,
view,
variant,
size, // ← Rep l'objecte size des de ViewSequencePage
}: PictogramCardProps) => {
// Obtenir valors per defecte del store
const defaultSettings = useAppSelector((state) => state.ui.defaultSettings);

// Extreure pictSize i scale amb valors per defecte
const pictSize = size?.pictSize ?? 1; // Default: 1
const printPageRatio = size?.scale ?? 1; // Default: 1

// Obtenir configuració de font
const font = pictogram.settings.font ?? defaultSettings.pictSequence.font;

// CÀLCUL DE DIMENSIONS DINÀMIQUES
// Tots aquests càlculs usen pictSize i printPageRatio (scale)

// 1. Mida del text
const textFontSize = 20 _ font.size _ printPageRatio \* pictSize;
// ↑ ↑ ↑ ↑
// base config escala pàgina escala slider

// 2. Mida de la imatge
const imageSize = 150 _ pictSize _ printPageRatio;
// ↑ ↑ ↑
// base slider escala pàgina

// 3. Mida dels borders
const borderSize = borderIn.size _ pictSize _ printPageRatio;
// ↑ ↑ ↑
// config slider escala pàgina

return (
<Card
data-testid="card-pictogram"
sx={() => pictogram\_\_card(
borderOut,
variant,
pictSize, // ← Usat per calcular dimensions
printPageRatio // ← Usat per calcular dimensions
)} >
{/_ Header amb text _/}
{(view === "complete" || view === "header") && (
<CardContent>
<Typography
fontSize={textFontSize} // ← Calculat dinàmicament
fontFamily={font.family}
color={font.color} >
{/_ Contingut del text _/}
</Typography>
</CardContent>
)}

      {/* Imatge del pictograma */}
      <CardMedia
        component="img"
        image={imageUrl}
        height={imageSize}   // ← Calculat dinàmicament
        width={imageSize}    // ← Calculat dinàmicament
        sx={() => pictogram__media(
          borderIn,
          view,
          pictSize,          // ← Usat per calcular borders
          printPageRatio     // ← Usat per calcular borders
        )}
      />

      {/* Footer amb text */}
      {(view === "complete" || view === "footer") && (
        <CardContent>
          <Typography fontSize={textFontSize}>
            {/* Contingut del text */}
          </Typography>
        </CardContent>
      )}
    </Card>

);
};

// ============================================================================
// STEP 4: pictogram\_\_card (Styled Function) - Aplica Estils Dinàmics
// ============================================================================

export const pictogram\_\_card = (
borderOut: Border,
variant: unknown,
pictSize: number, // ← Rep des de PictogramCard
printPageRatio: number // ← Rep des de PictogramCard
) => {
const card: SxProps = {
textAlign: "center",

    // Amplada dinàmica basada en border, pictSize i scale
    width: (borderOut.size === 0 ? 150 : 180 + borderOut.size) * pictSize * printPageRatio,
    //      ↑                                                     ↑          ↑
    //   base dimensions                                       slider     escala pàgina

    // Padding dinàmic
    paddingInline: borderOut.size === 0 ? 0 : 1.5 * printPageRatio * pictSize,

    // Border dinàmic
    border: `${borderOut.size * pictSize * printPageRatio}px solid`,
    borderColor: borderOut.color,
    borderRadius: `${borderOut.radius * pictSize * printPageRatio}px`,

    // Shadow (només si no és variant plane)
    boxShadow: variant ? "none" : "",

    "&:hover": {
      boxShadow: variant ? "none" : "0px 0px 10px 3px #A6A6A6",
    },

    // Estils per a impressió (dimensions fixes)
    "@media print": {
      width: (borderOut.size === 0 ? 150 : 180 + borderOut.size) * pictSize,
      paddingInline: borderOut.size === 0 ? 0 : 1.5 * pictSize,
      border: `${borderOut.size * pictSize}px solid`,
      borderRadius: `${borderOut.radius * pictSize}px`,
    },

};

return card;
};

// ============================================================================
// FLUX COMPLET DE DADES
// ============================================================================

/\*\*

- EXEMPLE DE FLUX QUAN L'USUARI MOU EL SLIDER DE SIZE:
-
- 1.  Usuari mou slider de 1.0 a 1.5
- ↓
- 2.  ViewSequencesSettings.updateViewSetting('sizePict', 1.5)
- ↓
- 3.  viewSettings.sizePict canvia de 1.0 → 1.5
- ↓
- 4.  Component re-renderitza i crida children({ viewSettings, scale, author })
- ↓
- 5.  ViewSequencePage rep nou viewSettings.sizePict = 1.5
- ↓
- 6.  Passa size={{ pictSize: 1.5, scale }} a cada PictogramCard
- ↓
- 7.  PictogramCard calcula noves dimensions:
- - textFontSize = 20 _ font.size _ scale _ 1.5 (abans era _ 1.0)
- - imageSize = 150 _ 1.5 _ scale (abans era \* 1.0)
- - borderSize = border.size _ 1.5 _ scale (abans era \* 1.0)
- ↓
- 8.  Component re-renderitza amb noves dimensions
- ↓
- 9.  Els pictogrames es veuen 50% més grans! ✅
      \*/

/\*\*

- EXEMPLE DE FLUX QUAN L'USUARI CANVIA DE A4 A A3:
-
- 1.  Usuari selecciona A3
- ↓
- 2.  usePageFormat.setPageSize('A3')
- ↓
- 3.  pageFormat canvia → dimensions: { width: 1450, height: 1025 }
- ↓
- 4.  useScaleCalculator recalcula amb noves dimensions
- ↓
- 5.  scale canvia (per exemple de 1.54 → 0.95)
- ↓
- 6.  ViewSequencesSettings crida children amb nou scale
- ↓
- 7.  PictogramCard rep size={{ pictSize: 1.0, scale: 0.95 }}
- ↓
- 8.  Recalcula dimensions amb nou scale
- ↓
- 9.  Tot s'ajusta proporcionalment a A3! ✅
      \*/

/\*\*

- CLAUS DEL SISTEMA:
-
- 1.  pictSize (0.5 - 2.0): Controlat per l'usuari amb slider
- - Permet fer pictogrames més grans o petits segons preferències
-
- 2.  scale (calculat): Ajusta automàticament segons:
- - Format de pàgina (A4, A3, Fullscreen)
- - Orientació (landscape, portrait)
- - Mida de pantalla
- - Mode fullscreen (fix 0.82)
-
- 3.  Tots dos es multipliquen per obtenir la mida final:
- finalSize = baseSize _ pictSize _ scale
-
- 4.  Render Prop Pattern permet que els valors flueixin naturalment:
- ViewSequencesSettings (calcula)
-      → ViewSequencePage (distribueix)
-        → PictogramCard (aplica)
  \*/
