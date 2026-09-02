# Capes flotants: diàlegs, avisos i botons flotants

> **Quan llegir-lo:** abans de declarar un `Dialog`, un `Snackbar` o un botó flotant.

Tot el que sura per damunt de la pàgina. Font única de veritat:
`components/AppDialog/`, `components/FloatingLayer/`, `style/appShape.ts` i
`style/floatingControl.ts`. La raó de cada regla és a
`docs/ESTANDARD-capes-flotants.md` (inventari, troballes F1–F13 i pla).

## La forma

- **Un sol radi: `APP_CORNER_RADIUS` (20 px)**, el dels toggles. El porten els
  botons (`StyledButton`), els diàlegs, els avisos i els botons flotants. El del
  diàleg **el posa el tema** (`MuiDialog`): cap diàleg no se l'ha d'escriure al
  seu `sx`. El `fullScreen` en queda fora (`paperFullScreen` a 0).
- `APP_CONTROL_BORDER_WIDTH` (1,75) i `APP_CONTROL_SIZE` (55) completen el joc.
  **No hardcodejar cap d'aquests tres valors** enlloc.
- **Els camps no porten el radi de la casa**: `APP_FIELD_RADIUS` (12 px) per als
  camps de text, els desplegables i els avisos **en línia**, via el tema
  (`MuiOutlinedInput`, `MuiFilledInput`, `MuiAlert`). Un camp és un contenidor
  on s'escriu, no un control que es prem: amb els 20 px s'assemblaria a un botó,
  i amb els 4 de MUI semblava enganxat de fora de la targeta que el conté. Els
  avisos **flotants** en queden fora: porten el radi de la casa des de
  `floatingNoticeSx`, que mana per damunt del tema.

## Diàlegs

- **`AppDialog` és l'única manera de declarar un `Dialog`.** Mai un `Dialog` de
  MUI amb `DialogTitle`/`DialogActions` a mà.
- **Capçalera de tres franges**: una de buida, el títol centrat amb el seu
  distintiu, i la ranura d'icona. Les dues franges laterals fan la mateixa
  amplada perquè el títol quedi centrat **de debò** tant si hi ha acció com si
  no.
- **El títol diu on ets; el distintiu (`badge`) diu sobre què** —el número del
  pictograma—, i **forma part del nom accessible** (`aria-labelledby` amb els dos
  identificadors): «Editar Pictograma 4», no «Editar Pictograma».
- **A la ranura de la capçalera només hi va un menú de més accions. Mai una
  creu de tancar**: tancar viu al peu, en un sol lloc de tota l'app. Amb una
  creu allà, el mateix racó voldria dir dues coses segons el diàleg (F1).
- **Peu (`AppDialogActions`)**: l'acció que no és ni acceptar ni cancel·lar va
  **sola a l'esquerra** (l'esborrat del modal d'edició, `outlined error`; la
  sortida que evita la pèrdua d'un `ConfirmDialog`); a la dreta, tancar o
  cancel·lar en text i, a la seva dreta, l'acció principal en `contained`.
  **Excepció**: quan la destrucció *és* l'acció principal (`ConfirmDialog`), va
  a la dreta i plena.
- **Els botons del peu són `StyledButton`**, i els de text i els `outlined`
  porten **`color="inherit"`**: el verd de la casa sobre el paper es queda a
  **2,1:1** i no es llegeix en tema clar (F11). El verd només al botó ple, on va
  amb `primary.contrastText` (7,2:1).
- **Amplada**: `xs` per a una pregunta o un missatge, `sm` per a un formulari o
  una llista. Sempre `fullWidth`, perquè si no dos diàlegs germans surten de
  mides diferents.
- **`dividers`** (per defecte sí) es treu quan el diàleg només porta un
  missatge: sense estructura a dins, les línies només hi afegeixen pes.
- **`statusSlot`** és per al progrés o l'error que ha de quedar visible entre el
  contingut i el peu: dins d'una llista llarga quedaria fora de pantalla
  justament mentre s'espera.
- **Excepció declarada**: `DefaultSettingsDialog` és `fullScreen` i segueix
  l'estàndard de tabs (barra superior amb tabs i creu, sense peu). Drawer, menús
  i popovers són capes de navegació i queden fora d'aquest estàndard.

## Avisos flotants

- **Una sola aparença** (`floatingNoticeSx`): `Alert variant="outlined"` sobre
  `background.paper` **opac**, amb el radi de la casa i ombra. La severitat la
  diuen la vora i la icona, mai un fons de color.
- **Una sola posició** (`floatingSnackbarSx`): per sota de `sm` l'avís aparta el
  control que hi hagi al racó, i la separació surt de `FLOATING_CONTROL_CLEARANCE`,
  **calculada des dels tokens**. Abans era un 72 escrit a mà a partir dels 48 px
  del botó, i quan el botó ha canviat de mida el número ha deixat de quadrar sense
  que res ho digués.
- **Només s'aparta si hi ha de què apartar-se** (`useFloatingCorner`): qui ocupa
  el racó inferior dret declara la reserva mentre és a la pantalla —el botó
  d'estat a l'editor i al visualitzador, la fletxa dreta a les notícies— i l'avís
  la llegeix d'una variable CSS, igual com el contingut llegeix l'alçada del peu
  de `floatingInset`. Amb el desplaçament escrit a l'`sx` de l'avís, l'aplicava
  **tota** l'app: a la pantalla d'inici, on `BackendWakeUpNotice` també es munta
  —i on el desvetllament de Render és més probable, perquè és on es fa el primer
  login del dia—, l'avís sortia descentrat 79 px apartant-se de res. Sense cap
  control al racó, l'avís es queda als 8 px que MUI li posa per defecte (F13).
- **El que no marxa sol, reserva espai** (`useFloatingInset`): una capa
  `position: fixed` no ocupa lloc al document, i quan la pàgina s'acaba l'última
  fila de pictogrames queda a sota sense cap scroll que la pugui apartar (F12).
  L'alçada es **mesura**, no es calcula: el mateix missatge fa dues línies en
  escriptori i cinc en un telèfon. Les confirmacions de tres segons
  (`FeedbackSnackbar`) **no** reserven res: fer saltar la pàgina cada cop que es
  desa alguna cosa seria pitjor que el que arregla.
- El contingut (`Container` de `BarNavigation`) reserva sempre
  `FLOATING_BOTTOM_INSET` —el que ocupa el botó, que hi és sempre— i, per
  damunt, el que declari la capa més alta.
- **La reserva del final de la pàgina no protegeix qui acaba al mateix racó**:
  amb la pàgina tot just més alta que la finestra —entre 30 i 90 px d'scroll, o
  sigui a 900 i 950 px d'alçada, que són mides de pantalla corrents— el botó
  flotant queia damunt de «Desa com a preferències» de la columna de vista, i cap
  reserva vertical ho arregla, perquè a scroll 0 aquell botó ja és dins la franja
  del flotant. Qui comparteix el racó reserva l'**amplada** del botó
  (`FLOATING_CONTROL_CLEARANCE`), igual que fan els avisos: és el mateix token i
  el mateix criteri, en horitzontal.

## Botons flotants

- **`floatingControlSx` és l'única manera de vestir-ne un**: la forma del toggle
  seleccionat (radi 20, vora d'1,75 i tint del color al 20 %), però **opac**. El
  tint transparent del toggle funciona sobre el gris de configuració; el botó
  flotant sura sobre el full, i amb transparència s'hi veurien passar els
  pictogrames per sota.
- **Una sola àncora**: `FLOATING_EDGE_GAP` (16 px) del cantó, tant per al botó
  d'estat com per a les fletxes de novetats.

## Estat de migració

- ✅ **`PictEditModal`** — la referència: capçalera, distintiu i peu en surten.
- ✅ **`ConfirmDialog`**, **`SettingsSaveErrorDialog`**, **`SaveDocumentModal`**,
  **`LoadDocumentModal`**, **`AuthModal`**, **`ModalDownload`**.
- ✅ **Avisos** — els tres `Snackbar` comparteixen aparença, posició i reserva.
- ✅ **Botons flotants** — `DocumentStatusFab` i les fletxes de `NewsNavBar`.
- ➖ **`DefaultSettingsDialog`** — fora d'abast, amb motiu (estàndard de tabs).
