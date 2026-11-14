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

16. **A la interfície, «Contínua» (des de la decisió 23, «Simple») i «En blocs»** (2026-11-08): `"auto"` és la pàgina **contínua**,
    la de sempre (direcció i espai entre seqüències), i `"template"` la pàgina **en blocs**,
    repartida en **N columnes**, **N files** o amb una **plantilla**. Cada pàgina tria al nivell
    «Pàgina» de la columna de la vista; el selector «Disposició» del document, que era el pont,
    desapareix. Una pàgina nova és contínua.
17. **«N columnes» i «N files» creixen amb els blocs**: `columns-N` són N columnes i les files que
    calguin (i `rows-N` al revés). Amb tants blocs com N o menys, és la pila de sempre. En afegir-hi
    un bloc sense espai lliure, la graella creix i l'`id` no canvia; les altres plantilles, com
    abans, passen a una de més gran (decisió 3). La plantilla que l'app tria sola (`templateFor`:
    en passar una pàgina a blocs o quan una plantilla amb forma s'omple) és **tantes files o
    columnes com blocs**, en el sentit de la pàgina contínua; amb una sola caixa, `rows-1` o
    `columns-1` (`full` només és la de «Pàgina sencera» del selector).
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
20. **Plantilles dels treballs reals, amb espais de rètol** (R3, R4; 2026-11-08). El selector
    «Amb una plantilla» ofereix les plantilles de l'estudi (`agenda-strip`, `today-agenda`,
    `first-then`, `week`, `token-board`, `story-page`, `menu`), cadascuna amb el nom del treball i
    una miniatura. Un espai pot ser de **rètol** (`kind: "text"`): les seqüències només van als
    espais de seqüència, els rètols als seus i, si en sobren, als de seqüència que quedin; en una
    plantilla sense espais de rètol, un rètol ocupa un espai com qualsevol bloc. **Aplicar una
    plantilla des de la columna estrena un rètol a cada espai de rètol buit**, amb el text de
    l'espai («Primer», «Dilluns»…) a l'idioma de la interfície, en negreta i a mida 1,25; un cop
    creat, és contingut i no es tradueix. **Totes les plantilles es poden triar**: si en una no hi
    caben tots els blocs, abans d'aplicar-la es diu quins sortiran de la pàgina (`ConfirmDialog`);
    la seqüència continua al document. En passar a «Amb una plantilla», la pàgina pren **la que
    s'hi ajusta més** (la que té menys espais de seqüència on hi caben totes), perquè no n'estreni
    més espais ni rètols dels que calen. `grid-2x2` i `strip-top` ja no s'ofereixen, però es continuen llegint. Els `id`
    nous són d'un camp de text lliure: el format no canvia.
21. **Moure i canviar la mida, damunt d'una quadrícula de punts** (fase 4, 2026-11-08). A
    qualsevol pàgina en blocs, el bloc seleccionat s'arrossega (moure) o se'n tiben les nanses
    (mida), i amb el teclat, fletxes (moure) i Maj + fletxes (mida). Tot salta al punt més proper
    d'una quadrícula de **20 columnes × 24 files** de l'àrea útil (`grid.ts`): com a molt 24 × 24,
    i prou fina perquè els espais de totes les plantilles hi caiguin (els cinquens, els terços i
    els rètols de 2/24). La caixa es calcula com un espai de plantilla (`slotToBox`), i per això
    entre dos blocs veïns sempre queda l'espai de la plantilla. El bloc conserva l'`slot` que
    tenia: el lloc d'on ha marxat no torna a ser un espai lliure, i **tornar a aplicar la
    plantilla treu els retocs** (amb Desfés). Mida mínima, 2 × 2 cel·les; els blocs es poden
    trepitjar. El format no canvia: són les caixes de sempre (`x`, `y`, `w`, `h`).
22. **Repartiment Columnes / Files / Lliure, i afegir un bloc previsible** (2026-11-08). Una pàgina
    en blocs es reparteix en **N columnes**, **N files** o **lliure** (`template: "free"`, una
    plantilla sense espais); les plantilles són a sota, sempre, i n'aplicar una deixa la pàgina
    lliure amb els espais de la plantilla. Afegir un bloc fa sempre el que diu l'etiqueta de la
    capçalera: a **columnes**, una columna més (i a **files**, una fila més), si la graella no té
    cap espai lliure; a una **plantilla**, el primer espai buit que li toca, i si no n'hi ha, la
    pàgina passa a lliure; a **lliure**, el bloc va a l'**espai buit més gran** de la quadrícula,
    sense moure'n cap (`largestEmptyBox`), i si no n'hi ha cap, petit a dalt a l'esquerra. Passar a
    «Lliure» no mou res. Substitueix, per a «N columnes» i «N files», el creixement de la decisió
    17 (abans hi afegia files o columnes de l'altre eix). Una pàgina sense cap plantilla desada (les
    fases 1–3) es torna a repartir com abans.
23. **«Aplica el meu estil», i els estils en una sola direcció** (R10, 2026-11-12). El menú «⋯»
    d'una pàgina (tots els seus blocs propis) i el d'un bloc tenen «Aplica el meu estil»: copia el
    meu estil (la targeta i la vista dels pictogrames, sense l'espai entre seqüències) a `styles`
    com a estil amb nom, amb el nom «El meu estil» a l'idioma de la interfície, i hi apunta els
    blocs (`namedStyle`). Si el document ja en té un d'igual, el reaprofita. Treu el retoc de la
    vista dels blocs, que si no manaria sobre l'estil; els retocs dels pictogrames i l'aspecte
    propi dels rètols es conserven. Es desfà sencer (la instantània del desfer guarda també
    `styles`). **L'estil amb nom es pinta sencer**: la vista, la lletra, les vores, la posició del
    text i el color, la pell i el cabell (`styleWithNamed`, `blockSequence`), i la targeta es
    mesura per seqüència i estil (`cardMeasureKey`). Els estils van **només** de la configuració
    cap al document: cap acció no porta res del document a les preferències. A la interfície, la
    pàgina `"auto"` es diu **«Simple»** (abans «Contínua», C15). El format no canvia: `styles` i
    `namedStyle` ja hi eren (decisió 6).
24. **Estil i distribució; estils de bloc; la disposició en una sola tria** (R7, B31, pas 7,
    2026-11-14).
    - **Dues paraules**: l'**estil** és com és cada pictograma (lletra, vores, colors, posició del
      text, pell, cabell, numeració); la **distribució** és com es posen dins d'una seqüència o
      d'un bloc (mida, espai, alineació). A la interfície, «Distribució dels pictogrames» o, si no
      hi ha espai, «Distribució». El panell de preferències «Vista» passa a dir-se **«Pàgina i
      distribució»**.
    - **Un estil amb nom porta només estil**, i a la interfície es diu **«estil de bloc»**.
      «Aplica el meu estil» ja no treu la distribució dels blocs (corregeix la decisió 23). Si el
      nom ja hi és, s'hi afegeix un número. Els estils amb nom d'abans amb `view` es continuen
      pintant i escrivint igual.
    - **L'estil per grup** és el grup de blocs amb el mateix estil de bloc. Es canvia amb
      **«Actualitza amb el meu estil»** (menú «⋯» de la pàgina o del bloc, quan ja en fan servir
      un): l'estil de bloc passa a ser el meu estil d'ara, amb el mateix `id` i el mateix nom, i
      canvien tots els blocs que el fan servir. **«Treu l'estil de bloc»** (menú «⋯» del bloc)
      torna el bloc a l'estil del document; un estil que ja no fa servir ningú surt del document.
      Totes dues es desfan. El nivell «Bloc» de la columna té la fila **«Estil de bloc»**, que
      només ho diu (nom i quants blocs). **No hi ha cap editor d'estils al document**: es mantenen
      la direcció única de la decisió 23.
    - **La disposició d'una pàgina és una sola tria**: Simple · Columnes · Files · Lliure, a la
      columna i al menú «⋯» de la pàgina (`useSheetDisposition`). Desapareixen «En blocs» i la
      fila «Repartiment». Al codi i al fitxer no canvia res (`mode` i `template`).
    - El format no canvia.

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
  es pinten i el retoc s'edita al nivell «Bloc» de la columna. Des de R4 es pinten els rètols, i
  des de R10 (decisió 23) els estils amb nom sencers.
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
  pàgines i, des de R10, els estils amb nom.

## Història

- **2026-11-06** (fases 1–3): `page.layout: "free"` amb `sheets[].placements` i `common`;
  col·locacions `{ id, sequence, x, y, w, h, columns }`; la plantilla no es desava; la mida la manava
  la caixa; en flux, la disposició lliure es conservava a l'app però no s'escrivia. Cap versió
  publicada no va escriure aquest format.
- **2026-11-08** (R4): les plantilles dels treballs reals i els espais de rètol (decisió 20). Els
  rètols es pinten al full, a la impressió i al PDF, i s'editen al nivell «Rètol» de la columna.
- **2026-11-08** (fase 4): les accions de la pàgina, només al seu menú «⋯»; totes les plantilles
  es poden triar, amb avís si se'n perden blocs; els espais lliures, blocs buits per omplir; i
  moure i canviar la mida dels blocs damunt de la quadrícula de punts (decisió 21).
- **2026-11-08** (repartiment): Columnes / Files / Lliure, les plantilles a sota, afegir un bloc
  segons l'etiqueta del repartiment (decisió 22).
- **2026-11-12** (R10): «Aplica el meu estil» al menú «⋯» de la pàgina i del bloc, els estils amb
  nom pintats sencers, els estils en una sola direcció i «Simple» per a la pàgina `"auto"`
  (decisió 23).
- **2026-11-14** (R7, pas 7): estil i distribució separats, estils de bloc amb «Actualitza amb el
  meu estil» i «Treu l'estil de bloc», i la disposició de la pàgina en una sola tria (decisió 24).
