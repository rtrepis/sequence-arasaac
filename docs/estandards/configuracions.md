# Configuracions (panells d'ajustos)

> **Quan llegir-lo:** abans de tocar qualsevol panell d'ajustos: `DefaultSettingsModal`, `SettingsLayout/`, `SettingRow`, `PictEditForm` o la columna de la pàgina de vista.

Patró únic per a tots els tabs del `DefaultSettingsModal` (Usuari, Pictogrames, Vista, Vocabulari). Font única de veritat: `apps/web/src/components/SettingsLayout/`.

## Components compartits

- **`SettingsPanelLayout`** — layout canònic de **tres** zones: mostra a l'esquerra, ajustos al mig i ajuda a la dreta. Props: `preview?`, `previewAside?`, `hint?`, `controlsGap`. **No té prop d'amplada**: les amplades les posa el propi layout, perquè la columna del mig ha de caure igual a tots els tabs. **`previewAside` és el que acompanya la mostra sense ser mostra** (llistes llargues, com el vocabulari desat): viu a la columna esquerra però en **mòbil** queda en flux normal, sense enganxar-se ni compartir el límit d'alçada de la mostra. Una llista dins de `preview` obligaria a acotar-la i generaria un scroll intern minúscul dins d'un bloc enganxat: dos scrolls competint en una pantalla de mòbil.
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
- **`SettingsPanelHint`** — guia d'un tab: `Alert severity="info" variant="outlined"` amb el text que diu **què s'ajusta aquí i sobre què tindrà efecte**. Un sol fill: el missatge traduït. Va **a la prop `hint` de `SettingsPanelLayout`**, mai com a fill de la columna de controls: on es dibuixa depèn de l'amplada i això només ho pot decidir el layout.
- **`SectionTitle`** — **contenidor** de secció: props `title` (capçalera en majúscules `text.secondary` + `Divider`), `children` (els ajustos de la secció) i `onApplyAll?`. Els `children` es renderitzen **indentats** (`pl: SETTINGS_INDENT`) sota el títol, com un esquema: `<SectionTitle title={...}>{ajustos}</SectionTitle>`, no com a germans després del títol. És el nivell superior de la jerarquia de separació.
- **`SettingRow`** — **única implementació** de la fila d'un ajust individual: `title` a l'esquerra (amb `cardTitle`) i `children` (el control) a la dreta. Props: `title`, `labelId?` (per a `aria-labelledby`) i `control?`, que tria com es dimensiona el control:
  - `"sized"` (per defecte) — slider, select, textfield: amplada acotada amb `settingControlWidth`; apila en mòbil.
  - `"wide"` — grups de toggles: amplada segons contingut (`flexShrink: 0`, mai comprimit contra el títol); apila en mòbil.
  - `"compact"` — `Switch`, `InputColor`: **sempre en línia**, també en mòbil — apilar-los només malgastaria alçada, mai els falta amplada.

  **Mai reescriure aquest patró a mà** amb `Box sx={settingRowInline}` + `FormLabel`.
- **`settingsAccordion`** — sx **única** de qualsevol acordió dins d'una configuració: **pla**, sense elevació, sense fons propi i sense la línia superior de MUI (`&:before`) — el `Divider` del `SectionTitle` ja és l'únic divisor visible. Va sempre amb `disableGutters`, `elevation={0}` i un `AccordionSummary` amb `expandIcon={<MdExpandMore />}` i `px: 0`, que l'alinea amb la resta de files. **El que distingeix un acordió d'un títol és només la fletxa que gira**, mai una caixa: una llista plegable no és una zona diferent del panell. El porten els ajustos per seqüència (`SequenceControlsPanel`) i la llista d'imatges del compte (`AccountImagesList`).
- **`IconToggleButton`** — **única manera** de declarar un botó només-icona dins d'un
  `StyledToggleButtonGroup`. Pren **un sol** `message` (un `MessageDescriptor`) i en deriva el
  `Tooltip` i l'`aria-label`. Mai escriure `<Tooltip title={intl.formatMessage(x)}><ToggleButton
  aria-label="left">`: amb dues fonts, el text traduït i el nom accessible se separen i el segon
  acaba en anglès (era la troballa C5 del backlog). Funciona sense reenviar cap prop perquè el
  `ToggleButtonGroup` de MUI v6 passa la selecció per **context**, no clonant els fills.

## Regles

- **Preview sempre a l'esquerra**, mai a la dreta; **l'ajuda sempre a la dreta**, mai a l'esquerra.
- **Tres columnes, dues o una, segons l'amplada** — i **sempre en el mateix ordre de lectura**: mostra, ajuda, ajustos.
  - **Escriptori** (a partir de `SETTINGS_THREE_COLUMN_BREAKPOINT`, `lg`): mostra · ajustos · ajuda.
  - **Tauleta** (`md`–`lg`): la mostra es queda a l'esquerra i la dreta apila l'ajuda **damunt** dels ajustos.
  - **Mòbil** (per sota de `md`): una sola columna a tota l'amplada, mostra → ajuda → ajustos.
- **La columna d'ajustos cau al mateix lloc a tots els tabs.** Les laterals **es reserven sempre**, també al tab Usuari, que no té mostra, i al Vocabulari sense sessió. Si els tabs sense mostra centressin els seus ajustos, canviar de pestanya els mouria de lloc i costaria de veure què ha canviat de debò. Per això les pistes de la graella són fixes (`SETTINGS_ASIDE_WIDTH` 280 · `SETTINGS_CONTROLS_WIDTH` 560 · 280) i no depenen del contingut, i **el layout no té prop d'amplada**.
- **Amplades derivades, no escrites**: `SETTINGS_MAX_WIDTH` (dues columnes) i `SETTINGS_WIDE_MAX_WIDTH` (tres) **es calculen** a partir de les tres pistes i de `SETTINGS_ZONE_GAP`. No hardcodejar amplades noves ni tocar-ne una sense l'altra. El `Container` del diàleg va a `maxWidth="xl"` perquè el `lg` per defecte (1200) escanyava el panell de tres columnes.
- **El que s'enganxa no es perd amb l'scroll**: la mostra queda visible mentre es toquen els controls a totes les amplades, i l'ajuda també en escriptori, on té columna pròpia. La clau és que la caixa enganxada porti **`alignSelf: "start"`**: una cel·la de graella estirada fa exactament l'alçada del contingut i l'enganxada no té on moure's, que és el que passava abans amb l'`alignItems: flex-start` del `Stack`.
- **En mòbil el panell és flex, no graella** — el que s'enganxa dins d'una graella només es pot moure dins de la seva cel·la, i la mostra ha de poder acompanyar **tot** l'scroll del panell, no només la seva fila. En flex, el bloc de referència és el contenidor sencer. Per això la columna esquerra hi passa a `display: contents` i els seus fills pengen del panell.
- **Tot tab comença amb la seva guia**: `SettingsPanelHint` es passa per la prop `hint` de `SettingsPanelLayout`, a tots els tabs sense excepció. Format únic (mai un `Typography` solt ni un `Alert` escrit a mà) perquè l'usuari trobi sempre l'explicació al mateix lloc i amb el mateix aspecte. El text respon a què configura el tab i sobre què tindrà efecte; si el panell té estats (crear/editar), el text **canvia amb l'estat** — és la manera de dir on ets sense afegir cap encapçalament (cas del tab Vocabulari).
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

## Comportament en mòbil

L'estàndard és **un de sol** per a totes les amplades: no hi ha components mòbils duplicats, només un breakpoint declarat. Tot es codifica a `settingsLayout.styled.ts`.

- **Breakpoint únic: `sm` (600px)** — `SETTINGS_MOBILE_BREAKPOINT`. És el de la **fila**, no el del panell: el panell canvia de nombre de columnes a `md` i a `lg`, i el que fa la fila a 600px no depèn de cap dels dos. Es tria `sm` i no `md` perquè `SettingsPanelLayout` ja apila les zones per sota de `md`: entre 600 i 900px la columna d'ajustos hi és sola i arriba a `SETTINGS_CONTROLS_WIDTH` (560px), prou perquè fins i tot el grup de cabell (7 toggles ≈ 399px) càpiga al costat del títol.
- **Fila apilada per sota de `sm`** — `settingRowInline` porta `flexDirection: { xs: "column", sm: "row" }`. El títol va a dalt i el control a sota. Això és l'excepció declarada a la regla de «títol-esquerra/control-dreta»: en pantalla estreta un grup de toggles llarg no hi cap mai, i val més un apilat predictible que un wrap accidental. **Excepció de l'excepció**: `control="compact"` (switch, mostra de color) no apila mai — sempre hi caben i apilar-los només afegiria scroll.
- **Control a amplada completa per sota de `sm`** — `settingControlWidth` porta `width: { xs: "100%" }` i `minWidth: { xs: 0 }`. El mínim de seguretat de 150px només té sentit quan el control comparteix línia amb el títol.
- **Indentació reduïda** — `SETTINGS_INDENT` és `{ xs: 1, sm: 3 }`. Recupera 16px d'amplada útil per fila sense perdre la lectura d'esquema en escriptori.
- **Els toggles no es redueixen** — els 55×55 de `StyledToggleButtonGroup` són ≥44px, el mínim WCAG de diana tàctil. En mòbil el grup ocupa tota l'amplada i els botons flueixen en dues files (`flexWrap` ja present al styled).
- **Preview acotat i sota l'AppBar** — a `SettingsPanelLayout`, el preview sticky porta `top: SETTINGS_APPBAR_OFFSET` (l'AppBar del diàleg és `position: fixed` per sota de `md`) i `maxHeight: SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT` (35vh) amb `overflow: auto`, perquè la mostra no deixi els controls fora de vista. L'acotació val **sempre per a la mostra**; el que no s'acota mai és la llista de `previewAside`, que queda en flux i es llegeix amb l'scroll de la pàgina.
- **L'offset és exactament l'alçada de la barra, i l'aire va per dins** — amb un `top` més gran que la barra, el contingut que passa per darrere de la mostra enganxada s'entreveu per la franja que queda entre les dues. La separació es fa amb el `padding` de dins de la caixa enganxada, que sí que va pintada.
- **En mòbil la zona de la mostra és `display: contents`** — un `sticky` només s'enganxa mentre el seu **pare** és a la vista, i el pare era la columna esquerra, tan alta com el seu contingut: la mostra se n'anava amunt tot just començar a baixar, justament quan es toquen els ajustos que ha d'ensenyar. Sense caixa, els fills passen a penjar del panell sencer i la mostra es queda visible mentre s'omple el formulari. Per això tant la mostra com la llista porten `width: 100%` en mòbil: sense caixa que les estiri, s'encongirien al contingut.
- **La llista de `previewAside` puja amb l'scroll, la mostra no** — en mòbil l'enganxada la fa **només** la mostra; el vocabulari desat es llegeix amb l'scroll de la pàgina, que és el que s'espera d'una llista.
- **La zona sticky sempre és opaca** — `bgcolor: "background.paper"`, el gris de la zona de configuració. Un bloc enganxat transparent deixa veure els controls passant-hi per sota i el text sembla flotar sobre la mostra. El fons coincideix amb el del panell, així que no s'hi veu cap costura.
- **La mostra ocupa tota l'amplada en mòbil i se centra a dins** — el contenidor de la mostra va a `width: 100%` amb el contingut centrat per `flex`, no a l'amplada del contingut. L'`alignItems="flex-start"` de la zona (necessari en escriptori) faria encongir la zona al contingut i deixaria el pictograma arrambat a l'esquerra de la pantalla; i un fons opac més estret que la pantalla no taparia el que passa per sota.
- **La fila és universal, el layout és per context** — `SettingRow` i les regles d'aquesta secció s'apliquen a *qualsevol* configuració de l'app (modal de settings, `PictEditForm`, panell de vista). `SettingsPanelLayout` és **exclusiu del modal de settings**; els contextos amb un layout responsive propi — com la graella `xs: "1fr"` / `md: "0.5fr 1.5fr"` de `PictEditForm` — el conserven.

## Estat de migració

- ✅ **Vista** (`ViewSettingsPanel`) — totes les files via `SettingRow`; els botons, via `SettingsActions`.
- ✅ **Usuari** (`UserSettingsPanel`) — `SettingsPanelLayout` **sense mostra** (la columna esquerra
  queda reservada i buida, perquè els ajustos caiguin on cauen als altres tabs) + `SectionTitle` +
  `SettingRow`: idiomes, tema, **Imatges**
  (qualitat de pujada, també sense compte: mana sobre el pes de l'esborrany i sobre el que
  s'imprimeix) i **L'espai del teu compte** (comptadors + llistat d'imatges), aquesta última
  només amb sessió. La llista d'imatges va dins d'un acordió **plegat per defecte**
  (`settingsAccordion`): els comptadors són el que es llegeix primer i la llista pot ser llarga.
  **La càrrega no es difereix**: es continua demanant en obrir el tab, de manera que desplegar és
  immediat i ningú no espera el servidor de Render havent-hi clicat.
- ✅ **Pictogrames** (`DefaultForm`) — `SettingsPanelLayout` + `SettingsPreviewFrame background="paper"` + **7 seccions**: Pictograma, Text i numeració, Lletra del text, Lletra dels números (si `numbered`), Vora exterior, Vora interior, Aparença (si `color`). Les 4 últimes es titulen soles des del propi card.
- ✅ **Vocabulari** (`VocabularySettingsPanel`) — columna esquerra = mostra (`preview`: `SettingsPreviewFrame` amb el pictograma centrat) + **llista de paraules desades** (`previewAside`: `WordProfileList`, amb la miniatura del pictograma de cada paraula); columna central = formulari clàssic (secció Paraula, secció Pictograma) amb els botons **al final i a la dreta**. Sense sessió el panell és el mateix layout amb el formulari d'entrada al mig: la pestanya no ha de saltar de lloc segons si hi ha sessió. Triar una paraula de la llista carrega el formulari en mode edició: la guia canvia, la fila queda seleccionada amb el distintiu «Editant» i els botons passen a «Cancel·lar / Actualitzar». Desar, actualitzar i esborrar confirmen amb `showSnackbar`. Reanomenar mentre s'edita mou la paraula (esborra l'antiga) i bloqueja el desat si el nom nou ja existeix.
- ✅ **Família `SettingCard`** — tots migrats a `SettingRow`. `card`, `cardAction` i `cardContent` **eliminats** de `SettingsCards.styled.ts`; només hi queden `cardTitle` (consumit per `SettingRow`) i `cardColor`.
- ✅ **`PictEditForm`** i **`VocabularySettingsPanel`** — hereten la fila nova pels components compartits, sense tocar el seu layout propi (regla «la fila és universal, el layout és per context»).
- ✅ **`GlobalViewControls`** — totes les files (mida pàgina, orientació, separació seqüències, direcció) via `SettingRow`. Component **compartit** amb la pàgina de visualització (`ViewSquenceSettings`); verificat visualment als dos llocs. **Només files**: no renderitza ni seccions ni botons d'acció — qui el consumeix decideix el `SectionTitle` que l'embolcalla i on van els botons.
- ✅ **`SequenceControlsPanel`** (ajustos per seqüència, dins la pàgina de vista) — «Aplica a totes» és un `SettingRow control="compact"`; dins de cada acordió, mida, separació i alineacions H/V són `SettingRow` amb `StyledToggleButtonGroup`. L'acordió és pla via `settingsAccordion`, compartit amb la llista d'imatges del compte.
- ✅ **`PrintFooterSection`** — l'autor de la seqüència té **secció pròpia** («Peu d'impressió») i va **sempre l'últim**, tant a la columna de la pàgina de vista com al tab Vista del modal. El motiu: és l'únic ajust que no canvia res a pantalla — només surt al peu del full imprès i del PDF (`CopyRight`, `@media print`). Per això el títol de secció diu on apareix, en comptes d'un genèric «Autoria».
- ✅ **Columna de configuració de la pàgina de vista** (`ViewSquenceSettings`) — 3 seccions: *Format de pàgina* (`GlobalViewControls`), *Seqüències* (`SequenceControlsPanel`) i *Peu d'impressió* (`PrintFooterSection`). Els dos botons van **després de totes**, perquè afecten totes les seccions: «Restaura les seqüències» (text) torna als valors desats i «Desa com a preferències» (contained) hi desa els actuals. El tooltip del segon diu on van a parar —al compte amb sessió, en aquest navegador sense—, que és l'única cosa que canvia entre els dos casos i no es pot descobrir després de prémer. Amplada de la columna: `VIEW_SETTINGS_COLUMN_WIDTH` (350px, a `ViewSequenceSettings.styled.ts`) — a 300px fins i tot els grups de toggles es partien; a 350 les files curtes i els toggles van en línia i només els títols llargs («Espai de pictogrames») es parteixen, perquè el mínim de 150px del control mana per damunt del `max-width: 33%`.

