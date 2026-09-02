# Estudi: com aprimar l'arquitectura de cinc serveis

Avui l'aplicació viu repartida entre **Vercel, Render, MongoDB Atlas, Cloudinary
i Resend** (sis, si s'hi compta Google Analytics). Aquest document mira quants
d'aquests proveïdors són realment necessaris, què costaria treure'n cadascun i
quin ordre té sentit, amb els números del repositori a la mà.

És un **estudi, no una branca de canvis**: no proposa tocar res avui. Fa parella
amb `ESTUDI-limits-serveis-gratuits.md`, que mira *quant marge* queda a cada
servei; aquest mira *quants serveis calen*. I amb `ESTUDI-servidor-propi.md`, que
es fa la mateixa pregunta **sortint del núvol**: què passa si els serveis que ens
donen els operadors se'ls munta un mateix.

Data de l'estudi: setembre del 2026. Els límits dels proveïdors canvien; les
xifres porten enllaç a la font.

---

## Dues coses diferents que es diuen «aprimar»

Convé separar-les, perquè les solucions no coincideixen:

1. **Menys proveïdors** — menys taulers, menys credencials, menys quotes
   gratuïtes que vigilar i, sobretot, **menys llocs on una cosa pot fallar en
   silenci**. Per a un projecte que manté una sola persona, això últim és el que
   pesa: l'altre estudi ja documenta dues avaries mudes (el domini de proves de
   Resend, la `MONGODB_URI` sense nom de base de dades) que van estar setmanes
   actives sense que res es queixés.
2. **Menys estructura** — menys codi, menys conceptes, menys peces que s'han
   d'entendre abans de tocar res.

La conclusió d'aquest estudi és que hi ha **un sol moviment que millora les
dues coses alhora**, i que la resta de consolidacions imaginables o bé no
guanyen res o bé costen més del que estalvien.

---

## La resposta curta

- **El terra són tres proveïdors**: allotjament, base de dades i correu. Cap
  proveïdor d'allotjament no inclou correu transaccional, i el correu no es pot
  treure del producte (vegeu §5).
- **Amb l'emmagatzematge d'imatges, quatre.** Baixar a tres voldria dir renunciar
  a les transformacions de mida, i aleshores el que es guanya no compensa.
- **De cinc a quatre és factible i val la pena.** El candidat és **Vercel +
  Render → Vercel**: és l'única consolidació que, a més de treure un tauler,
  **esborra un subsistema sencer** —les ~265 línies que hi ha per gestionar que
  Render s'adorm— i elimina la regla de proxy de la qual depèn que la sessió no
  es perdi.
- **Té una precondició**: les funcions de Vercel tenen un sostre **dur** de
  **4,5 MB per cos de petició**, i avui `POST /documents` n'admet 12 amb les
  imatges en base64 a dins. Cal que les imatges deixin de passar per l'API i
  vagin del navegador al magatzem directament — cosa que, resulta, **ja convé
  fer per si mateixa** (§3.4).
- **Mongo, Cloudinary i Resend es queden**, cadascun per un motiu diferent i
  cap dels tres per inèrcia.

---

## 1. Què fa cada servei, i per quina porta hi passa

La primera cosa que s'ha de saber per estimar un canvi de proveïdor no és què fa
el servei, sinó **quants fitxers saben que existeix**.

| Servei | Què fa | Per on hi passa el codi | Cost de treure'l |
|---|---|---|---|
| **Vercel** | Serveix l'SPA + fa de proxy `/api` cap a Render | `apps/web/vercel.json` (13 línies) | Baix — és configuració |
| **Render** | Executa el procés Express | `render.yaml` + `apps/api/src/index.ts` | Baix–mitjà |
| **Cloudinary** | Desa i serveix les imatges de l'usuari | `shared/cloudinaryClient.ts`, `shared/imageAssets.ts`, `utils/cloudinaryUrl.ts` (front) | **Mitjà** — porta única |
| **Resend** | Correu transaccional | `shared/mailer.ts` | **Baix** — porta única |
| **MongoDB Atlas** | 6 col·leccions, tot l'estat persistent | Mongoose a tots els models i serveis | **Alt** — sense porta |
| *(GA4)* | Analítica | `usePageTracking.ts` + 6 punts d'esdeveniment | Baix |

Aquí hi ha la troballa que ordena tot l'estudi: **el cost de moure un proveïdor
és inversament proporcional a com de visible és al codi.** Cloudinary i Resend
són els que més «soroll» fan al `render.yaml` (sis de les catorze variables
d'entorn) i alhora els més barats de substituir, perquè el projecte ja els va
tancar darrere d'un sol fitxer a propòsit —les regles de la casa ho diuen
explícitament: *«mailer.ts és l'únic fitxer del projecte que sap quin proveïdor
de correu es fa servir»*, *«imageAssets.ts és l'única porta per on una imatge
entra o surt del núvol»*. Mongo, que no té cap porta i viu escampat per tots els
models, és el que sembla més innocent i el que costaria un mes.

### 1.1 El que ja està fet i no es veu

Tres coses del codi actual fan que la consolidació sigui molt més barata del que
seria en un projecte equivalent, i val la pena tenir-les comptades:

- **`index.ts` ja exporta l'`app` a part de l'arrencada** (`export const app`).
  Convertir-la en una funció d'un altre entorn és separar les cinc últimes línies
  a un fitxer propi, no reescriure res.
- **El refredament dels avisos d'error és a la base de dades**, no en memòria
  (`hasRecentAlert` consulta `ClientErrorModel`). En un servidor de procés llarg
  això és indiferent; el dia que hi hagi N instàncies, és la diferència entre
  un límit que funciona i un de decoratiu.
- **L'únic estat en memòria del servidor és el de `express-rate-limit`.** No
  n'hi ha cap altre: ni caus, ni temporitzadors, ni comptadors de procés (la
  resta ja passa per Mongo, inclòs el comptador diari de registres).

---

## 2. El terra: quants proveïdors calen com a mínim

Quatre necessitats que no es poden servir des del mateix lloc:

| Necessitat | Es pot fusionar amb… | Comentari |
|---|---|---|
| Servir l'SPA | l'API | Trivial: fitxers estàtics |
| Executar l'API | l'allotjament del front | Vercel, Render, Cloudflare i Netlify ho fan tots dos |
| Persistir comptes i documents | *cap allotjament gratuït* | Neon/Supabase/Atlas/Turso són sempre un altre compte |
| Enviar correu | **cap** | Cap PaaS no ofereix correu transaccional al pla gratuït |
| Desar imatges binàries | l'allotjament, a vegades | Vercel Blob i Cloudflare R2 hi són; capacitats molt diferents |

O sigui: **tres proveïdors és el terra realista**, i quatre si es vol conservar
el que Cloudinary aporta de debò. Passar de cinc a quatre és tot el marge que hi
ha, i és un marge real —un tauler menys és un tauler menys— però convé saber que
la reducció s'acaba aquí i que qui esperi «un sol servei» no el trobarà.

---

## 3. Allotjament: Vercel + Render → un de sol

És l'única fusió amb guany clar. Hi ha tres maneres de fer-la i no s'assemblen.

### 3.1 E1 — Tot a Vercel (l'API com a funció)

L'SPA es queda on és i l'Express passa a ser una funció de Vercel darrere de
`/api/*`.

**Què s'hi guanya, més enllà del tauler:**

- **La regla de proxy desapareix.** Avui `vercel.json` té dues reescriptures i
  **l'ordre és portant**: si el catch-all cap a `/index.html` anés primer, es
  menjaria totes les crides a l'API i un `POST` retornaria 405. Aquesta trampa
  està documentada al CLAUDE.md perquè ja hi va caure algú. Amb l'API al mateix
  desplegament, el mateix origen és un fet de l'arquitectura i no una regla que
  algú ha de recordar de no moure de lloc.
- **La cookie de refresc deixa de dependre de res.** El `sameSite: "strict"`
  funciona avui *gràcies* al proxy; sense ell, el navegador la consideraria de
  tercers i la sessió no sobreviuria a tancar la pestanya (i a Safari, on hi ha
  bona part dels usuaris d'AAC, ni tan sols amb `sameSite: "none"`).
- **S'acaba la son de 15 minuts.** I amb ella, tot el que existeix només per
  explicar-la:

  | Fitxer | Línies | Què fa |
  |---|---|---|
  | `backendStatus.ts` | 71 | Dedueix el desvetllament de la durada de les peticions |
  | `BackendWakeUpNotice.tsx` + `.lang.ts` | 94 | L'avís, en cinc idiomes |
  | `useWarmUpOnReturn.ts` | 59 | Ping en tornar a la pestanya després de 5 min |
  | `warmUpBackend.ts` | 28 | Ping preventiu amb refredament de 10 min |
  | `useBackendWakeUp.ts` | 13 | Subscripció per als components |
  | **Total** | **265** | + 5 punts de muntatge a pàgines i modals |

  A sobre hi ha el que no es pot comptar en línies: el `REQUEST_TIMEOUT_MS` de
  90 segons, la bandera `isBackgroundRequest` de l'`apiClient`, i el fet que
  **el primer «Desa al núvol» del dia pot trigar un minut**. Un arrencada en
  fred d'una funció és de centenars de mil·lisegons, no d'un minut.
- **El CORS s'acaba de debò** (vegeu §7, on ja és mig mort).
- **Dues variables d'entorn menys** (`PORT`, `CORS_ORIGIN`).

**Què costa:**

- **El mur dels 4,5 MB** — és la part seriosa i té secció pròpia (§3.4).
- **Connexió a Mongo reutilitzada entre invocacions.** Patró conegut, unes 15
  línies a `config/database.ts`, però cal fer-lo: sense això cada invocació obre
  una connexió i les 500 d'Atlas M0 s'esgoten amb una punta petita.
- **Els limitadors deixen de ser fiables.** `express-rate-limit` compta en
  memòria del procés; amb N instàncies, cada una compta pel seu compte i el
  límit efectiu es multiplica per N. **No és un detall cosmètic**: el CLAUDE.md
  diu que els limitadors són el que impedeix que un abús es converteixi en
  consum de tres quotes alhora. La sortida raonable és no tractar-los tots
  igual: el limitador global (300/min) pot passar al tallafoc de Vercel, però
  els tres cars —registre, correu i `client-errors`— han de comptar contra
  Mongo, que és on ja compta el comptador diari de registres.
- **Regió.** Atlas és a Europa i les funcions de Hobby van a una sola regió, per
  defecte als EUA. S'ha de fixar a Frankfurt o Estocolm o cada consulta paga
  l'Atlàntic dues vegades.
- **Hobby no admet ús comercial** i, en passar dels límits, **pausa el projecte**
  en comptes de facturar. Avui cap de les dues coses és un problema (no hi ha
  pla de pagament) però ara afectarien *tota* l'aplicació, no només l'API: si es
  passa el sostre, no cau el desat al núvol, cau el web sencer. És l'única cosa
  que E1 empitjora, i s'ha de dir.

### 3.2 E2 — Tot a Render (lloc estàtic + servei web)

Render serveix llocs estàtics gratuïtament i permet definir reescriptures des
del tauler, o sigui que el proxy `/api` es podria fer allà mateix i la cookie
continuaria sent de primera part. Els llocs estàtics **no consumeixen hores
d'instància**: les 750 h/mes continuen sent només per a l'API.

- **Guany:** un tauler menys, un sol repositori connectat a un sol proveïdor,
  i **cap línia de codi tocada**. És mig dia de feina i risc gairebé nul.
- **Cost:** cap, tret d'un: **no arregla res**. L'API continua adormint-se, les
  265 línies del desvetllament continuen sent necessàries, i el proxy continua
  sent una regla que algú ha de mantenir en ordre.

E2 és l'opció honesta per a qui vulgui **només** menys taulers. Però és un carrer
sense sortida respecte d'E1: la feina que s'hi inverteix es llença el dia que
s'hi vagi. **Convé triar-ne un, no fer E2 «mentrestant».**

### 3.3 E3 — L'Express serveix també l'SPA — descartada

És la que semblaria més neta: un sol servei, cap proxy, cap origen creuat. **És
la pitjor de les tres**, i el motiu és el que fa que el pla gratuït de Render
sigui viable avui:

> L'aplicació funciona sencera sense compte. Avui, quan Render dorm, l'editor
> s'obre igual i a l'instant, perquè el serveix el CDN de Vercel; el que espera
> el minut és només qui desa al núvol. Amb l'SPA darrere del contenidor, **la
> primera visita del dia serien seixanta segons de pantalla en blanc** abans que
> React arrenqui, per a tothom, també per a qui no té compte ni el vol.

La son és suportable exactament perquè el front no hi és a darrere. E3 posa
l'única part que no necessita servidor darrere del servidor que dorm.

### 3.4 El mur dels 4,5 MB (i per què el seu remei convé igualment)

Les funcions de Vercel tenen un màxim **de 4,5 MB per cos de petició i de
resposta**, retornen `413 FUNCTION_PAYLOAD_TOO_LARGE` en passar-lo i **no es pot
apujar per configuració**: és de la infraestructura.

Avui l'API accepta cossos de 12 MB (`express.json({ limit: "12mb" })`) i els fa
servir: les imatges viatgen **en base64 dins del document**, i el servidor és qui
les puja a Cloudinary (`uploadBase64Slots`). Amb el 33 % que hi afegeix el base64,
un `POST /documents` amb set imatges de 500 KB ja frega els 4,5 MB. O sigui que
**E1 no hi cap tal com està l'API avui**.

El remei és que les imatges deixin de passar per l'API: el servidor **signa** una
pujada, el navegador puja **directament** al magatzem i després en registra el
`publicId` i els bytes. I val la pena mirar-s'ho al revés del que sembla, perquè
aquest canvi **arregla coses que ja fan nosa avui**:

- **Cada imatge fa dos salts de més.** Ara va del navegador a Vercel, de Vercel a
  Render i de Render a Cloudinary. Es paga banda als dos proveïdors —L7 de
  l'altre estudi— per transportar el que podria anar directe.
- **El base64 infla un terç.** 500 KB de foto són 667 KB de petició.
- **Les pujades són seqüencials dins d'una sola petició** (`for` amb `await` a
  `uploadBase64Slots`). Dotze imatges són dotze pujades encadenades amb el client
  esperant, i és justament el patró que topa amb qualsevol límit de durada.
- **La quota es comprova sobre una estimació** (`estimateIncomingBytes` calcula
  els bytes des de la llargada de la cadena) i després es corregeix amb el que
  digui Cloudinary. Amb pujada signada, el pes real es coneix abans de registrar
  res.

El que s'hi perd és la garantia més valuosa del disseny actual: avui **cap imatge
no entra al núvol sense haver passat per `assertWithinQuota`**. Amb pujada
directa, la quota s'ha de fer complir a la signatura —que és on toca: la
signatura es pot emetre acotada a carpeta, format i pes màxim, i només si el
compte té espai. No és més fluix, però és **una altra cosa**, i s'ha d'escriure
amb el mateix compte amb què es va escriure `shared/quota.ts`.

**Estimació:** unes 300–400 línies netes entre els dos apps, i el gruix és
front (`UploadImageButton` i els serveis de documents i vocabulari). A canvi
s'esborren `uploadBase64Slots`, el límit de 12 MB i, indirectament, la meitat
dels arguments de l'apartat de quotes.

---

## 4. Cloudinary: es queda, i ja se sap què caldria per treure'l

**Què li demanem, exactament:**

1. Desar binaris (≤ 500 KB per imatge, 5 MB per compte).
2. Servir-los per CDN.
3. **Redimensionar-los a la demanda** (`utils/cloudinaryUrl.ts`), que és el que
   fa que un llistat de miniatures de 40 px no baixi 4,5 MB.
4. Dir-ne el pes i els píxels (`resources_by_ids`), que és el que permet ensenyar
   la mida d'impressió sense desar-la enlloc.

**La capacitat ja no és l'argument.** Amb el sostre de 200 comptes i els 5 MB per
compte de `tierLimits.ts`, **tot l'emmagatzematge possible de la plataforma és
1 GB**. Cabria de sobres a Cloudflare R2 (10 GB gratuïts i **egress gratuït**,
que és justament l'única partida de Cloudinary que creix amb l'ús) i just just a
Vercel Blob (1 GB d'emmagatzematge i 10 GB de transferència al mes, o sigui el
sostre exacte sense cap marge).

**El que el reté és el punt 3.** R2 i Blob són cubs: guarden i serveixen, no
transformen. Sense transformació, les miniatures s'han de generar **en pujar**,
al navegador —que ja hi té el codificador de `imageToBase64.ts`— i desar-se com
un segon objecte. Això trenca una cosa que el projecte ha decidit dues vegades:
que **una imatge és un pes**, i que el que compta el comptador és aquell pes.
Amb dos objectes per imatge, la quota es torna «un pes i una mica més», i la
llista d'imatges del compte hauria d'explicar-ho.

I encara hi ha l'aritmètica de taulers: **canviar Cloudinary per R2 no treu cap
proveïdor**, en canvia un per un altre. Només compta si el front i l'API també
se'n van a Cloudflare, i això vol dir reescriure Express a Workers i abandonar
Mongoose. Per a 6.668 línies d'API, no.

**Conclusió:** es queda. El que s'ha de conservar és la porta: mentre
`imageAssets.ts` sigui l'únic fitxer que sap què és Cloudinary, el dia que
convingui moure'l serà un fitxer i un script de migració —que ja existeix com a
precedent (`npm run migrate:word-images`).

---

## 5. Resend: el terra

És l'únic dels cinc que **no es pot fusionar amb res**: cap proveïdor
d'allotjament no dona correu transaccional al pla gratuït, i el correu no es pot
treure del producte perquè **«he oblidat la contrasenya» ha de ser autoservei**.
L'enllaç d'accés que genera el panell d'administració existeix per als casos en
què el correu no funciona, no per substituir-lo: si fos l'única via, cada oblit
seria una tasca manual per a una persona i per un canal que no controla ningú.

El que **sí** que es pot restar és un consumidor: **l'avís d'error a
l'administració**. Els errors ja es desen a Mongo i es veuen al panell; el correu
només hi afegeix l'empenta. Treure'l tancaria L5 de l'altre estudi per
subtracció, i s'enduria amb ell el refredament per codi, el sostre de 20 avisos
al dia i el camp `alertSent` —tres mecanismes que existeixen només per protegir
els correus dels usuaris d'un correu que no és per a cap usuari.

El cost és real: qui manté això es quedaria sense cap canal que l'avisi, i
s'assabentaria dels errors quan entrés al panell. **No es recomana treure'l sense
posar-hi res al lloc**; s'apunta perquè és l'única subtracció de proveïdor-hora
que hi ha sobre la taula i perquè el dia que la quota de correu torni a
estrènyer, aquesta és la palanca.

---

## 6. MongoDB Atlas: es queda, i no és discutible avui

Sis col·leccions, Mongoose escampat per tots els mòduls, dos índexs TTL que fan
la neteja sols (`SecurityEvent` i `ClientError`), i un model de dades que
encaixa amb documents perquè el que es desa **són** documents.

Moure'l voldria dir reescriure els sis models, els serveis que hi consulten, els
dos scripts de migració i la suite de `vitest` que munta un `mongodb-memory-server`
—i migrar comptes d'usuaris vius. A canvi de: **un tauler menys**, i només si la
destinació viu sota el proveïdor d'allotjament (Vercel Postgres/Neon). Cap
funcionalitat no en surt millor.

L'única cosa a fer-hi és no oblidar el que ja diu l'altre estudi: la **pausa
automàtica als 60 dies d'inactivitat** és el risc real d'un projecte amb poc
trànsit, i no té res a veure amb quants proveïdors hi hagi.

---

## 7. El que es pot aprimar sense tocar cap proveïdor

Subtraccions independents de tot l'anterior, per si l'estudi acaba en «avui no
movem res»:

- **`cors` i `CORS_ORIGIN` ja no fan res.** En producció el navegador va contra
  el mateix origen (la reescriptura de Vercel) i en desenvolupament també (el
  `proxy` de `vite.config.ts`): **cap petició del navegador a l'API és mai
  d'origen creuat**. El middleware i la variable només tindrien efecte si algú
  ataqués el domini de Render directament des d'un navegador, que és precisament
  el que no es vol permetre. Són una dependència i una variable d'entorn que es
  poden treure sense que canviï cap comportament observable. *(Amb una condició:
  el dia que hi hagi un client en un altre origen —una app, un front de proves—
  tornaran a fer falta.)*
- **Les catorze variables d'entorn del `render.yaml`** són el mapa real de
  l'acoblament: tres són de Cloudinary, tres de correu, tres secrets generats,
  dues de la topologia (`PORT`, `CORS_ORIGIN`) i la resta obligatòries. E1 se
  n'enduria dues i qualsevol moviment de proveïdor tres més de cop.
- **GA4** és el sisè servei i el més barat de treure (un `hook` i sis punts
  d'esdeveniment). No hi ha cap raó tècnica per fer-ho; l'única pregunta és si
  algú llegeix les dades. Si la resposta és no, és un tercer d'un dia.

---

## Escenaris, en una taula

| Escenari | Proveïdors | Feina | Es guanya | Es perd |
|---|---|---|---|---|
| **Avui** | 5 | — | — | — |
| **E2** — tot a Render | 4 | ~½ dia, zero codi | Un tauler | Res, però tampoc s'arregla res |
| **E1** — tot a Vercel | 4 | Pujada directa + connexió + limitadors | Un tauler, 265 línies, la son, la trampa del proxy, el CORS | El sostre de Hobby passa a afectar el web sencer |
| **E1 + Blob** | 3 | E1 + migració d'imatges + miniatures al client | Un tauler més | Marge zero (1 GB = el sostre exacte) i la quota deixa de ser «un pes» |
| **E1 sense correu** | 2 | — | — | Recuperar la contrasenya deixa de ser autoservei. **Inviable** |
| **Tot a Cloudflare** | 2–3 | Reescriure l'API a Workers, deixar Mongoose | Molt, sobre el paper | 6.668 línies d'API reescrites |

---

## Troballes

Numerades per poder-hi tornar, com a `ESTANDARD-capes-flotants.md` i a
`ESTUDI-limits-serveis-gratuits.md`. Cap no s'ha resolt aquí.

- **A1 — El cost de moure un proveïdor és invers a com de visible és.** Cloudinary
  i Resend ocupen sis de les catorze variables d'entorn i són els més barats de
  substituir, perquè cadascun té una porta única. Mongo no en té cap i és el car.
  *Conseqüència pràctica:* mantenir les portes tancades val més que triar bé el
  proveïdor.

- **A2 — El proxy `/api` de Vercel és estructura portant disfressada de
  configuració.** De tretze línies de `vercel.json` depenen que la sessió sobrevisqui
  a tancar la pestanya i que un `POST` no retorni 405. Res del codi no ho diu, i
  el CLAUDE.md ho ha de recordar en dos apartats. E1 el fa innecessari.

- **A3 — 265 línies del front existeixen només perquè Render dorm.** Cinc fitxers
  i sis punts de muntatge que no descriuen cap funcionalitat del producte, sinó
  una propietat del pla d'allotjament. És el bloc de codi més gran de tot el
  projecte que desapareixeria per un canvi d'infraestructura.

- **A4 — L'API no cap a Vercel tal com està.** El cos de 12 MB amb imatges en
  base64 topa amb el sostre dur de 4,5 MB de les funcions. *Fitxers:*
  `apps/api/src/index.ts:39`, `shared/imageAssets.ts` (`uploadBase64Slots`).

- **A5 — Les imatges fan dos salts de més, hi hagi migració o no.** Navegador →
  Vercel → Render → Cloudinary, en base64 (+33 %) i seqüencialment dins d'una sola
  petició. La pujada signada directa és la precondició d'A4 i alhora una millora
  independent: menys banda a dos proveïdors, menys durada per petició i el pes
  real conegut abans de registrar res.

- **A6 — Els limitadors compten en memòria del procés.** Avui és correcte (un sol
  procés); en qualsevol arquitectura amb més d'una instància deixen de protegir el
  que el CLAUDE.md diu que protegeixen. Els tres cars (registre, correu,
  `client-errors`) haurien de comptar contra Mongo, com ja fa el comptador diari
  de registres. *Fitxers:* `index.ts:45`, `modules/auth/routes.ts:20-42`,
  `modules/client-errors/routes.ts:11`.

- **A7 — El sostre d'emmagatzematge de tota la plataforma és 1 GB** (200 comptes ×
  5 MB). Amb aquesta xifra, la capacitat ha deixat de ser el que reté Cloudinary:
  el que el reté és la transformació de mida. L'altre estudi encara diu 10 GB
  perquè es va escriure amb la quota antiga de 50 MB per compte.

- **A8 — `cors` i `CORS_ORIGIN` són vestigials.** Ni en producció ni en
  desenvolupament hi ha cap petició d'origen creuat des del navegador. *Fitxers:*
  `index.ts:28`, `config/env.ts:55`, `vite.config.ts` (`server.proxy`).

- **A9 — E3 (l'Express servint l'SPA) sembla la més neta i és la pitjor.** Posaria
  la part que funciona sense servidor darrere del servidor que dorm. Queda
  descartada per escrit perquè no s'hagi de tornar a considerar.

- **A10 — Hobby de Vercel pausa el projecte en passar dels límits.** Avui això
  afectaria el front; amb E1 afectaria l'aplicació sencera, API inclosa. És
  l'única cosa que E1 empitjora i s'ha de decidir sabent-ho.

---

## Recomanació

1. **Si l'objectiu és menys taulers i res més: E2** (tot a Render). Mig dia, zero
   codi, zero risc. Però és un cul-de-sac: no s'ha de fer «de camí cap a E1».
2. **Si l'objectiu és que l'aplicació sigui millor: E1** (tot a Vercel), en dos
   temps i **en aquest ordre**:
   - **Primer, la pujada directa d'imatges** (A5). Es pot fer avui, amb
     l'arquitectura actual, i ja aporta: menys banda, menys durada per petició,
     el pes real conegut. Si E1 no es fa mai, aquesta feina no es llença.
   - **Després, la mudança** — connexió reutilitzada, limitadors contra Mongo,
     regió europea, i esborrar les 265 línies del desvetllament.
3. **Cloudinary, Resend i Atlas es queden.** El que cal mantenir no és la
   decisió, són les portes: `imageAssets.ts` i `mailer.ts`.
4. **`cors`, quan es toqui aquell fitxer per alguna altra cosa** (A8).

I una cosa que no és cap de les anteriors: **cinc proveïdors no és un problema
per si mateix**. El problema documentat d'aquest projecte no ha estat mai tenir-ne
massa, sinó que **fallen en silenci** —Resend rebutjant els correus dels usuaris i
entregant els interns, Mongoose connectant-se a una base de dades buida sense
queixar-se. Si de tot aquest estudi només se n'ha de fer una cosa, que sigui la
que redueix el nombre de fallades mudes, no la que redueix el nombre de logotips.

---

## Fonts

- [Vercel — Functions limits](https://vercel.com/docs/functions/limitations)
- [Vercel — `FUNCTION_PAYLOAD_TOO_LARGE`](https://vercel.com/docs/errors/FUNCTION_PAYLOAD_TOO_LARGE)
- [Vercel — com evitar el límit de 4,5 MB](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
- [Vercel — límits del pla Hobby (2026)](https://deploywise.dev/blog/vercel-free-tier-limits-2026)
- [Vercel Blob — límit del pla Hobby](https://vercel.com/changelog/increased-blob-store-limit-for-hobby-users)
- [Render — Deploy for Free](https://render.com/docs/free)
- [Render — Static Sites](https://render.com/docs/static-sites)
- [Cloudflare R2 — pla gratuït i egress](https://www.cloudflare.com/products/r2/)
- [Cloudinary — com funcionen els crèdits](https://cloudinary.com/documentation/developer_onboarding_faq_credits)
- [Atlas — límits del clúster gratuït](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)
- `docs/ESTUDI-limits-serveis-gratuits.md` — el marge que queda a cada servei
