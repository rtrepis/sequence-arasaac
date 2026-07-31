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

## Estàndard de configuracions (modal de settings per defecte)

Patró únic per a tots els tabs del `DefaultSettingsModal` (Usuari, Pictogrames, Vista, Vocabulari). Font única de veritat: `apps/web/src/components/SettingsLayout/`.

### Components compartits

- **`SettingsPanelLayout`** — layout canònic de dues zones: previsualització a **l'esquerra** (sticky en mòbil) + columna de controls a la dreta. Sense `preview`, la columna de controls queda centrada sola (cas del tab Usuari). Props: `preview?`, `maxWidth` (700 per defecte), `controlsGap`.
- **`SettingsPreviewFrame`** — marc visual únic de qualsevol previsualització: vora `divider`, `borderRadius: 1`, `boxShadow: 1`, `overflow: hidden`. Prop `background`: `"default"` (zona de treball, per defecte) o `"paper"` (mostra d'un sol Card, segons el patró de zones). Les dimensions les aporta el fill via `sx`.
- **`SectionTitle`** — **contenidor** de secció: props `title` (capçalera en majúscules `text.secondary` + `Divider`), `children` (els ajustos de la secció) i `onApplyAll?`. Els `children` es renderitzen **indentats** (`pl: SETTINGS_INDENT`) sota el títol, com un esquema: `<SectionTitle title={...}>{ajustos}</SectionTitle>`, no com a germans després del títol. És el nivell superior de la jerarquia de separació.
- **`SettingRow`** — **única implementació** de la fila d'un ajust individual: `title` a l'esquerra (amb `cardTitle`) i `children` (el control) a la dreta. Props: `title`, `labelId?` (per a `aria-labelledby`) i `control?`, que tria com es dimensiona el control:
  - `"sized"` (per defecte) — slider, select, textfield: amplada acotada amb `settingControlWidth`; apila en mòbil.
  - `"wide"` — grups de toggles: amplada segons contingut (`flexShrink: 0`, mai comprimit contra el títol); apila en mòbil.
  - `"compact"` — `Switch`, `InputColor`: **sempre en línia**, també en mòbil — apilar-los només malgastaria alçada, mai els falta amplada.

  **Mai reescriure aquest patró a mà** amb `Box sx={settingRowInline}` + `FormLabel`.

### Regles

- **Preview sempre a l'esquerra**, mai a la dreta. Un tab sense preview és una sola columna centrada (`maxWidth: 500`).
- **Amplada estàndard tauleta**: `SETTINGS_MAX_WIDTH` (900) és l'amplada màxima del panell centrat. No hardcodejar amplades noves.
- **Toggles = marca de la casa**: qualsevol selector d'opcions discretes usa `StyledToggleButtonGroup` (arrodonit 55×55, `primary` en seleccionat). Mai `ToggleButtonGroup` pla de MUI dins del modal de settings.
- **Criteri únic de fila**: tot ajust individual (slider, select, textfield, grup de toggles) porta el **títol a l'esquerra i el control a la dreta** (a partir de `sm`; vegeu *Comportament en mòbil*), sempre via `SettingRow`. `settingRowInline` és l'sx intern que hi ha a sota; `settingRow` (només padding vertical, sense flex) n'és la base. Cap dels dos s'aplica directament a una fila.
- **Un ajust = una fila**: mai amuntegar diversos controls en una sola fila. Un bloc amb 3 controls (una vora, una tipografia) és una **secció pròpia** amb 3 files, no una fila composta. Els components que representen un bloc així (`SettingCardBorder`, `SettingCardFontGroup`) **es titulen ells mateixos** renderitzant el seu propi `SectionTitle` — així els contextos que no els embolcallen (com `PictEditForm`) obtenen la mateixa presentació sense canvis.
- **Color/pes del títol de fila**: el títol d'un ajust individual sempre usa `cardTitle` (`SettingsCards.styled.ts` — fosc `text.primary`, `fontWeight: bold`). Ho aplica `SettingRow`. Mai el gris per defecte de `FormLabel` (`text.secondary`), que quedaria igual que el títol de secció. El títol de secció (`SectionTitle`) sempre és gris (`text.secondary`) i en majúscules — és l'únic nivell gris de la jerarquia.
- **Amplada del control (dreta)**: el control (select/slider/textfield) porta `settingControlWidth` (`settingsLayout.styled.ts`) — `max-width: 33%` del contenidor amb `min-width: SETTINGS_CONTROL_MIN_WIDTH` (150px) de seguretat perquè un `Slider` no quedi inusable. Ho aplica `SettingRow` amb `control="sized"`; els grups `StyledToggleButtonGroup` (`"wide"`), els `Switch` i l'`InputColor` (`"compact"`) en queden exempts — ja són compactes per si mateixos.
- **`ApplyAll` és de secció, no de fila**: «aplica a tots els pictogrames» va un sol cop al final de la secció, via `onApplyAll` de `SectionTitle`. Els `SettingCard*` **no** porten cap prop `onApplyAll` (excepte `SettingCardBorder`, que només la reenvia al seu `SectionTitle` intern).
- **Separació = només sota el títol de secció** (`settingsLayout.styled.ts`):
  1. `SectionTitle` agrupa un conjunt d'ajustos relacionats, amb un `Divider` **just sota el títol** (únic divisor visible).
  2. `SettingRow` dona ritme a cada fila; la separació entre files ve del `gap`, **sense divisors entre ajustos** (evita carregar visualment).
- **Espaiat unificat**: `SETTINGS_ROW_GAP` entre files, `SETTINGS_ZONE_GAP` entre les dues zones. No hardcodejar gaps nous.

### Comportament en mòbil

L'estàndard és **un de sol** per a totes les amplades: no hi ha components mòbils duplicats, només un breakpoint declarat. Tot es codifica a `settingsLayout.styled.ts`.

- **Breakpoint únic: `sm` (600px)** — `SETTINGS_MOBILE_BREAKPOINT`. Es tria `sm` i no `md` perquè `SettingsPanelLayout` ja apila les dues zones per sota de `md`: entre 600 i 900px la columna de controls ocupa tota l'amplada (~540px), prou perquè fins i tot el grup de cabell (7 toggles ≈ 399px) hi càpiga al costat del títol.
- **Fila apilada per sota de `sm`** — `settingRowInline` porta `flexDirection: { xs: "column", sm: "row" }`. El títol va a dalt i el control a sota. Això és l'excepció declarada a la regla de «títol-esquerra/control-dreta»: en pantalla estreta un grup de toggles llarg no hi cap mai, i val més un apilat predictible que un wrap accidental. **Excepció de l'excepció**: `control="compact"` (switch, mostra de color) no apila mai — sempre hi caben i apilar-los només afegiria scroll.
- **Control a amplada completa per sota de `sm`** — `settingControlWidth` porta `width: { xs: "100%" }` i `minWidth: { xs: 0 }`. El mínim de seguretat de 150px només té sentit quan el control comparteix línia amb el títol.
- **Indentació reduïda** — `SETTINGS_INDENT` és `{ xs: 1, sm: 3 }`. Recupera 16px d'amplada útil per fila sense perdre la lectura d'esquema en escriptori.
- **Els toggles no es redueixen** — els 55×55 de `StyledToggleButtonGroup` són ≥44px, el mínim WCAG de diana tàctil. En mòbil el grup ocupa tota l'amplada i els botons flueixen en dues files (`flexWrap` ja present al styled).
- **Preview acotat i sota l'AppBar** — a `SettingsPanelLayout`, el preview sticky porta `top: SETTINGS_APPBAR_OFFSET` (l'AppBar del diàleg és `position: fixed` per sota de `md`) i `maxHeight: 35vh` amb `overflow: auto`, perquè la mostra no deixi els controls fora de vista.
- **La fila és universal, el layout és per context** — `SettingRow` i les regles d'aquesta secció s'apliquen a *qualsevol* configuració de l'app (modal de settings, `PictEditForm`, panell de vista). `SettingsPanelLayout` és **exclusiu del modal de settings**; els contextos amb un layout responsive propi — com la graella `xs: "1fr"` / `md: "0.5fr 1.5fr"` de `PictEditForm` — el conserven.

### Estat de migració

- ✅ **Vista** (`ViewSettingsPanel`) — totes les files via `SettingRow`.
- ✅ **Usuari** (`UserSettingsPanel`) — `SectionTitle` + `SettingRow` (idioma app, idioma cerca, tema).
- ✅ **Pictogrames** (`DefaultForm`) — `SettingsPanelLayout` + `SettingsPreviewFrame background="paper"` + **7 seccions**: Pictograma, Text i numeració, Lletra del text, Lletra dels números (si `numbered`), Vora exterior, Vora interior, Aparença (si `color`). Les 4 últimes es titulen soles des del propi card.
- ✅ **Vocabulari** (`VocabularySettingsPanel`) — preview a l'esquerra amb `SettingsPreviewFrame`; 2 seccions (Paraula, Pictograma).
- ✅ **Família `SettingCard`** — tots migrats a `SettingRow`. `card`, `cardAction` i `cardContent` **eliminats** de `SettingsCards.styled.ts`; només hi queden `cardTitle` (consumit per `SettingRow`) i `cardColor`.
- ✅ **`PictEditForm`** i **`VocabularySettingsPanel`** — hereten la fila nova pels components compartits, sense tocar el seu layout propi (regla «la fila és universal, el layout és per context»).
- ✅ **`GlobalViewControls`** — totes les files (mida pàgina, orientació, separació seqüències, direcció) via `SettingRow`. Component **compartit** amb la pàgina de visualització (`ViewSquenceSettings`); verificat visualment als dos llocs. **Només files**: no renderitza ni seccions ni botons d'acció — qui el consumeix decideix el `SectionTitle` que l'embolcalla i on van els botons.
- ✅ **`SequenceControlsPanel`** (ajustos per seqüència, dins la pàgina de vista) — «Aplica a totes» és un `SettingRow control="compact"`; dins de cada acordió, mida, separació i alineacions H/V són `SettingRow` amb `StyledToggleButtonGroup`. L'acordió és pla (`elevation={0}`, sense la línia superior de MUI): el `Divider` del `SectionTitle` ja separa la secció.
- ✅ **`PrintFooterSection`** — l'autor de la seqüència té **secció pròpia** («Peu d'impressió») i va **sempre l'últim**, tant a la columna de la pàgina de vista com al tab Vista del modal. El motiu: és l'únic ajust que no canvia res a pantalla — només surt al peu del full imprès i del PDF (`CopyRight`, `@media print`). Per això el títol de secció diu on apareix, en comptes d'un genèric «Autoria».
- ✅ **Columna de configuració de la pàgina de vista** (`ViewSquenceSettings`) — 3 seccions: *Format de pàgina* (`GlobalViewControls`), *Seqüències* (`SequenceControlsPanel`) i *Peu d'impressió* (`PrintFooterSection`). El botó «Restaura per defecte» va **després de totes**, perquè restaura tant els ajustos globals com els de cada seqüència. Amplada de la columna: `VIEW_SETTINGS_COLUMN_WIDTH` (350px, a `ViewSequenceSettings.styled.ts`) — a 300px fins i tot els grups de toggles es partien; a 350 les files curtes i els toggles van en línia i només els títols llargs («Espai de pictogrames») es parteixen, perquè el mínim de 150px del control mana per damunt del `max-width: 33%`.

---

## Estàndard de tabs (icona + text)

Font única de veritat: `apps/web/src/components/AppTabs/`. Cobreix els tabs d'edició/visualització (`TabsEditView`) i els del modal de configuracions (`DefaultSettingsDialog`).

### Component compartit

- **`AppTab`** — l'única manera de declarar un tab amb icona i text. Props: `label` (string **ja traduït**, no un node), `icon`, més tot el que accepta `Tab` (`value`, `component`, `to`…). Aplica `iconPosition="start"`, els estils responsius i l'`aria-label`. **Mai declarar un `<Tab>` de MUI amb `label={<Typography>…</Typography>}` a mà.**
- **`tabsStyled`** — estils del contenidor `Tabs` sobre la NavBar verda (indicador i colors derivats de `primary.contrastText`). Viu a `appTabs.styled.ts`, **no** a la carpeta de cap component consumidor.

### Regla d'icona i text

- **Per sobre de `sm` (600px)**: icona + text en línia, com fins ara.
- **Per sota de `sm`**: **només el tab seleccionat conserva el text**; la resta queden en icona. Sempre hi ha, doncs, un text visible que diu on ets, sense malgastar amplada amb els tabs on no ets. **Criteri únic per a tots els tabs de l'app** — barra de navegació i modal de configuracions es comporten igual; `AppTab` no té cap prop per variar-ho.
- **L'`aria-label` és sempre present** amb el text traduït — el tab no perd mai el seu nom accessible encara que el text no sigui visible, cosa crítica en una app d'AAC.
- **Res d'encapçalaments duplicats dins el panell**: el nom del tab actiu el diu el propi tab, no un `h2` a sobre del contingut. Un títol repetit a cada panell és soroll en una pantalla on l'alçada és el recurs escàs.
- **Els contenidors amb 3 tabs o més van `variant="scrollable"` amb `scrollButtons="auto"`** (cas de `DefaultSettingsDialog`): en mòbil el tab actiu amb text pot desbordar la barra, i les fletxes apareixen només on hi ha ratolí (MUI les amaga en tàctil, on ja hi ha swipe).
- **El valor del tab es deriva de l'estat real, no d'estat local**: `TabsEditView` calcula el tab actiu des de `useLocation()`. Amb `useState` inicialitzat a un valor fix, recarregar `/view-sequence` marcaria «Editar» — i com que el tab actiu és l'únic amb text en mòbil, l'error seria doblement desorientador.
- **Mai fer servir `Tooltip` per portar el text del tab en mòbil**: en tàctil només s'obre amb long-press (~700 ms), no és descobrible, xoca amb el menú contextual del sistema i es tanca sol. El tooltip és un ajut d'escriptori, mai l'única via al text.
- **Res de text apilat sota la icona**: «Pictogrames» i «Vocabulari» no hi caben en un tab estret i acabarien truncats, i el tab creixeria en alçada empenyent l'AppBar de 42px.
- **El breakpoint és `APP_TAB_LABEL_BREAKPOINT` (`sm`)**, el mateix de l'estàndard de configuracions. No multiplicar ruptures.
- **L'amagada és per CSS**, no per `useMediaQuery`: així el layout no depèn d'un render de JavaScript ni fa flash en carregar.
- **Tot l'ajust responsiu va dins d'un `theme.breakpoints.down(sm)`**, mai amb objectes `{ xs: …, sm: … }`. Per sobre del breakpoint el tab ha de conservar **intactes** les mides natives de MUI. En particular, **mai declarar `fontSize: "inherit"` per a escriptori**: el tab heretaria l'`1.75rem` del `Toolbar` de `BarNavigation` (i el `1rem` del body al diàleg) en lloc del seu `0.875rem`, i tant la icona com el text es veurien desmesurats. Per això `appTabSx` i `appTabLabelSx` són funcions de `theme`, no objectes.
- **Diana tàctil**: en `xs` el tab sense text baixa a `minWidth: 48` (el mínim WCAG de diana tàctil, no menys) i la icona creix a `1.4rem` per compensar la pèrdua del text. El tab seleccionat, que sí que mostra text, recupera les mides normals.
- **El títol de la barra cedeix abans que els tabs**: a `DefaultSettingsDialog` el títol «Configuracions» s'amaga en `xs` (`display: { xs: "none", sm: "block" }`) i el nom del diàleg passa a l'`aria-label` del `Dialog`.
- **Marca curta en mòbil**: el `h1` de `BarNavigation` mostra `APP_SHORT_NAME` (**«SqAAC»**) per sota de `sm` i «SequenciAAC» a partir de `sm`, amb l'`aria-label` del `h1` sempre amb el nom sencer. **No fer servir «SAAC» sol com a nom curt**: és el terme genèric del sector (Sistemes Augmentatius i Alternatius de Comunicació) i es llegiria com a categoria, no com a marca; «SqAAC» conserva l'arrel del nom propi.

### Estat de migració

- ✅ **`TabsEditView`** — 2 tabs (Editar/Vista) via `AppTab`; valor derivat de `useLocation()`.
- ✅ **`DefaultSettingsDialog`** — 4 tabs declarats a l'array `SETTINGS_TABS` (valor + icona + missatge) i renderitzats amb `map`, dins d'un `Tabs` scrollable.
- ➖ **`TabsSequences`** — fora d'aquest estàndard: els seus tabs són números de seqüència, sense icona ni text traduïble; té la seva pròpia branca `isMobile` (horitzontal scrollable).

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
