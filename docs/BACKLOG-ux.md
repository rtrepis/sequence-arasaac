# Backlog d'UX i accessibilitat

Registre de les troballes obertes de la revisió d'UX de `apps/web/src` (auditoria de nomenclatura,
icones i accessibilitat). Existeix perquè les troballes que **no** es resolen en el moment de
detectar-les no es perdin al xat ni dins d'una pàgina publicada.

**Com es manté**

- Una entrada no s'esborra mai en resoldre-la: es marca `✅ Resolta` amb el commit o la branca. Així
  queda constància que s'ha mirat, i no es torna a proposar d'aquí sis mesos.
- Quan una entrada deixa de ser certa perquè el codi ha canviat per una altra via, es marca
  `➖ Caducada` amb el motiu. No és el mateix que resolta.
- En obrir una entrada nova cal **fitxer i línia**, per què importa per a l'usuari, i la proposta.
  Sense els tres, no és una entrada: és una opinió.
- Les referències de línia envelleixen. Val el nom del component i el símbol, no el número.

Llegenda d'estat: `🔴 Oberta` · `✅ Resolta` · `➖ Caducada`

---

## Gravetat alta

Risc real que l'usuari prengui l'acció equivocada, o exclusió d'accessibilitat.

### A1 — La seqüència no es desa mai sola ➖ Caducada

L'auditoria deia que `documentReducer` no tenia cap persistència. Ja no és cert: hi ha
`features/sequence/storage/draftStorage.ts` (IndexedDB), consumit per `useDocumentDraft` i muntat a
l'app via `DocumentDraftSync` a `LanguagesLayaut.tsx`. L'esborrany sobreviu a un refresc i a tancar
la pestanya.

**Residu que sí que queda obert** → vegeu A1b.

### A1b — Sortir amb feina no exportada no avisa ✅ Resolta

Branca `claude/a1b-closure-options-h6z8ha`. De les dues propostes originals s'ha triat la segona —
**indicador d'estat permanent**— i s'ha descartat l'avís de sortida (`beforeunload`): l'esborrany ja
fa que tancar la pestanya no perdi res, així que el diàleg del navegador cridaria al llop cada
vegada; a més el seu text no es pot traduir i a iOS Safari no és fiable.

El que hi ha ara és `DocumentStatusFab` (`features/sequence/components/DocumentStatusFab/`), un botó
flotant a baix a la dreta muntat a `LanguageLayout` (editor i visualitzador). La icona **és** l'estat
i, en prémer-la, s'obre la frase sencera més les accions que hi poden fer alguna cosa:

| Estat | Quan | Què diu |
|---|---|---|
| `pristine` | document buit | «Encara no hi ha res per desar» |
| `saving` | hi ha canvis encara no escrits a l'esborrany | «Desant en aquest dispositiu…» |
| `local` | esborrany al dia, cap còpia externa | «Només en aquest dispositiu, des de les {hora}» |
| `durable` | hi ha `.saac` baixat o desat al núvol posterior a l'últim canvi | «Descarregat en un fitxer / Desat al núvol a les {hora}» |
| `error` | el navegador no ha pogut escriure l'esborrany | «Aquest navegador no ha pogut desar la feina» |

**Vocabulari deliberat**: de l'esborrany no se'n diu mai «desat» a seques. Qui llegeix «desat» entén
que la feina és fora de perill, i l'esborrany no ho garanteix.

De passada tanca la regressió que havia obert l'esborrany mateix: **no hi havia cap manera de
començar de zero**. Recarregar era el reset de facto i des d'`981fe6b` restaura la feina. L'acció
«Document nou» (`startNewDocumentThunk`) buida contingut, títol i id, **esborra l'esborrany
d'IndexedDB** —si no, el primer refresc el ressuscitaria— i conserva la configuració per defecte,
que és de l'usuari i no del document. Si la feina no té còpia externa, abans demana confirmació amb
sortida per «Descarrega-ho abans».

### A2 — El menú contextual d'un pictograma era 100% en anglès ✅ Resolta

Branca `claude/analisi-opcions-a2-gi47yq` (commit `734d3c3`). `MouseActionList.lang.ts` amb
`defineMessages()` i els sis verbs traduïts als cinc idiomes; a més, les etiquetes diuen què fa
l'acció de debò («Paste (replaces)», «Insert empty after this», «Duplicate after this») en comptes
del verb sol.

L'entrada va quedar marcada oberta per descuit en crear aquest fitxer, ja amb el codi resolt;
verificat el 2026-08-22.

**Correcció al text original**: el menú **no** s'obre amb pulsació llarga, només amb clic dret
(`onContextMenu`) → vegeu A8.

### A3 — El botó d'imprimir s'anunciava com «view» ✅ Resolta

Branca `claude/analisis-opcions-a3-g9i913`. Els quatre botons només-icona de la barra d'eines de
`ViewSquenceSettings` prenen l'`aria-label` del mateix missatge que el tooltip
(`tooltipOrientation`, `tooltipPrint`, `tooltipDownloadPdf`, `tooltipFullscreen`). Cap clau de
traducció nova: ja existien totes.

Es va descartar deixar que el `Tooltip` de MUI posés sol l'`aria-label`: el fill del tooltip del PDF
és el `<span>` embolcall (necessari perquè el `Button` pot estar `disabled`), i l'etiqueta hi cauria
sobre un element sense rol, deixant el botó **sense cap nom**.

### A4 — «Horitzontal» i «Vertical» volien dir dues coses al mateix panell ✅ Resolta

Branca `claude/auditoria-a4-zlerpz`. L'orientació de pàgina té dos missatges propis
(`tooltipOrientationLandscape` / `tooltipOrientationPortrait`, «Pàgina apaïsada» / «Pàgina
vertical») i els de direcció passen a dir sobre què actuen («Seqüència en files» / «Seqüència en
columnes») en comptes de només l'eix. Cap control comparteix ja text amb l'altre.

Els ids `directionRow` / `directionColumn` es conserven perquè segueixen sent els de la direcció:
només canvia el text font i les cinc traduccions.

**Residu**: el títol de la fila de direcció continua sent el genèric «Direcció»; amb els tooltips
nous ja no és ambigu, i canviar-lo tocaria una clau compartida amb altres panells.

### A5 i A6 — Copiar/Duplicar compartien icona i el clip de paper volia dir «Enganxar» ✅ Resoltes

Branca `claude/auditoria-a5-a6-rsxta2`. Es van analitzar juntes perquè **per separat es
contradiuen**: la proposta d'A5 donava el porta-retalls a «Copiar» i la d'A6 el donava a
«Enganxar». Amb tres accions i un sol símbol de porta-retalls, resoldre'n una trencava l'altra.

Criteri final — **cada acció mostra què li passa a la seqüència**, no d'on ve la dada:

| Acció | Abans | Ara | Per què |
|---|---|---|---|
| Copiar | `AiOutlineCopy` | `AiOutlineCopy` (sense canvi) | Dos fulls **és** el símbol universal de copiar; el conflicte es resol traient-lo de «Duplicar», no de «Copiar» |
| Enganxar (substitueix) | `AiOutlinePaperClip` | `MdOutlineContentPaste` | El porta-retalls és la contrapartida dels dos fulls; el clip és «adjuntar fitxer» |
| Duplicar després d'aquest | `AiOutlineCopy` | `MdOutlineLibraryAdd` | Còpies apilades **amb «+»**: duplicar afegeix un pictograma; copiar no toca la seqüència |

El «+» queda com a senyal compartit de «això afegeix un pictograma a la seqüència»: el porten les
dues úniques accions que insereixen, `TbColumnInsertRight` («Insereix un buit després») i
`MdOutlineLibraryAdd` («Duplica després»).

**Descartat**: unificar tot el menú en una sola família d'icones. Tabler (l'única que cobreix
«inserir columna a la dreta») no té cap glif de duplicar amb «+» a la versió que porta
`react-icons@4`, i Material no en té cap d'«inserir després». Ant i Material es dibuixen igual
(traçat omplert), així que la família nova no desentona; la que ja hi desentonava — Tabler, de
traç — hi era abans d'aquest canvi. Vegeu la nota de C3.

### A7 — Generar el PDF no deia res: ni mentre, ni en acabar, ni si fallava ✅ Resolta

Branca `claude/a7-feedback-analysis-i6403g`.

L'entrada original només parlava del focus perdut pel `disabled`. En analitzar-la va resultar que
allò era **la meitat petita** del problema: el gris del botó era l'únic senyal de tot el procés
(import dinàmic de ~500 KB + `html2canvas` bloquejant el fil principal), l'estat final era idèntic a
l'inicial — ningú deia que el PDF s'hagués fet — i el `try/finally` **sense `catch`**, en un projecte
sense `ErrorBoundary` ni gestor d'`unhandledrejection`, feia que una fallada i un èxit es veiessin
exactament igual. Ni l'usuari se n'assabentava ni quedava rastre enlloc.

Criteri: **generar el PDF és una operació bloquejant i s'ha de comportar com les altres**. La regla
que l'app ja seguia sense tenir-la escrita (ara sí, a `CLAUDE.md` § *Estàndard de feedback
d'operacions*):

| Mecanisme | Quan | Precedents |
|---|---|---|
| Backdrop amb missatge + snackbar final | L'operació impedeix seguir treballant | desa/carrega al núvol, carrega `.saac` |
| Snackbar sol | Final d'acció instantània | descarrega `.saac`, `ApplyAll`, vocabulari |
| Progress determinat | Hi ha N passos comptables | `useSequentialSearch` |
| Spinner al botó + `aria-busy` | El botó és l'únic que canvia i l'app segueix viva | `UploadImageButton` |

Canvis:

- **`useDownloadPdf`** es fa càrrec del seu feedback (com `useSaveUiSettings` i `useDocumentDraft`):
  `showBackdrop` amb missatge concret mentre genera, snackbar d'èxit en acabar, `catch` que avisa amb
  el codi visible (10 s a pantalla) i `reportClientError("pdf-export", …)`. `classifyRequestFailure`
  ja converteix un `Error` pelat en `CLIENT_EXCEPTION`, i el `context` de l'API és string lliure
  validat amb zod: **cap canvi al backend**. `!contentEl` deixa de ser un retorn mut.
- **El botó** passa a `aria-disabled` + `aria-busy` amb guarda al handler; sense `disabled` ja no cal
  el `<span>` embolcall que A3 havia hagut de conservar.
- **`FeedbackBackdrop`** guanya `role="status"` + `aria-live="polite"`. Aquí és on la correcció deixa
  de ser un pedaç del botó de PDF: el backdrop no s'anunciava **enlloc**, així que també arregla desar
  al núvol, carregar del núvol i carregar un fitxer.
- El `trackEvent` que faltava (imprimir i fullscreen ja en tenien).

**Descartat**: barra de progrés determinada (`html2canvas` no reporta progrés i una barra aturada
menteix) i spinner dins el botó (amb el backdrop obert serien dos indicadors alhora).

### A8 — El menú contextual del pictograma no existeix en tàctil ✅ Resolta

Branca `claude/discussion-followup-sq7jo9`.

**Correcció de l'entrada original**: no eren les sis accions. Tocar el pictograma obre el `Dialog`
d'edició, així que **Editar** i **Esborrar** (el botó vermell del peu) sí que hi arribaven. Les que
no tenien cap altra porta eren quatre: **Copiar, Enganxar, Insereix un buit després i Duplica
després** — les que serveixen justament per construir la seqüència.

**Comprovat en un dispositiu real** (iPhone, Safari i Chrome): la pulsació llarga no obre el menú de
l'app, obre el **menú del sistema sobre la imatge** («Guardar imagen / Copiar / Compartir»). Al iOS
tots els navegadors van per sota amb WebKit, així que no n'hi ha cap que se salvi. No era, doncs,
«no passa res»: passava una cosa d'un altre programa que semblava resposta de l'app.

**Descartada la pulsació llarga pròpia**, que era la proposta original:

- Android i el tàctil de Windows **ja disparen `contextmenu`** en la pulsació llarga. Implementar-la
  a mà seria construir el gest per als únics dispositius que ja el tenen, i encara caldria suprimir
  el `click` posterior perquè no s'obrís també el diàleg d'edició.
- Al iOS caldria abans matar el menú del sistema i barallar-se amb l'arrossegament de la imatge, per
  acabar amb un gest amagat que exigeix mantenir el dit quiet mig segon — mal peatge en una app
  d'AAC, on part dels usuaris tenen tremolor o control motor fi limitat.
- I **branquejar per dispositiu no serveix**: des d'iPadOS 13, Safari de l'iPad s'identifica com a
  Macintosh. Una branca «iPhone / no iPhone» deixaria l'iPad —el dispositiu del problema— al camí
  equivocat.

**El que hi ha ara**, sense cap detecció de dispositiu i amb un sol camí per a tothom:

| Canvi | On |
|---|---|
| Menú d'accions al diàleg d'edició, amb les 4 accions sense altra via | `PictEditModal` (`MdMoreVert` a la capçalera) |
| Les accions són font única compartida amb el menú contextual | `usePictogramActions.ts` |
| El menú contextual surt **sota** la targeta i ja no la tapa | `anchorOrigin`/`transformOrigin` del `Popover` |
| El menú del sistema d'iOS deixa de sortir sobre el pictograma | `pictogramTrigger` (`-webkit-touch-callout`, `user-select`) |

**L'acció triada al diàleg s'executa quan el diàleg ja ha sortit de pantalla** (`TransitionProps.onExited`),
mai abans. `PictEditForm` guarda els seus canvis en estat local i només els desa en tancar-se: si
l'acció s'executés al moment, aquell desat **desfaria l'enganxada**. Mesurat, no suposat — amb
l'acció immediata, enganxar deixa el pictograma tal com estava i sembla que el menú no funcioni.
Ajornant-la, l'acció treballa sobre el pictograma al dia i duplicar arrossega el que s'acaba
d'escriure.

Cobert per `e2e/pictogram-actions.spec.ts` (4 proves: ancoratge del menú, quines accions surten al
diàleg, l'enganxada que no es desfà i el duplicat amb els canvis del formulari).

**Residus**: B7 (l'esborrat al mig del menú, sense desfer) i B8 (el porta-retalls invisible)
segueixen oberts — el menú del diàleg els hereta tots dos.

### A9 — El PDF pot sortir en blanc a l'iPad sense que ningú ho digui 🔴 Oberta

*(Trobada en resoldre A7, fora del seu abast.)*

- **On**: `features/print/hooks/useDownloadPdf.ts` — `html2canvas(contentEl, { scale: 3 })`
- **Per què importa**: a `scale: 3`, un A4 apaïsat són 3.141×2.154 px (6,8 Mpx) i un A3 apaïsat
  4.535×3.141 (14,2 Mpx); amb la mida FULLSCREEN les dimensions surten de `window.screen` i en una
  pantalla de 2.560×1.440 arriben a 33 Mpx. Safari d'iOS acota l'àrea del canvas i la mida màxima de
  costat, i quan es passa **no llança cap error**: retorna el canvas buit. El PDF surt en blanc — i
  ara, amb el snackbar d'A7, a sobre dirà que ha anat bé. L'iPad és el dispositiu típic de l'usuari
  d'AAC, el mateix motiu que fa greu A8.
- **Pendent de mesurar**: els números són calculats, no observats en un dispositiu real. Cal
  reproduir-ho abans de decidir el llindar.
- **Proposta**: derivar `scale` de l'àrea resultant (baixar a 2 o 1,5 quan es passa d'un llindar
  segur) i comprovar que el canvas no és buit abans de muntar el PDF; si ho és, fer-ho passar per la
  fallada que A7 ja reporta, en comptes de desar un full en blanc.


---

## Gravetat mitjana

Ambigüitat real, però amb context (posició, títol de secció) que ajuda a desfer-la.

### B1 — Una icona de núvol per a dues destinacions oposades 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` — `AiOutlineCloudDownload` per a «Descarrega» (seqüència →
  fitxer local) i per a «Carrega del núvol» (servidor → app)
- **Proposta**: icona pròpia per a «Carrega del núvol», diferenciada de la de fitxer local.

### B2 — L'engranatge porta a «Configuració» i també a «Administració» 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` — `AiOutlineSetting` reutilitzada per a dos destins
- **Per què importa**: «Administració» només surt per a comptes admin, però quan surt comparteix
  símbol amb els ajustos personals.
- **Proposta**: icona d'escut o de panell per a «Administració».

### B3 — El mateix «+» / «−» gestiona pictogrames i seqüències senceres 🔴 Oberta

- **On**: `PictogramAmount.tsx` i `TabsSequences.tsx` — `AiFillPlusCircle` / `AiFillMinusCircle` a
  totes dues
- **Per què importa**: conviuen a la mateixa pantalla d'edició amb la mateixa forma i color;
  només canvien de mida i posició. Esborrar una seqüència per error costa molt més que esborrar un
  pictograma.
- **Proposta**: reservar el cercle ple per a pictogrames; pàgina amb +/− per a seqüències.

### B4 — Tres etiquetes catalanes per al mateix destí 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` («Edita» / «Previsualitza») vs `TabsEditView.tsx` («Editar» /
  «Vista») — mateixes icones, mateix destí
- **Proposta**: un únic parell de missatges reutilitzat als dos llocs.

### B5 — Quatre textos per al botó «restaurar per defecte» 🔴 Oberta

- **On**: `DefaultForm`, `ViewSettingsPanel`, `ViewSquenceSettings`, `PictEditForm` —
  `MdSettingsBackupRestore` amb «Restableix» / «Restableix» / «Restaurar per defecte» / «Valors per
  defecte»
- **Per què importa**: l'abast real difereix (un pictograma / la vista / la sessió / tota la
  configuració), cosa que justifica un matís — però no quatre formulacions.
- **Proposta**: patró únic «Restaura [àmbit]».

### B6 — Els tooltips de seqüències són català hardcodat 🔴 Oberta

- **On**: `TabsSequences.tsx` — «Afegir seqüència» / «Eliminar última seqüència», únic component de
  la zona sense `react-intl`
- **Per què importa**: un usuari d'es/en/fr/it hi veu català sense traduir, justament als botons que
  afegeixen o eliminen una pàgina sencera.
- **Proposta**: `TabsSequences.lang.ts` amb els dos tooltips.

### B7 — «Esborrar» viu al mig del menú contextual, sense desfer 🔴 Oberta

*(Trobada en analitzar A5 i A6, fora del seu abast.)*

- **On**: `MouseActionList.tsx` — ordre actual: Copiar · Enganxar · Editar · **Esborrar** · Insereix
  buit · Duplica, sense cap `Divider`
- **Per què importa**: l'única acció irreversible del menú està encaixonada entre quatre
  d'inofensives i a un pas de «Editar», i l'app no té desfer (cap `undo` a `features/sequence`).
  «Enganxar» també sobreescriu el pictograma actual sense confirmació, tot i que l'etiqueta ho diu.
- **Proposta**: agrupar amb `Divider` (porta-retalls · inserir · esborrar) i deixar l'acció
  destructiva l'última. Confirmar l'esborrat és una decisió a part: afegeix fricció a una acció que
  es repeteix molt.

### B8 — El porta-retalls és invisible i «Enganxar» desactivat no s'explica 🔴 Oberta

*(Trobada en analitzar A5 i A6, fora del seu abast.)*

- **On**: `MouseActionList.tsx` (`disabled={pasteObject ? false : true}`) i
  `Modals/PictEditModalList/PictEditModalList.tsx` (l'estat `copyPictogram`)
- **Per què importa**: fins que no s'ha copiat res, «Enganxar» surt gris i el menú no diu per què;
  i quan sí que hi ha alguna cosa copiada, tampoc no es veu enlloc **quin** pictograma s'enganxarà.
  El porta-retalls viu en un `useState` que no es mostra mai.
- **Proposta**: text d'ajuda a la fila desactivada («Copia abans un pictograma») o, millor, una
  miniatura del pictograma copiat a la fila «Enganxar».

### B9 — El PDF de la mida FULLSCREEN es desa com si fos un A4 🔴 Oberta

*(Trobada en resoldre A7, fora del seu abast.)*

- **On**: `useDownloadPdf.ts` — `const pdfSize = pageFormat.size === "FULLSCREEN" ? "A4" : …`
- **Per què importa**: els mil·límetres (`widthMM`/`heightMM`) es calculen de `pageFormat.dimensions`,
  que amb FULLSCREEN són les de la pantalla, mentre que la pàgina del jsPDF és un A4. La imatge es
  col·loca a `0,0` amb una mida que no té res a veure amb el full: segons la pantalla surt escapçada
  o encongida en un racó. És mitjana i no alta perquè FULLSCREEN és una mida de pantalla, no de
  paper: qui la tria normalment mira, no imprimeix.
- **Proposta**: o generar el PDF amb format personalitzat (`format: [widthMM, heightMM]`), o no
  oferir la descàrrega quan la mida activa és FULLSCREEN.


---

### B9 — L'esborrany escriu el document sencer, imatges incloses, a cada canvi ✅ Resolta

Branca `claude/a1b-closure-options-h6z8ha`. Les imatges pujades han sortit del camí calent: van a un
magatzem propi d'IndexedDB (`draftImages`), s'hi escriuen **un sol cop** i el document en desa la
referència. El desat freqüent passa a ser l'esquelet, uns quants KB.

Mesurat al mateix Chromium, document de 24 pictogrames, mitjana de quatre escriptures:

| Imatges | Pes del document | Abans | Ara |
|---|---|---|---|
| 0 | 0,01 MB | 1,5 ms | 1,1 ms |
| 3 | 2 MB | 6,8 ms | 1,4 ms |
| 6 | 4 MB | 12,4 ms | 1,3 ms |
| 12 | 8 MB | 22,1 ms | 2,1 ms |

El cost deixa de dependre del pes del document. Comprovat també al navegador de debò amb una imatge
pujada: el registre de l'esborrany passa de 391 KB a 1 KB, la imatge (390 KB) queda una sola vegada
al magatzem, torna sencera en recarregar, i «Document nou» deixa els dos magatzems buits.

També s'ha afegit la comparació que evita reescriure el mateix document (el flush de
`visibilitychange` ho feia igualment). **No** s'ha fet el que quedava de la proposta —reutilitzar la
connexió i escriure en temps ociós— perquè amb el cost ja pla no compensa la complexitat: mantenir
una connexió oberta obliga a gestionar `onversionchange` i connexions tancades.

### B10 — Pujar una imatge congela la interfície mig segon llarg 🔴 Oberta

*(Trobada provant A1b, fora del seu abast.)*

- **On**: `utils/imageToBase64.ts` — `fileToBase64`
- **Per què importa**: tot passa al fil principal. Mesurat amb una foto de 4032×3024 en un Chromium
  d'escriptori: ~64 ms de `drawImage`, ~215 ms de `getImageData` per detectar transparència
  (3,24 M píxels) i fins a ~290-400 ms de `toDataURL` (cinc passades abaixant qualitat). Total
  ~0,6 s de pantalla congelada, i en tauleta uns quants segons. Abans d'`981fe6b` no es
  redimensionava, o sigui que aquesta feina és nova.
- **Proposta**: saltar-se l'escaneig d'alfa quan el fitxer d'origen no en pot tenir (un JPEG no té
  transparència); i moure la conversió a un worker amb `createImageBitmap` + `OffscreenCanvas`
  perquè no bloquegi la interfície.

## Gravetat baixa

Inconsistència de forma o deute intern, sense un moment concret d'acció equivocada.

### C1 — Diversos botons només mostren l'etiqueta en passar-hi el ratolí 🔴 Oberta

- **On**: `PictogramAmount`, `TabsSequences`, barra d'eines de vista
- **Per què importa**: en tàctil el hover no existeix; el tooltip no s'obre. És decisió de producte
  (fer lloc a etiquetes visibles), no un canvi de nomenclatura.

### C2 — «Eliminar» té tres representacions d'icona 🔴 Oberta

- **On**: `AiOutlineDelete` (menú contextual, càrrega de núvol) vs `MdDeleteOutline` (vocabulari,
  imatge pujada) vs sense icona (`PictEditModal`)
- El text sempre és clar, així que no indueix a error: és inconsistència visual.

### C3 — Quatre famílies d'icones barrejades sense patró 🔴 Oberta

- `react-icons/ai` (majoria), `/md` (barra de vista, restore), `/bs` (PDF, info), `/ri` (selector de
  tema), sense cap regla de quan toca cadascuna.
- **Proposta**: un estàndard d'icones a `CLAUDE.md`, com ja n'hi ha per a colors i per a tabs.
- **Nota (A5/A6)**: el menú contextual ara barreja `ai` (copiar, editar, esborrar), `md` (enganxar,
  duplicar) i `tb` (inserir). És deliberat i documentat a A5/A6: cap família sola cobreix els sis
  verbs. Ant i Material comparteixen dibuix (traçat omplert); qui desentona és Tabler, de traç. Si
  algun dia es fixa l'estàndard, aquest menú és el cas de prova.

### C4 — Components morts i col·lisió de traduccions 🔴 Oberta

Verificat el 2026-08-22:

| Element | Problema |
|---|---|
| `ToggleButtonEditViewPages` | Cap import extern. Substituït per `TabsEditView`, però manté el seu `.lang.ts` amb «Edit»/«View» hardcodats |
| `ButtonWithFileLoad` | Cap import extern |
| `CopyRightSpeedDial` | `BarNavigation` l'importa però no el renderitza mai: el racó inferior dret era lliure quan s'hi va posar `DocumentStatusFab` (A1b) |
| `ButtonWithModalDownload/ButtonWithModalDonwload.tsx` | El botó no s'importa enlloc; només se'n fa servir `ModalDownload.tsx` (des d'`AppNavigationDrawer`) |
| `components.pictEdit.reset` | Definit dos cops: `PictEditForm.lang.ts` (usat, «Restore») i `PictEditModal/PictEdit.lang.ts` (no usat, «Reset to defaults») — mateix id, dos textos font |
| Missatges orfes | `upload`, `download`, `openMenu`, `langSelector`… a `BarNavigation.lang.ts` i `AppNavigationDrawer.lang.ts`, sense consumidor |

**Per què importa**: no confon l'usuari final, però tocar `components.pictEdit.reset` en un dels dos
fitxers pot canviar silenciosament el text de l'altre.

### C5 — `aria-label` en anglès literal als grups de toggles 🔴 Oberta

*(Trobada en analitzar A3, fora del seu abast.)*

- **On**: `SequenceControlsPanel.tsx` i `Modals/DefaultSettingsModal/ViewSettingsPanel.tsx` (`left`,
  `center`, `right`, `top`, `bottom`), `TabsSequences.tsx` (`sequence number`),
  `ToggleButtonEditViewPages.tsx` (`Toggle view/edit`, `edit`, `view` — component mort, vegeu C4).
  `GlobalViewControls.tsx` (`landscape`, `portrait`, `row`, `column`) ja no hi és: en resoldre A4
  els seus quatre toggles prenen l'`aria-label` del mateix missatge que el tooltip.
- **Per què importa**: mateixa causa que A3, però molt menys greu: aquests toggles viuen dins d'un
  `SettingRow` amb títol traduït, així que el context el dona la fila. Tot i així són noms
  accessibles en anglès en una app de 5 idiomes.
- **Proposta**: un `IconActionButton` compartit que prengui **un sol** missatge i en derivi tooltip i
  `aria-label`, de manera que no puguin tornar a divergir. Val la pena si es fa d'una tirada per a
  tots els casos; component a component no compensa el diff.

### C6 — Deute menut del menú contextual ✅ Resolta

Branca `claude/discussion-followup-sq7jo9`, de retruc en reescriure `MouseActionList` per compartir
les accions amb el diàleg (A8).

- L'`/* eslint-disable @typescript-eslint/no-unused-expressions */` de tot el fitxer ha desaparegut:
  els dos `x && x(...)` que el motivaven viuen ara a `usePictogramActions` com a `copyAction?.(…)`.
- L'`aria-labelledby` ja no apunta a `nested-list-subheader`, un id genèric heretat de l'exemple de
  MUI, sinó a `pictogram-actions-{índex}`. A més d'anomenar el que hi ha, evita ids repetits al DOM:
  la mateixa llista es pot muntar des del menú contextual o des del diàleg.

### C7 — El snackbar tapa el botó flotant d'estat en mòbil 🔴 Oberta

*(Trobada en implementar A1b.)*

- **On**: `context/FeedbackContext/FeedbackSnackbar.tsx` — `anchorOrigin` a `bottom/center`
- **Per què importa**: per sota de `sm` el `Snackbar` de MUI ocupa gairebé tota l'amplada inferior i
  se superposa al `DocumentStatusFab`, que viu a `bottom: 16, right: 16`. Dura els segons de
  l'avís, però és justament quan l'usuari acaba de desar i pot voler mirar l'estat.
- **Proposta**: pujar el FAB mentre hi hagi snackbar obert, o ancorar el snackbar a l'esquerra en
  mòbil.

### C8 — A «Descarrega», l'estat inicial de la casella de configuració no és el que es veu 🔴 Oberta

- **On**: `components/ButtonWithModalDownload/ModalDownload.tsx` — `useState` de `save`
- **Per què importa**: `save.defaultSettings` s'inicialitza a `documentSaacIsNotEmpty` (cert quan hi
  ha seqüència) mentre la casella es pinta desmarcada (`<Checkbox />` sense `defaultChecked`). Qui
  no la toca s'endú la configuració dins del `.saac` sense haver-ho demanat.
- **Proposta**: una sola font per a l'estat de cada casella; que el que es pinta i el que es desa
  siguin el mateix valor.
