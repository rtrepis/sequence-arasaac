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
    "pictogram": { "skin": "mulatto", "hair": "black", "color": true, "fitzgerald": "#666666" },
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
          "id": "p_…", "word": "llevar-se", "text": "L'escola", "cross": false,
          "image": { "source": "arasaac", "id": 6627, "alternatives": [6627, 6628] },
          "style": { "pictogram": { "fitzgerald": "#4CAF50" }, "card": { "borderOut": { "color": "#999999" } } }
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
  | `size` | `"A4"`, `"A3"`, `"FULLSCREEN"` | Mida de la pàgina |
  | `orientation` | `"portrait"`, `"landscape"` | Orientació |
  | `direction` | `"row"`, `"column"` | Seqüències en files o en columnes |
  | `sequenceGap` | número | Espai entre seqüències. És un **factor**, com fins ara, **no** mil·límetres |
  | `layout` | `"flow"`, `"free"` | Disposició. Avui només `"flow"`; `"free"` es reserva per al mode lliure |

  - **MAI** hi ha marges al fitxer: no n'hi ha a l'app.
  - Els mil·límetres **només** s'usaran a `frame`, quan hi hagi mode lliure.
- **`style`** del document és **sempre complet**: tots els camps plens, sense heretar res de fora del
  fitxer.
- **`sequences[].style`** porta **només `view`** en aquesta versió. La lletra i les vores per
  seqüència queden fora de l'abast.
- **`sequences[].frame`** (`{ x, y, w, h, z }`, en **mm sobre la pàgina**) només existeix si
  `page.layout` és `"free"`. Avui només es reserva: cap versió de l'app l'escriu.
- **`pictograms[].style`** porta **només** les diferències amb l'estil resolt de la seqüència
  (`pictogram` i `card`).
- **`image.source`**:

  | Valor | Camps | Què és |
  |---|---|---|
  | `"arasaac"` | `id`, `alternatives?`, `keywords?` | Pictograma d'ARASAAC. `alternatives` són els resultats de la cerca, per triar-ne un altre |
  | `"own"` | `asset` | Imatge pròpia, referenciada a `assets` |
  | `"none"` | — | Sense imatge (la paraula no es va trobar) |

- **`assets`**: cada imatge pròpia hi és **un sol cop**, deduplicada pel hash del contingut.
  - Porta `data` (una `data:` URL en base64) al fitxer local.
  - Porta `url` si la imatge és al núvol (Cloudinary). **MAI** es descarrega per posar-la al
    fitxer.
- **`ui`** guarda l'estat d'edició que val la pena conservar (la seqüència activa). **MAI** afecta
  l'aspecte ni la impressió.
- **Camps desconeguts**: es conserven tal com vénen, a qualsevol nivell, i es tornen a escriure en
  desar.
- **`id` estables**: les seqüències i els pictogrames tenen `id`. Un `id` que ve del fitxer es
  conserva en tornar a desar. Els que no en tenen, se'ls genera.
- **Una sola línia**: el JSON es desa sense espais ni salts de línia, com fins ara.

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
| `img.settings` | `pictograms[].style.pictogram` | Només les diferències |
| `img.url` (`data:` en base64) | `assets` i `image.asset` amb `source: "own"` | Deduplicació pel hash |
| `img.url` (Cloudinary) | `assets` amb `url`, i `image.asset` | Sense descarregar la imatge |
| `settings` del pictograma | `pictograms[].style.card` | Només les diferències. `fontSize` i `fontFamily` s'ignoren (vegeu el fonament 03) |
| `activeSAAC` | `ui.activeSequence` | Si apuntava a una seqüència buida descartada, la primera |
| (no existeix) | `page` | Es pren de les preferències de pàgina de qui obre, i `layout: "flow"` |
| (no existeix) | `id` de seqüències i pictogrames | Es generen |

- Si **totes** les seqüències són buides, se'n conserva una de buida: un document té sempre com a
  mínim una seqüència.
- Una seqüència buida d'un fitxer v3 **no** es descarta: l'usuari l'ha desada així.

### Invariant

Per a cada targeta, l'**estil resolt després de migrar és idèntic** al que s'obtenia abans amb les
mateixes preferències. Les fixtures `apps/web/test/fixtures/saac/` ho proven.

## 5. Desar

- **«Desa el document»** escriu el document complet: contingut, estil, pàgina i imatges. **No hi ha
  cap opció per desar-lo sense estil.**
- **«Desa l'estil en un fitxer…»** escriu un `.saacstyle`. Viu al panell «Estil del document».
- En desar, **SEMPRE** s'aplica `diffStyle` a cada seqüència i pictograma, perquè els retocs siguin
  mínims.
- **L'estil per defecte** de l'usuari es tria a les preferències, amb el nom **«Estil per defecte
  per a documents nous»**. **MAI** viatja dins d'un document.

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
- **Un fitxer d'estil obert com a document** obre un diàleg amb tres botons: *Aplica'l a aquest
  document* · *Fes-lo el meu estil per defecte* · *Cancel·la*. Si no hi ha cap document amb
  contingut, el primer botó no hi és.
- **Un fitxer d'estil carregat des del panell «Estil del document»** s'aplica directament, amb
  desfer.

## 7. Núvol

- L'API **conserva la seva forma** (`documentState` compactat, miniatura, imatges a Cloudinary).
  **El front converteix** en desar i en llegir: el que arriba del núvol passa pel mateix lector que
  un fitxer.
- **MAI** una migració massiva de la base de dades. Els documents es migren **en llegir-los**.
- Les imatges de Cloudinary s'escriuen a `assets` amb `url`.
- **SEMPRE** ha de funcionar amb els comptes encesos i apagats (`VITE_ACCOUNTS_ENABLED`).

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
