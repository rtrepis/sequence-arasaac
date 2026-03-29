/**
 * Utilitats per detectar i gestionar DPI de diferents usuaris
 */

/**
 * Detecta el Device Pixel Ratio (relació entre píxels físics i píxels CSS)
 *
 * Valors típics:
 * - 1: Pantalles estàndard (96 DPI)
 * - 2: Pantalles Retina, iPhone (192 DPI)
 * - 1.5: Pantalles HD intermedies (144 DPI)
 * - 3: Pantalles ultra HD, alguns Android (288 DPI)
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Calcula el DPI efectiu basant-se en devicePixelRatio
 *
 * Nota: Aquest és el DPI "lògic" que el navegador utilitza per CSS,
 * no el DPI físic real de la pantalla
 */
export function getEffectiveDPI(): number {
  const baseDPI = 96; // DPI estàndard CSS
  const pixelRatio = getDevicePixelRatio();
  return baseDPI * pixelRatio;
}

/**
 * Intenta detectar el DPI físic real de la pantalla
 *
 * Limitacions:
 * - No és 100% precís
 * - Depèn de que el navegador reporti correctament les dimensions físiques
 * - Pot fallar en alguns dispositius
 *
 * @returns DPI estimat o null si no es pot determinar
 */
export function detectPhysicalDPI(): number | null {
  try {
    // Crear un div temporal d'1 polzada
    const div = document.createElement("div");
    div.style.width = "1in";
    div.style.height = "1in";
    div.style.position = "absolute";
    div.style.left = "-100%";
    div.style.top = "-100%";

    document.body.appendChild(div);

    // Mesurar quants píxels CSS té 1 polzada
    const dpi = div.offsetWidth;

    document.body.removeChild(div);

    // Validar que el valor és raonable
    if (dpi >= 72 && dpi <= 300) {
      return dpi;
    }

    return null;
  } catch (error) {
    console.warn("No s'ha pogut detectar el DPI físic:", error);
    return null;
  }
}

/**
 * Classifica el tipus de pantalla segons DPI
 */
export type ScreenType = "standard" | "hd" | "retina" | "ultra-hd";

export interface ScreenInfo {
  dpi: number;
  pixelRatio: number;
  type: ScreenType;
  description: string;
}

/**
 * Obté informació completa sobre la pantalla de l'usuari
 */
export function getScreenInfo(): ScreenInfo {
  const pixelRatio = getDevicePixelRatio();
  const effectiveDPI = getEffectiveDPI();
  const physicalDPI = detectPhysicalDPI();

  // Usar DPI físic si està disponible, sinó usar l'efectiu
  const dpi = physicalDPI || effectiveDPI;

  let type: ScreenType;
  let description: string;

  if (pixelRatio >= 3) {
    type = "ultra-hd";
    description = "Pantalla Ultra HD (3x o superior)";
  } else if (pixelRatio >= 2) {
    type = "retina";
    description = "Pantalla Retina/High DPI (2x)";
  } else if (pixelRatio >= 1.25) {
    type = "hd";
    description = "Pantalla HD (1.25x - 1.75x)";
  } else {
    type = "standard";
    description = "Pantalla estàndard (1x)";
  }

  return {
    dpi,
    pixelRatio,
    type,
    description,
  };
}

/**
 * Hook de React per obtenir informació DPI de l'usuari
 */
import { useEffect, useState } from "react";

export function useScreenDPI() {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() =>
    getScreenInfo(),
  );

  useEffect(() => {
    // Actualitzar quan canvia el zoom o es connecta un altre monitor
    const handleChange = () => {
      setScreenInfo(getScreenInfo());
    };

    // Escoltar canvis en devicePixelRatio
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );

    // API antiga (alguns navegadors)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // @ts-ignore - API antiga
      mediaQuery.addListener(handleChange);
    }

    // També escoltar canvis de mida de finestra (pot indicar canvi de monitor)
    window.addEventListener("resize", handleChange);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // @ts-ignore
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener("resize", handleChange);
    };
  }, []);

  return screenInfo;
}

/**
 * Guarda la preferència DPI de l'usuari
 */
export function saveDPIPreference(dpi: number) {
  try {
    localStorage.setItem("user-dpi-preference", dpi.toString());
  } catch (error) {
    console.warn("No s'ha pogut guardar la preferència DPI:", error);
  }
}

/**
 * Carrega la preferència DPI de l'usuari
 */
export function loadDPIPreference(): number | null {
  try {
    const saved = localStorage.getItem("user-dpi-preference");
    if (saved) {
      const dpi = parseInt(saved, 10);
      if (!isNaN(dpi) && dpi >= 72 && dpi <= 300) {
        return dpi;
      }
    }
  } catch (error) {
    console.warn("No s'ha pogut carregar la preferència DPI:", error);
  }
  return null;
}

/**
 * Obté el DPI que s'hauria d'utilitzar, considerant:
 * 1. Preferència guardada de l'usuari
 * 2. DPI detectat automàticament
 * 3. DPI per defecte (96)
 */
export function getUserDPI(): number {
  // Primer intentar carregar preferència
  const preference = loadDPIPreference();
  if (preference !== null) {
    return preference;
  }

  // Sinó, intentar detectar
  const screenInfo = getScreenInfo();
  return screenInfo.dpi;
}

/**
 * Component React per mostrar i ajustar configuració DPI
 */
import { Box, Typography, Slider, Button, Alert, Paper } from "@mui/material";

export const DPISettings: React.FC = () => {
  const detectedScreenInfo = useScreenDPI();
  const [customDPI, setCustomDPI] = useState<number | null>(
    loadDPIPreference(),
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const activeDPI = customDPI || detectedScreenInfo.dpi;

  const handleSave = () => {
    if (customDPI) {
      saveDPIPreference(customDPI);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("user-dpi-preference");
    setCustomDPI(null);
    setShowSuccess(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        ⚙️ Configuració de DPI
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Detectat automàticament:</strong>
          </Typography>
          <Typography variant="body2">
            • DPI: {detectedScreenInfo.dpi}
          </Typography>
          <Typography variant="body2">
            • Tipus: {detectedScreenInfo.description}
          </Typography>
          <Typography variant="body2">
            • Pixel Ratio: {detectedScreenInfo.pixelRatio}x
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>DPI Personalitzat: {activeDPI}</Typography>
        <Slider
          value={customDPI || detectedScreenInfo.dpi}
          onChange={(_, value) => setCustomDPI(value as number)}
          min={72}
          max={300}
          step={1}
          marks={[
            { value: 96, label: "96 (Estàndard)" },
            { value: 144, label: "144 (HD)" },
            { value: 192, label: "192 (Retina)" },
          ]}
        />
        <Typography variant="caption" color="text.secondary">
          Ajusta aquest valor si la previsualització no coincideix amb la
          impressió
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={customDPI === null}
        >
          Guardar Preferència
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Restaurar Automàtic
        </Button>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Preferència DPI guardada correctament
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>
          <strong>Com funciona:</strong>
        </Typography>
        <Typography variant="caption" display="block">
          1. El sistema detecta automàticament el DPI de la teva pantalla
        </Typography>
        <Typography variant="caption" display="block">
          2. Si vols, pots ajustar-lo manualment per calibrar la
          previsualització
        </Typography>
        <Typography variant="caption" display="block">
          3. La teva preferència es guarda i s'utilitza en futures visites
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * Debug: Mostra informació detallada sobre el DPI
 */
export function logDPIInfo() {
  console.group("🖥️ Informació DPI");

  const screenInfo = getScreenInfo();
  console.log("DPI efectiu:", screenInfo.dpi);
  console.log("Pixel Ratio:", screenInfo.pixelRatio);
  console.log("Tipus de pantalla:", screenInfo.type);
  console.log("Descripció:", screenInfo.description);

  const physicalDPI = detectPhysicalDPI();
  console.log("DPI físic detectat:", physicalDPI || "No disponible");

  const userPreference = loadDPIPreference();
  console.log("Preferència usuari:", userPreference || "No configurada");

  const finalDPI = getUserDPI();
  console.log("DPI final utilitzat:", finalDPI);

  console.log("Dimensions pantalla:", {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
  });

  console.groupEnd();
}
