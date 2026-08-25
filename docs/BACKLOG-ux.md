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
  precisament per a què serveix. Amb el guard posat, la dada arriba sola: no cal instrumentar res.
- **Proposta**: esperar a tenir casos reals al registre abans de tocar cap número. Si no n'hi ha
  cap en un temps raonable, provar de pujar el costat a 8.192 (el límit dels iOS moderns) i veure
  si en surten; si en surten, el valor conservador d'ara ja era el bo.

### B15 — Amb la mida «pantalla sencera» no es pot exportar res 🔴 Oberta

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
| `features.backend.auth.documentSaved` | Orfe des de B12: el desat confirma amb `documentSavedNamed` (««{title}» s'ha desat al núvol»), que sempre té nom. Es conserva traduït als cinc idiomes sense que ningú el demani |

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

### C12 — El desplegable de mida de pàgina no té nom accessible 🔴 Oberta

*(Trobada en escriure les proves d'A9 i B9: el `getByLabel("Mida de pàgina")` no trobava res.)*

- **On**: `components/ViewSequencesSettings/GlobalViewControls.tsx` — el `Select` de la mida de
  pàgina, dins d'un `SettingRow title={…}` sense `labelId`
- **Per què importa**: el títol de la fila és text al costat, no una etiqueta associada, així que
  el control arriba al lector de pantalla com un `combobox` sense nom: es llegeix el valor («A4»)
  però no què és. `SettingRow` ja té la prop `labelId` pensada per a això i el `Select` de MUI
  accepta `labelId`; només falta lligar-los. Cal repassar si passa el mateix als altres controls
  amb `SettingRow` que no siguin toggles.
- **Proposta**: passar un `labelId` a `SettingRow` i al `Select` del mateix component. Mentrestant,
  la prova e2e localitza el desplegable pel valor que mostra i ho diu al comentari.
