# ADR-006: L'estil va amb la seqüència, el bloc en té un de sol, i la Galeria d'estils

- **Estat**: acceptada (2026-11-21). El codi hi arriba pels passos 2–9 de
  `docs/plans/PLA-estils.md` §10.3.
- **Substitueix**: de l'ADR-005, la part d'estils de les decisions 23 i 24 («Aplica el meu estil»,
  «Actualitza amb el meu estil», «Treu l'estil de bloc», l'estil per grup i el nom «estil de
  bloc»). La resta d'aquelles decisions (la direcció única, estil i distribució, la disposició en una
  sola tria) continua valent.
- **Fonaments**: `docs/fonaments/03-model-contingut-estil.md` (§1, §3–§7) i
  `docs/fonaments/06-compatibilitat-i-dades.md` (§1, §1.2, §6). Esquema:
  `docs/schema/saac-v3.schema.json`. Pla: `docs/plans/PLA-estils.md` (§8 i §10, decisions D1–D24).

## Context

Amb l'ADR-005, l'estil d'un document es podia retocar de dues maneres: un pictograma a pictograma,
i un bloc a bloc, amb «Aplica el meu estil» i «Actualitza amb el meu estil», que creaven grups de
blocs amb el mateix «estil de bloc». Revisant la notícia N-2 es va veure que (PLA-estils, §2):

- Un pictograma nou **copiava** l'estil del document en lloc d'heretar-lo, i en desar s'hi gravaven
  retocs que ningú no havia fet (E1, E2).
- «Aplica» i «Actualitza» deixaven el bloc que tens davant igual; la diferència eren grups
  invisibles de blocs d'altres pàgines (E5).
- Un document nou seguia El meu estil fins que es descarregava, i només aleshores (E4).
- L'estil d'una seqüència no es podia triar des de l'edició, i les pàgines simples, sense menú de
  bloc, no podien triar cap estil (Q1).

L'usuari ho va reformular el 2026-11-21: «els estils aniran amb les seqüències/bloc».

## Decisió

1. **Un pictograma guarda només els seus retocs** (solució A). Tot el que és buit s'hereta.
   «Personalitzat» vol dir «té retocs», i «Restableix» els buida.
2. **El document neix amb una còpia d'El meu estil i no el segueix mai** (D1). L'estil del document
   té nom (`style.name`).
3. **L'estil és de la seqüència.** Cada seqüència pot triar un estil de la **Galeria d'estils**
   des de l'edició (`sequences[].namedStyle`, que apunta a `styles`). El reben tots els seus blocs.
   La seqüència té nom (`sequences[].title`), que no s'imprimeix.
4. **Un bloc de seqüència té un sol estil**: el de la seqüència o un **reassignat** a la vista
   (`namedStyle` del bloc), que **substitueix** el de la seqüència i només canvia aquell bloc. No
   té retocs d'estil propis (lletra, color, fons: B39). «Torna a l'estil de la seqüència» treu la
   reassignació. Canviar l'estil de la seqüència no toca els blocs reassignats.
5. **Una sola acció d'entrada**: «Tria un estil», que obre la Galeria d'estils (a l'edició, des
   del «⋯» de la seqüència; a la vista, des de la fila «Estil» del bloc i del seu «⋯»). Triar-ne un
   en **copia** els valors al document. Desapareixen «Aplica el meu estil», «Actualitza amb el meu
   estil» i «Treu l'estil de bloc», i amb elles els grups invisibles.
6. **La Galeria d'estils** té l'estil de damunt («L'estil del document» o «L'estil de la
   seqüència»), El meu estil i els estils fixos de l'app (amb «Sense vores»). Des de la galeria es
   pot **carregar un estil d'un fitxer** (s'aplica, no s'hi queda), **desar** qualsevol estil en un
   `.saacstyle` i fer-ne **el meu estil**.
7. **«Personalitzat» també a la seqüència i al bloc**: si algun pictograma té retocs, en lloc del
   nom de l'estil surt «Personalitzat», amb la mateixa marca que la targeta i una ajuda. Un bloc
   reassignat porta una marca pròpia.
8. **El format no puja `schemaVersion`**: `sequences[].namedStyle` i `style.name` són opcionals i
   una versió anterior els conserva com a desconeguts; `namedStyle` del bloc i
   `sequences[].title` ja hi eren. En desar, `styles` només porta els estils que fa servir algú.

## Alternatives descartades

- **Estil per bloc i prou** (la decisió D8 del 2026-11-20): deixava les pàgines simples sense
  manera de triar estil (Q1) i obligava a anar bloc a bloc.
- **Retocs d'estil del bloc a la columna sumats a l'estil de la galeria** (la idea de §13 del pla
  del mode lliure): eren dos camins per a la mateixa cosa, el duplicat que va obrir el pla (E5).
  Queda a B39 per si torna.
- **Mantenir «Actualitza» amb un nom que digui l'abast**: el grup continuava sense nom visible.
- **Una fila «Estil» al nivell Document** (D4): amb l'estil a cada seqüència, l'estil del document
  només és el de partida, i es veu com la primera opció de la galeria.
- **Que l'estil de la seqüència vagi dins de `sequences[].style`** com a retoc: un estil de la
  galeria és sencer i té nom; com a referència a `styles`, el bloc reassignat i la seqüència
  comparteixen la mateixa forma.

## Conseqüències

- Els documents fets amb «Aplica el meu estil» (blocs amb `namedStyle` i cap seqüència amb estil)
  es pinten igual: el `namedStyle` del bloc passa a llegir-se com a reassignat.
- Canviar l'estil de tot un document són tants clics com seqüències (Q2, oberta).
- La notícia N-2 («El teu estil, a tot el document d'un cop») s'ha de reescriure (D9).
- L'esborrany d'IndexedDB necessita una versió i una lectura dels vells per buidar els valors
  copiats (solució A, PLA-estils §3.3).
