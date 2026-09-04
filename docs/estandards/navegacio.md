# Navegació: tabs i senyal de sessió

> **Quan llegir-lo:** abans de tocar `AppTabs/`, `TabsEditView`, els tabs del modal de configuracions, `BarNavigation` o `UserAvatar`.

## Estàndard de tabs (icona + text)

Font única de veritat: `apps/web/src/components/AppTabs/`. Cobreix els tabs d'edició/visualització (`TabsEditView`) i els del modal de configuracions (`DefaultSettingsDialog`).

### Component compartit

- **`AppTab`** — l'única manera de declarar un tab amb icona i text. Props: `label` (string **ja traduït**, no un node), `icon`, més tot el que accepta `Tab` (`value`, `component`, `to`…). Aplica `iconPosition="start"`, els estils responsius i l'`aria-label`. **Mai declarar un `<Tab>` de MUI amb `label={<Typography>…</Typography>}` a mà.**
- **`tabsStyled`** — estils del contenidor `Tabs` sobre la NavBar verda (indicador i colors derivats de `primary.contrastText`). Viu a `appTabs.styled.ts`, **no** a la carpeta de cap component consumidor.

### Regla d'icona i text

- **Per sobre de `sm` (600px)**: icona + text en línia, com fins ara.
- **Per sota de `sm`**: **només el tab seleccionat conserva el text**; la resta queden en icona. Sempre hi ha, doncs, un text visible que diu on ets, sense malgastar amplada amb els tabs on no ets. **Criteri únic per a tots els tabs de l'app** — barra de navegació i modal de configuracions es comporten igual; `AppTab` no té cap prop per variar-ho.
- **L'`aria-label` és sempre present** amb el text traduït — el tab no perd mai el seu nom accessible encara que el text no sigui visible, cosa crítica en una app d'AAC.
- **Res d'encapçalaments duplicats dins el panell**: el nom del tab actiu el diu el propi tab, no un `h2` a sobre del contingut. Un títol repetit a cada panell és soroll en una pantalla on l'alçada és el recurs escàs.
- **Els contenidors amb 3 tabs o més van `variant="scrollable"` amb `scrollButtons="auto"`** (cas de `DefaultSettingsDialog`): en mòbil el tab actiu amb text pot desbordar la barra, i les fletxes apareixen només on hi ha ratolí (MUI les amaga en tàctil, on ja hi ha swipe).
- **El valor del tab es deriva de l'estat real, no d'estat local**: `TabsEditView` calcula el tab actiu des de `useLocation()`. Amb `useState` inicialitzat a un valor fix, recarregar `/view-sequence` marcaria «Edició» — i com que el tab actiu és l'únic amb text en mòbil, l'error seria doblement desorientador.
- **Mai fer servir `Tooltip` per portar el text del tab en mòbil**: en tàctil només s'obre amb long-press (~700 ms), no és descobrible, xoca amb el menú contextual del sistema i es tanca sol. El tooltip és un ajut d'escriptori, mai l'única via al text.
- **Res de text apilat sota la icona**: «Pictogrames» i «Vocabulari» no hi caben en un tab estret i acabarien truncats, i el tab creixeria en alçada empenyent l'AppBar de 42px.
- **El breakpoint és `APP_TAB_LABEL_BREAKPOINT` (`sm`)**, el mateix de l'estàndard de configuracions. No multiplicar ruptures.
- **L'amagada és per CSS**, no per `useMediaQuery`: així el layout no depèn d'un render de JavaScript ni fa flash en carregar.
- **Tot l'ajust responsiu va dins d'un `theme.breakpoints.down(sm)`**, mai amb objectes `{ xs: …, sm: … }`. Per sobre del breakpoint el tab ha de conservar **intactes** les mides natives de MUI. En particular, **mai declarar `fontSize: "inherit"` per a escriptori**: el tab heretaria l'`1.75rem` del `Toolbar` de `BarNavigation` (i el `1rem` del body al diàleg) en lloc del seu `0.875rem`, i tant la icona com el text es veurien desmesurats. Per això `appTabSx` i `appTabLabelSx` són funcions de `theme`, no objectes.
- **Diana tàctil**: en `xs` el tab sense text baixa a `minWidth: 48` (el mínim WCAG de diana tàctil, no menys) i la icona creix a `1.4rem` per compensar la pèrdua del text. El tab seleccionat, que sí que mostra text, recupera les mides normals.
- **El títol de la barra cedeix abans que els tabs**: a `DefaultSettingsDialog` el títol «Configuracions» s'amaga en `xs` (`display: { xs: "none", sm: "block" }`) i el nom del diàleg passa a l'`aria-label` del `Dialog`.
- **Un destí es diu amb un nom; una acció, amb un verb**: els tabs i els ítems de navegació que
  porten a un lloc són noms (**Edició** · **Vista**, i al drawer Inici · Novetats · Configuració);
  els ítems que obren un diàleg i fan alguna cosa són verbs (Descarrega · Carrega). Els quatre tabs
  del modal de configuracions són noms per la mateixa raó. El motiu és l'amagada d'etiquetes en
  mòbil: com que el tab seleccionat és l'únic amb text, aquell text diu **on ets**, no què pots fer,
  i un infinitiu sol es llegeix com una acció pendent. **La regla s'aplica per idioma, no traduint
  mecànicament**: en anglès i en italià el terme estàndard del menú ja és «Edit» i «Modifica», i
  forçar-hi un nom seria pitjor.
- **Marca curta en mòbil**: el `h1` de `BarNavigation` mostra `APP_SHORT_NAME` (**«SqAAC»**) per sota de `sm` i «SequenciAAC» a partir de `sm`, amb l'`aria-label` del `h1` sempre amb el nom sencer. **No fer servir «SAAC» sol com a nom curt**: és el terme genèric del sector (Sistemes Augmentatius i Alternatius de Comunicació) i es llegiria com a categoria, no com a marca; «SqAAC» conserva l'arrel del nom propi.

### Estat de migració

- ✅ **`TabsEditView`** — 2 tabs (Edició/Vista) via `AppTab`; valor derivat de `useLocation()`.
  Les etiquetes surten de `@shared/messages/navigation.lang`, **compartides amb el drawer**: el
  mateix destí no es pot dir de dues maneres segons per on s'hi arriba (era B4 del backlog).
- ✅ **`DefaultSettingsDialog`** — 4 tabs declarats a l'array `SETTINGS_TABS` (valor + icona + missatge) i renderitzats amb `map`, dins d'un `Tabs` scrollable.
- ➖ **`TabsSequences`** — fora d'aquest estàndard: els seus tabs són números de seqüència, sense icona ni text traduïble; té la seva pròpia branca `isMobile` (horitzontal scrollable).

---

## Senyal de sessió (la rodona de l'usuari)

Font única de veritat: `components/UserAvatar/UserAvatar.tsx`.

- **Una sola rodona a tota l'app**: les dues primeres lletres del correu, dibuixades pel mateix
  component al drawer i a la barra. És el senyal de «tens sessió iniciada» i, si al menú fos d'una
  manera i a la barra d'una altra, no es llegiria com la mateixa cosa.
- **El botó de configuracions de la NavBar el porta a sobre**: amb sessió, la roda dentada passa a
  ser un distintiu petit al racó inferior dret de la rodona; sense sessió, el botó és la roda
  dentada de sempre. Així la confirmació d'haver entrat es veu sense obrir cap menú, i no cal
  gastar-hi cap altre lloc de la barra, que en mòbil ja va justa.
- **La rodona s'inverteix segons la superfície** (prop `onPrimary`): sobre el paper de configuració
  és verda amb la tinta fosca (`primary.contrastText`, 7,2:1); sobre el verd de la NavBar és fosca
  amb les lletres verdes, perquè una rodona verda damunt de la barra verda no es veuria. El
  distintiu de la roda dentada va sobre `primary.main` —el verd de la barra mateixa— i per això
  sembla una osca que separa la icona de la rodona, no una pastilla enganxada a sobre.
- **El nom accessible diu el compte**: amb sessió, el tooltip i l'`aria-label` del botó són
  «Configuracions · sessió iniciada com a {email}». En un botó només-icona el tooltip **és** el nom,
  i qui no distingeix la rodona ha de poder saber igualment amb quin compte treballa —el dispositiu
  d'AAC sovint es comparteix.

