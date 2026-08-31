# Estudi dels límits gratuïts dels serveis

Inventari del que l'app consumeix de cada proveïdor, quin és el sostre del pla
gratuït i **quant de marge queda de debò**. No proposa cap canvi de codi: és el
document on es va a mirar quan cal decidir si una funcionalitat nova cap dins
del que tenim, o quan un servei comença a queixar-se.

Data de l'estudi: agost del 2026. Els límits dels proveïdors canvien; les xifres
porten enllaç a la font.

---

## Estat

**L1, L2 i L3 estan resoltes** (branca `claude/estudi-limits-gratuïts-serveis`): les imatges
del vocabulari ja no entren mai a MongoDB. L'anàlisi que segueix es conserva perquè explica
per què calia, i perquè les xifres de capacitat continuen sent les bones.

## Resum: què s'esgota primer

L'app té un sostre de **200 usuaris** (`DEFAULT_MAX_USERS`, `modules/config/model.ts`)
i una quota per usuari de **3 documents, 200 paraules de vocabulari i 50 MB**
(`shared/tierLimits.ts`). Contra aquests números, l'ordre en què es toca sostre és:

| # | Sostre | Quan arriba | Gravetat |
|---|---|---|---|
| ~~1~~ | ~~**BSON de 16 MB per document de MongoDB**~~ | ~~A la **24a imatge de vocabulari** d'un sol usuari~~ | ✅ **Resolt** — les imatges van a Cloudinary |
| ~~2~~ | ~~**512 MB de MongoDB Atlas M0** per imatges~~ | ~~Cap a les **780 imatges de vocabulari**~~ | ✅ **Resolt** — a Atlas hi queden els documents, no les imatges |
| 3 | **25 crèdits/mes de Cloudinary** | Per **amplada de banda**, no per emmagatzematge | Degradació, factura si hi ha targeta |
| 4 | **100 correus/dia de Resend** | Només si els avisos d'error es desboquen | Els registres es queden sense enllaç, en silenci |
| 5 | **750 h/mes de Render** | Amb un sol servei no s'hi arriba; amb dos, sí | Suspensió fins al mes següent |

La conclusió important és la primera fila: **el límit que primer trenca res no és
cap dels que l'app mesura**. Les quotes de `tierLimits.ts` compten els bytes que
van a Cloudinary; les imatges de vocabulari no hi passen mai.

---

## 1. MongoDB Atlas — pla M0 (gratuït)

**El límit:** 512 MB d'emmagatzematge, 500 connexions, **100 operacions per
segon** amb estrangulament en passar-ne, **10 GB de transferència d'entrada i
10 GB de sortida** per finestra mòbil de set dies, màxim 100 bases de dades i
500 col·leccions, i **pausa automàtica als 60 dies d'inactivitat**. A sobre hi
ha el límit del propi MongoDB, que no és del pla: **16 MB per document BSON**.

**Què hi guardem:**

- `User` — preferències, i **`wordProfiles`** (fins a 200 per usuari).
- `Document` — el contingut de les seqüències, amb les imatges ja substituïdes
  per URLs de Cloudinary (`modules/documents/service.ts`). Pesa quilobytes.
- `SecurityEvent` i `ClientError` — tots dos amb **índex TTL de 30 dies**, es
  purguen sols. No creixen.

**El problema: el vocabulari amb imatges viu dins del document de l'usuari.**

`WordProfile.customImageUrl` és un `z.string().optional()` sense sostre
(`modules/user-settings/validators.ts:26`) i s'hi desa **tal com arriba**
(`modules/user-settings/service.ts:67`). I el que arriba és base64: el panell de
vocabulari fa servir `PictogramSearchLocal` → `UploadImageButton` →
`fileToBase64`, i el resultat va a parar a `customImageUrl` sense passar per
Cloudinary (`VocabularySettingsPanel.tsx:137`).

A diferència de `POST /documents`, que puja els `data:image/` a Cloudinary abans
de desar res, `PUT /user/ui-settings` **no puja res**: el base64 entra sencer a
la base de dades.

Amb `TARGET_BYTES = 500 KB` de dades i la sobrecàrrega del base64 (4 caràcters
per cada 3 bytes), cada imatge ocupa **≈667 KB** al document:

| Sostre | Imatges de vocabulari que hi caben |
|---|---|
| 16 MB de BSON (per usuari) | **≈24** |
| 20 MB de `express.json` (per petició) | ≈30 |
| 512 MB d'Atlas (tota la plataforma) | **≈780** |
| Límit declarat de l'app | 200 per usuari |

Tres coses en surten:

- **El límit de 200 `wordProfiles` no protegeix res.** El primer mur real és el
  BSON, vuit vegades abans.
- **L'ordre dels murs està invertit.** El de BSON (16 MB) arriba abans que el de
  `express.json` (20 MB), o sigui que la petició no es rebutja a la porta amb un
  413 net: passa la validació, arriba a Mongoose i peta allà. L'usuari rep un 500
  que no diu què ha passat.
- **`storageBytes` (50 MB) no compta aquestes imatges.** `assertWithinQuota`
  només es crida des del mòdul de documents; el vocabulari no hi passa. Un usuari
  pot tenir la quota a zero i haver omplert 16 MB d'Atlas.

**Marge real:** amb 200 comptes i 512 MB, surten a **~4 imatges de vocabulari per
usuari** abans que el clúster estigui ple. Els comptes que només fan servir
pictogrames d'ARASAAC (el cas normal) no hi pesen res: hi caben tots.

**Altres notes:** les 100 operacions/segon són folgades per al volum previst,
però `saveUserUiThunk` reescriu **tota** la llista de vocabulari a cada desat,
de manera que cada «Desa com a preferències» d'un usuari amb imatges mou
megabytes contra els 10 GB/setmana de transferència. La pausa als 60 dies
d'inactivitat és el que ha de vigilar un projecte amb poc trànsit.

---

## 2. Cloudinary — pla gratuït

**El límit:** **25 crèdits al mes**, on 1 crèdit = 1 GB d'emmagatzematge, o 1 GB
d'amplada de banda, o 1.000 transformacions. Fins a 3 usuaris del compte. La
banda i les transformacions es compten en finestra mòbil de 30 dies, no per mes
natural.

**Què hi puja l'app:** només les imatges pròpies dels **documents**
(`extractAndUploadBase64Images`), a `seq/<userId>`, **sense cap transformació**
(`resource_type: "image"` i prou). Se serveix el `secure_url` directe.

**Emmagatzematge:** està acotat per disseny. 200 usuaris × 50 MB = **10 GB**, o
sigui 10 dels 25 crèdits en el pitjor cas absolut. No és el problema.

**Transformacions:** avui **zero**. Val la pena saber-ho abans d'afegir un
`f_auto,q_auto` a cap URL: passaria a comptar 1 crèdit per cada 1.000 derivades.

**Amplada de banda: aquí és on se'n va el pressupost.** Les imatges se serveixen
a mida completa (1.800 px de costat llarg, ~500 KB), i es baixen dues vegades on
no caldria:

- **Les miniatures del llistat de documents són la imatge sencera.**
  `buildDocumentThumbnail` desa el `secure_url` tal qual (`thumbnail.ts:57-60`) i
  el client el pinta petit. Obrir el diàleg de càrrega amb 3 documents plens
  d'imatges pròpies pot baixar **9 imatges × 500 KB ≈ 4,5 MB** per pintar nou
  quadradets. El comentari del fitxer diu, amb raó, que la miniatura «no costa ni
  un byte de Cloudinary», i és cert de l'emmagatzematge — però no de la banda.
- **Carregar un document** en baixa totes les imatges a mida d'impressió, encara
  que a pantalla es vegin a 150 px.

Amb 15 crèdits lliures després de l'emmagatzematge, són **~15 GB/mes**: unes
2.500 càrregues de document de 12 imatges, o ~3.300 obertures del llistat. Per a
200 usuaris hi ha marge, però és l'única partida que escala amb l'ús i no amb el
nombre de comptes.

---

## 3. Render — pla gratuït (`apps/api`)

**El límit:** **750 hores d'instància al mes per espai de treball**, 100 GB de
banda de sortida, i **aturada als 15 minuts sense trànsit** amb ~1 minut de
revifada. Si s'esgoten les hores, Render **suspèn tots els serveis gratuïts**
fins al mes següent.

**Com hi encaixem:** `render.yaml` declara **un sol servei** (`plan: free`,
Frankfurt). Un mes de 31 dies són 744 hores: un servei permanentment despert en
gastaria 744 de 750. L'aturada per inactivitat és, doncs, el que fa que el pla
funcioni — i alhora vol dir que **no hi cap un segon servei gratuït** al mateix
espai de treball (un cron, un worker): el pressupost és compartit.

L'app ja tracta el despertar com un fet normal i no com un error, cosa que en
aquest pla és el comportament correcte: `backendStatus.ts` el dedueix de la
durada de les peticions reals, `warmUpBackend.ts` fa el ping preventiu amb
refredament de 10 minuts i `REQUEST_TIMEOUT_MS` és de 90 s per no tallar just
quan el servidor anava a respondre.

**Banda:** les respostes de l'API són JSON amb URLs; les pujades són trànsit
d'**entrada**, que no compta. Els 100 GB de sortida no són cap risc.

**Un detall a favor:** `app.set("trust proxy", 1)` i els limitadors
(`express-rate-limit`: 300/min global, 30/min a auth, 5/hora a registre i a
correu) són el que impedeix que un abús es converteixi en consum de les tres
quotes alhora.

---

## 4. Vercel — pla Hobby (`apps/web`)

**El límit:** 100 GB de banda al mes, **1 milió de peticions d'edge**, 100.000
invocacions de funció. **Sense facturació d'excedent**: en passar del límit el
projecte es pausa fins al cicle següent. I els termes de Hobby **no permeten l'ús
comercial**.

**El que cal tenir present:** la regla `/api/:path*` de `vercel.json` fa que
**tot el trànsit de l'API passi per Vercel** abans d'arribar a Render. Això no és
un accident, és el que fa que la cookie de refresc `sameSite: "strict"` es desi
(vegeu el CLAUDE.md), però té una conseqüència de quota: **cada crida a l'API
compta dues vegades**, com a petició d'edge i banda a Vercel i com a trànsit a
Render. Una pujada de 20 MB es paga als dos llocs.

Amb 200 usuaris, 1 milió de peticions d'edge són 5.000 per usuari i mes. Hi ha
marge de sobres, però la partida a vigilar és la banda quan els documents porten
imatges pròpies grans.

**L'ús comercial** avui no és cap problema: `TIER_LIMITS` només té `free` i no hi
ha res de pagament. Si mai n'hi hagués, Hobby deixaria de ser una opció.

---

## 5. Resend — pla gratuït

**El límit:** 3.000 correus al mes, **amb un sostre de 100 al dia**, 1 domini
verificat i 30 dies de registre.

**Què enviem:** verificació de correu (1 per registre), reenviament de
verificació, restabliment de contrasenya i **els avisos d'error al
`ADMIN_ALERT_EMAIL`**.

**El volum de registre no és el risc.** Amb el sostre de 200 usuaris i el
limitador de 5 registres per hora i IP, els correus d'alta són una xifra menor.

**El risc és que els avisos d'error comparteixen la mateixa quota.**
`ALERT_THROTTLE_MS` és d'una hora **per codi d'error**
(`modules/client-errors/service.ts:11`), o sigui 24 correus al dia **per cada
codi diferent**. Amb cinc codes actius alhora —el que passa justament el dia que
alguna cosa va malament— són 120 correus i el sostre diari és de 100.

I el que passa aleshores és silenciós per disseny: `mailer.ts` no llança mai i
retorna un booleà, de manera que **el registre continua funcionant i l'usuari no
rep mai l'enllaç de verificació**. És la decisió correcta (un dia dolent del
correu no pot trencar el registre), però vol dir que l'esgotament de la quota es
manifesta com «hi ha gent que no rep el correu», no com un error.

En desenvolupament no es gasta res: sense `RESEND_API_KEY` l'enllaç surt per
consola.

---

## 6. ARASAAC — API pública

**El límit:** no en publica cap de documentat. Els pictogrames són **CC BY-NC-SA**
i l'atribució ja hi és (`CopyRight`, `WelcomeFooter`).

**Com el fem servir:** `arasaacClient.ts` fa cerca (`bestsearch`/`search`), dades
per ID i paraules clau per idioma. Les **imatges les demana el navegador
directament** a `api.arasaac.org` (`buildPictogramUrl` acaba en un `src`), de
manera que no consumeixen ni banda nostra ni quota de cap dels serveis d'aquest
document.

**El que sí que és una exposició:** és una dependència de tercers **sense cap
alternativa ni cau propi**. Si ARASAAC no respon, la cerca de pictogrames no
funciona, i és la funció central de l'app. I `useSequentialSearch` fa **una
petició per paraula**: una llista llarga es converteix en una ràfega contra un
servei públic i gratuït d'una entitat sense ànim de lucre. Val la pena tenir-ho
present encara que no hi hagi cap límit escrit que ho prohibeixi.

---

## 7. Google Analytics 4 — propietat estàndard

**El límit:** gratuït, amb **500 noms d'esdeveniment diferents** per propietat,
50 dimensions i 50 mètriques personalitzades, i **retenció de dades de 2 mesos
per defecte** (14 com a màxim en el pla estàndard). Els informes passen a
mostrejar-se en volums alts, sense avisar.

**Com el fem servir:** `usePageTracking.ts` envia vistes de pàgina i algun
esdeveniment via `gtag`. Res que s'acosti als 500 noms. L'únic a saber és que
**la retenció per defecte són 2 mesos**: si es vol comparar amb l'any passat,
s'ha de pujar a 14 al panell de GA, i no es recupera retroactivament.

---

## Troballes obertes

Numerades per poder-hi tornar, en l'estil de `ESTANDARD-capes-flotants.md`.
Cap no s'ha resolt en aquest estudi: és un inventari, no una branca de canvis.

- **L1 — ✅ RESOLTA. Les imatges de vocabulari anaven a MongoDB en base64.**
  `PUT /user/ui-settings` desava `customImageUrl` tal com arribava, sense passar per
  Cloudinary, mentre que `POST /documents` sí que hi passava. Era el mur que trencava
  primer (16 MB de BSON, ≈24 imatges) i el que omplia els 512 MB d'Atlas.
  *Resolució:* `shared/imageAssets.ts` és ara l'única porta al núvol i el comparteixen
  els dos mòduls; `updateUiSettings` puja, fa el diff d'orfes i n'ajusta el consum,
  igual que `updateDocument`. Les que ja hi eren es traslladen amb
  `npm run migrate:word-images`.

- **L2 — ✅ RESOLTA. La quota de 50 MB no cobria el vocabulari.** `assertWithinQuota`
  només es cridava des del mòdul de documents, de manera que `storageBytes` podia ser
  zero amb 16 MB ocupats a la base de dades.
  *Resolució:* viu a `shared/quota.ts` i el criden els dos mòduls, de manera que el pes
  d'un compte és un de sol. `MAX_IMAGE_BYTES` al servidor posa sostre a cada imatge:
  sense això, un recompte d'imatges no garanteix cap pes i no protegeix res.

- **L3 — ✅ RESOLTA. L'ordre dels murs estava invertit.** `express.json({ limit: "20mb" })`
  era **més gran** que els 16 MB de BSON: una petició massa gran passava la porta i
  petava a Mongoose, i l'usuari rebia un 500 en comptes d'un 413 amb missatge.
  *Resolució:* el límit del cos baixa a 12 MB, per sota del de BSON.

- **L4 — Les miniatures del llistat baixen la imatge sencera.** El `thumbnail`
  desa el `secure_url` sense cap transformació de mida: fins a 4,5 MB de banda de
  Cloudinary per pintar nou quadradets. És la partida que més de pressa consumeix
  els 25 crèdits. *Fitxer:* `modules/documents/thumbnail.ts:57-60`.

- **L5 — Els avisos d'error i els correus de verificació comparteixen els 100/dia
  de Resend.** El refredament d'una hora és **per codi**, així que cinc codes
  simultanis en generen 120 al dia. Quan s'esgota, els registres es queden sense
  enllaç i no ho diu res. *Fitxer:* `modules/client-errors/service.ts:11`.

- **L6 — Les 750 h de Render són de l'espai de treball, no del servei.** Avui hi
  ha un sol servei i l'aturada per inactivitat deixa marge; **un segon servei
  gratuït** (cron, worker) no hi cabria.

- **L7 — Hobby de Vercel no admet ús comercial**, i el proxy `/api/*` fa que tot
  el trànsit de l'API compti dues vegades (Vercel i Render). Cap de les dues coses
  és un problema avui; totes dues ho serien el dia que hi hagi un pla de pagament.

- **L8 — ARASAAC no té alternativa ni cau.** Sense límit publicat, però és un
  servei públic gratuït i `useSequentialSearch` hi fa una petició per paraula.

---

## Capacitat que tenim, en una frase

Amb L1–L3 resoltes, **el coll d'ampolla ja no és MongoDB sinó Cloudinary**, que és
la quota que l'aplicació sí que sap mesurar i ensenyar. A Atlas hi queden els
documents i les preferències, que pesen quilobytes.

El que ara mana és l'**emmagatzematge de Cloudinary**, i té una propietat que cap
altre límit d'aquest document no té: **no baixa mai sol**. Els 15 GB que es poden
dedicar a desar-hi imatges són ~68.000 imatges per a tota la vida del projecte,
i el dia que s'acostin no hi haurà cap mes que ho reinicialitzi.

---

## Fonts

- [Render — Deploy for Free](https://render.com/docs/free)
- [Atlas Free Cluster Limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)
- [MongoDB Limits and Thresholds](https://www.mongodb.com/docs/manual/reference/limits/)
- [Cloudinary — Billing and Plans Overview](https://cloudinary.com/documentation/billing_and_plans)
- [Cloudinary — How do credits work?](https://cloudinary.com/documentation/developer_onboarding_faq_credits)
- [Vercel — límits del pla Hobby](https://deploywise.dev/blog/vercel-free-tier-limits-2026)
- [Resend — pla gratuït](https://costbench.com/software/email-api/resend/free-plan/)
- [GA4 — Configuration limits](https://support.google.com/analytics/answer/12229528?hl=en)
- [ARASAAC — condicions d'ús](https://www.arasaac.org/terms-of-use)
