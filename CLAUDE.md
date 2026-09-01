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
- El `secondary` són grisos amb matís verd (`main: #E3E8DC`) amb text fosc — mateixa lògica que el primary. **És un fons, mai una tinta**: `color="secondary"` en una icona la deixa a **1,15:1** sobre el full, que és el mateix que no dibuixar-la. Hi van caure els botons d'afegir pictograma i d'afegir seqüència, que són les dues accions amb què comença tot el que es fa a l'app.
- **El verd no és mai color de text ni d'icona.** `primary.main` sobre el paper de configuració o sobre el full es queda a **2,1:1**, quan el mínim és 4,5:1 per a text i 3:1 per a una icona. Un botó de text, un `outlined` o un botó només-icona porten `color="inherit"` (la tinta del tema); el verd només hi va quan **la superfície és verda** i el que hi ha a sobre és `primary.contrastText`, o dins d'un botó `contained`. Els botons només-icona es declaren amb **`StyledIconButton`** (`style/StyledIconButton.ts`), que hi posa la cantonada de la casa i la diana tàctil mínima (`APP_TOUCH_TARGET_MIN`), però **no** el color.
- **Mai hardcodejar colors** (`"green"`, `"whitesmoke"`, hex, rgba...) a components o styled: usar `theme.palette.*` (a `styled` amb `({ theme }) => ...`) o strings de tema a `sx` (`"primary.main"`, `"primary.contrastText"`).
- Per a tints/transparències derivar del tema amb `alpha(theme.palette..., x)` de `@mui/material`.
- Els botons i controls (Button, ToggleButton, etc.) es basen en `color="primary"` (el default del tema); dins la NavBar, `color="inherit"`.
- **Excepció**: els colors semàntics de pictogrames (`fitzgeraldColors.ts`, `inputColorList.ts`) són contingut, no UI — no s'han de tocar.

### Patró de zones (fons)

Hi ha **tres** superfícies, no dues:

- **`sheetSurface` = superfície de full** (`palette.ts`): **blanc en tots dos temes**. És tota zona on es veu un pictograma — targetes de `PictogramCard`, full de `.preview-container`, fullscreen i mostres de configuració. **El que es veu és el que s'imprimeix**: mateixos colors a pantalla, a paper i al PDF, sense compensacions per tema. Surt de `printColors.background` a propòsit: full i paper són la mateixa cosa.
- **`background.default` = escriptori** (el fons sobre el qual sura el full): blanc en clar, negre en fosc.
- **`background.paper` = zona de configuració** (diàlegs, panells, acordions, controls): gris verdós (`#F2F5EC` clar / `#242820` fosc).
- Valors definits a `appBackgrounds` de `palette.ts`. L'overlay d'elevació de MUI està desactivat (`MuiPaper: backgroundImage: none`) perquè el gris de config sigui uniforme.
- **Mai adaptar al tema res que estigui sobre el full**: ni el color de lletra triat per l'usuari, ni el traç dels pictogrames. El tema fosc governa només el que envolta el full (barra, tabs, panells, controls). El motiu és d'accessibilitat: el contrast del text sobre paper s'ha de poder jutjar mentre es configura, no en descobrir-lo a la impressora.
- `SettingsPreviewFrame` amb `background="default"` és superfície de full (`ViewSettingsPreview`). **Excepció**: la mostra de `DefaultForm` i la de `VocabularySettingsPanel` són un sol Card sobre el panell i usen `background="paper"` — el card ja és blanc i el gris li fa de passe-partout perquè no es fongui amb el marc.
- Al modal d'edició de pictograma (`PictEditForm`), la part superior (mostra + cerca) és escriptori i la targeta hi sura a sobre; només el `SettingAccordion` de sota és zona de configuració.

### Impressió i PDF

- **La sortida impresa i el PDF sempre són en clar** (paper blanc, text fosc), independentment del tema actiu. Tokens a `printColors` de `palette.ts`.
- Impressió (`window.print`): `generatePrintCSS` a `usePrintStyles.ts` força fons blanc al `body`, `.preview-container`, `.preview-content` i els `MuiPaper` interiors. Ara és **xarxa de seguretat**, no correcció: les superfícies de full ja són blanques a pantalla. Els pictogrames conserven regles `@media print` pròpies només per a la mida de lletra (`PictogramCard`).
- PDF (`useDownloadPdf.ts`): al clon de html2canvas es normalitzen els colors de tema amb `themeColorReplacements` (fons d'`appBackgrounds` → blanc, text blanc → negre). Els colors de contingut de l'usuari (font, vores, fitzgerald) no es toquen.
- El pictograma **sense color** (B/N) **no s'inverteix mai**: com que la targeta sempre és paper blanc, el traç negre es veu igual en clar, en fosc, a paper i al PDF. Les compensacions que hi havia per al mode fosc (`filter: invert(1)` a `pictogram__media`, `getDisplayColor` per al color de lletra, i les regles que les desfeien a `@media print` i al `safetyStyle` del PDF) s'han eliminat: amb una sola superfície de full ja no hi ha res a compensar.

---

## Estàndard de configuracions (modal de settings per defecte)

Patró únic per a tots els tabs del `DefaultSettingsModal` (Usuari, Pictogrames, Vista, Vocabulari). Font única de veritat: `apps/web/src/components/SettingsLayout/`.

### Components compartits

- **`SettingsPanelLayout`** — layout canònic de dues zones: previsualització a **l'esquerra** (sticky en mòbil) + columna de controls a la dreta. Sense `preview`, la columna de controls queda centrada sola (cas del tab Usuari). Props: `preview?`, `previewAside?`, `maxWidth` (700 per defecte), `controlsGap`. **`previewAside` és el que acompanya la mostra sense ser mostra** (llistes llargues, com el vocabulari desat): viu a la columna esquerra però queda **en flux normal**, sense enganxar-se ni compartir el límit d'alçada de la mostra. Una llista dins de `preview` obligaria a acotar-la i generaria un scroll intern minúscul dins d'un bloc enganxat: dos scrolls competint en una pantalla de mòbil.
- **`SettingsPreviewFrame`** — marc visual únic de qualsevol previsualització: vora `divider`, `borderRadius: 1`, `boxShadow: 1`, `overflow: hidden`. Prop `background`: `"default"` (superfície de full, blanca en tots dos temes; per defecte) o `"paper"` (mostra d'un sol Card, segons el patró de zones). Les dimensions les aporta el fill via `sx`.
- **`SettingsActions`** — **única manera** de posar els botons d'acció d'un panell:
  van **al final de tot i a la dreta**, perquè afecten tot el que hi ha a sobre.
  Mateix criteri que el peu d'un diàleg (`AppDialogActions`): la secundària en text i
  `color="inherit"` a l'esquerra de la principal, que és `contained`; el que no és ni
  acceptar ni cancel·lar va sol a l'esquerra (`startAction`). L'explicació del que fan
  va a `helper`, **sota** la fila, no al costat d'un botó: si no, la fila deixa de
  tenir el mateix ordre que la d'un diàleg. Tots els botons són `StyledButton`.
  Amb `floatingClearance`, la fila reserva a la dreta l'amplada del botó flotant:
  cal allà on el panell viu dins de la finestra amb el botó a sobre —la columna
  de la pàgina de vista, que acaba al mateix racó—, no dins d'un diàleg que el tapa.
- **`SettingsPanelHint`** — guia d'un tab: `Alert severity="info" variant="outlined"` amb el text que diu **què s'ajusta aquí i sobre què tindrà efecte**. Un sol fill: el missatge traduït.
- **`SectionTitle`** — **contenidor** de secció: props `title` (capçalera en majúscules `text.secondary` + `Divider`), `children` (els ajustos de la secció) i `onApplyAll?`. Els `children` es renderitzen **indentats** (`pl: SETTINGS_INDENT`) sota el títol, com un esquema: `<SectionTitle title={...}>{ajustos}</SectionTitle>`, no com a germans després del títol. És el nivell superior de la jerarquia de separació.
- **`SettingRow`** — **única implementació** de la fila d'un ajust individual: `title` a l'esquerra (amb `cardTitle`) i `children` (el control) a la dreta. Props: `title`, `labelId?` (per a `aria-labelledby`) i `control?`, que tria com es dimensiona el control:
  - `"sized"` (per defecte) — slider, select, textfield: amplada acotada amb `settingControlWidth`; apila en mòbil.
  - `"wide"` — grups de toggles: amplada segons contingut (`flexShrink: 0`, mai comprimit contra el títol); apila en mòbil.
  - `"compact"` — `Switch`, `InputColor`: **sempre en línia**, també en mòbil — apilar-los només malgastaria alçada, mai els falta amplada.

  **Mai reescriure aquest patró a mà** amb `Box sx={settingRowInline}` + `FormLabel`.
- **`IconToggleButton`** — **única manera** de declarar un botó només-icona dins d'un
  `StyledToggleButtonGroup`. Pren **un sol** `message` (un `MessageDescriptor`) i en deriva el
  `Tooltip` i l'`aria-label`. Mai escriure `<Tooltip title={intl.formatMessage(x)}><ToggleButton
  aria-label="left">`: amb dues fonts, el text traduït i el nom accessible se separen i el segon
  acaba en anglès (era la troballa C5 del backlog). Funciona sense reenviar cap prop perquè el
  `ToggleButtonGroup` de MUI v6 passa la selecció per **context**, no clonant els fills.

### Regles

- **Preview sempre a l'esquerra**, mai a la dreta. Un tab sense preview és una sola columna centrada (`maxWidth: 500`).
- **Amplada estàndard tauleta**: `SETTINGS_MAX_WIDTH` (900) és l'amplada màxima del panell centrat. No hardcodejar amplades noves.
- **Tot tab comença amb la seva guia**: `SettingsPanelHint` és el **primer fill de la columna de controls**, abans de la primera secció, a tots els tabs sense excepció. Format únic (mai un `Typography` solt ni un `Alert` escrit a mà) perquè l'usuari trobi sempre l'explicació al mateix lloc i amb el mateix aspecte. El text respon a què configura el tab i sobre què tindrà efecte; si el panell té estats (crear/editar), el text **canvia amb l'estat** — és la manera de dir on ets sense afegir cap encapçalament (cas del tab Vocabulari).
- **El verd no és mai color de text**: un `Button` de text o `outlined` sense `color`
  pinta l'etiqueta amb `primary.main`, i sobre el paper de configuració es queda a
  **2,1:1** (F11 de l'estàndard de capes flotants). Tot botó que no sigui `contained`
  porta `color="inherit"`; el verd només al botó ple, on va amb `primary.contrastText`.
- **El contingut no s'enganxa a la barra**: el panell arrenca a `SETTINGS_CONTENT_TOP_GAP`
  de la barra superior del diàleg, i per sota de `md` —on l'`AppBar` és `fixed` i no
  ocupa lloc— el buit que la compensa fa exactament `SETTINGS_DIALOG_APPBAR_HEIGHT`.
  Amb els 40 px que hi havia, el primer element començava a sis píxels de la barra.
- **Toggles = marca de la casa**: qualsevol selector d'opcions discretes usa `StyledToggleButtonGroup` (arrodonit 55×55, `primary` en seleccionat). Mai `ToggleButtonGroup` pla de MUI dins del modal de settings.
- **Tot control ha de tenir nom accessible, i ha de sortir del títol de la seva fila**: `SettingRow` posa l'`id` que se li passa a `labelId` al `FormLabel`; el control l'ha de recollir. Un `Select` ho fa amb la seva prop **`labelId`** —**mai** amb `inputProps={{ "aria-labelledby": … }}`, que deixa el nom a l'`<input>` natiu amagat i no al `div[role="combobox"]`, l'element que llegeix i clica tothom—; un `Slider`, amb `aria-labelledby`; un `TextField`, amb `inputProps` (allà l'`<input>` sí que és el control). Sense això el control arriba com un «combobox» que llegeix el valor però no diu de què és.
- **Un `Tooltip` sobre un botó *amb text* porta `describeChild`**: amb un títol de text, MUI el posa com a `aria-label` del fill i **tapa l'etiqueta visible**. El nom accessible passaria a ser el tooltip, que no conté el text del botó (WCAG 2.5.3 «Label in Name», i qui fa servir control per veu no pot dir el que llegeix). Amb `describeChild` el tooltip és `aria-describedby` i el botó conserva el seu text. **No** aplica als botons només-icona (`IconToggleButton`, els d'afegir/treure seqüència): allà el tooltip **és** el nom.
- **Restaurar per defecte es diu sempre «Restaura [àmbit]»**: mateix verb a tot arreu, l'àmbit distingeix (`el pictograma` / `els pictogrames` / `la vista` / `les seqüències`) i el **tooltip diu a quins valors torna** — els de fàbrica o els que l'usuari té desats. És l'única diferència real entre els quatre botons i no pot viure en quatre verbs diferents.
- **Les preferències d'usuari només es desen quan l'usuari ho demana.** Cap ajust d'una pàgina de
  treball dispara `saveUserUiThunk` per si sol: el thunk envia **tota** la configuració (idioma,
  tema, vista, pictogrames i el vocabulari sencer amb les imatges) al compte o al `localStorage`, i
  ningú ha demanat res d'això movent un control. A la pàgina de vista, els canvis només es
  reflecteixen a `ui.viewSettings` —mirall de sessió, perquè anar a Edició i tornar conservi el
  format— i el desat de veritat el fa el botó «Desa com a preferències», via `useSaveUiSettings`
  (reintent, snackbar i `SettingsSaveErrorDialog`). Fins a la branca `claude/user-preferences-resize`
  ho feia un `onBlur` al `<form>` de tota la columna: com que `onBlur` és `focusout` i **puja**,
  qualsevol control que perdia el focus —els botons d'imprimir inclosos— enviava la configuració
  sencera, en silenci i despertant Render.
- **Un botó que restaura llegeix d'una instantània, mai del selector viu**: si l'estat que restaura
  també és el que s'hi escriu mentre es treballa, el botó torna als valors que l'usuari acaba de
  tocar i sembla que no faci res. `ViewSquenceSettings` en guarda una `useRef` en muntar i només
  l'avança quan es desen les preferències.
- **Criteri únic de fila**: tot ajust individual (slider, select, textfield, grup de toggles) porta el **títol a l'esquerra i el control a la dreta** (a partir de `sm`; vegeu *Comportament en mòbil*), sempre via `SettingRow`. `settingRowInline` és l'sx intern que hi ha a sota; `settingRow` (només padding vertical, sense flex) n'és la base. Cap dels dos s'aplica directament a una fila.
- **La fila no es parteix mai; el que es parteix és el títol**: `settingRowInline` va
  amb `flexWrap: nowrap`. Amb `wrap`, el navegador reparteix els elements per línies
  mirant l'amplada que **voldrien** tenir, abans de deixar-los encongir: a la columna
  de la pàgina de vista, que dona 289 px útils per fila, «Espai de pictogrames» (194)
  amb el seu control (150) no hi cabia i el control queia sota el títol, mentre que
  «Mida» (43) es quedava al costat. La columna sortia irregular, i canviava sola en
  canviar d'idioma o quan un control creixia. Sense `wrap`, l'encongiment sí que
  s'aplica: el títol es reparteix en dues línies i el control es queda sempre al
  mateix lloc.
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
- **Preview acotat i sota l'AppBar** — a `SettingsPanelLayout`, el preview sticky porta `top: SETTINGS_APPBAR_OFFSET` (l'AppBar del diàleg és `position: fixed` per sota de `md`) i `maxHeight: SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT` (35vh) amb `overflow: auto`, perquè la mostra no deixi els controls fora de vista. L'acotació val **sempre per a la mostra**; el que no s'acota mai és la llista de `previewAside`, que queda en flux i es llegeix amb l'scroll de la pàgina.
- **L'offset és exactament l'alçada de la barra, i l'aire va per dins** — amb un `top` més gran que la barra, el contingut que passa per darrere de la mostra enganxada s'entreveu per la franja que queda entre les dues. La separació es fa amb el `padding` de dins de la caixa enganxada, que sí que va pintada.
- **Amb `previewAside`, en mòbil la zona esquerra és `display: contents`** — un `sticky` només s'enganxa mentre el seu **pare** és a la vista, i el pare era la columna esquerra, tan alta com la llista: amb el vocabulari buit, la mostra se n'anava amunt tot just començar a baixar, justament quan es toquen la pell i el cabell que ha d'ensenyar. Sense caixa, els fills passen a penjar del panell sencer i la mostra es queda visible mentre s'omple el formulari. Per això tant la mostra com la llista porten `width: 100%` en mòbil: sense caixa que les estiri, l'`alignItems: flex-start` del panell les encongiria al contingut.
- **La zona sticky sempre és opaca** — `bgcolor: "background.paper"`, el gris de la zona de configuració. Un bloc enganxat transparent deixa veure els controls passant-hi per sota i el text sembla flotar sobre la mostra. El fons coincideix amb el del panell, així que no s'hi veu cap costura.
- **La mostra ocupa tota l'amplada en mòbil i se centra a dins** — el contenidor de la mostra va a `width: 100%` amb el contingut centrat per `flex`, no a l'amplada del contingut. L'`alignItems="flex-start"` de la zona (necessari en escriptori) faria encongir la zona al contingut i deixaria el pictograma arrambat a l'esquerra de la pantalla; i un fons opac més estret que la pantalla no taparia el que passa per sota.
- **La fila és universal, el layout és per context** — `SettingRow` i les regles d'aquesta secció s'apliquen a *qualsevol* configuració de l'app (modal de settings, `PictEditForm`, panell de vista). `SettingsPanelLayout` és **exclusiu del modal de settings**; els contextos amb un layout responsive propi — com la graella `xs: "1fr"` / `md: "0.5fr 1.5fr"` de `PictEditForm` — el conserven.

### Estat de migració

- ✅ **Vista** (`ViewSettingsPanel`) — totes les files via `SettingRow`; els botons, via `SettingsActions`.
- ✅ **Usuari** (`UserSettingsPanel`) — `SectionTitle` + `SettingRow`: idiomes, tema, **Imatges**
  (qualitat de pujada, també sense compte: mana sobre el pes de l'esborrany i sobre el que
  s'imprimeix) i **L'espai del teu compte** (comptadors + llistat d'imatges), aquesta última
  només amb sessió.
- ✅ **Pictogrames** (`DefaultForm`) — `SettingsPanelLayout` + `SettingsPreviewFrame background="paper"` + **7 seccions**: Pictograma, Text i numeració, Lletra del text, Lletra dels números (si `numbered`), Vora exterior, Vora interior, Aparença (si `color`). Les 4 últimes es titulen soles des del propi card.
- ✅ **Vocabulari** (`VocabularySettingsPanel`) — columna esquerra = mostra (`preview`: `SettingsPreviewFrame` amb el pictograma centrat) + **llista de paraules desades** (`previewAside`: `WordProfileList`, amb la miniatura del pictograma de cada paraula); columna dreta = formulari clàssic (guia, secció Paraula, secció Pictograma) amb els botons **al final i a la dreta**. Triar una paraula de la llista carrega el formulari en mode edició: la guia canvia, la fila queda seleccionada amb el distintiu «Editant» i els botons passen a «Cancel·lar / Actualitzar». Desar, actualitzar i esborrar confirmen amb `showSnackbar`. Reanomenar mentre s'edita mou la paraula (esborra l'antiga) i bloqueja el desat si el nom nou ja existeix.
- ✅ **Família `SettingCard`** — tots migrats a `SettingRow`. `card`, `cardAction` i `cardContent` **eliminats** de `SettingsCards.styled.ts`; només hi queden `cardTitle` (consumit per `SettingRow`) i `cardColor`.
- ✅ **`PictEditForm`** i **`VocabularySettingsPanel`** — hereten la fila nova pels components compartits, sense tocar el seu layout propi (regla «la fila és universal, el layout és per context»).
- ✅ **`GlobalViewControls`** — totes les files (mida pàgina, orientació, separació seqüències, direcció) via `SettingRow`. Component **compartit** amb la pàgina de visualització (`ViewSquenceSettings`); verificat visualment als dos llocs. **Només files**: no renderitza ni seccions ni botons d'acció — qui el consumeix decideix el `SectionTitle` que l'embolcalla i on van els botons.
- ✅ **`SequenceControlsPanel`** (ajustos per seqüència, dins la pàgina de vista) — «Aplica a totes» és un `SettingRow control="compact"`; dins de cada acordió, mida, separació i alineacions H/V són `SettingRow` amb `StyledToggleButtonGroup`. L'acordió és pla (`elevation={0}`, sense la línia superior de MUI): el `Divider` del `SectionTitle` ja separa la secció.
- ✅ **`PrintFooterSection`** — l'autor de la seqüència té **secció pròpia** («Peu d'impressió») i va **sempre l'últim**, tant a la columna de la pàgina de vista com al tab Vista del modal. El motiu: és l'únic ajust que no canvia res a pantalla — només surt al peu del full imprès i del PDF (`CopyRight`, `@media print`). Per això el títol de secció diu on apareix, en comptes d'un genèric «Autoria».
- ✅ **Columna de configuració de la pàgina de vista** (`ViewSquenceSettings`) — 3 seccions: *Format de pàgina* (`GlobalViewControls`), *Seqüències* (`SequenceControlsPanel`) i *Peu d'impressió* (`PrintFooterSection`). Els dos botons van **després de totes**, perquè afecten totes les seccions: «Restaura les seqüències» (text) torna als valors desats i «Desa com a preferències» (contained) hi desa els actuals. El tooltip del segon diu on van a parar —al compte amb sessió, en aquest navegador sense—, que és l'única cosa que canvia entre els dos casos i no es pot descobrir després de prémer. Amplada de la columna: `VIEW_SETTINGS_COLUMN_WIDTH` (350px, a `ViewSequenceSettings.styled.ts`) — a 300px fins i tot els grups de toggles es partien; a 350 les files curtes i els toggles van en línia i només els títols llargs («Espai de pictogrames») es parteixen, perquè el mínim de 150px del control mana per damunt del `max-width: 33%`.

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
- **El valor del tab es deriva de l'estat real, no d'estat local**: `TabsEditView` calcula el tab actiu des de `useLocation()`. Amb `useState` inicialitzat a un valor fix, recarregar `/view-sequence` marcaria «Edició» — i com que el tab actiu és l'únic amb text en mòbil, l'error seria doblement desorientador.
- **Mai fer servir `Tooltip` per portar el text del tab en mòbil**: en tàctil només s'obre amb long-press (~700 ms), no és descobrible, xoca amb el menú contextual del sistema i es tanca sol. El tooltip és un ajut d'escriptori, mai l'única via al text.
- **Res de text apilat sota la icona**: «Pictogrames» i «Vocabulari» no hi caben en un tab estret i acabarien truncats, i el tab creixeria en alçada empenyent l'AppBar de 42px.
- **El breakpoint és `APP_TAB_LABEL_BREAKPOINT` (`sm`)**, el mateix de l'estàndard de configuracions. No multiplicar ruptures.
- **L'amagada és per CSS**, no per `useMediaQuery`: així el layout no depèn d'un render de JavaScript ni fa flash en carregar.
- **Tot l'ajust responsiu va dins d'un `theme.breakpoints.down(sm)`**, mai amb objectes `{ xs: …, sm: … }`. Per sobre del breakpoint el tab ha de conservar **intactes** les mides natives de MUI. En particular, **mai declarar `fontSize: "inherit"` per a escriptori**: el tab heretaria l'`1.75rem` del `Toolbar` de `BarNavigation` (i el `1rem` del body al diàleg) en lloc del seu `0.875rem`, i tant la icona com el text es veurien desmesurats. Per això `appTabSx` i `appTabLabelSx` són funcions de `theme`, no objectes.
- **Diana tàctil**: en `xs` el tab sense text baixa a `minWidth: 48` (el mínim WCAG de diana tàctil, no menys) i la icona creix a `1.4rem` per compensar la pèrdua del text. El tab seleccionat, que sí que mostra text, recupera les mides normals.
- **El títol de la barra cedeix abans que els tabs**: a `DefaultSettingsDialog` el títol «Configuracions» s'amaga en `xs` (`display: { xs: "none", sm: "block" }`) i el nom del diàleg passa a l'`aria-label` del `Dialog`.
- **Un destí es diu amb un nom; una acció, amb un verb**: els tabs i els ítems de navegació que
  porten a un lloc són noms (**Edició** · **Vista**, i al drawer Inici · Novetats · Configuració);
  els ítems que obren un diàleg i fan alguna cosa són verbs (Descarrega · Carrega). Els quatre tabs
  del modal de configuracions són noms per la mateixa raó. El motiu és l'amagada d'etiquetes en
  mòbil: com que el tab seleccionat és l'únic amb text, aquell text diu **on ets**, no què pots fer,
  i un infinitiu sol es llegeix com una acció pendent. **La regla s'aplica per idioma, no traduint
  mecànicament**: en anglès i en italià el terme estàndard del menú ja és «Edit» i «Modifica», i
  forçar-hi un nom seria pitjor.
- **Marca curta en mòbil**: el `h1` de `BarNavigation` mostra `APP_SHORT_NAME` (**«SqAAC»**) per sota de `sm` i «SequenciAAC» a partir de `sm`, amb l'`aria-label` del `h1` sempre amb el nom sencer. **No fer servir «SAAC» sol com a nom curt**: és el terme genèric del sector (Sistemes Augmentatius i Alternatius de Comunicació) i es llegiria com a categoria, no com a marca; «SqAAC» conserva l'arrel del nom propi.

### Estat de migració

- ✅ **`TabsEditView`** — 2 tabs (Edició/Vista) via `AppTab`; valor derivat de `useLocation()`.
  Les etiquetes surten de `@shared/messages/navigation.lang`, **compartides amb el drawer**: el
  mateix destí no es pot dir de dues maneres segons per on s'hi arriba (era B4 del backlog).
- ✅ **`DefaultSettingsDialog`** — 4 tabs declarats a l'array `SETTINGS_TABS` (valor + icona + missatge) i renderitzats amb `map`, dins d'un `Tabs` scrollable.
- ➖ **`TabsSequences`** — fora d'aquest estàndard: els seus tabs són números de seqüència, sense icona ni text traduïble; té la seva pròpia branca `isMobile` (horitzontal scrollable).

---

## Estàndard de feedback d'operacions

Font única de veritat: `context/FeedbackContext/`. Quatre mecanismes i un criteri per triar-los —
**quant de temps dura l'operació i què pot fer l'usuari mentrestant**, mai «com d'important és».

| Mecanisme | Quan | Precedents |
|---|---|---|
| **Backdrop amb missatge + snackbar al final** | L'operació **impedeix seguir treballant** (bloqueja el fil principal o l'app no té sentit fins que acabi) | desa i carrega al núvol, i carrega `.saac` (`AppNavigationDrawer`), genera el PDF (`useDownloadPdf`) |
| **Snackbar sol** | Final d'acció instantània, èxit i error | descarrega `.saac`, `ApplyAll`, vocabulari, esborrany |
| **Progress determinat** | Hi ha **N passos comptables** | `useSequentialSearch` (N paraules) |
| **Spinner al botó + `aria-busy`** | El botó és l'únic que canvia i **l'app segueix viva** | `UploadImageButton` |

Regles:

- **Tota acció que l'usuari ha demanat acaba amb un missatge**, tant si va bé com si no. L'estat
  final no pot ser idèntic a l'inicial: la confirmació del navegador (barra de descàrregues) no
  compta, perquè a iPadOS gairebé no existeix.
- **El feedback viu al hook, no al component**, quan l'operació té hook propi (`useSaveUiSettings`,
  `useDocumentDraft`, `useDownloadPdf`): el hook crida `useFeedback()` i porta el seu `.lang.ts`.
- **El missatge del backdrop és concret, mai un «Carregant…» genèric**: si el servidor de Render
  dorm o la captura triga, aquell text pot ser l'únic que l'usuari tingui davant durant mig minut.
- **L'error porta el codi visible** (`{code}`) i dura més que una confirmació (10 s): s'ha de poder
  llegir i, si cal, dictar per telèfon, sense obrir una consola que al mòbil no existeix.
- **Tota fallada que arriba a l'usuari es reporta** amb `reportClientError`, també les que no venen
  de cap petició HTTP: el `context` de l'API és string lliure, així que afegir-n'hi una de nova és
  una línia a `ClientErrorContext` i res al backend.
- **Mai `disabled` per dir «s'està fent»**: un botó desactivat surt de l'ordre de tabulació i qui
  navega amb teclat el perd sense cap avís. `aria-disabled` + `aria-busy` i guarda al handler.
- **Mai dos indicadors alhora** per a la mateixa operació (backdrop *i* spinner al botó).
- **Mai una barra de progrés que no es pugui moure**: sense passos comptables, spinner.

---

## Estàndard d'accions destructives

L'app **no té desfer**: no hi ha cap `undo` a `features/sequence`. Per això el que protegeix la
feina és on viu cada acció i quan demana permís.

- **El criteri és quant costa refer-ho, mai com sona l'acció.** Treure un pictograma es repeteix
  molt i es refà amb un clic: **no** es confirma. Esborrar una seqüència se'n porta tots els seus:
  **sí**. Posar un diàleg a tot el que sona greu acaba en gent que hi clica sense llegir.
- **`ConfirmDialog`** (`components/ConfirmDialog/`) és la **única** confirmació de l'app. Mai
  escriure un `Dialog` de confirmació a mà: si el criteri de dalt s'ha de poder aplicar, s'ha de
  poder llegir en un sol lloc. Props: `title` (pregunta), `body` (**què es perd, en concret**),
  `confirmLabel`, i `alternative` opcional per a la sortida que evita la pèrdua en comptes de
  consumar-la («Descarrega-ho abans»), que va al mig perquè no és ni acceptar ni cancel·lar.
- **«Cancel·la» és un sol missatge per a tota l'app** (`components.confirmDialog.cancel`), dins del
  propi `ConfirmDialog`. Qui el crida no el passa.
- **Res de confirmar en va**: si no hi ha res a perdre, no es pregunta. `TabsSequences` compta els
  pictogrames **amb contingut** (`selectedId > 0`, imatge pujada o text) i amb la seqüència buida
  esborra directament.
- **El cos diu la xifra, no un avís genèric**: «Té 2 pictogrames…». Qui decideix sovint no està
  mirant el que perdrà.
- **Cap botó no rep el focus inicial**: se'l queda el diàleg (comportament de MUI). Així el lector
  de pantalla llegeix títol i cos i Enter no consuma res. **Mai posar `autoFocus`** al botó
  destructiu ni al de cancel·lar.
- **A les llistes d'accions, la destructiva va sola i l'última**, separada per `Divider` i en
  `error.main` (`MouseActionList`). Un grup buit per `omit` no deixa cap separador penjat.

---

## Antifrau i control de comptes

### Identitat

- **`emailCanonical` és l'única clau d'identitat** (`apps/api/src/shared/emailCanonical.ts`). L'`email` es conserva tal com l'escriu l'usuari perquè és l'adreça on se li escriu, però l'índex únic i totes les cerques (registre, login, cerca del panell) van contra el canònic. Sense això, `algu@gmail.com`, `a.l.g.u@gmail.com` i `algu+1@gmail.com` són tres comptes i una sola bústia.
- `googlemail.com` es canonicalitza a `gmail.com`: és el mateix servei amb el nom antic.
- Els punts **només** s'eliminen als dominis de Google. A un domini corporatiu, `joan.puig@` i `joanpuig@` poden ser dues persones.
- **Excepció per a proves internes**: `PLUS_ALIAS_EXEMPT_EMAILS` (variable d'entorn de l'API, llista separada per comes) exempta bústies concretes del descart de l'alias `+`. Per a una bústia hi llistada, `algu+ca@gmail.com` i `algu+es@gmail.com` són dos comptes diferents (els punts es continuen ignorant igual); per a qualsevol altra, el comportament no canvia. Serveix perquè, amb un únic compte real de Gmail, es puguin crear diversos usuaris de prova (un per idioma) sense obrir aquesta porta a la resta. Buida per defecte — a producció només hi ha d'haver les bústies de l'equip que en necessiten.

### Estat del compte

- **`status`** (`pending` / `active` / `suspended`) i **`role`** (`user` / `admin`) són coses diferents de **`tier`**: `role` és permís, `tier` és pla comercial. No barrejar-los mai.
- Un compte **`pending`** (correu sense verificar) **pot entrar i treballar**; només no pot **desar al núvol** (`requireVerifiedEmail` a `POST`/`PUT /api/documents`). Bloquejar l'accés sencer a una eina d'AAC perquè un correu s'ha entretingut castiga l'usuari equivocat. **Esborrar sempre es permet**: mai s'ha d'impedir a algú alliberar espai.
- **`authMiddleware` no consulta la BD** i no ho ha de fer: la suspensió es fa efectiva al refresh (com a màxim 15 min). `requireAdmin` sí que hi va, perquè són quatre peticions al dia i el que hi ha darrere és el poder de suspendre comptes.
- Suspendre incrementa `tokenVersion`; el refresh el compara. Sense això, un refresh token ja emès continuaria renovant la sessió fins a set dies.

### Frens de registre

- **`app.set("trust proxy", 1)` a `index.ts` és imprescindible**: a Render, sense això tots els `express-rate-limit` veuen la IP del proxy i o no aturen ningú o els aturen tots alhora.
- L'interruptor de registre i el sostre d'usuaris viuen a la **BD** (`modules/config`), no a l'`.env`: tancar el registre ha de ser un clic al panell, no un desplegament.
- Ordre de comprovacions al registre: registre obert → sota el sostre → domini no descartable → canònic lliure. Les que no revelen res van primer.

### Traça antiabús

- **La IP no es desa mai en clar**, enlloc. `shared/ipHash.ts` en fa un HMAC-SHA256 amb `IP_HASH_SECRET`; el `SecurityEvent` només en guarda el hash. Amb això es pot comptar «quantes altes d'aquest origen» sense tenir cap IP a la base de dades.
- `SecurityEvent` porta **índex TTL de 30 dies**: MongoDB purga sol. Res de cron ni de tasques de manteniment.

### Quotes

- Els límits viuen al **codi** (`shared/tierLimits.ts`), no al document d'usuari: apujar el límit del pla gratuït ha de ser un desplegament, no una migració. `quotaOverride` és només per a excepcions puntuals.
- **La quota es comprova abans de pujar res a Cloudinary**, estimant els bytes des de la llargada del base64. Pujar primer i rebutjar després deixaria imatges orfes ja pagades.
- **El contingut d'un document es compacta en desar-lo i es completa en llegir-lo**
  (`modules/documents/contentStorage.ts`). Mesurat amb `BSON.calculateObjectSize`, un document
  de 32 pictogrames ocupava 28 KB dels quals gairebé sis de cada deu bytes eren còpies: ajustos
  idèntics als del propi document i identificadors de resultats de cerca d'ARASAAC. Compactat
  en fa 15,6, i els comptes que caben als 512 MB d'Atlas passen de ~5.900 a ~10.100.
  **És capa d'emmagatzematge i prou**: ni el `.saac`, ni el que retorna l'API, ni Redux canvien
  de forma. Dues regles que no es poden trencar: **`textPosition` no s'omet mai** —el
  `PictogramCard` el llegeix sense fallback i el pictograma sortiria sense text—, i **sense
  `defaultSettings` al document no es compacta cap ajust**, perquè no hi hauria amb què
  tornar-lo a omplir. El retall de `bestIdPicts` és l'única part que no es desfà: és una caché
  d'una petició gratuïta i el botó d'ampliar la cerca la recupera.
- **Cap imatge d'usuari es desa mai a MongoDB.** `shared/imageAssets.ts` és l'única porta al núvol
  i el comparteixen els documents i el vocabulari personal; `shared/quota.ts` és l'únic lloc on es
  comprova el consum, perquè el pes d'un compte és un de sol repartit entre els dos. Fins a la
  branca `claude/estudi-limits-gratuïts-serveis`, `PUT /user/ui-settings` desava el `customImageUrl`
  en base64 dins del document d'usuari: no passava per cap quota i topava amb el límit de 16 MB per
  document de MongoDB a la vint-i-quatrena imatge, vuit vegades abans del límit de 200 paraules que
  l'app deia tenir.
- **Una imatge es demana sempre a la mida en què es pinta.** Les de l'usuari es desen a mida
  d'impressió (~500 KB); als llistats es veuen en quadradets de 40 px. `utils/cloudinaryUrl.ts`
  n'és l'única porta: en demana la variant reduïda a Cloudinary (el doble de la mida de pantalla,
  per a densitat 2×) i deixa passar intacta qualsevol URL que no sigui de Cloudinary, de manera
  que els components l'apliquen sense saber d'on ve cada imatge. La transformació **no es desa
  mai** a la base de dades: la mateixa imatge s'ha de poder servir sencera a l'editor. Sense això,
  obrir el llistat de documents costava 4,5 MB i la pestanya de vocabulari, 15 MB.
- **`MAX_IMAGE_BYTES` es comprova al servidor, no només al front.** És el que fa que «nombre
  d'imatges» vulgui dir un pes concret: sense sostre per imatge, qualsevol límit expressat en
  recompte deixa de protegir res, perquè el client el pot ignorar.
- **Les imatges orfes s'esborren després d'escriure, no abans.** Si s'esborren abans i l'escriptura
  falla, els perfils desats apunten a imatges que ja no existeixen. Val més una imatge orfe a
  Cloudinary que un vocabulari trencat. (`modules/documents/service.ts` encara ho fa a l'inrevés.)
- **El que l'usuari gasta se li ensenya, i abans de topar-hi.** Els comptadors d'`usage`
  existien des del principi però només els veia l'administrador: qui feia servir l'app
  descobria el límit en forma d'error en desar, quan ja hi havia mitja hora de feina a
  sobre. Ara `GET /user/ui-settings` retorna `usage` i `limits` —no costa cap petició
  més: aquella ja surt a cada restauració de sessió i llegeix el mateix document— i
  `GET /user/quota` els torna a demanar quan han canviat (després de desar, d'esborrar
  un document o una imatge). El tab **Usuari** els pinta a la secció «L'espai del teu
  compte», i és l'única de tot el modal que **no** surt sense sessió: sense compte no hi
  ha cap límit i una secció buida només faria preguntar què hi falta.
- **`quota` és un slice a part d'`uiSlice`**, com `documentStatus` ho és de `documentSlice`:
  no és cap preferència ni res que l'usuari pugui triar, és el que diu el servidor de com
  està el compte. Si hi fos, desar la configuració l'enviaria de tornada com si fos una
  tria. I `usage: null` **no vol dir zero**: vol dir que encara no se sap (sense sessió, o
  amb Render adormit). Amb aquesta diferència esborrada, l'avís de «no hi cap» sortiria a
  qui treballa sense compte, que no té cap límit.
- **La qualitat de les imatges la tria l'usuari, i només val per a les que vindran.**
  `imageQuality` (`print` 1.800 px/500 KB, `standard` 1.200/250, `compact` 800/120, a
  `IMAGE_QUALITY_PRESETS`) és una preferència del compte, no un automatisme: quan es puja
  una imatge encara no se sap a quina mida s'imprimirà —`sizePict` es toca després— i
  reduir és irreversible, de manera que el client no ho pot decidir sol (és el mateix
  motiu pel qual no es rebaixa segons quantes imatges hi hagi). Per això `print` continua
  sent el valor per defecte i **cap automatisme no toca mai una imatge ja pujada**:
  tornar-la a comprimir sola seria perdre detall que ningú ha demanat de perdre. Qui sí
  que en pot canviar la mida és **l'usuari, una per una** i sabent què hi perd — vegeu
  «Canviar de mida una imatge ja pujada» més avall.
- **El pes es diu sempre amb la mida d'impressió al costat.** «500 KB» no és cap referència
  per a qui no és informàtic, i el que decideix de veritat és si el pictograma es veurà bé
  al full: `utils/imagePrintSize.ts` tradueix els píxels a centímetres a 300 ppp
  (`GOOD_PRINT_DPI`), i `useFormatPrintSize` és l'única manera d'escriure-ho, com
  `useFormatBytes` ho és per al pes. Els tres nivells surten a 15, 10 i 7 cm, i el
  d'`Impressió` cobreix el pictograma més gran que l'app pot imprimir (150,8 mm). Ho porten
  el triador de qualitat (peu i tooltip de cada nivell), el diàleg de la imatge que no cap i
  cada fila de la llista d'imatges del compte. La xifra és un **sostre** («fins a»), mai una
  mida recomanada, i no s'inventa mai: sense píxels coneguts es diu només el pes.
- **Canviar de mida una imatge ja pujada** (`PATCH /user/assets`, `ImageResizeDialog`) és
  l'altra sortida de la llista d'imatges, i sovint la que toca: esborrar recupera tot
  l'espai però deixa el pictograma sense imatge, i a qui imprimeix petit el que li sobra és
  resolució, no la imatge. La versió reduïda la prepara el navegador amb el mateix
  codificador de la pujada —**codificant de veritat**, com `encodeToFit`: només s'ofereixen
  els nivells que retallen píxels i que, un cop codificats, pesen menys— i el servidor puja
  la nova, la posa on hi havia la vella i esborra la vella, en aquest ordre. **La URL
  canvia**: qui la feia servir l'ha d'adoptar (`replaceCloudImage` al document obert, els
  `wordProfiles` al vocabulari), igual com passa en esborrar-la, i per això la resposta
  torna l'asset tal com ha quedat. El pes de referència és el del registre d'assets, que és
  el que es restarà del comptador; el mesurat només mana quan el registre no en sap res
  (imatges d'abans que el registre existís, que en canviar de mida s'hi donen d'alta).
- **Una imatge que no cap es diu en pujar-la, no en desar.** `UploadImageButton` comprova
  dos sostres amb la imatge ja convertida: el pes màxim per imatge (`MAX_UPLOAD_IMAGE_BYTES`,
  el mateix `MAX_IMAGE_BYTES` que fa complir el servidor) i, **només amb sessió**, l'espai
  que queda al compte. Si algun es passa, `encodeToFit` prova els nivells més petits
  **codificant de veritat** —el pes objectiu és una fita, no una promesa— i el diàleg
  ofereix la versió que sí que hi cabria. És l'únic moment en què encara es pot fer alguna
  cosa: aquí la imatge original encara és al dispositiu; mitja hora després, en desar,
  l'única sortida seria treure-la del document.
- **La pujada no es bloqueja mai.** L'app funciona sencera sense compte i sense xarxa: una
  imatge que no cabrà al núvol s'ha de poder posar igualment i imprimir-la des d'aquest
  dispositiu, i per això «Posa-la igualment» hi és sempre. El que sí que canvia és el
  missatge de quan es desa: `QUOTA_STORAGE_EXCEEDED` diu on mirar què ocupa cada imatge, i
  `IMAGE_TOO_LARGE` —que el servidor retornava des que hi ha sostre per imatge i que
  arribava a l'usuari com un codi cru— ja té text. Cap dels dos ofereix reintentar:
  insistir no allibera espai.
- **Esborrar una imatge no esborra el que la feia servir.** `DELETE /user/assets` treu la
  imatge del pictograma del document (que conserva text i número) o de la paraula del
  vocabulari (que es queda amb el seu pictograma d'ARASAAC), en aquest ordre: primer
  s'escriu qui la feia servir, després s'esborra del núvol i al final s'ajusta el comptador
  —esborrar primer i que l'escriptura falli deixaria un document apuntant a una imatge que
  ja no existeix. La miniatura del document també se n'ha de netejar, o el llistat
  ensenyaria un quadre trencat. I si el document esborrat és el que s'està editant,
  `removeCloudImage` el posa al dia: **no** compta com a canvi de contingut
  (`documentStatusMiddleware`), perquè la còpia del núvol no s'ha quedat enrere sinó que
  s'ha avançat, i demanar de tornar-la a desar seria demanar de desar el mateix.
- Cada document guarda `assets: [{ publicId, bytes }]`. Sense els bytes no es pot restar res en esborrar i el comptador només creixeria.
- **Els píxels d'una imatge no es desen enlloc**: els bytes sí, perquè el comptador els ha de
  poder restar, però l'amplada i l'alçada només serveixen per ensenyar-les i desar-les
  voldria dir una migració de tot el que ja hi ha. `listUserAssets` les demana a Cloudinary
  en **una sola petició** per a tota la llista (`fetchImageDimensions`, `resources_by_ids`),
  que a més cobreix les imatges antigues. No llança mai: si Cloudinary no respon, la llista
  surt amb el pes i sense la mida d'impressió — val més una dada menys que cap llista.

### Correu

- `shared/mailer.ts` és **l'únic fitxer que sap que el proveïdor és Resend**. Cap funció seva llança mai.
- **L'enviament no bloqueja mai el registre.** El pla gratuït de Resend són 100 correus/dia: si s'esgota o el proveïdor falla, el compte s'ha de crear igualment i l'usuari ha de poder demanar el reenviament. Un dia dolent del correu no pot deixar el registre trencat.
- Sense `RESEND_API_KEY` (desenvolupament) l'enllaç surt per consola: el flux es pot provar sencer sense gastar quota.

### Desplegament: el front i l'API han d'anar al mateix origen

- El front és a Vercel i l'API a Render, però **el navegador ha de veure-les al mateix origen**. Ho aconsegueix la regla `/api/:path*` de `apps/web/vercel.json`, que ha d'anar **sempre abans** del catch-all cap a `/index.html` (les regles s'avaluen en ordre; si el catch-all va primer, se les empassa totes i un `POST /api/...` retorna 405).
- **No és per estalviar-se el CORS.** La cookie del refresh token va amb `sameSite: "strict"`; si el front és a `vercel.app` i l'API a `onrender.com`, el navegador la considera cookie de tercers i **no la desa mai**. Símptoma: el login sembla funcionar, però tanques la pestanya i has perdut la sessió. Amb el proxy la cookie és de primera part i la sessió sobreviu.
- Per això mateix, **`VITE_API_URL` no ha d'estar definida a Vercel**. Si hi és amb la URL absoluta de Render, el client se salta el proxy i tornem al problema de la cookie. L'`apiClient` ja cau a `/api` per defecte, que és el que volem.
- La via alternativa (`sameSite: "none"`) queda descartada: Safari bloqueja les cookies de tercers per defecte, i bona part dels usuaris d'AAC són en iPad.
- **`MONGODB_URI` ha de portar el nom de la base de dades** (`.../sequence-arasaac?...`). Sense ell, Mongoose es connecta a `test` i l'aplicació arrenca tan tranquil·la contra una base de dades buida: els usuaris no hi són i tots els logins retornen 401. Ha passat dues vegades, en local i a Render.

### Panell d'administració

- Ruta `/admin`, **fora de `LanguageLayout`** (sense `:locale`) i **només en català, sense `react-intl`**. És eina interna d'una sola persona i cinc fitxers de traducció no s'hi justifiquen. **És una excepció declarada, no un descuit.** El que sí que porta és un `IntlProvider` en català a `AdminPage`: els **textos** hi continuen sent literals, i el proveïdor només hi és perquè els components compartits que en depenen —`ConfirmDialog`, l'única confirmació de l'app— funcionin fora de `LanguageLayout`. Reescriure'n una còpia per al panell trencaria la regla que diu que el criteri de què es confirma s'ha de poder llegir en un sol lloc.
- La protecció de veritat és `requireAdmin` al servidor; la comprovació del front només evita ensenyar una pantalla que no funcionaria.
- **El primer admin es posa a mà des d'Atlas.** No hi ha cap endpoint per promoure administradors, i no n'hi ha d'haver.
- **El registre d'errors es pot buidar des del panell**, perquè el que hi queda sigui el que encara demana atenció: `DELETE /admin/client-errors/:id` treu un error mirat (sense confirmar: és una línia de registre, i el que es perd torna sol la pròxima vegada que l'error passi) i `DELETE /admin/client-errors?before=<ISO>` buida fins a un moment donat (això sí que passa pel `ConfirmDialog`). **El tall del buidat és una data, no la llista del que es veu**: el panell només n'ensenya els últims 50, així que amb identificadors el botó deixaria enrere tot el que no hi cap; amb la data, en canvi, el que arribi mentre s'està mirant la pantalla es conserva —que és justament el que encara no ha vist ningú. Com la resta d'accions d'administració, el buidat deixa `SecurityEvent`.
- **La issue de GitHub s'obre amb un enllaç, no des del servidor.** El botó de cada error porta al formulari `issues/new` del repositori ja omplert (codi, on, quan, detall, navegador i etiqueta `bug`), i qui la publica és l'administrador amb el seu compte. Fer-ho amb l'API de GitHub demanaria un token amb permís d'escriptura guardat a Render —una clau més a mantenir i a poder perdre— i tot el que estalviaria és un clic; a canvi, l'enllaç deixa llegir i completar el text abans de publicar-lo. **El correu de l'usuari no hi entra mai**: una issue és pública i el registre d'errors no ho és, i una adreça publicada no es pot desfer.

---

---

## Estàndard de capes flotants (diàlegs, avisos i botó flotant)

Tot el que sura per damunt de la pàgina. Font única de veritat:
`components/AppDialog/`, `components/FloatingLayer/`, `style/appShape.ts` i
`style/floatingControl.ts`. La raó de cada regla és a
`docs/ESTANDARD-capes-flotants.md` (inventari, troballes F1–F12 i pla).

### La forma

- **Un sol radi: `APP_CORNER_RADIUS` (20 px)**, el dels toggles. El porten els
  botons (`StyledButton`), els diàlegs, els avisos i els botons flotants. El del
  diàleg **el posa el tema** (`MuiDialog`): cap diàleg no se l'ha d'escriure al
  seu `sx`. El `fullScreen` en queda fora (`paperFullScreen` a 0).
- `APP_CONTROL_BORDER_WIDTH` (1,75) i `APP_CONTROL_SIZE` (55) completen el joc.
  **No hardcodejar cap d'aquests tres valors** enlloc.
- **Els camps no porten el radi de la casa**: `APP_FIELD_RADIUS` (12 px) per als
  camps de text, els desplegables i els avisos **en línia**, via el tema
  (`MuiOutlinedInput`, `MuiFilledInput`, `MuiAlert`). Un camp és un contenidor
  on s'escriu, no un control que es prem: amb els 20 px s'assemblaria a un botó,
  i amb els 4 de MUI semblava enganxat de fora de la targeta que el conté. Els
  avisos **flotants** en queden fora: porten el radi de la casa des de
  `floatingNoticeSx`, que mana per damunt del tema.

### Diàlegs

- **`AppDialog` és l'única manera de declarar un `Dialog`.** Mai un `Dialog` de
  MUI amb `DialogTitle`/`DialogActions` a mà.
- **Capçalera de tres franges**: una de buida, el títol centrat amb el seu
  distintiu, i la ranura d'icona. Les dues franges laterals fan la mateixa
  amplada perquè el títol quedi centrat **de debò** tant si hi ha acció com si
  no.
- **El títol diu on ets; el distintiu (`badge`) diu sobre què** —el número del
  pictograma—, i **forma part del nom accessible** (`aria-labelledby` amb els dos
  identificadors): «Editar Pictograma 4», no «Editar Pictograma».
- **A la ranura de la capçalera només hi va un menú de més accions. Mai una
  creu de tancar**: tancar viu al peu, en un sol lloc de tota l'app. Amb una
  creu allà, el mateix racó voldria dir dues coses segons el diàleg (F1).
- **Peu (`AppDialogActions`)**: l'acció que no és ni acceptar ni cancel·lar va
  **sola a l'esquerra** (l'esborrat del modal d'edició, `outlined error`; la
  sortida que evita la pèrdua d'un `ConfirmDialog`); a la dreta, tancar o
  cancel·lar en text i, a la seva dreta, l'acció principal en `contained`.
  **Excepció**: quan la destrucció *és* l'acció principal (`ConfirmDialog`), va
  a la dreta i plena.
- **Els botons del peu són `StyledButton`**, i els de text i els `outlined`
  porten **`color="inherit"`**: el verd de la casa sobre el paper es queda a
  **2,1:1** i no es llegeix en tema clar (F11). El verd només al botó ple, on va
  amb `primary.contrastText` (7,2:1).
- **Amplada**: `xs` per a una pregunta o un missatge, `sm` per a un formulari o
  una llista. Sempre `fullWidth`, perquè si no dos diàlegs germans surten de
  mides diferents.
- **`dividers`** (per defecte sí) es treu quan el diàleg només porta un
  missatge: sense estructura a dins, les línies només hi afegeixen pes.
- **`statusSlot`** és per al progrés o l'error que ha de quedar visible entre el
  contingut i el peu: dins d'una llista llarga quedaria fora de pantalla
  justament mentre s'espera.
- **Excepció declarada**: `DefaultSettingsDialog` és `fullScreen` i segueix
  l'estàndard de tabs (barra superior amb tabs i creu, sense peu). Drawer, menús
  i popovers són capes de navegació i queden fora d'aquest estàndard.

### Avisos flotants

- **Una sola aparença** (`floatingNoticeSx`): `Alert variant="outlined"` sobre
  `background.paper` **opac**, amb el radi de la casa i ombra. La severitat la
  diuen la vora i la icona, mai un fons de color.
- **Una sola posició** (`floatingSnackbarSx`): per sota de `sm` l'avís aparta el
  botó d'estat, i la separació surt de `FLOATING_CONTROL_CLEARANCE`, **calculada
  des dels tokens**. Abans era un 72 escrit a mà a partir dels 48 px del botó, i
  quan el botó ha canviat de mida el número ha deixat de quadrar sense que res
  ho digués.
- **El que no marxa sol, reserva espai** (`useFloatingInset`): una capa
  `position: fixed` no ocupa lloc al document, i quan la pàgina s'acaba l'última
  fila de pictogrames queda a sota sense cap scroll que la pugui apartar (F12).
  L'alçada es **mesura**, no es calcula: el mateix missatge fa dues línies en
  escriptori i cinc en un telèfon. Les confirmacions de tres segons
  (`FeedbackSnackbar`) **no** reserven res: fer saltar la pàgina cada cop que es
  desa alguna cosa seria pitjor que el que arregla.
- El contingut (`Container` de `BarNavigation`) reserva sempre
  `FLOATING_BOTTOM_INSET` —el que ocupa el botó, que hi és sempre— i, per
  damunt, el que declari la capa més alta.
- **La reserva del final de la pàgina no protegeix qui acaba al mateix racó**:
  amb la pàgina tot just més alta que la finestra —entre 30 i 90 px d'scroll, o
  sigui a 900 i 950 px d'alçada, que són mides de pantalla corrents— el botó
  flotant queia damunt de «Desa com a preferències» de la columna de vista, i cap
  reserva vertical ho arregla, perquè a scroll 0 aquell botó ja és dins la franja
  del flotant. Qui comparteix el racó reserva l'**amplada** del botó
  (`FLOATING_CONTROL_CLEARANCE`), igual que fan els avisos: és el mateix token i
  el mateix criteri, en horitzontal.

### Botons flotants

- **`floatingControlSx` és l'única manera de vestir-ne un**: la forma del toggle
  seleccionat (radi 20, vora d'1,75 i tint del color al 20 %), però **opac**. El
  tint transparent del toggle funciona sobre el gris de configuració; el botó
  flotant sura sobre el full, i amb transparència s'hi veurien passar els
  pictogrames per sota.
- **Una sola àncora**: `FLOATING_EDGE_GAP` (16 px) del cantó, tant per al botó
  d'estat com per a les fletxes de novetats.

### Estat de migració

- ✅ **`PictEditModal`** — la referència: capçalera, distintiu i peu en surten.
- ✅ **`ConfirmDialog`**, **`SettingsSaveErrorDialog`**, **`SaveDocumentModal`**,
  **`LoadDocumentModal`**, **`AuthModal`**, **`ModalDownload`**.
- ✅ **Avisos** — els tres `Snackbar` comparteixen aparença, posició i reserva.
- ✅ **Botons flotants** — `DocumentStatusFab` i les fletxes de `NewsNavBar`.
- ➖ **`DefaultSettingsDialog`** — fora d'abast, amb motiu (estàndard de tabs).

## Feina pendent coneguda

- `docs/BACKLOG-ux.md` recull les troballes obertes de la revisió d'UX, icones i accessibilitat, amb
  fitxer, motiu i proposta. **Consultar-lo abans de proposar una millora d'UX**: si ja hi és, cal
  continuar-hi (marcar-la resolta o caducada), no obrir-la de nou. Una troballa detectada i no
  resolta al moment s'hi apunta; no es deixa només a la conversa.
- `docs/ESTUDI-limits-serveis-gratuits.md` inventaria els límits del pla gratuït de cada servei
  (Atlas, Cloudinary, Render, Vercel, Resend, ARASAAC, GA4) i els contrasta amb el que l'app en
  consumeix de debò. **Consultar-lo abans d'afegir res que desi, pugi o enviï correu**: hi ha les
  troballes L1–L8, de les quals L1–L4 estan resoltes i L5–L8 continuen obertes. La primera de
  les que queden és que els avisos d'error i els correus de verificació comparteixen els 100
  correus diaris de Resend.
- `docs/ESTANDARD-capes-flotants.md` és l'estudi que hi ha darrere de l'estàndard de capes
  flotants: l'inventari del que hi havia, les dotze divergències numerades (F1–F12) amb fitxer i
  motiu, i el pla de migració. L'estàndard viu més amunt; **el document és la raó de cada regla**, i
  s'hi va a mirar quan una regla sembla arbitrària o quan se'n vol canviar alguna.

## Descripció del projecte

App per crear seqüències de pictogrames (ARASAAC), previsualitzar-les i imprimir-les.
Té dos pàgines principals:
- **Edició** (`/create-sequence`): es construeix la seqüència afegint pictogrames
- **Visualització** (`/view-sequence`): es previsualitza amb control de mida dels pictogrames i separació entre files i columnes. Permet imprimir i veure a full screen.

Funciona sencer **sense compte**: la configuració i les seqüències es guarden al navegador (`sessionStorage`/`localStorage`). Amb un compte (opcional), la configuració d'usuari i el vocabulari personal es desen al núvol i se sincronitzen entre dispositius — vegeu «Backend i sincronització al núvol» més avall.

## Tech stack

**Monorepo** (npm workspaces + Turborepo, `turbo.json`): `apps/web` (front), `apps/api` (back) i `packages/shared-types` (tipus compartits). Cada workspace té el seu propi `package.json`; les ordres `npm run dev|build|lint|test` a l'arrel les reparteix Turbo a cada workspace (`--filter=<workspace>` per acotar-ne un).

**Front (`apps/web`)**:
- **React 18** + **TypeScript** (Vite, `@vitejs/plugin-react-swc`)
- **Redux Toolkit** — estat global amb 2 slices: `uiSlice` (`features/user-settings`) i `documentSlice` (`features/sequence`)
- **React Router v6** — enrutament amb paràmetre `/:locale`
- **MUI (Material UI)** + **Emotion** — components UI i estils
- **react-intl** — multiidioma (ca, es, en, fr, it)
- **Path aliases** (`vite.config.ts` i `tsconfig.json`, han de coincidir): `@/*` → `src/*`, `@features/*`, `@shared/*`, `@app/*`, `@components/*`

**Back (`apps/api`)**:
- **Express** + **TypeScript**, executat amb `tsx` en dev
- **MongoDB** + **Mongoose** — persistència de documents, usuaris i esdeveniments de seguretat
- **Zod** — validació d'entrada i de variables d'entorn (`config/env.ts`)
- **JWT** (access + refresh amb cookie `httpOnly`) — autenticació
- **Cloudinary** — imatges personalitzades de vocabulari
- **Resend** — correu transaccional (verificació, avisos d'error)
- Desplegat a **Render** (pla gratuït: el contenidor s'adorm als 15 min d'inactivitat — vegeu més avall)

**Tipus compartits (`packages/shared-types`)**: tipus de domini (`document.ts`, `sequence.ts`, `ui.ts`, `admin.ts`, `FontFamily.ts`) importats com a `@sequence-arasaac/shared-types` tant des del front com del back, perquè el contracte de l'API i el model de Redux no divergeixin.

## Estructura clau

```
apps/
├── web/
│   ├── languages/           # Traduccions FONT (ca, es, en, fr, it) — editar aquí
│   ├── e2e/                 # Tests Playwright (captures/vídeos de funcionalitats)
│   └── src/
│       ├── pages/            # Pàgines (WelcomePage, EditSequencesPage, ViewSequencePage, AdminPage...)
│       ├── components/       # Components reutilitzables (SettingsLayout, AppTabs, PictogramCard...)
│       ├── Modals/           # DefaultSettingsModal, PictEditModal, PictEditModalList
│       ├── features/         # Features modularitzades:
│       │   ├── backend/        #   crida a l'API: api/ (apiClient, wake-up), auth/, documents/, user-settings/
│       │   ├── user-settings/  #   estat local (Redux) + persistència al navegador
│       │   ├── sequence/       #   documentSlice, contingut de les seqüències
│       │   ├── print/          #   hooks d'impressió i format de pàgina
│       │   ├── pictogram/      #   cerca i keywords d'ARASAAC
│       │   ├── word-profile/   #   vocabulari personal
│       │   ├── admin/          #   panell d'administració
│       │   └── ai-search/
│       ├── app/               # Redux store (store.ts, hooks.ts)
│       ├── types/              # Tipus locals (estenen els de shared-types)
│       ├── style/               # palette.ts, themeMui.ts (única font de veritat de colors)
│       ├── languages/          # JSON COMPILATS (AST react-intl) — generats, no editar
│       └── configs/            # Configuracions generals
├── api/
│   └── src/
│       ├── modules/          # Un mòdul per domini, cadascun amb controller/service/model/routes/validators:
│       │   ├── auth/           #   registre, login, refresh, verificació de correu
│       │   ├── documents/      #   CRUD de seqüències desades + assets Cloudinary
│       │   ├── user-settings/  #   configuració UI sincronitzada (PUT /user/ui-settings)
│       │   ├── client-errors/  #   registre d'errors arribats a l'usuari + avís per correu
│       │   ├── admin/          #   panell d'administració (requireAdmin)
│       │   ├── config/         # interruptor de registre / sostre d'usuaris (a BD)
│       │   └── security/       #   SecurityEvent (traça antiabús, TTL 30 dies)
│       ├── middleware/       # authMiddleware, requireAdmin, requireVerifiedEmail, errorHandler
│       ├── shared/            # emailCanonical, ipHash, tierLimits, mailer, mongooseSchemas, zodSchemas
│       └── config/            # env.ts (validació zod de l'entorn), database.ts
└── packages/shared-types/    # Tipus de domini compartits pel front i el back
```

## Hooks principals

| Hook | Ubicació | Rol |
|------|----------|-----|
| `usePageFormat` | `features/print/hooks` | Formats de pàgina (A4, A3, FULLSCREEN) i orientació |
| `useScaleCalculator` | `features/print/hooks` | Càlcul d'escales segons DPI i dimensions |
| `usePrintStyles` | `features/print/hooks` | Estils dinàmics per impressió |
| `useFullScreen` | `features/print/hooks` | Mode fullscreen |
| `useArasaacKeywords` | `features/pictogram/hooks` | Connexió amb API ARASAAC per obtenir pictogrames |
| `useSaveUiSettings` | `features/backend/user-settings/hooks` | Desat en segon pla de la configuració d'usuari, amb reintent i diàleg d'error — vegeu més avall |
| `useIsBackendWakingUp` | `features/backend/api` | Estat de «el servidor s'està despertant» per a `BackendWakeUpNotice` |

---

## Patrons i detalls tècnics importants

### Redux i estat

- **`uiSlice`** gestiona `defaultSettings` (configuració global de l'usuari). Té dos sub-objectes: `pictApiAra` (skin, hair, color) i `pictSequence` (font, numbered, borders, textPosition, numberFont).
- **`documentSlice`** gestiona el contingut de les seqüències (`content`, `activeSAAC`).
- El reducer `updateDefaultSettingPictSequence` fa un spread shallow sobre `pictSequence`, per tant qualsevol nou camp al nivell de `pictSequence` es pot actualitzar sense canviar el reducer.
- El reducer `updateDefaultSettings` reemplaça tot el `defaultSettings` — el que usa `handlerSubmit` de `DefaultForm`.
- **Persistència**: `DefaultForm` guarda a `sessionStorage` i `localStorage` amb la clau `"pictDefaultSettings"`. Si un usuari té dades antigues sense un camp nou, el fallback es gestiona al nivell de lectura (no hi ha migració).

### Esborrany del document i imatges pujades

- **El document no es desa mai a `localStorage`/`sessionStorage`.** L'esborrany va a **IndexedDB** (`features/sequence/storage/draftStorage.ts`, clau `currentDocument`). El motiu és de mida: els storages del navegador donen uns 5 MB per origen i hi compten en UTF-16, i **una sola imatge pujada en base64 ja se'ls menja** — el mateix `STORAGE_FULL_ERROR` que ja passava amb el vocabulari, però enduent-se la feina. A IndexedDB hi cap el document sencer, imatges incloses, **sense tocar-ne el format**: ni el `.saac`, ni el que rep l'API, ni `PictApiAra.url`.
- **Les imatges pujades no viuen dins de l'esborrany**: van a un magatzem propi d'IndexedDB
  (`draftImages`) escrit **un sol cop per imatge**, i el document en desa una referència
  (`draft-image:<id>`). Sense això, moure un slider tornava a escriure tots els base64 sencers cada
  segon: mesurat, de 7 ms amb una imatge a 22 ms amb dotze (i molt pitjor en tauleta), quan el que
  canvia són uns quants KB. Amb el magatzem a part el desat és pla, ~1-2 ms, hi hagi les imatges que
  hi hagi. **És capa d'emmagatzematge i prou**: ni el `.saac`, ni el que rep l'API, ni
  `PictApiAra.url` a Redux canvien de forma. L'id surt d'un mostreig del contingut (llargada + tres
  trossos), no de recórrer la cadena sencera, que seria tornar a pagar el que s'estalvia.
- **No es reescriu el mateix document dues vegades**: el flush de `visibilitychange` compara amb
  l'última referència escrita. Sense la comparació, amagar i tornar a mostrar la pestanya escrivia
  igualment.
- **L'esborrany és xarxa de seguretat, no desat.** Sobreviu a un refresc, a tancar la pestanya i a quedar-se sense bateria, però el navegador el pot desallotjar (Safari, als 7 dies sense visitar el lloc). Els desats de veritat continuen sent explícits: «Descarrega» (fitxer `.saac`) i «Desa al núvol» (amb compte). **Mateix mecanisme per a l'usuari anònim i per a l'autenticat** — el que canvia és què hi ha a sobre, no l'esborrany.
- **No hi ha autodesat al núvol.** Cada `PUT /documents` puja imatges a Cloudinary i passa per la comprovació de quota: desar sol, sense que l'usuari ho hagi demanat, li pot retornar un `QUOTA_STORAGE_EXCEEDED` en un moment en què no pensa a desar, i de passada desperta Render.
- **Es desa amb debounce d'1 s i es força en amagar la pestanya** (`visibilitychange` i `pagehide`, no només `beforeunload`): a iOS el sistema pot matar una pestanya en segon pla sense disparar-lo mai, i l'iPad és el dispositiu típic d'un usuari d'AAC.
- **Restauració només en arrencar i només sobre un document verge** (sense títol i sense cap pictograma). Si mentre es llegia l'esborrany l'usuari ja ha carregat un document o ha posat un pictograma, mana el que està veient.
- **Si el navegador no pot desar, es diu.** `saveDraft` retorna si ho ha aconseguit i el hook avisa **un sol cop** per sessió: amb l'espai exhaurit, cada canvi posterior tornaria a fallar i l'avís es convertiria en soroll.
- **Les imatges pujades tenen mida fixa: 1.800 px de costat llarg** (`MAX_IMAGE_SIDE_PX` a `utils/imageToBase64.ts`), amb objectiu de ~500 KB ajustant la qualitat i un mínim de 0,5. Surt del cas pitjor d'impressió: el pictograma més gran possible és de 150,8 mm (150 px CSS × `SIZE_PICT_MAX` 3,8, a 96 dpi), i 1.800 px hi donen 303 dpi — per damunt del sostre del PDF mateix (`html2canvas` a `scale: 3` sobre una pàgina de 96 dpi són 288 dpi com a màxim).
- **La mida és igual per a totes les imatges i no depèn de quantes n'hi hagi.** Rebaixar-la per imatge segons el recompte és temptador (com més pictogrames, més petit s'imprimeix cadascun) però està mal ancorat: quan es puja encara no se sap a quina mida s'imprimirà — `sizePict` es toca després, a la pàgina de vista— reduir és irreversible, i el resultat dependria de l'ordre d'arribada. A més, una progressió a la meitat arriba al terra a la quarta imatge: el terra acaba sent l'única política real.
- **Es redimensiona sempre, no només quan la imatge passa d'un llindar**, i **mai s'amplia**: inventar píxels no afegeix detall i multiplica el pes.
- **Les imatges amb transparència no van mai a JPEG** (els pintaria un fons negre): es codifiquen en WebP, que guarda l'alfa amb pes de foto, i si el navegador no el sap codificar `toDataURL` retorna un PNG sense avisar —es detecta pel prefix— i el PNG es dona per bo.

### Estat de durabilitat i botó flotant

- **Tres nivells, no dos**: esborrany d'IndexedDB (automàtic, aquest navegador), fitxer `.saac`
  (explícit) i núvol (explícit, amb compte). `documentStatus` (`features/sequence/store/documentStatusSlice.ts`)
  és l'única font de veritat de quin d'ells té la feina que hi ha a pantalla.
- **Viu fora de `documentSlice` a propòsit**: no és contingut del document, no viatja al `.saac` ni
  al cos de l'API. Si hi fos, desar el document el canviaria.
- **Cap component marca «hi ha canvis»**: ho fa `documentStatusMiddleware` escoltant les accions
  `document/*` de dos segments. En queden fora `changeActiveSAAC` (navegació, no contingut),
  `loadDocumentSaac` i `resetDocument` — qui carrega un document és qui sap d'on ve i ho declara ell
  mateix amb `documentMadeDurable` (fitxer o núvol).
- **Amb còpia i amb canvis a sobre, l'estat és `stale` i el botó es posa groc.** És un estat propi
  entre `local` i `durable`: la còpia existeix, però és d'abans del que hi ha a pantalla. Sense ell,
  seguir treballant damunt d'un document desat el tornava a «Només en aquest dispositiu» —cert, i
  alhora amagant el que importa— i ho deia **amb el mateix verd** que un document acabat de desar. El
  panell del botó només s'obre amb el clic, així que el color és l'única cosa que es veu de cua
  d'ull: el groc (`warning`, només a la vora i al tint de `floatingControlSx`; la icona continua
  sent la tinta del tema) és tota la diferència entre «ho tens desat» i «ho tenies desat».
- **El groc és per a la còpia que s'ha quedat enrere, mai per a l'esborrany a seques.** Un document
  que no ha estat mai enlloc —el cas normal de qui treballa sense compte— es queda en verd amb el
  text de sempre: pintar d'alerta permanent el flux principal de l'app convertiria l'avís en soroll
  i no diria res que el text no digui.
- **`isWorkAtRisk` viu al slice, no al botó**: és el criteri de tota l'app per saber si una acció que
  buida la pantalla —«Document nou», tancar la sessió— s'ha de confirmar, i `stale` hi entra encara
  que hi hagi còpia (el que es perdria és tot el que s'ha fet des d'aleshores, i el cos del diàleg ho
  diu així en comptes de dir que es perd tot).
- **De l'esborrany no se'n diu mai «desat» a seques.** Qui llegeix «desat» entén que la feina és
  fora de perill i l'esborrany no ho garanteix; els textos diuen sempre «només en aquest
  dispositiu». És tota la raó de ser de l'indicador.
- **La durabilitat es desa dins de l'esborrany** (`DraftMeta`): sense això, recarregar convertiria
  un document acabat de desar al núvol en feina que sembla no ser enlloc.
- **`DocumentStatusFab`** és l'únic lloc que ho explica: `SpeedDial` a baix a la dreta, muntat a
  `LanguageLayout` (editor i visualitzador), fora del `Container` perquè és capa flotant. **S'obre
  només amb el clic** (`reason === "toggle"`): amb l'obertura per hover, el clic següent la tancaria
  i el botó semblaria mort, i amb la del focus es reobriria sola en tancar-se el diàleg de
  descàrrega. No surt mai a la impressió (`@media print`).
- **El núvol només el porten les icones que toquen el núvol.** Amb tres nivells de durabilitat, les
  icones han de dir quin toca cada acció: `AiOutlineDownload` (↓, sense núvol) per a descarregar el
  `.saac`, `AiOutlineFolderOpen` per a carregar-lo —no una fletxa amunt, que quedava el mateix
  dibuix mirallat que la de descarregar i no es distingia a 24px—, i el núvol **només** a «Desa al
  núvol» (`AiOutlineCloudUpload`) i «Carrega del núvol» (`AiOutlineCloudDownload`). Un disquet o un
  núvol a les operacions de fitxer local contradiuen el `DocumentStatusFab`, que existeix
  precisament per dir on és la feina.
- **«Document nou» (`startNewDocumentThunk`) és l'única porta a `resetDocument`** i sempre esborra
  l'esborrany: buidar la pantalla sense esborrar-lo deixaria la feina antiga a punt de ressuscitar
  al primer refresc. Conserva la configuració per defecte —és de l'usuari, no del document— i
  demana confirmació si la feina no té còpia externa.
- **Tancar la sessió tanca també el document** (`AppNavigationDrawer`, `startNewDocumentThunk`
  després de `logoutThunk`). El vocabulari personal ja se n'anava en sortir i és exactament el mateix
  motiu: en AAC el dispositiu es comparteix, i el que quedava a pantalla —i a l'esborrany
  d'IndexedDB, que sobreviu al refresc— era feina d'algú altre. A més, un document del núvol es
  quedava amb l'id del compte que l'havia desat: l'indicador deia «Desat al núvol» a qui ja no hi
  tenia sessió, i desar-lo des d'un altre compte hauria estat un `PUT` a un document que no és seu.
  Si la feina no té còpia (`isWorkAtRisk`) es confirma abans, amb «Desa al núvol abans» a la ranura
  de l'alternativa —encara hi ha sessió, i per això aquella sortida encara és possible.
- **Només ho fa el tancament explícit.** La sessió que caduca sola (A11) no toca el document: allà
  l'usuari no ha demanat res, i perdre-li la feina seria el pitjor dels dos mals.
- **El botó flotant desa pel mateix diàleg de nom que el drawer** (`SaveDocumentModal`, vegeu més
  avall): dues portes a la mateixa acció, un sol comportament. I **qui declara la durabilitat és el
  diàleg que fa l'operació** —`SaveDocumentModal` en desar, `LoadDocumentModal` en carregar—, no qui
  l'ha obert: així l'indicador diu la veritat vingui la crida d'on vingui.

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

- **Cinc idiomes**: `ca` (principal), `es`, `en`, `fr`, `it`.
- **Dos nivells de fitxers, mai confondre'ls**: els FONT viuen a `apps/web/languages/*.json` (format `{ "clau": { "defaultMessage": "...", "description": "..." } }`) i s'editen a mà; els COMPILATS viuen a `apps/web/src/languages/*.json` (AST de react-intl) i es **generen**, mai s'editen directament.
- Compilar: `cd apps/web && npm run prepare` (crida `scripts/compile-languages.mjs`, que itera tots els `.json` de `languages/` amb `formatjs compile` — afegir un idioma nou no requereix tocar cap script).
- Les claus de missatge i les traduccions JSON han de coincidir exactament amb els `id` definits a `defineMessages` als `.lang.ts`.
- Flux complet i checklist: skill `language` (`.claude/skills/language.md`).

### Build i compilació

- Ordres a l'arrel del monorepo (`npm run dev|build|lint|test|typecheck`) les reparteix **Turbo** a tots els workspaces; `--filter=web` o `--filter=api` acota a un de sol.
- **`npm run typecheck` és l'única barrera de tipus, i cal passar-la abans de donar res per bo.** `vite build` **no** comprova tipus: `@vitejs/plugin-react-swc` els llença sense mirar-los, i ESLint no els mira tampoc. Un `✓ built` verd al web no vol dir que el TypeScript quadri. (Aquest apartat deia el contrari fins a la branca `claude/document-limit-users-sjig8o`; hi havia codi de producció amb tipus trencats que passava el build cada dia.)
- **Front** (`apps/web`): `npm run typecheck` = `tsc --noEmit`; `npm run lint` = `eslint ./src`; `npm run build` = `vite build` (només empaqueta). `npm test` i `npm run test-coverage` són encara placeholders (`echo ... && exit 0`) tot i que el workspace té `@testing-library/react`, `msw` i tests `.test.ts(x)` reals — no assumir que `npm test` executa res. Els tests e2e (captures/vídeos de funcionalitats) van amb **Playwright** (`apps/web/playwright.config.ts`, carpeta `e2e/`).
- **Back** (`apps/api`): `npm run typecheck` i `npm run lint` són tots dos `tsc --noEmit` (el nom `lint` hi era abans); `npm test` = `vitest run` (usa `mongodb-memory-server`, per això els fitxers `*.test.ts` i `src/test/` queden exclosos del `tsconfig.json` de build/producció).
- **Els tests del web queden fora del `typecheck`** (`exclude` del `tsconfig.json`: `*.test.*`, `setupTests.ts`, `test-utils.tsx`), com a l'API. Ja hi havien de ser des de sempre, però l'`exclude` tenia les dues rutes dins d'una sola cadena separades per una coma i no excloïa res. La suite no compila contra el codi actual (referencia un `sequenceSlice` que ja no existeix i props que han canviat): mentre no es revisqui o s'esborri, no pot ser la barrera de ningú. Vegeu C10 de `docs/BACKLOG-ux.md`.
- **`npm run lint` del web surt vermell amb errors preexistents** (13, a `test-utils.tsx` i a pàgines soltes): quan s'hi passa, cal filtrar la sortida amb grep pels fitxers tocats per verificar que els errors nous no són nostres. El `typecheck`, en canvi, ha d'estar **net**: si en surt un, és nostre.
- `test-utils.tsx` (`apps/web/src/utils`) conté una mock de l'estat Redux, avui **desincronitzada** amb l'store real. No serveix de referència fins que es refaci.
- Desplegament: front a **Vercel**, back a **Render** (`render.yaml`, `buildCommand: npx turbo build --filter=api`) — vegeu «Desplegament: el front i l'API han d'anar al mateix origen» a l'apartat d'antifrau per als detalls de per què han de compartir origen.

---

## Backend i sincronització al núvol

### Separació `features/*` vs `features/backend/*`

- **`features/<domini>/`** (`user-settings`, `sequence`...) és l'estat local: slice de Redux i, quan cal, persistència directa al navegador (`storage/settingsStorage.ts`). Funciona sense compte.
- **`features/backend/<domini>/`** (`auth`, `documents`, `user-settings`) és tot el que parla amb l'API: `services/` (crides amb `apiClient`) i `store/` (thunks). `features/backend/api/` és transversal: `apiClient` (axios amb interceptors JWT) i tot el que gestiona l'estat "el servidor s'està despertant".
- Un domini pot tenir estat a banda i banda (`user-settings` local i `backend/user-settings`) precisament perquè la mateixa configuració es guarda diferent segons si hi ha sessió — vegeu `saveUserUiThunk` (`features/backend/user-settings/store/settingsThunks.ts`): autenticat → `PUT /user/ui-settings`; anònim → `localStorage`, i **sense vocabulari** (`wordProfiles: []`), perquè el vocabulari amb imatges en base64 només té sentit lligat a un compte i ompliria l'espai del navegador d'un dispositiu compartit.

### El servidor s'adorm (pla gratuït de Render)

- Render adorm `apps/api` als 15 minuts sense trànsit; la primera petició que hi arriba el desperta i pot trigar prop d'un minut. Sense cap senyal, l'usuari només veu un botó bloquejat.
- **`backendStatus.ts`** (`features/backend/api`) dedueix el desvetllament de la durada de les peticions reals en curs (llindar `SLOW_REQUEST_THRESHOLD_MS`, 3 s) — **no** fa cap petició pròpia per comprovar-ho. És un mòdul fora de Redux a propòsit: `apiClient` (que no és un component) l'ha de poder alimentar des dels seus interceptors (`notifyRequestStart`/`notifyRequestEnd`).
- **`warmUpBackend.ts`** fa un ping preventiu (`GET /health`) quan té sentit avançar el cost (p. ex. en obrir el formulari de login), amb un cooldown de 10 min perquè no es repeteixi dins la mateixa sessió activa.
- Les peticions de fons (`isBackgroundRequest: true` a `AxiosRequestConfig`, camp propi afegit per augmentació de tipus a `apiClient.ts`) no compten per a l'avís: ningú les espera activament.
- **`BackendWakeUpNotice`** és un `Snackbar` **no bloquejant**: l'editor funciona sencer sense backend, així que enfosquir la pantalla mig minut seria pitjor que l'espera mateixa. Només si hi ha un backdrop obert (`state.backdrop.open` del `FeedbackContext`) canvia el text per avisar que allò sí que està bloquejat.
- `REQUEST_TIMEOUT_MS` d'`apiClient` és **90 s**, deliberadament ampli perquè un desvetllament que voreja el minut no es talli i es converteixi en error just quan el servidor ja anava a respondre.

### Classificació de fallades i reintent (`requestFailure.ts`)

- Tota fallada de petició es classifica amb `classifyRequestFailure`: l'únic que importa és si **val la pena reintentar sol** (`isTransient`). Transitori = xarxa/timeout/backend engegant-se (408/425/429/502/503/504, codis axios `ECONNABORTED`/`ETIMEDOUT`/`ERR_NETWORK`); no transitori = rebuig del servidor (dades invàlides, quota) o `STORAGE_FULL` (espai del navegador exhaurit, codi propi que no ve de cap petició HTTP).
- Patró de referència: `useSaveUiSettings` (`features/backend/user-settings/hooks`). El desat **no bloqueja el tancament del modal** (els panells ja han sincronitzat Redux abans de desar): es llança en segon pla, amb un sol reintent automàtic si la primera fallada és transitòria (`TRANSIENT_RETRY_DELAY_MS`, 8 s), i només si el segon intent també falla apareix `SettingsSaveErrorDialog` — un diàleg, no un snackbar, perquè arriba quan l'usuari ja no pensa en la configuració i cal dir-li què s'hi juga i què pot fer.
- Qualsevol fallada que arribi a l'usuari (després del reintent automàtic) es reporta amb `reportClientError` cap al mòdul `client-errors` de l'API — «s'informa del que ha arribat a l'usuari, no del que s'ha resolt sol».

### Documents al núvol: nom, miniatura i progrés

- **Desar al núvol passa sempre pel diàleg de nom** (`SaveDocumentModal`, `features/backend/documents/components`). Abans, «Desa al núvol» enviava el document sense títol i el llistat l'anomenava amb els últims sis caràcters de l'identificador: amb un sostre de pocs documents per compte, distingir-los abans d'esborrar-ne cap deixa de ser una comoditat.
- **La casella no comença en blanc**: `suggestDocumentTitle` (`features/sequence/utils`) proposa les **quatre primeres paraules** de la seqüència, en l'ordre en què l'usuari les veu. Acceptar la proposta ha de costar el mateix que no posar-hi nom; si no, el camp es converteix en un peatge i tothom hi deixa el que hi hagi.
- El nom viu al **document** (`setDocumentTitle` a `documentSlice`), no al diàleg: així sobreviu a l'esborrany d'IndexedDB i al fitxer `.saac`.
- **La miniatura la deriva el servidor**, no el client (`modules/documents/thumbnail.ts`): els **tres primers pictogrames** del document, guardats com a referències (`selectedId` + aparença, o la URL de Cloudinary d'una imatge pròpia). **No es genera ni es puja cap imatge nova** — no costaria només diners de Cloudinary, sinó quota de l'usuari. Es calcula **després** de pujar les imatges, perquè mai hi entri un base64.
- Es guarda al document i no es calcula en llistar: `listDocuments` només selecciona `title updatedAt thumbnail`, i llegir el contingut sencer de cada document per pintar tres quadradets seria transferir megabytes per res. Els documents desats abans d'existir el camp el tenen buit i el llistat els ensenya amb icona genèrica.
- **El progrés de la transferència surt dels events d'axios** (`onUploadProgress`/`onDownloadProgress`) i es publica a `documentTransfer.ts`, un mòdul fora de Redux com `backendStatus`: el thunk no pot rebre una funció per argument sense fer l'acció no serialitzable. Si la petició no diu la mida total, el percentatge és `null` i la barra passa a indeterminada — més val això que un número inventat.
- **«Desa'n una còpia» és l'única manera de derivar un document d'un altre** (`saveDocumentThunk`
  amb `asCopy`, que força el `POST` encara que el document ja tingui id de MongoDB). Viu al peu del
  mateix diàleg de desar, a la **ranura de l'esquerra**: desa, però no on l'usuari ve de desar, i
  així queda separat de l'acció que substitueix la versió del núvol. L'`Enter` del camp de nom fa
  sempre l'acció principal, mai la còpia. L'id nou el recull el `loadDocumentSaac` de sempre, de
  manera que **a partir d'aquell moment es treballa sobre la còpia**: el snackbar ho diu, perquè si
  no el desat següent aniria a parar a la còpia pensant que va a l'original.
- **La còpia no pot tenir el nom de l'original**: al llistat quedarien dues files iguals, i el
  llistat és l'únic lloc on es tria quin document es carrega i quin s'esborra. Es demana el nom quan
  encara se'n sap la diferència, no després.
- **Èxit → snackbar; error → es queda al diàleg.** En desar bé o carregar bé, un snackbar amb el nom del document. Si falla, l'`Alert` es queda dins del diàleg (amb el codi semàntic del backend) perquè es pugui tornar a provar sense reescriure el nom.

### Registre d'errors del client (`modules/client-errors`, API)

- Els errors que arriben a un usuari es registren a `ClientErrorModel` i, si `ADMIN_ALERT_EMAIL` està configurat, generen un correu — amb throttle d'una hora per codi (`ALERT_THROTTLE_MS`) perquè una fallada que afecti tothom alhora no esgoti la quota diària de correu just el dia que més falta fa.
- `recordClientError` **mai llança**: un problema de registre no ha de convertir un error menor de l'usuari en un de gros.
- `errorHandler` (middleware Express) hi registra també qualsevol resposta 5xx pròpia amb `SERVER_` de prefix al codi; els 4xx no es registren perquè són respostes previstes.
- Visible al panell d'administració (`AdminClientErrorsTable`, `features/admin`).
