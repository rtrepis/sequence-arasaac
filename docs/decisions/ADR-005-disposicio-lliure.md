# ADR-005: Disposició lliure: pàgines i col·locacions

- **Estat**: acceptada (2026-11-06). Fase 1 del pla (`docs/PLA-mode-lliure.md`): el model, la
  lectura i l'escriptura del fitxer i les funcions de disposició. Encara sense interfície.
- **Substitueix**: la decisió 7 de l'ADR-003 («les unitats són mil·límetres només a `frame`, i
  `frame` només es reserva per al mode lliure»).
- **Fonaments**: `docs/fonaments/03-model-contingut-estil.md` (vocabulari) i
  `docs/fonaments/06-compatibilitat-i-dades.md`, §1.1 (el format). Esquema:
  `docs/schema/saac-v3.schema.json`.

## Context

El mode lliure de pàgina (encàrrec a `docs/spec-mode-lliure.md`, branca `feature/mode-lliure`)
deixa posar les seqüències on es vulgui, en una o més pàgines, en comptes que es col·loquin soles
una darrere l'altra.

El format v3 li reservava lloc amb `sequences[].frame { x, y, w, h, z }`: **un sol** rectangle per
seqüència. Les decisions de producte del pla ho fan insuficient:

- Un document té **diverses pàgines**, i el `frame` no deia a quina.
- **La mateixa seqüència ha de poder sortir a diverses pàgines.** Sovint un document té una part
  igual a cada pàgina (una capçalera, un «Avui és…»), i també es vol poder imprimir-ne còpies per
  retallar. Amb un rectangle per seqüència, això obligaria a duplicar la seqüència, i llavors
  canviar-ne un pictograma ja no la canviaria a totes les pàgines.

Cap versió de l'app no ha escrit mai `frame`: canviar-lo no trenca cap fitxer.

## Decisió

1. **La disposició és de la pàgina, i va dins de `page`.** Amb `layout: "free"`, `page` porta
   `sheets` (les pàgines, en ordre) i `common` (el que surt a totes).
2. **Una col·locació apunta a la seqüència**: `{ id, sequence, x, y, w, h, columns }`. Una
   seqüència pot tenir zero, una o moltes col·locacions, a pàgines diferents o a la mateixa. El
   contingut i la vista de la seqüència són compartits; la caixa i les columnes, de cada
   col·locació.
3. **Comunes**: una col·locació de `common` surt a totes les pàgines al mateix lloc, i es mou a
   totes alhora. És el cas de la capçalera.
4. **Mil·límetres només a les col·locacions**, des del cantó superior esquerre del full (el paper
   menys el marge d'impressió). Els 12 mm de baix són del peu de llicència i es reserven sempre,
   perquè la posició d'una caixa no depengui d'una preferència.
5. **`sequences[].frame` deixa d'estar reservat.** Es treu de l'esquema i del fonament; si un
   fitxer en porta, és un camp desconegut.
6. **`schemaVersion` no puja.** `sheets` i `common` són camps nous de `page`, i les versions
   anteriors conserven els camps desconeguts de `page` (`saacExtra.page`, comprovat al codi de la
   2.4.2). Una versió anterior obre el document en flux —es veu diferent, però no perd res— i, si el
   torna a desar, la disposició lliure hi continua.
7. **A Redux**, `layout.mode` (`"free"`; sense valor, flux) i `freeLayout` (`sheets` i `common`),
   on cada col·locació apunta a la clau numèrica de `content`. `parse` i `serialize` en fan la
   conversió a la frontera, com amb la resta (ADR-003, decisió 10). Les claus no es reindexen mai:
   `documentSlice` només deixa esborrar l'última seqüència.
8. **En flux, la disposició lliure es conserva a l'app però no s'escriu.** Tornar a «Lliure» la
   recupera; desar en flux escriu un fitxer de flux.
9. **La mida del pictograma la mana la caixa.** Com que la targeta és proporcional a `sizePict`,
   la graella es calcula a partir de la targeta a mida 1 (`computeGrid`): la mida més gran que hi
   cap i, si n'hi ha dues d'iguals, la de menys files.
10. **El model és fet de funcions pures** a `apps/web/src/features/free-layout/model/`, sense marc
    d'accions ni gestor de teclat propis. L'encàrrec els demanava per poder personalitzar dreceres
    més endavant, i ell mateix diu que això no es fa ara.

## Alternatives descartades

| Alternativa | Per què no |
|---|---|
| `sequences[].frame` amb un camp `page` | Un sol lloc per seqüència: no es pot repetir una seqüència sense duplicar-la, i duplicar-la trenca «canvio un pictograma i canvia a totes les pàgines» |
| Duplicar la seqüència per repetir-la | El mateix: dues seqüències que s'han de mantenir iguals a mà |
| Una llista de pàgines on s'amaga cada comuna (per exemple, la portada) | Fora d'aquesta versió (D8 del pla). Es pot afegir després a la col·locació sense canviar la resta |
| Desar la plantilla de cada pàgina | La plantilla és una manera de calcular caixes; el que es desa són les caixes. Desar-la obligaria a decidir què passa quan una caixa es retoca a mà |
| Coordenades en fraccions del full en lloc de mm | Canviar de paper canviaria la mida de les caixes en mm, i la impressió deixaria de ser previsible. El fonament ja diu mm |
| Pujar `schemaVersion` a 4 | No cal: el canvi és compatible (decisió 6), i una versió nova obligaria tots els fitxers en flux a passar per una migració que no els canvia res |
| Registre d'accions, mapa de dreceres i `KeyboardManager` propis (encàrrec, §6) | Sense ús ara; l'app ja té Redux i un sistema d'avisos (`useFeedback`) |

## Conseqüències

- **Fixture 16** (`16-mode-lliure.saac`): dues pàgines, una comuna, una seqüència repetida a dues
  pàgines, una caixa amb columnes fixes i camps desconeguts en un full i en una col·locació. Les
  01–15 no canvien.
- **El núvol perd la disposició** fins que els validadors de l'API la coneguin
  (`apps/api/src/modules/documents/validators.ts`, P1 punt 5 a `docs/BACKLOG-ux.md`). És la fase 5
  del pla; ara els comptes estan apagats.
- **L'esborrany d'IndexedDB** desa el document de Redux, i per tant la disposició hi viatja.
- **Esborrar una seqüència** n'ha d'esborrar totes les col·locacions (`removeSequencePlacements`).
  En desar, una col·locació d'una seqüència que ja no hi és no s'escriu.
- **La pantalla completa** (`size: "FULLSCREEN"`) no té mil·límetres i no admet el mode lliure
  (`sheetAreaMm` en retorna `null`).
