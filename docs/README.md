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
| `plans/PLA-estils.md` | 🟡 **Decisions preses, falta el pla d'execució** (2026-11-21). L'estil va amb la seqüència i el bloc, la seqüència té nom, la Galeria d'estils, la pantalla d'edició nova al mòbil, i el que ha heretat del mode lliure (§8.5). B37 | §9, «Encàrrec per obrir la sessió següent». Llegir abans la nota «Com llegir aquest document»: §8 mana sobre §0–§7 |
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
| `estudis/ESTUDI-estils-de-targetes.md` | *Encara no existeix*: el preveu `PLA-estils.md` §4.4 per triar els estils de la galeria | — |

## Esbossos

| Fitxer | De quin pla |
|---|---|
| `esbossos/esbos-columna-vista.html` | La columna de la vista (R8 del mode lliure) |
| `esbossos/esbos-vista-mobil.html` | La vista al mòbil (fase 1) |
| `esbossos/simulacio-capes-flotants.html` | L'estudi de capes flotants |
