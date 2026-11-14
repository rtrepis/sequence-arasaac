# Fonament: model de contingut i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui estils**
> a un document: el `.saac` i el `.saacstyle`, el desat al núvol, `documentSlice`,
> `uiSlice.defaultSettings` i `ui.viewSettings`, la targeta del pictograma, el PDF, la columna de la
> pàgina de vista, els menús «⋯» de pàgina i bloc i el panell «El meu estil» de la configuració.
>
> Un **fonament** no és un estàndard: no diu com s'escriu el codi, sinó **què és cada cosa i de qui
> és**. Si un estàndard de `docs/estandards/` el contradiu, mana aquest, i l'estàndard s'ha de
> corregir.
>
> El format del fitxer, la migració dels formats antics, desar i obrir són a
> `docs/fonaments/06-compatibilitat-i-dades.md`. Les decisions i el seu perquè, a
> `docs/decisions/ADR-003-model-document-saac-v3.md`. Aquest document substitueix
> `docs/fonaments/sequencia-i-estil.md` (B25), que queda com a índex de redirecció.

L'objectiu que ho guia tot: **un `.saac` s'obre, es veu i s'imprimeix igual a qualsevol ordinador,
tauleta o mòbil, amb compte o sense.**

## 1. Vocabulari

Aquestes paraules volen dir sempre el mateix: a la interfície, a les traduccions, als comentaris,
al codi nou i als documents.

| Terme | Què és |
|---|---|
| **Document** | El fitxer `.saac`. Conté totes les seqüències, el seu estil i la seva pàgina. És el que es desa, s'obre i es comparteix. |
| **Seqüència** | El que la interfície mostra com a **pestanya**. Un document en té una o més. |
| **Pictograma** | Una targeta d'una seqüència. |
| **Estil** | Com és cada pictograma: lletra, vores, colors, posició del text, pell i cabell, numeració. **No** la mida, l'espai ni l'alineació, que són la distribució (pas 7, 2026-11-14). Al codi, `pictogram` i `card` (`pictApiAra`, `pictSequence`). |
| **Distribució** (dels pictogrames) | Com es posen els pictogrames dins d'una seqüència o d'un bloc: la mida, l'espai entre pictogrames i l'alineació. És del lloc on surten (la seqüència, el bloc o la pàgina amb «La mateixa a tots els blocs»), no de l'estil. A la interfície, «Distribució dels pictogrames» on hi ha espai i, si no, «Distribució». Al codi, `view` (`SequenceViewSettings`). |
| **Estil del document** | L'estil que s'aplica a totes les seqüències del document. |
| **Distribució d'aquesta seqüència** | La distribució d'una sola seqüència (mida, espai, alineació), que és la base de tots els seus blocs. Abans es deia «vista d'aquesta seqüència»; al codi és `sequences[].style.view`. |
| **Pàgina** | Cadascun dels fulls del document («pàgina 1, 2…»). Totes tenen el paper i l'orientació del document; cadascuna té la seva **disposició**, una sola tria: **simple** (les seqüències una darrere l'altra, com sempre; al codi, `"auto"`), **columnes**, **files** o **lliure** (cada bloc a la seva caixa; una plantilla aplicada és lliure, amb espais per omplir). Al codi, les tres últimes són `mode: "template"` amb el seu `template`; a la interfície ja no hi ha «En blocs» ni «Repartiment» (pas 7). Un document d'abans és una sola pàgina simple amb totes les seqüències. |
| **Bloc** | Una cosa posada en una pàgina: una **seqüència** (amb els seus ajustos) o un **text** (un rètol sense pictograma). Una seqüència pot sortir en molts blocs; el que surt a totes les pàgines és **comú**. Al codi, el tipus és `SequencePlacement` / `TextPlacement` («col·locació»); a la interfície i a la documentació per a l'usuari, sempre «bloc» (Q1). |
| **Estil de bloc** | Un estil amb un nom que poden fer servir molts blocs alhora: el grup són «els blocs amb aquest estil». És el meu estil **copiat** dins del document («Aplica el meu estil»), i porta només estil, no distribució. Al codi i a l'ADR-005, «estil amb nom» (`NamedStyle`, `styles`, `styleId`). |
| **Fitxer d'estil** | El meu estil desat en un fitxer per dur-lo a un altre dispositiu o passar-lo a algú: el fitxer `.saacstyle`. |
| **El meu estil** | L'estil dels pictogrames de l'usuari: el reben els documents nous i el copia «Aplica el meu estil». La distribució amb què comencen els documents nous és a part, al panell «Pàgina i distribució». És una preferència de l'app. Abans es deia «estil per defecte», i al codi encara ho és (`ui.defaultSettings`, `selectUserDefaultStyle`). Amb comptes, n'hi haurà un catàleg (R10, B33). |
| **Preferències de l'app** | El que és de la persona o del dispositiu: idioma, tema clar o fosc, el meu estil, pàgina per defecte. |

- **MAI** «seqüència» per dir el fitxer sencer.
- **MAI** «estil» per dir la mida, l'espai o l'alineació dels pictogrames: és la **distribució**. I
  **MAI** «distribució» per dir com van els blocs a la pàgina: és la **disposició**.
- **MAI** «tema» per dir un estil desat. «Tema» només vol dir clar, fosc o el del sistema.

## 2. Principis

1. **Autocontingut.** Tot el que cal per veure i imprimir el document va dins del fitxer.
2. **Un fitxer, una cosa.** Un fitxer és un document o un estil. Ho diuen l'extensió i el camp
   `kind`; mana el camp.
3. **Estil en cascada.** Document → seqüència → pictograma. Cada nivell guarda **només** les
   diferències amb el nivell superior.
4. **Les preferències de l'app MAI van al fitxer.** Obrir un document **MAI** canvia la
   configuració de l'usuari sense preguntar-ho.
5. **La pàgina forma part del document.**
6. **Llistes ordenades amb `id` estables.** L'ordre és el de la llista. **MAI** un camp d'ordre a
   part.
7. **Versió i migració, sempre.** Els fitxers antics s'obren **sempre**. Els camps desconeguts es
   conserven i es tornen a escriure en desar.

## 3. Què és de qui

| Cosa | De qui és | On viu |
|---|---|---|
| Seqüències, pictogrames, textos, categoria de Fitzgerald, imatges pròpies | Del document | `.saac` |
| Estil del document i vista de cada seqüència | Del document | `.saac` |
| Retocs d'un pictograma | Del document | `.saac` |
| Pàgina (mida, orientació, direcció, espai entre seqüències) | Del document | `.saac` |
| Pàgines i blocs, la plantilla de cada pàgina | Del document | `.saac`, a `page` (fonament 06, §1.1) |
| Estils amb nom que fa servir el document | Del document | `.saac`, a `styles` (fonament 06, §1.2) |
| Catàleg d'estils de l'usuari (R10, B33) | De l'usuari | Preferències; aplicar-ne un el **copia** al document. Sense comptes, és d'una sola entrada: el meu estil |
| El meu estil | De l'usuari | Preferències; s'exporta i s'importa amb un `.saacstyle` |
| Pàgina per defecte dels documents nous | De l'usuari | Preferències |
| Autor del document | Del document | `.saac`, a `meta.author` |
| Autor per defecte dels documents nous | De l'usuari | Preferències |
| Idioma, tema clar o fosc | De l'usuari | Preferències |
| Seqüència activa en obrir | Del document, però **no** és aparença | `.saac`, a `ui` |

- **SEMPRE** el document es desa amb el seu estil i la seva pàgina. No hi ha cap manera de desar
  un document sense.
- **SEMPRE** l'autor és el del document: la vista l'ensenya i, si s'hi escriu, el canvia al document.
  Un document nou hereta l'autor per defecte de l'usuari mentre no en té cap, i en desar-lo s'hi
  escriu. Un fitxer sense autor s'obre **sense autor**, no amb el de qui l'obre (B21).
- **SEMPRE** el document s'obre tal com es va desar. Les preferències d'interfície de qui l'obre
  (idioma, tema) s'hi apliquen igualment, perquè no canvien el que surt al paper.
- **MAI** el zoom, el contrast o el moviment reduït són ajustos de l'app: els decideixen el
  navegador i el sistema, i l'app els respecta.
- **SEMPRE** els estils van en **una sola direcció**: es fan a la configuració («El meu estil» i
  «Pàgina i distribució») i es porten al document des de la vista («Aplica el meu estil», al menú «⋯» d'una
  pàgina o d'un bloc). **MAI** hi ha una acció que porti res del document cap a les preferències
  (R10, 2026-11-12). Abans n'hi havia tres («Desa com a estil per defecte», «Desa com a
  preferència» i «Aplicar a la vista actual», que anava al revés), i es confonien.

## 4. La cascada d'estil

L'estil té cinc nivells. Cada nivell és un **retoc** del de sobre.

| Nivell | Què pot portar |
|---|---|
| **Document** | Tot l'estil, **sempre complet**: `pictogram`, `card` i `view`. |
| **Seqüència** | **Només `view`**: mida, espai entre pictogrames, alineació. És la base de tots els seus blocs. |
| **Estil de bloc** («estil amb nom») | `pictogram` i `card`. Només si el bloc en fa servir un (ADR-005). Els dels documents fets abans del pas 7 poden portar també `view`, que es continua pintant; l'app ja no n'hi escriu. |
| **Bloc** | **Només `view`** (el de seqüència) o l'aspecte del rètol (el de text: lletra, negreta, alineació). |
| **Pictograma** | `pictogram` i `card`. **Mai `view`**. |

- Un bloc de text agafa la lletra de les targetes del document (`card.font`), la del seu estil de
  bloc si en té, i el seu retoc.
- La distribució d'un bloc (el seu retoc de `view`) **es pinta** i s'edita al nivell «Bloc» de la
  columna de la vista (R5), i en una plantilla la mida hi és un màxim (Q2). L'estil de bloc es pinta
  sencer: la lletra, les vores, la posició del text i el color o la pell i el cabell dels pictogrames. El
  que un pictograma heretava de l'estil del document passa a ser el de l'estil amb nom, i els seus
  retocs es conserven (la mateixa regla que canviar l'estil del document, `followStyle`). La mida
  de la targeta es mesura per seqüència **i** estil amb nom (`cardMeasureKey`).

### Resoldre

`resolveStyle(doc, sequenceId, pictogramId)` combina els tres nivells **propietat a propietat**, a
qualsevol profunditat. A cada propietat guanya el nivell més proper al pictograma.

- Exemple: si el document té `card.font = { family: "Roboto", color: "#000000", size: 1 }` i el
  pictograma només `card.font.color = "#b71c1c"`, la lletra resolta és Roboto, mida 1, vermella.
- **SEMPRE** la pantalla i el PDF fan servir la **mateixa** funció de resolució. El PDF es genera
  capturant la pantalla, i no n'hi ha d'haver una segona.
- **MAI** una targeta combina objectes sencers (`pictFont ?? defaults.font`): es perdria la
  resta de propietats de l'objecte.

### Guardar només les diferències

`diffStyle(base, full)` retorna el que `full` té diferent de `base`, propietat a propietat.

- **SEMPRE** s'aplica en desar: cada nivell es compara amb l'estil resolt del nivell superior, i
  només s'escriu el que és diferent.
- Un retoc que casualment és igual al nivell superior **deixa de ser un retoc** i segueix el nivell
  superior. No hi ha manera de distingir-los, i el desfer cobreix l'error.
- Un pictograma sense cap diferència no porta `style`. Una seqüència sense cap diferència no porta
  `style`.

### La mida de la lletra

La mida del text del pictograma és **només** `card.font.size`, i ve de la cascada.

- El camp antic `settings.fontSize` **s'ignora** en llegir. La targeta no l'ha fet servir mai per
  pintar, i fer-lo servir ara canviaria com es veuen els documents antics.
- **MAI** s'escriu `fontSize` en un fitxer nou.

### El color de Fitzgerald

El color de Fitzgerald té dues parts, i cadascuna és d'un lloc diferent:

| Part | Què és | On viu | És |
|---|---|---|---|
| **Categoria** | El tipus de paraula: nom propi, nom, verb, descriptiu, contingut social o miscel·lània | `pictograms[].category`, **fora** de l'estil | Contingut, com la paraula |
| **Colors** | El color de cada categoria, i el dels pictogrames sense categoria | `style.pictogram.fitzgerald` del document | Estil |

- **SEMPRE** la categoria la dona ARASAAC en triar el pictograma (el tipus de la primera paraula
  clau). Un pictograma no trobat o una imatge pròpia **no** en porten.
- **SEMPRE** el color es resol així: el retoc del pictograma (`style.pictogram.fitzgerald`, un sol
  color) si n'hi ha; si no, el color de la seva categoria a l'estil del document; si no té
  categoria, el color `none` de l'estil del document.
- **MAI** una acció d'estil toca la categoria. «Restableix» esborra el retoc de color, i el
  pictograma torna al color de la seva categoria, **sense connexió i a l'instant**.
- El Fitzgerald es comporta com qualsevol altra propietat: «Aplica a tots», aplicar un estil,
  «Restableix», el desfer i l'indicador «personalitzat» el tracten igual que la resta.
- Un color fixat pel **vocabulari personal** és un retoc del pictograma.
- Els colors de l'estil del document són, d'entrada, els de l'app (`data/fitzgeraldColors.ts`, i
  `#666666` per als que no tenen categoria). Van dins del document perquè, si l'app canvia mai la
  taula, els documents desats es continuïn veient igual. **No** hi ha cap interfície per
  editar-los.
- Els colors es comparen **sense distingir majúscules**, i `#666` és el mateix que `#666666`.

## 5. Accions sobre l'estil

| Acció | On | Efecte |
|---|---|---|
| **Canviar l'estil del document** | Cap lloc de la interfície des de R10 (2026-11-12) | Un document neix amb el meu estil i, un cop desat, el té propi. Es retoca per blocs («Aplica el meu estil») i per pictograma. La regla, per a qui el canvia per codi (`applyStyleToDocument`, «Redueix la lletra de tot el document»): el que coincidia amb l'estil vell segueix el nou; els retocs es conserven. |
| **Aplica el meu estil** | Menú «⋯» d'una pàgina (tots els seus blocs propis, no els comuns) o d'un bloc | **Copia** el meu estil al document com a estil de bloc (`styles`; si n'hi ha un d'igual, el reaprofita; si el nom ja hi és, hi afegeix un número: «El meu estil 2») i hi apunta els blocs. Només porta estil: la distribució de cada bloc, els retocs dels pictogrames i l'aspecte propi de cada rètol es conserven. L'estil del document no canvia. |
| **Actualitza amb el meu estil** | Menú «⋯» d'una pàgina o d'un bloc, quan ja fan servir un estil de bloc | Els estils de bloc que fan servir passen a tenir el meu estil d'ara, amb el mateix nom; canvien **tots** els blocs que els fan servir, a qualsevol pàgina. És l'«estil per grup» (R7). No toca la distribució. |
| **Treu l'estil de bloc** | Menú «⋯» d'un bloc que en té un | El bloc torna a l'estil del document. Si cap altre bloc no el fa servir, l'estil de bloc surt del document. |
| **Aplica a tots** | Cap lloc de la interfície des de R10: vivia al panell «Estil del document», que ara és «El meu estil». A la columna de la vista, «La mateixa a tots els blocs» del nivell «Pàgina» escriu el mateix retoc a tots els blocs de la pàgina | S'aplicava a **tot el document**: canviava l'estil del document **i esborrava aquestes propietats** de tots els retocs de seqüències i pictogrames. L'acció (`applyToAllPictogramsThunk`) es conserva per si torna; vegeu R10 a `docs/PLA-mode-lliure.md`. |
| **Canviar la distribució d'una seqüència** | Columna de la vista, nivell «Seqüència», amb una seqüència seleccionada en una pàgina simple | Canvia la mida, l'espai o l'alineació d'aquesta seqüència. |
| **Canviar la distribució d'un bloc** | Columna de la vista, nivell «Bloc», amb un bloc seleccionat en una pàgina en blocs | Desa al bloc **només** el que es diferencia de la distribució de la seqüència (amb la de l'estil de bloc, als documents d'abans que en porten). Les altres còpies de la seqüència no canvien. |
| **Canviar un pictograma** | Formulari del pictograma | Canvia **només** el `style` d'aquell pictograma, i **només** les propietats tocades. |
| **Restableix** un pictograma | Formulari del pictograma (capçalera de «Estil del pictograma» o «Més accions»); menú contextual de la graella («Restableix l'estil») | Esborra el seu `style`. La categoria, que és contingut, es queda. Dins del formulari és una edició més i es desa en tancar-lo; des del menú contextual s'aplica al document al moment. |
| **Canviar el meu estil** i la distribució per defecte | Configuració, panell «El meu estil» (l'estil) i panell «Pàgina i distribució» (la pàgina i la distribució dels pictogrames amb què comencen els documents nous) | Canvia la preferència. Es desa en tancar la configuració. No toca cap document desat; un document nou encara sense desar l'hereta en viu (§7). |
| **Carrega un estil des d'un fitxer** | Panell «El meu estil» | L'estil del fitxer (un `.saacstyle`, o el d'un `.saac`) passa a ser el meu estil. Obrir un `.saacstyle` des del menú pregunta si es fa el meu estil. Cap dels dos camins toca el document obert. |
| **Desa el meu estil en un fitxer** | Panell «El meu estil» | Desa el meu estil en un `.saacstyle`. |
| **Redueix la lletra de tot el document** | Avís «el text no hi cap» de la graella (§6) | Com canviar l'estil del document, només amb la mida de la lletra: totes les targetes continuen amb la mateixa mida. Els retocs es conserven. |
| **Redueix la lletra d'aquest pictograma** | Avís «el text no hi cap» de la graella (§6) | Com canviar un pictograma: un retoc de la mida de la lletra, que l'encén com a personalitzat. |

- **Estil per grup** (B31, R7): una seqüència només té distribució. L'estil d'un grup de blocs és
  el seu **estil de bloc**: es dona amb «Aplica el meu estil», es canvia per a tots amb «Actualitza
  amb el meu estil» i es treu d'un bloc amb «Treu l'estil de bloc». Al document no hi ha cap editor
  d'estils: es fa al panell «El meu estil» i es porta al document (direcció única). El nivell «Bloc»
  de la columna diu quin fa servir el bloc i quants blocs el comparteixen.
- **SEMPRE** «Aplica el meu estil», «Actualitza amb el meu estil», «Treu l'estil de bloc», «Restableix» i
  les dues reduccions de lletra de l'avís «el text no hi cap» es poden desfer amb el **desfer que ja existeix**: un snackbar amb «Desfés» que torna el document
  exactament a com era, mentre no s'hagi tocat des d'aleshores. Dins del formulari del pictograma,
  el «Desfés» de «Restableix» torna l'estil d'abans **al formulari**, sense tocar les altres
  edicions que s'hi hagin fet.
- L'historial complet de desfer i refer per a totes les accions **no** forma part d'aquesta
  versió: és **B30** a `docs/BACKLOG-ux.md`.
- **SEMPRE** una acció acaba amb un missatge (`docs/estandards/feedback-i-accions.md`).

## 6. L'indicador «personalitzat»

Un pictograma amb retocs propis (un `style` no buit) ho ha de dir. Serveix perquè s'entengui per què
una targeta no ha canviat amb «Aplica a tots».

**Al formulari d'edició** (la capçalera de la configuració):

- El modal és el de sempre: la previsualització i la cerca a dalt, la configuració a sota.
- La configuració es titula **«Estil del pictograma»**, amb **«Personalització»** de segona línia i
  la **mateixa icona** que marca la targeta a la graella: així qui l'edita relaciona les dues coses
  d'una ullada. A l'esquerra de la icona, la fletxa de sempre, que gira en desplegar.
- Amb retocs, a la **mateixa capçalera** i a la dreta hi apareix el botó **Restableix**. Per sota de
  `sm` només hi va la icona, amb el nom al tooltip: amb el text, el títol es partiria en dues línies
  justament quan el botó apareix.
- **MAI** un botó dins d'un altre: el botó que desplega i el «Restableix» són **germans** dins de la
  capçalera, que ella mateixa no és cap botó (`SettingAccordion`, que per això no fa servir
  l'`AccordionSummary` de MUI). El nom del que desplega és només el títol; la segona línia n'és la
  descripció (`aria-describedby`). L'ordre del focus és el botó que desplega i després «Restableix».
- En prémer Restableix, el botó desapareix, surt el snackbar «Estil restablert» amb Desfés, i el
  focus va al botó que desplega.
- Quan el botó apareix o desapareix, el que s'està editant a sota **no es mou** sota el dit ni el
  ratolí: la capçalera té sempre la mateixa alçada i la ranura de l'acció es reserva sempre, hi hagi
  acció o no.
- Quan a la previsualització només se'n veu menys d'un terç per dalt, se'n veu una **còpia
  compacta** fixa a dalt de la zona que es desplaça (com a molt, el 30 % de l'alçada o 200 px); quan
  l'original torna a la vista, la còpia desapareix. La còpia és només per a la vista
  (`aria-hidden`, `inert`). Entra i surt lliscant des de dalt, amb el mateix temps (220 ms) i la
  mateixa corba, perquè no aparegui de cop; amb moviment reduït, sense moviment. L'original no es mou del seu lloc.

**A la graella d'edició** (la targeta):

- Una marca petita a la cantonada inferior dreta, que mossega la vora exterior. **MAI** tapa la
  imatge, el text ni el número (van centrats i aquella cantonada és buida).
- Una forma, no només un color, amb contrast de 3:1 com a mínim amb el fons i amb la vora.
- **És informativa**: no rep el focus ni té acció. El nom accessible de la targeta diu
  «personalitzat» («esmorzar, pictograma 3, personalitzat»).
- El menú contextual (clic dret, pulsació llarga, Maj+F10 o la tecla de menú) ofereix
  «Restableix l'estil», només si el pictograma és personalitzat.

**MAI** a la vista, la pantalla completa, la impressió ni el PDF: és un estat de l'edició, no del
document, i l'usuari de CAA no l'ha de veure.

### L'avís «el text no hi cap» (B28)

Una paraula que no es pot partir es fa més ampla que la targeta, i la targeta en talla un tros.
L'app no decideix què s'hi fa: partir una paraula pot confondre qui llegeix, i reduir-la trenca la
mida que s'havia triat. Ho avisa, i qui prepara el document tria.

- **On**: a la graella d'edició, a la **mateixa fila** que la marca «personalitzat», a la seva
  esquerra. **MAI** l'una damunt de l'altra. Com aquella, **MAI** a la vista, la pantalla completa,
  la impressió ni el PDF.
- **Com és**: la mateixa rodoneta, en taronja d'avís (`sheetWarning` de `palette.ts`, fix en tots
  dos temes perquè és damunt del full) i amb un signe d'exclamació: forma i color.
- **No és informativa**: és un **botó**, amb diana de 44 × 44 px. Per això la fila de marques és
  **germana** del botó de la targeta i no filla: **MAI** un botó dins d'un altre. Amb el ratolí a
  sobre, un tooltip diu què passa; amb un clic o un toc (en tauleta no hi ha hover), obre les
  opcions.
- **Les opcions**, en aquest ordre i només les que es poden fer:
  1. **Redueix la lletra de tot el document a _x_**: no s'ofereix si el pictograma té mida pròpia,
     perquè canviar la del document no el tocaria.
  2. **Redueix la lletra només d'aquest pictograma a _x_**.
  3. **Edita el text**: el camp damunt de la targeta, el mateix del clic al text.
- _x_ és la mida més gran, en passos de 0,1, amb què el text hi cap. Si no hi cap ni amb la mínima
  (0,5), només queda editar el text, i el quadre ho diu.
- **Com es detecta**: el text de la targeta es fa més ample que la seva caixa. La lletra i la caixa
  s'escalen igual amb la mida de la targeta, i la proporció que es mesura a la graella és la del
  paper i la del PDF.
- **SEMPRE** la impressió respecta la mida de la lletra triada: només en treu l'escala de pantalla
  (B32 a `docs/BACKLOG-ux.md`).

- **SEMPRE** objectius tàctils de 44 × 44 px com a mínim al mòbil (la marca no n'és cap).

## 7. Documents nous

- Un document nou neix amb **el meu estil** i la **pàgina per defecte** de l'usuari.
- Mentre no es desa, **hereta** el meu estil en viu: si les preferències del compte arriben
  tard, el document nou se les emporta igualment.
- En desar-lo, l'estil i la pàgina s'hi **escriuen**, i a partir d'aleshores són seus.

## 8. Per què

- **Previsibilitat.** Qui prepara un document (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) el veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** Canviar l'estil d'un document obert és una decisió de qui
  l'obre, explícita i reversible.
- **Excepcions mínimes.** Guardar només les diferències fa que «Aplica a tots» i «Restableix»
  siguin evidents, i que el fitxer sigui petit.
