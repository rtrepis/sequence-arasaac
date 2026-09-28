# ADR-003: Model de document `.saac` v3

- **Estat**: acceptada (2026-09-28)
- **Substitueix**: l'esquema 2 de la PR #291 (branca `claude/sequencia-estil-b25-16pluv`), abans de
  publicar-lo.
- **Fonaments**: `docs/fonaments/03-model-contingut-estil.md` i
  `docs/fonaments/06-compatibilitat-i-dades.md`. Esquema: `docs/schema/saac-v3.schema.json`.

> No hi ha ADR-001 ni ADR-002 al repositori: la numeració segueix la de l'encàrrec.

## Context

Fins a la 2.1.0, el `.saac` era un bolcat de l'estat de Redux: `documentState` amb `content`
indexat per número, `viewSettings` per seqüència i, opcionalment, `defaultSettings` al costat. No
tenia versió, la pàgina no hi era, i cada pictograma guardava els ajustos sencers. Un document es
veia diferent segons les preferències de qui l'obria.

La PR #291 (B25) hi va posar l'estil a dins amb un **esquema 2** (`schemaVersion: 2`, fitxer
d'estil `.saacstyle`). Aquella versió **no s'ha publicat**: cap usuari té fitxers en esquema 2.
El codi de la PR #291 es manté com a base.

L'objectiu: **un `.saac` s'obre, es veu i s'imprimeix igual a qualsevol ordinador, tauleta o
mòbil, amb compte o sense.**

## Decisió

1. **La v3 (`schemaVersion: 3`) és el primer format públic nou.** Porta `format: "sequenciaac"`,
   `kind`, `meta`, `page`, `style`, `sequences[]` amb `id`, `assets` i `ui`.
2. **L'esquema 2 era un pas intern.** Es continua llegint perquè el lector ja el sap llegir i no
   costa res, però no és un compromís: si algun dia costa, se'n converteixen les fixtures 08 i 09 a
   v3 i s'esborra el camí.
3. **Un estil desat va en un fitxer `.saacstyle`, amb `kind: "style"`.** El vocabulari és
   «estil», com a la interfície d'ara.
4. **La mida de la lletra es resol en cascada.** La mida és només `card.font.size`. En llegir,
   `settings.fontSize` **s'ignora**: la targeta no l'ha fet servir mai per pintar, i fer-lo servir
   ara trencaria la invariant de la migració (la fixture 10 té `fontSize: 1` i un estil de 1,3).
5. **Les seqüències buides es descarten en migrar.** Només en migrar un format antic; una seqüència
   buida d'un fitxer v3 es conserva. Si totes són buides, se'n conserva una.
6. **La pàgina entra al fitxer, adaptada al que ja existeix**: `size` (`A4`, `A3`, `FULLSCREEN`),
   `orientation`, `direction` (`row` o `column`, seqüències en files o en columnes), `sequenceGap`
   (un factor, com ara) i `layout`. No hi ha marges. Tanca **B26**, i el que quedava de **B21**.
7. **Les unitats són mil·límetres només a `frame`**, i `frame` només es reserva per al mode lliure.
8. **L'estil per seqüència només és `view`** en aquesta versió.
9. **L'espai entre seqüències passa de l'estil a la pàgina.** A l'esquema 2 era part de
   l'estil (`styleView.sequenceSpaceBetween`), amb una nota de «pendent de confirmar»; ara és
   `page.sequenceGap`.
10. **Redux conserva la forma actual.** `parse` i `serialize` converteixen a la frontera. El fitxer
    i l'estil resolt segueixen la v3.
11. **El núvol conserva la forma de l'API.** El front converteix en desar i en llegir. Cap
    migració massiva: els documents es migren en llegir-los.
12. **Desfer**: «Aplica a tots» i «Restableix» fan servir el desfer que ja existeix (el snackbar de
    l'estil). L'historial complet és **B30**.
13. **Descàrrega** amb `application/octet-stream` i el nom acabat en `.saac` o `.saacstyle`. El tipus
    es decideix pel contingut, i s'obren també els `.saac.txt`.
14. **El Fitzgerald d'un pictograma és contingut, no un retoc** (*pendent de confirmar*). «Aplica a
    tots», aplicar un estil i «Restableix» no el toquen, i no fa sortir l'indicador
    «personalitzat».

## Alternatives descartades

| Alternativa | Per què no |
|---|---|
| Fitxer de tema `.saactheme` amb `kind: "theme"` (proposta inicial) | La interfície ja parla d'«estil» i de `.saacstyle`, i «tema» ja vol dir clar o fosc. Dues paraules per a la mateixa cosa confonen. També s'havia descartat `.saact`, perquè es confon amb `.saac` |
| Publicar l'esquema 2 i fer la v3 a sobre | Cap usuari en té fitxers: publicar-lo només afegiria un format més a mantenir per sempre |
| `settings.fontSize` com a reserva de `font.size` | Canviaria com es veuen documents antics (decisió 4) |
| Conservar les seqüències buides en migrar | Una seqüència buida no té res per veure ni per imprimir, i en un document antic sol ser una pestanya que va quedar oberta |
| `direction: "ltr" \| "rtl"` i `sequenceGapMm` | No corresponen a res de l'app: la direcció és files o columnes, i l'espai és un factor d'escala. Passar a mm es fa amb el mode lliure, si cal |
| `marginMm` | L'app no té marges configurables. Afegir-los seria funcionalitat nova |
| Només A4 | L'app ja ofereix A3 i pantalla completa, i treure'ls deixaria documents sense la seva pàgina |
| Reescriure Redux amb la forma v3 | Molt més risc i cap guany per a l'usuari: la v3 és un contracte del fitxer |
| Canviar la forma de l'API al format v3 | Toca la validació, la compactació i les miniatures, i els comptes estan apagats: no es podria provar de punta a punta |
| Historial general de desfer i refer | Fora d'abast: és B30 |
| Estil per seqüència complet (lletra, vores) | Fora d'abast en aquesta versió |

## Conseqüències

- **Fixtures**: les 01–10 no es toquen. S'hi afegeixen a partir de la 11: `.saac.txt`, una imatge
  pròpia repetida, un fitxer malmès i un amb `schemaVersion: 99`.
- **Expectatives que canvien a propòsit** (autoritzat):
  - Les fixtures 02 i 08 perden la seqüència buida (quatre pestanyes passen a tres): canvien el
    manifest i les captures.
  - Els documents antics s'obren amb la pàgina de qui obre (com ara), però **els v3 s'obren amb la
    seva**: canvien les captures on la pàgina del fitxer i la de les preferències no coincideixen.
  - Qualsevol altra captura que canviï és un error.
- **Redux** guanya camps opcionals per fer l'anada i tornada: els `id` de seqüències i pictogrames i
  els camps desconeguts del fitxer. Els documents d'abans no els tenen i continuen sent vàlids.
- **Aplicar un estil ja no canvia l'espai entre seqüències**, perquè ara és pàgina (decisió 9).
- **`ui.viewSettings`** deixa de fer de pàgina del document: queda com a **pàgina per defecte**
  dels documents nous, que és una preferència.
- **Regla de canvi** (a `CLAUDE.md`): qualsevol canvi al format `.saac` requereix actualitzar
  l'esquema, incrementar `schemaVersion` si trenca la compatibilitat, afegir-hi una migració i una
  fixture.
- **Pendent de confirmar**: la decisió 14. L'especificació deia que «Restableix» esborra tot el
  `style` del pictograma; com que gairebé tots tenen un Fitzgerald propi, s'hauria perdut el color
  de la categoria i gairebé tots haurien sortit com a «personalitzats».
