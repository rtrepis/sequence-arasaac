# Feedback d'operacions i accions destructives

> **Quan llegir-lo:** abans d'afegir un indicador de progrés, un snackbar, un backdrop o qualsevol acció que esborri feina.

## Estàndard de feedback d'operacions

Font única de veritat: `context/FeedbackContext/`. Quatre mecanismes i un criteri per triar-los —
**quant de temps dura l'operació i què pot fer l'usuari mentrestant**, mai «com d'important és».

| Mecanisme | Quan | Precedents |
|---|---|---|
| **Backdrop amb missatge + snackbar al final** | L'operació **impedeix seguir treballant** (bloqueja el fil principal o l'app no té sentit fins que acabi) | desa i carrega al núvol, i carrega `.saac` (`AppNavigationDrawer`), genera el PDF (`useDownloadPdf`) |
| **Snackbar sol** | Final d'acció instantània, èxit i error | descarrega `.saac`, `ApplyAll`, vocabulari, esborrany |
| **Progress determinat** | Hi ha **N passos comptables** | `useSequentialSearch` (N paraules) |
| **Spinner al botó + `aria-busy`** | El botó és l'únic que canvia i **l'app segueix viva** | `UploadImageButton` |

Regles:

- **Tota acció que l'usuari ha demanat acaba amb un missatge**, tant si va bé com si no. L'estat
  final no pot ser idèntic a l'inicial: la confirmació del navegador (barra de descàrregues) no
  compta, perquè a iPadOS gairebé no existeix.
- **El feedback viu al hook, no al component**, quan l'operació té hook propi (`useSaveUiSettings`,
  `useDocumentDraft`, `useDownloadPdf`): el hook crida `useFeedback()` i porta el seu `.lang.ts`.
- **El missatge del backdrop és concret, mai un «Carregant…» genèric**: si el servidor de Render
  dorm o la captura triga, aquell text pot ser l'únic que l'usuari tingui davant durant mig minut.
- **L'error porta el codi visible** (`{code}`) i dura més que una confirmació (10 s): s'ha de poder
  llegir i, si cal, dictar per telèfon, sense obrir una consola que al mòbil no existeix.
- **Tota fallada que arriba a l'usuari es reporta** amb `reportClientError`, també les que no venen
  de cap petició HTTP: el `context` de l'API és string lliure, així que afegir-n'hi una de nova és
  una línia a `ClientErrorContext` i res al backend.
- **Mai `disabled` per dir «s'està fent»**: un botó desactivat surt de l'ordre de tabulació i qui
  navega amb teclat el perd sense cap avís. `aria-disabled` + `aria-busy` i guarda al handler.
- **Mai dos indicadors alhora** per a la mateixa operació (backdrop *i* spinner al botó).
- **Mai una barra de progrés que no es pugui moure**: sense passos comptables, spinner.

---

## Estàndard d'accions destructives

L'app **no té desfer**: no hi ha cap `undo` a `features/sequence`. Per això el que protegeix la
feina és on viu cada acció i quan demana permís.

- **El criteri és quant costa refer-ho, mai com sona l'acció.** Treure un pictograma es repeteix
  molt i es refà amb un clic: **no** es confirma. Esborrar una seqüència se'n porta tots els seus:
  **sí**. Posar un diàleg a tot el que sona greu acaba en gent que hi clica sense llegir.
- **`ConfirmDialog`** (`components/ConfirmDialog/`) és la **única** confirmació de l'app. Mai
  escriure un `Dialog` de confirmació a mà: si el criteri de dalt s'ha de poder aplicar, s'ha de
  poder llegir en un sol lloc. Props: `title` (pregunta), `body` (**què es perd, en concret**),
  `confirmLabel`, i `alternative` opcional per a la sortida que evita la pèrdua en comptes de
  consumar-la («Descarrega-ho abans»), que va al mig perquè no és ni acceptar ni cancel·lar.
- **«Cancel·la» és un sol missatge per a tota l'app** (`components.confirmDialog.cancel`), dins del
  propi `ConfirmDialog`. Qui el crida no el passa.
- **Res de confirmar en va**: si no hi ha res a perdre, no es pregunta. `TabsSequences` compta els
  pictogrames **amb contingut** (`selectedId > 0`, imatge pujada o text) i amb la seqüència buida
  esborra directament.
- **El cos diu la xifra, no un avís genèric**: «Té 2 pictogrames…». Qui decideix sovint no està
  mirant el que perdrà.
- **Cap botó no rep el focus inicial**: se'l queda el diàleg (comportament de MUI). Així el lector
  de pantalla llegeix títol i cos i Enter no consuma res. **Mai posar `autoFocus`** al botó
  destructiu ni al de cancel·lar.
- **A les llistes d'accions, la destructiva va sola i l'última**, separada per `Divider` i en
  `error.main` (`MouseActionList`). Un grup buit per `omit` no deixa cap separador penjat.

