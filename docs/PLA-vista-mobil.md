# Pla: la vista al mòbil — el full a la pantalla i els ajustos en un panell de baix

> **Estat**: pla aprovat (2026-11-15). **Per continuar, comenceu per §10, «Encàrrec per a la sessió
> següent»**: les proves en dispositius de debò (§9d) i la fase 6. **Fase 5 feta en emulació**
> (2026-11-15): els casos difícils que es poden provar aquí tenen prova; els que necessiten un
> mòbil de debò són a §9d, pendents. **Fase 4 feta** (2026-11-15): la vista ja va al panell de baix,
> amb els tres casos de §1 en un e2e de mòbil. **Fase 0 feta** (2026-11-15): la
> release no fa saltar la pàgina en seleccionar i té l'enllaç «Ajustos del bloc». **Fase 3 feta**
> (2026-11-15): `AppBottomSheet` existeix i passa les proves, però la vista encara no el munta.
> **Fase 1 tancada** (2026-11-15): totes les decisions són a §9.
> **Fase 2 aprovada** (2026-11-15): l'estàndard és a `capes-flotants.md`, `configuracions.md` i F14
> de `ESTANDARD-capes-flotants.md`. Continua marcat «⏳ Proposta» perquè el codi encara no el
> compleix; la marca es treu a la fase 6. Cada fase té una **porta**: no es passa a la següent fins que la decisió que la
> tanca és presa i apuntada a §9.
> **Entrada del backlog**: C29 de `docs/BACKLOG-ux.md`.
> **Estàndards que toca**: `docs/estandards/capes-flotants.md` (una capa nova),
> `docs/estandards/configuracions.md` (la columna de la vista al mòbil) i el `CLAUDE.md`.

## 1. El problema

Al mòbil, la pàgina de vista té **un sol scroll per a dues coses que es fan alhora**: mirar el full i
tocar-ne els ajustos. La columna d'ajustos va sota el full, i qualsevol cosa que es toca fa perdre de
vista l'altra.

El que s'ha vist de debò (sessió del 2026-11-15):

1. **El full es perd i no es pot recuperar.** El verd fa l'alçada de la pantalla i es desplaça per
   dins (`overscrollBehavior: contain`). Un cop s'hi ha baixat, el dit només mou el verd: no queda
   cap tros de la pàgina on arrossegar per tornar a pujar fins al full.
2. **Una franja del full a dalt no ho arregla.** Es va provar deixant-ne 96 px a la vista
   (`MOBILE_PREVIEW_PEEK`). Als fulls amb blocs, el bloc és arrossegable (`PlacementBox`,
   `touchAction: "none"`): el dit que hi arrossega per pujar mou el bloc. I amb la barra de dalt a
   la vista, de franja n'hi queden 54 px.
3. **Seleccionar fa fugir el que s'ha seleccionat.** Es va provar que, en tocar un bloc, la pàgina
   baixés fins a la seva targeta. Amb una pàgina de dues files, el bloc de dalt surt de la pantalla
   just quan s'ha tocat. Amb el full vertical és pitjor, perquè és més alt que la pantalla. A més,
   trencava una regla de l'estàndard: «al mòbil, seleccionar no mou la pàgina»
   (`configuracions.md`).

El problema de fons no és cap d'aquests tres: és que **el full i els ajustos es disputen la mateixa
alçada i el mateix gest**. Cap retoc de l'scroll no ho resol; cal una altra disposició.

## 2. El que hi ha avui (i que condiciona el disseny)

- **El punt de ruptura és `md` (900 px)**: `isMediumScreen` a `features/print/utils/pageFormat.ts`
  i `isNarrow` a `FreeLayoutPages`. Per sota, «mòbil» inclou **les tauletes en vertical** (768,
  820 px). La tauleta és el dispositiu habitual en CAA (C1 del backlog).
- **Una pàgina cada vegada**: amb pàgines pròpies, al mòbil només es veu la pàgina activa i es passa
  a la següent **lliscant en horitzontal** (`FreeLayoutPages`, `swipe`). El lliscament vertical és
  desplaçar-se.
- **El full s'escala per amplada** (`useScaleCalculator` amb `fit: "page"` i l'amplada de la
  pantalla). Un full vertical surt més alt que la pantalla.
- **Els botons de la vista** (girar, imprimir, PDF, pantalla completa) van **a sobre del full** al
  mòbil (`renderToolbar(false)`).
- **La barra de dalt** fa 42 px (`APP_BAR_HEIGHT`) i s'amaga en baixar (`HideOnScroll`, que escolta
  l'scroll de la finestra).
- **El verd**: `height: 100dvh` (ara `calc(100dvh - 96px)`), scroll propi, molles enganxades a dalt
  (`LevelCrumbs`, `top: -12`) i un `marginBottom` negatiu que anul·la la reserva del botó flotant.
- **Els nivells** (P1): sense selecció, tots oberts; amb un bloc, Document i Pàgina es pleguen.
- **El botó d'estat** (`DocumentStatusFab`) és `position: fixed` al racó de baix a la dreta i
  declara el racó (`useFloatingCorner`). Els avisos flotants s'hi aparten.
- **`BlockSettingsLink` existeix i no el fa servir ningú**: era la resposta de l'esbós («la pàgina no
  salta; un enllaç "Ajustos del bloc" baixa fins al nivell»), però no està muntat enlloc. És codi
  mort.
- **El que es pinta al paper és només la còpia dels fulls** (`usePrintSheet`): una capa nova de
  l'app no pot arribar a la impressió ni al PDF.

## 3. Premisses que no es toquen

1. **El full no surt mai del tot de la pantalla.** Sempre se'n veu una part prou gran per tocar-lo.
2. **Seleccionar no fa fugir el que s'ha seleccionat.** El bloc tocat queda a la vista.
3. **El que es veu és el que s'imprimeix.** El full continua sent `sheetSurface`, en clar, i el
   panell no hi entra mai (ni al paper ni al PDF).
4. **L'escriptori no canvia.** Tot el pla és per sota de `md`.
5. **Accessible sense gestos.** Tot el que es fa arrossegant es fa també amb un botó i amb el teclat
   (WCAG 2.5.1 i 2.5.7). El panell es llegeix com una regió amb nom, no com un diàleg.
6. **Les alçades del panell són estat de la pantalla**: no van a Redux, ni al document, ni a les
   preferències.
7. **Cap `Dialog`**: el panell no és modal. El full continua viu mentre el panell és obert.
8. **Les regles del repo** (`CLAUDE.md`): TypeScript estricte, colors de `palette.ts`, `SettingRow`,
   textos a `packages/i18n` en tots els idiomes, `npm run typecheck` net.

## 4. El model proposat

Com les apps de disseny: **el full ocupa la pantalla i els ajustos pugen des de baix** en un panell
que s'atura a tres alçades.

```
   PLEGAT                 MIG                     SENCER
┌──────────────┐     ┌──────────────┐        ┌──────────────┐
│▓▓ barra app ▓│     │Pàg 1/2 🖨 PDF⛶│        │▔▔▔ full ▔▔▔▔│ ← una franja: tocar-la
│Pàg 1/2 🖨PDF⛶│     │ ┌──────────┐ │        ├──────────────┤   torna a MIG
│┌────────────┐│     │‹│▢▢▢ [▢▢▢] │›│        │ Doc › Pàg › S│
│‹ ▢▢▢  ▢▢▢   ›│     │ └──────────┘ │        │ SEQÜÈNCIA 2  │
││ ▢▢▢  [▢▢▢] ││     ├──── ══ ──────┤        │ Mida ──●──── │
│└────────────┘│     │ Doc › Pàg › S│        │ Espai ─●──── │
├──── ══ ──────┤     │ SEQÜÈNCIA 2  │        │ Alineació H  │
│ Doc › Pàg › S│     │ Mida ──●──── │        │ …            │
└──────────────┘     └──────────────┘        └──────────────┘
  ‹ › als costats del full: passar de pàgina (M4). A mig i a sencer, la barra de l'app s'amaga (M5).
```

### A dalt, la sortida del document i la pàgina on s'és (M4)

La fila de sobre del full canvia de sentit: hi van **les sortides del document** (imprimir, PDF i
pantalla completa) i **la pàgina on s'és** («Pàgina 1 de 2»). **Girar el full no és una sortida, és
un ajust**: passa al nivell «Document» del panell, a *Format de pàgina*, al costat de la mida del
paper.

**Passar de pàgina** es fa **lliscant en horitzontal** sobre el full, com avui, **i també a la
pantalla completa**, que avui no ho permet (N1). L'alternativa d'un toc: **tocar a la vora** del
mòbil (el 15 % de l'amplada de cada costat, fora dels blocs) fa aparèixer una fletxa
**semitransparent** (‹ o ›, de 44 px) durant **2 segons** (N4). Si es toca, passa de pàgina i la fletxa
continua a la vista uns segons més, per passar-ne diverses seguides; si no, desapareix. Amb una sola
pàgina, o a la primera i a l'última cap a fora, no surt res. **Amagades només a la vista**: les
fletxes són sempre a l'arbre d'accessibilitat i a l'ordre de tabulació, i es mostren quan reben el
focus; el teclat i el lector de pantalla no han de saber que hi ha una vora per tocar.

### La pàgina no es desplaça

Al mòbil, la vista deixa de tenir scroll de pàgina. **El full s'escala per cabre sencer a l'espai que
queda a sobre del panell** (amplada i alçada), no només per amplada (E1). Sense scroll de pàgina, no
hi ha res a perdre: els problemes 1 i 2 de §1 desapareixen, no s'arreglen.

### La barra de l'app (M5 i M2)

Quan el panell puja a **mig** o a **sencer**, la barra de dalt de l'app s'amaga, i aquells 42 px són
per al full. **Només torna quan el panell baixa a plegat** (N2). Així **mig** continua sent
el 50 % de la pantalla, però el full hi guanya la barra.

### Tres alçades

| Alçada | Què s'hi veu | El full |
|---|---|---|
| **Plegat** | La nansa i les molles («Document › Pàgina 1 › Seqüència 2»): diu on s'és | Gairebé tota la pantalla |
| **Mig** | Les molles i el nivell obert, amb scroll propi | La meitat de dalt, sencer i encongit |
| **Sencer** | Tots els ajustos | Una franja a dalt; tocar-la torna a **mig** |

Mai cent per cent: a **sencer** sempre en queda una franja, i la franja **no** és el full (no s'hi
poden arrossegar blocs), és un botó que torna a mig. Així el gest per tornar no pot topar mai amb un
bloc.

### Seleccionar

**Tocar una cosa del full la porta al panell**, i el panell la segueix:

| Es toca | Al panell | El panell, si és plegat o sencer |
|---|---|---|
| Un bloc o una seqüència | El seu nivell, obert i a dalt; Document i Pàgina, plegats | Va a **mig** |
| El full, fora dels blocs | El nivell **Pàgina**, obert i a dalt (D2) | Va a **mig** (N5) |
| La vora del mòbil (15 %) | Res: només surt la fletxa de passar pàgina (N4) | No es mou |

- **A la disposició lliure, un toc no puja el panell; un doble toc, sí** (D1). En aquesta disposició,
  tocar un bloc sovint vol dir moure'l, i el panell pujant faria nosa: un toc el selecciona (i el
  deixa a punt d'arrossegar), i un doble toc obre els seus ajustos. Tocar el full fora dels blocs
  segueix la mateixa regla. A les altres disposicions (simple, columnes, files) els blocs no es
  mouen, i un sol toc ja obre els ajustos.
- **El doble toc no és l'única porta**: el botó «Mostra els ajustos» i les molles hi arriben amb un toc.
  Cal, perquè **amb el lector de pantalla el doble toc és el gest d'activar**: qui fa servir TalkBack
  o VoiceOver selecciona amb un doble toc i obre els ajustos amb el botó.
- Com que a **mig** el full sencer cap a la meitat de dalt, **el bloc tocat sempre és a la vista**,
  sigui on sigui de la pàgina (problema 3). El verd porta la targeta a dalt amb el seu scroll de dins,
  mai amb el de la pàgina.
- Escape treu la selecció i no mou el panell.
- **A la pantalla completa només es passa de pàgina** (lliscant o amb la fletxa de la vora), com
  avui: no s'hi selecciona res, no hi ha panell, i se'n surt amb el gest del sistema.

### El mòbil girat (M6 i N3)

Girar el mòbil no canvia la disposició: a sobre hi surt una **capa blanca translúcida amb una icona
animada de girar el mòbil** i el text «Gira el mòbil: la vista es treballa amb el mòbil dret». No es
pot tancar, i desapareix en tornar a posar el mòbil dret. **No surt a la pantalla completa**, que en
horitzontal sí que té sentit per mirar el full. Amb `prefers-reduced-motion`, la icona no es mou. El
blanc translúcid és un color nou: va a `palette.ts`, com tots.

### Moure el panell

- **Arrossegant la nansa o la capçalera** (les molles). El contingut del panell no mou el panell: s'hi
  fa scroll i s'hi mouen els lliscadors sense que el panell se'n vagi.
- **Amb un botó** a la capçalera, que alterna plegat ↔ mig i diu què farà («Mostra els ajustos» /
  «Amaga els ajustos»), amb `aria-expanded`.
- **A sencer només s'hi arriba arrossegant** (M3). No trenca el criteri WCAG 2.5.7 (arrossegar ha de
  tenir alternativa d'un sol toc) perquè **sencer no dona res que mig no tingui**: a mig, el contingut
  del panell es desplaça per dins i tots els ajustos hi són. Sencer és comoditat, no funció. Per això
  l'estàndard ho ha de dir: cap ajust no pot dependre d'arribar a sencer.
- **Amb el teclat**: el botó és a l'ordre de tabulació; Escape continua treient la selecció.

### El que conviu amb el panell

- **El botó d'estat i els avisos flotants pugen damunt del panell.** El panell declara la seva
  alçada amb el mecanisme que ja existeix (`useFloatingInset`), i el botó d'estat passa a llegir-la
  com ja fan els avisos. Avui el botó és ancorat a baix de tot i quedaria tapat.
- **Lliscar en horitzontal sobre el full** continua passant de pàgina, i ara té més lloc. Les fletxes
  dels costats en són l'alternativa d'un toc.
- **Arrossegar blocs** continua igual: la pàgina ja no es desplaça, i el gest no té competència.

## 5. Com canvia l'estàndard (cal aprovar-ho abans del codi)

Un panell de baix és una **capa flotant nova**. L'estàndard de capes flotants diu que hi ha dos
diàlegs canònics i cap més, i deixa el drawer fora. Aquest panell no és cap de les dues coses: és una
tercera forma, i per tant un **tercer component canònic**, no una excepció.

| Document | Què hi canvia |
|---|---|
| `docs/estandards/capes-flotants.md` | Secció nova **«Panell de baix»**: `AppBottomSheet` (a `components/`, genèric, sense domini) és l'única manera de fer-ne un. Tres alçades; mai tapa el full sencer; no modal (`role="region"` amb nom); es mou amb la nansa, amb un botó i amb el teclat; declara l'alçada amb `useFloatingInset`; el botó d'estat i els avisos s'hi posen damunt. Només per sota de `md`. **Cap ajust no pot dependre d'arribar a sencer** (M3). També hi entren **la capa del mòbil girat** (no es tanca, no surt a la pantalla completa) i **la fletxa de la vora** (semitransparent, temporal, mai l'única manera: el lliscament hi és sempre). A «Estat de migració», la vista |
| `docs/ESTANDARD-capes-flotants.md` | Una troballa nova, **F14**, amb el que hi ha a §1: és la raó de la regla |
| `docs/estandards/configuracions.md` | La columna de la vista: «al mòbil va sota el full» passa a «al mòbil va al panell de baix». La frase «Al mòbil, seleccionar no mou la pàgina: l'enllaç "Ajustos del bloc" hi porta» passa a «seleccionar porta el panell a mig, i el full sencer hi queda a sobre» |
| `docs/estandards/estructura-de-fitxers.md` | Res de nou: un component genèric va a `components/`. Només s'hi comprova |
| `CLAUDE.md` | A «Regles transversals», a la regla dels diàlegs: «al mòbil, els ajustos de la vista van a `AppBottomSheet`, l'únic panell de baix» |
| `docs/esbos-columna-vista.html` | La pregunta «Al mòbil la columna és sota el full. Què passa en seleccionar un bloc?» passa a apuntar a aquest pla |

**Com s'aprova**: el text de l'estàndard s'escriu primer marcat **«Proposta»** (fase 2) i només
perd la marca quan l'esbós (fase 1) s'ha provat en un mòbil i una tauleta de debò i les decisions de
§9 són preses.

## 6. Fases

### Fase 0 — Deixar la release com ha de ser (abans de publicar) ✅ Feta (2026-11-15)

**Com ha quedat**: el salt de pàgina és fora; el verd encara porta la targeta a dalt per dins, que
no mou res de la pàgina. `BlockSettingsLink` és a l'esquerra de la fila de botons de sobre el full,
només amb un bloc seleccionat. La franja de 96 px es queda (M9). Comprovat amb un mòbil emulat
(390 × 844): seleccionar deixa la pàgina a lloc i el bloc a la vista, i l'enllaç baixa fins a la
targeta amb el full a la franja de dalt. **Queda una incoherència**: a les pàgines simples el nivell
es diu «Seqüència», i l'enllaç continua dient «Ajustos del bloc». Es resol a la fase 4, en esborrar
l'enllaç, o abans si es vol amb un text nou als cinc idiomes.

El commit d'aquesta branca (`Vista al mòbil: seleccionar un bloc porta a la seva targeta…`) va fer
dues coses i en sobra una:

- **Treure el salt de pàgina en seleccionar** (`window.scrollTo` a `ViewSquenceSettings`). Trenca
  l'estàndard i fa fugir el bloc.
- **Decidir la franja** (M9): o tornar a `100dvh` com abans, o deixar-la. Cap de les dues opcions no
  arregla el problema de fons; la franja almenys deixa tornar quan el full no té blocs arrossegables.
- **Muntar `BlockSettingsLink`** damunt del full quan hi ha un bloc seleccionat, que és el que l'esbós
  ja havia decidit i no s'havia fet. Es treu a la fase 4.

**Fet quan**: seleccionar no mou la pàgina, i amb un bloc seleccionat hi ha l'enllaç «Ajustos del
bloc».

### Fase 1 — Esbós i decisions · porta: §9 respost ✅ Tancada (2026-11-15)

**Esbós fet** (2026-11-15): `docs/esbos-vista-mobil.html`. Obert al mòbil ocupa tota la pantalla;
a l'escriptori, un marc de telèfon que es pot girar. Té els tres casos de §1, controls que canvien el
full en viu, les decisions M1–M9 (i E1: si el full s'encongeix o queda tapat) amb les que canvien
l'esbós marcades «en viu», i un botó que en copia les respostes. **§9 respost** (2026-11-15).
**Esbós v2** (mateix dia): amb les decisions aplicades (fila de sortides, fletxes als costats, girar a
«Document», barra que s'amaga, sense «Amplia», sense disposició horitzontal) i les tres preguntes de
§9b. **§9b respost** (mateix dia), amb dues decisions noves (D1, D2). **Esbós v3**: les aplica i hi
deixa les dues preguntes de §9c, **respostes** el mateix dia.

- `docs/esbos-vista-mobil.html`: un esbós interactiu (com `esbos-columna-vista.html`) amb el full,
  el panell i les tres alçades, que es pugui obrir **al mòbil i a la tauleta** i provar amb el dit.
  Ha de tenir una pàgina de dues files i una de vertical, que són els casos de §1.
- Respondre les preguntes de §9 i apuntar-les allà amb data.

**Fet quan**: l'esbós s'ha provat en un telèfon i en una tauleta reals i §9 té les respostes.

### Fase 2 — L'estàndard, escrit · porta: aprovació del text

✅ **Aprovat** (2026-11-15). **Escrit** el mateix dia: tres seccions noves a `capes-flotants.md` (panell de
baix, capa del mòbil girat, fletxa de la vora), F14 a `ESTANDARD-capes-flotants.md` i dues notes
a `configuracions.md`, totes marcades «⏳ Proposta». **El `CLAUDE.md` no es toca fins a l'aprovació**:
és l'índex que llegeix cada sessió, i una regla en proposta hi semblaria una regla en vigor.

- Els canvis de §5, marcats «Proposta».
- C29 del backlog passa a «En curs».

**Fet quan**: el text és aprovat. A partir d'aquí, el codi segueix l'estàndard, no al revés.

### Fase 3 — `AppBottomSheet`, sol ✅ Feta (2026-11-15)

**Com ha quedat**:

- `components/AppBottomSheet/`: el component (`AppBottomSheet.tsx`), les parades i el gest
  (`bottomSheetSnap.ts`, lògica pura) i el que queda visible amb el teclat virtual
  (`useVisibleViewport.ts`, sobre `visualViewport`). Controlat des de fora (`snap` i
  `onSnapChange`), i **sense cap text propi**: el nom de la regió, el botó i la franja els passa qui
  el munta, de manera que els textos nous als cinc idiomes arriben a la fase 4 amb la vista.
- **Panell sempre de l'alçada de sencer, baixat amb un `transform`**; el contingut reserva al final
  el tros que queda sota la pantalla, perquè l'últim ajust s'hi pugui arribar a mig. Plegat, el
  contingut s'amaga (`hidden`) en acabar la transició: no es tabula ni es llegeix el que no es veu.
- **Un gest ràpid** (més de 0,5 px/ms) va a la parada següent en aquella direcció; un de lent, a la
  més propera (el criteri de l'esbós). Tocar la capçalera sense moure el dit més de 6 px és un toc, i
  el botó el rep; després d'arrossegar, el `click` que en surt no prem res.
- **Una peça nova a `FloatingLayer`, el terra** (`setFloatingFloor`, `--app-floating-floor`), a més
  de la reserva (`setFloatingInset`) que demanava el pla. El botó d'estat i els avisos (via
  `floatingSnackbarSx`) llegeixen el terra, no la reserva: la reserva també la declaren els avisos, i
  el botó d'estat hauria saltat amunt cada cop que en sortís un. L'estàndard ja ho diu.
- **El senyal per a la barra**: `setFloatingRaised` i `useFloatingRaised`, també a `FloatingLayer`.
  Ningú no l'escolta encara (fase 4).
- **La franja de sencer** porta un vel fosc nou de `palette.ts` (`bottomSheetStrip`), al 72 % perquè
  el text blanc hi faci 7,3:1 damunt del full; el 55 % de l'esbós es quedava a 4:1.
- **Proves**: `AppBottomSheet.test.tsx` i `bottomSheetSnap.test.ts` (alçades, botó, `aria-expanded`,
  teclat, Escape que no el mou, no modal, reserva, terra i senyal) i `e2e/bottom-sheet.spec.ts`, amb
  el dit de debò (CDP) en un Pixel 7 i un iPad Mini emulats: plegat, mig al 50 %, el botó d'estat
  damunt, arrossegar a sencer i la franja que torna, el gest lent, baixar a plegat, l'scroll de dins
  que no mou el panell, i res al paper. L'e2e munta el panell en un arnès,
  `e2e/harness/bottom-sheet.html`, que serveix el servidor de desenvolupament i no entra al build.
- **Per a la fase 5**: Chromium emulat es menja el primer toc que segueix un arrossegament ràpid (el
  pren per un toc per aturar el «fling»). L'e2e ho evita aturant el dit abans d'aixecar-lo; cal
  mirar en un mòbil de debò si la franja respon al primer toc després d'arrossegar.

- `components/AppBottomSheet/`: el component genèric, sense saber res de la vista. Alçades,
  nansa, botó, teclat, `useFloatingInset`, `dvh` i `visualViewport` (el teclat virtual).
- **Construït a mà, no amb `SwipeableDrawer` de MUI**: aquell és un drawer temporal, amb fons que
  tapa i bloqueja la pàgina, i la variant persistent no llisca. El que cal és una capa no modal amb
  una nansa: pocs `pointer events` i una transició de `transform`.
- Proves: unitàries (alçades, botó, `aria-expanded`, teclat) amb `renderWithProviders`, i un e2e de
  Playwright amb un mòbil emulat (Pixel 7) i una tauleta (iPad Mini).
- `DocumentStatusFab` llegeix la reserva com ja fan els avisos.

**Fet quan**: el component passa les proves sol i el `typecheck` és net.

### Fase 4 — La vista, migrada ✅ Feta (2026-11-15)

**Com ha quedat**:

- **L'escenari del mòbil** (`ViewSquenceSettings`, per sota de `md`): una capa fixa entre la barra de
  dalt i el panell, amb la capçalera de la pàgina i l'espai del full. El que hi ha a sota no fa
  scroll (`html, body { overflow: hidden }` mentre la vista és muntada, només a pantalla). La vora de
  baix és `min(terra del panell, 50dvh)`: a sencer, el full es queda a la mida de mig i el panell el
  tapa. L'espai del full es mesura (`useElementSize`, a `usePageView`) i `useScaleCalculator` té un
  camí nou, `availableHeight`, que hi encongeix el full sencer.
- **La columna no sap on la munten**: els nivells són un sol fragment que va a la columna de
  l'escriptori o dins d'`AppBottomSheet`, amb les molles a la capçalera del panell. L'escriptori no
  canvia (s'hi ha comprovat el mateix e2e de captures que abans).
- **La fila de dalt** és la capçalera de la pàgina (`PageHeader`, amb el títol «Pàgina N de M», el
  repartiment, afegir i el menú) amb les sortides al final (`actions`). Girar el full és una fila
  d'orientació al nivell «Document», a *Format de pàgina*, només al mòbil. Les fletxes que la
  capçalera portava al costat del títol s'han tret: les substitueixen les de la vora.
- **El toc**: el context de selecció té un senyal nou, `requestSettings` («obre els ajustos d'aquest
  nivell»), que la vista escolta per portar el panell a mig. `PlacementBox` el demana amb un toc, o
  amb un doble toc a la disposició lliure (`useOpenOnTap`, 350 ms); `SelectableSequence`, sempre amb
  un toc; Enter i Espai, sempre. Tocar l'espai del full fora dels blocs treu la selecció i obre el
  nivell «Pàgina» (D2, N5).
- **La vora i la pantalla completa**: `EdgePageArrows` (fora del full, a `FreeLayoutPages`) surt en
  tocar el 15 % de cada costat i s'amaga als 2 s; és sempre a l'ordre de tabulació. **La pantalla
  completa ara és del contenidor de totes les pàgines** (`PAGES_FULLSCREEN_ID`), que n'ensenya
  l'activa: així s'hi llisca i s'hi toca la vora (N1). La pàgina única continua posant a pantalla
  completa el seu marc.
- **La barra de l'app**: `HideOnScroll` també escolta `useFloatingRaised`.
- **La capa del mòbil girat**: `components/RotatePhoneOverlay/`, genèrica (el text el posa qui la
  munta). Es mostra amb `(orientation: landscape) and (pointer: coarse) and (max-height: 500px)`, no
  amb `md`: un mòbil girat pot passar de 900 px. Dos colors nous a `palette.ts`: `rotateVeil` i
  `edgeArrow`.
- **Esborrat**: `MOBILE_PREVIEW_PEEK`, el verd amb alçada pròpia i el seu `marginBottom` negatiu,
  l'`overscrollBehavior`, el `top: -12` de les molles, `BlockSettingsLink` i el seu text.
- **De pas**: `useWindowResize` cau a `innerWidth` quan `clientWidth` és zero (jsdom). Abans, les
  proves de la vista corrien sense voler-ho amb la disposició del mòbil.
- **Proves**: `ViewSequencesSettings.test.tsx` (el panell plegat, mostrar-lo, les sortides, girar a
  «Document», tocar el full) i `e2e/mobile-view.spec.ts` al Pixel 7 i l'iPad Mini: els tres casos de
  §1, la fila de dalt i la barra, la fletxa de la vora, lliscar a la pantalla completa (N1) i la capa
  del mòbil girat.

**Retocs després de provar-la** (mateix dia):

- **Les sortides van en una fila pròpia, a dalt de tot**, per damunt de la capçalera de la pàgina
  (títol, repartiment, afegir, menú). **S'amaguen amb la barra de l'app** quan el panell puja, i el
  full en guanya l'alçada. La capçalera de la pàgina torna a ser la de sempre.
- **«Afegeix una pàgina» és sota el full**, com a l'escriptori.
- **El botó del panell («Mostra / Amaga els ajustos») és amagat a la vista**: hi és per al teclat i
  el lector de pantalla, i es veu quan rep el focus.
- **La capa del mòbil girat segueix el tema**: el fons de l'escriptori translúcid, blanc en clar i
  negre en fosc (`rotateVeil`).
- **Els punts de la quadrícula del mode lliure són translúcids** (`sheetGridDot`), perquè es vegin
  menys.
- **L'escenari comença sota els bàners de l'app** (l'estil propi del document, verificar el correu…):
  són al flux de la pàgina i l'escenari, fix, els tapava. Quan el panell puja, l'escenari (opac)
  hi passa per damunt fins que torna a baixar.

**Troballes per a la fase 5** (totes tres resoltes a la fase 5):

- **Els avisos tapen la franja de sencer.** Suren damunt del terra del panell; a sencer, el terra és
  a 64 px de dalt i un avís («Fitxer carregat correctament») cau damunt de «Torna al full». L'e2e
  espera que marxi.
- **El zoom del doble toc** no s'ha tocat (`touch-action`), com diu la fase 5.
- **Amb el teclat, la fletxa de la vora que es prem pot desaparèixer** en arribar a la primera o
  l'última pàgina, i el focus es perd.


- Per sota de `md`, la columna va dins d'`AppBottomSheet`. Les molles, a la capçalera del panell.
- La pàgina de vista deixa de desplaçar-se al mòbil; el full s'escala per cabre a sobre del panell
  (`useScaleCalculator` amb l'alçada disponible, un camí nou al costat del de l'escriptori).
- Seleccionar porta el panell a mig i la targeta a dalt del panell.
- **La fila de sobre del full** (M4): imprimir, PDF, pantalla completa i «Pàgina N de M». **Girar el
  full** passa a una fila d'orientació al nivell «Document», a *Format de pàgina*. Les **fletxes dels
  costats** del full (N4) s'afegeixen al lliscament que ja fa `FreeLayoutPages`, i el lliscament
  arriba a la **pantalla completa** (N1), que avui és només un `requestFullscreen` del marc del full.
- **Un toc i doble toc** (D1) a `PlacementBox` i `SelectableSequence`, i **tocar el full** porta al
  nivell «Pàgina» (D2).
- **La capa del mòbil girat** (N3).
- **La barra de l'app** (M5): `HideOnScroll` (`BarNavigation`) avui només escolta l'scroll de la
  finestra. Cal que també la pugui amagar el panell, sense que la vista sàpiga res de la barra: un
  senyal genèric (com `useFloatingInset` per a les capes) i no una crida directa.
- **S'esborra el que ja no cal**: `MOBILE_PREVIEW_PEEK`, el `height: 100dvh` del verd, el
  `marginBottom` negatiu, `overscrollBehavior`, el `top: -12` de les molles, `BlockSettingsLink` i
  els seus textos.

**Fet quan**: els tres casos de §1 (tornar al full, arrossegar un bloc, seleccionar la fila de dalt
amb el full vertical) passen en un e2e de mòbil.

### Fase 5 — Els casos difícils ✅ Feta en emulació (2026-11-15) · ⏳ dispositius de debò

**Com ha quedat** (cada cas, amb la prova o la nota de §9d):

- **Els avisos ja no tapen la franja de sencer.** El terra que declara `AppBottomSheet` no passa
  mai de mig: a sencer, els avisos i el botó d'estat suren damunt del contingut a l'alçada de mig, i
  «Torna al full» queda a l'abast. La reserva continua sent la de debò. L'estàndard ho diu
  («Panell de baix»). Proves: unitària a `AppBottomSheet.test.tsx` i e2e amb l'avís de «Fitxer
  carregat» a la vista mentre el panell va a sencer.
- **El que rep el focus dins del panell, el panell el porta a la vista** (`AppBottomSheet`). Era un
  error de debò, no només del teclat virtual: el panell baixa amb un `transform`, i per al navegador
  un camp de la part de baix «ja es veu» encara que sigui sota la pantalla. Es mira en rebre el
  focus (amb el teclat, o en un camp de text) i quan el panell canvia d'alçada amb el focus a dins
  (el teclat virtual en obrir-se). Prova e2e: l'autor del document, enfocat a mig, i després amb la
  finestra encongida com fa Android en obrir el teclat. Sense l'arreglo, el camp queda sota la
  pantalla tant en enfocar-lo com en obrir el teclat (comprovat).
- **El doble toc no fa zoom**: `touch-action: manipulation` a l'espai del full (`FreeLayoutPages`).
  El Chromium d'Android ja no en fa a les pàgines amb `width=device-width`; el Safari de l'iPhone,
  sí. Prova e2e: el valor al full i l'escala del `visualViewport` després d'un doble toc.
- **El focus de la fletxa de la vora**: si la fletxa que es prem amb el focus desapareix (primera o
  última pàgina), el focus passa a l'altra (`EdgePageArrows`). Si el focus era en un altre lloc, no
  l'hi pren. Prova unitària: `EdgePageArrows.test.tsx`.
- **Pantalla completa**: el panell no hi és, tampoc a la pàgina única (e2e: el que hi ha on era el
  panell és la pantalla completa). **Girat**, la pantalla completa funciona, la capa del mòbil girat
  no hi surt, s'hi llisca, i en sortir-ne la capa torna (e2e al Pixel 7).
- **Imprimir i PDF**: ni el panell, ni la fila de sortides, ni les fletxes de la vora no són dins dels
  fulls que captura el PDF (`.preview-content`) ni a la còpia que s'imprimeix (`#print-root`), i al
  paper no es veuen (e2e, amb el panell a mig i la fletxa a la vista).
- **De pas**: el cas 3 de l'e2e fallava de tant en tant amb diversos treballadors alhora. Entre els
  dos `tap` de Playwright hi havia més dels 350 ms del doble toc; no era cap zoom (l'escala era 1).
  Ara el doble toc es torna a provar si no obre els ajustos (`doubleTapToOpen`).

- **Teclat virtual**: escriure l'autor del document. El panell no pot quedar tapat pel teclat.
- **Mòbil en horitzontal**: no es treballa (M6). Es comprova que surt la capa (N3) i que la pantalla
  completa hi funciona sense capa.
- **El doble toc**: que el navegador no hi faci zoom (`touch-action`) i que amb TalkBack i VoiceOver es
  pugui arribar als ajustos pel botó.
- **Pantalla completa d'una pàgina**: el panell no hi ha de sortir. **A l'iPhone, verificar si
  funciona**: el Safari de l'iPhone només deixa posar a pantalla completa un vídeo, i la de la vista
  es basa en `requestFullscreen` del marc del full. A l'iPad sí que funciona. Si a l'iPhone no fa res
  (probablement ja passa avui), cal una pantalla completa simulada: una capa fixa que ocupi tota la
  finestra.
- **Imprimir i PDF des del mòbil**: el panell no surt al paper (ho ha de garantir `usePrintSheet`,
  però es comprova).
- **Lector de pantalla** (TalkBack i VoiceOver): el panell s'anuncia com a regió i el botó diu què
  fa.
- **Tauleta en vertical** (768–900 px): comprovar que el panell hi té sentit (M7).

**Fet quan**: cada cas té una prova o una nota a §9 que diu per què no cal.

### Fase 6 — Tancar

- L'estàndard perd la marca «Proposta». C29 es marca `✅ Resolta`.
- **El `CLAUDE.md`**, a «Regles transversals», a la regla dels diàlegs: «Al mòbil, els ajustos de la
  vista van a `AppBottomSheet`, l'únic panell de baix. No és modal, i cap funció no pot dependre
  d'arribar a sencer.» Fins aquí no hi entra: una regla que el codi no compleix hi semblaria en vigor.
- **Una notícia a Novetats** (decidit el 2026-11-15: la release no surt sense), seguint
  `docs/estandards/noticies.md`, amb captures de mòbil fetes amb `e2e/screenshots/`. Vegeu §11.

## 7. Riscos

| Risc | Per què | Què s'hi fa |
|---|---|---|
| El full queda massa petit a «mig» | Un A4 vertical a la meitat d'un telèfon fa uns 200 × 280 px | Es pot passar a «plegat» d'un gest, i la pantalla completa hi és. Mesurar-ho a l'esbós |
| Gestos que es barallen | Nansa, scroll del panell, lliscament de pàgina i arrossegament de blocs | Cada gest té el seu lloc: la nansa només a la capçalera, el lliscament de pàgina només sobre el full |
| Teclat virtual | `dvh` i `visualViewport` no es comporten igual a iOS i Android | Fase 5, amb dispositius reals |
| El codi de la columna, ja molt gran | `ViewSquenceSettings.tsx` passa de mil línies | El panell és un component a part; la columna no ha de saber on la munten |
| La pantalla completa no existeix a l'iPhone | El Safari de l'iPhone no admet `requestFullscreen` fora dels vídeos | Verificar-ho a la fase 5; si és així, una capa fixa que en faci el paper |
| Una capa nova que trenca la regla «dos diàlegs i cap més» | Algú la podria fer servir de diàleg | L'estàndard diu que és no modal i només per sota de `md` |

## 8. Fora d'abast

- La pàgina d'**edició** (`/create-sequence`). Si el panell funciona aquí, es pot proposar allà,
  però és un pla a part.
- L'escriptori i la tauleta en horitzontal per damunt de `md`. **La fila de dalt de l'escriptori no
  canvia**: girar el full hi continua sent un botó. Si al mòbil funciona com a ajust, es pot proposar
  igualar-ho, en un pas a part.
- **El mòbil en horitzontal com a manera de treballar** (M6): al mòbil, la vista es treballa dreta.
- Canviar el punt de ruptura `md`.

## 9. Decisions (porta de la fase 1) — preses el 2026-11-15

| Id | Pregunta | Decisió |
|---|---|---|
| M1 | Com es diu, a la interfície i al codi | **«Ajustos»** a la interfície (el botó i el nom de la regió); `AppBottomSheet` al codi |
| M2 | Les alçades exactes | Plegat: la capçalera. **Mig: el 50 % de la pantalla, però guanyant-hi la barra de l'app**, que s'amaga (M5). Sencer: tot menys 64 px de franja |
| M3 | Com s'arriba a «sencer» sense arrossegar | **Només arrossegant.** No hi ha botó «Amplia». És accessible perquè sencer no dona res que mig no tingui (§4, «Moure el panell») |
| M4 | On van girar, imprimir, PDF i pantalla completa | **A sobre del full, però només les sortides del document**: imprimir, PDF i pantalla completa, amb la pàgina on s'és. **Passar de pàgina tocant als costats i lliscant. Girar el full va als ajustos** («Document», *Format de pàgina*) |
| M5 | La barra de dalt de l'app | **S'amaga quan el panell puja a mig o a sencer**, i torna quan baixa a plegat (N2) |
| M6 | El mòbil en horitzontal | **No és una manera de treballar al mòbil**: surt una capa que demana girar-lo (N3) |
| M7 | Tauleta en vertical (768–900 px): panell o columna? | **Panell**, com el telèfon |
| M8 | Seleccionar quan el panell és plegat: puja sol a mig? | **Sí, amb un toc; a la disposició lliure, amb un doble toc** (D1) |
| M9 | Fase 0: la franja de 96 px, es deixa o es treu? | **Es queda** fins a la fase 4 |
| E1 | Quan el panell puja, el full s'encongeix o queda tapat? | **S'encongeix** per cabre sencer a sobre del panell |

### 9b. Decisions de l'esbós v2 — preses el 2026-11-15

| Id | Pregunta | Decisió |
|---|---|---|
| N1 | Com es passa de pàgina | **Lliscant**, com avui, **i també a la pantalla completa**. A més, **tocar a la vora** del mòbil fa sortir una fletxa **semitransparent** uns segons: si es toca, passa de pàgina; si no, desapareix |
| N2 | Què torna la barra de l'app | **Només baixar el panell a plegat** |
| N3 | Què passa si es gira el mòbil | **Una capa blanca translúcida amb una icona animada de girar el mòbil** |
| D1 | Tocar un bloc a la disposició lliure | **Un toc el selecciona (per moure'l); un doble toc obre els ajustos.** Només a la lliure: a les altres, un toc ja els obre |
| D2 | Tocar el full fora dels blocs | **Porta al nivell «Pàgina»** del panell |

### 9c. Decisions de l'esbós v3 — preses el 2026-11-15

| Id | Pregunta | Decisió |
|---|---|---|
| N4 | Quant de temps es veu la fletxa de la vora | **2 segons**, i es torna a comptar cada cop que es passa de pàgina |
| N5 | Tocar el full (D2) puja el panell, com tocar un bloc? | **Sí**, amb la mateixa regla: un toc; a la disposició lliure, doble toc |

**Precisió** (2026-11-15): a la pantalla completa, l'única cosa que es fa és passar de pàgina.

### 9d. Fase 5: el que necessita un dispositiu de debò — ⏳ pendent (2026-11-15)

L'emulació de Chromium no ho pot dir. Cada fila, quan es provi al servidor de proves, s'omple amb el
resultat i la data.

| Id | Cas | Què cal fer al dispositiu | Què s'espera | Resultat |
|---|---|---|---|---|
| F5a | **Pantalla completa a l'iPhone** | A la vista, «Aquesta pàgina a pantalla completa» | **Probablement no fa res**: el Safari de l'iPhone només deixa posar a pantalla completa un vídeo, i `enterPageFullscreen` crida `requestFullscreen` amb `?.`, que en falta no fa res i no diu res. Si es confirma, el botó trenca «tota acció acaba amb un missatge», i la proposta és la pantalla completa simulada (una capa fixa que ocupi tota la finestra, on també es llisqui i es toqui la vora). **Cal decidir-ho abans de la fase 6** | ⏳ |
| F5b | **TalkBack (Android) i VoiceOver (iOS)** | Recórrer la vista amb el lector; trobar el botó «Mostra els ajustos»; activar-lo; selecciona un bloc amb el doble toc del lector | El panell s'anuncia com a regió «Ajustos»; el botó amagat s'hi troba, diu si és desplegat, i puja el panell; les fletxes de la vora s'hi troben | ⏳ |
| F5c | **Teclat virtual a iOS i Android** | Escriure l'autor del document amb el panell a mig i a sencer | El camp no queda mai sota el teclat. A Android ho cobreix l'e2e (la finestra s'encongeix); al Safari d'iOS la finestra no s'encongeix i el panell segueix el `visualViewport`, que l'emulació no reprodueix | ⏳ |
| F5d | **La franja després d'arrossegar** | Arrossegar el panell a sencer d'un gest ràpid i tocar de seguida «Torna al full» | Respon al primer toc. A Chromium emulat no (es menja el toc que segueix un «fling»); els e2e aturen el dit abans d'aixecar-lo | ⏳ |
| F5e | **Tauleta en vertical** (768–900 px, M7) | Treballar una estona amb la vista en una tauleta dreta | El panell hi té sentit (amb el full prou gran a mig). Si no, es pot proposar la columna per a la tauleta, en un pas a part | ⏳ |
| F5f | **El doble toc a l'iPhone** | Doble toc a un bloc de la disposició lliure | Obre els ajustos i la pàgina no s'amplia (`touch-action: manipulation`) | ⏳ |

## 10. Encàrrec per a la sessió següent

**Què**: dues coses, en aquest ordre.

1. **Les proves en dispositius de debò** (§9d). Les fa l'usuari al servidor de proves; la sessió
   n'apunta el resultat a §9d amb data. **F5a (la pantalla completa a l'iPhone) demana una decisió**:
   si es confirma que no fa res, cal decidir si es fa la pantalla completa simulada (i fer-la, amb
   prova) o si el botó no surt allà on no funciona. Les altres, si van bé, només s'apunten; si no,
   cada una és una troballa nova al backlog o un retoc amb prova.
2. **La fase 6** (§6): treure la marca «⏳ Proposta» de `capes-flotants.md`, `configuracions.md` i
   F14; la regla al `CLAUDE.md`; C29 a `✅ Resolta`. Les notícies (§11) van després.

**On**: **a la branca de la release, `claude/release-before-new-plan-8x1xhp`**, que ja porta les
fases 3, 4 i 5. Si la sessió nova té assignada una altra branca, ha de partir de la de la release,
no de `main`.

**Què cal llegir abans**, i res més:

1. Aquest pla: §4 (el model), §9 (les decisions, i §9d, el que queda per provar) i la fase 5 de §6
   tal com ha quedat.
2. `docs/estandards/capes-flotants.md`: «Panell de baix», «La capa del mòbil girat» i «La fletxa de
   la vora».
3. Per a F5a, `features/free-layout/hooks/usePageView.ts` (`enterPageFullscreen`,
   `useFullscreenElementId`) i `FreeLayoutPages.tsx`.

**Fet quan**: §9d té tots els resultats; F5a té decisió i, si cal, codi amb prova; la fase 6 és
feta; `npm run typecheck` net; `npm run lint` sense errors nous als fitxers tocats;
`e2e/mobile-view.spec.ts` i `e2e/bottom-sheet.spec.ts` en verd.

**Avisos de l'entorn del núvol**:

- Playwright necessita `launchOptions: { executablePath: "/opt/pw-browsers/chromium" }`: un fitxer de
  configuració local que estengui `playwright.config.ts`, sense pujar-lo. Els e2e esperen
  `npx vite` a `localhost:5173`, i cal llançar-los amb `--timeout 90000` (el config en té 10 minuts).
- **Si es fa `git stash` amb el servidor engegat, cal reiniciar-lo**: es queda amb els catàlegs de
  `packages/i18n` d'abans i els textos nous surten en anglès.
- Les 8 captures de `saac-fixtures.spec.ts` («la vista es pinta igual que abans») ja fallen a
  l'entorn del núvol sense cap canvi: no són d'aquesta feina.
- Les proves unitàries corren en anglès (els noms accessibles, «Next page»…); els e2e, en català.

## 11. La release

**Decidit el 2026-11-15**: la release que ve **no surt sense la vista al mòbil i sense les novetats al
dia**. És la release d'abans del pla següent, «Estil i contingut dels blocs» (`docs/PLA-mode-lliure.md`,
§13, «El pas següent»), que no es comença fins que aquesta és publicada. El desplegament és al
servidor de proves, i per tant cada pas es pot provar allà a mesura que s'acaba.

| Què | Estat | On és el detall |
|---|---|---|
| Seleccionar no mou la pàgina, enllaç «Ajustos del bloc» | ✅ Fet | Fase 0 d'aquest pla |
| `AppBottomSheet`, sol i amb proves | ✅ Fet | Fase 3 d'aquest pla |
| La vista al mòbil: la migració de la vista | ✅ Fet | Fase 4 d'aquest pla |
| La vista al mòbil: els casos difícils | ✅ Fet en emulació · ⏳ dispositius de debò (§9d) | Fase 5 d'aquest pla |
| L'estàndard sense la marca «Proposta» i la regla al `CLAUDE.md` | ⏳ Per fer | Fase 6 d'aquest pla |
| **Notícia de les pàgines i la disposició** (simple, columnes, files, lliure) | ⏳ Per fer | `docs/PLA-mode-lliure.md`, §13, «Què queda obert»; en publicar-la, es treu l'etiqueta «Nou» de la fila «Disposició» (pas 8) |
| **Notícia de la vista al mòbil** | ⏳ Per fer | Fase 6 d'aquest pla |
| **Captures de la notícia de diverses seqüències** (`multiple-sequences`), que ensenyen una vista que ja no és així | ⏳ Per fer | `docs/PLA-mode-lliure.md`, §13 |
| Les tres notícies de compte (N1 del backlog) | Fora | Ajornades mentre els comptes siguin apagats |

**Les notícies es decideixen al seu moment** (2026-11-15): quines, quantes i com, quan la vista al
mòbil sigui acabada. Les files de la taula són el punt de partida, no una decisió.

**Proposta d'ordre**: primer la vista al mòbil (fases 3 a 6), i després les notícies, perquè les
captures de totes dues notícies han de mostrar la vista ja acabada. Les dues notícies es poden
publicar juntes, o una sola que ho expliqui tot; ho decideix `docs/estandards/noticies.md` i qui les
escrigui, amb `docs/NOTICIES-candidates-des-de-2.0.2.md` com a referència de to.

