# Fonament: compatibilitat i dades del fitxer `.saac`

> **Quan llegir-lo:** abans de tocar el format dels fitxers `.saac` i `.saacstyle`, la lectura
> dels formats antics, desar i obrir (fitxer i núvol), la descàrrega o el selector de fitxers.
>
> Què és cada cosa i la cascada d'estil són a `docs/fonaments/03-model-contingut-estil.md`. Les
> decisions i el seu perquè, a `docs/decisions/ADR-003-model-document-saac-v3.md`. L'esquema
> formal és `docs/schema/saac-v3.schema.json`.

**Regla de canvi**: qualsevol canvi al format `.saac` requereix actualitzar l'esquema
(`docs/schema/`), incrementar `schemaVersion` si trenca la compatibilitat, afegir-hi una migració
i una fixture (`apps/web/test/fixtures/saac/`).

## 1. Estructura del document (`schemaVersion: 3`)

```json
{
  "format": "sequenciaac",
  "kind": "document",
  "schemaVersion": 3,
  "savedWith": "2.2.0",
  "meta": { "id": "…", "title": "…", "author": "…", "createdAt": "ISO", "updatedAt": "ISO" },
  "page": { "size": "A4", "orientation": "portrait", "direction": "row", "sequenceGap": 1, "layout": "flow" },
  "style": {
    "pictogram": {
      "skin": "mulatto", "hair": "black", "color": true,
      "fitzgerald": {
        "properNoun": "#FFEB3B", "noun": "#FF9800", "verb": "#4CAF50", "descriptive": "#2196F3",
        "socialContent": "#9C27B0", "miscellaneous": "#FFFFFF", "none": "#666666"
      }
    },
    "card": {
      "numbered": true, "textPosition": "top",
      "font": { "family": "Roboto", "color": "#000000", "size": 1 },
      "numberFont": { "family": "Roboto", "color": "#000000", "size": 1 },
      "borderIn":  { "color": "fitzgerald", "radius": 20, "size": 2 },
      "borderOut": { "color": "#1565c0", "radius": 8, "size": 4 }
    },
    "view": { "sizePict": 1, "pictSpaceBetween": 1, "alignmentH": "center", "alignmentV": "top" }
  },
  "sequences": [
    {
      "id": "seq_…", "title": "…",
      "style": { "view": { "sizePict": 1.5 } },
      "pictograms": [
        {
          "id": "p_…", "word": "llevar-se", "text": "L'escola", "cross": false, "category": "verb",
          "image": { "source": "arasaac", "id": 6627, "alternatives": [6627, 6628] },
          "style": { "card": { "borderOut": { "color": "#999999" } } }
        },
        { "id": "p_…", "word": "foto", "image": { "source": "own", "asset": "img_1" } }
      ]
    }
  ],
  "assets": { "img_1": { "mime": "image/png", "data": "data:image/png;base64,…" } },
  "ui": { "activeSequence": "seq_…" }
}
```

### Regles

- **SEMPRE** es validen primer `format`, `kind` i `schemaVersion`. Són obligatoris.
  - `format` és sempre `"sequenciaac"`.
  - `kind` és `"document"` o `"style"`.
- **`savedWith`** és la versió de l'app que el va escriure. Només informa: **MAI** es fa servir per
  decidir com es llegeix.
- **`meta`**: `id` (el del núvol, si en té), `title`, `author`, `createdAt`, `updatedAt`.
- **`page`** és la pàgina del document, i és **sempre completa**:

  | Camp | Valors | Què és |
  |---|---|---|
  | `size` | `"A4"`, `"A3"`, `"LETTER"`, `"TABLOID"`, `"FULLSCREEN"` | Mida de la pàgina. `LETTER` (Carta, 8,5 × 11″) i `TABLOID` (11 × 17″) són els papers nord-americans |
  | `orientation` | `"portrait"`, `"landscape"` | Orientació |
  | `direction` | `"row"`, `"column"` | Seqüències en files o en columnes, a les pàgines automàtiques que no en diuen cap |
  | `sequenceGap` | número | Espai entre blocs (entre seqüències, al flux). És un **factor**, com fins ara, **no** mil·límetres |
  | `layout` | `"flow"` | **Obsolet**: s'escriu sempre `"flow"`, perquè les versions anteriors el llegeixen. `"free"` només el porten els fitxers de les fases 1–3 del mode lliure (§1.1) |
  | `sheets` | llista de pàgines | Les pàgines, en ordre, i els seus blocs (§1.1). Sense `sheets`, una sola pàgina automàtica amb totes les seqüències |
  | `common` | llista de blocs | El que surt a totes les pàgines (§1.1) |
  | `licenceOn` | `"last"` | El peu de llicència només a l'última pàgina. Sense valor, a totes, com sempre: només s'escriu `"last"` |

  - Una `size` que l'app no coneix cau a la pàgina de qui obre, com qualsevol valor fora de la
    llista. Per això afegir una mida **no** demana una versió nova de l'esquema: una versió de l'app
    anterior al Carta obre el document igualment, en el seu paper (fixture `15-paper-carta`).
  - El paper de qui no ha desat preferències surt de la regió del navegador (`regionalPaperSize`):
    Carta als EUA, el Canadà, Mèxic i bona part de l'Amèrica Llatina, A4 a la resta. És una
    preferència, no part del document: un document desat en A4 s'obre en A4 a tot arreu.
  - **MAI** hi ha marges al fitxer: no n'hi ha a l'app.
  - Els mil·límetres **només** s'usen a les caixes dels blocs (§1.1).
- **`style`** del document és **sempre complet**: tots els camps plens, sense heretar res de fora del
  fitxer.
- **`sequences[].style`** porta **només `view`** en aquesta versió. La lletra i les vores per
  seqüència queden fora de l'abast.
- **`sequences[].frame`** ja no està reservat. Cap versió de l'app no l'ha escrit mai, i les
  pàgines fan servir els blocs de `page` (§1.1, ADR-005). Si un fitxer en porta, és un camp
  desconegut més: es conserva i no es fa servir.
- **`styles`** són els estils amb nom del document (§1.2). Només hi són si n'hi ha cap.
- **`pictograms[].style`** porta **només** les diferències amb l'estil resolt de la seqüència
  (`pictogram` i `card`).
- **Fitzgerald** (vegeu el fonament 03, «El color de Fitzgerald»):
  - **`pictograms[].category`** és la categoria de la paraula, fora de l'estil: `"properNoun"`,
    `"noun"`, `"verb"`, `"descriptive"`, `"socialContent"` o `"miscellaneous"`. **Només hi és si el
    pictograma en té.**
  - **`style.pictogram.fitzgerald`** del document és la taula de colors: una clau per categoria i
    `none` per als pictogrames sense categoria. Sempre completa.
  - **`style.pictogram.fitzgerald`** d'un pictograma és un **sol color**: el retoc.
- **`image.source`**:

  | Valor | Camps | Què és |
  |---|---|---|
  | `"arasaac"` | `id`, `alternatives?`, `keywords?`, `variants?` | Pictograma d'ARASAAC. `alternatives` són els resultats de la cerca, per triar-ne un altre. `variants` diu quines opcions d'aparença admet (`skin`, `hair`, `color`): no tots els pictogrames tenen pell o cabell. Sense la llista, les admet totes |
  | `"own"` | `asset`, `id?` | Imatge pròpia, referenciada a `assets`. `id` és el pictograma d'ARASAAC que substitueix, per si es treu |
  | `"none"` | — | Sense imatge (la paraula no es va trobar) |

- **`assets`**: cada imatge pròpia hi és **un sol cop**, deduplicada pel hash del contingut.
  - Porta `data` (una `data:` URL en base64) al fitxer local.
  - Porta `url` si la imatge és al núvol (Cloudinary). **MAI** es descarrega per posar-la al
    fitxer.
- **`ui`** guarda l'estat d'edició que val la pena conservar (la seqüència activa). **MAI** afecta
  l'aspecte ni la impressió.
- **Camps desconeguts**: es conserven tal com vénen i es tornen a escriure en desar. Valen per a
  l'arrel, `meta`, `page`, `style`, `ui`, cada seqüència, cada pictograma, cada imatge, cada pàgina,
  cada bloc i cada estil amb nom. Els **blocs** d'un tipus desconegut es conserven sencers (§1.1). Dins de
  l'estil (`style.card.font`, per exemple) no es conserven: allà un camp desconegut no es pot
  pintar.
- **`id` estables**: les seqüències i els pictogrames tenen `id`. Un `id` que ve del fitxer es
  conserva en tornar a desar. Els que no en tenen, se'ls genera.
- **Una sola línia**: el JSON es desa sense espais ni salts de línia, com fins ara.

### 1.1 Pàgines i blocs

```json
"page": {
  "size": "A4", "orientation": "portrait", "direction": "row", "sequenceGap": 1, "layout": "flow",
  "sheets": [
    { "id": "sh_1", "mode": "template", "template": "rows-2", "blocks": [
      { "id": "pl_1", "x": 0, "y": 42.5, "w": 200, "h": 105, "slot": 0,
        "kind": "text", "text": "Avui és dilluns", "textStyle": { "bold": true } },
      { "id": "pl_2", "x": 0, "y": 152.5, "w": 200, "h": 127.5, "slot": 1, "namedStyle": "st_gran",
        "kind": "sequence", "sequence": "seq_mati", "columns": "auto", "view": { "alignmentH": "left" } }
    ] },
    { "id": "sh_2", "mode": "auto", "direction": "column", "blocks": [
      { "id": "pl_3", "kind": "text", "text": "Tarda" },
      { "id": "pl_4", "kind": "sequence", "sequence": "seq_tarda", "columns": "auto" }
    ] }
  ],
  "common": [
    { "id": "pl_9", "x": 0, "y": 0, "w": 200, "h": 37.5, "kind": "sequence", "sequence": "seq_avui", "columns": "auto" }
  ]
}
```

- **El document és una llista de pàgines** (`sheets`, en ordre, amb `id` estables). Les pàgines
  buides es desen.
- **Un document sense `sheets` és una sola pàgina automàtica amb totes les seqüències, en ordre.**
  És el de sempre: no se n'escriu cap, i el fitxer és el mateix que fins ara.
- **`mode`** diu com es col·loquen els blocs de la pàgina:
  - `"auto"` («Simple» a la interfície; abans «Contínua»): un darrere l'altre, com el flux de sempre, amb la
    `direction` de la pàgina (sense valor, la de `page.direction`) i el seu `sequenceGap` (sense
    valor, el de `page`). Els blocs no porten caixa. Un bloc de text hi ocupa una línia sencera.
  - `"template"` («En blocs»): cada bloc a la seva caixa.
- **`template`** és la plantilla de la pàgina (`"full"`, `"rows-N"`, `"columns-N"`, `"grid-CxR"`,
  `"strip-top"` i, des de R4, les dels treballs reals: `"agenda-strip"`, `"today-agenda"`,
  `"first-then"`, `"week"`, `"token-board"`, `"story-page"`, `"menu"`, i `"free"`, el repartiment
  lliure, sense espais), i **`slot`** l'espai que
  ocupa cada bloc. Algunes plantilles tenen **espais de rètol**: hi van els blocs de text, i les
  seqüències només ocupen els espais de seqüència. Són `id` nous d'un camp que ja era de text
  lliure: el format no canvia, i una versió anterior els conserva com un `id` que no coneix. `"columns-N"` i `"rows-N"` són el
  repartiment «N columnes» o «N files»: amb més blocs dels que hi caben en una fila o una columna,
  la graella creix (N columnes i les files que calguin, o al revés) i l'`id` no canvia. Afegir un
  bloc omple el primer espai lliure; si no n'hi ha, «N columnes» i «N files» creixen, i les altres
  plantilles passen a tantes files (o columnes) com blocs, en el sentit de la pàgina. Una pàgina automàtica també pot
  recordar la plantilla, i un `id` de plantilla que l'app no coneix es conserva.
- **Un bloc** té `id`, `kind` i, on cal, caixa (`x`, `y`, `w`, `h`), `slot` i `namedStyle` (§1.2):
  - `"sequence"`: `sequence` (l'`id` de la seqüència), `columns` (`"auto"` o un enter ≥ 1; sense
    valor, `"auto"`) i `view`, el retoc de la vista en aquest bloc.
  - `"text"`: `text` (amb `\n` entre línies; és contingut i no es tradueix) i `textStyle`: `font`
    (parcial, sobre la lletra de les targetes), `bold`, `alignmentH` i `alignmentV`. Sense retoc,
    centrat i sense negreta.
- **La mateixa seqüència pot tenir molts blocs**, en pàgines diferents o a la mateixa. El contingut
  és un de sol; la caixa, les columnes i el retoc de la vista són de cada bloc.
- **`common`**: els blocs que surten a **totes** les pàgines, al mateix lloc, pintats per sota dels
  de cada pàgina. Sempre amb caixa i sense `slot`.
- **Unitats**: mil·límetres des del cantó superior esquerre del **full**, que és el paper menys el
  marge d'impressió (5 mm per costat). Les caixes no trepitgen els 12 mm de baix, reservats al peu
  de llicència, tant si el peu es pinta com si no.
- **Una seqüència sense cap bloc de seqüència** no surt a cap pàgina: no s'imprimeix, però és al
  document.
- **En llegir**:
  - Les pàgines **es llegeixen sempre que hi siguin**, digui el que digui `layout`: una versió
    anterior que obre el document i el desa hi escriu `"flow"` i en conserva les pàgines com a camps
    desconeguts.
  - **Un bloc que l'app no entén** (un `kind` que no coneix, o cap `kind` i cap `sequence`) es
    conserva tal com és i es torna a escriure al seu lloc. No es pinta.
  - Es descarta un bloc de seqüència que apunta a una seqüència que no hi és, i un bloc que
    necessita caixa (en una pàgina amb plantilla o als comuns) i no en té cap de veritat (`w` o `h`
    ≤ 0, posició que no és un número).
  - Unes `columns` que no s'entenen passen a `"auto"`, un `text` que no és text passa a buit, i el
    que no es pot pintar d'un retoc (`view`, `textStyle`) se'n treu. Un `namedStyle` que no és a
    `styles` se'n treu. Un `id` que falta o es repeteix se'n genera un de nou.
  - Un `mode` que falta o que l'app no coneix: `"template"` si algun bloc que l'app entén té caixa,
    i si no `"auto"`.
  - La caixa **no** s'encaixa al full en llegir: la pinta qui sap la mida del full.
  - Si no hi ha cap pàgina que es pugui llegir, el document és una sola pàgina automàtica.
- **Fitxers de les fases 1–3** (`layout: "free"`, `sheets[].placements`, sense `mode` ni `kind`):
  cada full és una pàgina amb caixes i sense plantilla, i cada col·locació, un bloc de seqüència. En
  desar-los s'escriuen amb la forma d'ara. Cap versió publicada no els va escriure.
- **No cal pujar `schemaVersion`**: tot és nou dins de `page` o a l'arrel, i una versió anterior de
  l'app ho conserva com a desconegut. Obre el document com a una sola pàgina automàtica amb totes
  les seqüències i sense els rètols (es veu diferent, però no perd res), i si el torna a desar, les
  pàgines hi continuen.
- Fixtures: `16-mode-lliure.saac` (fases 1–3) i `17-pagines-i-blocs.saac`.

### 1.2 Estils amb nom (`styles`)

```json
"styles": [
  { "id": "st_gran", "name": "Agenda gran", "view": { "sizePict": 1.5 }, "card": { "font": { "size": 1.2 } } }
]
```

- Un **estil amb nom** és un retoc de l'estil del document, amb la forma dels retocs: `pictogram`
  (amb `fitzgerald` com a taula parcial, com al document), `card` i `view`. Porta `id` i `name`.
- Un bloc el fa servir amb `namedStyle`. Canviar-lo canvia tots els blocs que el fan servir.
- Des del pas 7 (2026-11-14) l'app hi escriu **només l'estil** (`pictogram` i `card`): la mida,
  l'espai i l'alineació són la distribució del bloc. Un estil amb nom amb `view`, dels documents
  d'abans, es llegeix i es pinta igual i es torna a escriure tal com era. El format no canvia.
- **És l'entrada del catàleg d'estils de l'usuari copiada dins del document** (R10): el document no
  apunta mai a les preferències de ningú, i s'obre igual a qualsevol lloc.
- **La cascada**: document → seqüència → estil amb nom del bloc → bloc → pictograma
  (`docs/fonaments/03-model-contingut-estil.md`, §4).
- En llegir, de cada estil només queda el que té la forma i el valor que toca; un `id` que falta o
  es repeteix se'n genera un de nou.

## 2. Estructura del fitxer d'estil (`.saacstyle`)

```json
{ "format": "sequenciaac", "kind": "style", "schemaVersion": 3, "meta": { "title": "…" }, "style": { … } }
```

- Porta `format`, `kind`, `schemaVersion`, `meta.title` i `style`, i **res més**.
- `style` té la mateixa forma que el del document, i és sempre complet.
- **MAI** porta pàgina: la pàgina és del document, no de l'estil.

## 3. Formats que es llegeixen

La lectura es fa **en memòria, en obrir el fitxer**. L'original no es modifica mai: el format 3
només s'escriu quan l'usuari desa.

El tipus es decideix **pel contingut**, **MAI** per l'extensió:

| El fitxer porta | Es tracta com a |
|---|---|
| `format: "sequenciaac"` i `schemaVersion: 3` | Document o estil, segons `kind` |
| `format: "sequenciaac"` i `schemaVersion` > 3 | Document o estil d'una versió més nova: s'obre el que s'entén, es conserva la resta i **s'avisa** |
| `schemaVersion: 2` amb `documentState` o `style` | Pas intern de la PR #291 que mai no es va publicar. Es llegeix perquè no costa res; **no** és un compromís |
| `sequence` | Document primitiu d'una sola seqüència |
| `documentState` (amb `defaultSettings` o sense) | Document de la 2.1.0 o anterior |
| Només `defaultSettings` | Fitxer d'estil de la 2.1.0 |
| Res d'això, o JSON invàlid | Fitxer malmès |

**Cap fitxer que tingui un usuari pot deixar d'obrir-se.** Els formats obligatoris són els que
existien publicats: `sequence`, `documentState` i la 2.1.0 (`defaultSettings` + `documentState`).

## 4. Migració dels formats antics

### Estil

| Camp antic | Camp nou | Regla |
|---|---|---|
| `defaultSettings.pictApiAra` | `style.pictogram` | Si falta, o en falta una part, s'omple amb l'estil per defecte de qui obre, camp a camp, i s'avisa |
| `defaultSettings.pictSequence` | `style.card` | Mateixa regla. Sense `numberFont`, els números fan servir la lletra del text **del fitxer**, que és com es veien |
| (vista del document, no existia) | `style.view` | La vista de la primera seqüència, en l'ordre del document; si no n'hi ha, la de l'estil per defecte |

- **SEMPRE** es fusiona camp a camp i a qualsevol profunditat: del fitxer es pren tot el que té la
  forma i el valor que toca, i el que falta o no es pot pintar surt de l'estil per defecte.
- Es continuen acceptant les formes velles: l'alineació única d'abans de separar-ne l'horitzontal i
  la vertical, i el Fitzgerald com a objecte `{ value, color }`.

### Contingut

| Camp antic | Camp nou | Regla |
|---|---|---|
| `documentState.id`, `title`, `author` | `meta` | Sense canvis |
| `content["n"]` | `sequences[]` | S'ordena per `order` si hi és; si no, per l'ordre numèric de les claus. **Les seqüències buides es descarten** |
| `viewSettings["n"]` | `sequences[].style.view` | Només les diferències amb `style.view` |
| `indexSequence` | Posició a `pictograms[]` | S'ordena per aquest valor i es descarta |
| `img.selectedId` | `image.id` amb `source: "arasaac"` | El valor `0` passa a `source: "none"` |
| `img.searched.word` | `word` | — |
| `img.searched.bestIdPicts` | `image.alternatives` | — |
| `img.searched.keyWords` | `image.keywords` | Només si hi és |
| `img.settings` (pell, cabell, color) | `pictograms[].style.pictogram` | Només les diferències, i només en un pictograma d'ARASAAC |
| (quins d'aquests tres porta) | `image.variants` | Els que hi són: és com l'app sabia quines opcions admet el pictograma |
| `img.settings.fitzgerald` | `category` i, si cal, un retoc | Vegeu «Fitzgerald», a sota |
| `defaultSettings.pictApiAra.fitzgerald` | — | S'ignora: era el color amb què naixien els pictogrames, i ara és `none` de la taula |
| `img.url` (`data:` en base64) | `assets` i `image.asset` amb `source: "own"` | Deduplicació pel hash |
| `img.url` (Cloudinary) | `assets` amb `url`, i `image.asset` | Sense descarregar la imatge |
| `settings` del pictograma | `pictograms[].style.card` | Només les diferències. `fontSize` i `fontFamily` s'ignoren (vegeu el fonament 03) |
| `activeSAAC` | `ui.activeSequence` | Si apuntava a una seqüència buida descartada, la primera |
| (no existeix) | `page` | Es pren de les preferències de pàgina de qui obre, i `layout: "flow"` |
| (no existeix) | `id` de seqüències i pictogrames | Es generen |

- **Fitzgerald**: els fitxers antics només guarden el color. La categoria es dedueix del color:
  - Si és exactament el color d'una categoria de la taula de l'app (sense distingir majúscules),
    el pictograma rep aquesta categoria i **cap** retoc.
  - Si és `#666` o `#666666`, el pictograma no té categoria i **cap** retoc.
  - Si és qualsevol altre color (`#FFCD94`, `#2222ff`, els del vocabulari personal), el pictograma
    no té categoria i el color es guarda com a **retoc**, perquè es continuï veient igual.
  - Si **no porta cap color** (documents molt antics), el pictograma no té categoria ni retoc, i es
    pinta amb `none`. **És l'única excepció a la invariant**: fins ara la vora «fitzgerald»
    d'aquests pictogrames sortia del color del text per accident (C11 a `docs/BACKLOG-ux.md`, que
    queda resolta amb això).
  - Cas límit acceptat: un color del vocabulari personal que coincideix amb el d'una categoria es
    llegeix com aquella categoria. Es veu igual, però «Restableix» no el canvia.
- Si **totes** les seqüències són buides, se'n conserva una de buida: un document té sempre com a
  mínim una seqüència.
- Una seqüència buida d'un fitxer v3 **no** es descarta: l'usuari l'ha desada així.

### Invariant

Per a cada targeta, l'**estil resolt després de migrar és idèntic** al que s'obtenia abans amb les
mateixes preferències. Les fixtures `apps/web/test/fixtures/saac/` ho proven.

## 5. Desar

- **«Desa el document»** escriu el document complet: contingut, estil, pàgina i imatges. **No hi ha
  cap opció per desar-lo sense estil.**
- **«Desa el meu estil en un fitxer…»** escriu un `.saacstyle` amb el meu estil. Viu al panell «El
  meu estil» de la configuració (R10). L'estil del document obert no es desa sol: va sempre dins
  del document.
- En desar, **SEMPRE** s'aplica `diffStyle` a cada seqüència i pictograma, perquè els retocs siguin
  mínims.
- **El meu estil** (l'antic estil per defecte) es tria a les preferències, al panell «El meu
  estil». **MAI** viatja dins d'un document com a referència: «Aplica el meu estil» en **copia** els
  valors a `styles` (§1.2).

### Descàrrega

Al mòbil, un `Blob` de tipus `text/plain` es desa com a `nom.saac.txt`. Per això:

```ts
const blob = new Blob([json], { type: "application/octet-stream" });
a.download = `${nom}.saac`; // o `.saacstyle`
```

- **SEMPRE** `application/octet-stream`.
- **SEMPRE** el nom acaba en `.saac` o `.saacstyle`.
- Si algun dia el servidor serveix un fitxer, ha d'enviar `Content-Type: application/octet-stream`
  i `Content-Disposition: attachment; filename="…"`. Avui la descàrrega es fa sempre al navegador.

## 6. Obrir

- El selector accepta `.saac,.saacstyle,.txt,.json`: així s'obren també els `.saac.txt` antics.
- **SEMPRE** el tipus es decideix pel contingut (§3).
- **SEMPRE** obrir un document **no modifica les preferències**. La pàgina i l'estil del fitxer són
  del document; les preferències de qui l'obre continuen igual.
- **Un fitxer d'estil obert com a document** obre un diàleg amb dos botons: *Fes-lo el meu estil* ·
  *Cancel·la*. No s'aplica mai al document obert (R10, 2026-11-12): els estils van de la
  configuració cap al document, i al document s'hi porten amb «Aplica el meu estil».
- **Un fitxer d'estil (o un `.saac`) carregat des del panell «El meu estil»** passa a ser el meu
  estil directament; es desa en tancar la configuració.

## 7. Núvol

- L'API **conserva la seva forma** (`documentState` compactat, miniatura, imatges a Cloudinary).
  **El front converteix** en desar i en llegir: el que arriba del núvol passa pel mateix lector que
  un fitxer.
- **MAI** una migració massiva de la base de dades. Els documents es migren **en llegir-los**.
- Les imatges de Cloudinary s'escriuen a `assets` amb `url`.
- **SEMPRE** ha de funcionar amb els comptes encesos i apagats (`VITE_ACCOUNTS_ENABLED`).
- Com que el núvol conserva la forma antiga, **tot** document del núvol passa per la migració en
  llegir-lo: també en perd les seqüències buides. El bàner de «versió anterior» no hi surt: és un
  avís dels fitxers.

## 8. Missatges

| Situació | Text en català | Forma |
|---|---|---|
| Document antic | «Aquest document és d'una versió anterior. L'hem adaptat; quan el desis es guardarà amb el format nou.» | Bàner |
| Antic sense estil | S'hi afegeix: «No portava estil propi, i hi hem aplicat el teu estil per defecte.» | Bàner |
| Fitxer d'estil obert com a document | «Aquest fitxer és un estil, no un document.» | Diàleg (§6) |
| Versió més nova | «Aquest document s'ha creat amb una versió més nova de SequenciAAC. Pot ser que alguna cosa no es vegi bé. Si el deses aquí, es podrien perdre canvis.» | Bàner |
| Fitxer malmès | «No s'ha pogut obrir. No és un document de SequenciAAC o està malmès.» | Snackbar d'error |

- **SEMPRE** a tots els idiomes de l'app (ca, es, en, fr, it).
- **SEMPRE** es llegeixen amb `aria-live`, es poden tancar amb el teclat, i el focus torna a un lloc
  lògic.
- **SEMPRE** els diàlegs nous atrapen el focus, es tanquen amb Esc i tenen títol accessible
  (`AppDialog`, `docs/estandards/capes-flotants.md`).
- **SEMPRE** objectius tàctils de 44 × 44 px com a mínim al mòbil.

### «Què es guarda en un document?»

Quadre d'ajuda al diàleg de desar:

- **Es guarda**: les seqüències i els pictogrames; com es veuen (lletra, vores, colors, mides),
  inclosos els canvis fets en un sol pictograma; la pàgina; les fotos pròpies.
- **No es guarda**: les preferències de l'app, com l'idioma o l'estil per defecte.
