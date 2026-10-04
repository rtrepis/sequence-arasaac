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

Llegenda d'estat: `🔴 Oberta` · `🔴 Oberta (ajornada)` · `✅ Resolta` · `➖ Caducada`

«Ajornada» vol dir que depèn d'una cosa que avui no es farà. Ara mateix, els comptes: el
2026-09-27 es van apagar (`VITE_ACCOUNTS_ENABLED=false` al web, `ACCOUNTS_ENABLED=false` a l'API)
i tot el que en depèn queda per quan es tornin a encendre.

---

## Prioritats

**Per on començar.** Les entrades de sota estan ordenades per **gravetat** i numerades per ordre
d'arribada. Aquest ordre diu com de greu és el problema, però no diu què s'ha d'atacar primer. Això
ho diu aquesta secció.

### Com es prioritza

Hi ha diversos mètodes coneguts. Els principals són: **RICE** (abast × impacte × confiança /
esforç), **WSJF** (cost d'esperar / mida de la feina), **MoSCoW** (must/should/could/won't) i la
matriu **valor/esforç**. RICE demana dades d'ús (quanta gent toca cada pantalla) que aquí no hi
són, i MoSCoW serveix per tancar l'abast d'un llançament, no per ordenar un backlog viu. Es fa
servir una versió lleugera de **WSJF** amb la matriu valor/esforç, repartida en tres calaixos,
**Ara · Després · Més endavant**, a la manera d'un full de ruta *Now/Next/Later*:

1. **Bloqueig.** Si depèn d'una cosa que no es farà aviat (els comptes), va a *Ajornades* i no
   competeix amb la resta.
2. **Cost d'esperar.** És el criteri que més pesa, i és el de WSJF. Una entrada que s'encareix com
   més es tarda puja de calaix encara que no sigui la més greu. Per exemple, B25 s'ha de decidir
   abans del mode lliure, perquè cada camp nou que s'hi afegeixi també s'esborrarà.
3. **Impacte.** Pèrdua de dades > exclusió d'accessibilitat > fricció en una tasca habitual >
   inconsistència de forma. És el mateix criteri que les gravetats, però mesurat per a l'usuari que
   ho pateix.
4. **Esforç.** **S** és menys d'una sessió; **M** és una sessió amb proves; **L** vol disseny previ
   o toca diverses capes. Amb el mateix impacte, primer la S: les victòries ràpides mantenen el
   backlog curt.
5. **Decisió.** Si abans del codi cal una decisió de producte, es diu. Aquestes entrades no
   avancen fins que es pren la decisió, i la decisió és la primera tasca.

**Manteniment**: tota entrada nova s'afegeix a aquesta taula quan s'obre. A cada revisió es
reordenen els calaixos, i una entrada resolta en surt. La taula és un índex: el detall és a
l'entrada.

### Ara

| Id | Què | Per què ara | Esforç | Decisió prèvia |
|---|---|---|---|---|
| C17 | El switch d'un ajust no té nom per al lector de pantalla | Exclusió d'accessibilitat a tots els `SettingCardBoolean`; el patró ja existeix (C12) | S | No |
| C18 | L'spec de vídeo de `multiple-sequences` és vermell | Surt de retruc amb C17 (el selector que falla és el d'aquell switch). Si no, s'esborra | S | Si el vídeo es vol |
| B11a | Pujar una imatge congela la interfície (primera meitat) | Saltar l'escaneig d'alfa quan el fitxer és JPEG. Retalla la major part del temps en el cas més comú (fotos del mòbil) | S | No |

### Després

| Id | Què | Per què | Esforç | Decisió prèvia |
|---|---|---|---|---|
| B29 | La previsualització del vocabulari personal sobresurt del requadre amb valors grans | Mateixa causa que el bug de la previsualització del panell d'estil, ja resolt amb `ScaleToFit`: la solució és una línia | S | No |
| B27 | Les fonts de Google no se serveixen des de l'app | Sense connexió a Google Fonts, un document no es veu tal com es va desar (el fonament de l'estil ho promet) | M | No |
| B28 | Una paraula llarga amb lletra gran es talla dins de la targeta | Surt així al paper i al PDF, i ningú no ho avisa | S–M | Sí: partir la paraula, o reduir-ne la lletra |
| B21 | `ui.viewSettings` fa de preferència i de mirall de sessió | Amb el model v3 (B26) ja només hi queda l'autor, que també és del document | S | No |
| C1 | Botons que només diuen què fan amb el hover | En tauleta no hi ha hover, i la tauleta és el dispositiu habitual en AAC | M | Sí: on es fa lloc a les etiquetes visibles |
| B8 | «Enganxa» desactivat sense explicació, porta-retalls invisible | Fricció en una acció habitual; la meitat del text d'ajuda és S | S–M | No |
| B23 | L'idioma desat de l'usuari sense compte no mana sobre la URL | Amb els comptes apagats, **tothom** és usuari sense compte: la regla que val és aquesta | S | Sí: mana la URL o mana la preferència |

### Més endavant

| Id | Què | Per què pot esperar | Esforç |
|---|---|---|---|
| B11b | Pujar una imatge: conversió en un worker | Quan B11a s'hagi mesurat en una tauleta, si encara es nota | M |
| B22 | Les pestanyes no es coordinen | B19 ja evita la pèrdua; ara és només incomoditat | M |
| C3 | Set famílies d'icones sense estàndard | Forma. Victòria ràpida possible: `IoIosColorPalette` → `ai`/`md` | M |
| B14 | Sostre del canvas del PDF sense mesurar | S'espera tenir casos reals al registre d'errors (`/api/client-errors` continua obert amb els comptes apagats, i l'avís per correu també); no hi ha res a fer fins que n'arribin | — |
| N3 | Notícia de llegibilitat | Prioritat baixa i cost alt (captura d'«abans») | M |
| B30 | No hi ha historial de desfer i refer | El desfer que ja existeix cobreix els canvis d'estil, «Aplica a tots» i «Restableix», que són els que esborren més feina d'un cop | L |
| C20 | Errors d'axe als controls del formulari d'edició del pictograma | Són d'abans; surten ara que la prova desplega la configuració. Va amb C17 | M | No |
| C10 | Vuit fitxers de test en quarantena | El runner i l'arnès ja hi són; queda portar-los-hi o esborrar-los, un per un | S cada un | Sí: per cada fitxer, reviure o esborrar |

### Ajornades (comptes apagats)

| Id | Què | Què la desencalla |
|---|---|---|
| B13 | El comptador de documents no surt en desar | Tornar a encendre els comptes |
| N1 | Les tres notícies de compte | Tornar a encendre els comptes; abans, corregir els números de `NOTICIES` i `INVENTARI` |
| P1 | Proves de regressió del `.saac` amb compte | Tornar a encendre els comptes, o tenir l'API local amb BD en memòria |
| C26 | 12 codis d'error de l'API no tenen text | Tornar a encendre els comptes |

---

### Revisions

Cada revisió contrasta **totes les entrades obertes** amb el codi del moment. Les que no canvien
no es toquen; les que sí, porten una nota amb la data de la revisió.

| Data | Branca | Resultat |
|---|---|---|
| 2026-09-27 | `claude/backlog-review-bs867a` | 16 obertes revisades. **B24** resolta (per `52ac416`, que no l'havia marcat). **B13**, **B11**, **C3** i **N1** actualitzades: el codi s'ha mogut per sota i el text ja no era cert del tot. La resta (B8, B14, B21, B22, B23, C1, C10, C11, C17, C18, N3) continua exactament igual |
| 2026-09-27 (2a) | `claude/backlog-review-bs867a`, amb master al dia (`a15ed31`) | Master hi afegeix **B25** i **P1**; B25 verificada al codi. Els comptes s'apaguen: **B13** i **N1** passen a ajornades, com P1. La resta, sense canvis respecte de la primera passada. S'afegeix la secció *Prioritats* |

---

## Idees

Propostes que encara no són tasques: cal pensar-les i decidir-les abans de posar-les a
*Prioritats*.

### B31 — Aplicar canvis d'estil per seqüència 💡 Idea

*(Oberta en treure «Aplica a aquesta seqüència» dels fonaments, 2026-09-29.)*

- **Què**: pensar com modificar l'estil de tots els pictogrames d'una seqüència alhora.
- **Possible enfocament**: un botó que obri un modal per fer les modificacions a la seqüència.
- **Cal decidir-ho abans d'implementar-ho**: on es col·loca a la interfície, i com conviu amb
  l'estil del document i amb les excepcions per pictograma (`docs/fonaments/03-model-contingut-estil.md`,
  §4 i §5). Avui una seqüència només té estil de vista (mida, espai, alineació).
- Pendent de treballar-ho més endavant.

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

### A11 — La sessió pot haver caducat i l'app continua dient que hi ha sessió ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`:
  - **No eren dos codis, eren cinc.** `POST /auth/refresh` pot fallar amb `REFRESH_TOKEN_MISSING`,
    `REFRESH_TOKEN_EXPIRED`, `INVALID_REFRESH_TOKEN`, `USER_NOT_FOUND` i `ACCOUNT_SUSPENDED`
    (aquest amb 403). Els dos últims **no admeten «torna a entrar»**: enviar al formulari d'entrada
    algú a qui han suspès el compte és enviar-lo a un altre no. L'avís els tracta a part i no els
    ofereix el botó.
  - `features/backend/api/sessionExpiry.ts`, mòdul fora de Redux com `backendStatus` —
    l'`apiClient` no és un component i importar-hi l'store seria un cicle (store → slices →
    serveis → apiClient).
  - El `catch` del refresc hi avisa **només si hi havia token a la memòria**: sense sessió, un 401
    no és una sessió que cau sinó una petició que no n'ha tingut mai, i la restauració silenciosa
    de l'arrencada va contra `/auth/`, que l'interceptor deixa passar de llarg.
  - `SessionExpiredNotice`, muntat al `LanguageLayout` al costat de `BackendWakeUpNotice`: despatxa
    `clearAuthState()` —el creador d'acció que estava exportat i sense consumidor— i ensenya un
    `Snackbar` persistent que diu què ha passat, que la feina continua en aquest dispositiu i, quan
    té sentit, ofereix tornar a entrar. Es tanca sol quan hi torna a haver sessió.
  - Quatre missatges nous al catàleg d'`AuthModal.lang` (`ACCOUNT_SUSPENDED` ja hi era): amb això
    `SaveDocumentModal` deixa de caure al genèric `DOCUMENT_SAVE_ERROR`, perquè ja hi buscava el
    codi i només li faltava que hi fos. Traduïts als cinc idiomes.
  - **Sense `reportClientError`**: una sessió que caduca als set dies no és una fallada sinó el
    final previst d'una sessió, i reportar-la ompliria el registre i el *throttle* de correu amb el
    funcionament normal.
  - Fixat a `e2e/session-expired.spec.ts`, amb el backend simulat: caducada, compte suspès, usuari
    que no ha entrat mai i tornada a entrar.

### A12 — El primer login del dia no diu res mentre el servidor es desperta ✅ Resolta

*(Trobada d'ús: entrar des de la pantalla d'inici amb Render adormit.)*

- **On**: `pages/WelcomePage/WelcomeLayout.tsx` (no muntava `BackendWakeUpNotice`) i
  `features/backend/auth/components/AuthForm.tsx` (`disabled={isLoading}` als camps i al botó).
- **Per què importa**: la pantalla d'inici és **on es fa el primer login del dia**, i per tant
  l'única on el desvetllament de Render és gairebé segur. L'avís hi era a `LanguageLayout` i a
  `AuthStandaloneLayout`, però no al layout de la benvinguda: en prémer «Entra» els camps es
  bloquejaven, el botó es quedava amb el rodet i durant prop d'un minut no apareixia cap
  explicació. Justament el cas que l'avís existeix per cobrir —«sense cap senyal, l'usuari només
  veu un botó bloquejat»— passava al lloc on més mal fa, perquè és el primer contacte amb l'app.
  A sobre, bloquejar els camps mentre s'espera impedeix corregir una lletra del correu durant tot
  el minut, i contradiu l'estàndard de feedback («mai `disabled` per dir "s'està fent"»).
- **Resolta** a la branca `claude/login-startup-feedback-6cqj7u`:
  - `WelcomeLayout` munta `BackendWakeUpNotice`, dins del seu `IntlProvider` i al costat de la
    pàgina. No calen proveïdors nous: el `FeedbackProvider` que llegeix (per saber si hi ha un
    backdrop obert) viu a `index.tsx`, per damunt de les rutes.
  - `AuthForm` deixa d'usar `disabled` per a l'espera: els camps es poden seguir editant i el botó
    passa a `aria-disabled` + `aria-busy` amb guarda al handler, de manera que no surt de l'ordre
    de tabulació i el lector de pantalla el llegeix com a ocupat. El `disabled` només es queda per
    als camps buits, que és validació i no espera.

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

- El **cercle** queda reservat als pictogrames (`PictogramAmount`). Les seqüències passen a
  **pàgina amb +/−** (`BsFileEarmarkPlus` / `BsFileEarmarkMinus`), tal com proposava l'entrada.
  El cercle era ple (`AiFill*`) i ara és de contorn (`AiOutlinePlusCircle` /
  `AiOutlineMinusCircle`): el ple era l'única icona massissa de la pantalla i desentonava amb la
  resta, que és tota de traç —vegeu C3—. La distinció que aquesta entrada demanava no en depèn:
  el que separa les dues accions és cercle contra full, no ple contra buit.
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
  usada de `features/sequence/components/PictEdit/PictEdit.lang.ts` s'ha esborrat, perquè en canviar el text les dues
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
  `features/sequence/components/PictEdit/PictEditModalList.tsx` (l'estat `copyPictogram`)
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
- **Revisió 2026-09-27 — continua oberta, i ara el cas pitjor és més llarg.** La funció és ara
  `encodeImage` (amb `fileToBase64` d'embolcall) i `hasTransparency` segueix escanejant tots els
  píxels sense mirar `file.type`. Des de `52ac416`, quan la imatge no cap a l'espai del compte,
  `UploadImageButton` en fa **una segona codificació** (`encodeToFit`) per oferir la versió que sí
  que hi cap: dues congelacions seguides just en el moment d'avisar l'usuari. El botó ja porta
  rodet mentre dura (`isLoading`), però el rodet també es queda quiet si el fil principal està
  bloquejat.

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

### B13 — Amb tres documents de sostre, ningú diu quants te'n queden 🔴 Oberta (ajornada)

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
- **Revisió 2026-09-27 — continua oberta, però la meitat de la premissa ha caducat:**
  - **El sostre ja no és 3, és 10** (`a166e4b`, `tierLimits.ts`). Topar-hi torna a ser rar, que era
    el que feia urgent l'entrada.
  - **El comptador ja viatja i ja es veu**: `quotaSlice` + `useAccountQuota` (`52ac416`) i
    `AccountStorageSummary`, al tab Usuari de configuració, diu «N de 10» per a documents. La
    dependència de backend que proposava l'entrada ja no cal.
  - **El que queda**: ni `SaveDocumentModal` ni `LoadDocumentModal` ensenyen el comptador (només
    criden `refreshQuotaThunk` després de desar o esborrar), i desar un document **nou** amb el
    compte ple continua enviant-lo i esperant que el servidor el rebutgi. Amb `useAccountQuota` ja
    al front, és una línia al diàleg i una comprovació abans d'enviar.

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

### B17 — En tornar a la pestanya ningú desperta el servidor ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`, amb dues correccions a la proposta:
  - **Al diàleg de carregar no hi serveix de res.** `LoadDocumentModal` demana el llistat en un
    efecte que salta amb `open`, així que la petició de debò surt al mateix instant que sortiria el
    ping. Només s'ha afegit al de desar, on entre obrir-lo i prémer el botó hi ha escriure un nom.
  - **No a cada canvi de pestanya.** En tauleta es canvia d'aplicació desenes de vegades al dia i
    cada ping manté Render despert, gastant hores del pla gratuït tant si serveixen com si no.
    `useWarmUpOnReturn` (muntat a `AppBootstrap`) només el desperta després d'una absència de
    **5 minuts o més** i amb sessió — mirada amb `getAccessToken()` i no amb un selector: no cal
    subscriure's a Redux, i des d'A11 un refresc fallit ja deixa el token a `null`, o sigui que una
    sessió morta tampoc no desperta ningú.
  - Fixat a `e2e/warm-up.spec.ts`, que fa passar el temps amb `page.clock` en comptes d'esperar-lo:
    absència curta (cap ping), absència llarga (un ping), sense sessió (cap ping) i diàleg de desar
    (un ping).

### B18 — En recarregar amb sessió, l'app es pinta amb la configuració de l'anònim fins que respon Render ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`:
  - `settingsStorage` guarda l'última configuració coneguda del compte sota una **clau pròpia**
    (`accountUi`), mai la de l'anònim: si compartissin calaix, entrar al compte se les menjaria i
    tancar sessió no podria recuperar-les. Només s'hi desa el que es pinta —idioma, tema,
    pictogrames i vista—: ni vocabulari (imatges, dispositiu compartit) ni estat del compte
    (`tier`, `emailVerified`, `role`), que el decideix el servidor a cada petició.
  - S'escriu als dos únics moments on la configuració del compte és certa: quan el backend la
    retorna (`syncSettingsAfterAuth`) i quan l'usuari prem «Desa com a preferències» amb sessió.
    S'esborra en tancar sessió i quan el refresc silenciós falla — **sense repintar la sessió en
    curs**, que seria tornar a fer el salt que això vol treure i just quan A11 ja està dient que la
    sessió ha caducat.
  - **El salt d'URL calia desbloquejar-lo a part.** L'efecte de locale d'`App.tsx` estava tancat
    darrere de `isAuthenticated`, que no és cert fins que respon el servidor: amb la caché sola,
    el tema i els pictogrames sortien bé des del primer render però la URL i els textos continuaven
    saltant tard. Ara l'efecte també s'executa quan el navegador ja portava configuració de compte
    en arrencar (llegit un sol cop, en muntar). Sense caché no canvia res: a l'usuari sense compte,
    un enllaç `/ca/…` continua obrint-se en català.
  - Fixat a `e2e/account-settings-cache.spec.ts`, amb la resposta de la configuració alentida cinc
    segons: a la segona càrrega, idioma i URL del compte hi són abans que el servidor respongui.

### B19 — Amb dues pestanyes obertes, la que torna del fons sobreescriu la feina de l'altra ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`:
  - **També s'enduia les imatges.** La recollida d'òrfenes del magatzem `draftImages` va dins de la
    mateixa escriptura i esborra tot el que el document entrant no referencia: la pestanya vella no
    només guanyava, sinó que deixava l'altra sense imatges. El guard cobreix les dues coses — amb
    conflicte, la transacció es queda en una lectura i no toca res.
  - `saveDraft` llegeix el registre i compara `savedAt` **dins de la mateixa transacció**
    `readwrite` (el navegador les serialitza sobre un mateix magatzem, així que entre la lectura i
    l'escriptura no s'hi pot ficar ningú) i retorna `"saved" | "conflict" | "error"` en comptes
    d'un booleà.
  - `useDocumentDraft` recorda el `savedAt` de l'últim registre que aquesta pestanya coneix: el que
    ha llegit en arrencar —tant si el restaura com si no, perquè el que compta és haver-lo vist— i
    el que ha escrit ella mateixa. I **marca com a escrit el document que acaba de restaurar**:
    sense això, el primer flush el tornava a escriure tal qual, i amb una altra pestanya pel mig
    aquella escriptura innecessària era justament la que es carregava la feina bona.
  - `hasDraftError: boolean` passa a `draftError: "storage" | "conflict" | null`. Calia que el
    conflicte arribés a l'estat: amb `draftSavedAt` congelat, `getDocumentDurability` es quedava en
    `saving` i el botó flotant deia «Desant en aquest dispositiu…» per sempre. Ara diu «Una altra
    pestanya té feina més nova» i què s'hi pot fer.
  - Avís un sol cop per sessió, com el d'espai exhaurit. Traduït als cinc idiomes.
  - Fixat a `e2e/draft-two-tabs.spec.ts`, amb dues pàgines dins del **mateix context** de
    Playwright (que és el que fa que comparteixin l'IndexedDB de l'origen).

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
- **Revisió 2026-09-27 (resolent B25, `claude/sequencia-estil-b25-16pluv`)**: la meitat ja no és
  certa. Les mides, els espais i l'alineació són ara de l'estil del document, i el mirall de sessió
  de `ViewSquenceSettings` només hi escriu la disposició (direcció, pàgina, orientació, autor).
  «Restaura les seqüències» ja no existeix: l'ha substituït «Aplica el meu estil per defecte», que
  llegeix sempre l'estil per defecte desat i es pot desfer. El que queda barrejat és
  la disposició, i es resol amb **B26**, que la porta al document.

- **Actualització (2026-09-29, model v3)**: el mirall de sessió ja només hi escriu l'autor; la pàgina
  és del document (B26). Queda obert per l'autor, que és a `ui.viewSettings` i al document alhora.
### B22 — Les pestanyes no es coordinen: ni es posen al dia ni comparteixen el «Document nou» 🔴 Oberta

*(Trobada resolent B19, branca `claude/estudi-pla-execucio-2w1pzq`.)*

- **On**: `useDocumentDraft.ts` (la pestanya bloquejada per conflicte), `documentSlice.ts`
  (`startNewDocumentThunk` → `clearDraft`) i `draftStorage.ts` (clau única per a tot l'origen).
- **Per què importa**: B19 ha tancat la pèrdua de feina —una pestanya ja no pot esborrar la feina
  d'una altra—, però les pestanyes continuen sense parlar-se. Passen dues coses: la pestanya
  bloquejada **es queda bloquejada** fins que es recarrega, encara que l'altra ja s'hagi tancat; i
  «Document nou» d'una pestanya **esborra l'esborrany de totes**, de manera que l'altra es queda
  amb la feina només a la pantalla sense saber-ho.
- **Proposta**: `BroadcastChannel` per avisar les altres pestanyes quan es desa o s'esborra
  l'esborrany. Amb compte: posar-se al dia no pot voler dir substituir el que l'usuari té a la
  pantalla —fer desaparèixer feina visible és pitjor que no desar-la—, així que el més probable és
  que hagi de ser un avís amb acció, no un canvi automàtic.

### B23 — L'idioma desat de l'usuari sense compte no mana sobre el de la URL 🔴 Oberta

*(Trobada resolent B18, branca `claude/estudi-pla-execucio-2w1pzq`.)*

- **On**: `App.tsx` (l'efecte de locale, que només s'executa amb sessió o amb caché de compte) i
  `LanguagesLayaut.tsx` (l'`IntlProvider` pren l'idioma del `:locale` de la URL).
- **Per què importa**: qui té compte veu l'app en el seu idioma encara que obri un enllaç d'un
  altre locale; qui no en té, no. Un usuari sense compte que hagi triat castellà i obri
  `/ca/create-sequence` es queda en català, i la seva preferència desada no hi pinta res. Són
  **dues regles diferents per a la mateixa cosa** segons si hi ha sessió.
- **Proposta**: decidir-ne una de sola. Fer que la preferència mani sempre és una línia (treure la
  condició), però canvia el comportament dels **enllaços compartits**: qui rebi un `/fr/…` d'algú
  altre acabarà al seu propi idioma. L'alternativa és la contrària —que la URL mani sempre i la
  preferència només decideixi on aterra qui entra per l'arrel—, que treu el salt del tot. Cap de
  les dues és òbvia i per això no s'ha decidit dins de B18.

### B24 — L'usuari no veu els seus límits ni pot fer res per no topar-hi ✅ Resolta

**Resolta per `52ac416`** (branca anterior a l'última edició d'aquest fitxer, però sense marcar-la);
detectat a la revisió del 2026-09-27. Les dues meitats de la proposta hi són, amb tres diferències:

- **Consum visible**: `AccountStorageSummary` al tab Usuari —espai amb barra i xifra, imatges que
  encara hi caben, documents i paraules—, només amb sessió. El `.select()` que faltava ja no cal:
  el consum arriba per `refreshQuotaThunk` / `quotaSlice`.
- **Mida triada per l'usuari**: `SettingCardImageQuality` amb tres nivells (`print` 1.800 px /
  500 KB, `standard` 1.200 px / 250 KB, `compact` 800 px / 120 KB). Els números difereixen dels de
  la taula de sota; `print` continua sent el valor per defecte.
- **Avís en pujar, no en desar**: si la imatge no cap, `ImageSizeDialog` ho diu i ofereix la versió
  comprimida que sí que hi cap. La pujada no es bloqueja mai.
- **Diferència 1 — no és `QUOTA_IMAGES_EXCEEDED`**: el límit real és d'espai
  (`QUOTA_STORAGE_EXCEEDED`), i ara el seu missatge diu on es veu què ocupa cada imatge.
- **Diferència 2 — sense reducció retroactiva**: decidit a propòsit. «Les imatges ja pujades no es
  toquen mai», perquè reduir és irreversible. En comptes d'això, `AccountImagesList` mostra el pes
  de cada imatge i d'on penja, perquè l'usuari triï quina esborra.
- **Diferència 3**: el comptador no és al costat del botó de pujar, sinó al tab Usuari; al botó
  només hi arriba quan la imatge no cap. Si més endavant es troba a faltar, reobrir-ho com a
  entrada nova.

*Text original de l'entrada:*

- **On**: `shared/tierLimits.ts` (els límits), `modules/user-settings/service.ts` `getUiSettings`
  (que **no** retorna `usage`), `utils/imageToBase64.ts` (`MAX_IMAGE_SIDE_PX`, fix a 1800),
  `UploadImageButton`, `VocabularySettingsPanel`, `SaveDocumentModal`.
- **Per què importa**: el pla gratuït dona **10 imatges pròpies** (5 MB amb el sostre de 500 KB per
  imatge). Enlloc de l'app es diu això, ni quantes se n'han fet servir. Qui puja una foto ja ha fet
  la feina de triar-la i retallar-la abans de descobrir que no hi cabia, i l'única sortida que
  se li ofereix és esborrar-ne una altra. Un límit que només es descobreix xocant-hi és un límit
  mal comunicat, i aquí encara més: en AAC les imatges pròpies —les cares de la família, els
  objectes de casa— són justament el que fa que l'app sigui d'aquella persona.
- **I el sostre no cal que sigui aquest**: les imatges es desen sempre a mida d'impressió
  (1.800 px, ~500 KB), que és el cas pitjor absolut —un pictograma sol a 150 mm. Dotze pictogrames
  en un A4 surten a uns 70 mm cadascun, i amb 1.000 px n'hi hauria de sobres. La resolució que cal
  depèn de la mida impresa, i **això ho sap l'usuari i no ho sap el sistema**.

**Proposta** (dues meitats, i la segona no té sentit sense la primera):

1. **Ensenyar el consum.** «Has fet servir 6 de 10 imatges», al panell de Vocabulari i al costat del
   botó de pujar. Té una dependència de backend que avui no hi és: `getUiSettings` selecciona
   `settings langSettings theme viewSettings wordProfiles tier emailVerified role` i **`usage` no hi
   surt**, o sigui que el front no pot pintar cap comptador. És una línia al `.select()`.
   L'error d'arribar-hi ha de portar codi propi (`QUOTA_IMAGES_EXCEEDED`, no el genèric d'espai) i
   dir què fer, no «quota excedida».
2. **Deixar triar la mida en pujar**, en termes de mida impresa i no de píxels:

   | | Costat llarg | Imprimeix bé fins a | Pes | Caben en 5 MB |
   |---|---|---|---|---|
   | Gran | 1800 px | 152 mm (pictograma a mida màxima) | ~500 KB | 10 |
   | **Normal** (per defecte) | 1000 px | 85 mm | ~155 KB | 33 |
   | Petita | 600 px | 51 mm | ~56 KB | 91 |

   I **retroactiva**: qui topa amb el límit ha de poder reduir les que ja té. A Cloudinary es fa
   tornant a pujar la variant petita sobre el mateix `public_id` amb `overwrite: true` — la URL no
   canvia, així que no s'ha de tocar res de la base de dades, només el `bytes` del registre
   d'assets i el comptador.

**Compte amb la regla que això toca**: el CLAUDE.md diu que la mida de les imatges és igual per a
totes i no depèn de quantes n'hi hagi, perquè en pujar-la encara no se sap a quina mida s'imprimirà
i el resultat dependria de l'ordre d'arribada. Aquesta proposta hi cap perquè **tria l'usuari, no el
sistema**: ningú endevina res i no depèn de l'ordre. El que continua sent cert de la regla és que
**reduir és irreversible**, i per això s'ha de dir i no amagar.

### B25 — Entrar a la vista esborra la vista per seqüència que porta el `.saac` ✅ Resolta

*(Trobada preparant les fixtures de regressió del mode lliure, branca `feature/fixtures-saac`.)*

> **Decisió presa** (branca `claude/sequencia-estil-b25-16pluv`): la regla és la de
> `docs/fonaments/sequencia-i-estil.md` — la seqüència es desa amb el seu estil i s'obre tal com es
> va desar; les preferències de qui l'obre no la reescriuen. La implementació és a la mateixa branca.

- **On**: `ViewSquenceSettings.tsx`, l'efecte de muntatge que fa
  `applyViewSettingsToAllActionCreator(savedUserDefaults.current)`.
- **Per què importa**: el `.saac` desa `documentState.viewSettings` per seqüència (mida, separació,
  alineació H/V), però en obrir la pestanya «Vista» l'efecte els sobreescriu **tots** amb les
  preferències globals de l'usuari. El document no es veu mai com es va desar, i si després es torna
  a descarregar, el fitxer ja no porta els valors originals: és pèrdua de dades silenciosa.
  Reproduït amb `apps/web/test/fixtures/saac/02-diverses-pestanyes.saac` (pestanya 0 a 1.5 i
  centrada, pestanya 2 a 0.7 a baix a la dreta): després de passar per la vista, les quatre
  pestanyes surten a `sizePict: 1`, a dalt a l'esquerra. És la mateixa confusió entre preferència
  i estat de B21, vista des del document.
- **Proposta**: aplicar les preferències només a les seqüències que no en tenen (document nou,
  pestanya nova, `.saac` antic sense `viewSettings`), no a tot el document en cada muntatge. És un
  canvi de comportament visible —qui avui obre un `.saac` veu les seves preferències, no les del
  fitxer— i per això no s'ha fet aquí. Cal decidir-ho **abans** de la fase 1 del mode lliure: la
  disposició per pàgina que hi afegeix seria el següent camp esborrat pel mateix efecte. En
  resoldre-la, les captures de `e2e/saac-fixtures.spec.ts` s'han de regenerar a propòsit.
- **Resolta** a la branca `claude/sequencia-estil-b25-16pluv`, amb una decisió més àmplia que la
  proposta: `docs/fonaments/sequencia-i-estil.md`. La seqüència es desa **sempre amb el seu
  estil** (esquema 2 del `.saac`, i `.saacstyle` per a l'estil sol) i s'obre tal com es va desar;
  les preferències de qui l'obre només arriben a les seqüències noves, que hereten l'estil per
  defecte fins que es desen.
  - **La causa era doble.** L'efecte de muntatge de la columna de vista posava les preferències a
    totes les pestanyes; i, a més, la lletra, la lletra dels números i la numeració no es desaven
    enlloc del document —es pintaven amb `ui.defaultSettings` de qui l'obria—, i obrir un `.saac`
    amb configuració substituïa la de l'usuari. L'efecte s'ha tret i tot el que pinta pictogrames
    llegeix l'estil del document (`style/styleSelectors.ts`).
  - La lectura de tots els formats és a `features/sequence/style/saacFile.ts`, amb fusió camp a
    camp dels estils parcials, i passa també pels documents del núvol.
  - Captures regenerades: 01–04 canvien perquè ara es veuen amb la vista del fitxer; totes sis
    canvien la lletra de reserva (el test bloqueja Google Fonts, i la reserva és ara sans-serif en
    comptes de la serif del navegador). 06 i 07 no canvien de disposició. Fixtures noves 08–10.

### B26 — La disposició no viatja al `.saac` ✅ Resolta

*(Obert resolent B25, branca `claude/sequencia-estil-b25-16pluv`.)*

- **On**: `ui.viewSettings` (`direction`, `pageSize`, `orientation`) contra `DocumentSAAC.layout`,
  que l'esquema 2 ja admet i ningú no escriu (`packages/shared-types/src/document.ts`).
- **Per què importa**: segons `docs/fonaments/sequencia-i-estil.md`, la disposició és contingut de
  la seqüència, com l'ordre o les pestanyes. Avui és una preferència més, i qui obre un `.saac` el
  veu en la pàgina i la direcció de qui l'obre: una seqüència preparada en A3 apaïsat en columnes
  surt en A4 en files. És el mateix que passava amb l'estil abans de B25, en més petit.
- **Resolta (2026-09-29, model v3, ADR-003 decisió 6)**: la pàgina (mida, orientació, direcció i
  espai entre seqüències) és a `page` del fitxer i a `DocumentSAAC.layout`. La columna de la vista
  parteix de la del document i hi escriu els canvis; un document sense pàgina (nou, o d'un format
  antic) hereta la de les preferències fins que es desa.
- **Proposta**: escriure `layout` en desar i llegir-lo en obrir; els fitxers sense `layout`
  s'obren amb la disposició per defecte de l'usuari, com l'estil. El lector
  (`style/saacFile.ts`) ja el conserva, l'API ja el valida i el desa, i no cal cap versió 3 de
  l'esquema. Ho ha de fer abans la fase 1 del mode lliure, que hi afegeix la disposició per pàgina.
  Tanca també el que queda de B21.

### B27 — Les fonts de Google no se serveixen des de l'app 🔴 Oberta

*(Obert en revisar la fase 2 de l'estil del document, branca `claude/sequencia-estil-b25-16pluv`.)*

- **On**: `apps/web/src/style/fonts.css`, que carrega unes noranta famílies amb `@import` de
  `fonts.googleapis.com`; `features/sequence/style/fontAvailability.ts`, que avui només pot avisar
  que en falta alguna.
- **Per què importa**: el `.saac` desa només el nom de la família. Sense accés a Google Fonts —sense
  connexió, o en una xarxa d'escola que el bloqueja— el text surt amb la sans-serif de reserva, i el
  document no es veu tal com es va desar, que és el que promet `docs/fonaments/sequencia-i-estil.md`.
  A més, cada visita envia l'adreça IP de l'usuari a Google, cosa que a la UE s'ha considerat una
  transferència de dades personals sense base legal.
- **Proposta**: servir les fonts des de la mateixa app (fitxers `woff2`, subconjunts llatí i llatí
  ampliat, amb `font-display: swap`) i carregar-les a demanda, només les famílies que fa servir el
  document obert, en lloc dels noranta `@import` de cada arrencada. **No** incrustar-les al `.saac`:
  cada família i pes hi afegiria de desenes a centenars de KB, i un fitxer de seqüències s'ha de
  poder enviar per correu. Cal mesurar el pes del paquet abans i després, i mirar les llicències
  (totes les de Google Fonts són OFL o Apache, que ho permeten).

### B28 — Una paraula llarga amb lletra gran es talla dins de la targeta 🔴 Oberta

*(Mateixa revisió.)*

- **On**: `PictogramCard` (`textContent` a `PictogramCard.styled.ts`): la caixa del text fa l'ample
  de la imatge i la targeta retalla el que en sobresurt.
- **Per què importa**: una paraula que no es parteix («Previsualització», «esmorzar-se» a mida 2)
  es talla a la vora de la targeta a la pantalla, al paper i al PDF, sense cap avís. Es veu a la
  previsualització del panell «Estil del document» amb l'estil extrem de
  `e2e/fixtures/estil-extrem.saacstyle`.
- **Proposta**: triar entre partir la paraula (`hyphens: auto` amb l'idioma de la cerca) o reduir-ne
  la lletra fins que hi càpiga. Cal decidir-ho: en CAA partir una paraula no és neutral per a qui
  llegeix, i reduir-la trenca la mida que ha triat qui prepara el document.

### B29 — La previsualització del vocabulari personal sobresurt del requadre 🔴 Oberta

*(Mateixa revisió.)*

- **On**: `VocabularySettingsPanel.tsx`, la mostra de la columna esquerra.
- **Per què importa**: és la mateixa causa que tenia la previsualització del panell «Estil del
  document»: una targeta sense escalar dins d'un requadre de mida fixa amb `overflow: hidden`. Amb
  vores amples o lletra gran, en mòbil (on el requadre fa com a molt el 35 % de l'alçada) la part de
  baix queda fora de la vista.
- **Proposta**: embolcallar la targeta amb `ScaleToFit` (`components/SettingsLayout/`), com
  `DefaultForm`. `PictEditForm` no té aquest problema (no té requadre fix) i `ViewSettingsPreview` ja
  escala el full sencer.

### B30 — No hi ha historial de desfer i refer 🔴 Oberta

*(Obert en decidir el model de document `.saac` v3, `docs/decisions/ADR-003-model-document-saac-v3.md`.)*

- **On**: `features/sequence/store/styleSlice.ts`, que guarda un sol desfer (l'últim canvi
  d'estil) i l'ofereix amb un snackbar. La resta d'accions del document (afegir, esborrar i moure
  pictogrames, canviar-ne un, canviar la vista d'una seqüència) no es poden desfer.
- **Per què importa**: l'especificació del model v3 demanava desfer i refer per a totes les
  accions sobre l'estil. En aquesta versió només «Aplica a tots», «Restableix» i aplicar un estil
  fan servir el desfer que ja existeix (`docs/fonaments/03-model-contingut-estil.md` §5).
- **Proposta**: un historial del document (una pila de desfer i una de refer) a `documentSlice`,
  amb dreceres de teclat (Ctrl+Z, Ctrl+Maj+Z) i botons visibles a la barra de l'editor. Cal
  decidir-ne l'abast (quines accions en formen part, quants passos) i què passa amb el snackbar de
  «Desfés» actual.

## Gravetat baixa

Inconsistència de forma o deute intern, sense un moment concret d'acció equivocada.

### C20 — Errors d'axe als controls del formulari d'edició del pictograma 🔴 Oberta

*(Trobada en afegir l'estat «personalitzat» al formulari, 2026-09-29. L'acordió torna a ser el de
MUI, que torna a amagar el contingut plegat: els errors hi continuen igual, i aquesta entrada
també.)*

- **On**: el formulari d'edició del pictograma (`PictEditForm` i les `SettingsCards`), i la graella.
- **Per què importa**: amb la configuració desplegada, axe hi troba errors que ja hi eren. Abans no
  sortien perquè l'acordió de MUI amagava el contingut plegat i la prova no el desplegava:
  - `label`, `aria-prohibited-attr`: els interruptors (Color, Creu/X) porten el nom a l'`span` i no
    a l'`input` (és **C17**);
  - `nested-interactive`, `button-name`: el botó de color (`InputColor`) va dins d'un
    `ToggleButton`, i el «Puja una imatge teva» és una `label` amb rol de botó i un control a dins
    (`aria-allowed-role`);
  - `list`, `listitem`: la llista del formulari barreja `li` i `Stack`;
  - `heading-order`: el text de la targeta és un `h3` i els rètols de secció, `h6`;
  - a la barra, `aria-valid-attr-value` a `#vertical-tab-0`.
- **Proposta**: resoldre-ho per peces, començant per C17. L'e2e
  `pictogram-customized.spec.ts` passa axe només sobre el que ha canviat (la capçalera de «Estil del
  pictograma» amb el seu «Restableix», la previsualització i la seva còpia fixa, el snackbar i la
  marca); quan això es resolgui, s'ha d'ampliar a tot el diàleg.

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
- **Revisió 2026-09-27 — continua oberta, i ja no són quatre famílies sinó set**: `ai` (24
  fitxers), `md` (14), `bs` (3: `TabsSequences`, `ViewSquenceSettings`, `PictogramAmount`) i una
  sola icona de `ri` (`SettingCardTheme`), `tb` (`MouseActionList`), `io` (`InputColor`,
  `IoIosColorPalette`) i `fa` (`WelcomeFooter`, `FaLinkedin`). Aquesta última és un **logotip de
  marca** i no compta: l'estàndard, quan es faci, l'ha de declarar com a excepció. `io` no té cap
  motiu escrit i és el candidat més clar a passar a `ai`/`md`. Continua sense haver-hi cap
  estàndard d'icones a `docs/estandards/`.

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
- **Seguiment (F13 de l'estàndard de capes flotants)**: la reserva es va escriure a l'avís i per
  tant s'aplicava a **totes** les pàgines, també on no hi ha cap control al racó (inici, registre,
  panell). Ara la declara qui l'ocupa (`useFloatingCorner`) i l'avís la llegeix d'una variable CSS.

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
- **Nota posterior (B25)**: les caselles ja no hi són. Els fonaments de l'estil
  (`docs/fonaments/sequencia-i-estil.md`) les substitueixen per una sola acció, «Desa el document»
  (sempre amb l'estil); desar només l'estil (`.saacstyle`) és al panell «Estil del document». El
  test comprova ara això.

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
- **Residu**: en queden **7** (n'eren 13). Els 6 de `test-utils.tsx` han marxat amb el fitxer, que
  s'ha esborrat en refer l'arnès de proves (C10). Els que queden són apòstrofs sense escapar a
  `features/admin/` i dos `@ts-ignore` a `features/print-refactor/dpiDetector.tsx`.

### C10 — La suite de tests del web no compilava ni s'executava 🔴 Oberta (en quarantena)

*(Actualitzada el 2026-10-03: dels dotze fitxers en quarantena en queden vuit, vegeu C21.)*

*(Trobada en posar la barrera de tipus de C9. Mig resolta en reorganitzar `Modals/`.)*

- **On**: els vuit fitxers llistats al `exclude` de `vitest.config.ts` i del `tsconfig.json`.
- **Què s'ha fet**: el web ja té runner i arnès.
  - `vitest` + `jsdom` al workspace (`vitest.config.ts` hereta els alias del `vite.config.ts`, així
    no hi ha dues llistes que es puguin desalinear); `npm test` = `vitest run`.
  - `src/test/renderWithProviders.tsx` munta la mateixa pila de proveïdors que `index.tsx` amb
    l'store **de debò**: `app/store.ts` exporta `createAppStore`, que és l'única declaració del
    mapa de reducers. L'arrel del problema era justament tenir-ne dues.
  - `src/test/fixtures/document.ts` per als objectes de domini.
  - `utils/test-utils.tsx` i `setupTests.ts`, esborrats: eren la mock paral·lela desincronitzada i
    un `setup` que importava `.private/mocks/server`, que no és al repositori.
  - Els tests que corren **entren al `typecheck`**. Dos fitxers de l'store (`styleSlice.test.ts`,
    `applyAllReset.test.ts`) es muntaven el seu propi store amb quatre slices i ara fan servir
    `createAppStore`.
  - Estat: **140 tests verds** al web i 81 a l'API (`npx turbo test`).
- **Què queda**: vuit fitxers en quarantena, tots del mateix motiu.
  1. **Model d'estat anterior** (vuit): `App.test.tsx`, `BarNavigation`, `PictogramAmount`,
     `PictogramCard`, `PictogramSearch`, `SettingCard`, `MagicSearch`, `uiSlice.test.tsx`. Escrits
     contra un slice `sequence` que ja no existeix, amb API de Jest i props que han canviat.
  2. ~~**Expectatives caducades** (quatre)~~ — **tancat el 2026-10-03 amb C21**.
     `usePageFormat.test.ts` i `useScaleCalculator.test.ts` esperaven les mides `PAGE_FORMATS`
     escrites a mà i esborrades el 2026-02-01 (975×689 per a un A4 apaïsat, quan la mida correcta
     d'avui, derivada de l'ISO 216 menys els marges a 96 DPI, és 1047×718). Reescrits perquè
     **derivin** el que esperen de `PAPER_DIMENSIONS_MM`, `PRINT_MARGIN_MM` i `CSS_PRINT_DPI`: així
     el test diu la regla i no una fotografia dels números d'un dia. De passada va caure la
     premissa d'un cas («menys marge, més escala»), que el límit d'escala a 1,0 del commit
     `7dea37c` havia invalidat. `useScaleCalculator.oreintationFixe.test.ts` (sense cap test a
     dins) i `loadLocaleMessage.test.ts` s'han esborrat; el segon, amb el mòdul que provava
     (`languages/loadLocaleMessages.ts`), que no importava ningú.
- **Per què en quarantena i no arreglats**: perquè «arreglar-los» aquí voldria dir reescriure els
  números que s'esperen sense haver mirat si el que ha canviat és correcte, i això és convertir una
  prova en una fotografia del bug. I deixar-los dins vol dir que `npm test` neix vermell, que és
  tornar al punt de partida: una barrera que no mira ningú.
- **Proposta**: per cada fitxer, portar-lo a `src/test/renderWithProviders` o esborrar-lo. Els
  quatre d'expectatives caducades, derivant les mides de la constant de DPI en comptes de clavar-hi
  el número. Els de la llista 1 demanen tants retocs com reescriure'ls.

### C11 — Una vora «fitzgerald» sense classificació es pinta del color del text ✅ Resolta

*(Trobada en posar la barrera de tipus de C9.)*

- **On**: `utils/fitzgeraldToBorder.ts`
- **Per què importa**: el fallback era `fitzgeraldColors.not`, una clau que **no existeix** a
  `data/fitzgeraldColors` (només hi ha `1`…`6`). Resolia a `undefined`, el `borderColor` sortia
  buit i el navegador el pintava amb `currentColor` — el color de la lletra del voltant. Passa amb
  els pictogrames sense `fitzgerald` (documents antics: `extractPictSettings` sempre l'omple) quan
  la vora està configurada com a «fitzgerald». No és greu perquè és una vora, però el color surt
  d'un accident, no d'una decisió.
- **Resolta (2026-09-29, model v3)**: el color dels pictogrames sense categoria és `none` de l'estil
  del document (`#666666`), també per als antics que no en portaven cap. La targeta el rep a
  `PictogramCardDefaults.fitzgerald`; `currentColor` només queda com a última reserva.
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


### C15 — L'estat del document diu l'hora però no el dia ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`, amb una correcció a la proposta:
  **no es podia decidir només a `formatTime`**. El que en surt entra dins de frases que donen per
  fet que és una hora —«des de **les** {time}», «a **les** {time}»— i una data hi queda com «des de
  les 27/8/26 18:42», que en català no es diu; el mateix a les altres quatre llengües, cadascuna
  amb la seva preposició. Per això cada estat té ara **dues frases**: `statusLocalDated`,
  `statusFileDated` i `statusCloudDated`, traduïdes als cinc idiomes.
  - `isToday` compara **dia de calendari**, no «fa menys de 24 hores»: a les 00:30, un moment de
    les 23:50 d'ahir ha de sortir amb data encara que faci quaranta minuts.
  - Data curta amb any (`dateStyle: "short"`): al panell hi caben 260 px, i un esborrany pot
    sobreviure a un canvi d'any.
  - **Sense «ahir»**: es llegeix millor, però afegeix un tercer estat a cada frase —quinze
    missatges més entre els cinc idiomes—, obliga a decidir què passa amb «abans-d'ahir» i no
    resol el cas que va originar la troballa, que és l'esborrany de fa dies.
  - Fixat a `e2e/document-status-date.spec.ts`, que fa passar el temps amb `page.clock`: d'avui
    diu l'hora, de l'endemà diu el dia, i una feina d'ahir a les 23:50 llegida a les 00:30 surt
    datada.

### C16 — Ningú demana emmagatzematge persistent al navegador ✅ Resolta

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
- **Resolta** a la branca `claude/estudi-pla-execucio-2w1pzq`, amb una correcció important a la
  proposta: **«no obre cap diàleg» només val per a Chrome**. Comprovat a la documentació dels
  navegadors, Firefox obre un diàleg de permís i, sobretot, **no concedeix res si la crida no ve
  d'un gest de l'usuari** — o sigui que demanar-ho només des del desat automàtic (un segon després
  d'un canvi, fora de qualsevol clic) hi és paper mullat.
  - `storage/persistentStorage.ts` demana `persist()` **una sola vegada per càrrega de pàgina** i
    només si `persisted()` diu que encara no està concedit; el resultat s'ignora i cap error surt
    de la funció.
  - Dos punts de crida: després de la **primera escriptura correcta** de l'esborrany (cobreix
    Chrome sense demanar res a ningú) i en **obrir el botó flotant d'estat** — un clic, i el moment
    de l'app on el permís té més sentit, perquè és quan l'usuari està preguntant on es desa la
    feina. No es demana des de «Desa al núvol» ni «Descarrega»: allà la feina ja va a un lloc
    durador.
  - Safari continua amb el seu límit de set dies: contra això no hi ha crida que valgui, i la
    resposta de l'app ja és una altra (el `.saac` i el núvol).
  - Fixat a `e2e/persistent-storage.spec.ts`, amb un doble de `navigator.storage` que compta les
    crides: primera escriptura, gest del botó d'estat, cap crida si ja està concedit i cap canvi de
    comportament en un navegador sense l'API.

### C18 — L'spec de vídeo de «multiple-sequences» no s'executa des de C5 🔴 Oberta

*(Trobada regenerant les captures després de fusionar master, fora de l'abast de N2.)*

- **On**: `apps/web/e2e/screenshots/multiple-sequences.spec.ts` — busca
  `getByRole("checkbox", { name: /apply.*(all|tots)/i })`.
- **Per què importa**: poc, i per això no s'ha arreglat aquí. És l'únic spec que grava vídeo, i
  cap notícia n'usa cap avui (`NewsStep.video` és opcional i no el fa servir ningú). Falla des
  de `cc62c90`, el commit de C5 que va treure els noms accessibles en anglès literal; les
  imatges de la notícia les fa `multiple-sequences-focused.spec.ts`, que sí que passa.
- **Proposta**: decidir primer si el vídeo es vol. Si es vol, el switch «Aplica a totes» és avui
  un `SettingRow control="compact"` i el seu nom no és al `checkbox` (vegeu C17); si no, esborrar
  l'spec en comptes de deixar-lo vermell fent de soroll a la suite.

### C17 — El switch d'un ajust arriba sense nom al lector de pantalla 🔴 Oberta

*(Trobada regenerant les captures de N2, fora del seu abast.)*

- **On**: `components/SettingsCards/SettingCardBoolean/SettingCardBoolean.tsx` — l'`aria-label` es
  passa directament al `Switch` de MUI.
- **Per què importa**: MUI el posa al `span` del `SwitchBase`, que no té cap rol, i **no** a
  l'`<input type="checkbox">` de dins. Comprovat al navegador: els dos switches del tab
  Pictogrames («Numeració» i «Color») tenen `aria-label` nul a l'input, o sigui que un lector de
  pantalla anuncia una casella sense nom. És el mateix defecte que C12 va corregir als `Select`
  —l'etiqueta posada a l'element que no és el control—, i afecta tot `SettingCardBoolean`.
- **Proposta**: seguir el patró de l'estàndard i no repetir l'etiqueta: que `SettingRow` passi el
  seu `labelId` i el `Switch` el reculli amb `inputProps={{ "aria-labelledby": labelId }}`. Així
  el nom surt del títol de la fila, com a la resta de controls.

### C19 — L'avís de baix i el botó flotant no compartien la mateixa base en mòbil ✅ Resolta

Branca `claude/mobile-snackbar-alignment-y9ykit`. *(Continuació de C7: allà es va resoldre
l'encavalcament horitzontal; l'alineació vertical va quedar com estava.)*

- **On**: `components/FloatingLayer/floatingLayer.styled.ts` — `floatingSnackbarSx`, que vesteix
  els tres avisos de l'app (`FeedbackSnackbar`, `SessionExpiredNotice`, `BackendWakeUpNotice`).
- **Per què importava**: per sota de `sm`, MUI ancora el `Snackbar` a `bottom: 8, left: 8` i
  l'app ancora tot el que sura a `FLOATING_EDGE_GAP` (16). Quan l'avís i el `DocumentStatusFab`
  comparteixen la franja de baix —que és sempre que es desa a l'editor o al visualitzador—, les
  dues capes es veien com dues peces de la mateixa família mal col·locades: l'avís 8 px més
  avall que el botó i 8 px més a prop del cantó esquerre que el botó del dret. L'estàndard ja
  demanava «una sola àncora» per als botons flotants; els avisos no la seguien.
- **Resolució**: `floatingSnackbarSx` posa `bottom` i `left` a `FLOATING_EDGE_GAP` per sota de
  `sm`, i la reserva del racó (`FLOATING_CORNER_VARIABLE`) hi cau amb el mateix valor per defecte
  quan no hi ha cap control de què apartar-se. A 390 px: l'avís va de `x = 16` a `x = 311` amb
  base a 16, i el botó de `x = 319` a `x = 374` amb la mateixa base.
- Fixat a `e2e/download-and-status.spec.ts`, que ara compara també les bases i els dos marges de
  cantó, no només l'encavalcament.

### C26 — 12 codis d'error de l'API no tenen text propi 🔴 Oberta (ajornada)

*(Oberta en tancar l'ADR-004, 2026-10-04. Ajornada: el back no està operatiu a la web de
producció, amb els comptes apagats.)*

- **On**: `packages/i18n/src/errors.ts`, `API_ERROR_CODES_WITHOUT_TEXT`. Són `ACCOUNTS_DISABLED`,
  `ASSET_INVALID_ID`, `ASSET_NOT_FOUND`, `AUTH_TOKEN_INVALID`, `AUTH_TOKEN_MISSING`,
  `CLIENT_ERROR_NOT_FOUND`, `DOCUMENT_NOT_FOUND`, `FORBIDDEN`, `IMAGE_INVALID`, `INTERNAL_ERROR`,
  `INVALID_DATA` i `MAIL_SEND_FAILED`.
- **Per què importa**: si un d'aquests codis arriba a l'usuari, `errorMessageFor` hi ensenya el
  missatge genèric del context («S'ha produït un error inesperat», «No s'ha pogut desar el
  document») en lloc de dir què ha passat. No és cap regressió: abans de l'ADR-004 passava igual,
  perquè tampoc no tenien text. Alguns sí que poden arribar a la pantalla d'algú: `MAIL_SEND_FAILED`
  en registrar-se, `DOCUMENT_NOT_FOUND` en obrir un document del núvol, `IMAGE_INVALID` i
  `ASSET_*` en desar imatges, `INVALID_DATA` en un formulari. Els `AUTH_TOKEN_*` els resol el
  refresc de sessió sol, i `FORBIDDEN` i `CLIENT_ERROR_NOT_FOUND` només els veu l'administració.
- **Proposta**: quan es tornin a encendre els comptes, decidir quins poden arribar a l'usuari,
  escriure'n el text als cinc idiomes de `packages/i18n/messages/errors/` i treure'ls de
  `API_ERROR_CODES_WITHOUT_TEXT`. `errors.test.ts` obliga a fer les dues coses alhora.

---

## Proves pendents

Proves que se sap que falten i que no es poden fer ara. Cada entrada diu per què s'ajorna i què
l'ha de desencallar.

### P1 — Regressió del `.saac` amb els comptes encesos 🔴 Oberta (ajornada)

*(Branca `feature/fixtures-saac`, en preparar les fixtures de regressió del mode lliure.)*

- **Per què s'ajorna**: el 27-09-2026 s'aturen els comptes (`VITE_ACCOUNTS_ENABLED=false` al web,
  `ACCOUNTS_ENABLED=false` a l'API). Aquestes proves es faran quan es tornin a encendre.
- **El que ja hi és**: `e2e/saac-fixtures.spec.ts` amb les fixtures de
  `apps/web/test/fixtures/saac/` cobreix el camí sense compte: obrir, tornar a desar i pintar la
  vista. Passa igual amb els comptes encesos i apagats, amb les mateixes captures. Totes les proves
  van des de fitxer; cap no passa pel servidor.
- **El que falta, amb compte i contra l'API de debò**:
  1. **Anada i tornada pel núvol.** Desar cada fixture al núvol, tornar-la a obrir i baixar-la a
     `.saac`. Pel camí, `contentStorage` compacta els ajustos que coincideixen amb la configuració
     del document, `expandContent` els torna a posar i `serializeDocument` normalitza. Cal
     comprovar que en surt el mateix document, com passa amb el fitxer. Hi ha una excepció
     buscada: el núvol conserva només 12 `bestIdPicts` per pictograma
     (`MAX_STORED_BEST_ID_PICTS`). Les fixtures en porten com a màxim 3; cal afegir-n'hi una amb
     més per fixar aquest retall.
  2. **Imatges pròpies.** La `03` porta dues imatges en `data:image`: en desar-la s'han de pujar a
     Cloudinary i substituir per la URL. Cal comprovar que el `.saac` baixat després porta les
     URL, que la vista es pinta igual i que `storageBytes` compta el que toca.
  3. **Document del núvol baixat a fitxer i tornat a pujar.** La `02` té un id de Mongo: cal
     comprovar-ne els dos camins (actualitzar el mateix document o desar-ne una còpia, per
     `isMongoId`) amb un usuari que no és el propietari de l'id.
  4. **Configuració global amb sessió.** Obrir la `02`, la `03` o la `05`, que porten
     `defaultSettings`, no ha de disparar `saveUserUiThunk`. Les preferències només es desen quan
     l'usuari ho demana.
  5. **Camps nous del mode lliure (fase 5).** Els validadors de `modules/documents/validators.ts`
     són `z.object` normals, i per tant **descarten en silenci les claus que no coneixen**. Si no
     s'hi afegeixen `schemaVersion` i la disposició de pàgina, el núvol se la menjarà sense cap
     error, mentre que el fitxer la conservarà. Aquesta prova és la que ho ha de detectar.
- **Proposta: un usuari de proves dedicat.**
  - **Entorn.** Ha de ser una base de dades de proves (una altra base dins del mateix clúster
    d'Atlas n'hi ha prou) i no la de producció. Un compte creat a producció ocupa una plaça de
    `maxUsers` i una de les altes del dia, surt a les estadístiques del panell i barreja les seves
    imatges amb les de la gent.
  - **Compte.** Una adreça que controli el mantenidor (un àlies `+proves` de la seva), verificada
    des del panell d'administració (estat `active`) per no gastar cap dels 100 correus diaris de Resend (L5 de
    `docs/ESTUDI-limits-serveis-gratuits.md`), amb rol `user` i no `admin`: ha de veure el que veu
    la gent.
  - **Quotes.** El pla gratuït té 10 documents i 5 MB. Les set fixtures hi caben, però una prova
    que falli a mitges deixa documents i imatges penjats. Les proves han d'esborrar el que creen en
    acabar, i des del panell se li pot posar un `quotaOverride` perquè una
    passada a mig netejar no bloquegi la següent.
  - **Credencials.** `E2E_USER_EMAIL` i `E2E_USER_PASSWORD` com a variables d'entorn, mai al
    repositori. L'spec que les necessiti s'ha de saltar (`test.skip`) si no hi són, perquè
    `saac-fixtures.spec.ts` es continuï podent executar sense compte.
  - **Alternativa per al dia a dia.** API local amb `mongodb-memory-server` (el que ja fan els tests
    d'`apps/api`) i Cloudinary interceptat. No gasta cap quota i no necessita cap compte real.
    L'usuari de proves quedaria llavors per a una passada final contra els serveis de debò abans de
    tornar a encendre els comptes.
- **Desencalla**: tornar a encendre els comptes, o bé tenir l'API local amb base de dades en
  memòria.

## Novetats pendents de publicar

Surten de la tria de `docs/NOTICIES-candidates-des-de-2.0.2.md`. Les sis notícies que no
demanen compte ja són publicades; aquí queda el que se'n va deixar fora i per què.

### N1 — Les tres notícies de compte no estan escrites 🔴 Oberta (ajornada)

- **On**: `apps/web/src/data/newsItems.ts` — hi falten `user-account`, `cloud-documents` i
  `personal-vocabulary`, que la tria dona per prioritat alta.
- **Per què importa**: són les tres funcionalitats més grans de la versió i cap usuari se n'ha
  assabentat. Es van deixar per a més endavant a propòsit, no per descuit: totes tres demanen
  compte i s'han de publicar juntes i en ordre —primer el compte, després el vocabulari i els
  documents—, perquè les altres dues no s'entenen sense la primera.
- **Proposta**: la tria ja porta la fitxa de cadascuna, amb els passos i el que **no** s'hi ha de
  dir. Dues decisions hi són imprescindibles i no són de redacció: la notícia del compte ha de dir
  aviat que **tot el que funcionava sense compte continua funcionant sense compte**, i la del núvol
  ha de dir el **sostre de tres documents** amb el `.saac` il·limitat al costat, en comptes de
  deixar-lo descobrir al quart document.
- **Revisió 2026-09-27 — continua oberta, amb dues correccions:**
  - **El sostre és ara de 10 documents** (`a166e4b`), no de 3; el de vocabulari, de 3 paraules, i
    l'espai d'imatges, de 5 MB. La fitxa de `docs/NOTICIES-candidates-des-de-2.0.2.md` (§ notícia 4 i
    decisió 2) i `docs/INVENTARI-funcionalitats-des-de-2.0.2.md` (§ quotes: «3 documents, 200
    paraules, 50 MB») encara porten els números vells. **Cal corregir-los abans d'escriure la
    notícia**, o es publicarà un límit que no és cert.
  - **Depèn de l'interruptor de comptes.** Des de la 2.1.0 hi ha compilacions amb
    `VITE_ACCOUNTS_ENABLED=false` (`accountsConfig.ts`), on el compte, el núvol i el vocabulari
    personal no hi són. Aquestes tres notícies només es poden publicar quan la compilació de
    producció tingui els comptes encesos; si no, expliquen funcionalitats que l'usuari no troba,
    que és exactament el defecte de N2.

### N2 — Dues notícies publicades ja no són certes ✅ Resolta

- **On**: `apps/web/languages/*.json`, claus `news.logo-menu.*` i `news.new-languages.*`
- **Per què importa**: `logo-menu` anomena el menú «Edita» i «Previsualitza» —avui es diuen
  **Edició** i **Vista**— i el seu pas 3 diu que el selector d'idioma és a baix del menú lateral,
  d'on va marxar cap al tab Usuari de configuració i cap a la pantalla d'inici. `new-languages`
  hi dedica els passos 1 i 2 sencers a aquell camí. Una notícia que explica un camí que ja no
  existeix és pitjor que no tenir-la: qui la segueix conclou que l'app està trencada.
- **Proposta**: reescriure els textos afectats als cinc idiomes i regenerar les captures amb els
  `*-focused.spec.ts` que ja hi ha. **Verificat que cal**: en tornar a executar
  `download-pdf-focused.spec.ts` les tres imatges canvien, o sigui que totes les captures
  anteriors al canvi d'icones i de contrast de la barra de vista estan desfasades, encara que el
  text que les acompanya continuï sent cert.
- **Resolta** a la branca `claude/inventory-features-2-0-2-l2p1zu`. L'entrada es quedava curta: no
  eren dos textos i unes captures velles, sinó que **cinc dels set specs de captura ja no corrien
  contra la interfície d'avui**, cadascun per un motiu diferent i tots conseqüència de canvis que
  sí que estan documentats aquí:
  - `logo-menu` i `new-languages` buscaven el selector d'idioma del calaix, que ja no hi és.
    Reescrits sencers sobre `newsShot.ts`; el primer ensenya ara la secció de configuració i el
    segon el camí nou (menú principal → Configuració → pestanya Usuari).
  - `view-improvements` filtrava el grup de toggles per `[aria-label="left"]`, un literal en
    anglès que **C5 va eliminar** en fer que el nom accessible surti del missatge traduït.
  - `save-improvements` buscava el botó de pujar imatge pel seu nom de «pujar», però la captura
    es fa **després** de pujar-la i aleshores el botó es diu «Canvia la imatge pujada».
  - `number-font` obria el diàleg de configuració i hi buscava la numeració sense canviar de
    pestanya: el diàleg **té pestanyes** des de la migració i obre a Usuari. A més no tenia cap
    mock d'ARASAAC —el panell antic no ensenyava cap pictograma i el d'ara sí, i sortia una
    imatge trencada al mig— i la secció dels números queda per sota de la primera pantalla.
  - Els tres últims, a més, feien `goto` esperant l'esdeveniment `load`, que amb les fonts de
    Google no arriba mai: passen a `domcontentloaded` i a servir les fonts buides, com els nous.
  Els enquadraments dels controls petits dins d'una fila ampla s'han eixamplat a l'amplada del
  panell: centrats en el control, el títol que diu **de què és** quedava fora per l'esquerra.
  Verificat que les **tretze** pàgines de novetats es renderitzen sense cap clau sense traduir i
  amb totes les imatges carregades.

### N3 — La notícia de llegibilitat es va deixar sense escriure 🔴 Oberta

- **On**: la tria la proposava com a `readability`, categoria `millora`, prioritat baixa.
- **Per què importa**: poc. És el calaix de canvis que individualment no són notícia —el verd que
  marxa d'on feia de text, els botons d'afegir que eren invisibles, els diàlegs que ara es tanquen
  igual, el que sura que ja no tapa l'última fila.
- **Proposta**: si s'escriu, demana una captura **d'abans i després** de la barra de la pàgina de
  vista, i l'«abans» obliga a construir una revisió antiga. És l'única de les sis sense compte que
  no s'ha publicat, i el motiu és aquest cost, no el contingut.

### C21 — `features/print-refactor/` era la implementació de debò i es deia «refactor» ✅ Resolta

*(Trobada en establir l'estàndard d'estructura de fitxers, en treure `Modals/`. Resolta el 2026-10-03.)*

- **On era**: `features/print-refactor/` — 1.481 línies en cinc fitxers.
- **Què s'hi va trobar en revisar-la**: no era un problema de nom, era una carpeta buida de feina.
  - **Res del que calculava no s'usava.** Tots els camins vius passen el DPI explícitament
    (`CSS_PRINT_DPI`, 96): `calculateUsableDimensions`, `useDownloadPdf` i `usePrintStyles`. El
    commit `7dea37c` (2026-06-12, «Escala impressió: sempre 96 CSS DPI per pageFormat») va deixar
    la detecció sense feina, i ningú no la va treure.
  - **I la detecció era tautològica.** `detectPhysicalDPI()` mesurava un `div` d'una polzada, però
    una polzada CSS val 96 px per definició. Comprovat amb Chromium a `deviceScaleFactor` 1, 2 i 3:
    **96 px sempre**. La branca de «pantalla Retina = 192 DPI» no s'executava mai.
  - **Un cost real, això sí**: `usePageFormat` cridava `useScreenDPI()` i no en llegia el valor. A
    cada esdeveniment de `resize`, sense throttle, inseria un `div` al `document.body`, en llegia
    l'`offsetWidth` —reflow sincrònic forçat—, el treia i feia `setState` amb un objecte nou, o
    sigui re-render de tota la pàgina de vista amb els pictogrames a dins. El `resize` de debò ja
    el porta `useWindowResize`.
  - **Codi mort**: `CalibrationTool.tsx` (486 línies, ningú no l'importava, i reimplementava les
    conversions per quarta vegada), `usePageDimmension.ts` (85, i calculava la pàgina amb el DPI
    *de pantalla*: revifar-lo hauria trencat la coincidència entre previsualització i paper),
    `DPISettings` i els dos `logDPIInfo`.
  - **El `README.md`** (299 línies) enllaçava a quatre documents esborrats el 2026-02-01, descrivia
    una estructura inexistent i donava per fetes mètriques inventades («0 bugs relacionats amb
    càlculs d'escala en 3 mesos», «Reducció del 60% en complexitat ciclomàtica»), amb
    `Status: ✅ Production Ready`.
  - **Qualitat**: `import` al mig del fitxer, `React.FC` sense importar React (l'error `no-undef`),
    textos en català clavats al codi i `grey.100` a `DPISettings`, `localStorage` directe per fora
    de `settingsStorage`, `// @@ts-expect-error` amb dues arrobes (que no fa res),
    `useDPIChangeListener` que es diu `use*` i no és un hook, guardes de SSR en una SPA i una
    cache mutable a nivell de mòdul.
- **Què s'ha fet**: esborrar-la sencera. El que calia conservar són les dues conversions, ara a
  `features/print/utils/pageUnits.ts` (8 línies) i **amb el DPI com a argument obligatori**: abans
  queien a un DPI «detectat» quan no se'ls passava cap, i qui escrivia `mmToPixels(210)` sortia del
  contracte sense cap avís.
  - `types/PageFormat.ts` → `features/print/utils/pageFormat.ts`, que era lògica del domini
    d'impressió vivint a `types/` (8 importadors).
  - `PageSize` es declarava dues vegades (aquí i a `shared-types`, que és la que viatja dins del
    `.saac` i de l'API): ara es reexporta la compartida.
  - S'ha esborrat també `PRINT_CONTAINER_PADDING` (valia 0 i no la llegia ningú) i
    `languages/loadLocaleMessages.ts` amb el seu test, que tampoc no importava ningú.
  - **Sense canvi de comportament**: les mides del full les segueix donant la mateixa aritmètica a
    96 DPI. Verificat amb el `typecheck` net, 162 tests verds i l'spec
    `e2e/download-pdf-page-format.spec.ts`, que llegeix el `/MediaBox` del PDF que surt.
  - Dels 7 errors d'ESLint del web en queden **3** (els apòstrofs de `features/admin/`), i els
    avisos passen de 237 a 142.

### C22 — La impressió sortia més petita, i diferent amb Ctrl+P que amb el botó ✅ Resolta

*(Reportada per l'usuari el 2026-10-03: amb la finestra a mitja pantalla i Ctrl+P la impressió
sortia com la vista; amb el Mac a pantalla completa i el botó d'imprimir, més petita. L'usuari va
insistir que la diferència entre els dos disparadors era real —i ho era.)*

- **On**: `features/print/hooks/usePrintStyles.ts` (`generatePrintCSS`).
- **La causa**: el CSS d'impressió amagava els controls amb `[class*="NotPrint"]`, però **les capes
  que suren no són a l'arbre de l'app**: MUI les penja de `document.body` amb un portal, i
  `NotPrint` no hi arriba mai. Mesurat amb el mitjà `print` emulat, abans del canvi:

  | capa | quan hi és | mida en impressió |
  |---|---|---|
  | `MuiDrawer-root` | **sempre** | `display: block`, **l'amplada de la finestra** (1680 px amb la finestra a 1680) |
  | `MuiTooltip-popper` | **només amb el ratolí damunt del botó** | `display: block`, 65 px, acabant a x = 1545 |

  Les dues es colaven al paper, però **la que encongia el full és el tooltip**: el menú lateral fa
  el 100 % de l'amplada i es replanteja amb la pàgina, mentre que el tooltip es queda clavat on era
  a la pantalla (vegeu el punt següent). I el tooltip del botó d'imprimir **està obert justament
  quan el cliques amb el ratolí**, mentre que **Ctrl+P no passa per cap tooltip**: d'aquí que el
  mateix full sortís bé amb el teclat i petit amb el botó. El `blur()` de `handlePrint` tanca el
  tooltip que ve del focus, no el que ve del ratolí.

- **Per què es nota com una mida**: el tooltip no s'hi col·loca sol. MUI l'hi posa amb un
  `transform: translate(1384px, 112px)` **en línia i en píxels, escrit per JavaScript**. Quan el
  navegador replanteja la pàgina a l'amplada del full (1047 px) per imprimir, el tooltip es queda
  clavat als 1384 px: queda molt fora del paper, el document passa a fer tota aquella amplada i el
  navegador **encongeix tot el dibuix** per fer-l'hi cabre.
- **Reproduït al pipeline d'impressió de debò** (PDF de Chromium, finestra de 1512 px):

  | ratolí damunt del botó | caixa de la pàgina | escala del dibuix |
  |---|---|---|
  | no (com un Ctrl+P) | 1103 × 774 px | 3,125 |
  | **sí (com quan el cliques)** | **1448 × 1016 px** | **2,379** — un **76 %** |

  Les captures que va enviar l'usuari donen **71,4 %**, amb la graella i el peu de llicència
  escalats pel **mateix** factor (graella 1163 → 831 px; peu 919 → 656 px): és un encongiment
  uniforme de tot el document, no un canvi de disposició. La diferència amb el 76 % mesurat aquí és
  l'amplada de la finestra —com més ampla, més lluny queda el tooltip i més encongeix.
- **No és cosa de Safari.** Això es va escriure primer com una particularitat del WebKit, i és fals:
  **Chromium ho fa igual**. El que amagava la troballa és que les mesures d'abans es feien sense el
  tooltip obert, i sense tooltip no hi ha res que desbordi.
- **Per què no es reproduïa canviant mides a les eines de desenvolupador**: perquè la mida no era
  la variable. Calia **el ratolí damunt del botó**, i provant-ho des de les eines no s'hi arriba.
  La mida de la finestra només hi entra perquè com més ampla és, més lluny cau el tooltip i més
  encongeix.
- **El primer intent, i per què no bastava**: es van amagar les capes una per una
  (`.MuiDrawer-root`, `.MuiPopper-root`, `.MuiTooltip-popper`…) i es va lligar `html`/`body` a
  l'amplada del full. Funcionava per a les capes conegudes, però era una **llista negra**: cada
  capa nova de MUI hi tornava a ser una fuita. Ho va dir l'usuari, i tenia raó.
- **Què s'ha fet**: girar-ho a **llista blanca**. `usePrintSheet` penja del `body` una còpia de
  `.preview-content` dins de `#print-root` i marca el `body`; el CSS d'impressió amaga **tot** el
  que penja del `body` i només deixa passar aquesta còpia. És el mateix camí que ja feia
  l'exportació a PDF —captura `.preview-content` i prou—, i per això el PDF no ha patit mai aquest
  problema.
  - El botó prepara la còpia ell mateix abans d'imprimir; **Ctrl+P no passa per codi nostre**, i
    per això el hook escolta també `beforeprint` (i el canvi de mitjà, per als Safari antics). Les
    dues vies donen el mateix full **per construcció**.
  - Si no hi ha full, no s'amaga res: val més imprimir la pàgina tal com surti que deixar l'usuari
    amb un paper en blanc.
  - El CSS d'impressió ja no anomena cap classe de MUI ni cap `NotPrint`: hi ha un test que ho
    comprova, perquè la llista negra no hi pugui tornar.
- **Verificació** (PDF de Chromium, amb el ratolí damunt del botó i sense):

  | finestra | via | caixa de la pàgina | escala del dibuix |
  |---|---|---|---|
  | 1280 | Ctrl+P / botó | 1047 × 718 px | 3,125 / 3,125 |
  | 1512 | Ctrl+P / botó | 1047 × 718 px | 3,125 / 3,125 |
  | 2560 | Ctrl+P / botó | 1047 × 718 px | 3,125 / 3,125 |

- **I una troballa que ningú no havia reportat**: la impressió sortia en **dues pàgines**, totes
  dues amb el full sencer (128 operacions de text a cada flux de contingut). Ara n'és una.
- **Proves de regressió**: `usePrintSheet.test.ts` (11 casos: la còpia, l'escala treta, que no es
  toca el full de la pantalla, la idempotència, el cas sense full i els avisos del navegador) i
  `usePrintStyles.test.ts` (9 casos: el marge, la llista blanca, les mides en mil·límetres i que no
  hi torni a aparèixer cap llista negra).

### C23 — El peu de llicència queia damunt de l'última fila de pictogrames ✅ Resolta

*(Reportada per l'usuari el 2026-10-04, provant la correcció de C22: «el peu de pàgina surt sobre
els pictogrames… i també al PDF, que també passa».)*

- **On**: `components/CopyRight/CopyRight.tsx`, el full de
  `components/ViewSequencesSettings/ViewSquenceSettings.tsx` i el CSS del clon de
  `features/print/hooks/useDownloadPdf.ts`.
- **Què passava**: el peu estava **tret del flux** a tots dos camins —`position: fixed` a la
  impressió, `position: absolute` al clon del PDF— amb el comentari explícit de «sense ocupar lloc
  a la seqüència». Mentre el full imprès era més gran que la pàgina hi havia prou aire i no es
  notava; en fer que el full sigui exactament la pàgina (C22), el peu i l'última fila de
  pictogrames van passar a compartir els mateixos píxels. Al PDF ja hi era des del principi.
- **Què s'ha fet**: el peu passa a ser **l'últim bloc de la columna del full**. `.preview-content`
  és ara una columna flex: el contingut (`flex: 1; min-height: 0`) i, a sota, el peu
  (`flex-shrink: 0`). Així es reserva l'espai ell mateix i no cal encertar cap alçada a mà —si el
  text fa dues línies, com pot passar en vertical, el full n'hi reserva dues.
  - El peu també canvia de propietari: el munta qui munta el full (`ViewSquenceSettings`) i no la
    pàgina (`ViewSequencePage`), que és on havia d'anar des del principi.
  - Al PDF, el CSS del clon es queda només amb `display: block` i el color: la part de posicionar-lo
    cau sencera.
- **Verificació** (full A4 apaïsat de 718 px d'alçada):

  | | contingut | peu |
  |---|---|---|
  | impressió | 0 – 689 px | 689 – 718 px |
  | captura del PDF | 0 – 689 px | 689 – 718 px |

  Cap encavalcament, i els dos camins donen el mateix. Els set e2e de PDF, verds.
- **Segona passada** (l'usuari: «continuen trepitjant-se, 6 pictogrames a mida 1,6»): reservar
  l'espai només al paper no bastava, per dues raons que es tapaven l'una a l'altra.
  1. **La previsualització oferia 29 px que el full no tenia.** El peu només es pintava al paper,
     de manera que a la pantalla el contingut podia arribar fins a baix de tot i en imprimir es
     trobava el peu a sobre. Ara el peu **es veu també a la previsualització**: el full ensenya tot
     el que s'imprimirà, i la vista i el paper tornen a ser la mateixa cosa —que és el que demana
     `docs/fonaments/03-model-contingut-estil.md`. Amb això decau C23b.
  2. **El contingut podia pintar-se fora de la seva caixa.** La columna li reservava l'espai, però
     res no l'hi retenia: amb `overflow: hidden` al bloc del contingut, el que no hi cap es **talla**,
     que és el que fa el paper. Comprovat amb 12 pictogrames a 1,6: la caixa fa 685 px i el
     contingut en demanaria 1259; la tercera fila surt tallada i el peu queda net i llegible.
  3. **Un espai que el delimita**: `SHEET_FOOTER_GAP_PX` (8 px) entre l'última fila i el peu, perquè
     no es toquin mai.
  4. El peu porta **tinta de paper** (`printColors.text`) i no la del tema: en fosc era text blanc,
     i ara que es veu damunt del full blanc hi hauria quedat invisible.
- **Verificació final** (full A4 apaïsat de 718 px):

  | | contingut | peu |
  |---|---|---|
  | previsualització | 0 – 685 px | 685 – 718 px |
  | impressió | 0 – 685 px | 685 – 718 px |
  | captura del PDF | 0 – 685 px | 685 – 718 px |

  Les tres superfícies, idèntiques. 187 tests verds i 12 e2e d'impressió i PDF.
- **Prova de regressió**: `components/CopyRight/CopyRight.test.tsx` (6 casos), amb els que vigilen
  que el peu no torni a sortir del flux ni a amagar-se de la previsualització.

### C24 — El full deixava 10 mm de blanc a cada banda del paper ✅ Resolta

*(Demanat per l'usuari el 2026-10-04, veient el resultat de C22 i C23: «podem fer que ara ocupi tota
la pàgina».)*

- **On**: `PRINT_MARGIN_MM`, a `features/print/utils/pageFormat.ts`.
- **Context**: aquella constant mana dues coses alhora —el que es descompta del paper per calcular
  el full, i el marge del `@page`—, i per això n'hi ha d'haver una de sola: amb els dos números
  iguals, la caixa de la pàgina i el full fan la mateixa mida i el full queda centrat sol, sense que
  el navegador hagi d'encongir res (C22).
- **Què s'ha fet**: baixar-la de **10 mm a 5 mm**.

  | marge | full (A4 apaïsat) | % del paper |
  |---|---|---|
  | 10 mm | 277 × 190 mm (1047 × 718 px) | 84,4 % |
  | **5 mm** | **287 × 200 mm (1085 × 756 px)** | **92,1 %** |

- **Per què no menys**: per sota d'aquí es trepitja el que les impressores no poden imprimir —la
  vora de sota és la més restrictiva—, i el que passaria llavors és el que es va arreglar a C22: el
  navegador ampliaria el marge pel seu compte i encongiria tot el full per fer-l'hi cabre. Si alguna
  impressora retalla el peu de llicència, aquest és el número que s'ha de pujar.
- **Verificació** (PDF de Chromium): paper 297 × 210 mm, full 287 × 200 mm, 5,0 mm per banda,
  **92,1 %** del paper, i escala del dibuix 3,125 —o sigui 1:1, sense cap encongiment. El contingut
  passa de 685 a **723 px** d'alçada útil i el peu es queda a la seva franja (723–756). Els nou e2e
  d'impressió i PDF, verds.
- **Efecte secundari a tenir present**: el full creix en píxels, de manera que a les seqüències ja
  fetes hi cap una mica més de contingut per fila i per columna. No canvia la mida dels pictogrames
  —aquesta la mana el control de mida—, només l'espai de què disposen.

### C25 — La llicència del peu es pot treure, però no quan hi ha autor ✅ Resolta

*(Demanat per l'usuari el 2026-10-04: «una propietat "llicència" per treure o posar de la impressió
la frase, amb la norma: si hi ha autor hi ha llicència».)*

- **On**: `ViewSettings.licence` (a `packages/shared-types` i a `types/ui.ts`),
  `components/CopyRight/CopyRight.tsx` i `components/ViewSequencesSettings/PrintFooterSection.tsx`.
- **La regla, en un sol lloc**: `showsLicence({ licence, author })` de `CopyRight`. El peu es pinta
  si la llicència està demanada **o si hi ha autor**: qui signa una seqüència n'ha de dir també
  d'on són els pictogrames, que no són seus. Un autor en blanc no compta com a autor.
- **On viu l'ajust**: a `ui.viewSettings`, al costat de l'autor, que és on viu el peu del full. Es
  desa amb «Desa com a preferències» i se sincronitza amb el compte com la resta de la vista. **No
  toca el format `.saac`**: l'autor tampoc no s'hi escriu des de la pàgina de vista.
- **Compatibilitat**: el camp és **opcional** a propòsit i **sense valor vol dir que sí**. El que ja
  hi ha desat —al navegador i als comptes— no el porta, i segueix sortint amb llicència sense cap
  migració. L'API el valida com a opcional i el model de Mongo l'accepta.
- **A la interfície**: una fila `SettingRow` amb interruptor (variant `compact`, la dels switches) a
  la secció «Peu d'impressió», tant a la columna de la pàgina de vista com al tab Vista del diàleg
  de configuració, que comparteixen component. Amb autor, l'interruptor es queda encès i **no
  respon**, amb `aria-disabled` a l'`input` —no a l'embolcall, que cap lector de pantalla no
  llegiria— i un tooltip amb `describeChild` que diu el motiu. `aria-disabled` i no `disabled`
  perquè la fila no surti de l'ordre de tabulació.
- **Efecte al full**: sense peu, el contingut recupera la franja sencera —de 723 a **756 px**
  d'alçada útil en A4 apaïsat—, perquè el peu és un bloc de la columna del full i, quan no hi és,
  no ocupa res.
- **Verificació**, conduint la pàgina de debò: amb la llicència encesa el contingut va de 0 a 723 i
  el peu hi és; en treure-la, de 0 a 756 i el peu desapareix; en escriure un autor, el peu torna i
  l'interruptor es queda encès amb `aria-disabled`; i un clic **forçat** amb autor no el mou.
  Playwright, de fet, es nega a clicar-lo pel seu compte: llegeix l'`aria-disabled` igual que un
  lector de pantalla.
- **Proves de regressió**: `CopyRight.test.tsx` (13 casos, amb la taula de la regla) i
  `PrintFooterSection.test.tsx` (7 casos: el valor per defecte, treure-la, tornar-la a posar, el
  bloqueig amb autor, que segueixi sent accessible amb teclat i que digui **per què** no es pot
  treure).
- **Traduccions**: tres claus noves als cinc idiomes (`pages.viewSequence.licence.*`), compilades.
