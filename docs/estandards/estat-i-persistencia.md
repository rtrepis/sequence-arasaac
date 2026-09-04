# Estat, esborrany i persistència al navegador

> **Quan llegir-lo:** abans de tocar Redux (`uiSlice`, `documentSlice`, `documentStatusSlice`), l'esborrany d'IndexedDB, les imatges pujades, la tipografia o les traduccions.

## Redux i estat

- **`uiSlice`** gestiona `defaultSettings` (configuració global de l'usuari). Té dos sub-objectes: `pictApiAra` (skin, hair, color) i `pictSequence` (font, numbered, borders, textPosition, numberFont).
- **`documentSlice`** gestiona el contingut de les seqüències (`content`, `activeSAAC`).
- El reducer `updateDefaultSettingPictSequence` fa un spread shallow sobre `pictSequence`, per tant qualsevol nou camp al nivell de `pictSequence` es pot actualitzar sense canviar el reducer.
- El reducer `updateDefaultSettings` reemplaça tot el `defaultSettings` — el que usa `handlerSubmit` de `DefaultForm`.
- **Persistència**: `DefaultForm` guarda a `sessionStorage` i `localStorage` amb la clau `"pictDefaultSettings"`. Si un usuari té dades antigues sense un camp nou, el fallback es gestiona al nivell de lectura (no hi ha migració).

## Esborrany del document i imatges pujades

- **El document no es desa mai a `localStorage`/`sessionStorage`.** L'esborrany va a **IndexedDB** (`features/sequence/storage/draftStorage.ts`, clau `currentDocument`). El motiu és de mida: els storages del navegador donen uns 5 MB per origen i hi compten en UTF-16, i **una sola imatge pujada en base64 ja se'ls menja** — el mateix `STORAGE_FULL_ERROR` que ja passava amb el vocabulari, però enduent-se la feina. A IndexedDB hi cap el document sencer, imatges incloses, **sense tocar-ne el format**: ni el `.saac`, ni el que rep l'API, ni `PictApiAra.url`.
- **Les imatges pujades no viuen dins de l'esborrany**: van a un magatzem propi d'IndexedDB
  (`draftImages`) escrit **un sol cop per imatge**, i el document en desa una referència
  (`draft-image:<id>`). Sense això, moure un slider tornava a escriure tots els base64 sencers cada
  segon: mesurat, de 7 ms amb una imatge a 22 ms amb dotze (i molt pitjor en tauleta), quan el que
  canvia són uns quants KB. Amb el magatzem a part el desat és pla, ~1-2 ms, hi hagi les imatges que
  hi hagi. **És capa d'emmagatzematge i prou**: ni el `.saac`, ni el que rep l'API, ni
  `PictApiAra.url` a Redux canvien de forma. L'id surt d'un mostreig del contingut (llargada + tres
  trossos), no de recórrer la cadena sencera, que seria tornar a pagar el que s'estalvia.
- **No es reescriu el mateix document dues vegades**: el flush de `visibilitychange` compara amb
  l'última referència escrita. Sense la comparació, amagar i tornar a mostrar la pestanya escrivia
  igualment.
- **L'esborrany és xarxa de seguretat, no desat.** Sobreviu a un refresc, a tancar la pestanya i a quedar-se sense bateria, però el navegador el pot desallotjar (Safari, als 7 dies sense visitar el lloc). Els desats de veritat continuen sent explícits: «Descarrega» (fitxer `.saac`) i «Desa al núvol» (amb compte). **Mateix mecanisme per a l'usuari anònim i per a l'autenticat** — el que canvia és què hi ha a sobre, no l'esborrany.
- **No hi ha autodesat al núvol.** Cada `PUT /documents` puja imatges a Cloudinary i passa per la comprovació de quota: desar sol, sense que l'usuari ho hagi demanat, li pot retornar un `QUOTA_STORAGE_EXCEEDED` en un moment en què no pensa a desar, i de passada desperta Render.
- **Es desa amb debounce d'1 s i es força en amagar la pestanya** (`visibilitychange` i `pagehide`, no només `beforeunload`): a iOS el sistema pot matar una pestanya en segon pla sense disparar-lo mai, i l'iPad és el dispositiu típic d'un usuari d'AAC.
- **Restauració només en arrencar i només sobre un document verge** (sense títol i sense cap pictograma). Si mentre es llegia l'esborrany l'usuari ja ha carregat un document o ha posat un pictograma, mana el que està veient.
- **Si el navegador no pot desar, es diu.** `saveDraft` retorna si ho ha aconseguit i el hook avisa **un sol cop** per sessió: amb l'espai exhaurit, cada canvi posterior tornaria a fallar i l'avís es convertiria en soroll.
- **Les imatges pujades tenen mida fixa: 1.800 px de costat llarg** (`MAX_IMAGE_SIDE_PX` a `utils/imageToBase64.ts`), amb objectiu de ~500 KB ajustant la qualitat i un mínim de 0,5. Surt del cas pitjor d'impressió: el pictograma més gran possible és de 150,8 mm (150 px CSS × `SIZE_PICT_MAX` 3,8, a 96 dpi), i 1.800 px hi donen 303 dpi — per damunt del sostre del PDF mateix (`html2canvas` a `scale: 3` sobre una pàgina de 96 dpi són 288 dpi com a màxim).
- **La mida és igual per a totes les imatges i no depèn de quantes n'hi hagi.** Rebaixar-la per imatge segons el recompte és temptador (com més pictogrames, més petit s'imprimeix cadascun) però està mal ancorat: quan es puja encara no se sap a quina mida s'imprimirà — `sizePict` es toca després, a la pàgina de vista— reduir és irreversible, i el resultat dependria de l'ordre d'arribada. A més, una progressió a la meitat arriba al terra a la quarta imatge: el terra acaba sent l'única política real.
- **Es redimensiona sempre, no només quan la imatge passa d'un llindar**, i **mai s'amplia**: inventar píxels no afegeix detall i multiplica el pes.
- **Les imatges amb transparència no van mai a JPEG** (els pintaria un fons negre): es codifiquen en WebP, que guarda l'alfa amb pes de foto, i si el navegador no el sap codificar `toDataURL` retorna un PNG sense avisar —es detecta pel prefix— i el PNG es dona per bo.

## Estat de durabilitat i botó flotant

- **Tres nivells, no dos**: esborrany d'IndexedDB (automàtic, aquest navegador), fitxer `.saac`
  (explícit) i núvol (explícit, amb compte). `documentStatus` (`features/sequence/store/documentStatusSlice.ts`)
  és l'única font de veritat de quin d'ells té la feina que hi ha a pantalla.
- **Viu fora de `documentSlice` a propòsit**: no és contingut del document, no viatja al `.saac` ni
  al cos de l'API. Si hi fos, desar el document el canviaria.
- **Cap component marca «hi ha canvis»**: ho fa `documentStatusMiddleware` escoltant les accions
  `document/*` de dos segments. En queden fora `changeActiveSAAC` (navegació, no contingut),
  `loadDocumentSaac` i `resetDocument` — qui carrega un document és qui sap d'on ve i ho declara ell
  mateix amb `documentMadeDurable` (fitxer o núvol).
- **Amb còpia i amb canvis a sobre, l'estat és `stale` i el botó es posa groc.** És un estat propi
  entre `local` i `durable`: la còpia existeix, però és d'abans del que hi ha a pantalla. Sense ell,
  seguir treballant damunt d'un document desat el tornava a «Només en aquest dispositiu» —cert, i
  alhora amagant el que importa— i ho deia **amb el mateix verd** que un document acabat de desar. El
  panell del botó només s'obre amb el clic, així que el color és l'única cosa que es veu de cua
  d'ull: el groc (`warning`, només a la vora i al tint de `floatingControlSx`; la icona continua
  sent la tinta del tema) és tota la diferència entre «ho tens desat» i «ho tenies desat».
- **El groc és per a la còpia que s'ha quedat enrere, mai per a l'esborrany a seques.** Un document
  que no ha estat mai enlloc —el cas normal de qui treballa sense compte— es queda en verd amb el
  text de sempre: pintar d'alerta permanent el flux principal de l'app convertiria l'avís en soroll
  i no diria res que el text no digui.
- **`isWorkAtRisk` viu al slice, no al botó**: és el criteri de tota l'app per saber si una acció que
  buida la pantalla —«Document nou», tancar la sessió— s'ha de confirmar, i `stale` hi entra encara
  que hi hagi còpia (el que es perdria és tot el que s'ha fet des d'aleshores, i el cos del diàleg ho
  diu així en comptes de dir que es perd tot).
- **De l'esborrany no se'n diu mai «desat» a seques.** Qui llegeix «desat» entén que la feina és
  fora de perill i l'esborrany no ho garanteix; els textos diuen sempre «només en aquest
  dispositiu». És tota la raó de ser de l'indicador.
- **La durabilitat es desa dins de l'esborrany** (`DraftMeta`): sense això, recarregar convertiria
  un document acabat de desar al núvol en feina que sembla no ser enlloc.
- **`DocumentStatusFab`** és l'únic lloc que ho explica: `SpeedDial` a baix a la dreta, muntat a
  `LanguageLayout` (editor i visualitzador), fora del `Container` perquè és capa flotant. **S'obre
  només amb el clic** (`reason === "toggle"`): amb l'obertura per hover, el clic següent la tancaria
  i el botó semblaria mort, i amb la del focus es reobriria sola en tancar-se el diàleg de
  descàrrega. No surt mai a la impressió (`@media print`).
- **El núvol només el porten les icones que toquen el núvol.** Amb tres nivells de durabilitat, les
  icones han de dir quin toca cada acció: `AiOutlineDownload` (↓, sense núvol) per a descarregar el
  `.saac`, `AiOutlineFolderOpen` per a carregar-lo —no una fletxa amunt, que quedava el mateix
  dibuix mirallat que la de descarregar i no es distingia a 24px—, i el núvol **només** a «Desa al
  núvol» (`AiOutlineCloudUpload`) i «Carrega del núvol» (`AiOutlineCloudDownload`). Un disquet o un
  núvol a les operacions de fitxer local contradiuen el `DocumentStatusFab`, que existeix
  precisament per dir on és la feina.
- **«Document nou» (`startNewDocumentThunk`) és l'única porta a `resetDocument`** i sempre esborra
  l'esborrany: buidar la pantalla sense esborrar-lo deixaria la feina antiga a punt de ressuscitar
  al primer refresc. Conserva la configuració per defecte —és de l'usuari, no del document— i
  demana confirmació si la feina no té còpia externa.
- **Tancar la sessió tanca també el document** (`AppNavigationDrawer`, `startNewDocumentThunk`
  després de `logoutThunk`). El vocabulari personal ja se n'anava en sortir i és exactament el mateix
  motiu: en AAC el dispositiu es comparteix, i el que quedava a pantalla —i a l'esborrany
  d'IndexedDB, que sobreviu al refresc— era feina d'algú altre. A més, un document del núvol es
  quedava amb l'id del compte que l'havia desat: l'indicador deia «Desat al núvol» a qui ja no hi
  tenia sessió, i desar-lo des d'un altre compte hauria estat un `PUT` a un document que no és seu.
  Si la feina no té còpia (`isWorkAtRisk`) es confirma abans, amb «Desa al núvol abans» a la ranura
  de l'alternativa —encara hi ha sessió, i per això aquella sortida encara és possible.
- **Només ho fa el tancament explícit.** La sessió que caduca sola (A11) no toca el document: allà
  l'usuari no ha demanat res, i perdre-li la feina seria el pitjor dels dos mals.
- **El botó flotant desa pel mateix diàleg de nom que el drawer** (`SaveDocumentModal`, vegeu més
  avall): dues portes a la mateixa acció, un sol comportament. I **qui declara la durabilitat és el
  diàleg que fa l'operació** —`SaveDocumentModal` en desar, `LoadDocumentModal` en carregar—, no qui
  l'ha obert: així l'indicador diu la veritat vingui la crida d'on vingui.

## Tipografia i Font

- El type `Font` té 3 camps: `family: FontFamily`, `color: string`, `size: number` (multiplicador 0.5–2.0).
- Hi ha dos nivells de Font a `pictSequence`: `font` (text) i `numberFont` (números). Cada un pot tenir la seva pròpia configuració independent.
- **Fallback encadenat al render**: `pictFont ?? fontDefaultSetting` per al text; `pictNumberFont ?? numberFontDefaultSetting ?? fontDefaultSetting` per als números. El tercer nivell de fallback garanteix compatibilitat amb dades antigues.
- **`SettingCardFontGroup`** és el component reutilitzable per configurar un `Font`. Accepta una prop `title?: React.ReactNode` per personalitzar el heading sense duplicar el component.
- Les traduccions del títul dels grups de font aniran a `SettingCardFontGroup.lang.ts`.

## Numeració i posicionament

- `numbered` (boolean) controlla si es mostra `indexSequence + 1` al pictograma.
- `textPosition` ("top" | "bottom" | "none") determina on va el text. El número sempre va a la posició **oposita** al text.
- Al `PictogramCard`, el header i el footer són blocs separats. Dins de cada bloc, el text i el número són mutuament exclusius → es pot usar render condicional sense preocupar-se per el layout.
- `numbered` NO té estat local a `DefaultForm` perquè `SettingCardBoolean` dispatch directament a Redux i el re-render del component llegeix el valor actualitzat.

## Default Settings Modal i DefaultForm

- `DefaultSettingsModal` obrir un Dialog fullscreen que conté `<DefaultForm submit={open} />`.
- `DefaultForm` usa estat local per a tots els camps que es configuren amb sub-components (font, borders, textPosition, skin, hair, color, numberFont). El pattern és: `useState(initialValue)` → passar `state` i `setState` al component filho → a `handlerSubmit` construir el payload sencer i dispatch + guardar.
- El render condicional de sections segon un boolean del Redux (ex: `{numbered && (...)}`, `{color && (...)}`) és el pattern establert per mostrar/amagar configuradors.
- `pictogramGuide` és l'objecte `PictSequence` que es passa al `PictogramCard` del preview. Cal mantenir-lo sincronitzat amb tots els camps de settings que afecten el render.

## Traduccions

- **Cinc idiomes**: `ca` (principal), `es`, `en`, `fr`, `it`.
- **Dos nivells de fitxers, mai confondre'ls**: els FONT viuen a `apps/web/languages/*.json` (format `{ "clau": { "defaultMessage": "...", "description": "..." } }`) i s'editen a mà; els COMPILATS viuen a `apps/web/src/languages/*.json` (AST de react-intl) i es **generen**, mai s'editen directament.
- Compilar: `cd apps/web && npm run prepare` (crida `scripts/compile-languages.mjs`, que itera tots els `.json` de `languages/` amb `formatjs compile` — afegir un idioma nou no requereix tocar cap script).
- Les claus de missatge i les traduccions JSON han de coincidir exactament amb els `id` definits a `defineMessages` als `.lang.ts`.
- Flux complet i checklist: skill `language` (`.claude/skills/language.md`).
