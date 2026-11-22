# Fonament: model de contingut i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui estils**
> a un document: el `.saac` i el `.saacstyle`, el desat al núvol, `documentSlice`,
> `uiSlice.defaultSettings` i `ui.viewSettings`, la targeta del pictograma, el PDF, la columna de la
> pàgina de vista, els menús «⋯» de pàgina, bloc i seqüència, la Galeria d'estils i el panell «El meu
> estil» de la configuració.
>
> Un **fonament** no és un estàndard: no diu com s'escriu el codi, sinó **què és cada cosa i de qui
> és**. Si un estàndard de `docs/estandards/` el contradiu, mana aquest, i l'estàndard s'ha de
> corregir.
>
> El format del fitxer, la migració dels formats antics, desar i obrir són a
> `docs/fonaments/06-compatibilitat-i-dades.md`. Les decisions i el seu perquè, a
> `docs/decisions/ADR-003-model-document-saac-v3.md`. Aquest document substitueix
> `docs/fonaments/sequencia-i-estil.md` (B25), que queda com a índex de redirecció.

> **Revisat el 2026-11-21 amb el pla dels estils** (`docs/plans/PLA-estils.md` §10, ADR-006). §1,
> §3, §4, §5, §6 i §7 descriuen el model de l'estil de la seqüència, el bloc amb un sol estil, la
> Galeria d'estils i la solució A. **El codi ja hi és** (passos 2, 4, 5 i 6 del pla, fets el
> 2026-11-22), llevat dels estils de l'app a la galeria (pas 9). La versió anterior d'aquest
> document (a l'historial de git) i les decisions 23 i 24 de l'ADR-005 expliquen d'on ve.

L'objectiu que ho guia tot: **un `.saac` s'obre, es veu i s'imprimeix igual a qualsevol ordinador,
tauleta o mòbil, amb compte o sense.**

## 1. Vocabulari

Aquestes paraules volen dir sempre el mateix: a la interfície, a les traduccions, als comentaris,
al codi nou i als documents.

| Terme | Què és |
|---|---|
| **Document** | El fitxer `.saac`. Conté totes les seqüències, el seu estil i la seva pàgina. És el que es desa, s'obre i es comparteix. |
| **Seqüència** | El que la interfície mostra com a **pestanya** (o, al mòbil, una pantalla de la pàgina d'edició). Un document en té una o més. Té **nom**, que és per a qui edita i **no** s'imprimeix; sense nom, «Seqüència _N_». |
| **Pictograma** | Una targeta d'una seqüència. |
| **Estil** | Com és cada pictograma: lletra, vores, colors, posició del text, pell i cabell, numeració. **No** la mida, l'espai ni l'alineació, que són la distribució (pas 7, 2026-11-14). Al codi, `pictogram` i `card` (`pictApiAra`, `pictSequence`). |
| **Distribució** (dels pictogrames) | Com es posen els pictogrames dins d'una seqüència o d'un bloc: la mida, l'espai entre pictogrames i l'alineació. És del lloc on surten (la seqüència, el bloc o la pàgina amb «La mateixa a tots els blocs»), no de l'estil. A la interfície, «Distribució dels pictogrames» on hi ha espai i, si no, «Distribució». Al codi, `view` (`SequenceViewSettings`). |
| **Estil del document** | L'estil de partida de totes les seqüències: el que fa servir una seqüència que no n'ha triat cap. Té nom, el de l'estil del qual surt («El meu estil» en un document nou). |
| **Estil de la seqüència** | L'estil que una seqüència ha triat de la Galeria d'estils, des de l'edició. El reben tots els seus blocs, llevat dels que en tenen un de **reassignat**. Sense, l'estil del document. |
| **Distribució d'aquesta seqüència** | La distribució d'una sola seqüència (mida, espai, alineació), que és la base de tots els seus blocs. Abans es deia «vista d'aquesta seqüència»; al codi és `sequences[].style.view`. |
| **Pàgina** | Cadascun dels fulls del document («pàgina 1, 2…»). Totes tenen el paper i l'orientació del document; cadascuna té la seva **disposició**, una sola tria: **simple** (les seqüències una darrere l'altra, com sempre; al codi, `"auto"`), **columnes**, **files** o **lliure** (cada bloc a la seva caixa; una plantilla aplicada és lliure, amb espais per omplir). Al codi, les tres últimes són `mode: "template"` amb el seu `template`; a la interfície ja no hi ha «En blocs» ni «Repartiment» (pas 7). Un document d'abans és una sola pàgina simple amb totes les seqüències. |
| **Bloc** | Una cosa posada en una pàgina: una **seqüència** (amb els seus ajustos) o un **text** (un rètol sense pictograma). Una seqüència pot sortir en molts blocs; el que surt a totes les pàgines és **comú**. Al codi, el tipus és `SequencePlacement` / `TextPlacement` («col·locació»); a la interfície i a la documentació per a l'usuari, sempre «bloc» (Q1). |
| **Estil reassignat** | L'estil que un **bloc** ha triat de la Galeria d'estils, a la vista, en lloc del de la seva seqüència. **Un bloc té un sol estil**: el de la seqüència o el reassignat, mai tots dos sumats. Només canvia aquell bloc. |
| **Estil amb nom** | Com es guarda dins del document l'estil d'una seqüència o el reassignat d'un bloc: una còpia de l'estil de la galeria, amb el seu nom (`NamedStyle`, `styles`, `namedStyle`). És un terme del codi i del format; a la interfície es diu pel nom de l'estil. Abans, «estil de bloc» (ADR-005, decisió 24): **ja no** es fa servir. |
| **Galeria d'estils** | El lloc d'on es trien els estils: l'estil de damunt («L'estil del document» o «L'estil de la seqüència»), el meu estil i els estils de l'app. Triar-ne un en **copia** els valors al document. **MAI** «tema» ni «plantilla». |
| **Personalitzat** | Que té **retocs** propis. Un pictograma és personalitzat si té `style`. Una seqüència o un bloc ho són si algun dels seus pictogrames ho és, i aleshores la interfície ensenya «Personalitzat» en lloc del nom de l'estil (§6). |
| **Fitxer d'estil** | El meu estil desat en un fitxer per dur-lo a un altre dispositiu o passar-lo a algú: el fitxer `.saacstyle`. |
| **El meu estil** | L'estil dels pictogrames de l'usuari: el reben els documents nous (en una còpia) i és a la Galeria d'estils. La distribució amb què comencen els documents nous és a part, al panell «Pàgina i distribució». És una preferència de l'app. Abans es deia «estil per defecte», i al codi encara ho és (`ui.defaultSettings`, `selectUserDefaultStyle`). Amb comptes, n'hi haurà un catàleg (R10, B33). |
| **Preferències de l'app** | El que és de la persona o del dispositiu: idioma, tema clar o fosc, el meu estil, pàgina per defecte. |

- **MAI** «seqüència» per dir el fitxer sencer.
- **MAI** «estil» per dir la mida, l'espai o l'alineació dels pictogrames: és la **distribució**. I
  **MAI** «distribució» per dir com van els blocs a la pàgina: és la **disposició**.
- **MAI** «tema» per dir un estil desat. «Tema» només vol dir clar, fosc o el del sistema.
- **Verbs**: **Tria un estil** porta un estil de la galeria a una seqüència o a un bloc (és l'única
  entrada). **Restableix** treu retocs (d'un pictograma o dels pictogrames d'una seqüència).
  **Torna a l'estil de la seqüència** treu una reassignació. **Restaura** és només per a la
  configuració (tornar una preferència als valors de l'app).

## 2. Principis

1. **Autocontingut.** Tot el que cal per veure i imprimir el document va dins del fitxer.
2. **Un fitxer, una cosa.** Un fitxer és un document o un estil. Ho diuen l'extensió i el camp
   `kind`; mana el camp.
3. **Estil en cascada.** Document → seqüència (o el bloc, si té estil reassignat) → pictograma. Cada
   nivell guarda **només** les diferències amb el nivell superior, i un pictograma **només** els
   retocs que l'usuari li ha fet (solució A).
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
| Estil del document, estil i distribució de cada seqüència, estil reassignat de cada bloc | Del document | `.saac` |
| Retocs d'un pictograma | Del document | `.saac` |
| Pàgina (mida, orientació, direcció, espai entre seqüències) | Del document | `.saac` |
| Pàgines i blocs, la plantilla de cada pàgina | Del document | `.saac`, a `page` (fonament 06, §1.1) |
| Estils amb nom que fa servir el document | Del document | `.saac`, a `styles` (fonament 06, §1.2) |
| Estils de l'app de la Galeria d'estils | De l'app, fixos | Al codi; aplicar-ne un el **copia** al document. Si l'app el canvia, els documents no canvien |
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
  «Pàgina i distribució») o vénen de l'app o d'un fitxer, i es porten al document des de la
  **Galeria d'estils** (l'estil d'una seqüència, a l'edició; el d'un bloc, a la vista). **MAI** hi ha
  una acció que porti res del document cap a les preferències (R10, 2026-11-12). «Fes-lo el meu
  estil», a la galeria, porta un estil **de la galeria**, no del document. Abans n'hi havia tres («Desa com a estil per defecte», «Desa com a
  preferència» i «Aplicar a la vista actual», que anava al revés), i es confonien.

## 4. La cascada d'estil

L'estil i la distribució tenen cascades diferents. Cada nivell és un **retoc** del de sobre.

**L'estil** (com és cada pictograma):

```
document → estil de la seqüència, o el reassignat del bloc → pictograma
```

| Nivell | Què pot portar |
|---|---|
| **Document** | Tot l'estil, **sempre complet**: `pictogram`, `card` i `view`, i el nom (`style.name`). |
| **Estil de la seqüència** | Un estil amb nom (`sequences[].namedStyle` → `styles`): `pictogram` i `card`. Sense, el del document. |
| **Estil reassignat del bloc** | Un estil amb nom (`namedStyle` del bloc → `styles`). **Substitueix** el de la seqüència, no s'hi suma. |
| **Pictograma** | `pictogram` i `card`, **només** els retocs que l'usuari ha fet (solució A). **Mai `view`**. |

**La distribució** (mida, espai, alineació):

| Nivell | Què pot portar |
|---|---|
| **Document** | `view`, sempre complet. |
| **Seqüència** | **Només `view`** (`sequences[].style.view`). És la base de tots els seus blocs. |
| **Bloc** | **Només `view`** (el de seqüència) o l'aspecte del rètol (el de text: lletra, negreta, alineació). |

- **Un bloc de seqüència té un sol estil**: el de la seqüència o el reassignat. **No** té retocs
  d'estil propis (lletra, color, fons): són B39 del backlog, fora d'aquesta versió.
- Els estils amb nom dels documents fets abans del pas 7 poden portar també `view`, que es continua
  pintant; l'app ja no n'hi escriu.
- Un bloc de text agafa la lletra de les targetes del document (`card.font`), la del seu estil amb
  nom si en té, i el seu retoc.
- La distribució d'un bloc (el seu retoc de `view`) **es pinta** i s'edita al nivell «Bloc» de la
  columna de la vista (R5), i en una plantilla la mida hi és un màxim (Q2).
- Un estil amb nom es pinta sencer: la lletra, les vores, la posició del text i el color o la pell
  i el cabell dels pictogrames. Com que un pictograma només guarda els seus retocs, la resta la
  pren de l'estil que li toca, sense còpies. La mida de la targeta es mesura per seqüència **i**
  estil amb nom (`cardMeasureKey`).

### Resoldre

`resolveStyle(doc, sequenceId, pictogramId)` combina els nivells **propietat a propietat**, a
qualsevol profunditat: l'estil del document, l'estil amb nom que toca (el reassignat del bloc si en
té, si no el de la seqüència) i el retoc del pictograma. A cada propietat guanya el nivell més
proper al pictograma.

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
  color) si n'hi ha; si no, el color de la seva categoria a l'estil que li toca (el de la seqüència
  o el reassignat del bloc, i si no en porta, el del document); si no té categoria, el color
  `none` del mateix estil.
- **MAI** una acció d'estil toca la categoria. «Restableix» esborra el retoc de color, i el
  pictograma torna al color de la seva categoria, **sense connexió i a l'instant**.
- El Fitzgerald es comporta com qualsevol altra propietat: «Aplica a tots», aplicar un estil,
  «Restableix», el desfer i l'indicador «personalitzat» el tracten igual que la resta.
- Un color fixat pel **vocabulari personal** és un retoc del pictograma.
- Els colors de l'estil del document són, d'entrada, els de l'app (`data/fitzgeraldColors.ts`, i
  `#666666` per als que no tenen categoria). Van dins del document perquè, si l'app canvia mai la
  taula, els documents desats es continuïn veient igual. **No** hi ha cap interfície per
  editar-los; un estil de l'app de la galeria en pot portar d'altres.
- Els colors es comparen **sense distingir majúscules**, i `#666` és el mateix que `#666666`.

## 5. Accions sobre l'estil

| Acció | On | Efecte |
|---|---|---|
| **Canviar l'estil del document** | Cap lloc de la interfície des de R10 (2026-11-12) | Un document neix amb una **còpia** del meu estil (§7) i és seu. Les seqüències el canvien triant-ne un a la galeria. La regla, per a qui el canvia per codi («Redueix la lletra de tot el document»): canvia i prou; els retocs dels pictogrames es conserven sols, perquè només són retocs. |
| **Tria un estil** per a una **seqüència** | Edició: menú «⋯» de la seqüència («Estil: _nom_ — Canvia…»), que obre la Galeria d'estils | **Copia** l'estil triat al document (`styles`; si n'hi ha un d'igual, el reaprofita) i hi apunta la seqüència (`namedStyle`). Canvien tots els blocs de la seqüència **llevat dels que tenen un estil reassignat**, que es queden el seu. «L'estil del document», la primera opció, treu l'estil de la seqüència. El snackbar diu quants pictogrames conserven els seus retocs, amb **«Treu els retocs»**, i quants blocs no han canviat. Només porta estil, mai distribució ni pàgina. |
| **Tria un estil** per a un **bloc** | Vista: fila «Estil» del nivell «Bloc» de la columna («Canvia…») i «Tria un estil…» al menú «⋯» del bloc; totes dues obren la Galeria d'estils | **Reassigna** l'estil al bloc: el copia a `styles` i hi apunta el bloc. **Només canvia aquell bloc**, encara que la seqüència surti en d'altres (també si el bloc és comú, i el missatge diu que canvia a totes les pàgines). «L'estil de la seqüència», la primera opció, fa el mateix que «Torna a l'estil de la seqüència». El snackbar, com el de la seqüència. |
| **Torna a l'estil de la seqüència** | Vista: fila «Estil» d'un bloc reassignat | Treu la reassignació: el bloc torna a fer servir l'estil de la seqüència. |
| **Carrega d'un fitxer…** | Galeria d'estils | Llegeix un `.saacstyle` (o l'estil d'un `.saac`) i l'aplica a la seqüència o al bloc, com qualsevol altre estil de la galeria. **No es queda** a la galeria. |
| **Desa en un fitxer** | Galeria d'estils, a cada estil | Desa aquell estil en un `.saacstyle`. |
| **Fes-lo el meu estil** | Galeria d'estils, a cada estil que no és el meu | L'estil passa a ser el meu estil (com «Carrega un estil des d'un fitxer» del panell «El meu estil»). No toca el document obert. |
| **Canvia el nom** d'una seqüència | Edició: el nom de la seqüència, editable, i el menú «⋯» | Canvia `sequences[].title`. No s'imprimeix. |
| **Aplica a tots** | Cap lloc de la interfície des de R10: vivia al panell «Estil del document», que ara és «El meu estil». A la columna de la vista, «La mateixa a tots els blocs» del nivell «Pàgina» escriu el mateix retoc a tots els blocs de la pàgina | S'aplicava a **tot el document**: canviava l'estil del document **i esborrava aquestes propietats** de tots els retocs de seqüències i pictogrames. L'acció (`applyToAllPictogramsThunk`) es conserva per si torna; vegeu R10 a `docs/plans/fets/PLA-mode-lliure.md`. |
| **Canviar la distribució d'una seqüència** | Columna de la vista, nivell «Seqüència», amb una seqüència seleccionada en una pàgina simple | Canvia la mida, l'espai o l'alineació d'aquesta seqüència. |
| **Canviar la distribució d'un bloc** | Columna de la vista, nivell «Bloc», amb un bloc seleccionat en una pàgina en blocs | Desa al bloc **només** el que es diferencia de la distribució de la seqüència (amb la de l'estil amb nom, als documents d'abans que en porten). Les altres còpies de la seqüència no canvien. |
| **Canviar un pictograma** | Formulari del pictograma | Canvia **només** el `style` d'aquell pictograma, i **només** les propietats tocades. |
| **Restableix** un pictograma | Formulari del pictograma (capçalera de «Estil del pictograma» o «Més accions»); menú contextual de la graella («Restableix l'estil») | Esborra el seu `style`. La categoria, que és contingut, es queda. Dins del formulari és una edició més i es desa en tancar-lo; des del menú contextual s'aplica al document al moment. |
| **Restableix els pictogrames d'aquesta seqüència** | Menú «⋯» de la seqüència a l'edició i menú «⋯» d'un bloc de seqüència a la vista (B35) | Com «Restableix» a tots els pictogrames de la seqüència: se n'esborren els retocs i la categoria es queda. Els retocs són de la seqüència, així que canvien **tots els blocs on surt**, i el missatge ho diu. |
| **Canviar el meu estil** i la distribució per defecte | Configuració, panell «El meu estil» (l'estil) i panell «Pàgina i distribució» (la pàgina i la distribució dels pictogrames amb què comencen els documents nous) | Canvia la preferència. Es desa en tancar la configuració. **No toca cap document**, tampoc el que s'està fent (§7). |
| **Carrega un estil des d'un fitxer** | Panell «El meu estil» | L'estil del fitxer (un `.saacstyle`, o el d'un `.saac`) passa a ser el meu estil. Obrir un `.saacstyle` des del menú pregunta si es fa el meu estil. Cap dels dos camins toca el document obert. |
| **Desa el meu estil en un fitxer** | Panell «El meu estil» | Desa el meu estil en un `.saacstyle`. |
| **Redueix la lletra de tot el document** | Avís «el text no hi cap» de la graella (§6) | Com canviar l'estil del document, només amb la mida de la lletra: totes les targetes continuen amb la mateixa mida. Els retocs es conserven. |
| **Redueix la lletra d'aquest pictograma** | Avís «el text no hi cap» de la graella (§6) | Com canviar un pictograma: un retoc de la mida de la lletra, que l'encén com a personalitzat. |

- **Ja no hi són** (pla dels estils, E5): «Aplica el meu estil», «Actualitza amb el meu estil» i
  «Treu l'estil de bloc». L'estil per grup (B31, R7) és ara **l'estil de la seqüència**: canviar-lo
  canvia tots els seus blocs, i no hi ha grups invisibles entre blocs de seqüències diferents.
- **Al document no hi ha cap editor d'estils**: un estil es fa al panell «El meu estil» (o ve de
  l'app o d'un fitxer) i es porta al document des de la galeria (direcció única).
- **Sense confirmació**: triar un estil es desfà amb el desfer de sempre.
- **SEMPRE** «Tria un estil» (seqüència i bloc), «Torna a l'estil de la seqüència», «Treu els
  retocs», «Restableix», «Restableix els pictogrames d'aquesta seqüència» i
  les dues reduccions de lletra de l'avís «el text no hi cap» es poden desfer amb el **desfer que ja existeix**: un snackbar amb «Desfés» que torna el document
  exactament a com era, mentre no s'hagi tocat des d'aleshores. Dins del formulari del pictograma,
  el «Desfés» de «Restableix» torna l'estil d'abans **al formulari**, sense tocar les altres
  edicions que s'hi hagin fet.
- L'historial complet de desfer i refer per a totes les accions **no** forma part d'aquesta
  versió: és **B30** a `docs/BACKLOG-ux.md`.
- **SEMPRE** una acció acaba amb un missatge (`docs/estandards/feedback-i-accions.md`).

## 6. L'indicador «personalitzat»

Un pictograma amb retocs propis (un `style` no buit) ho ha de dir. Serveix perquè s'entengui per què
una targeta no ha canviat en triar un altre estil. Amb la solució A, «personalitzat» vol dir **té
retocs**: no es compara amb cap estil, i canviar el meu estil o l'estil de la seqüència no encén ni
apaga cap marca. Un color del vocabulari personal és un retoc, i la marca ho diu («color del teu
vocabulari», al tooltip i al nom accessible).

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

**A la seqüència i al bloc** (on es diu el nom de l'estil):

- On la interfície diu l'estil d'una seqüència (el «⋯» de la seqüència a l'edició) o d'un bloc (la
  fila «Estil» de la columna), si **algun pictograma** de la seqüència és personalitzat, en lloc del
  nom de l'estil surt **«Personalitzat»**, amb la **mateixa marca** que la targeta: un sol símbol per
  a la mateixa cosa.
- Al costat, una **ajuda** (icona amb tooltip, i el mateix text al nom accessible) que diu quin és
  l'estil de base i quants pictogrames tenen retocs. La marca és informativa; les accions són a
  prop: «Restableix els pictogrames d'aquesta seqüència» al «⋯».
- **Un bloc reassignat** porta, a la fila «Estil», una **marca de reassignat**, diferent de la de
  «Personalitzat» (una altra forma, no només un altre color), i el botó **«Torna a l'estil de la
  seqüència»**. Totes dues marques poden sortir alhora.
- L'edició **no** avisa dels blocs reassignats: la marca és al bloc, que és on es va fer.
- Com la marca de la targeta, **MAI** a la impressió, la pantalla completa ni el PDF. Al mòbil, la
  fila és al panell de baix de la vista.

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

- Un document nou neix amb una **còpia** del meu estil (amb el nom «El meu estil», `style.name`) i
  amb la **pàgina per defecte** de l'usuari.
- **L'estil no el segueix mai** (pla dels estils, D1): canviar el meu estil no toca el document
  que s'està fent, desat o no. Per portar-hi el meu estil nou, es tria a la galeria.
- **La pàgina**, mentre no es desa, **hereta** la pàgina per defecte en viu: si les preferències del
  compte arriben tard, el document nou se les emporta igualment. En desar-lo, s'hi **escriu**, i a
  partir d'aleshores és seva.
- **La disposició** (pas 7b): la primera pàgina d'un document nou neix amb la de les preferències
  («Pàgina i distribució»: simple, columnes, files o lliure), i la segueix en viu **mentre el
  document és buit** (una sola seqüència, sense pictogrames ni estils de bloc, i sense pàgina
  pròpia). Amb feina, ja no canvia mai sola. Les pàgines que s'hi afegeixen («Afegeix una pàgina»)
  també neixen amb la disposició de les preferències, a qualsevol document. Donar la disposició a
  un document buit no el marca com a canviat.

## 8. Per què

- **Previsibilitat.** Qui prepara un document (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) el veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** Canviar l'estil d'un document obert és una decisió de qui
  l'obre, explícita i reversible.
- **Excepcions mínimes.** Guardar només les diferències fa que «Aplica a tots» i «Restableix»
  siguin evidents, i que el fitxer sigui petit.
