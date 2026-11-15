# Pla: la vista al mòbil — el full a la pantalla i els ajustos en un panell de baix

> **Estat**: proposta (2026-11-15), **pendent d'aprovació**. No s'ha escrit cap línia de codi
> d'aquest pla. Cada fase té una **porta**: no es passa a la següent fins que la decisió que la
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
│ ⟲ 🖨 PDF ⛶   │     │ ⟲ 🖨 PDF ⛶   │        │ ▔▔ full ▔▔▔▔ │ ← una franja: tocar-la
│┌────────────┐│     │ ┌──────────┐ │        ├──────────────┤   torna a MIG
││ ▢▢▢  ▢▢▢   ││     │ │▢▢▢ [▢▢▢] │ │        │ Doc › Pàg › S│
││            ││     │ └──────────┘ │        │ SEQÜÈNCIA 2  │
││ ▢▢▢  [▢▢▢] ││     ├──── ══ ──────┤        │ Mida ──●──── │
│└────────────┘│     │ Doc › Pàg › S│        │ Espai ─●──── │
├──── ══ ──────┤     │ SEQÜÈNCIA 2  │        │ Alineació H  │
│ Doc › Pàg › S│     │ Mida ──●──── │        │ …            │
└──────────────┘     └──────────────┘        └──────────────┘
```

### La pàgina no es desplaça

Al mòbil, la vista deixa de tenir scroll de pàgina. **El full s'escala per cabre sencer a l'espai que
queda a sobre del panell** (amplada i alçada), no només per amplada. Sense scroll de pàgina, no hi ha
res a perdre: els problemes 1 i 2 de §1 desapareixen, no s'arreglen.

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

- Tocar un bloc del full: si el panell és **plegat**, puja a **mig**; si és **sencer**, baixa a
  **mig**, perquè el bloc es vegi. El verd porta la targeta del bloc a dalt (scroll de dins del
  panell, mai de la pàgina).
- Com que a **mig** el full sencer cap a la meitat de dalt, **el bloc tocat sempre és a la vista**,
  sigui on sigui de la pàgina i sigui quina sigui l'orientació (problema 3).
- Treure la selecció (tocar fora, Escape) no mou el panell.

### Moure el panell

- **Arrossegant la nansa o la capçalera** (les molles). El contingut del panell no mou el panell: s'hi
  fa scroll i s'hi mouen els lliscadors sense que el panell se'n vagi.
- **Amb un botó** a la capçalera, que alterna plegat ↔ mig i diu què farà («Mostra els ajustos» /
  «Amaga els ajustos»), amb `aria-expanded`. A sencer s'hi arriba arrossegant o des d'un segon botó
  (decisió M3).
- **Amb el teclat**: el botó és a l'ordre de tabulació; Escape continua treient la selecció.

### El que conviu amb el panell

- **El botó d'estat i els avisos flotants pugen damunt del panell.** El panell declara la seva
  alçada amb el mecanisme que ja existeix (`useFloatingInset`), i el botó d'estat passa a llegir-la
  com ja fan els avisos. Avui el botó és ancorat a baix de tot i quedaria tapat.
- **Lliscar en horitzontal sobre el full** continua passant de pàgina, i ara té més lloc.
- **Arrossegar blocs** continua igual: la pàgina ja no es desplaça, i el gest no té competència.

## 5. Com canvia l'estàndard (cal aprovar-ho abans del codi)

Un panell de baix és una **capa flotant nova**. L'estàndard de capes flotants diu que hi ha dos
diàlegs canònics i cap més, i deixa el drawer fora. Aquest panell no és cap de les dues coses: és una
tercera forma, i per tant un **tercer component canònic**, no una excepció.

| Document | Què hi canvia |
|---|---|
| `docs/estandards/capes-flotants.md` | Secció nova **«Panell de baix»**: `AppBottomSheet` (a `components/`, genèric, sense domini) és l'única manera de fer-ne un. Tres alçades; mai tapa el full sencer; no modal (`role="region"` amb nom); es mou amb la nansa, amb un botó i amb el teclat; declara l'alçada amb `useFloatingInset`; el botó d'estat i els avisos s'hi posen damunt. Només per sota de `md`. A «Estat de migració», la vista |
| `docs/ESTANDARD-capes-flotants.md` | Una troballa nova, **F14**, amb el que hi ha a §1: és la raó de la regla |
| `docs/estandards/configuracions.md` | La columna de la vista: «al mòbil va sota el full» passa a «al mòbil va al panell de baix». La frase «Al mòbil, seleccionar no mou la pàgina: l'enllaç "Ajustos del bloc" hi porta» passa a «seleccionar porta el panell a mig, i el full sencer hi queda a sobre» |
| `docs/estandards/estructura-de-fitxers.md` | Res de nou: un component genèric va a `components/`. Només s'hi comprova |
| `CLAUDE.md` | A «Regles transversals», a la regla dels diàlegs: «al mòbil, els ajustos de la vista van a `AppBottomSheet`, l'únic panell de baix» |
| `docs/esbos-columna-vista.html` | La pregunta «Al mòbil la columna és sota el full. Què passa en seleccionar un bloc?» passa a apuntar a aquest pla |

**Com s'aprova**: el text de l'estàndard s'escriu primer marcat **«Proposta»** (fase 2) i només
perd la marca quan l'esbós (fase 1) s'ha provat en un mòbil i una tauleta de debò i les decisions de
§9 són preses.

## 6. Fases

### Fase 0 — Deixar la release com ha de ser (abans de publicar)

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

### Fase 1 — Esbós i decisions · porta: §9 respost

- `docs/esbos-vista-mobil.html`: un esbós interactiu (com `esbos-columna-vista.html`) amb el full,
  el panell i les tres alçades, que es pugui obrir **al mòbil i a la tauleta** i provar amb el dit.
  Ha de tenir una pàgina de dues files i una de vertical, que són els casos de §1.
- Respondre les preguntes de §9 i apuntar-les allà amb data.

**Fet quan**: l'esbós s'ha provat en un telèfon i en una tauleta reals i §9 té les respostes.

### Fase 2 — L'estàndard, escrit · porta: aprovació del text

- Els canvis de §5, marcats «Proposta».
- C29 del backlog passa a «En curs».

**Fet quan**: el text és aprovat. A partir d'aquí, el codi segueix l'estàndard, no al revés.

### Fase 3 — `AppBottomSheet`, sol

- `components/AppBottomSheet/`: el component genèric, sense saber res de la vista. Alçades,
  nansa, botó, teclat, `useFloatingInset`, `dvh` i `visualViewport` (el teclat virtual).
- **Construït a mà, no amb `SwipeableDrawer` de MUI**: aquell és un drawer temporal, amb fons que
  tapa i bloqueja la pàgina, i la variant persistent no llisca. El que cal és una capa no modal amb
  una nansa: pocs `pointer events` i una transició de `transform`.
- Proves: unitàries (alçades, botó, `aria-expanded`, teclat) amb `renderWithProviders`, i un e2e de
  Playwright amb un mòbil emulat (Pixel 7) i una tauleta (iPad Mini).
- `DocumentStatusFab` llegeix la reserva com ja fan els avisos.

**Fet quan**: el component passa les proves sol i el `typecheck` és net.

### Fase 4 — La vista, migrada

- Per sota de `md`, la columna va dins d'`AppBottomSheet`. Les molles, a la capçalera del panell.
- La pàgina de vista deixa de desplaçar-se al mòbil; el full s'escala per cabre a sobre del panell
  (`useScaleCalculator` amb l'alçada disponible, un camí nou al costat del de l'escriptori).
- Seleccionar porta el panell a mig i la targeta a dalt del panell.
- **S'esborra el que ja no cal**: `MOBILE_PREVIEW_PEEK`, el `height: 100dvh` del verd, el
  `marginBottom` negatiu, `overscrollBehavior`, el `top: -12` de les molles, `BlockSettingsLink` i
  els seus textos.

**Fet quan**: els tres casos de §1 (tornar al full, arrossegar un bloc, seleccionar la fila de dalt
amb el full vertical) passen en un e2e de mòbil.

### Fase 5 — Els casos difícils

- **Teclat virtual**: escriure l'autor del document. El panell no pot quedar tapat pel teclat.
- **Mòbil en horitzontal** (844 × 390): amb 390 px d'alçada, «mig» no deixa lloc per a res (M6).
- **Pantalla completa d'una pàgina**: el panell no hi ha de sortir.
- **Imprimir i PDF des del mòbil**: el panell no surt al paper (ho ha de garantir `usePrintSheet`,
  però es comprova).
- **Lector de pantalla** (TalkBack i VoiceOver): el panell s'anuncia com a regió i el botó diu què
  fa.
- **Tauleta en vertical** (768–900 px): comprovar que el panell hi té sentit (M7).

**Fet quan**: cada cas té una prova o una nota a §9 que diu per què no cal.

### Fase 6 — Tancar

- L'estàndard perd la marca «Proposta». C29 es marca `✅ Resolta`.
- Si es decideix publicar-ho, una notícia a Novetats seguint `docs/estandards/noticies.md`, amb
  captures de mòbil fetes amb `e2e/screenshots/`.

## 7. Riscos

| Risc | Per què | Què s'hi fa |
|---|---|---|
| El full queda massa petit a «mig» | Un A4 vertical a la meitat d'un telèfon fa uns 200 × 280 px | Es pot passar a «plegat» d'un gest, i la pantalla completa hi és. Mesurar-ho a l'esbós |
| Gestos que es barallen | Nansa, scroll del panell, lliscament de pàgina i arrossegament de blocs | Cada gest té el seu lloc: la nansa només a la capçalera, el lliscament de pàgina només sobre el full |
| Teclat virtual | `dvh` i `visualViewport` no es comporten igual a iOS i Android | Fase 5, amb dispositius reals |
| El codi de la columna, ja molt gran | `ViewSquenceSettings.tsx` passa de mil línies | El panell és un component a part; la columna no ha de saber on la munten |
| Una capa nova que trenca la regla «dos diàlegs i cap més» | Algú la podria fer servir de diàleg | L'estàndard diu que és no modal i només per sota de `md` |

## 8. Fora d'abast

- La pàgina d'**edició** (`/create-sequence`). Si el panell funciona aquí, es pot proposar allà,
  però és un pla a part.
- L'escriptori i la tauleta en horitzontal per damunt de `md`.
- Canviar el punt de ruptura `md`.

## 9. Decisions per prendre (porta de la fase 1)

| Id | Pregunta | Proposta |
|---|---|---|
| M1 | Com es diu, a la interfície i al codi | «Ajustos» a la interfície (el botó i el nom de la regió); `AppBottomSheet` al codi |
| M2 | Les alçades exactes | Plegat: la capçalera (unes molles). Mig: el 50 % de la pantalla. Sencer: tot menys 64 px de franja. Es fixen a l'esbós |
| M3 | Com s'arriba a «sencer» sense arrossegar | Un segon botó a la capçalera, «Amplia», només a mig |
| M4 | On van els botons de la vista (girar, imprimir, PDF, pantalla completa) | On són ara, a sobre del full: el panell no els tapa mai |
| M5 | La barra de dalt de l'app | Sense scroll de pàgina, `HideOnScroll` ja no l'amaga mai: es queda (42 px). Confirmar-ho a l'esbós |
| M6 | El mòbil en horitzontal | El panell, a la dreta, com la columna de l'escriptori però damunt del full. Decidir-ho a l'esbós |
| M7 | Tauleta en vertical (768–900 px): panell o columna? | Panell, com el telèfon: amb el full vertical, la columna sota el full hi té el mateix problema |
| M8 | Seleccionar quan el panell és plegat: puja sol a mig? | Sí. Si molesta a l'esbós, es deixa plegat i les molles canvien |
| M9 | Fase 0: la franja de 96 px, es deixa o es treu? | Es deixa fins a la fase 4: no fa mal i ajuda als fulls sense blocs |
