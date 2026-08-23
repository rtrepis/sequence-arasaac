// Miniatura d'un document desat al núvol: els seus primers pictogrames.
//
// Amb només el títol i la data, dos documents desats el mateix dia són
// indistingibles fins que en carregues un i veus que no era. Els pictogrames
// són el llenguatge de l'usuari d'aquesta aplicació: reconèixer la seqüència
// per la imatge és més ràpid — i per a molts usuaris, més possible — que
// llegir-ne el nom.
import React from "react";
import { Box } from "@mui/material";
import { AiOutlineFileImage } from "react-icons/ai";
import usePictogramUrl from "@features/pictogram/hooks/usePictogramUrl";
import { DocumentThumbnailPict } from "@/types/document";
import { sheetSurface } from "@/style/palette";

interface DocumentThumbnailProps {
  thumbnail: DocumentThumbnailPict[];
  /** Text alternatiu de la miniatura sencera (el nom del document). */
  label: string;
}

const THUMBNAIL_PICT_SIZE = 40;

const DocumentThumbnail = ({
  thumbnail,
  label,
}: DocumentThumbnailProps): React.ReactElement => {
  const { buildPictogramUrl } = usePictogramUrl();

  return (
    <Box
      // Una sola imatge accessible: el detall de cada pictograma no aporta res
      // a qui la llegeix amb lector de pantalla, i tres alts seguits serien soroll
      role="img"
      aria-label={label}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.25,
        p: 0.5,
        // Superfície de full: els pictogrames sempre es veuen sobre blanc,
        // també en tema fosc (vegeu el patró de zones)
        bgcolor: sheetSurface,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        minWidth: THUMBNAIL_PICT_SIZE + 8,
        height: THUMBNAIL_PICT_SIZE + 8,
        overflow: "hidden",
      }}
    >
      {thumbnail.length === 0 ? (
        // Document buit o desat abans que existissin les miniatures
        <Box
          sx={{
            display: "flex",
            color: "text.disabled",
            fontSize: THUMBNAIL_PICT_SIZE * 0.6,
          }}
        >
          <AiOutlineFileImage />
        </Box>
      ) : (
        thumbnail.map((pict, index) => (
          <Box
            key={`${pict.selectedId}-${index}`}
            component="img"
            src={
              pict.url ??
              buildPictogramUrl(
                pict.selectedId,
                pict.skin,
                pict.hair,
                pict.color,
              )
            }
            alt=""
            loading="lazy"
            sx={{
              width: THUMBNAIL_PICT_SIZE,
              height: THUMBNAIL_PICT_SIZE,
              objectFit: "contain",
            }}
          />
        ))
      )}
    </Box>
  );
};

export default DocumentThumbnail;
