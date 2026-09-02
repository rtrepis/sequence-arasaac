# Comptes, antifrau, quotes i desplegament

> **Quan llegir-lo:** abans de tocar autenticació, registre, imatges d'usuari, quotes, el panell d'administració o la configuració de desplegament.

## Identitat

- **`emailCanonical` és l'única clau d'identitat** (`apps/api/src/shared/emailCanonical.ts`). L'`email` es conserva tal com l'escriu l'usuari perquè és l'adreça on se li escriu, però l'índex únic i totes les cerques (registre, login, cerca del panell) van contra el canònic. Sense això, `algu@gmail.com`, `a.l.g.u@gmail.com` i `algu+1@gmail.com` són tres comptes i una sola bústia.
- `googlemail.com` es canonicalitza a `gmail.com`: és el mateix servei amb el nom antic.
- Els punts **només** s'eliminen als dominis de Google. A un domini corporatiu, `joan.puig@` i `joanpuig@` poden ser dues persones.
- **Excepció per a proves internes**: `PLUS_ALIAS_EXEMPT_EMAILS` (variable d'entorn de l'API, llista separada per comes) exempta bústies concretes del descart de l'alias `+`. Per a una bústia hi llistada, `algu+ca@gmail.com` i `algu+es@gmail.com` són dos comptes diferents (els punts es continuen ignorant igual); per a qualsevol altra, el comportament no canvia. Serveix perquè, amb un únic compte real de Gmail, es puguin crear diversos usuaris de prova (un per idioma) sense obrir aquesta porta a la resta. Buida per defecte — a producció només hi ha d'haver les bústies de l'equip que en necessiten.

## Estat del compte

- **`status`** (`pending` / `active` / `suspended`) i **`role`** (`user` / `admin`) són coses diferents de **`tier`**: `role` és permís, `tier` és pla comercial. No barrejar-los mai.
- Un compte **`pending`** (correu sense verificar) **pot entrar i treballar**; només no pot **desar al núvol** (`requireVerifiedEmail` a `POST`/`PUT /api/documents`). Bloquejar l'accés sencer a una eina d'AAC perquè un correu s'ha entretingut castiga l'usuari equivocat. **Esborrar sempre es permet**: mai s'ha d'impedir a algú alliberar espai.
- **`authMiddleware` no consulta la BD** i no ho ha de fer: la suspensió es fa efectiva al refresh (com a màxim 15 min). `requireAdmin` sí que hi va, perquè són quatre peticions al dia i el que hi ha darrere és el poder de suspendre comptes.
- Suspendre incrementa `tokenVersion`; el refresh el compara. Sense això, un refresh token ja emès continuaria renovant la sessió fins a set dies.

## Frens de registre

- **`app.set("trust proxy", 1)` a `index.ts` és imprescindible**: a Render, sense això tots els `express-rate-limit` veuen la IP del proxy i o no aturen ningú o els aturen tots alhora.
- L'interruptor de registre i el sostre d'usuaris viuen a la **BD** (`modules/config`), no a l'`.env`: tancar el registre ha de ser un clic al panell, no un desplegament.
- Ordre de comprovacions al registre: registre obert → sota el sostre → **sota el límit del dia** → domini no descartable → canònic lliure. Les que no revelen res van primer.
- **Dos sostres, no un**: `maxUsers` diu quanta gent hi cap en total i `maxDailySignups` (40 per
  defecte) a quina velocitat pot entrar-hi. El diari no és cap rate limiter: aquell és per IP i una
  allau des de mil connexions se li escaparia; el que es limita aquí són **comptes creats**, no
  peticions rebudes. Passar-se'l retorna `DAILY_SIGNUP_LIMIT_REACHED`.
- **El comptador del dia és una col·lecció pròpia** (`modules/config/signupCounterModel.ts`), un
  document per dia amb la data en UTC, no un recompte d'usuaris creats des de mitjanit: esborrar el
  compte (`deleteAccount`) esborra l'usuari **i** els seus `SecurityEvent`, de manera que qualsevol
  xifra derivada d'aquelles col·leccions es podria buidar donant-se de baixa —just el que un fre
  diari ha d'impedir. El comptador només puja, i el purga un índex TTL de 60 dies.
- **Només compta una alta de debò**: un correu que ja té compte no gasta plaça del dia, i el `$inc`
  va **després** de crear l'usuari perquè una creació fallida no en cremi cap.
- **El que queda es pot consultar abans d'omplir res**: `GET /api/auth/registration-status` és
  públic i retorna només recomptes —gent registrada, places totals i del dia que queden, quan es
  reinicia el comptador (mitjanit UTC, en ISO perquè el front el pinti en hora local) i un
  `canSignup` amb les tres condicions ja resoltes. Descobrir que avui no hi cap ningú després
  d'omplir el formulari és el que això evita.

## Traça antiabús

- **La IP no es desa mai en clar**, enlloc. `shared/ipHash.ts` en fa un HMAC-SHA256 amb `IP_HASH_SECRET`; el `SecurityEvent` només en guarda el hash. Amb això es pot comptar «quantes altes d'aquest origen» sense tenir cap IP a la base de dades.
- `SecurityEvent` porta **índex TTL de 30 dies**: MongoDB purga sol. Res de cron ni de tasques de manteniment.

## Quotes

- Els límits viuen al **codi** (`shared/tierLimits.ts`), no al document d'usuari: apujar el límit del pla gratuït ha de ser un desplegament, no una migració. `quotaOverride` és només per a excepcions puntuals.
- **La quota es comprova abans de pujar res a Cloudinary**, estimant els bytes des de la llargada del base64. Pujar primer i rebutjar després deixaria imatges orfes ja pagades.
- **El contingut d'un document es compacta en desar-lo i es completa en llegir-lo**
  (`modules/documents/contentStorage.ts`). Mesurat amb `BSON.calculateObjectSize`, un document
  de 32 pictogrames ocupava 28 KB dels quals gairebé sis de cada deu bytes eren còpies: ajustos
  idèntics als del propi document i identificadors de resultats de cerca d'ARASAAC. Compactat
  en fa 15,6, i els comptes que caben als 512 MB d'Atlas passen de ~5.900 a ~10.100.
  **És capa d'emmagatzematge i prou**: ni el `.saac`, ni el que retorna l'API, ni Redux canvien
  de forma. Dues regles que no es poden trencar: **`textPosition` no s'omet mai** —el
  `PictogramCard` el llegeix sense fallback i el pictograma sortiria sense text—, i **sense
  `defaultSettings` al document no es compacta cap ajust**, perquè no hi hauria amb què
  tornar-lo a omplir. El retall de `bestIdPicts` és l'única part que no es desfà: és una caché
  d'una petició gratuïta i el botó d'ampliar la cerca la recupera.
- **Cap imatge d'usuari es desa mai a MongoDB.** `shared/imageAssets.ts` és l'única porta al núvol
  i el comparteixen els documents i el vocabulari personal; `shared/quota.ts` és l'únic lloc on es
  comprova el consum, perquè el pes d'un compte és un de sol repartit entre els dos. Fins a la
  branca `claude/estudi-limits-gratuïts-serveis`, `PUT /user/ui-settings` desava el `customImageUrl`
  en base64 dins del document d'usuari: no passava per cap quota i topava amb el límit de 16 MB per
  document de MongoDB a la vint-i-quatrena imatge, vuit vegades abans del límit de 200 paraules que
  l'app deia tenir.
- **Una imatge es demana sempre a la mida en què es pinta.** Les de l'usuari es desen a mida
  d'impressió (~500 KB); als llistats es veuen en quadradets de 40 px. `utils/cloudinaryUrl.ts`
  n'és l'única porta: en demana la variant reduïda a Cloudinary (el doble de la mida de pantalla,
  per a densitat 2×) i deixa passar intacta qualsevol URL que no sigui de Cloudinary, de manera
  que els components l'apliquen sense saber d'on ve cada imatge. La transformació **no es desa
  mai** a la base de dades: la mateixa imatge s'ha de poder servir sencera a l'editor. Sense això,
  obrir el llistat de documents costava 4,5 MB i la pestanya de vocabulari, 15 MB.
- **`MAX_IMAGE_BYTES` es comprova al servidor, no només al front.** És el que fa que «nombre
  d'imatges» vulgui dir un pes concret: sense sostre per imatge, qualsevol límit expressat en
  recompte deixa de protegir res, perquè el client el pot ignorar.
- **Les imatges orfes s'esborren després d'escriure, no abans.** Si s'esborren abans i l'escriptura
  falla, els perfils desats apunten a imatges que ja no existeixen. Val més una imatge orfe a
  Cloudinary que un vocabulari trencat. (`modules/documents/service.ts` encara ho fa a l'inrevés.)
- **El que l'usuari gasta se li ensenya, i abans de topar-hi.** Els comptadors d'`usage`
  existien des del principi però només els veia l'administrador: qui feia servir l'app
  descobria el límit en forma d'error en desar, quan ja hi havia mitja hora de feina a
  sobre. Ara `GET /user/ui-settings` retorna `usage` i `limits` —no costa cap petició
  més: aquella ja surt a cada restauració de sessió i llegeix el mateix document— i
  `GET /user/quota` els torna a demanar quan han canviat (després de desar, d'esborrar
  un document o una imatge). El tab **Usuari** els pinta a la secció «L'espai del teu
  compte», i és l'única de tot el modal que **no** surt sense sessió: sense compte no hi
  ha cap límit i una secció buida només faria preguntar què hi falta.
- **`quota` és un slice a part d'`uiSlice`**, com `documentStatus` ho és de `documentSlice`:
  no és cap preferència ni res que l'usuari pugui triar, és el que diu el servidor de com
  està el compte. Si hi fos, desar la configuració l'enviaria de tornada com si fos una
  tria. I `usage: null` **no vol dir zero**: vol dir que encara no se sap (sense sessió, o
  amb Render adormit). Amb aquesta diferència esborrada, l'avís de «no hi cap» sortiria a
  qui treballa sense compte, que no té cap límit.
- **La qualitat de les imatges la tria l'usuari, i només val per a les que vindran.**
  `imageQuality` (`print` 1.800 px/500 KB, `standard` 1.200/250, `compact` 800/120, a
  `IMAGE_QUALITY_PRESETS`) és una preferència del compte, no un automatisme: quan es puja
  una imatge encara no se sap a quina mida s'imprimirà —`sizePict` es toca després— i
  reduir és irreversible, de manera que el client no ho pot decidir sol (és el mateix
  motiu pel qual no es rebaixa segons quantes imatges hi hagi). Per això `print` continua
  sent el valor per defecte i **cap automatisme no toca mai una imatge ja pujada**:
  tornar-la a comprimir sola seria perdre detall que ningú ha demanat de perdre. Qui sí
  que en pot canviar la mida és **l'usuari, una per una** i sabent què hi perd — vegeu
  «Canviar de mida una imatge ja pujada» més avall.
- **El pes es diu sempre amb la mida d'impressió al costat.** «500 KB» no és cap referència
  per a qui no és informàtic, i el que decideix de veritat és si el pictograma es veurà bé
  al full: `utils/imagePrintSize.ts` tradueix els píxels a centímetres a 300 ppp
  (`GOOD_PRINT_DPI`), i `useFormatPrintSize` és l'única manera d'escriure-ho, com
  `useFormatBytes` ho és per al pes. Els tres nivells surten a 15, 10 i 7 cm, i el
  d'`Impressió` cobreix el pictograma més gran que l'app pot imprimir (150,8 mm). Ho porten
  el triador de qualitat (peu i tooltip de cada nivell), el diàleg de la imatge que no cap i
  cada fila de la llista d'imatges del compte. La xifra és un **sostre** («fins a»), mai una
  mida recomanada, i no s'inventa mai: sense píxels coneguts es diu només el pes.
- **Canviar de mida una imatge ja pujada** (`PATCH /user/assets`, `ImageResizeDialog`) és
  l'altra sortida de la llista d'imatges, i sovint la que toca: esborrar recupera tot
  l'espai però deixa el pictograma sense imatge, i a qui imprimeix petit el que li sobra és
  resolució, no la imatge. La versió reduïda la prepara el navegador amb el mateix
  codificador de la pujada —**codificant de veritat**, com `encodeToFit`: només s'ofereixen
  els nivells que retallen píxels i que, un cop codificats, pesen menys— i el servidor puja
  la nova, la posa on hi havia la vella i esborra la vella, en aquest ordre. **La URL
  canvia**: qui la feia servir l'ha d'adoptar (`replaceCloudImage` al document obert, els
  `wordProfiles` al vocabulari), igual com passa en esborrar-la, i per això la resposta
  torna l'asset tal com ha quedat. El pes de referència és el del registre d'assets, que és
  el que es restarà del comptador; el mesurat només mana quan el registre no en sap res
  (imatges d'abans que el registre existís, que en canviar de mida s'hi donen d'alta).
- **Una imatge que no cap es diu en pujar-la, no en desar.** `UploadImageButton` comprova
  dos sostres amb la imatge ja convertida: el pes màxim per imatge (`MAX_UPLOAD_IMAGE_BYTES`,
  el mateix `MAX_IMAGE_BYTES` que fa complir el servidor) i, **només amb sessió**, l'espai
  que queda al compte. Si algun es passa, `encodeToFit` prova els nivells més petits
  **codificant de veritat** —el pes objectiu és una fita, no una promesa— i el diàleg
  ofereix la versió que sí que hi cabria. És l'únic moment en què encara es pot fer alguna
  cosa: aquí la imatge original encara és al dispositiu; mitja hora després, en desar,
  l'única sortida seria treure-la del document.
- **La pujada no es bloqueja mai.** L'app funciona sencera sense compte i sense xarxa: una
  imatge que no cabrà al núvol s'ha de poder posar igualment i imprimir-la des d'aquest
  dispositiu, i per això «Posa-la igualment» hi és sempre. El que sí que canvia és el
  missatge de quan es desa: `QUOTA_STORAGE_EXCEEDED` diu on mirar què ocupa cada imatge, i
  `IMAGE_TOO_LARGE` —que el servidor retornava des que hi ha sostre per imatge i que
  arribava a l'usuari com un codi cru— ja té text. Cap dels dos ofereix reintentar:
  insistir no allibera espai.
- **Esborrar una imatge no esborra el que la feia servir.** `DELETE /user/assets` treu la
  imatge del pictograma del document (que conserva text i número) o de la paraula del
  vocabulari (que es queda amb el seu pictograma d'ARASAAC), en aquest ordre: primer
  s'escriu qui la feia servir, després s'esborra del núvol i al final s'ajusta el comptador
  —esborrar primer i que l'escriptura falli deixaria un document apuntant a una imatge que
  ja no existeix. La miniatura del document també se n'ha de netejar, o el llistat
  ensenyaria un quadre trencat. I si el document esborrat és el que s'està editant,
  `removeCloudImage` el posa al dia: **no** compta com a canvi de contingut
  (`documentStatusMiddleware`), perquè la còpia del núvol no s'ha quedat enrere sinó que
  s'ha avançat, i demanar de tornar-la a desar seria demanar de desar el mateix.
- Cada document guarda `assets: [{ publicId, bytes }]`. Sense els bytes no es pot restar res en esborrar i el comptador només creixeria.
- **Els píxels d'una imatge no es desen enlloc**: els bytes sí, perquè el comptador els ha de
  poder restar, però l'amplada i l'alçada només serveixen per ensenyar-les i desar-les
  voldria dir una migració de tot el que ja hi ha. `listUserAssets` les demana a Cloudinary
  en **una sola petició** per a tota la llista (`fetchImageDimensions`, `resources_by_ids`),
  que a més cobreix les imatges antigues. No llança mai: si Cloudinary no respon, la llista
  surt amb el pes i sense la mida d'impressió — val més una dada menys que cap llista.

## Correu

- `shared/mailer.ts` és **l'únic fitxer que sap que el proveïdor és Resend**. Cap funció seva llança mai.
- **L'enviament no bloqueja mai el registre.** El pla gratuït de Resend són 100 correus/dia: si s'esgota o el proveïdor falla, el compte s'ha de crear igualment i l'usuari ha de poder demanar el reenviament. Un dia dolent del correu no pot deixar el registre trencat.
- Sense `RESEND_API_KEY` (desenvolupament) l'enllaç surt per consola: el flux es pot provar sencer sense gastar quota.
- **A producció, `MAIL_FROM` no pot ser mai del domini de proves del proveïdor** (`resend.dev`): des
  d'una adreça d'allà, Resend només deixa escriure a la bústia del propietari del compte i rebutja
  qualsevol altre destinatari amb un 403. La conseqüència no s'assembla gens a una avaria: els
  correus interns arriben —l'avís d'error, la recuperació de contrasenya del propietari, el
  registre repetit amb la seva pròpia adreça—, i els únics que no surten són els de benvinguda de
  la gent nova, que és qui no et pot avisar. La comprovació d'`env.ts` mira **el domini**, no la
  cadena sencera: fins a la branca `claude/signup-email-error-tpkg8t` comparava per igualtat exacta
  amb el valor de desenvolupament, i n'hi havia prou de canviar el nom que va davant de l'adreça
  perquè passés amb el domini de proves intacte. Va estar setmanes així.
- **L'avís intern no pot competir amb el correu dels usuaris per la mateixa quota.** El
  refredament dels avisos és per codi i el codi l'escriu qui informa (`POST /api/client-errors` és
  obert i el camp és text lliure): amb deu peticions per minut i IP, deu codis diferents cada minut
  són fins a 600 correus l'hora i els 100 diaris del pla gratuït se'n van en deu minuts. Per això hi
  ha un sostre diari d'avisos (`MAX_ALERT_EMAILS_PER_DAY`, 20) per damunt del refredament. Compta
  **intents**, no lliuraments: el que s'ha de limitar és quantes vegades es truca al proveïdor.
- **Un correu que no surt es registra com a error vist** (`MAIL_SEND_FAILED` a `client-errors`, amb
  el motiu que dona el proveïdor). Abans la fallada només anava a la consola de Render: qui es
  quedava sense l'enllaç no tenia contrasenya, per tant no podia entrar, per tant no podia demanar
  el reenviament des del banner —que exigeix sessió—, i enlloc de l'aplicació no en constava res.
- **El signup diu la veritat sobre el correu**: `SignupPage` llegeix l'`emailSent` que retorna
  l'API i, quan és fals, ho diu i ofereix el reenviament allà mateix (`POST
  /auth/resend-verification` no demana sessió justament per això). Amb la pantalla d'èxit
  incondicional, un rebuig del proveïdor i una alta correcta eren indistingibles.

## Desplegament: el front i l'API han d'anar al mateix origen

- El front és a Vercel i l'API a Render, però **el navegador ha de veure-les al mateix origen**. Ho aconsegueix la regla `/api/:path*` de `apps/web/vercel.json`, que ha d'anar **sempre abans** del catch-all cap a `/index.html` (les regles s'avaluen en ordre; si el catch-all va primer, se les empassa totes i un `POST /api/...` retorna 405).
- **No és per estalviar-se el CORS.** La cookie del refresh token va amb `sameSite: "strict"`; si el front és a `vercel.app` i l'API a `onrender.com`, el navegador la considera cookie de tercers i **no la desa mai**. Símptoma: el login sembla funcionar, però tanques la pestanya i has perdut la sessió. Amb el proxy la cookie és de primera part i la sessió sobreviu.
- Per això mateix, **`VITE_API_URL` no ha d'estar definida a Vercel**. Si hi és amb la URL absoluta de Render, el client se salta el proxy i tornem al problema de la cookie. L'`apiClient` ja cau a `/api` per defecte, que és el que volem.
- La via alternativa (`sameSite: "none"`) queda descartada: Safari bloqueja les cookies de tercers per defecte, i bona part dels usuaris d'AAC són en iPad.
- **`MONGODB_URI` ha de portar el nom de la base de dades** (`.../sequence-arasaac?...`). Sense ell, Mongoose es connecta a `test` i l'aplicació arrenca tan tranquil·la contra una base de dades buida: els usuaris no hi són i tots els logins retornen 401. Ha passat dues vegades, en local i a Render.

## Panell d'administració

- Ruta `/admin`, **fora de `LanguageLayout`** (sense `:locale`) i **només en català, sense `react-intl`**. És eina interna d'una sola persona i cinc fitxers de traducció no s'hi justifiquen. **És una excepció declarada, no un descuit.** El que sí que porta és un `IntlProvider` en català a `AdminPage`: els **textos** hi continuen sent literals, i el proveïdor només hi és perquè els components compartits que en depenen —`ConfirmDialog`, l'única confirmació de l'app— funcionin fora de `LanguageLayout`. Reescriure'n una còpia per al panell trencaria la regla que diu que el criteri de què es confirma s'ha de poder llegir en un sol lloc.
- La protecció de veritat és `requireAdmin` al servidor; la comprovació del front només evita ensenyar una pantalla que no funcionaria.
- **El primer admin es posa a mà des d'Atlas.** No hi ha cap endpoint per promoure administradors, i no n'hi ha d'haver.
- **El panell pot generar l'enllaç d'accés d'un usuari** (`POST /admin/users/:id/password-link`), per
  fer-lo arribar a mà quan el correu no és una via disponible. Sense ell, un compte nou no té
  contrasenya i no s'hi pot entrar de cap altra manera: el correu és de tercers i pot fallar
  sencer. El que retorna **és una credencial**, i per això no viatja mai amb el llistat d'usuaris
  —es demana d'un en un, amb un POST i amb intenció—, no es desa enlloc del navegador, queda
  registrat com a `admin_action` (només que se n'ha generat un i de quina mena, mai el token) i un
  compte suspès no en rep cap. La recepta del token viu només a `createPasswordLink`
  (`auth/service.ts`): amb dues, un dia una de les dues caducaria diferent sense que ho digués res.
  **Val 24 h sigui del tipus que sigui** (`ADMIN_PASSWORD_LINK_TTL_MS`, passat com a `ttlMs` a la
  mateixa recepta). L'hora que dura un `reset` val quan qui el demana té la pantalla oberta
  esperant-lo; aquest no el demana qui l'ha de fer servir, sinó que l'administrador el genera i
  l'ha de fer arribar per un canal que no controla ningú, i entremig hi poden passar hores.
  **A la taula, l'enllaç no es dibuixa**: un cop generat hi ha la icona de copiar i la d'enviar per
  correu, i el que l'enllaç és i fins quan val van al tooltip. Pintat en un camp es menjava mitja
  taula per un text que ningú no ha de llegir mai —el que se'n fa és copiar-lo—, i el porta-retalls
  ja diu que ha anat bé amb el snackbar de sempre. La sortida de quan el porta-retalls falla no es
  perd: aleshores l'URL surt sencer i seleccionable a l'avís de dalt, que només hi és en aquell cas.
- **El botó «Envia» de l'enllaç no envia res: obre un `mailto:`** al client de correu de qui
  administra, i el missatge surt de la seva adreça. Un `mailto:` només porta text (RFC 6068), així
  que la plantilla d'`emailLayout.ts` no hi cap i **no és cap descuit**. El que sí que hi ha de ser
  és el mateix que porta un correu del servidor: el nom de qui el rep, per què li arriba i **fins
  quan serveix l'enllaç**. Qui el rep no espera cap correu d'una persona, i un enllaç sol —darrere
  del qual hi ha establir la contrasenya d'un compte— s'assembla massa a una estafa.
- **Aquell missatge és l'excepció al «el panell va en català»**: la resta del panell la llegeix qui
  administra, i això ho llegeix l'usuari, que pot no entendre'l. Per això `AdminUserSummary` porta
  `lang` —l'únic camp del resum que no es pinta enlloc— i el text viu a
  `features/admin/utils/passwordLinkMail.ts`, amb els cinc idiomes, fora del component de la taula.
  **La caducitat hi va amb el fus horari escrit**: l'hora la formata el navegador de qui administra
  i del compte no en sabem el fus, de manera que sense dir-lo un enllaç es podria donar per caducat
  quan encara serveix.
- **El registre d'errors es pot buidar des del panell**, perquè el que hi queda sigui el que encara demana atenció: `DELETE /admin/client-errors/:id` treu un error mirat (sense confirmar: és una línia de registre, i el que es perd torna sol la pròxima vegada que l'error passi) i `DELETE /admin/client-errors?before=<ISO>` buida fins a un moment donat (això sí que passa pel `ConfirmDialog`). **El tall del buidat és una data, no la llista del que es veu**: el panell només n'ensenya els últims 50, així que amb identificadors el botó deixaria enrere tot el que no hi cap; amb la data, en canvi, el que arribi mentre s'està mirant la pantalla es conserva —que és justament el que encara no ha vist ningú. Com la resta d'accions d'administració, el buidat deixa `SecurityEvent`.
- **La issue de GitHub s'obre amb un enllaç, no des del servidor.** El botó de cada error porta al formulari `issues/new` del repositori ja omplert (codi, on, quan, detall, navegador i etiqueta `bug`), i qui la publica és l'administrador amb el seu compte. Fer-ho amb l'API de GitHub demanaria un token amb permís d'escriptura guardat a Render —una clau més a mantenir i a poder perdre— i tot el que estalviaria és un clic; a canvi, l'enllaç deixa llegir i completar el text abans de publicar-lo. **El correu de l'usuari no hi entra mai**: una issue és pública i el registre d'errors no ho és, i una adreça publicada no es pot desfer.

