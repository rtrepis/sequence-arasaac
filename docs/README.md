# Documentació: índex

Què hi ha a `docs/`, en quin estat és cada document i on es continua. **Abans d'obrir un pla
nou, mirar aquí si ja n'hi ha un**; abans de proposar una millora d'UX, `BACKLOG-ux.md`.

Quan un document canvia d'estat (s'aprova, es tanca, se n'obre un), s'actualitza aquesta taula
**en el mateix commit**.

## Com està ordenat

| Carpeta | Què hi va | Mana? |
|---|---|---|
| `fonaments/` | Què és cada cosa i de qui és (el model) | **Sí**, sobre tot |
| `decisions/` | ADR: per què es va decidir una cosa i què es va descartar | Sí, per a la seva decisió |
| `estandards/` | Com s'escriu el codi i la interfície de cada àrea | Sí, si no contradiu un fonament |
| `schema/` | L'esquema formal del `.saac` i el `.saacstyle` | Sí |
| `plans/` | Plans **en curs**: decisions, passos i encàrrec per a la sessió següent | Només mentre són oberts |
| `plans/fets/` | Plans **tancats**: arxiu. Expliquen d'on surt el codi. No s'hi continua | No |
| `estudis/` | Recerca i inventaris: el perquè, sense tasques | No |
| `esbossos/` | Esbossos i simulacions en HTML que es van fer servir per decidir | No |
| `BACKLOG-ux.md` | Totes les troballes obertes, amb les prioritats al capdamunt | — |

Un pla es **tanca** quan està fet o quan el que en queda obert se'n va a un altre lloc (un altre
pla o el backlog). En tancar-lo: una nota al capdamunt que digui on ha anat cada pendent, i es
mou a `plans/fets/`.

## Plans

| Document | Estat | Per continuar |
|---|---|---|
| `plans/PLA-estils.md` | 🟢 **En curs** (2026-11-21): passos 1 (fonaments i ADR-006), 2 (la solució A i D1), 3 (l'estudi d'estils de targetes, `estudis/ESTUDI-estils-de-targetes.md`), 4 (el format i la cascada amb l'estil de la seqüència), 5 (la Galeria d'estils i el «⋯» de la seqüència a l'edició), 6 (l'estil del bloc a la vista), 7 (l'esbós de l'edició al mòbil, revisat), 8 (l'edició nova al mòbil), 9 (els quatre estils de l'app a la galeria) 10 (l'edició nova a l'escriptori, amb un interruptor) 11 (la columna de la vista a l'estàndard) i 12 (textos, i B43) fets, 2026-11-22. L'estil va amb la seqüència i el bloc (un sol estil per bloc, reassignable), la seqüència té nom, la Galeria d'estils, la pantalla d'edició nova al mòbil, i el que ha heretat del mode lliure. B37 | §20: el pas 13 (la notícia N-2), i tancar el pla §10 mana sobre §0–§8 i substitueix §7 |
| `plans/PLA-noticies.md` | 🟡 **Fases 1, 2 i 4 fetes** (2026-11-20). La N-2 és aturada pel pla dels estils. Oberta D5 | §11 |
| `plans/fets/PLA-mode-lliure.md` | ✅ **Tancat** (2026-11-21), fet fins al pas 8. L'estil dels blocs i el pas 8 → `PLA-estils.md` §8.5; els blocs d'imatge → B38 | — |
| `plans/fets/PLA-vista-mobil.md` | ✅ **Tancat** (2026-11-21), fet fins a la fase 6. Les proves en dispositius → P2; la notícia → N-3 | — |

## Estudis

| Document | Què respon | Quan consultar-lo |
|---|---|---|
| `estudis/ESTUDI-limits-serveis-gratuits.md` | Els límits gratuïts d'Atlas, Cloudinary, Render, Vercel, Resend, ARASAAC i GA4, contra el que l'app en gasta (L1–L8) | Abans d'afegir res que desi, pugi o enviï correu |
| `estudis/ESTUDI-treballs-amb-pictogrames.md` | Quins documents es fan de debò amb pictogrames i les plantilles de pàgina que en surten | Abans de dissenyar o canviar una plantilla |
| `estudis/ESTUDI-seo-noticies.md` | Com fer que les notícies es trobin als cercadors. **No s'ha començat** | Abans de tocar `index.html`, `vercel.json`, `robots.txt` o com es publiquen les notícies |
| `estudis/ESTANDARD-capes-flotants.md` | L'estudi darrere de `estandards/capes-flotants.md` (F1–F14). Migració feta | Quan una regla de capes sembla arbitrària o se'n vol canviar una |
| `estudis/INVENTARI-funcionalitats-des-de-2.0.2.md` | Tot el que l'app fa i no feia a la 2.0.2 | Per explicar la versió a algú de fora |
| `estudis/NOTICIES-candidates-des-de-2.0.2.md` | Quines funcionalitats són notícia i què no s'hi ha de dir | Abans d'escriure una entrada de `newsItems.ts` |
| `estudis/ESTUDI-aprimar-arquitectura.md` | Quants dels cinc proveïdors (Vercel, Render, Atlas, Cloudinary, Resend) calen de debò i què costaria treure'n cadascun (A1–A10, E1–E3). Del setembre; recuperat d'una branca no fusionada el 2026-11-21 | Abans de proposar cap canvi d'allotjament o de proveïdor |
| `estudis/ESTUDI-servidor-propi.md` | Què es pot muntar en una màquina pròpia, què costa i què s'hi perd (S1–S10, H1–H3). Mateix origen | Abans de plantejar qualsevol autoallotjament |
| `estudis/COMPARATIVA-opcions-infraestructura.md` | El full de decisió: les sis opcions d'infraestructura de costat, amb cost en diners i hores. Resum dels dos anteriors | Per decidir l'allotjament |
| `estudis/ESTUDI-estils-de-targetes.md` | Quines formes de targeta es fan de debò (vores, text, lletra, número, color de Fitzgerald), com queda «Sense vores», i la llista d'estils de l'app per a la galeria: quatre, tots amb Atkinson Hyperlegible (2026-11-22, **revisat per l'usuari**: §6, D30–D33 del pla) | Abans d'afegir, treure o canviar un estil de l'app de la Galeria d'estils |

## Esbossos

| Fitxer | De quin pla |
|---|---|
| `esbossos/esbos-columna-vista.html` | La columna de la vista (R8 del mode lliure) |
| `esbossos/esbos-vista-mobil.html` | La vista al mòbil (fase 1) |
| `esbossos/esbos-edicio-mobil.html` | L'edició al mòbil (pas 7 del pla dels estils), amb les captures d'avui a `esbossos/img/edicio-mobil/`. Revisat el 2026-11-22 (D25–D28 del pla) |
| `esbossos/simulacio-capes-flotants.html` | L'estudi de capes flotants |
