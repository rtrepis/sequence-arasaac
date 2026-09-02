# Estudi i estàndard de capes flotants

Diàlegs, avisos i botons flotants: tot el que sura per damunt de la pàgina.

És el tercer estàndard de la sèrie, després del de **configuracions**
(`components/SettingsLayout/`) i el de **tabs** (`components/AppTabs/`), i es
llegeix igual que ells: primer l'inventari del que hi ha, després les
divergències trobades amb fitxer i motiu, i al final el patró i el pla de
migració. Les regles que en surtin passaran a `docs/estandards/capes-flotants.md`;
aquest fitxer es queda com la raó de cada regla.

**Estat**: migració feta. L'estàndard viu a `docs/estandards/capes-flotants.md`;
aquest document és el perquè.

---

## 1. Per què ara

L'app té dues marques visuals fortes i totes dues viuen fora de les capes
flotants:

- El **toggle arrodonit** de `StyledToggleButtonGroup` (55×55, radi 20, vora
  d'1,75 px, tint del verd quan està seleccionat). És la marca de la casa: hi ha
  a les configuracions, a la pàgina de vista i al formulari d'edició.
- El **modal d'edició de pictograma** (`Modals/PictEditModal`), que és l'únic
  diàleg amb capçalera pròpia (títol + número del pictograma + menú d'accions),
  cantonades arrodonides i un peu amb l'acció destructiva a l'esquerra i la
  principal a la dreta.

La resta de diàlegs són `Dialog` de MUI sense cap decisió pròpia: cantonada de
4 px, títol a l'esquerra, botons en majúscules i, segons el fitxer, una creu a
la capçalera, un peu, tots dos o cap dels dos. El resultat és que **la mateixa
app té set diàlegs amb cinc maneres diferents de tancar-se**.

---

## 2. Inventari: què hi ha avui

### 2.1 Diàlegs

| Diàleg | Amplada | Capçalera | Com es tanca | Peu |
|---|---|---|---|---|
| `PictEditModal` | `sm` + `fullWidth` | `Stack` propi: títol `h5` + número en rodona verda + `⋮` de més accions | botó **Tanca** del peu | `space-between`: **Eliminar** (outlined `error` + icona) · **Tanca** (contained) — amb `StyledButton` |
| `ConfirmDialog` | per defecte | `DialogTitle`, a l'esquerra | **Cancel·la** del peu | dreta: Cancel·la (text) · alternativa (text) · confirmar (contained `error`) — `Button` pla |
| `ModalDownload` | per defecte | `DialogTitle` amb `…` literal i un `FormHelperText` **a dins del títol** | **només clicant fora o amb ESC** | **cap**: l'acció viu dins del `form`, com un `Button` de text alineat a la dreta |
| `SaveDocumentModal` | `sm` + `fullWidth` | `DialogTitle`, a l'esquerra | **Cancel·la** del peu | dreta: Cancel·la (text `inherit`) · Desa (contained) |
| `LoadDocumentModal` | `sm` + `fullWidth` | `DialogTitle` + **`✕`** a la dreta | **`✕` de la capçalera i «Tanca» del peu** | dreta: Tanca (text `inherit`) · Carrega (contained) |
| `AuthModal` | `xs` + `fullWidth` | `DialogTitle` + **`✕`** a la dreta | **només la `✕`** | **cap**: «Entra» és el submit del formulari |
| `SettingsSaveErrorDialog` | `xs` | `DialogTitle`, a l'esquerra | **Ara no** del peu | dreta: descarta (text) · Reintenta (contained) |
| `DefaultSettingsDialog` | `fullScreen` | `AppBar` amb tabs + `✕` | **`✕`** de l'`AppBar` | cap |

Cinc maneres de tancar: peu, creu, peu **i** creu, només fora del diàleg, i
creu d'una barra superior.

### 2.2 Avisos flotants (`Snackbar`)

| Avís | Variant | Aparta el botó flotant? |
|---|---|---|
| `FeedbackSnackbar` | `standard` (fons de severitat) | **sí**, 72 px per sota de `sm` |
| `SessionExpiredNotice` | `outlined` + `bgcolor: background.paper` | **no** |
| `BackendWakeUpNotice` | `outlined` + `bgcolor: background.paper` | **no** |

### 2.3 Botons flotants

| Botó | Forma | Àncora |
|---|---|---|
| `DocumentStatusFab` | `SpeedDial` rodó de 48 px; accions de 44 px | `bottom: 16, right: 16` |
| `NewsNavBar` (2 fletxes) | `Fab` rodó `medium` | `bottom: 24`, `left`/`right: 24` |

### 2.4 Altres capes (fora d'aquest estàndard, però inventariades)

`AppNavigationDrawer` (drawer de 240 px), els dos `Menu` d'`HeaderControls`, el
`Popover` d'`InputColor`, el `Popover` de `MouseActionList` i el
`FeedbackBackdrop`.

---

## 3. Divergències trobades

Numerades per poder-les tancar d'una en una, com al backlog d'UX.

### F1 — Cinc maneres de tancar un diàleg

Vegeu la taula 2.1. El cas pitjor és `ModalDownload`: **no té cap botó de
tancar**, ni al peu ni a la capçalera. Qui obre «Descarrega» i decideix no
descarregar res ha d'endevinar que ha de clicar fora del diàleg. En tàctil, on
no hi ha ESC, és l'única sortida i no la diu ningú.

El segon és `LoadDocumentModal`, que en té **dues** (`✕` i «Tanca»), i el
tercer és `AuthModal`, que només té la `✕` — el mateix racó que a
`PictEditModal` conté el menú de més accions. **El mateix lloc vol dir dues
coses segons el diàleg.**

### F2 — El títol no contextualitza enlloc, tret del modal d'edició

`PictEditModal` és l'únic que diu **sobre què** actua: el títol va acompanyat
del número del pictograma en una rodona verda. La resta porten un `DialogTitle`
a l'esquerra i prou. A `SaveDocumentModal` el títol canvia entre «Desa» i
«Actualitza» segons si el document ja és al núvol, que és bona senyal, però
queda diluït en un `h2` alineat a l'esquerra i amb el pes per defecte.

### F3 — `ModalDownload` no té nom accessible

`<Dialog open onClose>` sense `aria-labelledby`: MUI **no** lliga el
`DialogTitle` tot sol. És l'únic diàleg de l'app sense nom; els altres sis el
passen. Amb lector de pantalla s'anuncia com un diàleg sense títol.

A sobre, el seu `DialogTitle` conté un `FormHelperText` a dins: l'explicació
queda dins de l'encapçalament i es llegeix com si en formés part.

### F4 — El botó del `ModalDownload` es construeix concatenant dos missatges

`<FormattedMessage save /> & <FormattedMessage download />` produeix
«Desa & Descarrega» ajuntant dues claus amb una `&` hardcodada. En cinc
idiomes, l'ordre i la conjunció no són nostres per decidir; ha de ser un sol
missatge.

### F5 — Dos catàlegs de botons

Només `PictEditModal` (i `ApplyAll`) fan servir `StyledButton` — radi 20, sense
majúscules, en negreta. Els altres cinc diàlegs usen `Button` pla: radi 4 i
**MAJÚSCULES**. Dins de la mateixa app, doncs, «Tanca» i «CANCEL·LA» són el
mateix botó amb dues formes i dos pesos.

`StyledButton` porta a més un `maxWidth: 130px` fix que ve del seu ús original
(«Aplica a tots»): amb una etiqueta llarga —«Descarrega-ho abans»— el text es
partiria en tres línies. Si ha de ser el botó de tots els peus, el límit ha
d'anar a qui el necessita, no al component.

### F6 — Només un diàleg té la cantonada de la casa

`PictEditModal` porta `borderRadius: 5` (20 px) escrit al seu `sx`; els altres
sis es queden amb els 4 px de MUI. El radi de 20 px és el mateix dels toggles i
del `StyledButton`, o sigui que **ja és el radi de la casa a tot arreu menys a
les capes flotants**, i viu copiat dins d'un `sx` en comptes de ser un token.

### F7 — Dos dels tres avisos tapen el botó flotant en mòbil

`FeedbackSnackbar` deixa 72 px lliures a la dreta per no tapar el
`DocumentStatusFab` (troballa C7, resolta). `SessionExpiredNotice` i
`BackendWakeUpNotice` no ho fan, i són **justament els dos avisos que no marxen
sols**: es queden a sobre del botó d'estat fins que l'usuari els tanca o el
servidor respon.

A més, el 72 és un número escrit a mà a partir dels 48 px del botó. Si el botó
canvia de mida —i aquest estàndard el canvia—, el número deixa de quadrar sense
que res ho digui.

### F8 — Dues aparences d'avís per a la mateixa cosa

`standard` (fons de color de severitat) contra `outlined` + fons de paper. El
segon existeix per un motiu escrit al codi: l'`outlined` de MUI és transparent i
sobre contingut no es llegiria. El primer no té cap motiu; simplement és
anterior.

### F9 — Els botons flotants no tenen la forma de la casa, i n'hi ha dues àncores

El `DocumentStatusFab` i les fletxes de `NewsNavBar` són rodons, com qualsevol
`Fab` de MUI. No s'assemblen als toggles, que són la marca de l'app. I un
s'ancora a 16 px del cantó i els altres a 24.

### F10 — Colors hardcodats a les capes flotants

Contra la regla de colors del `CLAUDE.md`:

- `FeedbackBackdrop`: `color: "#fff"`.
- `StyledToggleButtonGroup` i `ToggleButtonsColors`:
  `boxShadow: "0px 0px 10px 1px #A6A6A6"` — un gris fix que en tema fosc no fa
  d'ombra de res.

No són d'aquest estàndard estrictament, però són el mateix deute i es toquen
amb els mateixos fitxers.

### F11 — Els botons de text dels diàlegs són verds sobre paper: 2,1:1

Un `<Button>` de MUI sense `color` pinta el text amb `primary.main`. En tema
clar, el verd de la casa sobre el paper de configuració dona **2,1:1** —el
mateix número que la regla de colors del `CLAUDE.md` ja rebutja per al blanc
sobre verd—, molt per sota del 4,5:1 del WCAG AA. Hi cauen «Cancel·la» i
«Descarrega-ho abans» de `ConfirmDialog`, el botó de `ModalDownload` i el
«Ara no» de `SettingsSaveErrorDialog`. `SaveDocumentModal` i
`LoadDocumentModal` se'n salven perquè hi van passar `color="inherit"`.

En tema fosc el mateix verd sobre `#242820` dona 7,1:1 i es llegeix bé: és un
error que només es veu on més s'usa l'app.

La sortida no és enfosquir el verd: és que **el botó de text prengui la tinta
del tema** i que el verd es quedi al botó ple, que és on va acompanyat de la
seva tinta fosca (7,2:1). Un botó de text no ha de dur el color de marca per
dir que es pot clicar; ja ho diu que sigui un botó.

### F12 — El que sura tapa el final del contingut, i l'scroll no hi arriba

Reportat treballant: amb l'avís «Connectant amb el teu compte…» a la pantalla,
**els últims pictogrames queden a sota i no es poden veure**. Passa en mòbil i
en escriptori, i no és cosa de l'avís sol: el botó d'estat fa el mateix al seu
racó, permanentment.

El motiu és que una capa `position: fixed` no ocupa lloc al document: quan la
pàgina s'acaba, l'última fila queda sota la capa i **no hi ha scroll que la
pugui apartar**, perquè ja no queda pàgina per moure. I l'avís del
desvetllament és justament dels que no marxen sols: es queda fins que respon el
servidor, que pot ser un minut.

Mou l'avís no és la sortida —a baix és on ha de ser—: el que ha de passar és que
**el contingut reservi al seu final l'espai del que hi sura a sobre**. El mínim
és el que ocupa el botó d'estat, que hi és sempre; els avisos que no marxen sols
hi afegeixen la seva alçada, **mesurada i no calculada**, perquè el mateix
missatge fa dues línies en escriptori i cinc en un telèfon —i és al telèfon on
tapa més.

Les confirmacions de tres segons (`FeedbackSnackbar`) en queden fora a
propòsit: fer saltar la pàgina cada cop que es desa alguna cosa seria pitjor que
el que arregla.

### F13 — L'avís s'aparta d'un botó que en aquella pàgina no hi és

*(Trobada després de migrar F7: reportada mirant l'app, no llegint el codi.)*

La reserva de F7 va quedar escrita dins de `floatingSnackbarSx`, o sigui **a
l'avís**, i per tant s'aplica a totes les pàgines de l'app. Però el control del
racó no hi és a totes: el botó d'estat viu a `LanguageLayout` (editor i
visualitzador) i les fletxes de novetats, a les notícies. A la pantalla d'inici,
al registre o al panell d'administració no hi ha res al racó inferior dret.

El cas és real i no és cap raresa: `BackendWakeUpNotice` es munta també a
`WelcomeLayout` —a propòsit, perquè la pantalla d'inici és on es fa el primer
login del dia i on el desvetllament de Render és més probable—, i allà l'avís
surt en mòbil descentrat 79 px cap a l'esquerra, apartant-se de res. Un avís
descentrat sense motiu visible es llegeix com un error de maquetació, i just en
el moment en què l'usuari ja està esperant.

La sortida és la mateixa que ja es fa servir per a l'alçada del peu (F12):
**qui ocupa el racó és qui declara la reserva**, i l'avís només la llegeix. Amb
el control a la pantalla, l'avís s'aparta exactament com fins ara; sense
control, es queda als 8 px que MUI li posa per defecte.

---

## 4. El patró

Tot surt de dues peces que ja existeixen i que ja agraden: **la capçalera i el
peu de `PictEditModal`** i **la forma del toggle**.

### 4.1 Forma: un sol radi

`APP_CORNER_RADIUS = 20` (nou `style/appShape.ts`), amb
`APP_CONTROL_BORDER_WIDTH = 1,75` i `APP_CONTROL_SIZE = 55`. El radi és el que
ja porten els toggles i `StyledButton`; passa a ser també el del paper dels
diàlegs (via `themeMui.ts`, no via `sx` de cada diàleg), el dels avisos flotants
i el dels botons flotants.

El `fullScreen` queda exempt: un diàleg que ocupa la pantalla sencera no té
cantonades (`paperFullScreen` explícitament a 0).

### 4.2 Capçalera: títol centrat que contextualitza

Tres franges d'amplada fixa a esquerra i dreta perquè el títol quedi **centrat
de debò** i no desplaçat per l'acció del racó:

```
[ franja buida ]   [ TÍTOL  (distintiu) ]   [ acció d'icona ]
```

- **Títol**: `Typography variant="h5" component="h2"`, sempre lligat al diàleg
  amb `aria-labelledby`. Diu on ets i què hi fas.
- **Distintiu** (`badge`, opcional): el que contextualitza *sobre què* — avui,
  el número del pictograma en rodona verda. És l'element que fa que el títol no
  hagi de dir-ho amb paraules.
- **Acció d'icona** (opcional): **només** un menú de més accions. **Mai una
  creu de tancar**: tancar viu al peu, en un sol lloc (resol F1).

### 4.3 Peu: destructiva a l'esquerra, principal a la dreta

`AppDialogActions`, amb el repartiment que ja fa el modal d'edició:

- **Acció destructiva secundària**: sola a l'esquerra, `variant="outlined"`,
  `color="error"`, amb icona. Separada de tota la resta per tota l'amplada del
  diàleg — la distància és la protecció, com diu l'estàndard d'accions
  destructives.
- **Acció principal**: a la dreta, `variant="contained"`.
- **Tancar/cancel·lar**: a l'esquerra de la principal, en text.
- Si no hi ha destructiva, tot el grup va a la dreta.
- **Quan la destrucció *és* l'acció principal** (`ConfirmDialog`), va a la
  dreta i en `contained color="error"`: allà no és una sortida secundària, és el
  que s'ha vingut a fer.
- **L'alternativa que evita la pèrdua** («Descarrega-ho abans») ocupa llavors la
  ranura de l'esquerra. L'estàndard d'accions destructives ja deia que va «al
  mig» perquè no és ni acceptar ni cancel·lar; la ranura de l'esquerra és
  exactament això, i de passada la separa per tota l'amplada del diàleg de la
  que consuma la pèrdua. Amb els tres botons junts a la dreta, en canvi, el peu
  es parteix en dues línies en qualsevol diàleg estret.
- **Els botons de text prenen la tinta del tema, mai `primary.main`** (F11).
- Tots els botons del peu són `StyledButton` (resol F5).

### 4.4 Amplada

`xs` per a un diàleg que fa una pregunta o dona un missatge; `sm` per a un que
porta un formulari o una llista. Sempre `fullWidth`, perquè si no l'amplada
depèn del text i dos diàlegs germans surten de mides diferents.

### 4.5 Avisos flotants

Una sola aparença: `outlined` amb `bgcolor: background.paper` (opac, llegible
sobre el full i en tots dos temes), radi de la casa i ombra. La severitat la
diuen la vora i la icona.

Tots tres aparten el botó flotant per sota de `sm`, i la separació es **calcula
des dels tokens** (`APP_CONTROL_SIZE` + les vores), no amb un 72 escrit a mà
(resol F7 i F8).

I només s'aparten **si hi ha de què apartar-se**: la reserva la declara qui
ocupa el racó (`useFloatingCorner`, del botó d'estat i de la fletxa de
novetats) i l'avís la llegeix d'una variable CSS, com el contingut llegeix
l'alçada del peu de `floatingInset`. A les pàgines sense control flotant
—inici, registre, panell d'administració— l'avís es queda on el posa MUI
(resol F13).

### 4.6 Botons flotants

Forma de toggle seleccionat: radi 20, vora d'1,75 px del color, tint del color
al 20 % — però **opac**. El tint transparent del toggle funciona perquè sura
sobre el gris de configuració; el botó flotant sura sobre el full, i amb
transparència s'hi veurien passar els pictogrames per sota. S'aconsegueix
pintant el tint com a capa de `backgroundImage` damunt de `background.paper`:
el color resultant és exactament el del toggle seleccionat, sense
transparència.

Una sola àncora per a tots (`bottom`/`right`/`left` de 16 px) i la mida del
control de la casa (55 px; les accions del `SpeedDial`, 44, que és el mínim
WCAG de diana tàctil).

---

## 5. Components compartits que se'n deriven

Carpeta nova `apps/web/src/components/AppDialog/`, font única de veritat, amb
la mateixa estructura que `SettingsLayout/` i `AppTabs/`:

| Fitxer | Què és |
|---|---|
| `AppDialog.tsx` | El diàleg: paper, capçalera de tres franges, `DialogContent` |
| `AppDialogActions.tsx` | El peu, amb la ranura `destructive` a l'esquerra |
| `appDialog.styled.ts` | Capçalera, franges, distintiu (`appDialogBadge`, que ve de `circlePictogramNumber`) |
| `index.ts` | Barril |

I dos fitxers nous a `style/`:

| Fitxer | Què és |
|---|---|
| `appShape.ts` | `APP_CORNER_RADIUS`, `APP_CONTROL_BORDER_WIDTH`, `APP_CONTROL_SIZE` |
| `floatingControl.ts` | `floatingControlSx(color)`: la forma de toggle, opaca, per als botons flotants |

`AppDialogActions` rep nodes, no etiquetes: així no cal cap missatge nou i cada
diàleg continua amb les claus de traducció que ja té.

---

## 6. Pla de migració

Per ordre, del que fixa el patró al que només l'hereta:

1. ✅ **Tokens i tema** — `style/appShape.ts`, `floatingControl.ts`, radi del paper
   de `Dialog` a `themeMui.ts` (i `paperFullScreen` a 0). `StyledButton`: fora
   el `maxWidth: 130px`, que passa a l'`sx` d'`ApplyAll`, i `whiteSpace: nowrap`.
   El botó de text dels peus deixa de ser verd (F11).
2. ✅ **`components/AppDialog/`** — els components nous (amb una ranura d'estat
   per al progrés que ha de quedar visible entre el contingut i el peu).
3. ✅ **`PictEditModal`** — passa a `AppDialog`. És la referència: ha de quedar
   **igual que ara**, i si no queda igual és que el component està mal fet.
4. ✅ **`ConfirmDialog`** — capçalera centrada i botons `StyledButton`. Cap canvi
   de comportament: ni `autoFocus`, ni focus inicial a cap botó.
5. ✅ **`SettingsSaveErrorDialog`**, **`SaveDocumentModal`** — capçalera i peu nous.
6. ✅ **`LoadDocumentModal`** — fora la `✕` de la capçalera; tancar es queda al peu.
7. ✅ **`AuthModal`** — fora la `✕`; peu amb «Tanca». «Entra» continua sent el
   submit del formulari, que és on ha de ser.
8. ✅ **`ModalDownload`** — el més tocat: nom accessible (F3), l'ajuda surt del
   títol, peu de debò amb «Cancel·la» i l'acció principal en un **sol** missatge
   nou (F4) als cinc idiomes.
9. ✅ **Avisos** — aparença única (`floatingNoticeSx`), separació calculada des
   dels tokens i **reserva d'espai al final del contingut** per als dos que no
   marxen sols (`components/FloatingLayer/`, F12).
10. ✅ **Botons flotants** — `DocumentStatusFab` i les dues fletxes de
    `NewsNavBar`, amb `floatingControlSx` i l'àncora única.
11. ✅ **Colors hardcodats** (F10) — `#fff` del backdrop i l'ombra `#A6A6A6` dels
    dos grups de toggles.
12. ✅ **Documentació** — l'estàndard condensat a `CLAUDE.md`; aquí s'hi queda la
    raó de cada regla.
13. ✅ **La reserva del racó, declarada per qui l'ocupa** (F13) —
    `components/FloatingLayer/floatingCorner.ts` i `useFloatingCorner`, que
    porten `DocumentStatusFab` i la fletxa dreta de `NewsNavBar`. L'avís passa a
    llegir-la d'una variable CSS i deixa d'apartar-se a les pàgines on no hi ha
    cap control flotant.

Fora d'abast, amb motiu: **`DefaultSettingsDialog`** (és `fullScreen` i ja té
estàndard propi, el de tabs: barra superior, `✕` a l'`AppBar` i cap peu), el
**drawer**, els **menús** i els **popovers** (capes de navegació, no de
missatge), i el **backdrop** (que només hereta el color, punt 11).

---

## 7. Què s'hi guanya, en una línia

Que la pregunta «com es tanca això?» tingui **una** resposta a tota l'app, i que
el que sura per damunt de la pàgina tingui la mateixa forma que els controls que
hi ha a sota.
