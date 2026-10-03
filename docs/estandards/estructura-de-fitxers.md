# Estructura de fitxers: on viu cada component

> **Quan llegir-lo:** abans de crear un component, de moure'n un o de decidir en
> quina carpeta va una peça nova.

Aquest document diu **on** va cada cosa. El que va a dins de cada peça ho diuen
els estàndards de la seva àrea (`colors.md`, `configuracions.md`,
`capes-flotants.md`…) i els `docs/fonaments/`.

## El criteri

**S'agrupa per domini, mai per mecanisme.** La carpeta diu *de què parla* un
component —el document, les preferències, el compte—, no *de quina peça d'UI
està fet.

Per això no hi ha —ni hi pot tornar a haver— una carpeta `Modals/`, `Dialogs/`,
`Forms/` ni `Buttons/`. Ser un diàleg no és res que un component tingui en comú
amb un altre diàleg: `PictEditModal` edita un pictograma del document i
`SettingsDialog` canvia les preferències de qui mira, i no comparteixen ni estat,
ni traduccions, ni motiu per canviar. El que sí que comparteixen —la forma del
diàleg— viu en un component canònic (`AppDialog`, `AppFullScreenDialog`), que és
el lloc on la forma s'ha de poder canviar una vegada per a tothom.

El que hi havia abans d'aquest document: `Modals/` tenia els dos diàlegs més
importants de l'app mentre els seus formularis —el gruix del codi: 620 i 240
línies— vivien a `components/`, i hi havia diàlegs repartits per tres llocs més.
«Els modals van a `Modals/`» ja era fals quan es va escriure.

## On va cada cosa

| Carpeta | Què hi va | Com saber-ho |
|---|---|---|
| `features/<domini>/components/` | Tot el que parla d'un domini: el diàleg de configuració, l'edició d'un pictograma, el desat al núvol | Si per explicar què fa el component cal dir «el document», «les preferències», «el compte» o «el vocabulari», és d'aquell domini |
| `components/` | El que no sap de cap domini i serveix a tots: `AppDialog`, `AppFullScreenDialog`, `AppTabs`, `SettingsLayout`, `ConfirmDialog` | Si funciona igual amb qualsevol contingut que li passis, és genèric |
| `pages/` | Només orquestració: munta features i layouts, i prou | Si hi ha lògica de negoci en una pàgina, no hi toca |
| `shared/` | Hooks i utilitats sense UI compartits per més d'una feature | |
| `src/test/` | L'arnès de proves: `renderWithProviders`, `setup.ts`, `fixtures/` | |

**Un component genèric no pot dependre de cap feature.** Si per fer la seva
feina li cal `@features/...`, no és genèric: és un component de feature mal
col·locat (o li falta rebre per props el que ara va a buscar).

## Dins de la carpeta d'un component

- **El material d'un component viu amb el component**: els seus `.lang.ts`,
  `.styled.ts`, `.test.tsx` i els subcomponents que només ell fa servir.
  Un diàleg i el seu formulari no es poden separar en dues carpetes.
- **Un component amb material propi té carpeta pròpia**, amb el seu nom exacte
  en PascalCase. Un component d'un sol fitxer pot anar planer dins el
  `components/` de la seva feature.
- **`index.ts` és la porta d'entrada**: qui ve de fora importa de la carpeta, no
  d'un fitxer de dins. Així el de dins es pot reorganitzar sense tocar ningú.
- **Les carpetes amb més d'un panell o pestanya tenen una subcarpeta per peça**
  (`SettingsDialog/panels/<Panell>/`): afegir una pestanya és afegir una
  carpeta, no tocar quatre fitxers.

## Imports

- **Sempre per alias** (`@/`, `@app`, `@shared`, `@components`, `@features`).
  Un `../../..` és senyal que el fitxer no és on toca —i, quan es mou, deixa de
  compilar per motius que no tenen res a veure amb el canvi.
- **Relatiu només dins de la mateixa carpeta** (`./PictEditForm`) o cap a una
  germana immediata (`../DefaultSettingsPanel/DefaultSettingsPanel`).
- **Les dependències van en un sol sentit**: `pages` → `features` →
  `components`/`shared`/`style`. Cap component genèric no importa una feature, i
  cap hook o store d'una feature no importa un component d'una altra.
  Dues features es poden compondre **a la capa de components** —el diàleg de
  configuració mostra l'estil del document—, mai des d'un hook ni d'un slice.

  El cas que va obligar a escriure-ho: `useSaveUiSettings`
  (`features/backend/user-settings`) demanava els seus missatges a
  `Modals/DefaultSettingsModal/UserSettingsPanel.lang` amb quatre nivells de
  `..`. Una feature del backend depenia d'un panell de la interfície.

## Noms

- **La carpeta es diu com el component** i el component com el fitxer. Res
  d'errates: `PictEditFrom` va existir tres anys.
- **El nom diu què és la peça**: `SettingsDialogButton` és el botó que obre el
  diàleg, `SettingsDialog` és el diàleg. Tenir `DefaultSettingsModal` (un botó) i
  `DefaultSettingsDialog` (el diàleg) a la mateixa carpeta no ho deixava saber a
  ningú.
- **Els noms provisionals no es queden**: `features/print-refactor/` és avui la
  implementació de debò i encara es diu «refactor» (vegeu `docs/BACKLOG-ux.md`).
- **Els identificadors dels missatges no canvien quan un component es mou.** Són
  la clau de les traduccions dels cinc idiomes: `SettingsDialog.lang.ts` conserva
  els ids `components.defaultSettings.*` a propòsit.

## Tests

- **El test viu al costat del que prova**: `SettingsDialog.test.tsx` dins de
  `SettingsDialog/`.
- **Un sol arnès, a `src/test/`**: `renderWithProviders` munta la mateixa pila de
  proveïdors que `index.tsx` i l'store de debò, via `createAppStore` d'`app/store`.
  Cap test no declara el seu propi mapa de reducers: la mock d'estat paral·lela
  (`utils/test-utils.tsx`) es va desincronitzar de l'store i va deixar tota la
  suite provant un model que ja no existia.
- **Es prova el comportament, no la implementació**: el que l'usuari fa i el que
  queda a l'store, no quines accions s'han despatxat. Per això els tests no
  mockegen `dispatch`.
- **El que es toca, es cobreix.** Moure un component sense tests que ho
  comprovin és moure'l a cegues: els tests van **abans** del moviment, i han de
  tornar a passar després sense tocar-los.
