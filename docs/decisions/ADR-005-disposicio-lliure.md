# ADR-005: Pàgines i blocs

- **Estat**: acceptada (2026-11-06), **revisada** (2026-11-07, i ampliada el 2026-11-08 amb el
  mode de cada pàgina a la interfície: vegeu les decisions 16–19) amb la revisió de la fase 3 del pla
  (`docs/PLA-mode-lliure.md`, §12): un sol model de pàgines (R1), la plantilla desada amb la pàgina
  (R2), els blocs de text (R9) i els estils amb nom del catàleg (R10). La versió primera es resumeix
  a «Història».
- **Substitueix**: la decisió 7 de l'ADR-003 («les unitats són mil·límetres només a `frame`, i
  `frame` només es reserva per al mode lliure»).
- **Fonaments**: `docs/fonaments/03-model-contingut-estil.md` (vocabulari i cascada) i
  `docs/fonaments/06-compatibilitat-i-dades.md`, §1.1 (el format). Esquema:
  `docs/schema/saac-v3.schema.json`. Fixtures: `16-mode-lliure.saac` (fases 1–3) i
  `17-pagines-i-blocs.saac` (aquest model).

## Context

La primera versió d'aquesta ADR tenia dos modes de document: el flux de sempre (una sola pàgina,
totes les seqüències) i el mode lliure (`page.layout: "free"`), amb fulls i col·locacions. Provar la
fase 3 va fer veure que no n'hi ha prou:

- **R1**: la disposició automàtica també ha de tenir diverses pàgines, i s'hi han de poder posar i
  treure seqüències. Dos modes de document no ho poden dir: el que canvia és com es col·loquen els
  blocs **dins de cada pàgina**.
- **R2**: la plantilla no es desava («el que es desa són les caixes»), i afegir una seqüència a una
  pàgina en triava una altra pel nombre de caixes. La pàgina ha de recordar la seva plantilla.
- **R9**: l'estudi dels treballs amb pictogrames (`docs/ESTUDI-treballs-amb-pictogrames.md`) demana
  **rètols**: un text sol, sense pictograma («Primer», «Després», «Avui és…»).
- **Q2**: cada bloc té els seus ajustos (mida com a màxim, espai, alineació, columnes).
- **R10**: l'usuari tindrà un catàleg d'estils, i el que se n'aplica a un document hi ha d'anar
  inclòs: el document ha de continuar sent autocontingut.
- **Compatibilitat**: el lector de les fases 1–3 descartava una col·locació que no entenia. Un tipus
  de bloc nou d'una versió futura s'hauria perdut en tornar a desar.

## Decisió

1. **Un sol model: el document és una llista de pàgines.** `page.sheets` les porta en ordre, i
   cadascuna diu com es col·loquen els seus blocs (`mode`):
   - `"auto"`: un darrere l'altre, com el flux de sempre, amb la seva `direction` (sense valor, la de
     `page.direction`) i l'espai entre blocs (`page.sequenceGap`). Sense caixes.
   - `"template"`: cada bloc a la seva caixa, en mil·límetres.
2. **Un document sense `sheets` és una sola pàgina automàtica amb totes les seqüències, en ordre.**
   És el de sempre, i el de tots els documents d'abans: no se n'escriu cap, i el fitxer és idèntic al
   que es desava fins ara.
3. **La plantilla es desa amb la pàgina** (`sheets[].template`, R2), i cada bloc diu quin espai
   ocupa (`slot`). Afegir un bloc a una pàgina amb plantilla omple el primer espai lliure, sense
   moure els que hi eren; només si no n'hi ha cap (o la pàgina no té cap plantilla que l'app
   conegui) la pàgina es torna a repartir amb una de més gran, que passa a ser la seva. Una pàgina
   automàtica també recorda la plantilla: amb els espais, les caixes es poden tornar a calcular.
4. **Blocs.** Una pàgina té una llista de blocs (`blocks`), i `common` els que surten a totes les
   pàgines al mateix lloc (sempre amb caixa). Cada bloc diu de quin tipus és (`kind`):
   - `"sequence"`: una seqüència posada a la pàgina (`sequence`, l'`id`), amb `columns` i un retoc
     de la vista (`view`). La mateixa seqüència pot tenir molts blocs, a pàgines diferents o a la
     mateixa: el contingut és un de sol.
   - `"text"`: un rètol (`text`, amb `\n` entre línies) i un retoc del seu aspecte (`textStyle`:
     lletra, negreta, alineació horitzontal i vertical). Per defecte, la lletra de les targetes del
     document, centrat i sense negreta. És contingut: no es tradueix.
   - Una pàgina automàtica també pot portar blocs de text: ocupen una línia sencera del flux.
5. **El lector conserva els blocs que no entén.** Un bloc d'un `kind` que l'app no coneix (o sense
   `kind` ni `sequence`) es conserva tal com és i es torna a escriure al seu lloc. Només es descarta
   el que l'app entén però està trencat: un bloc de seqüència que apunta a una seqüència que no hi
   és, o un bloc sense caixa de veritat on n'hi cal una.
6. **Estils amb nom** (`styles`, a l'arrel del document). Són retocs de l'estil del document, amb la
   forma dels retocs (`pictogram`, `card`, `view`), un `id` i un nom. Un bloc en fa servir un amb
   `namedStyle`. Aplicar una entrada del catàleg de l'usuari (R10) la **copia** a `styles`: el
   document continua sent autocontingut i no apunta mai a les preferències de ningú (fonament 03,
   principis 1 i 4). Canviar un estil amb nom del document canvia tots els blocs que el fan servir:
   és l'«estil per grup» de R7.
7. **La cascada** passa a ser: **document → seqüència → estil amb nom del bloc → bloc → pictograma**.
   Cada nivell només porta el que canvia, i en desar el retoc del bloc es compara amb la vista de la
   seqüència retocada per l'estil amb nom. La vista de la seqüència (`sequences[].style.view`) es
   continua escrivint com a base dels seus blocs: així els documents d'abans no es migren i les
   versions anteriors pinten bé les mides.
8. **L'orientació i el paper continuen sent del document** (P2 de l'esbós): barrejar orientacions
   complicaria la impressió. Una plantilla podrà dir «Millor apaïsat».
9. **La mida del pictograma és un màxim** (Q2): el bloc mana, però els pictogrames no passen de la
   mida triada. Substitueix la decisió 9 de la primera versió («la mida la mana la caixa»). La
   graella es continua calculant a partir de la targeta a mida 1 (`computeGrid`).
10. **`schemaVersion` no puja.** Tot és nou dins de `page` o a l'arrel, i les versions anteriors
    conserven els camps desconeguts de `page` i de l'arrel (`saacExtra`, comprovat al codi de la
    2.4.2). Una versió anterior obre el document com a una sola pàgina automàtica amb totes les
    seqüències i sense els rètols: es veu diferent, però no perd res, i si el torna a desar les
    pàgines hi continuen. Per això les pàgines **es llegeixen sempre que hi siguin**, digui el que
    digui `layout` (la 2.4.2 hi escriu `"flow"`).
11. **`page.layout` queda obsolet**: s'escriu sempre `"flow"`, perquè les versions anteriors el
    llegeixen. `"free"` només el porten els fitxers de les fases 1–3.
12. **Migració en llegir** (cap fitxer es modifica): els fulls de les fases 1–3 (`placements`, sense
    `mode`) són pàgines amb caixes sense plantilla, i les seves col·locacions, blocs de seqüència. Un
    full sense `mode` o amb un que l'app no coneix té caixes si algun bloc que l'app entén en té, i
    si no és automàtic.
13. **A Redux**, `DocumentSAAC.pages` (`sheets` i `common`) i `DocumentSAAC.styles`. Cada bloc de
    seqüència apunta a la clau numèrica de `content`; un bloc desconegut és `kind: "unknown"` amb el
    bloc original a `raw`. Tots els blocs que l'app entén tenen caixa a Redux: en una pàgina
    automàtica és zero (o la que tenia abans de passar a automàtica) i no s'escriu. `parse` i
    `serialize` en fan la conversió a la frontera (ADR-003, decisió 10). Sense `pages`, el document
    és la pàgina automàtica implícita de la decisió 2.
14. **Una seqüència nova** (creada a l'edició) va al final de l'última pàgina si és automàtica; si
    té plantilla, queda sense col·locar.
15. **El model és fet de funcions pures** a `apps/web/src/features/free-layout/model/`, sense marc
    d'accions ni gestor de teclat propis.

16. **A la interfície, «Contínua» i «En blocs»** (2026-11-08): `"auto"` és la pàgina **contínua**,
    la de sempre (direcció i espai entre seqüències), i `"template"` la pàgina **en blocs**,
    repartida en **N columnes**, **N files** o amb una **plantilla**. Cada pàgina tria al nivell
    «Pàgina» de la columna de la vista; el selector «Disposició» del document, que era el pont,
    desapareix. Una pàgina nova és contínua.
17. **«N columnes» i «N files» creixen amb els blocs**: `columns-N` són N columnes i les files que
    calguin (i `rows-N` al revés). Amb tants blocs com N o menys, és la pila de sempre. En afegir-hi
    un bloc sense espai lliure, la graella creix i l'`id` no canvia; les altres plantilles, com
    abans, passen a una de més gran (decisió 3).
18. **L'espai entre seqüències és de cada pàgina contínua** (`sheets[].sequenceGap`; sense valor, el
    de `page.sequenceGap`), com ja ho era la direcció. **El peu de llicència va a totes les
    pàgines o només a l'última** (`page.licenceOn: "last"`; sense valor, a totes). Tots dos són
    opcionals: les versions anteriors els conserven com a camps desconeguts.
19. **Les columnes de dins d'un bloc** (`columns`) només es trien a les pàgines en blocs. En
    `"auto"`, les decideix el repartiment de la pàgina (`resolveColumns`): **una** en una pàgina
    «en columnes», **una sola fila** en una «en files» i les que fan els pictogrames més grans amb
    una plantilla. Un bloc comú no segueix el repartiment de cap pàgina. Un document sense pàgines (`sheets`) continua sent la
    pàgina contínua de sempre; afegir-hi una pàgina o passar-la a blocs el fa explícit
    (`explicitPages`).

## Alternatives descartades

| Alternativa | Per què no |
|---|---|
| Dos modes de document (`page.layout: "flow" / "free"`, la primera versió) | La disposició automàtica també ha de tenir pàgines (R1). El que canvia és cada pàgina, no el document |
| Desar només les caixes, no la plantilla (la primera versió) | Afegir un bloc no sabia quina plantilla tenia la pàgina i en triava una altra (R2) |
| El rètol com a part d'un bloc de seqüència | No serviria per a un títol de pàgina ni per a una frase sola. Un bloc de text és un bloc com els altres: es copia, es posa a totes les pàgines i surt a les plantilles |
| Els ajustos de vista només al bloc (sense la vista de la seqüència) | Obligava a migrar tots els documents, i la 2.4.2 hauria perdut les mides. Amb la cascada, la seqüència és la base i el bloc només porta el que canvia |
| Els ajustos de vista només a la seqüència | Contradiu Q2: una seqüència repetida ha de poder sortir diferent a cada bloc |
| Copiar els valors de l'estil del catàleg a cada bloc, sense nom | No hi hauria cap grup per canviar de cop (R7), i el mateix estil quedaria repetit a cada bloc |
| Que el bloc apunti a l'entrada del catàleg de l'usuari | El document deixaria de ser autocontingut i dependria de les preferències de qui l'obre (fonament 03, principi 4) |
| Pujar `schemaVersion` a 4 | Tot és compatible (decisió 10). Una versió nova faria sortir el bàner «versió més nova» a cada document a les versions anteriors, també als que no fan servir pàgines |
| Deixar d'escriure `page.layout` | Els fitxers v3 d'abans el porten, i tornar-los a desar ha de donar el mateix fitxer |
| Llegir les pàgines només amb `layout: "free"` | Una versió anterior que obre el document i el desa hi escriu `"flow"`: les pàgines s'haurien perdut |
| Descartar els blocs que no s'entenen (fases 1–3) | Una versió futura amb un altre tipus de bloc perdria feina en passar per aquesta |
| Coordenades en fraccions del full en lloc de mm | Canviar de paper canviaria la mida de les caixes en mm, i la impressió deixaria de ser previsible |
| Registre d'accions, mapa de dreceres i `KeyboardManager` propis (encàrrec, §6) | Sense ús ara; l'app ja té Redux i un sistema d'avisos (`useFeedback`) |

## Conseqüències

- **Fixtures**: la `16-mode-lliure.saac` (fases 1–3) no canvia i prova la migració; la
  `17-pagines-i-blocs.saac` té una pàgina amb plantilla, una d'automàtica amb un rètol i un bloc
  d'un tipus desconegut, una de retocada sense plantilla, un comú, un estil amb nom i una seqüència
  sense col·locar, i obrir-la i tornar-la a desar en dona el mateix fitxer. Les 01–15 no canvien.
- **El pont s'ha acabat** (2026-11-08): cada pàgina tria contínua o en blocs (decisió 16), i la
  vista pinta cada pàgina contínua amb els seus blocs, un darrere l'altre. Els blocs comuns només
  es pinten a les pàgines en blocs. Des de R5,
  el retoc de la vista d'un bloc, la part de `view` dels estils amb nom i la mida com a màxim (Q2)
  es pinten i el retoc s'edita al nivell «Bloc» de la columna; els rètols i la lletra i les vores
  dels estils amb nom són al model però encara no es pinten.
- **El núvol perd les pàgines** fins que els validadors de l'API les coneguin
  (`apps/api/src/modules/documents/validators.ts`, P1 punt 5 a `docs/BACKLOG-ux.md`). És la fase 5
  del pla; ara els comptes estan apagats.
- **L'esborrany d'IndexedDB** desa el document de Redux, i per tant les pàgines hi viatgen. Un
  esborrany d'una build de les fases 1–3 (`freeLayout`, `layout.mode`) obre en flux: el mode lliure
  no s'ha publicat mai.
- **Esborrar una seqüència** n'esborra tots els blocs (`removeSequencePlacements`); els de text i
  els desconeguts es queden.
- **La pantalla completa** (`size: "FULLSCREEN"`) no té mil·límetres i no admet pàgines amb caixes
  (`sheetAreaMm` en retorna `null`).
- **El desfer és l'únic de l'app, ampliat**: la instantània de `styleSlice` guarda també les
  pàgines.

## Història

- **2026-11-06** (fases 1–3): `page.layout: "free"` amb `sheets[].placements` i `common`;
  col·locacions `{ id, sequence, x, y, w, h, columns }`; la plantilla no es desava; la mida la manava
  la caixa; en flux, la disposició lliure es conservava a l'app però no s'escrivia. Cap versió
  publicada no va escriure aquest format.
