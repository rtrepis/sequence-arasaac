# Fonament: Seqüència i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui
> estils** a una seqüència: el `.saac` i el `.saacstyle` (`features/sequence/style/`), el desat al
> núvol, `documentSlice`, `uiSlice.defaultSettings` i `ui.viewSettings`, la columna de la pàgina de
> vista i el panell de pictogrames.
>
> Un **fonament** no és un estàndard: no diu com s'escriu el codi, sinó **què és cada cosa i de
> qui és**. Els estàndards de `docs/estandards/` hi han de ser coherents; si un estàndard i aquest
> document es contradiuen, mana aquest, i l'estàndard s'ha de corregir.
>
> És la decisió de producte que demanava **B25** (`docs/BACKLOG-ux.md`), resolta a la branca
> `claude/sequencia-estil-b25-16pluv`. Les seccions 1 a 5 són la decisió; la 6 és com l'aplica el
> codi.

## 1. Tres conceptes separats

- **Seqüència**: el contingut —pictogrames, textos, ordre, pestanyes, disposició— **i el seu
  estil**. Es desa al `.saac`.
- **Estil**: l'aparença d'una seqüència —fonts, mides, colors, vores, espaiats—. Es pot desar
  també en un **fitxer propi**, reutilitzable.
- **Preferències**: com vol la interfície qui fa servir l'app —zoom, alt contrast dels menús,
  moviment reduït, idioma—. **Són de l'usuari, i no es desen mai dins cap document.**

L'usuari té també un **estil per defecte**, que és el que reben les seqüències noves.

**La disposició és contingut**, no estil ni preferència: la direcció de les seqüències (files o
columnes), la mida i l'orientació de la pàgina. Forma part de la seqüència i **viatjarà al
`.saac`**, però encara no hi va: és feina de **B26** (`docs/BACKLOG-ux.md`; continua el que B20
va fer per a l'esborrany). Fins llavors continua a `ui.viewSettings` com fins ara, i l'esquema 2
ja admet el camp (`layout`, opcional) perquè B26 no hagi d'obrir una versió 3.

**Les preferències d'interfície, avui, són l'idioma i el tema** (clar, fosc o el del sistema).
El zoom, el contrast i el moviment reduït **no són ajustos de l'app**: es deleguen al navegador i
al sistema operatiu, i l'app els ha de respectar —`prefers-reduced-motion`, `prefers-contrast` i
un zoom del navegador fins al 200 % sense perdre contingut ni funcions—. Si algun dia n'hi ha un
d'intern, és una preferència i va a l'usuari, mai al document.

## 2. Desar

- **«Desar seqüència»** inclou sempre el seu estil.
- **«Desar estil»** desa només l'aparença, sense contingut.
- **No hi ha cap opció per desar una seqüència sense estil.**

Val igual per al fitxer i per al núvol: al núvol no hi ha opció d'estil a part, però el document
s'hi desa sempre amb el seu.

## 3. Obrir

- Una seqüència **es veu sempre tal com es va desar**.
- Les **preferències d'interfície** de qui l'obre **s'apliquen sempre**.
- **«Canvia l'estil»**, disponible en obrir i en qualsevol moment, ofereix:
  - **«El meu estil per defecte»**
  - **«Carrega un estil…»**

  **Es pot desfer**, i **no modifica el fitxer fins que es desa**.
- En obrir un **fitxer d'estil**:
  - amb una seqüència oberta, **s'hi aplica** (amb desfer), i s'ofereix **desar-lo com a estil
    per defecte**;
  - sense cap seqüència oberta, **es proposa com a estil per defecte** (amb confirmació, perquè
    substitueix el que l'usuari tenia).

### Pictogrames retocats un per un

Quan canvia l'estil d'una seqüència, **el que coincidia amb l'estil vell segueix el nou, i els
retocs manuals es conserven**. Val per a cada ajust de cada pictograma (lletra, lletra dels
números, posició del text, vores, numeració, pell, cabell, color) i per a la vista de cada pestanya
(mida, espai, alineació).

**Cas límit**: un retoc que casualment era igual a l'estil vell **es tracta com a no retocat** i
segueix el nou. No hi ha manera de distingir-los —el fitxer només guarda el valor, no qui l'hi va
posar—, i el desfer cobreix l'error. No hi ha cap opció de més per a aquest cas.

## 4. Compatibilitat amb fitxers antics

| Fitxer antic | Com s'obre |
|---|---|
| **«Només seqüència»** (sense estil) | Amb l'estil per defecte de l'usuari |
| **Amb estil parcial** | Es fan servir les propietats del fitxer, i les que falten s'omplen amb l'estil per defecte |
| **«Només preferències»** | S'interpreta com a fitxer d'estil |

**Cap fitxer antic pot deixar d'obrir-se.**

## 5. Per què

- **Previsibilitat.** Qui prepara una seqüència (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) la veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** La decisió de canviar l'estil la pren qui obre, que és qui
  coneix el context.
- **Menys opcions en desar, menys errors.**

---

## 6. Com ho aplica el codi

Aquesta secció recull el que la implementació ha hagut de precisar. Si el codi i el que diu aquí
divergeixen, s'ha de corregir un dels dos, no deixar-los així.

### Què és l'estil, camp a camp

| Part | On viu al document | Què porta |
|---|---|---|
| Estil dels pictogrames | `documentState.defaultSettings` | `pictSequence` (numeració, posició del text, lletra, lletra dels números, vores) i `pictApiAra` (pell, cabell, color) |
| Mides i espaiats | `documentState.styleView` | mida i espai dels pictogrames, alineació H/V i **espai entre seqüències** |
| Vista de cada pestanya | `documentState.viewSettings[n]` | la mida, l'espai i l'alineació d'aquella pestanya; és la base del «retoc» per pestanya |

L'estil per defecte de l'usuari és el mateix, tret de `ui.defaultSettings` i dels camps d'estil de
`ui.viewSettings`. La resta de `ui.viewSettings` (pàgina, orientació, direcció, autor) és
disposició i no hi entra.

### Seqüència nova: hereta fins que es desa

Un document nou **no porta estil**: `defaultSettings` i `styleView` són `undefined` i les pestanyes
no tenen vista pròpia. Mentre és així, **hereta l'estil per defecte** en viu (selectors de
`style/styleSelectors.ts`). Així neix amb l'estil de l'usuari encara que les preferències —les del
compte, amb el servidor adormit— arribin després de crear-lo.

En desar-la (fitxer o núvol), l'estil que feia servir **s'hi escriu** i a partir d'aleshores és
seu: canviar l'estil per defecte ja no la canvia. Tocar-ne l'estil (el panell de pictogrames, la
columna de vista amb «Aplicar a totes») també el fa seu.

### Formats: esquema 2

| Fitxer | Extensió | Forma |
|---|---|---|
| Seqüència | `.saac` | `{ "schemaVersion": 2, "documentState": { …, "defaultSettings", "styleView", "layout"? } }` |
| Estil | `.saacstyle` | `{ "schemaVersion": 2, "style": { "pictSequence", "pictApiAra", "view" } }` |

Un fitxer sense `schemaVersion` és de la 2.1.0 o anterior. **Tota la lectura passa per
`features/sequence/style/saacFile.ts`**, també la dels documents que arriben del núvol, que no
duien estil fins ara:

| Forma que arriba | Com es llegeix |
|---|---|
| `{ sequence }` (primitiu) | La primera pestanya d'un document nou, amb l'estil per defecte |
| `{ documentState }` sense `viewSettings` | Vista de l'estil per defecte a totes les pestanyes |
| `{ documentState }` (2.1.0, sense configuració) | Estil dels pictogrames per defecte; vista de cada pestanya, la del fitxer |
| `{ defaultSettings, documentState }` (2.1.0) | La configuració que el fitxer duia al costat **és l'estil de la seqüència**, no una preferència: ja no substitueix la de qui l'obre |
| `{ defaultSettings }` sol | Fitxer d'estil |
| Esquema 2 | Tal com ve |

- **La fusió és camp a camp i a qualsevol profunditat**: del fitxer es pren tot el que té la forma
  i el valor que toca, i el que falta o no es pot pintar (un tipus equivocat, una alineació que no
  existeix) surt de l'estil per defecte.
- **Els fitxers d'abans no tenien vista d'estil**: la base de les pestanyes és la de la primera
  pestanya (en l'ordre del document), que és la que comparteixen totes quan s'ajusten juntes.
- **Sense lletra per als números** (versions d'abans que existís `numberFont`), els números fan
  servir la lletra del text **del fitxer**, que és com es veien.
- També s'hi accepten les formes velles que abans només entenia l'API: l'alineació única d'abans
  de separar-ne l'horitzontal i la vertical, i el Fitzgerald com a objecte `{ value, color }`.

### Fonts

El fitxer desa **només el nom de la família**, mai la font. Les sis pròpies viuen dins de l'app
(`src/style/fonts/`) i la resta arriben de Google Fonts. Si el dispositiu no en té alguna (un fitxer
d'una versió que en coneix més, o sense connexió a Google Fonts), el text es pinta amb **una
sans-serif del sistema** (`fontStack`) i l'avís en obrir la seqüència diu quines falten. El fitxer
conserva el nom: en un dispositiu que sí que la tingui, es tornarà a veure bé.

### «Canvia l'estil» i el desfer

- És al menú lateral (sempre disponible), a l'avís que surt en obrir una seqüència amb estil propi
  i a la columna de la pàgina de vista, on substitueix «Restaura les seqüències».
- «Carrega un estil…» accepta un `.saacstyle` i també un `.saac`, del qual només se'n pren l'estil.
- **El desfer torna el document exactament a com era abans del canvi**, i s'ofereix mentre el
  document no s'hagi tocat des d'aleshores (desar-lo no compta). Fer-lo després s'enduria la feina
  feta pel mig, i per això aleshores ja no s'ofereix.
- És el primer desfer de l'app: la resta d'accions continuen sense (vegeu
  `docs/estandards/feedback-i-accions.md`).

### Qui edita què

| Lloc | Què toca |
|---|---|
| Configuració › Pictogrames («Estil d'aquesta seqüència») | L'estil de la seqüència oberta, en tancar la configuració, amb la regla dels retocs. «Desa com a estil per defecte» el fa servir, a més, per a les seqüències noves |
| Columna de la vista (mida, espais, alineació) | L'estil de la seqüència oberta. «Desa com a preferències» porta les mides i els espaiats a l'estil per defecte, i la pàgina, la direcció i l'autor a les preferències de disposició |
| Configuració › Vista | L'estil per defecte (mides i espaiats) i les preferències de disposició. «Aplica a la vista actual» ho porta també a la seqüència oberta |
| Configuració › Usuari | Preferències d'interfície (idioma, tema). Mai no entren al document |

### Avís en obrir

Si la seqüència té un estil diferent de l'estil per defecte de qui l'obre, o demana fonts que no
hi ha, surt un avís **dins del contingut, a dalt** (com el de verificar el correu), no flotant: no
tapa el full ni la confirmació de «Fitxer carregat». És una regió viva `aria-live="polite"`, es
tanca amb la creu o amb Esc des de dins, i els seus botons fan 44 px.
