import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import React from "react";
import { printColors } from "@/style/palette";

/**
 * Classe estable del peu de llicència.
 *
 * A la impressió el peu apareix per la regla `@media print` d'aquí mateix, però
 * la captura del PDF (html2canvas) treballa sempre en `media: screen` i mai no
 * l'aplicaria. Per això `useDownloadPdf` el fa visible al clon, i necessita un
 * ganxo que no depengui de les classes generades per emotion.
 */
export const PRINT_COPYRIGHT_CLASS = "print-copyright";

/**
 * Separació del peu respecte a les vores del full. Als costats, els mateixos
 * 12 px de `paddingInline` que el contingut, perquè quedi alineat amb els
 * pictogrames i no enganxat a la vora.
 */
export const SHEET_FOOTER_INLINE_PX = 12;
export const SHEET_FOOTER_BOTTOM_PX = 10;

/** Aire entre l'última fila de pictogrames i el peu. */
export const SHEET_FOOTER_GAP_PX = 8;

interface LicenceVisibility {
  /** Preferència de l'usuari. Sense valor, la llicència hi va. */
  licence?: boolean;
  author: string;
}

/**
 * Si el full ha de dur el peu.
 *
 * **Amb autor hi va sempre**: qui signa una seqüència n'ha de dir també
 * d'on són els pictogrames, que no són seus. Sense autor, qui imprimeix per a
 * ell mateix pot estalviar-se la línia.
 */
export const showsLicence = ({ licence, author }: LicenceVisibility): boolean =>
  licence !== false || author.trim().length > 0;

interface CopyRightProps {
  author: string;
  licence?: boolean;
}

/**
 * Peu del full: autoria dels pictogrames, llicència i, si n'hi ha, autor de la
 * seqüència.
 *
 * Quan no s'ha de pintar no retorna res, i el full recupera la franja: el peu
 * és un bloc de la columna del full i, sense ell, el contingut disposa de tota
 * l'alçada.
 */
const CopyRight = ({
  author,
  licence,
}: CopyRightProps): React.ReactElement | null => {
  if (!showsLicence({ licence, author })) return null;

  return (
    <Typography
      component={"p"}
      className={PRINT_COPYRIGHT_CLASS}
      fontSize={10}
      sx={{
        // Al peu del full i **dins del flux**: així es reserva l'espai ell
        // mateix i no cau damunt de l'última fila de pictogrames. Abans era
        // `position: fixed`, que no ocupa lloc: amb el full ocupant la pàgina
        // sencera, el peu i els pictogrames compartien els mateixos píxels.
        // Si el text fa dues línies —en vertical hi cap just—, el full
        // n'hi reserva dues sense que ningú ho hagi de calcular.
        //
        // I es veu **també a la pantalla**: mentre només sortia al paper, la
        // previsualització oferia 29 px d'alçada que el full no tenia, i el que
        // hi arribava es trepitjava amb el peu en imprimir. El full és el que
        // s'imprimeix, i per tant ha d'ensenyar tot el que s'imprimirà.
        display: "block",
        flexShrink: 0,
        paddingInline: `${SHEET_FOOTER_INLINE_PX}px`,
        paddingBottom: `${SHEET_FOOTER_BOTTOM_PX}px`,
        // L'aire que separa el peu de l'última fila de pictogrames
        paddingTop: `${SHEET_FOOTER_GAP_PX}px`,
        // Sobre el full no hi mana el tema: en fosc, el text del tema és blanc
        // i aquí quedaria invisible damunt del paper
        color: printColors.text,
      }}
    >
      <FormattedMessage
        id="components.copyRight"
        defaultMessage="Made with: SequenciAAC - Author of the pictograms: Sergio Palao. Origen: ARASAAC
      (http://www.arasaac.org). License: CC (BY-NC-SA)."
        description="License to use the pictograms"
      />{" "}
      {author.trim().length !== 0 && (
        <FormattedMessage
          id="components.sequenceAuthor"
          defaultMessage="Sequence author:"
          description="License to use the pictograms"
        />
      )}{" "}
      {author}
    </Typography>
  );
};

export default CopyRight;
