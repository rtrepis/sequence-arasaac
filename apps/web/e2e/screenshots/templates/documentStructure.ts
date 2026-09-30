import {
  appBackgrounds,
  appPalette,
  printColors,
} from "../../../src/style/palette";

// Plantilla del dibuix «Com està pensat un document» de la notícia
// `documents-everywhere`: un document que conté seqüències, i cada seqüència
// pictogrames; al costat, l'estil general i els canvis d'un pictograma; a
// sota, la pàgina i les fotos dins el document, i les preferències fora. Sense
// cap terme tècnic: és per a l'usuari. Els colors surten de la paleta.

export interface StructureLabels {
  document: string;
  sequence: string;
  pictograms: string;
  generalStyle: string;
  pictogramChanges: string;
  page: string;
  photos: string;
  preferences: string;
  outside: string;
}

export const STRUCTURE_LABELS: Record<string, StructureLabels> = {
  ca: {
    document: "Document",
    sequence: "Seqüència",
    pictograms: "Pictogrames",
    generalStyle: "Estil general",
    pictogramChanges: "Canvis d'un pictograma",
    page: "Pàgina",
    photos: "Les teves fotos",
    preferences: "Les teves preferències",
    outside: "Fora del document",
  },
  es: {
    document: "Documento",
    sequence: "Secuencia",
    pictograms: "Pictogramas",
    generalStyle: "Estilo general",
    pictogramChanges: "Cambios de un pictograma",
    page: "Página",
    photos: "Tus fotos",
    preferences: "Tus preferencias",
    outside: "Fuera del documento",
  },
  en: {
    document: "Document",
    sequence: "Sequence",
    pictograms: "Pictograms",
    generalStyle: "General style",
    pictogramChanges: "A pictogram's changes",
    page: "Page",
    photos: "Your photos",
    preferences: "Your preferences",
    outside: "Outside the document",
  },
  fr: {
    document: "Document",
    sequence: "Séquence",
    pictograms: "Pictogrammes",
    generalStyle: "Style général",
    pictogramChanges: "Modifications d'un pictogramme",
    page: "Page",
    photos: "Vos photos",
    preferences: "Vos préférences",
    outside: "Hors du document",
  },
  it: {
    document: "Documento",
    sequence: "Sequenza",
    pictograms: "Pittogrammi",
    generalStyle: "Stile generale",
    pictogramChanges: "Modifiche di un pittogramma",
    page: "Pagina",
    photos: "Le tue foto",
    preferences: "Le tue preferenze",
    outside: "Fuori dal documento",
  },
};

const green = appPalette.primary;
const grey = appPalette.secondary;
const white = printColors.background;
const ink = printColors.text;
const paper = appBackgrounds.light.paper;

const escape = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Una seqüència: el seu nom i una filera de pictogrames (quadrats buits) */
const sequence = (label: StructureLabels, n: number): string => `
  <div class="sequence">
    <div class="title">${escape(label.sequence)} ${n}</div>
    <div class="picts">${'<div class="pict"></div>'.repeat(4)}</div>
    <div class="caption">${escape(label.pictograms)}</div>
  </div>`;

/**
 * El dibuix sencer. `wide` és la portada del carrusel: més apaïsada, i sense
 * la fila de sota, que a 140 px d'alt no es llegiria.
 */
export const documentStructureHtml = (
  label: StructureLabels,
  { wide = false }: { wide?: boolean } = {},
): string => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 28px; background: ${white}; color: ${ink};
    font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .canvas { display: flex; gap: 24px; align-items: stretch; }
  body.wide { height: 100vh; display: flex; align-items: center; }
  body.wide .canvas { width: 100%; }
  .document {
    flex: 1; border: 4px solid ${green.dark}; border-radius: 18px;
    background: ${paper}; padding: 18px 20px 20px;
  }
  .doc-title {
    font-size: 26px; font-weight: 700; margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .doc-title .icon {
    width: 26px; height: 32px; border: 3px solid ${green.dark};
    border-radius: 4px; background: ${white};
  }
  .sequences { display: flex; flex-direction: column; gap: 12px; }
  .sequence {
    background: ${white}; border: 2px solid ${grey.dark};
    border-radius: 12px; padding: 10px 14px;
  }
  .sequence .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .picts { display: flex; gap: 10px; }
  .pict {
    width: 46px; height: 46px; border-radius: 8px;
    border: 3px solid ${green.main}; background: ${white};
  }
  .caption { font-size: 14px; margin-top: 6px; color: ${grey.contrastText}; }
  .inside { display: flex; gap: 12px; margin-top: 14px; }
  .chip {
    flex: 1; background: ${white}; border: 2px dashed ${green.dark};
    border-radius: 12px; padding: 10px 12px; font-size: 17px; font-weight: 700;
    text-align: center;
  }
  .side { width: 250px; display: flex; flex-direction: column; gap: 14px; }
  .style {
    border-radius: 14px; padding: 14px; font-size: 18px; font-weight: 700;
    text-align: center; border: 3px solid ${green.dark};
  }
  .style.general { background: ${green.light}; color: ${green.contrastText}; }
  .style.change { background: ${white}; }
  .arrow { text-align: center; font-size: 26px; line-height: 1; color: ${green.dark}; }
  .outside {
    margin-top: auto; border: 3px solid ${grey.dark}; border-radius: 14px;
    background: ${grey.light}; padding: 12px; text-align: center;
  }
  .outside .label { font-size: 14px; color: ${grey.contrastText}; margin-bottom: 4px; }
  .outside .what { font-size: 18px; font-weight: 700; }
</style></head><body class="${wide ? "wide" : ""}">
  <div class="canvas" id="structure">
    <div class="document">
      <div class="doc-title"><span class="icon"></span>${escape(label.document)}</div>
      <div class="sequences">
        ${sequence(label, 1)}
        ${wide ? "" : sequence(label, 2)}
      </div>
      ${
        wide
          ? ""
          : `<div class="inside">
        <div class="chip">${escape(label.page)}</div>
        <div class="chip">${escape(label.photos)}</div>
      </div>`
      }
    </div>
    <div class="side">
      <div class="style general">${escape(label.generalStyle)}</div>
      <div class="arrow">↓</div>
      <div class="style change">${escape(label.pictogramChanges)}</div>
      ${
        wide
          ? ""
          : `<div class="outside">
        <div class="label">${escape(label.outside)}</div>
        <div class="what">${escape(label.preferences)}</div>
      </div>`
      }
    </div>
  </div>
</body></html>`;
