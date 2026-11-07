# Pla: mode lliure de pàgina

> **Estat**: pla confirmat (2026-11-06). **Fases 1, 2 i 3 fetes**: el model (ADR-005), l'espai del
> full a la vista i les pàgines amb les seves seqüències (vegeu §11, «Com ha quedat la fase 3»).
> **Ara toca provar-ho amb gent** abans de les fases 4 i 5.
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

### L'espai: la pàgina, tan gran com es pugui ✅ (fase 2)

**Mesurat abans de fer-ho** (Playwright, document en paper Carta i A4, columna visible):

| Pantalla | Full apaïsat | Full vertical | Què el limita |
|---|---|---|---|
| 1366 × 768 | 887 × 618, escala 0,82 | 431 × 618, escala 0,57 | L'alçada |
| 1440 × 900, 1280 × 800 | escala 0,84–0,96 | escala 0,64–0,74 | L'alçada |
| 1920 × 1080 | escala 1 (el topall) | escala 0,86 | El topall i l'alçada |
| 1024 × 768 (tauleta apaïsada) | escala 0,56 | escala 0,61 | **L'amplada** (la columna) |
| Mòbil | — | — | La columna ja va a sota |

La suposició del pla era que la columna d'ajustos (380 px) era el que feia petit el full. No és
així: en gairebé tots els escriptoris el limita **l'alçada**, i un panell lateral no l'hauria fet
créixer. Per això la fase 2 ha quedat així:

1. **«Ajusta a l'amplada» / «Mostra el full sencer»**: el full s'encabeix a l'amplada i la resta es
   veu baixant. És el que compta de debò: un A4 vertical a 1366 px passa de 431 px a 756 (mida
   real). L'escala continua sense passar mai d'1.
2. **«Amaga els ajustos de la vista» / «Mostra…»**: la columna s'amaga i el full va al mig. Compta
   en pantalles estretes: a 1024 px apaïsat, l'escala passa de 0,56 a 0,82.
3. **La columna empeny el full, no hi sura per sobre**: mentre es toca un ajust se n'ha de veure
   l'efecte sencer, i un panell flotant en tapava un terç. Per això **no** és una capa flotant nova,
   no cal cap `AppSidePanel` i l'estàndard de capes flotants no canvia.
4. **Al mòbil no canvia res**: la columna ja és sota el full, i el full ja fa tota l'amplada.

Tots dos botons van a la barra de dalt, a partir de 900 px, i són estat de la pàgina: no es desen.
La regla és a `docs/estandards/configuracions.md`.

- **El retoc no necessita la columna.** Amb una caixa seleccionada, una **barra petita enganxada a
  la caixa** porta el que es fa sovint: *Columnes*, *A totes les pàgines*, *Copia a la pàgina…*,
  *Treu d'aquesta pàgina*. Les xifres en mm («Posició i mida») viuen a la columna, que és
  l'alternativa sense arrossegar (WCAG 2.5.7).
- **La navegació de pàgines** ocupa una línia a la barra: «‹ Pàgina 1 de 3 ›» i «+ Pàgina». Les
  miniatures de totes les pàgines van a la columna, a la secció «Pàgines», no al costat del full.
- **Queda per guanyar**, si cal: la fila de botons de sobre del full ocupa uns 48 px d'alçada, que
  podrien anar a la barra de l'app.

### Activar-lo

- Fila nova a la secció de pàgina de la columna d'ajustos: **«Disposició: Automàtica / Lliure»**
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
- **«Treu d'aquesta pàgina»** (barra de la caixa, columna i Supr) treu **aquesta col·locació**, i prou.
  Si era l'última, la seqüència torna al calaix **«Sense col·locar»**. No s'esborra res del document;
  esborrar una seqüència continua sent cosa de l'edició.
- **El calaix «Sense col·locar»** és una secció de la columna d'ajustos, amb un comptador a la barra quan no és
  buit.
- **Abans d'imprimir o fer el PDF**, un avís si hi ha seqüències sense col·locar o pàgines buides
  («2 seqüències no són a cap pàgina i no sortiran»), amb *Imprimeix igualment* i *Cancel·la*.

### Repetir una seqüència

Dues maneres, segons si la part repetida va sempre al mateix lloc o no:

- **«A totes les pàgines»** (interruptor a la barra de la caixa i a la columna): la col·locació passa a
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
- Secció **«Plantilla d'aquesta pàgina»** a la columna, amb miniatures (botons amb nom accessible):
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
- **Sense arrossegar** (WCAG 2.5.7): secció **«Posició i mida»** a la columna d'ajustos per a la caixa
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
- **A la columna, secció «Pàgines»**: les miniatures, i per a cada pàgina *Duplica* (una pàgina nova amb
  les mateixes col·locacions, independents), *Mou amunt/avall* i *Esborra*. Esborrar una pàgina en
  treu les col·locacions (amb Desfés); les seqüències que es quedin sense cap lloc van al calaix.
- Les pàgines buides es desen tal com són: el document s'obre com es va desar.
- **Impressió**: `usePrintSheet` clona **tots** els fulls, amb salt de pàgina entre cadascun.
- **PDF**: `useDownloadPdf` captura cada full i fa `addPage` entre l'un i l'altre.
- **El peu de llicència** surt a cada pàgina.

### La mida, dins de la caixa

- Mana la caixa: la columna **amaga** el control de mida de la vista de la seqüència i hi posa una
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
│   ├── placement.ts                  #   àrea útil del full, clampBox, moveBox, resizeBox, constants
│   ├── computeGrid.ts                #   (N, targeta a mida 1, espai, caixa) → columnes, files, mida
│   ├── templates.ts                  #   les plantilles en fraccions, freeRegion i applyTemplate
│   ├── sheets.ts                     #   fulls i col·locacions: afegir, duplicar, copiar, comunes…
│   ├── distribute.ts                 #   disposició de partida, afegir seqüències a un full
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

```

- La columna d'ajustos de la vista (`ViewSquenceSettings`) és la mateixa als dos modes; el mode
  lliure hi afegeix les seves seccions.
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

1. ✅ **Model.** ADR-005, tipus a `shared-types`, `toRedux`/`serialize`, esquema, fonament 06,
   fixture 16, i les funcions pures de `model/` amb tests. Sense interfície.
2. ✅ **L'espai.** «Ajusta a l'amplada» i «Amaga els ajustos de la vista», també en mode automàtic,
   amb l'estàndard de configuracions actualitzat. És independent del mode lliure.
3. ✅ **Pàgines i seqüències.** El selector «Disposició», les pàgines, «+ Afegeix una seqüència»,
   el calaix, les comunes, les plantilles per pàgina, «Copia a la pàgina…», les columnes, la
   impressió i el PDF de diverses pàgines, i l'avís abans d'imprimir. Vegeu §11.
4. **Retoc.** Selecció, arrossegar, nanses, barra de la caixa, «Posició i mida» i teclat. («Copia a
   la pàgina…» i les columnes ja són al menú de cada caixa des de la fase 3.)
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
| D1 | Com es veuen les pàgines a la vista | **Fet, i diferent del previst** (§11): totes una sota l'altra, a la mateixa mida, cadascuna amb la seva capçalera |
| D2 | Pàgines buides | Es desen tal com són; abans d'imprimir, un avís |
| D3 | `FULLSCREEN` amb mode lliure | No s'hi ofereix: en triar Lliure, el selector de mida amaga «Pantalla completa». El botó de pantalla completa de la vista ensenya les pàgines una a una |
| D4 | Tornar a «Automàtica» | Es conserva la disposició a Redux, no s'escriu en desar, i el canvi té Desfés |
| D5 | Què passa en activar-lo | Totes les seqüències es col·loquen soles amb la disposició que s'assembla al flux, perquè no desaparegui res del full |
| D6 | Una seqüència pot sortir a més d'una pàgina? | **Decidit: sí.** Comuna (a totes, mateix lloc, es mou a totes alhora) o còpia independent a una pàgina concreta (§6, «Repetir una seqüència») |
| D7 | El panell lateral també en mode automàtic | **Fet, i diferent del previst** (§6, «L'espai»): no és un panell flotant, sinó la columna de sempre, que es pot amagar, i un ajust a l'amplada. Val als dos modes |
| D8 | Una comuna que no ha de sortir en una pàgina concreta (la portada, per exemple) | **Fora d'aquesta branca.** Es pot fer després amb una llista de pàgines on s'amaga, sense canviar la resta del model |

## 11. Com ha quedat la fase 3

El que s'ha fet diferent del que deia §6, i per què:

- **Les pàgines van una sota l'altra**, no una cada cop amb navegació (D1). Totes a la mateixa
  mida, la que dona el càlcul d'escala (amb «Ajusta a l'amplada», a mida real). Dues raons: es veu
  d'una ullada què hi ha a cada pàgina, que és el que es mira quan es reparteix un document; i la
  impressió i el PDF necessiten tots els fulls al DOM. Per això no hi ha «‹ Pàgina 1 de 3 ›» ni
  miniatures a la columna.
- **Cada pàgina té la seva capçalera** (que no s'imprimeix): «Pàgina N de M», «Afegeix una
  seqüència», «Plantilla» i el menú de la pàgina (duplicar, moure amunt i avall, esborrar). Les
  accions d'una pàgina són a la pàgina, no a la columna: no cal dir mai «aquesta pàgina».
  «Afegeix una pàgina» va al final de totes.
- **Cada caixa és un botó amb menú**: «A totes les pàgines», «Copia a la pàgina», «Columnes» i
  «Treu d'aquesta pàgina». És la barra de la caixa que preveia §6 sense la selecció ni
  l'arrossegament, que són la fase 4.
- **El calaix «Sense col·locar»** és una fila de la columna amb el nombre i, a sota, els noms. Les
  seqüències s'hi afegeixen des de la capçalera de cada pàgina.
- **L'avís abans d'imprimir** surt si hi ha seqüències sense col·locar o pàgines sense res (ni
  pròpies ni comunes), amb la xifra. És un `AppDialog` i no el `ConfirmDialog`: imprimir no esborra
  res, i el botó vermell d'aquell diàleg diria el contrari. **Ctrl+P no hi passa**: el navegador no
  deixa aturar-lo, i imprimeix el que es veu.
- **El desfer és el de sempre**, ampliat: la instantània guarda també el mode de la pàgina (no la
  pàgina sencera, perquè desar-la la fa explícita i hauria trencat el desfer) i la disposició. El
  missatge de després de desfer ha passat de «S'ha desfet el canvi d'estil» a «S'ha desfet el
  canvi», als cinc idiomes.
- **La impressió** copia tots els fulls (`usePrintSheet`) i en diu quants al CSS amb
  `--print-sheets`, que fa l'alçada del document; cada full va al seu paper amb `break-after`. De
  passada s'ha corregit un defecte: preparar la còpia dues vegades (el botó i després
  `beforeprint`) copiava també la còpia anterior, perquè porta la mateixa classe.
- **El PDF** captura cada full i en fa una pàgina; el backdrop diu per quina pàgina va. Una pàgina
  sense pictogrames pot sortir en blanc de debò, i no compta com a captura fallida.
- **La pantalla completa** no s'ofereix en mode lliure; triar «Lliure» des d'allà passa al paper de
  cada dia de qui la fa servir, amb un missatge que ho diu.
- **Les marques d'edició** (el contorn de cada caixa, «A totes les pàgines», «Els pictogrames hi
  queden massa petits») són d'un color nou, `sheetGuide` (6,1:1 amb el blanc), i no surten mai ni al
  paper (`@media print`) ni al PDF (`data-html2canvas-ignore`). Comprovat amb Playwright: el PDF i la
  impressió de la fixture 16 surten iguals, dues pàgines i sense marques.

**Què queda obert**, a més de les fases 4 i 5:

- El núvol encara perd la disposició (P1, punt 5): desar al núvol un document lliure el torna a
  obrir en flux. Els comptes són apagats.
- «Afegeix una seqüència» torna a repartir la pàgina sencera: si s'havia retocat a mà, es perd (amb
  «Desfés»). Amb el retoc de la fase 4 potser caldrà col·locar la nova a l'espai lliure més gran.
- Una caixa massa petita ho diu damunt del full, però no s'impedeix: les nanses de la fase 4 són
  les que han d'aturar-se al mínim.


## 12. Revisió de la fase 3 (2026-11-07)

Primera revisió a la previsualització. Són els punts a treballar **abans d'aprofundir més** (abans
de la fase 4). Per a cadascun: què s'ha vist, què es proposa i què cal decidir. Res d'això no està
fet encara.

### R1 — Un sol model: pàgines a totes dues disposicions

- **Vist**: la disposició automàtica també ha de tenir més pàgines, i s'hi han de poder posar i
  treure seqüències.
- **Proposta**: deixar de tenir dos modes de document. El document és **sempre** una llista de
  pàgines, i cada pàgina té les seves seqüències. El que canvia és **com es col·loquen dins de cada
  pàgina**: *automàtic* (el flux d'avui: una darrere l'altra, amb la direcció i l'espai) o amb una
  *plantilla* (caixes). Un document d'abans és una sola pàgina automàtica amb totes les seqüències,
  i es veu i s'imprimeix igual que avui.
- **Conseqüència**: el selector «Disposició: Automàtica / Lliure» del document desapareix i passa a
  ser un ajust **de la pàgina**. Afecta el model del fitxer (ADR-005): `page.layout` deixaria de ser
  del document i cada full portaria la seva manera de col·locar. Cal revisar l'ADR abans de tocar
  codi.

### R2 — La plantilla es desa amb la pàgina

- **Vist (defecte)**: si es treu una seqüència d'una pàgina i se n'hi posa una altra, la pàgina no
  conserva la plantilla que tenia.
- **Causa**: la plantilla **no es desa** (decisió de §6: «el que es desa són les caixes»). En afegir
  una seqüència, `addSequencesToSheet` tria la plantilla pel nombre de caixes (`templateFor`), i no
  sap quina hi havia.
- **Proposta**: cada pàgina recorda la seva plantilla (`sheets[].template`). Afegir una seqüència
  omple el primer espai lliure d'aquella plantilla; només si no n'hi ha cap, es passa a una plantilla
  més gran (i es diu). Va amb R1, perquè toca el mateix camp del fitxer.

### R3 — Les plantilles base, a partir dels treballs reals

- **Vist**: cal treballar els models base de plantilla, i fer-ho a partir dels treballs més comuns
  amb pictogrames.
- **Proposta**: una investigació curta abans de dissenyar-ne cap: quins documents fan de debò
  famílies, mestres i logopedes amb pictogrames, i quina forma tenen. Candidats a contrastar:
  agenda o horari del dia, seqüència de passos (rentar-se les mans, vestir-se), *primer / després*,
  setmana (set columnes), normes de l'aula, tauler de comunicació, conte adaptat, menú del menjador.
  De cada treball: quantes seqüències porta, en quina orientació, si hi ha capçalera comuna i quina
  part es repeteix entre pàgines. Les plantilles surten d'aquí, no de les formes geomètriques
  d'avui.

- **Primera versió feta** (2026-11-07): `docs/ESTUDI-treballs-amb-pictogrames.md`. Onze treballs i
  deu plantilles amb nom de treball (agenda en tira, «Avui és» + agenda, primer/després, setmana,
  tauler, economia de fitxes, pàgina de conte, menú…). Tres troballes que canvien el pla: **cal un
  rètol** (un text sol, sense pictograma) per a mitja dotzena de plantilles; **les columnes fixes**
  són tan importants com el repartiment; i les tires **per retallar** demanarien línies de tall.
  Falta validar l'ordre amb tres o quatre usuaris reals.

### R4 — Veure la plantilla abans d'aplicar-la

- **Vist**: en triar una plantilla s'ha de veure visualment com quedarà.
- **Proposta**: (a) cada opció del selector porta una **miniatura** de la disposició, dibuixada
  amb els espais de la plantilla, no només el nom; (b) mentre es passa per damunt d'una opció (o
  s'hi va amb el teclat), la pàgina ensenya **els espais** com a guies, sense moure res; aplicar-la
  és el clic. Depèn de R3: les miniatures es dibuixen un cop se sàpiga quines plantilles hi ha.

### R5 — La columna segueix la pàgina, i la caixa

- **Vist**: els ajustos de la dreta han de baixar amb les pàgines, dir a quina pàgina s'apliquen i
  canviar sols a la pàgina que s'està mirant; i clicar una seqüència ha de posar-hi els ajustos.
- **Proposta**:
  - La columna es queda **enganxada** (`sticky`) mentre es baixa per les pàgines.
  - La part de pàgina de la columna diu **«Pàgina 2»** a la capçalera i fa referència a la pàgina
    que ocupa més pantalla en cada moment (`IntersectionObserver`). La pàgina activa es marca també
    al full (vora més gruixuda).
  - **Clicar una caixa la selecciona** (en comptes d'obrir directament el menú): la caixa es marca
    i la columna mostra els ajustos **d'aquella seqüència**. El menú d'accions de la caixa queda a
    la columna i al botó de la caixa. Això és el primer pas de la selecció de la fase 4.

### R6 — Canviar la mida dels pictogrames d'una seqüència

- **Vist**: els ajustos han de deixar canviar la mida dels pictogrames de la seqüència. Avui, en
  lliure, el control de mida desapareix perquè «mana la caixa» (ADR-005, decisió 9).
- **Cal decidir** (vegeu les preguntes): què fa el control de mida dins d'una caixa.

### R7 — Estils per grup de seqüències, i un nom per a aquest grup

- **Vist**: s'han de poder assignar estils a cada grup de seqüències, i cal un nom per entendre'ns
  entre nosaltres i perquè l'usuari ho entengui.
- **Ja era al backlog**: és **B31** («Aplicar canvis d'estil per seqüència»), i s'hi continua. Toca
  la cascada d'estil del fonament 03 (document → seqüència → pictograma): avui una seqüència només
  té estil de vista.
- **Nom**: avui al codi i als documents conviuen «caixa» (el rectangle), «col·locació» (la
  seqüència posada en una pàgina) i «calaix» (les que no són a cap pàgina). Cal **un sol nom** per
  a l'usuari. Vegeu les preguntes.

### R8 — Una estratègia d'UX per a la columna: document, pàgina, seqüència

- **Vist**: la columna barreja el que s'aplica a tot el document i el que s'aplica a cada pàgina, i
  costa d'entendre.
- **Proposta**: tres nivells, sempre en el mateix ordre i amb el mateix aspecte, que corresponen a
  la cascada (fonament 03):
  1. **Document**: el paper i l'orientació, l'estil del document, el peu d'impressió. Canviar-ho
     canvia totes les pàgines.
  2. **Pàgina N**: com es col·loquen les seqüències (automàtic o plantilla), quines seqüències hi
     ha, i les accions de la pàgina.
  3. **Seqüència** (la seleccionada): mida, espai, alineació, columnes, i després (R7) l'estil.
  Cada nivell diu a què afecta («S'aplica a tot el document», «S'aplica a la pàgina 2»). És un
  disseny per fer **abans** de tocar codi: un esbós de la columna sencera, amb els tres nivells,
  per validar-lo.
- **Esbós fet** (2026-11-07): `docs/esbos-columna-vista.html`, una pàgina interactiva per veure i
  comentar, sense tocar l'app. Els nivells són **Document, Pàgina N i Bloc** (Q1), ja amb R1 (cada
  pàgina tria Automàtica o Plantilla), R2 (la llista de blocs ensenya els espais buits de la
  plantilla), R4 (passar per damunt d'una plantilla en dibuixa els espais al full), R5 (la pàgina
  activa segueix el desplaçament, o el bloc seleccionat), Q2 (la mida com a màxim, amb la mida que
  en surt de debò), R7 (l'estil del bloc hereta el del document i marca els retocs) i R9 (el bloc de
  text, amb el text a dalt del nivell). Hi ha la taula de on va cada ajust d'avui i nou preguntes
  obertes (P1–P9), entre elles si l'orientació ha de passar a ser de la pàgina i el catàleg de
  configuracions (R10).

### R9 — Blocs de text

- **Vist**: en mode lliure s'han de poder posar **blocs de text**: un text sol, sense pictograma.
  Ja era una intenció de l'usuari, i l'estudi R3 ho confirma: «Primer» i «Després», els dies de la
  setmana, «Avui és…», «Treballo per…», el títol d'una rutina o els plats del menú. Mitja dotzena de
  plantilles de R3 en depenen.
- **Proposta**:
  - **Un bloc de text és un bloc com els altres**: té lloc i mida a la pàgina, es pot posar a totes
    les pàgines (comú), es copia, es treu i surt a les plantilles. No és una part d'un bloc de
    seqüència: així el mateix mecanisme serveix per a un títol de pàgina, un rètol damunt d'un bloc
    o una frase sola.
  - **Contingut**: el text, en una o més línies. És contingut del document, com el text d'un
    pictograma: no es tradueix ni ve de les preferències.
  - **Estil**: per defecte, la lletra de l'estil del document (`card.font`: família, color i mida),
    perquè el rètol i les targetes facin joc. Ajustos propis del bloc: mida de la lletra (com a
    màxim, igual que la mida dels pictogrames, Q2), negreta, alineació horitzontal i vertical dins
    del bloc. Res de colors de fons: el full no s'adapta al tema i el paper és blanc.
  - **Edició**: el text s'escriu al nivell «Bloc» de la columna (R8) i, amb doble clic o Enter, damunt
    del mateix bloc, com el text de la targeta a la graella d'edició.
  - **Accessibilitat**: el nom accessible del bloc és el text mateix. Al paper i al PDF, és text de
    debò (no una imatge).
- **Model i fitxer**: una col·locació porta **o bé** `sequence` (bloc de seqüència) **o bé** `text`
  (bloc de text), i el text porta el seu retoc d'estil (`style`, només les diferències amb l'estil del
  document, com la resta de la cascada). Cal decidir-ho amb R1 + R2, perquè toquen el mateix format
  i la mateixa revisió de l'ADR-005.
- **Compatibilitat**: el lector de les fases 1–3 descarta una col·locació sense `sequence` vàlida, i
  per tant perdria els blocs de text en tornar a desar. Com que el mode lliure encara no s'ha
  publicat, no hi ha fitxers d'usuari afectats; però **cal que el lector conservi les col·locacions
  que no entén** abans de publicar res, perquè una versió futura amb un altre tipus de bloc no es
  trobi el mateix problema.
- **Quan**: amb el model (R1 + R2), i abans de les miniatures i les plantilles noves (R4), que ja les
  han de poder fer servir.

### R10 — Un catàleg de configuracions de l'usuari

- **Vist** (2026-11-07, en revisar l'esbós de R8): avui l'usuari té **una** configuració per
  defecte (l'estil per defecte i la pàgina per defecte, a les preferències) i el document té la
  seva. La idea és que l'usuari es pugui fer un **catàleg** de configuracions: la de l'agenda, la
  dels taulers, la de l'escola…
- **Per què encaixa aquí**: a la columna (R8) hi ha diverses maneres d'aplicar o copiar ajustos d'un
  lloc a un altre: «Aplica el meu estil» i «Desa com a preferència» al peu, «Copia aquests ajustos
  a…» al bloc, i a R7 l'estil per bloc. Amb un catàleg, gairebé totes es redueixen a **dues
  accions**: **aplicar-ne una del catàleg** (al document, a una pàgina o a un bloc) i **desar el que
  hi ha com a entrada nova** (o substituir-ne una). Pot simplificar la columna en comptes de
  carregar-la.
- **Amb comptes i sense** (`VITE_ACCOUNTS_ENABLED`):
  - **Amb comptes**: el catàleg sencer, al núvol i sincronitzat entre dispositius, com la
    configuració d'usuari d'avui.
  - **Sense comptes**: el catàleg és d'**una sola entrada**, la configuració per defecte que ja hi
    ha. Les dues accions són les mateixes («aplica-la» i «desa-hi el que hi ha»), i la interfície no
    canvia de forma: només no s'hi poden afegir entrades. Així l'app continua funcionant sencera
    sense compte (premissa 4).
- **Lligams**: una entrada del catàleg és, en el fons, el que avui ja és un `.saacstyle` (fonament
  03, «Fitxer d'estil»), i per tant també es pot exportar i importar. Les preferències continuen
  sense entrar mai al document: aplicar una entrada **copia** els valors al document, no hi deixa
  cap referència (fonament 03, principi 4).
- **Decidit** (2026-11-07): **l'estil és el dels pictogrames** (la targeta: lletra, vores, colors,
  mida…). Una entrada del catàleg no porta ni el paper, ni l'orientació, ni la plantilla: la pàgina
  és una altra cosa, i les plantilles es tracten a R11.
- **Cal decidir**: (b) si una entrada es pot aplicar a un bloc sol (l'estil del bloc de R7); (c) el nom per a l'usuari («configuració», «estil», «model»…);
  (d) el sostre d'entrades amb compte (`docs/ESTUDI-limits-serveis-gratuits.md`).
- **Al backlog**: **B33**, a «Idees».
- **Quan**: decidir-ho **abans de R7**, perquè R7 i «Copia aquests ajustos a…» són justament el
  que el catàleg simplificaria; fer-ho, després del mode lliure o amb R7, segons el que es decideixi.

### R11 — La «Vista» de la configuració per defecte, i on es gestionen les plantilles

- **Vist** (2026-11-07): el panell «Vista» de la configuració per defecte (paper, orientació,
  direcció, espai entre seqüències; mida, espai i alineació dels pictogrames; autoria i llicència)
  passa a ser, clarament, **la configuració de la pàgina automàtica**: el que tindrà la pàgina d'un
  document nou. Queda per pensar si és **aquí** on es gestionen les plantilles.
- **Què canvia al panell amb R1 i Q2**, si es fa:
  - «Format de pàgina» (paper, orientació) continua sent el de cada document nou.
  - La direcció i l'espai passen a ser **els de les pàgines automàtiques noves** (l'espai, com a
    «Espai entre blocs», vegeu l'esbós de R8).
  - «Pictogrames» (mida, espai, alineació) passa a ser **el de cada bloc nou**. La mida, com a
    màxim (Q2) quan el bloc és en una plantilla.
  - «Aplica a la vista actual» ha de dir a què s'aplica ara que hi ha pàgines i blocs: proposta,
    a tot el document (totes les pàgines automàtiques i tots els blocs), amb Desfés.
- **Les plantilles són dues coses diferents**, i no van al mateix lloc:
  1. **Aplicar-ne una a una pàgina** depèn del que hi ha a la pàgina (quants blocs, de quin tipus).
     Va a la Vista, al nivell «Pàgina» (R8), i a la capçalera de la pàgina. No pot anar a la
     configuració per defecte.
  2. **Gestionar-les** (quines hi ha, les pròpies, l'ordre, les preferides) sí que és de l'usuari, i
     pot anar a la configuració per defecte, al panell «Vista» o en un de propi.
- **Proposta**:
  - Les **plantilles base** (les de R3) són fixes, venen amb l'app i no es gestionen: no cal cap
    panell per a elles.
  - Al panell «Vista», **una fila**: «Pàgines noves: Automàtica / una plantilla», perquè qui sempre
    fa agendes no hagi de triar-la cada vegada.
  - Les **plantilles pròpies** («Desa aquesta pàgina com a plantilla», a la Vista) són un catàleg,
    com R10: amb comptes, al núvol, i es gestionen (canviar el nom, esborrar) a la configuració per
    defecte; sense comptes, només les base. Són dos catàlegs paral·lels: **estils dels
    pictogrames** (R10) i **plantilles de pàgina** (R11), amb les mateixes dues accions (aplicar,
    desar).
- **Decidit** (2026-11-07): **de moment, només les plantilles base**, que és el cas sense comptes.
  Les plantilles pròpies queden al backlog per a més endavant (**B34**).
- **Cal decidir**: (b) si la fila
  «Pàgines noves» va al panell «Vista» o a la Vista mateixa; (c) com es diu el panell quan deixi de
  ser només «Vista».
- **Quan**: amb R1 (el model de pàgines), perquè el panell ha de saber què és una pàgina
  automàtica; les plantilles pròpies, amb R10.

### Ordre proposat

1. **Decisions** (les preguntes de sota) i **R3**, la investigació dels treballs reals: tot el
   que ve després en depèn.
2. **R8**, l'esbós de la columna, ja amb R1, R5, R6 i R7 en compte.
3. **R1 + R2 + R9**, el model (ADR-005 revisada, fitxer, migració dels documents de les fases 1–3):
   pàgines a totes dues disposicions, la plantilla desada amb la pàgina, i els blocs de text.
4. **R5**, la columna que segueix la pàgina i la selecció de la caixa.
5. **R4**, les miniatures i la previsualització de plantilles, amb les plantilles noves de R3.
6. **R10** (B33), decidir el catàleg d'estils dels pictogrames: abans de R7, perquè en canvia les
   accions. **R11**, el panell «Vista» de la configuració per defecte, amb R1. Les plantilles
   pròpies (B34), més endavant.
7. **R7** (B31), els estils per grup, quan el nom i el nivell «Seqüència» de la columna ja hi siguin.

### Decisions (2026-11-07)

| # | Decisió |
|---|---|
| Q1 | **«Bloc»** és el nom que veu l'usuari: una seqüència posada en una pàgina, amb la seva mida i el seu lloc. Al codi, `SequencePlacement` continua sent el tipus; a la interfície, a les traduccions i a la documentació per a l'usuari, «bloc». |
| Q2 | **La mida és un màxim**: el bloc mana, però els pictogrames no passen de la mida triada. Cada bloc té els seus ajustos (mida, espai, alineació, columnes…), al nivell «Bloc» de la columna. Substitueix la decisió 9 de l'ADR-005 («la mida la mana la caixa») quan es revisi. |
| Q3 | **Un sol model de pàgines** per a totes dues disposicions (R1). |
| Q4 | **La investigació (R3)** es fa a la xarxa: l'entorn d'ARASAAC i, a escala internacional, escoles d'educació especial i materials de comunicació augmentativa i alternativa (CAA). Resultat a `docs/ESTUDI-treballs-amb-pictogrames.md`. |

### Preguntes que eren obertes

| # | Pregunta | Opcions |
|---|---|---|
| Q1 | Quin nom veu l'usuari per a una seqüència posada en una pàgina, amb la seva mida i el seu lloc? | «bloc», «caixa», «requadre», «zona»… |
| Q2 | Què fa el control de mida d'una seqüència dins d'una caixa (R6)? | La mida canvia la caixa (la caixa s'ajusta als pictogrames) · La mida és un màxim (la caixa mana, però no pinta més gran) · La mida mana i, si no hi cap, ho avisa |
| Q3 | R1: un sol model de pàgines per a totes dues disposicions? | Sí (proposat) · No, la disposició automàtica té pàgines però sense plantilles |
| Q4 | R3: la investigació, qui la fa? | Una cerca a la xarxa de materials publicats (ARASAAC, escoles, logopèdia) · Exemples reals de l'usuari i el seu entorn · Totes dues |
