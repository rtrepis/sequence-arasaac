import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";

/**
 * Component de Calibratge per ajustar les constants de visualització
 * Permet modificar valors en temps real i veure l'efecte
 */
const CalibrationTool = () => {
  // Dimensions A4 en mm (internacionals)
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const A3_WIDTH_MM = 297;
  const A3_HEIGHT_MM = 420;

  // Constants ajustables
  const [dpi, setDpi] = useState(96); // DPI estàndard de navegadors
  const [printMarginMM, setPrintMarginMM] = useState(10); // Marges d'impressió
  const [containerPadding, setContainerPadding] = useState(24); // Padding del contenidor

  // Valors de test
  const [testSizePict, setTestSizePict] = useState(0.85);
  const [testNumPictograms, setTestNumPictograms] = useState(6);
  const [previewPictSize, setPreviewPictSize] = useState(127);
  const [printPictSize, setPrintPictSize] = useState(155.5);

  /**
   * Converteix mil·límetres a píxels segons DPI
   */
  const mmToPixels = (mm: number, currentDpi: number = dpi) => {
    return (mm * currentDpi) / 25.4;
  };

  /**
   * Converteix píxels a mil·límetres segons DPI
   */
  const pixelsToMM = (pixels: number, currentDpi: number = dpi) => {
    return (pixels * 25.4) / currentDpi;
  };

  /**
   * Calcula dimensions útils del paper (descomptant marges)
   */
  const calculateUsableDimensions = (
    widthMM: number,
    heightMM: number,
    marginMM: number,
  ) => {
    const usableWidthMM = widthMM - marginMM * 2;
    const usableHeightMM = heightMM - marginMM * 2;

    return {
      widthMM: usableWidthMM,
      heightMM: usableHeightMM,
      widthPx: mmToPixels(usableWidthMM),
      heightPx: mmToPixels(usableHeightMM),
    };
  };

  // Calcular dimensions per A4 i A3
  const a4Landscape = calculateUsableDimensions(
    A4_WIDTH_MM,
    A4_HEIGHT_MM,
    printMarginMM,
  );
  const a4Portrait = calculateUsableDimensions(
    A4_HEIGHT_MM,
    A4_WIDTH_MM,
    printMarginMM,
  );
  const a3Landscape = calculateUsableDimensions(
    A3_WIDTH_MM,
    A3_HEIGHT_MM,
    printMarginMM,
  );
  const a3Portrait = calculateUsableDimensions(
    A3_HEIGHT_MM,
    A3_WIDTH_MM,
    printMarginMM,
  );

  /**
   * Calcula l'escala que s'hauria d'utilitzar
   */
  const calculateExpectedScale = (
    pageWidthPx: number,
    screenWidth: number = 1920,
  ) => {
    const margin = screenWidth > 900 ? 380 : 65;
    const availableWidth = screenWidth - margin;
    const scale = availableWidth / (pageWidthPx + containerPadding);
    return scale;
  };

  // Escales calculades
  const scaleA4Landscape = calculateExpectedScale(a4Landscape.widthPx);
  const scaleA4Portrait = calculateExpectedScale(a4Portrait.widthPx);

  /**
   * Anàlisi del desajust actual
   */
  const currentRatio = printPictSize / previewPictSize;
  const expectedScale = scaleA4Landscape;

  // Pictograma size base estimat
  const basePictSize = 150; // Mida base dels pictogrames
  const calculatedPreviewSize = basePictSize * testSizePict * expectedScale;
  const calculatedPrintSize = basePictSize * testSizePict;

  /**
   * Generar codi amb les constants actualitzades
   */
  const generateCode = () => {
    return `
// pageFormat.ts - CONSTANTS AJUSTADES

/**
 * DPI utilitzat per conversions mm → px
 * Nota: Navegadors web usen 96 DPI per defecte
 */
export const STANDARD_DPI = ${dpi};

/**
 * Marges d'impressió en mm (per cada costat)
 */
export const PRINT_MARGIN_MM = ${printMarginMM};

/**
 * Padding del contenidor en píxels
 */
export const PRINT_CONTAINER_PADDING = ${containerPadding};

/**
 * Converteix mil·límetres a píxels
 */
export function mmToPixels(mm: number): number {
  return (mm * STANDARD_DPI) / 25.4;
}

/**
 * Definicions de formats de pàgina amb dimensions útils
 * (descomptant marges d'impressió)
 */
export const PAGE_FORMATS: Record<PageSize, PageDimensions> = {
  A4: {
    width: ${Math.round(a4Landscape.widthPx)},   // ${a4Landscape.widthMM.toFixed(1)}mm útils
    height: ${Math.round(a4Landscape.heightPx)},  // ${a4Landscape.heightMM.toFixed(1)}mm útils
  },
  A3: {
    width: ${Math.round(a3Landscape.widthPx)},   // ${a3Landscape.widthMM.toFixed(1)}mm útils
    height: ${Math.round(a3Landscape.heightPx)},  // ${a3Landscape.heightMM.toFixed(1)}mm útils
  },
  FULLSCREEN: {
    width: typeof window !== 'undefined' ? window.screen.width : 1920,
    height: typeof window !== 'undefined' ? window.screen.height : 1080,
  },
};

/**
 * Dimensions de paper estàndard (sense marges)
 */
export const PAPER_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
};
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCode());
    alert("Codi copiat al portapapers!");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        🔧 Eina de Calibratge de Constants
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ajusta els paràmetres per obtenir una correspondència exacta entre
        previsualització i impressió. Les dimensions es calculen automàticament.
      </Alert>

      <Stack direction="row" spacing={3}>
        {/* Panell de Controls */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Paràmetres de Sistema
          </Typography>

          <Stack spacing={3}>
            <div>
              <Typography gutterBottom>
                DPI (punts per polzada): {dpi}
              </Typography>
              <Slider
                value={dpi}
                onChange={(_, v) => setDpi(v as number)}
                min={72}
                max={144}
                step={1}
              />
              <Typography variant="caption" color="text.secondary">
                Estàndard web: 96 DPI. Alguns monitors: 120-144 DPI
              </Typography>
            </div>

            <div>
              <Typography gutterBottom>
                Marge d&apos;impressió (mm): {printMarginMM}
              </Typography>
              <Slider
                value={printMarginMM}
                onChange={(_, v) => setPrintMarginMM(v as number)}
                min={0}
                max={25}
                step={0.5}
              />
              <Typography variant="caption" color="text.secondary">
                Marges típics: 10mm (escasses) a 20mm (normals)
              </Typography>
            </div>

            <div>
              <Typography gutterBottom>
                Container Padding (px): {containerPadding}
              </Typography>
              <Slider
                value={containerPadding}
                onChange={(_, v) => setContainerPadding(v as number)}
                min={0}
                max={50}
                step={1}
              />
              <Typography variant="caption" color="text.secondary">
                Padding extra del contenidor de previsualització
              </Typography>
            </div>

            <Divider />

            <Typography variant="h6">Dades de Test (del teu cas)</Typography>

            <TextField
              label="sizePict"
              type="number"
              value={testSizePict}
              onChange={(e) => setTestSizePict(parseFloat(e.target.value))}
              inputProps={{ step: 0.01, min: 0.5, max: 2 }}
            />

            <TextField
              label="Mida pictograma en previsualització (px)"
              type="number"
              value={previewPictSize}
              onChange={(e) => setPreviewPictSize(parseFloat(e.target.value))}
            />

            <TextField
              label="Mida pictograma en impressió (px)"
              type="number"
              value={printPictSize}
              onChange={(e) => setPrintPictSize(parseFloat(e.target.value))}
            />
          </Stack>
        </Paper>

        {/* Panell de Resultats */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            📊 Resultats Calculats
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="primary">
                A4 Landscape (útil després de marges)
              </Typography>
              <Typography variant="body2">
                Dimensions: {a4Landscape.widthMM.toFixed(1)} ×{" "}
                {a4Landscape.heightMM.toFixed(1)} mm
              </Typography>
              <Typography variant="body2">
                En píxels: {Math.round(a4Landscape.widthPx)} ×{" "}
                {Math.round(a4Landscape.heightPx)} px
              </Typography>
              <Typography variant="body2" color="secondary">
                Escala calculada: {scaleA4Landscape.toFixed(3)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="primary">
                A4 Portrait (útil després de marges)
              </Typography>
              <Typography variant="body2">
                Dimensions: {a4Portrait.widthMM.toFixed(1)} ×{" "}
                {a4Portrait.heightMM.toFixed(1)} mm
              </Typography>
              <Typography variant="body2">
                En píxels: {Math.round(a4Portrait.widthPx)} ×{" "}
                {Math.round(a4Portrait.heightPx)} px
              </Typography>
              <Typography variant="body2" color="secondary">
                Escala calculada: {scaleA4Portrait.toFixed(3)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="primary">
                A3 Landscape (útil després de marges)
              </Typography>
              <Typography variant="body2">
                Dimensions: {a3Landscape.widthMM.toFixed(1)} ×{" "}
                {a3Landscape.heightMM.toFixed(1)} mm
              </Typography>
              <Typography variant="body2">
                En píxels: {Math.round(a3Landscape.widthPx)} ×{" "}
                {Math.round(a3Landscape.heightPx)} px
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ bgcolor: "info.light", p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎯 Anàlisi del Desajust
              </Typography>
              <Typography variant="body2">
                Ratio actual: {currentRatio.toFixed(3)} (
                {((currentRatio - 1) * 100).toFixed(1)}% diferència)
              </Typography>
              <Typography variant="body2">
                Mida calculada previsualització:{" "}
                {calculatedPreviewSize.toFixed(1)} px
              </Typography>
              <Typography variant="body2">
                Mida real previsualització: {previewPictSize} px
              </Typography>
              <Typography variant="body2">
                Error:{" "}
                {Math.abs(calculatedPreviewSize - previewPictSize).toFixed(1)}{" "}
                px
              </Typography>
            </Box>

            {Math.abs(calculatedPreviewSize - previewPictSize) > 5 && (
              <Alert severity="warning">
                Hi ha un desajust significatiu. Prova d&apos;ajustar DPI, marges
                o padding.
              </Alert>
            )}

            {Math.abs(calculatedPreviewSize - previewPictSize) <= 5 && (
              <Alert severity="success">
                ✅ Els valors estan ben calibrats!
              </Alert>
            )}
          </Stack>
        </Paper>
      </Stack>

      {/* Codi generat */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Codi Generat amb Constants Actualitzades
          </Typography>
          <Button variant="contained" onClick={copyToClipboard}>
            📋 Copiar Codi
          </Button>
        </Stack>

        <Box
          component="pre"
          sx={{
            bgcolor: "grey.100",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
          }}
        >
          {generateCode()}
        </Box>
      </Paper>

      {/* Taula comparativa */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📏 Taula Comparativa de Formats
        </Typography>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Format</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Paper (mm)</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Útil (mm)</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Píxels</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Escala</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>A4 Landscape</td>
              <td style={{ textAlign: "right", padding: "8px" }}>210 × 297</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {a4Landscape.widthMM.toFixed(0)} ×{" "}
                {a4Landscape.heightMM.toFixed(0)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {Math.round(a4Landscape.widthPx)} ×{" "}
                {Math.round(a4Landscape.heightPx)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {scaleA4Landscape.toFixed(3)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>A4 Portrait</td>
              <td style={{ textAlign: "right", padding: "8px" }}>297 × 210</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {a4Portrait.widthMM.toFixed(0)} ×{" "}
                {a4Portrait.heightMM.toFixed(0)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {Math.round(a4Portrait.widthPx)} ×{" "}
                {Math.round(a4Portrait.heightPx)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {scaleA4Portrait.toFixed(3)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>A3 Landscape</td>
              <td style={{ textAlign: "right", padding: "8px" }}>297 × 420</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {a3Landscape.widthMM.toFixed(0)} ×{" "}
                {a3Landscape.heightMM.toFixed(0)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {Math.round(a3Landscape.widthPx)} ×{" "}
                {Math.round(a3Landscape.heightPx)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>-</td>
            </tr>
            <tr>
              <td style={{ padding: "8px" }}>A3 Portrait</td>
              <td style={{ textAlign: "right", padding: "8px" }}>420 × 297</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {a3Portrait.widthMM.toFixed(0)} ×{" "}
                {a3Portrait.heightMM.toFixed(0)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                {Math.round(a3Portrait.widthPx)} ×{" "}
                {Math.round(a3Portrait.heightPx)}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>-</td>
            </tr>
          </tbody>
        </table>
      </Paper>
    </Box>
  );
};

export default CalibrationTool;
