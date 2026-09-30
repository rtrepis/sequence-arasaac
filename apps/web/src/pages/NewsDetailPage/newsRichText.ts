import React from "react";

// Les etiquetes que pot portar el text d'una notícia: paràgrafs, negretes i
// llistes. Així una notícia llarga es pot llegir per parts sense que el text
// visqui fora dels fitxers de traducció. Les llistes i els paràgrafs porten
// l'aire aquí, perquè cap notícia no se l'hagi de posar a mà.
type Chunks = React.ReactNode[];

const block: React.CSSProperties = { margin: "0 0 0.75em" };
const list: React.CSSProperties = { ...block, paddingInlineStart: "1.5em" };

const p = (chunks: Chunks) =>
  React.createElement("p", { style: block }, ...chunks);
const b = (chunks: Chunks) => React.createElement("strong", null, ...chunks);
const ul = (chunks: Chunks) =>
  React.createElement("ul", { style: list }, ...chunks);
const ol = (chunks: Chunks) =>
  React.createElement("ol", { style: list }, ...chunks);
const li = (chunks: Chunks) =>
  React.createElement("li", { style: { marginBottom: "0.35em" } }, ...chunks);

export const newsRichText = { p, b, ul, ol, li };
