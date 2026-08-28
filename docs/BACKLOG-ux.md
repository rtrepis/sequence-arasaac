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

### A9 — El PDF pot sortir en blanc a l'iPad sense que ningú ho digui ✅ Resolta

Branca `claude/seguim-avui-v3tpm2`. Dues coses, i la segona és la que compta.

**El sostre de la captura.** `scale` ja no és `3` fix: surt de `captureScaleFor`, que respecta un
màxim d'àrea (16,7 Mpx) i un màxim de costat (4.096 px) —els límits publicats de Safari a iOS— amb
terra a 1×. Amb les dimensions reals de cada format:

| Format | Full (px CSS) | Abans (3×) | Ara | dpi |
|---|---|---|---|---|
| A4, qualsevol orientació | 718×1.047 | 2.154×3.141, 6,8 Mpx | igual | 288 |
| A3, qualsevol orientació | 1.047×1.512 | 3.141×4.536 — **costat fora de límit** | 2.836×4.096 | 260 |
| FULLSCREEN 1.366×1.024 | 1.366×1.024 | 4.098×3.072 — **costat fora de límit** | 4.096×3.071 | 288 |
| FULLSCREEN 2.560×1.440 | 2.560×1.440 | 7.680×4.320, 33,2 Mpx — **fora** | 4.096×2.304 | 154 |

El sostre s'aplica a tots els navegadors i no només a Safari: l'únic cost real és l'A3 baixant de
288 a 260 dpi, invisible al paper, i a canvi no cal cap branca per navegador ni endevinar la versió
d'iOS.

**Els límits segueixen sense mesurar-se en un iPad**, que és el que l'entrada demanava; això queda
obert a B14. Per això la
part que de debò tanca la troballa és l'altra: `isCanvasBlank` mira una mostra de píxels de la
captura i, si tot és transparent (el que retorna Safari quan no ha pogut fer-la), la generació
falla amb codi propi `PDF_EMPTY_CANVAS` pel mateix camí que A7 ja havia obert —snackbar amb el codi
i `reportClientError`— en comptes de desar un full en blanc i dir que ha anat bé. Si el llindar
triat és massa alt, ara es veurà i quedarà registrat; abans no.

**Provat** a `e2e/download-pdf-page-format.spec.ts`: amb `getImageData` retornant alfa 0, es
mostra l'error amb el codi, no s'anuncia cap èxit i **no es descarrega cap fitxer**. Sense el guard
la prova falla: el PDF en blanc es desava amb el missatge d'èxit.

### A10 — Un document desat al núvol torna com a «Només en aquest dispositiu» ✅ Resolta

*(Trobada a l'estudi de què passa en tornar més tard a la pestanya, branca `claude/app-behavior-inactive-tab-p2vc2l`.)*

- **On**: `useDocumentDraft.ts` (l'efecte de restauració, que despatxa
  `documentStatusRestored` amb `changedAt: draft.savedAt`) i `documentStatusSlice.ts`
  (`getDocumentDurability`).
- **Per què importa**: la durabilitat viatja dins de l'esborrany precisament perquè recarregar no
  faci semblar feina perduda la que ja és al núvol —ho diu el comentari de `DraftMeta`—, i en canvi
  no se'n surt **mai**. L'esborrany s'escriu 1 s després de desar (debounce), o sigui que `savedAt`
  sempre és posterior a `durableAt`; en restaurar-lo com a `changedAt`, la comparació
  `changedAt <= durableAt` de `getDocumentDurability` falla i l'estat cau a `local`. Traçat amb els
  valors reals: en memòria `durable`, després de recarregar `local`. No és un cas de frontera, és
  el cas normal: qualsevol pestanya descartada pel navegador i recuperada, o un simple refresc,
  torna dient que la feina no és enlloc. L'usuari que se'l creu torna a desar —desperta Render,
  torna a pujar les imatges i torna a passar per la quota— per res.
- **Proposta**: portar `changedAt` dins de `DraftMeta` i restaurar-lo tal qual, en comptes de
  suplantar-lo amb `savedAt`. Per als esborranys ja escrits sense el camp, `durableAt ?? savedAt`
  conserva el comportament d'avui sense mentir en el cas durador.
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`: `changedAt` viatja dins de
  `DraftMeta` i la restauració el llegeix tal com és, amb `durableAt ?? savedAt` de recanvi per als
  esborranys antics. Un canvi de format de pàgina escriu l'esborrany però **no** toca `changedAt`:
  no és contingut del document i no viatja ni al `.saac` ni al núvol. Fixat a
  `e2e/draft-restore.spec.ts`, que abans del canvi falla.

### A11 — La sessió pot haver caducat i l'app continua dient que hi ha sessió 🔴 Oberta

*(Mateixa branca.)*

- **On**: `apiClient.ts` (el `catch (refreshError)` de l'interceptor de resposta, que fa
  `setAccessToken(null)` i prou), `authSlice.ts` (`clearAuthState`, **exportat i no usat enlloc**) i
  `AuthModal.lang.ts` (no hi ha missatge per a `REFRESH_TOKEN_EXPIRED` ni `REFRESH_TOKEN_MISSING`).
- **Per què importa**: el token d'accés dura 15 minuts i no es renova sol —no hi ha cap temporitzador
  de refresc—, així que qui torna a la pestanya l'endemà el té mort. Normalment no es nota: el 401
  dispara el refresc i la cookie de 7 dies el resol. Però quan el refresc **falla** (cookie caducada,
  sessió tancada en una altra pestanya, compte suspès des del panell), l'única cosa que passa és que
  el token de memòria es posa a `null`. Redux continua amb `accessToken` i `userEmail`, la barra
  continua dient qui ets, el botó flotant continua oferint «Desa al núvol» i el diàleg de desar
  ensenya el genèric `DOCUMENT_SAVE_ERROR` perquè el codi que arriba no té traducció. L'usuari acaba
  reintentant una acció que no pot funcionar mai, amb la feina només a l'esborrany.
- **Proposta**: que el `catch` del refresc avisi l'app (un `store.dispatch(clearAuthState())` des del
  mòdul que munta l'store, o un esdeveniment que hi escolti), i que en netejar-la surti un snackbar
  que digui les dues coses que importen: la sessió ha caducat i **la feina no s'ha perdut** —és a
  l'esborrany— però cal tornar a entrar per desar-la al núvol. Amb missatges propis per als dos
  codis de refresc.

---

## Gravetat mitjana

Ambigüitat real, però amb context (posició, títol de secció) que ajuda a desfer-la.

### B1 — Una icona de núvol per a dues destinacions oposades ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

En mirar-ho de prop el problema era més gros que l'entrada: **el núvol el portaven les dues
operacions que no el toquen**, i la que hi va de debò portava un disquet.

| Ítem | Abans | Ara |
|---|---|---|
| Descarrega (→ fitxer al dispositiu) | `AiOutlineCloudDownload` ☁︎↓ | `AiOutlineDownload` ↓ |
| Carrega (← fitxer del dispositiu) | `AiOutlineCloudUpload` ☁︎↑ | `AiOutlineFolderOpen` 🗀 |
| Desa al núvol (→ servidor) | `AiOutlineSave` (disquet) | `AiOutlineCloudUpload` ☁︎↑ |
| Carrega del núvol (← servidor) | `AiOutlineCloudDownload` ☁︎↓ | *(igual)* |

- **El núvol només surt quan hi ha servidor.** Importa més en aquesta app que en una altra: la
  durabilitat hi té tres nivells (esborrany / fitxer / núvol) i el `DocumentStatusFab` existeix
  només per explicar on és la feina. Si les icones menteixen sobre quin nivell toca una acció,
  contradiuen el component que hi ha per aclarir-ho.
- **No ho decideix el gust: ho decideix `DocumentStatusFab`**, que ja feia servir aquest sistema
  (`MdOutlineCloudUpload` per a desar al núvol, `MdOutlineFileDownload` —sense núvol— per a
  descarregar). Qui anava per lliure era el drawer.
- «Carrega» acaba en carpeta oberta i no en `AiOutlineUpload`: amb les fletxes, «Descarrega» i
  «Carrega» quedaven **el mateix dibuix mirallat**, i de costat en una llista a 24px no es
  distingien (verificat amb captura). La carpeta, a més, diu la veritat: no es puja res enlloc, es
  tria un fitxer.
- Quedaven amb la icona antiga `ButtonWithFileLoad` i `ButtonWithModalDownload`, que eren codi
  mort; C4 els ha esborrat.

### B2 — L'engranatge porta a «Configuració» i també a «Administració» ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- «Administració» passa a `AiOutlineSafety` (escut), la primera opció que proposava l'entrada.
- Provats i descartats: `AiOutlineDashboard` **és un velocímetre** —parla de rendiment, no de
  panell— i `AiOutlineControl` (comandaments) s'assemblava massa a l'engranatge que precisament
  havíem de deixar de repetir. `AiOutlineAppstore` (graella) servia però no diu res de qui hi pot
  entrar. L'escut sí: el que separa `/admin` dels ajustos personals és que és **zona restringida**.
- **Troballa nova, no resolta**: l'ítem del drawer és `primary="Administració"` **hardcodat**,
  mentre tots els altres passen per `react-intl`. L'excepció declarada al `CLAUDE.md` és que la
  *pàgina* `/admin` va només en català; el drawer no hi entra, i un admin amb l'app en francès hi
  veu una paraula catalana. És un missatge, però no toca a B2. Vegeu C13.

### B3 — El mateix «+» / «−» gestiona pictogrames i seqüències senceres ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- El **cercle ple** (`AiFillPlusCircle` / `AiFillMinusCircle`) queda reservat als pictogrames
  (`PictogramAmount`). Les seqüències passen a **pàgina amb +/−**
  (`BsFileEarmarkPlus` / `BsFileEarmarkMinus`), tal com proposava l'entrada.
- Cal l'**«earmark»**: `BsFilePlus` es dibuixa com un rectangle arrodonit i es llegia com un botó
  qualsevol; amb la cantonada doblegada sí que es llegeix com un full. Descartat el parell de
  Tabler pel motiu que ja diu C3 (és de traç i desentona amb Ant i Material).
- És `bs`, una família que l'app ja fa servir i que és a la mateixa pantalla (`BsInfoCircle`, dins
  del mateix `PictogramAmount`).
- **El que això no arregla**: `deleteLastSequence` esborra la seqüència sencera amb tots els seus
  pictogrames, **sense confirmació i sense desfer**. La icona ara distingeix l'abast, però la
  xarxa de seguretat continua sense existir. Vegeu C14.

### B4 — Tres etiquetes catalanes per al mateix destí ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- Els dos parells de missatges (`components.appNavigationDrawer.editView`/`previewView` i
  `components.toggleButtonEditViewPages.edit`/`view.title`) s'han fos en un de sol,
  `shared.navigation.edit` / `shared.navigation.view`, a `src/shared/messages/navigation.lang.ts`.
  Els consumeixen `TabsEditView` i `AppNavigationDrawer`.
- El parell unificat és **«Edició» / «Vista»**: noms als dos costats. Els tres candidats eren
  «Editar/Vista» (el dels tabs), «Edita/Previsualitza» (el del drawer) i aquest.
- Mana el nom perquè l'app ja separa **destins (noms)** d'**accions (verbs)** —al drawer, Inici ·
  Novetats · Configuració contra Descarrega · Carrega— i perquè l'altra tira de tabs, la del modal
  de configuracions, és tota de noms (Usuari · Pictogrames · **Vista** · Vocabulari personal).
  `Editar / Vista` era l'únic parell desaparellat de l'app, i qui hi desentonava era «Editar»:
  «Vista» ja és com la configuració anomena aquesta mateixa pàgina.
- L'argument decisiu és l'estàndard de mòbil: per sota de `sm` **el tab seleccionat és l'únic que
  conserva el text**, o sigui que aquell text diu *on ets*, no *què pots fer*. Un infinitiu com a
  única etiqueta visible es llegeix com una acció pendent quan de fet ja hi ets. I no costa amplada:
  «Edició» són els mateixos sis caràcters que «Editar».
- **La regla és per idioma, no una traducció mecànica**: canvien ca («Edició»), es («Edición») i fr
  («Édition», que a més treu l'anglicisme «Éditer» — l'estàndard francès de menús és *Édition*). En
  queden fora **en** («Edit») i **it** («Modifica»), perquè en aquestes dues llengües el terme
  estàndard del menú ja és el que hi havia i «Editing» hi sonaria estrany.
- Els ids porten el prefix `shared.` i no el nom d'un component, perquè el destí és de l'app i no de
  qui hi porta. Els antics anomenaven `toggleButtonEditViewPages`, un component que ja no existeix.
- Fixat a `e2e/accessible-names.spec.ts`: el tab i l'ítem del drawer han de dir el mateix.

### B5 — Quatre textos per al botó «restaurar per defecte» ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

Patró únic **«Restaura [àmbit]»**: el verb no canvia mai, l'àmbit sí, i el tooltip diu **a quins
valors** torna, que és on els quatre botons de debò es diferencien.

| Component | Botó | Tooltip |
|---|---|---|
| `PictEditForm` | Restaura el pictograma | Torna aquest pictograma als teus valors per defecte |
| `DefaultForm` | Restaura els pictogrames | Torna la configuració de pictogrames als valors de fàbrica |
| `ViewSettingsPanel` | Restaura la vista | Torna la configuració de vista als valors de fàbrica |
| `ViewSquenceSettings` | Restaura les seqüències | Torna totes les seqüències a la teva configuració desada |

- Els dos primers van a valors **de l'usuari**; els dos del mig, a valors **de fàbrica**. El matís
  que justificava el desori ara viu al tooltip, no en quatre verbs diferents.
- `PictEditForm` era l'únic sense tooltip: n'hi hem posat un, perquè «Restaura el pictograma» sol no
  diu a quins valors.
- Els quatre `Tooltip` porten ara **`describeChild`**. Sense això MUI posa el títol com a
  `aria-label` del fill i **tapa el text visible del botó**: el nom accessible passava a ser el
  tooltip sencer, que no conté l'etiqueta que es veu (WCAG 2.5.3, «Label in Name», i qui fa servir
  control per veu no pot dir el que llegeix). Amb `describeChild` el tooltip és `aria-describedby` i
  el botó conserva el seu text. No aplica als botons només-icona, on el tooltip **és** el nom.
- Resol de passada la col·lisió de `components.pictEdit.reset` que apuntava C4: la definició no
  usada de `Modals/PictEditModal/PictEdit.lang.ts` s'ha esborrat, perquè en canviar el text les dues
  haurien divergit en silenci.

### B6 — Els tooltips de seqüències són català hardcodat ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- `TabsSequences.lang.ts` nou, amb tres missatges als cinc idiomes: «Afegeix una seqüència»,
  «Elimina l'última seqüència» i «Número de seqüència».
- El tercer és l'`aria-label` de les dues `Tabs` (mòbil i escriptori), que deia `sequence number` en
  anglès. Entrava per C5 i s'ha resolt aquí perquè és el mateix fitxer.
- Els dos `IconButton` porten ara `aria-label` propi. Abans el nom accessible el posava el `Tooltip`
  al `<span>` embolcallador, cosa que funcionava però deixava el botó sense nom si algun dia es treu
  el tooltip; i era el que obligava els e2e a localitzar-lo amb `[aria-label="…"] button`.
- Les dues proves e2e de `multiple-sequences` que hi apuntaven s'han actualitzat al selector directe
  `button[aria-label="Afegeix una seqüència"]`.

### B7 — «Esborrar» viu al mig del menú contextual, sense desfer ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`. Resolta amb C14, que és la meitat que hi faltava.

Ordre nou, en quatre grups separats per `Divider`:

| Grup | Accions |
|---|---|
| El que més es fa | Edita |
| Porta-retalls | Copia · Enganxa (substitueix) |
| Afegir | Insereix un buit a continuació · Duplica a continuació |
| Irreversible | **Elimina** — sol, l'últim i en `error.main` |

- «Edita» puja al capdamunt: era la tercera sense cap motiu i és la que més es
  pitja quan s'obre el menú d'un pictograma.
- **No es confirma, i és deliberat**, tal com deia la proposta: treure un pictograma es repeteix
  molt i es refà amb un clic. La protecció aquí és la distància i el color, no un diàleg. El
  criteri és **quant costa refer-ho**, i per això esborrar una seqüència sencera (C14) sí que el
  demana. Tenir els dos casos resolts alhora és el que fa que el criteri es pugui llegir.
- Un grup que es queda buit per `omit` no deixa cap separador penjat: el diàleg d'edició, que
  omet accions que ja ofereix pel seu compte, no ha de quedar amb línies de més.

### B8 — El porta-retalls és invisible i «Enganxar» desactivat no s'explica 🔴 Oberta

*(Trobada en analitzar A5 i A6, fora del seu abast.)*

- **On**: `MouseActionList.tsx` (`disabled={pasteObject ? false : true}`) i
  `Modals/PictEditModalList/PictEditModalList.tsx` (l'estat `copyPictogram`)
- **Per què importa**: fins que no s'ha copiat res, «Enganxar» surt gris i el menú no diu per què;
  i quan sí que hi ha alguna cosa copiada, tampoc no es veu enlloc **quin** pictograma s'enganxarà.
  El porta-retalls viu en un `useState` que no es mostra mai.
- **Proposta**: text d'ajuda a la fila desactivada («Copia abans un pictograma») o, millor, una
  miniatura del pictograma copiat a la fila «Enganxar».

### B9 — El PDF de la mida FULLSCREEN es desa com si fos un A4 ✅ Resolta, amb correcció

Branca `claude/seguim-avui-v3tpm2`.

**La correcció primer**: l'entrada donava per fet que aquell full escapçat arribava a l'usuari, i
no hi arriba. Amb la mida FULLSCREEN, `ViewSquenceSettings` **no renderitza el botó de PDF** (ni el
d'imprimir): amb `isFullscreen` la barra només ofereix «pantalla completa». La segona proposta de
l'entrada —«no oferir la descàrrega quan la mida activa és FULLSCREEN»— ja estava feta des d'abans
d'escriure-la. Era, doncs, un defecte latent en una branca inabastable, no un full escapçat que
ningú es trobés.

**Què s'ha fet igualment.** El `pdfSize = … ? "A4" : …` era una trampa per a qui reobrís el botó, i
el hook accepta qualsevol `PageFormat` vingui d'on vingui. Ara el full es fa a mida amb
`format: [widthMM, heightMM]` quan la mida és FULLSCREEN, que és la primera proposta de l'entrada.

**I una cosa que sí que arribava a tothom**, trobada pel camí: la imatge es col·locava a `0,0`
també amb A4 i A3, però les dimensions d'aquests formats són les **útils** (el paper menys els
marges de 10 mm). El resultat era el full enganxat al cantó superior esquerre i 20 mm de marge
acumulats a la dreta i a baix, en comptes de 10 a cada costat. Ara es centra amb la mida real de la
pàgina (`pdf.internal.pageSize`), cosa que amb FULLSCREEN dona desplaçament 0 sense cap cas especial.

**Provat** a `e2e/download-pdf-page-format.spec.ts`, llegint el fitxer generat i no la pantalla: el
`/MediaBox` és un A4 i la matriu de col·locació de la imatge deixa 28,32 pt (10 mm exactes) a cada
costat. Sense l'arranjament la prova falla amb 0. Una segona prova fixa que amb FULLSCREEN no
s'ofereix la descàrrega, perquè qui torni a oferir-la vegi que hi havia una prova esperant-lo.

### B10 — L'esborrany escriu el document sencer, imatges incloses, a cada canvi ✅ Resolta

*(Oberta com a «B9» per error: ja hi havia un B9 —el del PDF en FULLSCREEN— i el fitxer va quedar
amb dues entrades amb el mateix número. Renumerada aquí; el contingut no ha canviat.)*

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

### B11 — Pujar una imatge congela la interfície mig segon llarg 🔴 Oberta

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

### B12 — Els documents del núvol no es podien distingir l'un de l'altre ✅ Resolta

Branca `claude/document-limit-users-sjig8o` (PR #238).

- **Què passava**: «Desa al núvol» enviava el document **sense títol** i el llistat l'anomenava amb
  els últims sis caràcters de l'identificador (`Document a3f9c1`). Amb el sostre de documents
  baixat de 30 a **3** per compte, triar quin s'esborra per fer lloc passava a ser una endevinalla
  amb tres noms il·legibles i la data de modificació com a únic senyal.
- **Què hi ha ara**:
  - `SaveDocumentModal` demana el nom abans de desar, **preomplert** amb les quatre primeres
    paraules de la seqüència (`suggestDocumentTitle`): acceptar la proposta costa el mateix que no
    posar-hi nom, que és l'única manera que la casella no es converteixi en un peatge.
  - `LoadDocumentModal` ensenya una **miniatura** de cada document —els tres primers pictogrames—
    derivada al servidor en desar (`modules/documents/thumbnail.ts`). Són referències, no imatges
    noves: reconèixer la seqüència pel dibuix no havia de costar ni Cloudinary ni quota de l'usuari.
    Els documents desats abans del camp la tenen buida i surten amb icona genèrica.
  - Progrés real de pujada i baixada (events d'axios a `documentTransfer.ts`) i snackbar en desar,
    carregar i esborrar.

**Nota de vocabulari**: el nom viu al document, no al diàleg, i per això sobreviu a l'esborrany
d'IndexedDB i al fitxer `.saac`.

### B13 — Amb tres documents de sostre, ningú diu quants te'n queden 🔴 Oberta

*(Trobada en baixar el límit a B12, fora del seu abast.)*

- **On**: `features/backend/documents/components/` — ni `SaveDocumentModal` ni `LoadDocumentModal`
  mostren el consum; el sostre és a `apps/api/src/shared/tierLimits.ts` (`documents: 3`) i l'usuari
  només el descobreix quan `QUOTA_DOCUMENTS_EXCEEDED` li rebota el desat.
- **Per què importa**: amb 30 documents, topar-hi era rar; amb 3 és el cas normal. El missatge
  d'error arriba **després** d'haver escrit el nom i haver esperat la pujada, que és el pitjor
  moment per descobrir que calia esborrar-ne un abans.
- **Proposta**: ensenyar «2 de 3 documents» al diàleg de càrrega i al de desat, i avisar-ne abans
  d'enviar res quan ja s'és al límit i el document és nou. El comptador ja existeix al servidor
  (`usage.documentsCount` de l'usuari) però avui no viatja enlloc: caldria exposar-lo, per exemple
  amb els límits efectius, a la resposta de `GET /documents`.

### B14 — El sostre del canvas del PDF és un valor publicat, no un valor mesurat 🔴 Oberta

*(Residu d'A9: era la seva condició de «pendent de mesurar» i no s'ha pogut fer.)*

- **On**: `features/print/hooks/useDownloadPdf.ts` — `MAX_CANVAS_AREA_PX` (16.777.216) i
  `MAX_CANVAS_SIDE_PX` (4.096), que alimenten `captureScaleFor`
- **Per què importa**: A9 va tancar la part que compta —una captura en blanc ja no es desa dient
  que ha anat bé—, però l'escala a partir de la qual es rebaixa la resolució surt dels límits
  **publicats** de Safari a iOS, no d'haver-ho provat en un iPad. Els dos errors possibles són
  reals i oposats: si el sostre és massa baix, tothom perd qualitat sense necessitat (l'A3 ja baixa
  a 260 dpi i una pantalla de 2.560×1.440 a 154); si és massa alt, l'usuari es troba un error en
  comptes d'un PDF. Els límits també varien per versió d'iOS i per memòria del dispositiu, de manera
  que el número «correcte» pot no ser un de sol.
- **Com comprovar-ho**: generar el PDF en un iPad real amb A3 i amb pantalla sencera, i mirar si
  el `PDF_EMPTY_CANVAS` apareix al registre d'errors del client (`context: "pdf-export"`), que és
  precisament per a què serveix.
- **Fet**: l'informe porta el detall que cal per decidir-ho —format, mida del full, escala aplicada
  i dimensions del canvas resultant (`A4 landscape full 1047×718, escala 3.00, canvas 3141×2156`)—
  i el servidor ja hi desa el `userAgent`. Quan es va obrir aquesta entrada l'informe només portava
  el codi, o sigui que un cas real hauria dit que la captura va sortir en blanc **sense dir a quina
  mida**, que és l'únic número que fa falta.
- **Més urgent des de B16**: mentre la captura sortia reduïda per l'escala visual, el sostre es
  calculava sobre unes dimensions més grans que les reals i **sobrava marge sense saber-ho**. Ara ja
  no: l'A3 apaïsat va exactament als 4.096 px de costat que Safari publica. O sigui que el número
  publicat ha passat de ser un coixí a ser la vora, i validar-lo amb casos reals deixa de ser una
  comoditat.
- **Proposta**: esperar a tenir casos reals al registre abans de tocar cap número. Si no n'hi ha
  cap en un temps raonable, provar de pujar el costat a 8.192 (el límit dels iOS moderns) i veure
  si en surten; si en surten, el valor conservador d'ara ja era el bo.

### B15 — Amb la mida «pantalla sencera» no es pot exportar res ✅ Resolta (decisió de producte)

*(Trobada en resoldre B9.)*

- **On**: `components/ViewSequencesSettings/ViewSquenceSettings.tsx` — amb `isFullscreen` la barra
  d'eines només ofereix «pantalla completa»: ni imprimir ni PDF.
- **Per què importa**: és deliberat i té sentit (és una mida de pantalla, no de paper), però no es
  diu enlloc. Qui tria «pantalla sencera» veu desaparèixer dos botons sense cap explicació, i la
  manera de recuperar-los és endevinar que depenen de la mida de pàgina. Ara, a més, el hook ja
  genera correctament un full a mida de pantalla, o sigui que la restricció és de producte i no
  tècnica.
- **Proposta**: decidir-ho explícitament. O bé oferir el PDF també aquí —el full sortirà de la mida
  de la pantalla, que és el que la mida promet— o bé dir per què no hi és, en comptes de fer
  desaparèixer els botons en silenci.
- **Decidit (2026-08-26)**: **es queda com està, i sense explicació.** «Pantalla sencera» és una
  mida de pantalla, i cada pantalla en té una de diferent: un PDF fet des d'aquí no seria
  reutilitzable enlloc. Es tracta igual que la impressora quan es tria una resolució de vídeo —
  ningú espera imprimir un Full HD i ningú demana que se li expliqui—: es dona per evident que
  d'aquesta mida no se n'exporta. Si arriben usuaris demanant-ho, es reobre.
- **Estat**: es marca resolta perquè la pregunta que obria («decidir-ho explícitament») té resposta.
  El codi no canvia.

### B16 — La resolució del PDF depèn de com de reduïda es vegi la previsualització ✅ Resolta

*(Trobada instrumentant B14: els números de l'informe no quadraven.)*

- **On**: `features/print/hooks/useDownloadPdf.ts` — `html2canvas(contentEl, …)` sobre
  `.preview-content`, que porta `transform: scale(calculatedScale)` (`ViewSquenceSettings`)
- **Per què importa**: el comentari del codi deia que «html2canvas ignora el `transform:scale()`
  visual i llegeix les dimensions CSS naturals», i **és fals**: mesura amb
  `getBoundingClientRect()`, o sigui amb el transform aplicat. Mesurat en un Chromium a 1.280×800
  amb A4 apaïsat: el full fa 1.047×718 px d'`offsetWidth`, però el rectangle és 900×617
  (`scale(0,8596)`) i el canvas surt 2.700×1.854 en comptes de 3.141×2.154. La resolució del PDF,
  doncs, **no és la que es demana**: és `escala visual × 3`. Aquí, 248 dpi en comptes de 288; en una
  pantalla estreta, on la previsualització es redueix molt més, cau proporcionalment. Afecta
  justament qui exporta des d'una tauleta o un mòbil.
- **Nota**: no compromet el sostre d'A9/B14. El guard es calcula sobre les dimensions naturals, que
  són més grans que el que es captura de debò, o sigui que erra pel cantó segur —però explica per
  què l'A3 baixa a 260 dpi quan potser no calia.
- **Resolta** a Branca `claude/backlog-branch-master-64uh75`. Es **compensa** l'escala visual en comptes d'anul·lar-la:
  `visualScaleOf(contentEl)` la mesura (`getBoundingClientRect().width / offsetWidth`, que és
  exactament el factor que el navegador aplica, transforms d'avantpassats inclosos) i es demana
  `captureScale / visualScale`, de manera que quan html2canvas hi torni a aplicar la visual en
  surti `natural × captureScale`.
- **Per què no tocar el clon**: html2canvas calcula mides i posició de la captura sobre l'element
  **original**, abans de clonar. Treure el `transform` a l'`onclone` no mouria els límits i, a
  sobre, deixaria la posició descordada. Compensar l'escala és una línia i no toca el DOM.
- **Mesurat abans i després** (Chromium 1.280×900, A4 apaïsat, full 1047×718 amb escala 3):
  canvas **2700×1854 → 3141×2156**, és a dir de 248 a 288 dpi. Els 2px de l'alçada són
  l'arrodoniment d'html2canvas, que treballa amb el rectangle en decimals.
- **Fixat a la prova**: `download-pdf-page-format.spec.ts` ja no comprova només el format del
  detall, sinó que **el canvas surti a `full × escala`**. Verificat que atrapa la regressió:
  desfent la compensació, la prova falla amb «Expected 3141, Received 2700».
- **Conseqüència per a B14**: el sostre d'A9 ara **cenyeix de debò**. Abans es calculava sobre les
  dimensions naturals mentre la captura sortia més petita, o sigui que sobrava marge sense saber-ho;
  ara l'A3 apaïsat va exactament als 4.096 px de costat que Safari publica com a límit. La
  instrumentació de B14 passa de ser útil a ser necessària.

### B17 — En tornar a la pestanya ningú desperta el servidor 🔴 Oberta

*(Trobada a l'estudi de la tornada a la pestanya, branca `claude/app-behavior-inactive-tab-p2vc2l`.)*

- **On**: `warmUpBackend.ts` i els seus dos únics punts de crida, `AuthModal.tsx` (en obrir-se) i
  `SignupPage.tsx`. Ni `SaveDocumentModal` ni `LoadDocumentModal` ni cap gestor de
  `visibilitychange` el criden.
- **Per què importa**: Render adorm el servei als 15 minuts, i tornar a una pestanya deixada de fons
  vol dir gairebé sempre passar d'aquest llindar. El primer «Desa al núvol» de la tornada paga el
  desvetllament sencer —a prop del minut— amb el diàleg obert i la barra de progrés quieta. El
  patró per evitar-ho ja existeix i està escrit per a exactament això («avançar el cost»), però
  només cobreix l'entrada al compte, que és el moment en què l'espera menys mal fa: allà l'usuari
  encara ha d'escriure el correu i la contrasenya.
- **Proposta**: cridar `warmUpBackend()` en tornar la pestanya a visible si hi ha sessió (el
  cooldown de 10 min ja evita que es repeteixi), i en obrir els diàlegs de desar i carregar del
  núvol, com fa `AuthModal`. Cap dels dos casos afegeix trànsit apreciable: és un `GET /health` de
  fons que no encén l'avís de desvetllament.

### B18 — En recarregar amb sessió, l'app es pinta amb la configuració de l'anònim fins que respon Render 🔴 Oberta

*(Mateixa branca.)*

- **On**: `AppBootstrap.tsx` (aplica `getStoredUserUi()` i tot seguit despatxa `refreshSessionThunk`)
  i `App.tsx` (l'efecte que canvia el locale de la URL quan el del compte no hi coincideix).
- **Per què importa**: per a l'usuari registrat la font de veritat és el backend i el `localStorage`
  no s'hi actualitza mai —`saveUserUiThunk` només hi escriu quan és anònim—, de manera que el que
  s'aplica primer és el que hi va quedar **abans** d'entrar al compte, o el dels valors per defecte.
  Amb el servidor despert són uns quants centenars de mil·lisegons i passa desapercebut; amb el
  servidor adormit, l'app es queda fins a un minut amb el tema, l'idioma i el format d'un altre, i
  quan finalment arriba la resposta canvia sola —inclosa la URL, que salta a un altre locale. Qui
  torna a la pestanya després d'una estona ho veu just en el moment de menys paciència.
- **Proposta**: mantenir al `localStorage` una còpia de la darrera configuració coneguda **del
  compte** (sense vocabulari, com ja fa el thunk anònim) i fer-la servir com a caché d'arrencada
  quan hi ha una marca de sessió prèvia; així el que es pinta primer ja és el bo i la resposta del
  backend, quan arriba, no canvia res a la vista.

### B19 — Amb dues pestanyes obertes, la que torna del fons sobreescriu la feina de l'altra 🔴 Oberta

*(Mateixa branca.)*

- **On**: `useDocumentDraft.ts` (`persistedRef` i el flush de `visibilitychange`) i
  `draftStorage.ts` (clau única `currentDocument`, sense comprovar què hi ha escrit).
- **Per què importa**: l'esborrany és un sol registre per a tot l'origen i cada pestanya hi escriu
  el seu document sense mirar-ne la data. `persistedRef` només evita que una pestanya reescrigui el
  que ella mateixa ha escrit; no sap res de les altres. Dues pestanyes obertes a l'editor, es
  treballa a la segona i es torna a la primera: el primer canvi que s'hi faci —o el primer cop que
  s'amagui, perquè `persistedRef` comença a `null` i el flush escriu el document restaurat en
  arrencar— deixa a IndexedDB la versió antiga. La feina de l'altra pestanya desapareix del disc
  sense que ningú ho digui, i és la que es restaurarà al proper refresc.
- **Proposta**: escriure només si el que hi ha a IndexedDB no és més nou que l'última escriptura
  d'aquesta pestanya (comparació de `savedAt` dins la mateixa transacció), i avisar quan es detecti
  el conflicte. Amb `BroadcastChannel` es podria, a més, fer que la pestanya que torna es posi al
  dia; però amb la comprovació d'escriptura ja no es perd res, que és el que importa.

### B20 — El format de pàgina no és del document i es perd en recarregar ✅ Resolta

*(Mateixa branca.)*

- **On**: `uiSlice.ts` (`ui.viewSettings`) contra `documentSlice.ts` (`document.viewSettings`, per
  seqüència) i `draftStorage.ts` (l'esborrany només desa el document).
- **Per què importa**: els ajustos per seqüència (mida, separació, alineacions) viuen al document i
  sobreviuen al refresc dins de l'esborrany; els globals —mida de pàgina, orientació, direcció,
  separació entre seqüències— viuen a `ui` i no els desa ningú fins que es prem «Desa com a
  preferències». Qui deixa la feina a mitges havent posat un A3 apaïsat i torna a una pestanya que
  el navegador ha descartat, es retroba la seqüència sencera dins d'un A4 vertical. La seqüència es
  recupera i la pàgina no, i per a un full imprès la pàgina és mitja feina.
- **Proposta**: desar `ui.viewSettings` dins de l'esborrany i restaurar-lo amb el document. És
  estat de sessió, no una preferència: desar-lo a l'esborrany no el converteix en preferència de
  l'usuari, que continua sent cosa del botó de desar.
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`. Desar-ho era la meitat petita; el
  que costava era que sobrevisqués als dos segons següents:
  - **L'escriptura no s'arribava a disparar.** `persistedRef` guardava l'últim *document* escrit i
    girar el full no el toca: ni el debounce (dependències `[document, persist]`) ni el flush
    d'amagar la pestanya escrivien res. Ara la ref guarda la parella document + `viewSettings` i les
    compara totes dues.
  - **El muntatge.** `usePageFormat` i `useViewManager` copien el format a un estat local en
    muntar-se i ja no el tornen a mirar; recarregant directament a `/view-sequence` la columna es
    muntava abans que respongués IndexedDB. `documentStatus.draftRestoreSettled` marca que
    l'arrencada ja ha mirat si hi havia esborrany —hi fos o no— i la pàgina de vista hi espera.
  - **El backend.** `syncSettingsAfterAuth` tornava a aplicar el `viewSettings` del compte quan
    responia Render, fins a un minut després. Ara les preferències entren per
    `applyUserViewSettings`, que no fa res si `ui.viewSettingsFromSession` diu que el format ve de
    l'esborrany: **el format que l'usuari estava fent servir mana per damunt del que té desat**,
    fins que el canviï o desi les preferències.
  - Fixat a `e2e/draft-restore.spec.ts`.

### B21 — `ui.viewSettings` fa de preferència i de mirall de sessió alhora 🔴 Oberta

*(Trobada resolent B20, branca `claude/estudi-pla-execucio-2w1pzq`.)*

- **On**: `uiSlice.ts` (`ui.viewSettings`), `ViewSquenceSettings.tsx` (`savedUserDefaults`, el mirall
  de sessió) i `useViewManager.ts` (`persistViewSettings`).
- **Per què importa**: el mateix camp guarda dues coses que no ho són: el format que l'usuari té
  **desat** i el que està **fent servir ara**. El mirall el reescriu a cada canvi, i la instantània
  de «Restaura les seqüències» es pren en muntar-se la columna — o sigui que **anar a Edició i
  tornar ja fa que «Restaura» torni als valors que l'usuari acaba de tocar**, sense cap esborrany
  pel mig. Hi ha un comentari al codi que diu que la instantània «només avança quan es desen les
  preferències», i amb el remuntatge això no és cert. B20 hi ha afegit
  `ui.viewSettingsFromSession` per protegir el format restaurat de les preferències que arriben
  tard: fa la feina, però és un pedaç sobre la mateixa confusió.
- **Proposta**: separar els dos rols —preferència desada i estat de sessió de la vista— en dos
  camps, i que «Restaura» llegeixi sempre el primer. Toca el panell de vista sencer, per això no
  s'ha fet dins de B20.

## Gravetat baixa

Inconsistència de forma o deute intern, sense un moment concret d'acció equivocada.

### C1 — Diversos botons només mostren l'etiqueta en passar-hi el ratolí 🔴 Oberta

- **On**: `PictogramAmount`, `TabsSequences`, barra d'eines de vista
- **Per què importa**: en tàctil el hover no existeix; el tooltip no s'obre. És decisió de producte
  (fer lloc a etiquetes visibles), no un canvi de nomenclatura.

### C2 — «Eliminar» té tres representacions d'icona ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- Tot passa a `AiOutlineDelete`: `UploadImageButton` i `WordProfileList` deixen `MdDeleteOutline`, i
  el botó d'esborrar de `PictEditModal` —l'únic sense icona— n'estrena una.
- S'ha triat la família `ai` perquè és la majoritària a l'app (vegeu C3); no és encara l'estàndard
  d'icones que C3 demana, només deixa d'haver-hi tres dibuixos per a la mateixa acció destructiva.

### C3 — Quatre famílies d'icones barrejades sense patró 🔴 Oberta

- `react-icons/ai` (majoria), `/md` (barra de vista, restore), `/bs` (PDF, info), `/ri` (selector de
  tema), sense cap regla de quan toca cadascuna.
- **Proposta**: un estàndard d'icones a `CLAUDE.md`, com ja n'hi ha per a colors i per a tabs.
- **Nota (A5/A6)**: el menú contextual ara barreja `ai` (copiar, editar, esborrar), `md` (enganxar,
  duplicar) i `tb` (inserir). És deliberat i documentat a A5/A6: cap família sola cobreix els sis
  verbs. Ant i Material comparteixen dibuix (traçat omplert); qui desentona és Tabler, de traç. Si
  algun dia es fixa l'estàndard, aquest menú és el cas de prova.

### C4 — Components morts i col·lisió de traduccions ✅ Resolta

Branca `claude/backlog-tasques-255sae`.

**Components esborrats**

| Element | Què se n'ha fet |
|---|---|
| `ToggleButtonEditViewPages` | ✅ Esborrat abans (B4/C5, branca `claude/backlog-branch-master-64uh75`) |
| `ButtonWithFileLoad` | Esborrat sencer (component + `.lang.ts`): cap import extern. Qui carrega el `.saac` és `AppNavigationDrawer`, i el `CLAUDE.md` deia el contrari a la taula de feedback — corregit |
| `CopyRightSpeedDial` | Esborrat el component i l'`import` mort de `BarNavigation`. El seu `.lang.ts` **sobreviu**, mogut a `WelcomeFooter.lang.ts`, que n'era l'únic consumidor de debò |
| `ButtonWithModalDonwload.tsx` | Esborrat el botó; el `.lang.ts` passa a dir-se `ModalDownload.lang.ts`, pel component que en queda |
| `features/pictogram/hooks/newPictogram.lang.ts` | Esborrat: cap importador i la seva única clau (`pictogram.empty`) sense consumidor |
| `IconButton` a `AppNavigationDrawer` | Import sense ús, el va trobar l'ESLint en passar-hi |

**Missatges orfes**: 23 claus esborrades dels cinc fitxers de traducció (516 → 495 claus per
idioma), entre elles les quatre que l'entrada nomenava (`upload`, `download`, `openMenu`,
`langSelector`) i `features.backend.auth.documentSaved`. També `NewsNavBar` (3),
`VocabularySettingsPanel` (3), `ViewSettingsPanel` (2), `DefaultForm` (2) i quatre més soltes.

**Com s'han trobat, i per què es pot confiar en el resultat**: un `id` es dona per orfe només si
apareix **una sola vegada** a tot `src` —la seva pròpia definició— i el fitxer que el declara no
llegeix els seus missatges per clau dinàmica. La segona condició és imprescindible: hi ha vuit
fitxers que fan `messages[clau]` (els `SettingCard*`, `MouseActionList`, els codis d'error
d'`AuthModal`, `PasswordStrengthGuide`, `SignupPage`), i buscar-hi `.clau` literal els donaria tots
per morts. El detector els va marcar i es van descartar un a un.

**La col·lisió que hi havia darrere**: `components.defaultSettings.saveError` (a `DefaultForm.lang.ts`)
semblava usat perquè `SettingsSaveErrorDialog.lang.ts` en declara set variants amb el mateix prefix
(`.title`, `.bodyCloud`, `.retry`…). Buscar la clau per text donava nou coincidències i cap era
seva. Aquesta era exactament la manera de canviar un text sense voler que l'entrada avisava; ara la
clau ja no hi és, i les altres dues del mateix cas (`components.defaultSettings.upload` i
`.download`, declarades a `BarNavigation.lang.ts` amb un prefix que no els tocava) tampoc.

### C5 — `aria-label` en anglès literal als grups de toggles ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`. S'ha fet d'una tirada, com deia la proposta.

- **`IconToggleButton`** nou a `components/SettingsLayout/`: pren **un sol** `message` i en deriva el
  `Tooltip` i l'`aria-label`. És l'única manera de declarar un botó només-icona dins d'un
  `StyledToggleButtonGroup`. Substitueix el parell `<Tooltip><ToggleButton aria-label="left">`, que
  era on el text traduït i el nom accessible es podien separar sense que res ho notés.
- Migrats els setze botons: `SequenceControlsPanel` (6), `ViewSettingsPanel` (6) i
  `GlobalViewControls` (4). Aquests últims ja tenien l'`aria-label` traduït des d'A4, però repetint
  `intl.formatMessage(...)` dos cops per botó; ara el missatge s'escriu una vegada.
- Es diu `IconToggleButton` i no `IconActionButton` perquè és específic del `ToggleButtonGroup`: en
  MUI v6 el grup passa la selecció per **context**, no clonant els fills, i per això un embolcall
  propi hi funciona sense reenviar cap prop. Un botó d'acció solt és un altre problema.
- `TabsSequences.tsx` (`sequence number`) ha entrat per B6, que tocava el mateix fitxer.
- `ToggleButtonEditViewPages.tsx` no s'ha traduït: **s'ha esborrat**. Era codi mort (cap import
  extern, vegeu C4) i, a sobre, el seu `.lang.ts` declarava els mateixos ids que `TabsEditView`.
  Traduir-lo hauria estat pagar per una pantalla que ningú veu.
- `e2e/accessible-names.spec.ts` comprova que no queda cap `[aria-label="left|right|center|top|
  bottom"]` al DOM, ni a la pàgina de vista ni al modal.

### C6 — Deute menut del menú contextual ✅ Resolta

Branca `claude/discussion-followup-sq7jo9`, de retruc en reescriure `MouseActionList` per compartir
les accions amb el diàleg (A8).

- L'`/* eslint-disable @typescript-eslint/no-unused-expressions */` de tot el fitxer ha desaparegut:
  els dos `x && x(...)` que el motivaven viuen ara a `usePictogramActions` com a `copyAction?.(…)`.
- L'`aria-labelledby` ja no apunta a `nested-list-subheader`, un id genèric heretat de l'exemple de
  MUI, sinó a `pictogram-actions-{índex}`. A més d'anomenar el que hi ha, evita ids repetits al DOM:
  la mateixa llista es pot muntar des del menú contextual o des del diàleg.

### C7 — El snackbar tapa el botó flotant d'estat en mòbil ✅ Resolta

Branca `claude/backlog-tasques-255sae`. *(Trobada en implementar A1b.)*

- **De les dues propostes s'ha triat moure el snackbar**, no el botó: el botó és permanent i l'avís
  dura tres segons, o sigui que el que és de pas és el que s'aparta. Pujar el FAB, a més, exigia
  saber l'alçada real del snackbar (una o dues línies segons el missatge i l'idioma) i acoblar el
  botó al `FeedbackContext` per un ajust de píxels.
- Per sota de `sm`, `FeedbackSnackbar` deixa `right: 72px` lliures: el `DocumentStatusFab` viu a
  `bottom: 16, right: 16` i fa 48 px d'ample, o sigui que arriba fins als 64 del cantó. **Ancorar-lo
  a l'esquerra sol no hauria servit de res**: per sota de `sm` MUI força `left: 8, right: 8` al
  Snackbar sigui quin sigui l'`anchorOrigin`, de manera que continua sent de banda a banda.
- Mesurat a 390px abans i després: el snackbar arribava a `x = 356,6` amb el botó començant a
  `x = 320` — 37 px de solapament, prou per tapar-lo mig. Ara acaba a `x = 318`.
- Fixat a `e2e/download-and-status.spec.ts`, que compara les dues caixes.

### C8 — A «Descarrega», l'estat inicial de la casella de configuració no és el que es veu ✅ Resolta

Branca `claude/backlog-tasques-255sae`.

- Les dues caselles de `ModalDownload` passen a ser **controlades** (`checked={save.…}`): el que es
  pinta i el que se n'endú el fitxer surten del mateix valor, que era la proposta.
- L'estat inicial que es conserva és **el que es veia**, no el que es desava: seqüència marcada,
  configuració desmarcada. Qui obre «Descarrega» ve a salvar la seva feina, no la seva
  configuració; endur-se-la era l'accident, no la intenció.
- Confirmat abans de corregir-ho amb `e2e/download-and-status.spec.ts`: amb la casella desmarcada, el
  `.saac` portava igualment el `defaultSettings` sencer (pell, cabell, vores, tipografies). Ara el
  test compara el que diuen les caselles amb el que hi ha dins del fitxer descarregat.

### C9 — El build del web no comprovava tipus, i el CLAUDE.md deia que sí ✅ Resolta

Branca `claude/document-limit-users-sjig8o`.

- **Què passava**: `npm run build` del web és `vite build` amb `@vitejs/plugin-react-swc`, que
  **transpila sense mirar els tipus**; `npm run lint` és ESLint, que tampoc no els mira. El
  `CLAUDE.md` deia literalment «`vite build` (comprova tipus com a part del build)», així que un
  `✓ built` verd es donava per bo. Es va veure en fusionar B12: una crida amb un valor que no era a
  la unió `ClientErrorContext` va passar el build sencer i només va sortir passant `tsc` a mà.
- **Què hi havia amagat a sota** (codi de producció, no tests):

  | Fitxer | Error |
  |---|---|
  | `types/ui.ts` | `UserUiSettings` no existia; l'importaven `settingsService`, `settingsThunks` i `settingsStorage`. Ara hi és, amb els camps de compte que `authSlice` ja llegia (`tier`, `emailVerified`, `role`) |
  | `pages/WelcomePage/WelcomeLayout.tsx` | `import … from "/src/App"` — ruta absoluta que només resol Vite. Passa a l'àlies `@/App` |
  | `utils/fitzgeraldToBorder.ts` | `fitzgeraldColors.not` no ha existit mai (vegeu C11) |

- **Què hi ha ara**: `npm run typecheck` a l'arrel (tasca de Turbo) i a cada workspace. **Ha d'estar
  net**: si en surt un error, és nostre. No s'ha encadenat dins de `npm run lint` a propòsit —
  el lint del web ja surt vermell amb 13 errors preexistents d'ESLint i una barrera que neix
  vermella no la mira ningú.
- **Residu**: aquests 13 errors d'ESLint segueixen oberts; 6 són a `test-utils.tsx` (vegeu C10) i la
  resta són apòstrofs sense escapar i dos `@ts-ignore` en pàgines soltes.

### C10 — La suite de tests del web no compila ni s'executa 🔴 Oberta

*(Trobada en posar la barrera de tipus de C9.)*

- **On**: `src/**/*.test.tsx`, `src/setupTests.ts` i `src/utils/test-utils.tsx`.
- **Per què importa**: no és que els tests fallin — és que **no poden ni arrencar**. `npm test` és un
  placeholder (`echo 'Tests: WIP'`), el workspace no té configuració de vitest, `test-utils.tsx`
  munta un store amb un `sequenceReducer` de `app/slice/sequenceSlice` (mòdul esborrat) i una mock
  d'`Ui` a la qual falten `lang`, `theme`, `settingsActiveTab`, `wordProfiles` i `tier`; els tests
  passen props que ja no existeixen (`BarNavigation title`) o n'obliden d'obligatòries
  (`PictogramAmount info`), i `setupTests.ts` importa `.private/mocks/server`, que no és al
  repositori. Mentrestant el `CLAUDE.md` els presentava com a «tests reals».
- **Proposta**: decidir-ho d'una: o es reviu la suite (configurar vitest al web, refer `test-utils`
  contra l'store actual —`document`, `ui`, `auth`— i actualitzar els sis fitxers de test), o
  s'esborra i es deixa dit que la cobertura del front són els e2e de Playwright. Mantenir-la a mig
  camí és el pitjor dels tres: ocupa lloc, dona sensació de xarxa de seguretat i no n'és cap.
- **Mentrestant**: exclosa del `typecheck` (`exclude` del `tsconfig.json`), com els tests de l'API.
  L'`exclude` ja ho intentava, però tenia les dues rutes dins d'una sola cadena separades per una
  coma, que no coincideix amb cap fitxer.

### C11 — Una vora «fitzgerald» sense classificació es pinta del color del text 🔴 Oberta

*(Trobada en posar la barrera de tipus de C9.)*

- **On**: `utils/fitzgeraldToBorder.ts`
- **Per què importa**: el fallback era `fitzgeraldColors.not`, una clau que **no existeix** a
  `data/fitzgeraldColors` (només hi ha `1`…`6`). Resolia a `undefined`, el `borderColor` sortia
  buit i el navegador el pintava amb `currentColor` — el color de la lletra del voltant. Passa amb
  els pictogrames sense `fitzgerald` (documents antics: `extractPictSettings` sempre l'omple) quan
  la vora està configurada com a «fitzgerald». No és greu perquè és una vora, però el color surt
  d'un accident, no d'una decisió.
- **Fet a C9**: escriure `currentColor` explícitament, per no canviar cap dibuix mentre es posava la
  barrera de tipus.
- **Proposta**: triar un color de debò per al cas «sense classificació» —el candidat natural és el
  mateix `#FFCD94` que `extractPictSettings` fa servir per defecte— o no pintar vora quan no hi ha
  classificació. Decisió de producte, no de tipus.

### C12 — El desplegable de mida de pàgina no té nom accessible ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- `GlobalViewControls` passa el `labelId` del `SettingRow` al `Select`, i `download-pdf-page-format`
  ja el localitza amb `getByLabel("Mida de pàgina")` en comptes del valor que mostra.
- Repassats els altres controls no-toggle amb `SettingRow`, com demanava l'entrada. Hi faltava el
  nom a tres més: els dos `Slider` de `ViewSettingsPanel` (mida i espai de pictogrames) i el
  `TextField` de l'autor a `PrintFooterSection`.
- **El nom ha d'anar amb la prop `labelId` del `Select`, no amb `inputProps`.** Amb
  `inputProps={{ "aria-labelledby": … }}` el nom acaba a l'`<input>` natiu **amagat**, no al
  `div[role="combobox"]` que és el que veu un lector de pantalla i el que rep el clic: el
  `getByLabel` trobava l'input ocult i el clic hi rebotava contra el div de sobre. Ho fa bé la prop
  `labelId`, que MUI posa al display i al `listbox`. Corregits també `SettingCardFont` i
  `SettingCardLang`, que arrossegaven el mateix error d'ençà que es van migrar.
- Els `TextField` sí que continuen amb `inputProps`: allà l'`<input>` és el control de debò.

### C13 — L'ítem «Administració» del drawer és català hardcodat ✅ Resolta

Branca `claude/backlog-tasques-255sae`. *(Trobada en resoldre B2, fora del seu abast.)*

- `components.appNavigationDrawer.admin` als cinc idiomes, tal com deia la proposta. L'excepció de
  la **pàgina** `/admin` (només català, sense `react-intl`) queda intacta: el que es tradueix és
  l'enllaç, que viu en superfície traduïda.
- El comentari del codi ho diu ara explícitament, perquè el següent que hi passi no ho «arregli» a
  l'inrevés donant per fet que l'excepció també cobria el drawer.

### C14 — Esborrar una seqüència no demana confirmació ni es pot desfer ✅ Resolta

Branca `claude/backlog-branch-master-64uh75`.

- **`ConfirmDialog`** nou (`components/ConfirmDialog/`): confirmació **única** de tota l'app per a
  una acció que destrueix feina. Havia de ser compartida perquè el que decideix si una acció es
  confirma és quant costa refer-la, i aquest criteri s'ha de poder llegir en un sol lloc — no
  repartit en diàlegs escrits a mà, que és exactament el desori que aquest backlog persegueix.
- **`DocumentStatusFab` hi migra**: tenia la seva confirmació inline i era l'única de l'app. La seva
  tercera sortida («Descarrega-ho abans») es conserva com a prop `alternative`, perquè no és ni
  acceptar ni cancel·lar: evita la pèrdua en comptes de consumar-la. `features.sequence.status.confirmCancel`
  s'esborra: «Cancel·la» és ara del `ConfirmDialog` i és una de sola per a tothom.
- **Només es confirma si hi ha res a perdre**: es compten els pictogrames **amb contingut**
  (`selectedId > 0`, una imatge pujada o text propi). Amb la seqüència buida s'esborra directament;
  demanar permís per llençar cinc caselles en blanc és fricció sense contrapartida.
- **El cos diu la xifra**: «Té 2 pictogrames. Esborrar la seqüència se'ls endú tots i no es pot
  desfer», no un avís genèric. Qui ha de decidir necessita saber què hi ha dins de la seqüència que
  no està mirant.
- **El focus se'l queda el diàleg, no cap botó** (comportament de MUI, comprovat al navegador).
  Convé: el lector de pantalla llegeix títol i cos —que és el que s'ha de llegir abans de decidir— i
  cap botó no queda armat, així que Enter no consuma res. L'`autoFocus` que hi havia posat al botó
  de cancel·lar no feia res i s'ha tret; la prova e2e ho vigila.
- Fixat a `e2e/destructive-actions.spec.ts` amb la fixture `e2e/fixtures/dues-sequencies.saac`.


### C15 — L'estat del document diu l'hora però no el dia 🔴 Oberta

*(Trobada a l'estudi de la tornada a la pestanya, branca `claude/app-behavior-inactive-tab-p2vc2l`.)*

- **On**: `DocumentStatusFab.tsx` (`formatTime` → `intl.formatTime`) i els missatges
  `statusLocal`, `statusFile` i `statusCloud`.
- **Per què importa**: l'indicador existeix per a qui torna a una feina que ha deixat a mitges, i
  aquest és justament qui no sap quin dia és el de l'hora que llegeix. «Només en aquest dispositiu,
  des de les 18:42», obert un dimarts al matí, es llegeix com d'aquest matí. Amb l'esborrany, que
  pot ser de fa dies i que el navegador pot desallotjar als set, la diferència no és cosmètica.
- **Proposta**: hora sola quan és d'avui, i data quan no ho és (`intl.formatDate` amb
  `dateStyle: "short"` afegit al missatge), o `intl.formatRelativeTime` per als casos recents. La
  decisió es pot prendre al mateix `formatTime`, sense tocar cap consumidor.

### C16 — Ningú demana emmagatzematge persistent al navegador 🔴 Oberta

*(Mateixa branca.)*

- **On**: `draftStorage.ts` — `openDatabase` obre IndexedDB sense cridar mai
  `navigator.storage.persist()`.
- **Per què importa**: per defecte l'esborrany viu en emmagatzematge «best effort» i el navegador
  el pot desallotjar quan li falta espai, sense avisar i sense que l'app se n'assabenti. Amb el
  permís concedit, Chrome i Firefox deixen de desallotjar-lo automàticament. Safari manté el seu
  límit de set dies sense visitar el lloc —això no ho arregla res— però és precisament als altres
  dos on l'usuari té més probabilitats de tenir el disc ple d'altres coses.
- **Proposta**: una crida oportunista a `navigator.storage.persist()` la primera vegada que
  s'escriu un esborrany, ignorant-ne el resultat (a Chrome es concedeix sol segons l'ús del lloc, i
  no obre cap diàleg). No canvia res del format ni del flux; només fa que el nivell 1 dels tres de
  durabilitat aguanti el que diu que aguanta.
