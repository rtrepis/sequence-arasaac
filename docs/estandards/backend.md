# Backend i sincronització al núvol

> **Quan llegir-lo:** abans de tocar `features/backend/*` o qualsevol mòdul d'`apps/api`.

## Separació `features/*` vs `features/backend/*`

- **`features/<domini>/`** (`user-settings`, `sequence`...) és l'estat local: slice de Redux i, quan cal, persistència directa al navegador (`storage/settingsStorage.ts`). Funciona sense compte.
- **`features/backend/<domini>/`** (`auth`, `documents`, `user-settings`) és tot el que parla amb l'API: `services/` (crides amb `apiClient`) i `store/` (thunks). `features/backend/api/` és transversal: `apiClient` (axios amb interceptors JWT) i tot el que gestiona l'estat "el servidor s'està despertant".
- Un domini pot tenir estat a banda i banda (`user-settings` local i `backend/user-settings`) precisament perquè la mateixa configuració es guarda diferent segons si hi ha sessió — vegeu `saveUserUiThunk` (`features/backend/user-settings/store/settingsThunks.ts`): autenticat → `PUT /user/ui-settings`; anònim → `localStorage`, i **sense vocabulari** (`wordProfiles: []`), perquè el vocabulari amb imatges en base64 només té sentit lligat a un compte i ompliria l'espai del navegador d'un dispositiu compartit.

## El servidor s'adorm (pla gratuït de Render)

- Render adorm `apps/api` als 15 minuts sense trànsit; la primera petició que hi arriba el desperta i pot trigar prop d'un minut. Sense cap senyal, l'usuari només veu un botó bloquejat.
- **`backendStatus.ts`** (`features/backend/api`) dedueix el desvetllament de la durada de les peticions reals en curs (llindar `SLOW_REQUEST_THRESHOLD_MS`, 3 s) — **no** fa cap petició pròpia per comprovar-ho. És un mòdul fora de Redux a propòsit: `apiClient` (que no és un component) l'ha de poder alimentar des dels seus interceptors (`notifyRequestStart`/`notifyRequestEnd`).
- **`warmUpBackend.ts`** fa un ping preventiu (`GET /health`) quan té sentit avançar el cost (p. ex. en obrir el formulari de login), amb un cooldown de 10 min perquè no es repeteixi dins la mateixa sessió activa.
- Les peticions de fons (`isBackgroundRequest: true` a `AxiosRequestConfig`, camp propi afegit per augmentació de tipus a `apiClient.ts`) no compten per a l'avís: ningú les espera activament.
- **`BackendWakeUpNotice`** és un `Snackbar` **no bloquejant**: l'editor funciona sencer sense backend, així que enfosquir la pantalla mig minut seria pitjor que l'espera mateixa. Només si hi ha un backdrop obert (`state.backdrop.open` del `FeedbackContext`) canvia el text per avisar que allò sí que està bloquejat.
- `REQUEST_TIMEOUT_MS` d'`apiClient` és **90 s**, deliberadament ampli perquè un desvetllament que voreja el minut no es talli i es converteixi en error just quan el servidor ja anava a respondre.

## Classificació de fallades i reintent (`requestFailure.ts`)

- Tota fallada de petició es classifica amb `classifyRequestFailure`: l'únic que importa és si **val la pena reintentar sol** (`isTransient`). Transitori = xarxa/timeout/backend engegant-se (408/425/429/502/503/504, codis axios `ECONNABORTED`/`ETIMEDOUT`/`ERR_NETWORK`); no transitori = rebuig del servidor (dades invàlides, quota) o `STORAGE_FULL` (espai del navegador exhaurit, codi propi que no ve de cap petició HTTP).
- Patró de referència: `useSaveUiSettings` (`features/backend/user-settings/hooks`). El desat **no bloqueja el tancament del modal** (els panells ja han sincronitzat Redux abans de desar): es llança en segon pla, amb un sol reintent automàtic si la primera fallada és transitòria (`TRANSIENT_RETRY_DELAY_MS`, 8 s), i només si el segon intent també falla apareix `SettingsSaveErrorDialog` — un diàleg, no un snackbar, perquè arriba quan l'usuari ja no pensa en la configuració i cal dir-li què s'hi juga i què pot fer.
- Qualsevol fallada que arribi a l'usuari (després del reintent automàtic) es reporta amb `reportClientError` cap al mòdul `client-errors` de l'API — «s'informa del que ha arribat a l'usuari, no del que s'ha resolt sol».

## Documents al núvol: nom, miniatura i progrés

- **Desar al núvol passa sempre pel diàleg de nom** (`SaveDocumentModal`, `features/backend/documents/components`). Abans, «Desa al núvol» enviava el document sense títol i el llistat l'anomenava amb els últims sis caràcters de l'identificador: amb un sostre de pocs documents per compte, distingir-los abans d'esborrar-ne cap deixa de ser una comoditat.
- **La casella no comença en blanc**: `suggestDocumentTitle` (`features/sequence/utils`) proposa les **quatre primeres paraules** de la seqüència, en l'ordre en què l'usuari les veu. Acceptar la proposta ha de costar el mateix que no posar-hi nom; si no, el camp es converteix en un peatge i tothom hi deixa el que hi hagi.
- El nom viu al **document** (`setDocumentTitle` a `documentSlice`), no al diàleg: així sobreviu a l'esborrany d'IndexedDB i al fitxer `.saac`.
- **La miniatura la deriva el servidor**, no el client (`modules/documents/thumbnail.ts`): els **tres primers pictogrames** del document, guardats com a referències (`selectedId` + aparença, o la URL de Cloudinary d'una imatge pròpia). **No es genera ni es puja cap imatge nova** — no costaria només diners de Cloudinary, sinó quota de l'usuari. Es calcula **després** de pujar les imatges, perquè mai hi entri un base64.
- Es guarda al document i no es calcula en llistar: `listDocuments` només selecciona `title updatedAt thumbnail`, i llegir el contingut sencer de cada document per pintar tres quadradets seria transferir megabytes per res. Els documents desats abans d'existir el camp el tenen buit i el llistat els ensenya amb icona genèrica.
- **El progrés de la transferència surt dels events d'axios** (`onUploadProgress`/`onDownloadProgress`) i es publica a `documentTransfer.ts`, un mòdul fora de Redux com `backendStatus`: el thunk no pot rebre una funció per argument sense fer l'acció no serialitzable. Si la petició no diu la mida total, el percentatge és `null` i la barra passa a indeterminada — més val això que un número inventat.
- **«Desa'n una còpia» és l'única manera de derivar un document d'un altre** (`saveDocumentThunk`
  amb `asCopy`, que força el `POST` encara que el document ja tingui id de MongoDB). Viu al peu del
  mateix diàleg de desar, a la **ranura de l'esquerra**: desa, però no on l'usuari ve de desar, i
  així queda separat de l'acció que substitueix la versió del núvol. L'`Enter` del camp de nom fa
  sempre l'acció principal, mai la còpia. L'id nou el recull el `loadDocumentSaac` de sempre, de
  manera que **a partir d'aquell moment es treballa sobre la còpia**: el snackbar ho diu, perquè si
  no el desat següent aniria a parar a la còpia pensant que va a l'original.
- **La còpia no pot tenir el nom de l'original**: al llistat quedarien dues files iguals, i el
  llistat és l'únic lloc on es tria quin document es carrega i quin s'esborra. Es demana el nom quan
  encara se'n sap la diferència, no després.
- **Èxit → snackbar; error → es queda al diàleg.** En desar bé o carregar bé, un snackbar amb el nom del document. Si falla, l'`Alert` es queda dins del diàleg (amb el codi semàntic del backend) perquè es pugui tornar a provar sense reescriure el nom.

## Registre d'errors del client (`modules/client-errors`, API)

- Els errors que arriben a un usuari es registren a `ClientErrorModel` i, si `ADMIN_ALERT_EMAIL` està configurat, generen un correu — amb throttle d'una hora per codi (`ALERT_THROTTLE_MS`) perquè una fallada que afecti tothom alhora no esgoti la quota diària de correu just el dia que més falta fa.
- `recordClientError` **mai llança**: un problema de registre no ha de convertir un error menor de l'usuari en un de gros.
- `errorHandler` (middleware Express) hi registra també qualsevol resposta 5xx pròpia amb `SERVER_` de prefix al codi; els 4xx no es registren perquè són respostes previstes.
- Visible al panell d'administració (`AdminClientErrorsTable`, `features/admin`).
