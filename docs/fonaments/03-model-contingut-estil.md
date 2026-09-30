# Fonament: model de contingut i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui estils**
> a un document: el `.saac` i el `.saacstyle`, el desat al núvol, `documentSlice`,
> `uiSlice.defaultSettings` i `ui.viewSettings`, la targeta del pictograma, el PDF, la columna de la
> pàgina de vista i el panell «Estil del document».
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
| **Estil** | Com es veu: lletra, vores, colors, mides, alineació. |
| **Estil del document** | L'estil que s'aplica a totes les seqüències del document. |
| **Vista d'aquesta seqüència** | Els ajustos d'estil d'una sola seqüència (mida, espai, alineació). Són un retoc sobre l'estil del document. |
| **Pàgina** | Mida, orientació, direcció, espai entre seqüències i disposició. |
| **Fitxer d'estil** | Un estil desat per reutilitzar-lo en altres documents: el fitxer `.saacstyle`. |
| **Estil per defecte** | L'estil que reben els documents nous. És una preferència de l'app. |
| **Preferències de l'app** | El que és de la persona o del dispositiu: idioma, tema clar o fosc, estil per defecte, pàgina per defecte. |

- **MAI** «seqüència» per dir el fitxer sencer.
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
| Estil per defecte | De l'usuari | Preferències; es pot exportar a `.saacstyle` |
| Pàgina per defecte dels documents nous | De l'usuari | Preferències |
| Idioma, tema clar o fosc | De l'usuari | Preferències |
| Seqüència activa en obrir | Del document, però **no** és aparença | `.saac`, a `ui` |

- **SEMPRE** el document es desa amb el seu estil i la seva pàgina. No hi ha cap manera de desar
  un document sense.
- **SEMPRE** el document s'obre tal com es va desar. Les preferències d'interfície de qui l'obre
  (idioma, tema) s'hi apliquen igualment, perquè no canvien el que surt al paper.
- **MAI** el zoom, el contrast o el moviment reduït són ajustos de l'app: els decideixen el
  navegador i el sistema, i l'app els respecta.

## 4. La cascada d'estil

L'estil té tres nivells. Cada nivell és un **retoc** del de sobre.

| Nivell | Què pot portar |
|---|---|
| **Document** | Tot l'estil, **sempre complet**: `pictogram`, `card` i `view`. |
| **Seqüència** | **Només `view`**: mida, espai entre pictogrames, alineació. |
| **Pictograma** | `pictogram` i `card`. **Mai `view`**. |

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
| **Canviar l'estil del document** | Panell «Estil del document» | Canvia l'estil del document. El que coincidia amb l'estil vell segueix el nou; els retocs es conserven. |
| **Aplica a tots** | Panell «Estil del document»; columna de la vista | S'aplica a **tot el document**: canvia l'estil del document **i esborra aquestes propietats** de tots els retocs de seqüències i pictogrames. |
| **Canviar la vista d'una seqüència** | Columna de la vista, sense «Aplicar a totes» | Canvia la mida, l'espai o l'alineació d'aquesta seqüència. És l'únic estil que té una seqüència en aquesta versió. |
| **Canviar un pictograma** | Formulari del pictograma | Canvia **només** el `style` d'aquell pictograma, i **només** les propietats tocades. |
| **Restableix** un pictograma | Formulari del pictograma (franja «Personalitzat» o «Més accions»); menú contextual de la graella («Restableix l'estil») | Esborra el seu `style`. La categoria, que és contingut, es queda. Dins del formulari és una edició més i es desa en tancar-lo; des del menú contextual s'aplica al document al moment. |
| **Aplica el meu estil per defecte** | Panell «Estil del document»; columna de la vista | Com canviar l'estil del document, amb l'estil per defecte de l'usuari. |
| **Carrega un estil des d'un fitxer** | Panell «Estil del document» | Com canviar l'estil del document, amb l'estil del fitxer. Pregunta si es conserven els retocs; la resposta per defecte és que sí. |

- **Estil per seqüència**: en aquesta versió, una seqüència **només** té estil de vista (mida,
  espai, alineació), que es configura per seqüència a la columna de la vista. No hi ha cap acció per
  canviar la lletra o les vores de tots els pictogrames d'una seqüència: és una idea oberta, **B31**
  a `docs/BACKLOG-ux.md`.
- **SEMPRE** «Aplica a tots», «Restableix», «Aplica el meu estil per defecte» i «Carrega un estil»
  es poden desfer amb el **desfer que ja existeix**: un snackbar amb «Desfés» que torna el document
  exactament a com era, mentre no s'hagi tocat des d'aleshores. Dins del formulari del pictograma,
  el «Desfés» de «Restableix» torna l'estil d'abans **al formulari**, sense tocar les altres
  edicions que s'hi hagin fet.
- L'historial complet de desfer i refer per a totes les accions **no** forma part d'aquesta
  versió: és **B30** a `docs/BACKLOG-ux.md`.
- **SEMPRE** una acció acaba amb un missatge (`docs/estandards/feedback-i-accions.md`).

## 6. L'indicador «personalitzat»

Un pictograma amb retocs propis (un `style` no buit) ho ha de dir. Serveix perquè s'entengui per què
una targeta no ha canviat amb «Aplica a tots».

**Al formulari d'edició** (una franja a sobre de la configuració):

- El modal és el de sempre: la previsualització i la cerca a dalt, la configuració a sota. La
  capçalera de la configuració **no canvia mai**: la icona al mig i el nom accessible
  «Configuració».
- Amb retocs, a sobre de la configuració hi ha una **franja** enganxada, amb el mateix fons i la
  mateixa vora: la franja té les cantonades de dalt arrodonides i la configuració les perd, i tots
  dos fan un sol bloc. A l'esquerra, «Personalitzat»; a la dreta, el botó **Restableix**.
- **MAI** un botó dins d'un altre: la franja i la configuració són germanes. L'ordre del focus és
  Restableix i després la capçalera, que porta `aria-describedby` cap al text «Personalitzat».
- En prémer Restableix, la franja desapareix, surt el snackbar «Estil restablert» amb Desfés, i el
  focus va a la capçalera.
- Quan la franja apareix o desapareix, el que s'està editant a sota **no es mou** sota el dit ni el
  ratolí: es compensa el desplaçament amb l'alçada de la franja. Sense animació.
- Quan la previsualització surt de la vista per dalt, se'n veu una **còpia compacta** fixa a dalt de
  la zona que es desplaça (com a molt, el 30 % de l'alçada o 200 px); quan l'original torna a la
  vista, la còpia desapareix. La còpia és només per a la vista (`aria-hidden`, `inert`). Entra
  lliscant des de dalt (320 ms) i torna amunt en marxar (220 ms), perquè no aparegui de cop; amb
  moviment reduït, apareix i desapareix sense moviment. L'original no es mou del seu lloc.

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

- **SEMPRE** objectius tàctils de 44 × 44 px com a mínim al mòbil (la marca no n'és cap).

## 7. Documents nous

- Un document nou neix amb l'**estil per defecte** i la **pàgina per defecte** de l'usuari.
- Mentre no es desa, **hereta** l'estil per defecte en viu: si les preferències del compte arriben
  tard, el document nou se les emporta igualment.
- En desar-lo, l'estil i la pàgina s'hi **escriuen**, i a partir d'aleshores són seus.

## 8. Per què

- **Previsibilitat.** Qui prepara un document (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) el veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** Canviar l'estil d'un document obert és una decisió de qui
  l'obre, explícita i reversible.
- **Excepcions mínimes.** Guardar només les diferències fa que «Aplica a tots» i «Restableix»
  siguin evidents, i que el fitxer sigui petit.
