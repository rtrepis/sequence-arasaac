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
| Quantes pàgines | **Diverses pàgines**: cada caixa diu a quina pàgina va |
| Qui mana la mida del pictograma | **La caixa**: la graella de dins s'hi ajusta (columnes i mida) |
| On viu | **Visualització** (`/view-sequence`), al costat de la mida i l'orientació del paper |

## 2. Premisses que no es toquen

1. **El mode d'ara és el per defecte** («Disposició: Automàtica / Lliure»). Un document sense
   disposició lliure s'obre i s'imprimeix exactament com avui.
2. **Mil·límetres només a `frame`**, i **el que es veu és el que s'imprimeix**: pantalla, paper i PDF
   surten de la mateixa disposició.
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
- **El format ja hi té lloc.** `page.layout: "flow" | "free"` i `sequences[].frame { x, y, w, h, z }`
  (mm) són a l'esquema v3. Avui viatgen com a camps desconeguts (`saacExtra.page`,
  `saacExtra.sequences[key]`): una anada i tornada pel fitxer ja els conserva.
- **El núvol no.** Els validadors de `apps/api/src/modules/documents/validators.ts` són `z.object`
  normals i descarten les claus que no coneixen (P1, punt 5, a `docs/BACKLOG-ux.md`).
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
| `Page { layers: Layer[] }`, amb `Layer.sequenceId` | v3 posa `frame` **a la seqüència** | Mana v3. Una seqüència surt un sol cop al document, així que «capa» i «seqüència» són la mateixa cosa i el `frame` hi va a dins. No hi ha un objecte capa a part |
| Afegir `schemaVersion` | Ja hi és (3) | — |
| Seguir `docs/design-conventions.md` | No existeix: són `docs/estandards/` | Es segueixen els estàndards |
| Mòduls `actions/`, `keybindings/`, `input/`, `history/`, `announcer/` | L'app no en té cap, i té Redux | Vegeu §7: funcions pures + Redux, sense marc d'accions propi |
| `locked`, `visible`, `zIndex`, alinear/distribuir, guies, imant | — | **Fora d'aquesta branca.** Primer cal veure si la plantilla + retoc resol la necessitat |
| Una capa no pot sortir de la pàgina; avís fora de l'àrea imprimible | El full **ja és** l'àrea imprimible (paper − 5 mm) | L'origen de coordenades és el full: una caixa dins del full és, per definició, imprimible |

## 5. Model de dades

### Al fitxer (`.saac` v3)

```jsonc
"page": { "size": "A4", "orientation": "portrait", "direction": "row", "sequenceGap": 1,
          "layout": "free" },
"sequences": [
  { "id": "seq_1", "pictograms": [ … ],
    "frame": { "page": 0, "x": 10, "y": 12, "w": 190, "h": 80, "columns": "auto" } }
]
```

- `frame` existeix **només** si `page.layout` és `"free"` (fonament 06, ja ho diu).
- **Camps nous dins de `frame`**: `page` (índex de pàgina, des de 0) i `columns` (`"auto"` o un
  enter ≥ 1). `z` es manté reservat i no s'escriu.
- **Origen i unitats**: mm des del cantó superior esquerre del **full** (el `.preview-content`, que
  ja és el paper menys el marge d'impressió). L'àrea útil exclou la franja del peu de llicència.
- **Nombre de pàgines**: es dedueix (`max(frame.page) + 1`). Un document no desa pàgines buides.
- **`schemaVersion` no puja.** És un canvi compatible: una versió anterior de l'app que obri un
  document lliure el pinta en mode flux (es veu diferent, però no perd res) i, com que conserva els
  camps desconeguts, si el torna a desar la disposició lliure hi continua. Cal, igualment:
  actualitzar `docs/schema/saac-v3.schema.json`, el fonament 06 i afegir una fixture
  (`16-mode-lliure.saac`, dues pàgines i una caixa amb columnes fixes).
- **`size: "FULLSCREEN"` no admet mode lliure**: no té mil·límetres. Vegeu §10, decisió D3.

### A Redux

La disposició lliure deixa de ser un camp desconegut i passa a ser del model (com la pàgina amb B26):

```ts
// packages/shared-types: DocumentLayout guanya `mode`
interface DocumentLayout { direction?; pageSize?; orientation?; mode?: "flow" | "free" }

// DocumentSAAC guanya els frames, amb la mateixa clau numèrica que `content` i `viewSettings`
frames?: { [key: number]: SequenceFrame };
interface SequenceFrame { page: number; x: number; y: number; w: number; h: number;
                          columns: "auto" | number }
```

- `toRedux.ts` i `serialize.ts` els converteixen a la frontera, com la resta (ADR-003, decisió 10),
  i deixen de tractar `page.layout` i `frame` com a desconeguts.
- **En passar a «Automàtica», els frames no s'esborren de Redux**: tornar a «Lliure» recupera la
  disposició. En desar en mode flux, no s'escriuen (el fonament ho exigeix), i per això el canvi de
  mode té «Desfés» (§8).
- Esborrany d'IndexedDB: guarda el document de Redux, i per tant els frames hi viatgen sols. Cal
  comprovar-ho amb un test.

## 6. Experiència d'usuari

Tot passa a la pàgina de **Visualització**. El mode flux no canvia en res.

### Activar-lo

- Fila nova a la secció de pàgina de la columna: **«Disposició: Automàtica / Lliure»** (`SettingRow`
  amb un control segmentat).
- En passar a Lliure per primer cop, s'aplica una **plantilla de partida que s'assembla al que hi
  havia**: les seqüències apilades en files (o en columnes, segons `direction`), totes a la
  pàgina 1. Si n'hi ha tantes que no hi caben a la mida mínima, es reparteixen en més pàgines.
  Missatge: «Disposició lliure. Pots triar una plantilla o moure les caixes.»

### Plantilles

- Secció **«Plantilla»** amb miniatures (botons amb nom accessible): *Una per pàgina*, *Dues en
  files*, *Dues en columnes*, *Tres en files*, *Quatre (2 × 2)*, *Tira a dalt i graella a sota*.
- Una plantilla és una llista d'espais en **fraccions** de l'àrea útil (0–1) amb un espai fix entre
  caixes. En aplicar-la, les seqüències van als espais **en l'ordre del document**; si sobren
  seqüències, la mateixa plantilla continua a la pàgina següent.
- Aplicar una plantilla substitueix els retocs: **sempre amb Desfés** (snackbar, com l'estil).

### Retoc

- **Seleccionar**: clic o toc a una caixa. Marc i nanses de selecció (contrast ≥ 3:1, colors de
  `palette.ts`; damunt del full, fixos en tots dos temes).
- **Moure**: arrossegar la caixa. **Redimensionar**: quatre nanses de cantonada, ≥ 24 × 24 px
  (44 en tàctil). Pointer Events, amb `touch-action: none` només damunt de les caixes.
- **Sense arrossegar** (WCAG 2.5.7): panell **«Posició i mida»** a la columna per a la caixa
  seleccionada: pàgina, X, Y, amplada, alçada (mm), columnes (*Automàtic* o un nombre).
- **Teclat**: les caixes són al tabulador en ordre de lectura (pàgina, dalt→baix, esquerra→dreta).
  Amb el focus a una caixa: fletxes = 1 mm, Maj+fletxes = 10 mm, Alt+fletxes = redimensionar.
  **Cap drecera amb el focus dins d'un camp de text.**
- **Límits**: una caixa no pot sortir del full ni fer-se més petita que el que demana la mida
  mínima del pictograma. La nansa s'atura, i un avís curt ho diu (també per `aria-live`).
- **Nom accessible** de cada caixa: «Seqüència 2: Rentar-se les mans, 6 pictogrames, pàgina 1».
  Després de moure o redimensionar: «2 files, 3 columnes, pictogrames de 42 mm».

### Pàgines

- La vista ensenya **una pàgina cada cop**, amb navegació «‹ Pàgina 1 de 3 ›» a sobre del full: la
  columna d'ajustos es queda on és i el full no s'empetiteix.
- «Afegeix una pàgina» i, al panell «Posició i mida», el camp **Pàgina** per moure-hi una caixa.
  Una pàgina que es queda buida desapareix en desar (no es desen pàgines buides); mentre s'hi
  treballa, es conserva.
- **Impressió**: `usePrintSheet` clona **tots** els fulls, amb salt de pàgina entre cadascun.
- **PDF**: `useDownloadPdf` captura cada full i fa `addPage` entre l'un i l'altre.
- **El peu de llicència** surt a cada pàgina.

### La mida, dins de la caixa

- Mana la caixa: la columna **amaga** el control de mida de la vista d'aquesta seqüència i hi posa
  una línia: «En disposició lliure, la mida la decideix la caixa.»
- L'espai entre pictogrames i l'alineació (horitzontal i vertical) **sí** que s'apliquen: l'espai
  entra al càlcul de la graella, i l'alineació diu on va la graella quan sobra lloc dins la caixa.
- La mida de la lletra continua sortint de l'estil: com que la targeta és proporcional, la lletra
  creix i s'encongeix amb la targeta i la proporció es manté.

### Seqüències noves o esborrades

- **Nova** (afegida a l'edició amb el document en mode lliure): no té frame. En entrar a la vista,
  ocupa el primer espai lliure de la plantilla a l'última pàgina, o una pàgina nova. Missatge:
  «Una seqüència nova s'ha col·locat a la pàgina 3.»
- **Esborrada**: el seu frame se'n va amb ella.

## 7. Arquitectura

No hi ha marc d'accions ni gestor de teclat propis. L'encàrrec els demanava per poder personalitzar
dreceres més endavant, i ell mateix diu que això no es fa ara. Amb Redux i funcions pures n'hi ha
prou, i el codi queda al costat del de la resta de l'app.

```
features/free-layout/                 # el domini: la disposició lliure del document
├── model/                            # funcions pures, sense React ni Redux, amb tests
│   ├── frame.ts                      #   SequenceFrame, clampFrame, MIN_*, MOVE_STEP_MM…
│   ├── computeGrid.ts                #   (N, targeta a mida 1, espai, caixa) → columnes, files, mida
│   ├── templates.ts                  #   les plantilles en fraccions i applyTemplate
│   ├── readingOrder.ts               #   ordre de lectura de les caixes
│   └── pages.ts                      #   nombre de pàgines, placeNewSequences
├── store/                            # reducers a documentSlice + selectors; desfer d'un pas
├── hooks/
│   ├── useFrameDrag.ts               #   Pointer Events → frame (en mm)
│   └── useCardBaseSize.ts            #   mesura la targeta a mida 1
└── components/
    ├── FreeLayoutSheet/              #   un full amb les seves caixes (pantalla, impressió i PDF)
    ├── FrameBox/                     #   la caixa: graella, selecció, nanses i teclat
    ├── PageNavigator/                #   ‹ Pàgina 1 de 3 ›
    ├── TemplatePicker/               #   les miniatures de plantilles
    └── FramePositionPanel/           #   «Posició i mida» (SettingRow)
```

- **`computeGrid`**: per a cada nombre de columnes de 1 a N (o el fix), files = ⌈N / columnes⌉;
  la mida que hi cap és `min(ampladaCaixa / ampladaGraella₁, alçadaCaixa / alçadaGraella₁)`,
  on `ampladaGraella₁` i `alçadaGraella₁` són els de la graella a mida 1 amb l'espai inclòs. Es tria
  la mida més gran; si empaten, menys files. Retorna també si la mida queda per sota del mínim.
- **La targeta a mida 1** es mesura al DOM (la més alta de la seqüència, perquè el text pot fer
  dues línies), un cop per seqüència i estil. Aquesta és l'única part que no és pura.
- **El full lliure és un component a part** (`FreeLayoutSheet`): `ViewSquenceSettings` només
  decideix si pinta el flux d'ara o aquest. No es toca la lògica del flux.
- **Desfer**: el d'un pas, com l'estil, per a les accions que substitueixen feina (aplicar una
  plantilla, tornar a Automàtica, esborrar una pàgina amb caixes). Moure i redimensionar no esborren
  res i no en porten. L'historial complet continua sent **B30**.
- **Avisos `aria-live`**: el mecanisme de feedback que ja hi ha (`useFeedback`), no un servei nou.
- **Constants** amb nom (`MOVE_STEP_MM = 1`, `MOVE_STEP_LARGE_MM = 10`, `MIN_PICTO_MM = 15`), i
  **cap color fora de `palette.ts`**.

## 8. Fases d'aquesta branca

Cada fase deixa l'app funcionant i passa `npm run typecheck` net.

1. **Model.** Tipus a `shared-types`, `toRedux`/`serialize`, esquema, fonament 06, fixture 16, i les
   funcions pures de `model/` amb tests. Sense interfície.
2. **Plantilles i pàgines.** El selector «Disposició», `FreeLayoutSheet` (només lectura), les
   plantilles, la navegació de pàgines, la impressió i el PDF de diverses pàgines. Aquí ja es pot
   provar de debò si les plantilles resolen la necessitat.
3. **Retoc.** Selecció, arrossegar, nanses, panell «Posició i mida» i teclat.
4. **Núvol i proves.** Els validadors de l'API (P1, punt 5), un e2e de punta a punta (plantilla →
   retoc → `.saac` → reobrir → PDF) i una prova de regressió que les fixtures 01–15 no canvien.

**Després de la fase 2 cal parar i provar-ho amb gent** abans de seguir: és el punt on es veu si cal
el retoc a mà o si n'hi ha prou amb les plantilles.

## 9. Riscos

- **Impressió de diverses pàgines**: el navegador ha de fer un salt exacte entre fulls. Cal provar
  Chrome, Safari i Firefox, perquè un mil·límetre de més fa sortir una pàgina en blanc.
- **PDF**: html2canvas per pàgina multiplica el temps. Cal un progrés visible («Pàgina 2 de 3»).
- **Claus numèriques de les seqüències**: els frames van amb la clau de `content`. Cal comprovar què
  passa en esborrar o reordenar pestanyes (si les claus es reindexen, el frame ha d'anar amb la
  seva seqüència).
- **Mesura de la targeta**: depèn de les fonts carregades. Cal tornar a mesurar quan arriben.
- **`ViewSquenceSettings`**: és gran i fràgil (la vista copia la pàgina en muntar-se). El canvi
  s'hi ha de limitar a triar quin full pinta.

## 10. Preguntes que queden obertes

| # | Pregunta | Recomanació |
|---|---|---|
| D1 | Com es veuen les pàgines a la vista | Una cada cop, amb navegació (§6). L'alternativa és totes una sota l'altra amb desplaçament |
| D2 | Pàgines buides | No es desen; existeixen mentre s'hi treballa |
| D3 | `FULLSCREEN` amb mode lliure | No s'hi ofereix: en triar Lliure, el selector de mida amaga «Pantalla completa». El botó de pantalla completa de la vista ensenya les pàgines una a una |
| D4 | Tornar a «Automàtica» | Es conserven els frames a Redux, no s'escriuen en desar, i el canvi té Desfés |
| D5 | Plantilla de partida en activar-lo | La que s'assembla al flux (apilades segons `direction`) |
