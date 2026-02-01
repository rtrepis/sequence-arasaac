# Regles del projecte

- Usa TypeScript estricte, res amb `any`
- Comentaris sempre en català
- No afegir funcionalitat que no ha estat demanada
- Totes les components han de ser funcionals (no classes)
- Sempre usar arrow functions

---

## Descripció del projecte

App per crear seqüències de pictogrames (ARASAAC), previsualitzar-les i imprimir-les.
Té dos pàgines principales:
- **Edició** (`/create-sequence`): es construeix la seqüència afegint pictogrames
- **Visualització** (`/view-sequence`): es previsualitza amb control de mida dels pictogrames i separació entre files i columnes. Permet imprimir i veure a full screen.

## Tech stack

- **React 18** + **TypeScript** (Vite)
- **Redux Toolkit** — estat global amb 2 slices: `uiSlice` i `documentSlice`
- **React Router v6** — enrutament amb paràmetre `/:locale`
- **MUI (Material UI)** + **Emotion** — components UI i estils
- **react-intl** — multiidioma (ca, es, en)

## Estructura clau

```
src/
├── pages/              # Pàgines (WelcomePage, EditSequencesPage, ViewSequencePage)
├── components/         # Components reutilitzables
├── hooks/              # Custom hooks (usePageFormat, useScaleCalculator, usePrintStyles...)
├── types/              # Tipos TypeScript (sequence.ts, PageFormat.ts, ui.ts...)
├── app/                # Redux store + slices
├── features/           # Features modularitzades (print-refactor, print-preview-example)
├── languages/          # Traduccions JSON
└── configs/            # Configuracions generals
```

## Hooks principals

| Hook | Rol |
|------|-----|
| `usePageFormat` | Formats de pàgina (A4, A3, FULLSCREEN) i orientació |
| `useScaleCalculator` | Càlcul d'escales segons DPI i dimensions |
| `usePrintStyles` | Estils dinàmics per impressió |
| `useFullScreen` | Mode fullscreen |
| `useAraSaac` | Connexió amb API ARASAAC per obtenir pictogrames |
