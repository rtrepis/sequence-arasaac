# Fonament: Document, seqüències i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui
> estils** a un document: el `.saac` i el `.saacstyle` (`features/sequence/style/`), el desat al
> núvol, `documentSlice`, `uiSlice.defaultSettings` i `ui.viewSettings`, la columna de la pàgina de
> vista i el panell «Estil del document».
>
> Un **fonament** no és un estàndard: no diu com s'escriu el codi, sinó **què és cada cosa i de
> qui és**. Els estàndards de `docs/estandards/` hi han de ser coherents; si un estàndard i aquest
> fonament es contradiuen, mana aquest, i l'estàndard s'ha de corregir.
>
> És la decisió de producte que demanava **B25** (`docs/BACKLOG-ux.md`), resolta a la branca
> `claude/sequencia-estil-b25-16pluv`. Les seccions 0 a 5 són la decisió; la 6 és com l'aplica el
> codi. (El nom del fitxer, `sequencia-i-estil.md`, és d'abans de fixar la nomenclatura; es manté
> perquè hi ha referències que hi apunten.)

## 0. Nomenclatura

Aquestes quatre paraules volen dir sempre el mateix: a la interfície, a les traduccions, als
comentaris i als documents. **«Seqüència» no vol dir mai el fitxer sencer.**

| Terme | Què és |
|---|---|
| **Document** | El fitxer `.saac`: el conjunt de **totes** les seqüències, amb el seu estil. És el que es desa, s'obre i es comparteix. |
| **Seqüència** | Cadascuna de les que conté un document (una pestanya a l'editor). |
| **Estil del document** | L'aparença que **s'aplica a totes les seqüències** del document. |
| **Vista d'aquesta seqüència** | Els ajustos d'una sola seqüència (la vista de la pestanya: mida, espai, alineació). Actuen com a **retoc** sobre l'estil del document. |

Al codi, el document és `DocumentSAAC` (`state.document`); les seqüències són `content[n]`;
l'estil del document és `defaultSettings` + `styleView`; la vista d'una seqüència és
`viewSettings[n]`. Els noms dels tipus i dels camps no es canvien: són el contracte del fitxer i
de l'API.

## 1. Tres conceptes separats

- **Document**: el contingut —les seqüències, amb els seus pictogrames, textos i ordre, i la
  disposició— **i el seu estil**. Es desa al `.saac`.
- **Estil**: l'aparença del document —fonts, mides, colors, vores, espaiats—. Es pot desar també
  en un **fitxer propi** (`.saacstyle`), reutilitzable en altres documents.
- **Preferències**: com vol la interfície qui fa servir l'app —zoom, alt contrast dels menús,
  moviment reduït, idioma—. **Són de l'usuari, i no es desen mai dins cap document.**

L'usuari té també un **estil per defecte**, que és el que reben els documents nous.

**La disposició és contingut**, no estil ni preferència: la direcció de les seqüències (files o
columnes), la mida i l'orientació de la pàgina. Forma part del document i **viatjarà al `.saac`**,
però encara no hi va: és feina de **B26** (`docs/BACKLOG-ux.md`; continua el que B20 va fer per a
l'esborrany). Fins llavors continua a `ui.viewSettings` com fins ara, i l'esquema 2 ja admet el camp
(`layout`, opcional) perquè B26 no hagi d'obrir una versió 3.

**Les preferències d'interfície, avui, són l'idioma i el tema** (clar, fosc o el del sistema).
El zoom, el contrast i el moviment reduït **no són ajustos de l'app**: es deleguen al navegador i
al sistema operatiu, i l'app els ha de respectar —`prefers-reduced-motion`, `prefers-contrast` i
un zoom del navegador fins al 200 % sense perdre contingut ni funcions—. Si algun dia n'hi ha un
d'intern, és una preferència i va a l'usuari, mai al document.

## 2. Desar

- **«Desa el document»** inclou sempre el seu estil. És l'única acció de desar document.
- **«Desa l'estil en un fitxer…»** desa només l'aparença, sense contingut. Viu al panell «Estil
  del document», no al diàleg de desar.
- **No hi ha cap opció per desar un document sense estil.**

Val igual per al fitxer i per al núvol: al núvol no hi ha opció d'estil a part, però el document
s'hi desa sempre amb el seu.

## 3. Obrir

- Un document **es veu sempre tal com es va desar**.
- Les **preferències d'interfície** de qui l'obre **s'apliquen sempre**.
- L'estil del document es canvia al panell **«Estil del document»**, disponible en obrir i en
  qualsevol moment, que ofereix:
  - **«Aplica el meu estil per defecte»**
  - **«Carrega un estil des d'un fitxer…»**

  **Es pot desfer**, i **no modifica el fitxer fins que es desa**.
- En obrir un **fitxer d'estil**:
  - amb un document obert, **s'hi aplica** (amb desfer); el panell ofereix **desar-lo com a estil
    per defecte**;
  - sense cap document obert, **es proposa com a estil per defecte** (amb confirmació, perquè
    substitueix el que l'usuari tenia).

### Pictogrames i seqüències retocats un per un

Quan canvia l'estil del document, **el que coincidia amb l'estil vell segueix el nou, i els
retocs manuals es conserven**. Val per a cada ajust de cada pictograma (lletra, lletra dels
números, posició del text, vores, numeració, pell, cabell, color) i per a la vista de cada
seqüència (mida, espai, alineació).

**Cas límit**: un retoc que casualment era igual a l'estil vell **es tracta com a no retocat** i
segueix el nou. No hi ha manera de distingir-los —el fitxer només guarda el valor, no qui l'hi va
posar—, i el desfer cobreix l'error. No hi ha cap opció de més per a aquest cas.

## 4. Compatibilitat amb fitxers antics

| Fitxer antic | Com s'obre |
|---|---|
| **Document sense estil** (l'antic «només seqüència») | Amb l'estil per defecte de l'usuari |
| **Amb estil parcial** | Es fan servir les propietats del fitxer, i les que falten s'omplen amb l'estil per defecte |
| **«Només preferències»** | S'interpreta com a fitxer d'estil |

**Cap fitxer antic pot deixar d'obrir-se.**

## 5. Per què

- **Previsibilitat.** Qui prepara un document (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) el veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** La decisió de canviar l'estil la pren qui obre, que és qui
  coneix el context.
- **Menys opcions en desar, menys errors.**

---

## 6. Com ho aplica el codi

Aquesta secció recull el que la implementació ha hagut de precisar. Si el codi i el que diu aquí
divergeixen, s'ha de corregir un dels dos, no deixar-los així.

### Què és l'estil del document, camp a camp

| Part | On viu al document | Què porta |
|---|---|---|
| Estil dels pictogrames | `documentState.defaultSettings` | `pictSequence` (numeració, posició del text, lletra, lletra dels números, vores) i `pictApiAra` (pell, cabell, color) |
| Mides i espaiats | `documentState.styleView` | mida i espai dels pictogrames, alineació H/V i espai entre seqüències |
| Vista d'aquesta seqüència | `documentState.viewSettings[n]` | la mida, l'espai i l'alineació d'aquella seqüència; és el retoc per seqüència |

L'estil per defecte de l'usuari és el mateix, tret de `ui.defaultSettings` i dels camps d'estil de
`ui.viewSettings`. La resta de `ui.viewSettings` (pàgina, orientació, direcció, autor) és
disposició i no hi entra.

> **Pendent de confirmar** (vegeu l'informe de la branca): l'**alineació** i l'**espai entre
> seqüències** s'han tractat com a part de l'estil del document, tot i que es toquen des de la
> columna de la vista, i l'espai entre seqüències hi surt dins de la secció «Format de pàgina», al
> costat de la disposició.

### Document nou: hereta fins que es desa

Un document nou **no porta estil**: `defaultSettings` i `styleView` són `undefined` i les
seqüències no tenen vista pròpia. Mentre és així, **hereta l'estil per defecte** en viu (selectors
de `style/styleSelectors.ts`). Així neix amb l'estil de l'usuari encara que les preferències —les
del compte, amb el servidor adormit— arribin després de crear-lo.

En desar-lo (fitxer o núvol), l'estil que feia servir **s'hi escriu** i a partir d'aleshores és
seu: canviar l'estil per defecte ja no el canvia. Tocar-ne l'estil (el panell «Estil del
document», la columna de vista amb «Aplicar a totes») també el fa seu.

### Formats: esquema 2

| Fitxer | Extensió | Forma |
|---|---|---|
| Document | `.saac` | `{ "schemaVersion": 2, "documentState": { …, "defaultSettings", "styleView", "layout"? } }` |
| Estil | `.saacstyle` | `{ "schemaVersion": 2, "style": { "pictSequence", "pictApiAra", "view" } }` |

Un fitxer sense `schemaVersion` és de la 2.1.0 o anterior. **Tota la lectura passa per
`features/sequence/style/saacFile.ts`**, també la dels documents que arriben del núvol, que no
duien estil fins ara:

| Forma que arriba | Com es llegeix |
|---|---|
| `{ sequence }` (primitiu) | La primera seqüència d'un document nou, amb l'estil per defecte |
| `{ documentState }` sense `viewSettings` | Vista de l'estil per defecte a totes les seqüències |
| `{ documentState }` (2.1.0, sense configuració) | Estil dels pictogrames per defecte; vista de cada seqüència, la del fitxer |
| `{ defaultSettings, documentState }` (2.1.0) | La configuració que el fitxer duia al costat **és l'estil del document**, no una preferència: ja no substitueix la de qui l'obre |
| `{ defaultSettings }` sol | Fitxer d'estil |
| Esquema 2 | Tal com ve |

- **La fusió és camp a camp i a qualsevol profunditat**: del fitxer es pren tot el que té la forma
  i el valor que toca, i el que falta o no es pot pintar (un tipus equivocat, una alineació que no
  existeix) surt de l'estil per defecte.
- **Els fitxers d'abans no tenien vista d'estil**: la base és la vista de la primera seqüència (en
  l'ordre del document), que és la que comparteixen totes quan s'ajusten juntes.
- **Sense lletra per als números** (versions d'abans que existís `numberFont`), els números fan
  servir la lletra del text **del fitxer**, que és com es veien.
- També s'hi accepten les formes velles que abans només entenia l'API: l'alineació única d'abans
  de separar-ne l'horitzontal i la vertical, i el Fitzgerald com a objecte `{ value, color }`.

### Fonts

El fitxer desa **només el nom de la família**, mai la font. Les sis pròpies viuen dins de l'app
(`src/style/fonts/`) i la resta arriben de Google Fonts. Si el dispositiu no en té alguna (un fitxer
d'una versió que en coneix més, o sense connexió a Google Fonts), el text es pinta amb **una
sans-serif del sistema** (`fontStack`) i el bàner en obrir el document diu quines falten. El fitxer
conserva el nom: en un dispositiu que sí que la tingui, es tornarà a veure bé. Servir-les des de la
mateixa app és **B27**.

### El panell «Estil del document»

És el tab d'estil del diàleg de configuració. Títol «Estil del document» i ajuda «S'aplica a totes
les seqüències d'aquest document». A la capçalera, en aquest ordre:

1. **Aplica el meu estil per defecte**
2. **Carrega un estil des d'un fitxer…** (un `.saacstyle` o un `.saac`, del qual només se'n pren
   l'estil)
3. **Desa com a estil per defecte**
4. **Desa l'estil en un fitxer…**

En escriptori i tauleta són botons dins de la capçalera del panell (la columna d'ajuda). En mòbil
(per sota de `md`, on el panell passa a una sola columna), un menú «⋯» amb l'etiqueta accessible
«Accions d'estil». Totes les accions apliquen primer al document el que hi hagi al formulari, perquè
el que es desa o es desfà sigui el que es veu.

S'hi arriba des de la roda dentada (Configuració) i des del botó del bàner que surt en obrir un
document amb estil propi. **El menú lateral només té accions de document** (desar, carregar,
document nou): l'estil no hi és.

### El desfer

- Aplicar un estil (el per defecte o el d'un fitxer) mostra un **snackbar** amb «Desfés» (10 s, que
  s'aturen mentre el ratolí o el focus hi són). Al panell, el snackbar va al DOM just després de les
  accions, perquè el tabulador hi arribi tot seguit.
- **El desfer torna el document exactament a com era abans del canvi**, i s'ofereix mentre el
  document no s'hagi tocat des d'aleshores (desar-lo no compta). Fer-lo després s'enduria la feina
  feta pel mig, i per això aleshores ja no s'ofereix.
- És el primer desfer de l'app: la resta d'accions continuen sense (vegeu
  `docs/estandards/feedback-i-accions.md`).

### Qui edita què

| Lloc | Què toca |
|---|---|
| Configuració › Estil del document | L'estil del document obert, en tancar la configuració, amb la regla dels retocs; i les quatre accions de la capçalera |
| Columna de la vista, amb «Aplicar a totes» | L'estil del document (mida, espai i alineació de totes les seqüències) |
| Columna de la vista, sense «Aplicar a totes» | La vista d'aquesta seqüència (retoc) |
| Columna de la vista › «Aplica el meu estil per defecte» | Aplica l'estil per defecte al document, amb desfer (substitueix «Restaura les seqüències») |
| Columna de la vista › «Desa com a preferències» | Porta les mides i els espaiats a l'estil per defecte, i la pàgina, la direcció i l'autor a les preferències de disposició |
| Configuració › Vista | L'estil per defecte (mides i espaiats) i les preferències de disposició. «Aplica a la vista actual» ho porta també al document obert |
| Configuració › Usuari | Preferències d'interfície (idioma, tema). Mai no entren al document |

### Missatges

Segueixen la regla de `docs/estandards/feedback-i-accions.md`:

- **Bàner** (a dalt, dins del contingut): «Aquest document té el seu propi estil» i les fonts que
  falten. És estat del document obert; es queda fins que es tanca (creu o Esc des de dins), és una
  regió viva `aria-live="polite"`, no s'imprimeix, i el seu botó obre el panell «Estil del
  document».
- **Snackbar** (a baix): la confirmació d'haver aplicat un estil, amb «Desfés».
