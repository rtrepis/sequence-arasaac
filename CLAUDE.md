# Regles del projecte

- Usa TypeScript estricte, res amb `any`
- Comentaris sempre en català
- No afegir funcionalitat que no ha estat demanada
- Totes les components han de ser funcionals (no classes)
- Sempre usar arrow functions

## Estàndard de colors

- **Única font de veritat**: `apps/web/src/style/palette.ts` (importat per `themeMui.ts`). Mai definir hexadecimals fora d'aquest fitxer.
- El **verd oficial** de l'app és `primary.main: #8ac34a` (el de la NavBar, en clar i en fosc via `enableColorOnDark`).
- **Text/icones sobre verd**: sempre `primary.contrastText` (`#1E2A12`, fosc — contrast 7,2:1 WCAG AA). Mai blanc ni grisos clars sobre el verd (màxim 2,1:1, il·legible).
- El `secondary` són grisos amb matís verd (`main: #E3E8DC`) amb text fosc — mateixa lògica que el primary.
- **Mai hardcodejar colors** (`"green"`, `"whitesmoke"`, hex, rgba...) a components o styled: usar `theme.palette.*` (a `styled` amb `({ theme }) => ...`) o strings de tema a `sx` (`"primary.main"`, `"primary.contrastText"`).
- Per a tints/transparències derivar del tema amb `alpha(theme.palette..., x)` de `@mui/material`.
- Els botons i controls (Button, ToggleButton, etc.) es basen en `color="primary"` (el default del tema); dins la NavBar, `color="inherit"`.
- **Excepció**: els colors semàntics de pictogrames (`fitzgeraldColors.ts`, `inputColorList.ts`) són contingut, no UI — no s'han de tocar.

### Patró de zones (fons)

- **`background.default` = zona de treball** (on es veuen/editen pictogrames i seqüències): blanc en clar, negre en fosc. Neutre pur per no alterar els colors dels pictogrames.
- **`background.paper` = zona de configuració** (diàlegs, panells, acordions, controls): gris verdós (`#F2F5EC` clar / `#242820` fosc).
- Valors definits a `appBackgrounds` de `palette.ts`. L'overlay d'elevació de MUI està desactivat (`MuiPaper: backgroundImage: none`) perquè el gris de config sigui uniforme.
- Un preview de pictogrames dins d'una pantalla de config és zona de treball: `backgroundColor: "background.default"` (vegeu `PictEditForm`, `ViewSettingsPreview`). **Excepció**: la mostra de `DefaultForm` és un sol Card sobre el panell — un fons default aquí es veuria com un marc negre/blanc, per això usa `background.paper`.
- Al modal d'edició de pictograma (`PictEditForm`), tota la part superior (mostra + cerca) és zona de treball; només el `SettingAccordion` de sota és zona de configuració.

### Impressió i PDF

- **La sortida impresa i el PDF sempre són en clar** (paper blanc, text fosc), independentment del tema actiu. Tokens a `printColors` de `palette.ts`.
- Impressió (`window.print`): `generatePrintCSS` a `usePrintStyles.ts` força fons blanc a `.preview-container`, `.preview-content` i els `MuiPaper` interiors; el color de text s'hereta fosc. Els pictogrames restauren el color real triat per l'usuari amb regles `@media print` pròpies (`PictogramCard`).
- PDF (`useDownloadPdf.ts`): al clon de html2canvas es normalitzen els colors de tema amb `themeColorReplacements` (fons d'`appBackgrounds` → blanc, text blanc → negre). Els colors de contingut de l'usuari (font, vores, fitzgerald) no es toquen.
- El pictograma **sense color** (B/N) es mostra invertit en mode fosc (`filter: invert(1)` a `pictogram__media`, mai per a imatges personalitzades); la inversió es neutralitza amb `filter: none` a `@media print` i al `safetyStyle` del PDF perquè paper i PDF surtin sempre amb traç negre.

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

---

## Patrons i detalls tècnics importants

### Redux i estat

- **`uiSlice`** gestiona `defaultSettings` (configuració global de l'usuari). Té dos sub-objectes: `pictApiAra` (skin, hair, color) i `pictSequence` (font, numbered, borders, textPosition, numberFont).
- **`documentSlice`** gestiona el contingut de les seqüències (`content`, `activeSAAC`).
- El reducer `updateDefaultSettingPictSequence` fa un spread shallow sobre `pictSequence`, per tant qualsevol nou camp al nivell de `pictSequence` es pot actualitzar sense canviar el reducer.
- El reducer `updateDefaultSettings` reemplaça tot el `defaultSettings` — el que usa `handlerSubmit` de `DefaultForm`.
- **Persistència**: `DefaultForm` guarda a `sessionStorage` i `localStorage` amb la clau `"pictDefaultSettings"`. Si un usuari té dades antigues sense un camp nou, el fallback es gestiona al nivell de lectura (no hi ha migració).

### Tipografia i Font

- El type `Font` té 3 camps: `family: FontFamily`, `color: string`, `size: number` (multiplicador 0.5–2.0).
- Hi ha dos nivells de Font a `pictSequence`: `font` (text) i `numberFont` (números). Cada un pot tenir la seva pròpia configuració independent.
- **Fallback encadenat al render**: `pictFont ?? fontDefaultSetting` per al text; `pictNumberFont ?? numberFontDefaultSetting ?? fontDefaultSetting` per als números. El tercer nivell de fallback garanteix compatibilitat amb dades antigues.
- **`SettingCardFontGroup`** és el component reutilitzable per configurar un `Font`. Accepta una prop `title?: React.ReactNode` per personalitzar el heading sense duplicar el component.
- Les traduccions del títul dels grups de font aniran a `SettingCardFontGroup.lang.ts`.

### Numeració i posicionament

- `numbered` (boolean) controlla si es mostra `indexSequence + 1` al pictograma.
- `textPosition` ("top" | "bottom" | "none") determina on va el text. El número sempre va a la posició **oposita** al text.
- Al `PictogramCard`, el header i el footer són blocs separats. Dins de cada bloc, el text i el número són mutuament exclusius → es pot usar render condicional sense preocupar-se per el layout.
- `numbered` NO té estat local a `DefaultForm` perquè `SettingCardBoolean` dispatch directament a Redux i el re-render del component llegeix el valor actualitzat.

### Default Settings Modal i DefaultForm

- `DefaultSettingsModal` obrir un Dialog fullscreen que conté `<DefaultForm submit={open} />`.
- `DefaultForm` usa estat local per a tots els camps que es configuren amb sub-components (font, borders, textPosition, skin, hair, color, numberFont). El pattern és: `useState(initialValue)` → passar `state` i `setState` al component filho → a `handlerSubmit` construir el payload sencer i dispatch + guardar.
- El render condicional de sections segon un boolean del Redux (ex: `{numbered && (...)}`, `{color && (...)}`) és el pattern establert per mostrar/amagar configuradors.
- `pictogramGuide` és l'objecte `PictSequence` que es passa al `PictogramCard` del preview. Cal mantenir-lo sincronitzat amb tots els camps de settings que afecten el render.

### Traduccions

- Format dels JSON de languages: objecte amb claus `"id.del.missatge"` i valor array amb `[{ type: 0, value: "text" }]`.
- Les claus de missatge i les traduccions JSON han de coincidir exactament amb els `id` definits a `defineMessages` als `.lang.ts`.
- Tres fitxers: `ca.json`, `es.json`, `en.json`.

### Build i compilació

- Node es trova a `/usr/local/bin/node`. El compilador TypeScript es runa amb `/usr/local/bin/node node_modules/.bin/tsc --noEmit`.
- Hi ha errors pre-existents al repositori (path aliases, tests incomplets). Cal filtrar la sortida per verificar que els errors nous son els nostres amb grep.
- `test-utils.tsx` conté una mock de l'estat Redux completa. Quan s'afegeix un camp obligatori a un type de defaults, cal actualitzar-la aquí.
