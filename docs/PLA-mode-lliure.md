# Pla: mode lliure de pàgina

> **Estat**: proposta, pendent de confirmar abans d'escriure codi (pas 0 de l'encàrrec).
> **Encàrrec**: `docs/spec-mode-lliure.md`, a la branca `origin/feature/mode-lliure` (no fusionada).
> **Fonaments que mana**: `docs/fonaments/03-model-contingut-estil.md`,
> `docs/fonaments/06-compatibilitat-i-dades.md`, `docs/decisions/ADR-003-model-document-saac-v3.md`.

Aquest pla contrasta l'encàrrec amb el codi d'avui i en fixa l'abast. Allà on el codi i
l'encàrrec no coincideixen, ho diu i proposa per on anar.

## 1. Decisions preses (2026-11-06)

| Pregunta | Decisió |
|---|---|
| Quina interacció | **Plantilla + retoc**: es parteix d'una plantilla de distribució i després cada caixa es pot moure i redimensionar a mà |
| Quantes pàgines | **Diverses pàgines** |
| Qui mana la mida del pictograma | **La caixa**: la graella de dins s'hi ajusta (columnes i mida) |
| On viu | **Visualització** (`/view-sequence`) |
| Espai | **La pàgina ha de quedar tan gran com es pugui**: els ajustos no li poden menjar amplada fixa (§6, «L'espai») |
| Contingut de cada pàgina | **A cada pàgina s'hi posen les seqüències creades**: l'usuari tria quines van a cada pàgina (§6) |
| Repetir | **La mateixa seqüència pot sortir a diverses pàgines.** Sovint un document té una part igual a cada pàgina (§5 i §6, «Repetir una seqüència») |

## 2. Premisses que no es toquen

1. **El mode d'ara és el per defecte** («Disposició: Automàtica / Lliure»). Un document sense
   disposició lliure s'obre i s'imprimeix exactament com avui.
2. **Mil·límetres només a la disposició lliure**, i **el que es veu és el que s'imprimeix**:
   pantalla, paper i PDF surten de la mateixa disposició.
3. **Els pictogrames no es deformen mai**: la caixa no els estira, els reorganitza.
4. **Tot local**: funciona igual amb `VITE_ACCOUNTS_ENABLED=false`.
5. **Res destructiu sense desfer**, i tota acció acaba amb un missatge.
6. **Accessible**: tot el que es fa arrossegant es pot fer sense arrossegar i amb el teclat.
7. **La disposició és del document**: viatja al `.saac`, i les preferències de qui obre no la
   reescriuen mai (B25/B26).
8. **Les regles del repo** (`CLAUDE.md`): TypeScript estricte, colors de `palette.ts`, `SettingRow`,
   textos a `packages/i18n` en tots els idiomes, `npm run typecheck` net.

## 3. El que hi ha avui (i que condiciona el disseny)

- **Un sol full.** La vista pinta un únic `.preview-content` a la mida del paper (menys els 5 mm de
  `PRINT_MARGIN_MM`), amb `overflow: hidden`: el que no hi cap es talla. **No hi ha paginació
  enlloc**: ni a la vista, ni a `usePrintSheet` (clona aquell full), ni a `useDownloadPdf` (el
  captura amb html2canvas i en fa **una** pàgina de jsPDF). «Diverses pàgines» és, doncs, el canvi
  més gran de tot el pla, i només afecta el mode lliure.
- **El format hi té lloc reservat, però amb una forma que ja no serveix.** v3 reserva
  `page.layout: "free"` i `sequences[].frame { x, y, w, h, z }`: **un sol** rectangle per seqüència.
  Amb seqüències repetides, una seqüència pot tenir molts rectangles, i el `frame` no ho pot dir.
  Cap versió de l'app no l'ha escrit mai, així que es pot substituir sense trencar res (§5).
- **Els camps desconeguts de `page` ja es conserven.** `toRedux` només coneix `size`, `orientation`,
  `direction` i `sequenceGap` (`PAGE_KEYS`); la resta va a `saacExtra.page` i `serialize` la torna a
  escriure.
- **El núvol no.** Els validadors de `apps/api/src/modules/documents/validators.ts` són `z.object`
  normals i descarten les claus que no coneixen (P1, punt 5, a `docs/BACKLOG-ux.md`).
- **Les claus de les seqüències són estables.** `documentSlice` només permet esborrar l'última
  seqüència (`deleteLastSequence`) i no reindexa mai: una col·locació pot apuntar a la clau numèrica
  a Redux i a l'`id` de la seqüència al fitxer.
- **La targeta és proporcional a `sizePict`.** Amplada, vores, radis, padding, imatge i lletra es
  multipliquen tots per `pictSize` (`PictogramCard.styled.ts`). Com que l'amplada i la lletra
  escalen igual, el text es parteix igual a qualsevol mida. Conseqüència: **n'hi ha prou de mesurar
  la targeta un cop a mida 1**; la resta és aritmètica pura.
- **Desfer**: només el snackbar d'estil (`styleSlice`, un pas). L'historial general és **B30**, obert.
- **El full es dibuixa amb un `children` de `ViewSquenceSettings`** (748 línies), que ja és massa
  gran per afegir-hi un segon mode a dins.

## 4. Contradiccions amb l'encàrrec, i per on anar

| L'encàrrec diu | El codi o els fonaments diuen | Proposta |
|---|---|---|
| `Page { layers: Layer[] }`, amb `Layer.sequenceId` | v3 reserva un `frame` **a la seqüència** | **Mana l'encàrrec**, perquè la decisió de repetir seqüències ho demana: les col·locacions són de la pàgina i apunten a la seqüència. Cal una ADR nova (ADR-005) que substitueixi la decisió 7 de l'ADR-003 (§5) |
| Afegir `schemaVersion` | Ja hi és (3) | — |
| Seguir `docs/design-conventions.md` | No existeix: són `docs/estandards/` | Es segueixen els estàndards |
| Mòduls `actions/`, `keybindings/`, `input/`, `history/`, `announcer/` | L'app no en té cap, i té Redux | Vegeu §7: funcions pures + Redux, sense marc d'accions propi |
| `locked`, `visible`, `zIndex`, alinear/distribuir, guies, imant | — | **Fora d'aquesta branca.** Primer cal veure si la plantilla + retoc resol la necessitat |
| Una capa no pot sortir de la pàgina; avís fora de l'àrea imprimible | El full **ja és** l'àrea imprimible (paper − 5 mm) | L'origen de coordenades és el full: una caixa dins del full és, per definició, imprimible |

## 5. Model de dades

### Paraules

- **Full**: cadascuna de les pàgines del document en mode lliure (a la interfície, «pàgina 1, 2…»).
  Al codi, `sheet`, que és com l'app ja diu el full imprès (`sheetSurface`, `usePrintSheet`).
- **Col·locació**: una seqüència posada en un lloc d'un full, amb la seva caixa. Una seqüència pot
  tenir zero, una o moltes col·locacions.
- **Comuna**: una col·locació que surt **a tots els fulls**, al mateix lloc.

### Al fitxer (`.saac` v3)

```jsonc
"page": {
  "size": "A4", "orientation": "portrait", "direction": "row", "sequenceGap": 1,
  "layout": "free",
  "sheets": [
    { "id": "sh_1", "placements": [
        { "id": "pl_1", "sequence": "seq_2", "x": 5, "y": 40, "w": 190, "h": 120, "columns": "auto" }
    ] },
    { "id": "sh_2", "placements": [
        { "id": "pl_2", "sequence": "seq_3", "x": 5, "y": 40, "w": 190, "h": 120, "columns": 4 },
        { "id": "pl_3", "sequence": "seq_2", "x": 5, "y": 170, "w": 90, "h": 60, "columns": "auto" }
    ] }
  ],
  "common": [
    { "id": "pl_9", "sequence": "seq_1", "x": 5, "y": 5, "w": 190, "h": 30, "columns": "auto" }
  ]
}
```

- **Tot va dins de `page`**: la disposició és part de la pàgina del document (fonament 03, §3).
  `sheets` i `common` existeixen **només** si `layout` és `"free"`.
- **`sheets`** és una llista ordenada amb `id` estables (principi 6 del fonament 03). L'ordre és el
  de les pàgines.
- **`placements[].sequence`** és l'`id` de la seqüència. Una col·locació que apunta a una seqüència
  que no existeix es descarta en llegir.
- **La mateixa seqüència pot sortir en diversos fulls, i fins i tot dues vegades al mateix** (per
  imprimir-ne còpies per retallar). Cada col·locació té la seva caixa i les seves columnes; el
  contingut i l'estil de vista (espai, alineació) són els de la seqüència, i són els mateixos a
  totes les col·locacions.
- **`common`**: les col·locacions que surten a tots els fulls, pintades **per sota** de les del full.
  Un full nou ja les porta.
- **Origen i unitats**: mm des del cantó superior esquerre del **full** (el `.preview-content`, que
  ja és el paper menys el marge d'impressió). L'àrea útil exclou la franja del peu de llicència.
- **`columns`**: `"auto"` o un enter ≥ 1.
- **Una seqüència sense cap col·locació** (ni als fulls ni a `common`) és al calaix «Sense
  col·locar» (§6). No s'imprimeix, però no es perd.
- **`sequences[].frame` deixa d'estar reservat.** Cap versió no l'ha escrit; es treu de l'esquema i
  del fonament 06, i es llegeix com qualsevol camp desconegut (es conserva, no es fa servir).
- **`schemaVersion` no puja.** El canvi és compatible: `sheets` i `common` són camps nous de `page`,
  i una versió anterior de l'app els conserva com a desconeguts. Obre el document en mode flux (es
  veu diferent, però no perd res), i si el torna a desar, la disposició lliure hi continua. Cal,
  igualment, seguir la regla de canvi: esquema, fonament 06 i una fixture (`16-mode-lliure.saac`:
  dos fulls, una seqüència comuna, una de repetida en dos fulls i una caixa amb columnes fixes).
- **ADR-005** («Disposició lliure: fulls i col·locacions») recull per què el `frame` per seqüència no
  servia i substitueix la decisió 7 de l'ADR-003 («mil·límetres només a `frame`» passa a ser «només
  a les col·locacions»).
- **`size: "FULLSCREEN"` no admet mode lliure**: no té mil·límetres. Vegeu §10, D3.

### A Redux

La disposició lliure deixa de ser un camp desconegut i passa a ser del model, com la pàgina amb B26:

```ts
// packages/shared-types
interface DocumentLayout { direction?; pageSize?; orientation?; mode?: "flow" | "free" }

interface SequencePlacement {
  id: string;
  sequenceKey: number;            // la clau de `content`; al fitxer, l'`id` de la seqüència
  x: number; y: number; w: number; h: number;   // mm
  columns: "auto" | number;
}
interface FreeSheet { id: string; placements: SequencePlacement[] }
interface FreeLayout { sheets: FreeSheet[]; common: SequencePlacement[] }

// DocumentSAAC
freeLayout?: FreeLayout;
```

- `toRedux.ts` i `serialize.ts` els converteixen a la frontera (ADR-003, decisió 10): `sequence`
  (id) ↔ `sequenceKey` (clau), i deixen de tractar `layout`, `sheets` i `common` com a desconeguts.
- **Esborrar una seqüència** (a l'edició) n'esborra totes les col·locacions. Com que és destructiu
  per a la disposició, si en tenia, el missatge de l'edició ho diu.
- **En passar a «Automàtica», `freeLayout` no s'esborra de Redux**: tornar a «Lliure» recupera la
  disposició. En desar en mode flux no s'escriu (el fonament ho exigeix), i per això el canvi de
  mode té «Desfés».
- Esborrany d'IndexedDB: guarda el document de Redux, i per tant la disposició hi viatja sola. Cal
  comprovar-ho amb un test.

## 6. Experiència d'usuari

Tot passa a la pàgina de **Visualització**.

### L'espai: la pàgina, tan gran com es pugui

Avui la columna d'ajustos de la vista reserva **380 px fixos** a partir de `md`
(`SCREEN_MARGINS.medium`), i el full s'escala a la resta. En un portàtil de 1366 px, això vol dir
gairebé un terç de la pantalla per als ajustos, també quan no se'n toca cap. Per treballar a mà sobre
les caixes, aquest espai és el que més falta.

La proposta té tres peces:

1. **Els ajustos passen a un panell que entra pel costat.** Un botó «Ajustos» a la barra de la vista
   l'obre per la dreta, **per damunt** del full, sense empènyer-lo. Quan és tancat, el full fa servir
   tota l'amplada. El panell **no és modal en escriptori**: el full del costat continua viu, de manera
   que es pot canviar un ajust i veure'n l'efecte, o seleccionar una altra caixa sense tancar-lo. Per
   sota de `sm` sí que ocupa tota la pantalla (no hi ha costat on deixar el full). Es tanca amb la creu
   i amb Esc, i el focus torna al botó.
2. **El retoc no necessita el panell.** Amb una caixa seleccionada, una **barra petita enganxada a la
   caixa** porta el que es fa sovint: *Columnes*, *A totes les pàgines*, *Copia a la pàgina…*,
   *Treu d'aquesta pàgina*. Les xifres en mm («Posició i mida») viuen al panell, que és l'alternativa
   sense arrossegar (WCAG 2.5.7).
3. **El full s'encabeix a l'espai que queda**, amb dos modes de zoom a la barra: *Pàgina sencera* (per
   defecte) i *Amplada*, que l'amplia i deixa desplaçar-se en vertical: útil per a les nanses en
   tauleta.

- **També en mode automàtic.** El panell substitueix la columna als dos modes: tenir-la fixa en un i
  plegable en l'altre faria que l'app canviés de forma en canviar de disposició. Els ajustos de dins
  no canvien (són els mateixos `SettingRow`); només canvia el contenidor.
- **És una capa flotant nova.** L'estàndard de capes flotants admet dos diàlegs canònics i diu que un
  tercer tipus seria «un tercer component canònic». Es proposa **`AppSidePanel`** a `components/`,
  genèric, i actualitzar `docs/estandards/capes-flotants.md` i `docs/estandards/configuracions.md`
  (que parla de «la columna de la pàgina de vista»). Cal comprovar que no surt al paper:
  `usePrintSheet` ja imprimeix només la còpia del full, i un portal de MUI en queda fora.
- **La navegació de pàgines** ocupa una línia a la barra: «‹ Pàgina 1 de 3 ›» i «+ Pàgina». Les
  miniatures de totes les pàgines van al panell, a la secció «Pàgines», no al costat del full.

### Activar-lo

- Fila nova a la secció de pàgina del panell d'ajustos: **«Disposició: Automàtica / Lliure»**
  (`SettingRow` amb un control segmentat).
- En passar a Lliure per primer cop, totes les seqüències es col·loquen soles amb una disposició
  **que s'assembla al que hi havia**: apilades en files (o en columnes, segons `direction`) a la
  pàgina 1. Si n'hi ha tantes que no hi caben a la mida mínima, es reparteixen en més pàgines.
  Missatge: «Disposició lliure. Pots afegir pàgines, triar una plantilla o moure les caixes.»

### Posar seqüències a una pàgina

Cada pàgina té les seves seqüències, i l'usuari tria quines.

- **«+ Afegeix una seqüència»**, damunt de la pàgina (a la barra, i al mig d'una pàgina buida com a
  botó gran), obre la llista de **totes les seqüències del document**, amb el títol de la pestanya i
  una miniatura dels primers pictogrames. Al costat de cadascuna, on és ja: «sense col·locar», «a
  les pàgines 1 i 3», «a totes les pàgines». Primer surten les sense col·locar.
- **Afegir-la no la treu d'enlloc**: en fa una col·locació nova en aquesta pàgina. Se'n poden triar
  diverses de cop.
- **On cau la que s'afegeix**: la pàgina es torna a repartir amb la plantilla que toca per al nombre
  nou de caixes (1 → sencera, 2 → dues, 3 → tres, 4 → 2 × 2…), en l'ordre en què hi són. Les comunes
  no es mouen: la plantilla reparteix l'espai que deixen lliure. Si la pàgina tenia retocs a mà, se'n
  perden: **sempre amb Desfés**. Després es pot triar una altra plantilla per a aquella pàgina.
- **«Treu d'aquesta pàgina»** (barra de la caixa, panell i Supr) treu **aquesta col·locació**, i prou.
  Si era l'última, la seqüència torna al calaix **«Sense col·locar»**. No s'esborra res del document;
  esborrar una seqüència continua sent cosa de l'edició.
- **El calaix «Sense col·locar»** és una secció del panell, amb un comptador a la barra quan no és
  buit.
- **Abans d'imprimir o fer el PDF**, un avís si hi ha seqüències sense col·locar o pàgines buides
  («2 seqüències no són a cap pàgina i no sortiran»), amb *Imprimeix igualment* i *Cancel·la*.

### Repetir una seqüència

Dues maneres, segons si la part repetida va sempre al mateix lloc o no:

- **«A totes les pàgines»** (interruptor a la barra de la caixa i al panell): la col·locació passa a
  ser **comuna**. Surt a totes les pàgines, també a les que es creïn després, i **es mou i es
  redimensiona a totes alhora**. És el cas d'una capçalera, un horari del dia o un «Avui és…». La
  caixa porta una marca discreta (forma i text, «A totes les pàgines») perquè quedi clar que
  moure-la la mou a tot arreu; la marca és d'edició i **no surt al paper ni al PDF**.
  Desactivar-lo la deixa només a la pàgina on s'és, i la treu de les altres (amb Desfés).
- **«Copia a la pàgina…»**: en fa una col·locació nova a la pàgina triada, a la mateixa posició i
  mida, i a partir d'aquí **independent**: moure l'una no mou l'altra. Per quan la part repetida va
  a llocs diferents segons la pàgina, o per a còpies per retallar.
- Amb les dues, **el contingut és un de sol**: canviar un pictograma de la seqüència a l'edició el
  canvia a totes les pàgines on surt. És el motiu de repetir-la i no duplicar-la.

### Plantilles

- Les plantilles són **per pàgina**: cada pàgina pot tenir la seva.
- Secció **«Plantilla d'aquesta pàgina»** al panell, amb miniatures (botons amb nom accessible):
  *Sencera*, *Dues en files*, *Dues en columnes*, *Tres en files*, *Quatre (2 × 2)*, *Tira a dalt i
  graella a sota*. Només s'ofereixen les que tenen almenys tants espais com caixes té la pàgina.
- Una plantilla és una llista d'espais en **fraccions** de l'àrea útil (0–1) amb un espai fix entre
  caixes. L'àrea útil és la que deixen lliure les comunes. En aplicar-la, les caixes de la pàgina
  hi van en ordre de lectura.
- La plantilla no es desa: és una manera de calcular les caixes, i el que es desa són les caixes.
- Aplicar una plantilla substitueix els retocs d'aquella pàgina: **sempre amb Desfés** (snackbar,
  com l'estil).

### Retoc

- **Seleccionar**: clic o toc a una caixa. Marc i nanses de selecció (contrast ≥ 3:1, colors de
  `palette.ts`; damunt del full, fixos en tots dos temes).
- **Moure**: arrossegar la caixa. **Redimensionar**: quatre nanses de cantonada, ≥ 24 × 24 px
  (44 en tàctil). Pointer Events, amb `touch-action: none` només damunt de les caixes.
- **Sense arrossegar** (WCAG 2.5.7): secció **«Posició i mida»** al panell lateral per a la caixa
  seleccionada: X, Y, amplada, alçada (mm) i columnes (*Automàtic* o un nombre).
- **Teclat**: les caixes són al tabulador en ordre de lectura (dalt→baix, esquerra→dreta; les
  comunes primer). Amb el focus a una caixa: fletxes = 1 mm, Maj+fletxes = 10 mm, Alt+fletxes =
  redimensionar, Supr = treure d'aquesta pàgina. **Cap drecera amb el focus dins d'un camp de
  text.**
- **Límits**: una caixa no pot sortir del full ni fer-se més petita que el que demana la mida
  mínima del pictograma. La nansa s'atura, i un avís curt ho diu (també per `aria-live`).
- **Nom accessible** de cada caixa: «Rentar-se les mans, 6 pictogrames, també a les pàgines 1 i 3»;
  o «…, a totes les pàgines». Després de moure o redimensionar: «2 files, 3 columnes, pictogrames
  de 42 mm».

### Pàgines

- La vista ensenya **una pàgina cada cop**, tan gran com es pot, amb «‹ Pàgina 1 de 3 ›» a la barra.
- **«+ Pàgina»** n'afegeix una darrere de l'actual, amb les comunes ja posades, i hi va.
- **Al panell, secció «Pàgines»**: les miniatures, i per a cada pàgina *Duplica* (una pàgina nova amb
  les mateixes col·locacions, independents), *Mou amunt/avall* i *Esborra*. Esborrar una pàgina en
  treu les col·locacions (amb Desfés); les seqüències que es quedin sense cap lloc van al calaix.
- Les pàgines buides es desen tal com són: el document s'obre com es va desar.
- **Impressió**: `usePrintSheet` clona **tots** els fulls, amb salt de pàgina entre cadascun.
- **PDF**: `useDownloadPdf` captura cada full i fa `addPage` entre l'un i l'altre.
- **El peu de llicència** surt a cada pàgina.

### La mida, dins de la caixa

- Mana la caixa: el panell **amaga** el control de mida de la vista de la seqüència i hi posa una
  línia: «En disposició lliure, la mida la decideix la caixa.» Una seqüència repetida pot sortir a
  mides diferents en caixes diferents.
- L'espai entre pictogrames i l'alineació (horitzontal i vertical) **sí** que s'apliquen: són de la
  seqüència i valen a totes les seves caixes. L'espai entra al càlcul de la graella, i l'alineació
  diu on va la graella quan sobra lloc dins la caixa.
- La mida de la lletra continua sortint de l'estil: com que la targeta és proporcional, la lletra
  creix i s'encongeix amb la targeta i la proporció es manté.

### Seqüències noves o esborrades

- **Nova** (afegida a l'edició amb el document en mode lliure): no té cap col·locació, i per tant va
  al calaix «Sense col·locar». En entrar a la vista, un avís ho diu: «Hi ha 1 seqüència sense
  col·locar.» No es col·loca sola: decidir a quina pàgina va és de l'usuari.
- **Esborrada**: se n'esborren totes les col·locacions.

## 7. Arquitectura

No hi ha marc d'accions ni gestor de teclat propis. L'encàrrec els demanava per poder personalitzar
dreceres més endavant, i ell mateix diu que això no es fa ara. Amb Redux i funcions pures n'hi ha
prou, i el codi queda al costat del de la resta de l'app.

```
features/free-layout/                 # el domini: la disposició lliure del document
├── model/                            # funcions pures, sense React ni Redux, amb tests
│   ├── placement.ts                  #   SequencePlacement, clampPlacement, MIN_*, MOVE_STEP_MM…
│   ├── computeGrid.ts                #   (N, targeta a mida 1, espai, caixa) → columnes, files, mida
│   ├── templates.ts                  #   les plantilles en fraccions i applyTemplate
│   ├── sheets.ts                     #   afegir, duplicar, esborrar fulls; fer i desfer comunes
│   ├── initialLayout.ts              #   la disposició en activar el mode (s'assembla al flux)
│   ├── readingOrder.ts               #   ordre de lectura de les caixes
│   └── placementsOf.ts               #   on surt cada seqüència; les sense col·locar
├── store/                            # reducers a documentSlice + selectors; desfer d'un pas
├── hooks/
│   ├── usePlacementDrag.ts           #   Pointer Events → caixa (en mm)
│   └── useCardBaseSize.ts            #   mesura la targeta a mida 1
└── components/
    ├── FreeLayoutSheet/              #   un full amb les seves caixes (pantalla, impressió i PDF)
    ├── PlacementBox/                 #   la caixa: graella, selecció, nanses i teclat
    ├── PlacementToolbar/             #   la barra enganxada a la caixa seleccionada
    ├── PageNavigator/                #   ‹ Pàgina 1 de 3 ›, + Pàgina
    ├── SheetsPanel/                  #   les miniatures: duplicar, moure, esborrar
    ├── AddSequenceDialog/            #   triar seqüències per a aquesta pàgina (AppDialog, llista)
    ├── UnplacedTray/                 #   el calaix «Sense col·locar»
    ├── TemplatePicker/               #   les miniatures de plantilles
    └── PlacementPositionPanel/       #   «Posició i mida» (SettingRow)

components/AppSidePanel/              # capa canònica nova: el panell que entra pel costat (genèric)
```

- **`AppSidePanel`** és genèric (no sap res del document) i el fa servir la vista als dos modes. El
  contingut del panell continua sent el d'ara (`ViewSquenceSettings`) més les seccions del mode
  lliure.
- **`computeGrid`**: per a cada nombre de columnes de 1 a N (o el fix), files = ⌈N / columnes⌉;
  la mida que hi cap és `min(ampladaCaixa / ampladaGraella₁, alçadaCaixa / alçadaGraella₁)`,
  on `ampladaGraella₁` i `alçadaGraella₁` són els de la graella a mida 1 amb l'espai inclòs. Es tria
  la mida més gran; si empaten, menys files. Retorna també si la mida queda per sota del mínim.
- **La targeta a mida 1** es mesura al DOM (la més alta de la seqüència, perquè el text pot fer
  dues línies), un cop per seqüència i estil, i la comparteixen totes les seves caixes. Aquesta és
  l'única part que no és pura.
- **El full lliure és un component a part** (`FreeLayoutSheet`): `ViewSquenceSettings` només
  decideix si pinta el flux d'ara o aquest. No es toca la lògica del flux.
- **Desfer**: el d'un pas, com l'estil, per a les accions que substitueixen feina (aplicar una
  plantilla, afegir seqüències que tornen a repartir la pàgina, desactivar «A totes les pàgines»,
  esborrar una pàgina, tornar a Automàtica). Moure i redimensionar no esborren res i no en porten.
  L'historial complet continua sent **B30**.
- **Avisos `aria-live`**: el mecanisme de feedback que ja hi ha (`useFeedback`), no un servei nou.
- **Constants** amb nom (`MOVE_STEP_MM = 1`, `MOVE_STEP_LARGE_MM = 10`, `MIN_PICTO_MM = 15`), i
  **cap color fora de `palette.ts`**.

## 8. Fases d'aquesta branca

Cada fase deixa l'app funcionant i passa `npm run typecheck` net.

1. **Model.** ADR-005, tipus a `shared-types`, `toRedux`/`serialize`, esquema, fonament 06,
   fixture 16, i les funcions pures de `model/` amb tests. Sense interfície.
2. **L'espai.** `AppSidePanel` i la vista amb el full a tota l'amplada, també en mode automàtic,
   amb els estàndards actualitzats. És independent del mode lliure i es pot provar sol.
3. **Pàgines i seqüències.** El selector «Disposició», `FreeLayoutSheet` (només lectura), les
   pàgines, «+ Afegeix una seqüència», el calaix, les comunes, les plantilles per pàgina, la
   impressió i el PDF de diverses pàgines. Aquí ja es pot provar de debò si les plantilles resolen la
   necessitat.
4. **Retoc.** Selecció, arrossegar, nanses, barra de la caixa, «Copia a la pàgina…», «Posició i
   mida» i teclat.
5. **Núvol i proves.** Els validadors de l'API (P1, punt 5), un e2e de punta a punta (plantilla →
   comuna → retoc → `.saac` → reobrir → PDF) i una prova de regressió que les fixtures 01–15 no
   canvien.

**Després de la fase 3 cal parar i provar-ho amb gent** abans de seguir: és el punt on es veu si cal
el retoc a mà o si n'hi ha prou amb les plantilles i les comunes.

## 9. Riscos

- **Impressió de diverses pàgines**: el navegador ha de fer un salt exacte entre fulls. Cal provar
  Chrome, Safari i Firefox, perquè un mil·límetre de més fa sortir una pàgina en blanc.
- **PDF**: html2canvas per pàgina multiplica el temps. Cal un progrés visible («Pàgina 2 de 3»).
- **Comunes que tapen**: una comuna que ocupa molt deixa poc lloc a la plantilla de les pàgines.
  Les plantilles ho han de tenir en compte, i si no hi queda prou lloc per a la mida mínima, avisar.
- **Mesura de la targeta**: depèn de les fonts carregades. Cal tornar a mesurar quan arriben.
- **`ViewSquenceSettings`**: és gran i fràgil (la vista copia la pàgina en muntar-se). El canvi
  s'hi ha de limitar a triar quin full pinta.

## 10. Preguntes que queden obertes

| # | Pregunta | Recomanació |
|---|---|---|
| D1 | Com es veuen les pàgines a la vista | Una cada cop, tan gran com es pot, amb navegació a la barra i miniatures al panell (§6) |
| D2 | Pàgines buides | Es desen tal com són; abans d'imprimir, un avís |
| D3 | `FULLSCREEN` amb mode lliure | No s'hi ofereix: en triar Lliure, el selector de mida amaga «Pantalla completa». El botó de pantalla completa de la vista ensenya les pàgines una a una |
| D4 | Tornar a «Automàtica» | Es conserva la disposició a Redux, no s'escriu en desar, i el canvi té Desfés |
| D5 | Què passa en activar-lo | Totes les seqüències es col·loquen soles amb la disposició que s'assembla al flux, perquè no desaparegui res del full |
| D6 | Una seqüència pot sortir a més d'una pàgina? | **Decidit: sí.** Comuna (a totes, mateix lloc, es mou a totes alhora) o còpia independent a una pàgina concreta (§6, «Repetir una seqüència») |
| D7 | El panell lateral també en mode automàtic | **Sí** (§6, «L'espai»): que la vista no canviï de forma segons la disposició. Es pot fer abans i sol (fase 2) |
| D8 | Una comuna que no ha de sortir en una pàgina concreta (la portada, per exemple) | **Fora d'aquesta branca.** Es pot fer després amb una llista de pàgines on s'amaga, sense canviar la resta del model |
