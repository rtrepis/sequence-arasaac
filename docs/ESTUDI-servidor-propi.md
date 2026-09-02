# Estudi: es pot muntar tot en un servidor propi?

Avui l'aplicació depèn de cinc operadors —**Vercel, Render, MongoDB Atlas,
Cloudinary i Resend**— i de tots cinc en fem servir el pla gratuït. Aquest
document respon una sola pregunta: **quins d'aquests serveis es poden muntar en
una màquina pròpia, què costa de debò i què s'hi guanya o s'hi perd.**

No és un estudi de codi. Fa parella amb `ESTUDI-aprimar-arquitectura.md`, que
mira com reduir el nombre d'operadors **sense sortir del núvol**; aquest mira
què passa si se surt. I amb `ESTUDI-limits-serveis-gratuits.md`, que és d'on
surten les xifres de consum que es fan servir aquí per dimensionar la màquina.

Data de l'estudi: setembre del 2026. Els preus i les polítiques canvien; les
xifres porten enllaç a la font.

---

## La resposta curta

**Quatre dels cinc es munten sense drama. El cinquè no s'ha de muntar.**

| Servei | Es pot? | Amb què se substitueix | Dificultat |
|---|---|---|---|
| **Vercel** (SPA estàtica) | Sí | Caddy o nginx | Trivial |
| **Render** (l'API Express) | Sí | systemd o Docker | Trivial |
| **MongoDB Atlas** | Sí | `mongod` en un contenidor | Fàcil de muntar, **car de mantenir** |
| **Cloudinary** | Sí | Disc + **imgproxy** | Mitjana |
| **Resend** (correu) | Tècnicament sí | *(res)* | **No s'ha de fer** |

El correu és l'excepció, i **no per motius tècnics**: muntar un Postfix és una
tarda. El problema és que des del novembre del 2025 Gmail **rebutja** el correu
que no acredita la identitat amb un error dur (`5.7.26`) i Microsoft fa el mateix
(`550 5.7.515`), i els rangs d'IP dels proveïdors de VPS ja neixen a les llistes
negres de Spamhaus: **ets culpable fins que demostris el contrari**, i demostrar-ho
són setmanes d'enviaments de volum baix i ben rebuts. Aquesta app envia dues
coses, l'**enllaç de verificació** i el de **recuperar la contrasenya**, que són
justament les dues que **no poden caure a la carpeta de brossa**: si hi cauen,
l'usuari no té compte i no té manera de saber per què.

Per tant, el terra realista és **la teva màquina + un relé de correu**. De cinc
operadors es passa a un servidor i un servei. La conclusió és la mateixa a què
arribava l'altre estudi per un camí completament diferent: **Resend (o un
equivalent) es queda igualment.**

---

## 1. «Servidor propi» vol dir tres coses molt diferents

Abans de res, cal desfer l'ambigüetat, perquè les tres opcions tenen problemes
que no s'assemblen gens.

### 1.1 Una màquina a casa

Un mini-PC (tipus Intel N100) endollat al router. **Cost:** uns 150–250 € una
vegada, i entre 10 i 15 W permanents —unes 105 kWh l'any, **al voltant d'1,5 €
al mes** d'electricitat. És l'opció més barata amb diferència.

Els problemes no són el maquinari:

- **CGNAT.** És la loteria que ho decideix tot. A l'estat espanyol, **Digi,
  MásMóvil i Pepephone fan servir CG-NAT** per defecte: comparteixes l'IPv4 amb
  altres clients i **no pots obrir els ports 80 i 443**, que és exactament el que
  necessita un servidor web. **Movistar dona IP pública** a totes les línies de
  fibra (dinàmica, si no en contractes una de fixa) i **Orange fa servir CG-NAT
  però te'n treu si ho demanes**. O sigui que la viabilitat d'aquesta opció depèn
  literalment de quin operador tens contractat a casa.
- **IP dinàmica.** Es resol amb DNS dinàmic (DDNS), gratuït i automatitzable.
  És molèstia, no impediment.
- **La sortida a Internet.** Amb fibra simètrica no és cap problema per al volum
  d'aquesta app (vegeu §3).
- **El que passa quan no hi ets.** Una baixada de llum, el router que es penja,
  el gat que desendolla. Torna quan tornis tu.

Hi ha una sortida al CGNAT —un túnel de Cloudflare o un VPS diminut fent de
porta— però fixem-nos què fa: **torna a posar un operador al mig**, que és el que
es volia treure.

### 1.2 Un VPS llogat

Una màquina virtual a Hetzner, OVH o similar. No és «teva» en el sentit de
tocar-la, però **hi mana tu**: hi instal·les el que vols, no hi ha quotes, no hi
ha plans gratuïts que canviïn de condicions i no hi ha res que s'adormi.

**Cost 2026:** el Hetzner **CX23 surt a 5,49 €/mes** i el CPX22 (2 vCPU, 4 GB) a
**7,99 €/mes**, amb **20 TB de trànsit inclòs**; l'**OVH VPS-1 és a 7,60 €/mes**.
Els dos van apujar preus l'abril del 2026, o sigui que la referència honesta per
al 2026 és **entre 6 i 8 € al mes**, no els 4 € que es deien fa dos anys.

Sense CGNAT, sense IP dinàmica, sense talls de llum, amb IP fixa i DNS invers
propi (que és el que després farà falta si algun dia es toca el correu).

### 1.3 Un servidor dedicat

Sobredimensionat. Aquesta app cap en un mòbil (§3). Descartat sense més.

> **Per a aquest projecte, l'opció és el VPS (1.2).** El servidor a casa té sentit
> com a màquina de proves o com a segona còpia de seguretat, no com el lloc on
> viu una eina que fan servir escoles.

---

## 2. Servei per servei: què cal muntar

### 2.1 Vercel → Caddy (o nginx)

L'SPA és un munt de fitxers estàtics. Servir-los és un bloc de deu línies de
configuració, i **Caddy demana i renova el certificat TLS sol** sense que ningú
hi hagi de pensar mai més. La reescriptura cap a `/index.html` que avui fa
`vercel.json` es fa igual (`try_files`).

**El que es perd:** la xarxa de distribució global. Avui els fitxers surten del
node de Vercel més proper a qui obre l'app; amb un VPS a Frankfurt, surten de
Frankfurt. Per a usuaris de Catalunya parlem d'uns quants mil·lisegons més de
latència en la primera càrrega —i **el paquet es cacheja al navegador**, o sigui
que això és el cost de la primera visita, no de cada visita. Si molestés, un
Cloudflare gratuït al davant ho tapa; però atenció, això torna a ser un operador.

**El que es guanya:** desapareix la trampa d'ordre de les reescriptures de
`vercel.json` (documentada al CLAUDE.md perquè ja hi va caure algú) i
desapareix la prohibició d'ús comercial del pla Hobby.

**Dificultat: trivial.**

### 2.2 Render → systemd o Docker

És un procés de Node. `npm run build` i `node apps/api/dist/index.js` darrere del
Caddy, com a servei de systemd o com a contenidor. La `render.yaml` es converteix
en un `docker-compose.yml` i les catorze variables d'entorn en un fitxer `.env`
amb permisos 600.

**El que es guanya és el més gros de tot l'estudi:**

- **S'acaba la son dels 15 minuts.** El pla gratuït de Render adorm el contenidor
  i la primera petició paga fins a un minut. Un procés propi no s'adorm mai. Amb
  això **deixen de fer falta les ~265 línies del front** que existeixen només per
  explicar-ho (`backendStatus.ts`, `warmUpBackend.ts`, `useWarmUpOnReturn.ts`,
  `BackendWakeUpNotice` en cinc idiomes), el temps d'espera de 90 segons de
  l'`apiClient` i la bandera `isBackgroundRequest`.
- **S'acaben les 750 hores al mes.** Amb elles, la impossibilitat de tenir un
  segon servei —un cron de manteniment, un worker— que avui no hi cap perquè el
  pressupost d'hores és de tot l'espai de treball (L6 de l'altre estudi).
- **La cookie deixa de dependre d'un proxy.** Amb el front i l'API al mateix
  domini, el `sameSite: "strict"` funciona perquè sí, no gràcies a una regla de
  reescriptura que algú ha de mantenir en ordre.

**Dificultat: trivial.**

### 2.3 MongoDB Atlas → `mongod`

Un contenidor oficial, un volum al disc i **escoltant només a `localhost`** (o a
la xarxa interna de Docker), mai exposat a Internet. Els índexs TTL que purguen
`SecurityEvent` i `ClientError` funcionen igual: són del motor, no del pla.

- **Llicència:** MongoDB és SSPL. Fer-lo servir per a la teva pròpia aplicació no
  té cap implicació; la SSPL només mossega si **ofereixes MongoDB com a servei**
  a tercers, cosa que no és el cas.
- **S'acaben tres límits d'una tacada:** els 512 MB del clúster M0, les **100
  operacions per segon** i —el que compta més per a un projecte de poc trànsit—
  la **pausa automàtica als 60 dies d'inactivitat**.

**El que hi guanyes en capacitat és desproporcionat.** Els 5 MB per compte i el
sostre de 200 usuaris de `tierLimits.ts` no són límits del producte: són el
pressupost d'Atlas i Cloudinary traduït a política. Amb disc propi, tornen a ser
**una decisió teva**.

**Però aquí és on comença la feina de debò, i és tota una: les còpies de
seguretat.** Avui, si el clúster peta, hi ha algú altre que en respon. En un
servidor propi, «tinc còpies» ha de voler dir tres coses concretes i no dues:

1. Un `mongodump` nocturn **fora de la màquina** (una Storage Box, un altre
   proveïdor, casa teva).
2. **Xifrat**, perquè el bolcat conté correus i hash de contrasenyes.
3. **Una restauració provada.** Una còpia que no s'ha restaurat mai no és una
   còpia, és una intenció. Aquest és el punt que se salta tothom.

**Dificultat: fàcil de muntar, i és la peça que t'obliga a tenir una rutina.**

### 2.4 Cloudinary → disc + imgproxy

Aquesta és la substitució més interessant, perquè el que demanem a Cloudinary és
molt poc i molt concret:

| El que li demanem | Substitut propi |
|---|---|
| Desar binaris (≤ 500 KB per imatge) | El disc |
| Servir-los per CDN | El mateix Caddy (+ Cloudflare, si es vol) |
| **Redimensionar a la demanda** | **imgproxy** |
| Dir-ne el pes i els píxels | El sistema de fitxers i `sharp`/imgproxy |

**imgproxy** és exactament l'eina d'aquest forat: servidor de processament
d'imatges a la demanda escrit en Go, ràpid, amb **URL signades** i pensat per
anar darrere d'un CDN. Fa el que fa `utils/cloudinaryUrl.ts` avui —demanar la
miniatura de 80 px en comptes de la imatge d'impressió de 500 KB— i el codi que
el consumeix canvia de forma però no de concepte.

**El volum és ridícul.** Amb 200 comptes i 5 MB per compte, **tot
l'emmagatzematge possible de la plataforma és 1 GB**. No cal cap magatzem
d'objectes, cap S3, cap res: és una carpeta.

**El que es perd:** el CDN global i la comoditat que Cloudinary et digui els
bytes i els píxels reals després de pujar. Tots dos es cobreixen; el segon amb
`sharp`, que ja és una dependència habitual en aquest terreny.

**Dificultat: mitjana.** És l'única substitució que toca codi de veritat, i el
CLAUDE.md ja diu on: `shared/imageAssets.ts` és **l'única porta** per on una
imatge entra o surt del núvol. Un fitxer, i un script de migració que ja té
precedent (`npm run migrate:word-images`).

### 2.5 Resend → **no**

Es pot muntar. Mailcow, Mailu o `docker-mailserver` fan un servidor de correu
complet en una tarda, i el SPF, el DKIM i el DMARC són tres registres de DNS.
**I això no és el problema.**

El problema és que **el correu correctament configurat és el mínim per jugar, no
la garantia d'arribar**. Des del novembre del 2025 Gmail rebutja al nivell de
SMTP el que no acredita identitat (`5.7.26`) i Microsoft el segueix
(`550 5.7.515`). I abans d'això hi ha la reputació de l'IP: **els rangs dels
proveïdors de VPS són a la llista de política de Spamhaus (PBL) per defecte**,
perquè són rangs des dels quals no s'hauria d'enviar correu directament.
Guanyar-se la reputació són setmanes d'enviaments regulars i ben rebuts, i el
volum d'aquesta app —un grapat de correus al dia— **no arriba ni a generar el
senyal necessari**. És el pitjor perfil possible: massa poc volum per construir
reputació, i cada correu massa important per permetre's perdre'l.

Afegeix-hi que el port 25 de sortida el bloquegen la majoria de connexions
domèstiques (i alguns VPS el tenen tancat fins que el demanes).

**El consens del sector és el mateix per a tothom qui ho ha provat**: si vols
mans pròpies, **autoallotja la recepció i envia per un relé transaccional**. Per
a nosaltres, que **només enviem**, la conclusió és directa: el relé és tot el que
necessitem, i és el que ja tenim.

> **Aquesta és la peça que no marxa.** Es pot canviar Resend per un altre relé
> (SES, Postmark, Brevo, SMTP2GO), però el nombre d'operadors no baixa de dos.

**Dificultat: no és dificultat, és inviabilitat pràctica.**

---

## 3. Dimensionar la màquina

Els números surten del repositori i de l'estudi de límits, no d'una intuïció:

| Peça | Memòria | Notes |
|---|---|---|
| MongoDB | ~1 GB | El WiredTiger vol la seva memòria cau |
| API Node (Express) | 150–300 MB | 6.668 línies, 26 endpoints, 6 col·leccions |
| imgproxy | ~100 MB | Puntes en redimensionar |
| Caddy | ~20 MB | |
| **Total còmode** | **4 GB** | Amb 2 GB funciona, amb intercanvi i sense marge |

**Disc:** 1 GB d'imatges (el sostre absolut de la plataforma) + uns centenars de
MB de Mongo + el sistema → **20 GB en sobren**.

**Trànsit:** els 20 TB del Hetzner són tres ordres de magnitud per sobre del que
gasta això. Irrellevant.

O sigui: **el CX23 de 5,49 €/mes fa el fet**, i el CPX22 de 4 GB (7,99 €) el fa
amb comoditat. Aquesta aplicació és petita; el que és gran és el nombre de
proveïdors que li fan falta avui per ser-ho.

---

## 4. Què costa de debò

### 4.1 Diners

| | Avui | VPS (§1.2) | Casa (§1.1) |
|---|---|---|---|
| Allotjament | 0 € | 66–96 €/any | ~18 €/any de llum |
| Maquinari | 0 € | 0 € | 150–250 € una vegada |
| Còpies fora | 0 € | ~40 €/any | 0 € (a casa ja hi ets) |
| Correu (relé) | 0 € | 0 € (pla gratuït) | 0 € |
| Domini | ~12 €/any | ~12 €/any | ~12 €/any |
| **Total any 1** | **~12 €** | **~120–150 €** | **~180–280 €** |
| **Total any 2+** | **~12 €** | **~120–150 €** | **~30 €** |

Cap d'aquestes xifres és un obstacle. **Els diners no són l'argument** ni a favor
ni en contra.

### 4.2 Temps — que és la moneda de veritat

| Moment | Estimació honesta |
|---|---|
| Muntatge inicial (Docker Compose, TLS, Mongo, imgproxy, còpies) | **2–4 dies** |
| Migrar les imatges i les dades de producció | 1 dia |
| Adaptar el codi (`imageAssets.ts` + esborrar el desvetllament) | 1–2 dies |
| Manteniment de règim | **1–2 h/mes** |
| Incidents | Impredictible, i sempre en mal moment |

Les hores de règim són reals però modestes si es fan les coses avorrides des del
principi: actualitzacions automàtiques desateses, Mongo sense escoltar a fora,
SSH només amb clau, i un avís quan la màquina no respon. El que no es pot
pressupostar és l'última fila.

---

## 5. Què s'hi guanya

Més del que sembla, i no només «no dependre de ningú»:

1. **S'acaba la son.** El guany més visible per a qui fa servir l'app, i
   **265 línies menys** de codi que existeix per justificar-la.
2. **S'acaben tots els sostres artificials.** Els 5 MB per compte, els 200
   usuaris, les 3 paraules de vocabulari, la qualitat d'imatge retallada: cap
   d'aquests números descriu el producte, tots descriuen els plans gratuïts.
   Amb servidor propi tornen a ser decisions de disseny.
3. **Es pot fer memòria cau dels pictogrames d'ARASAAC.** Avui no es pot: els
   demana el navegador directament i `useSequentialSearch` fa una petició per
   paraula contra el servei públic d'una entitat sense ànim de lucre (L8 de
   l'altre estudi). Amb servidor propi, una còpia local és possible — més ràpid
   per a l'usuari i més respectuós amb qui ens el regala.
4. **Cinc quotes gratuïtes menys per vigilar** i, sobretot, **cinc menys llocs on
   una cosa pot fallar en silenci**. Aquest projecte ja ha patit dues avaries
   mudes documentades (el domini de proves de Resend rebutjant els correus dels
   usuaris i entregant els interns; Mongoose connectant-se a una base de dades
   buida sense queixar-se). Una màquina pròpia també falla, però **falla de cara**.
5. **Les dades són teves i saps on són.**

---

## 6. Què s'hi perd

Amb la mateixa honestedat:

1. **Ningú vetlla per tu.** Ni Vercel ni Render no tenen SLA al pla gratuït, o
   sigui que la comparació **no és «professionals contra aficionat»** —és «sense
   garantia i sense control» contra «sense garantia i amb control». Però hi ha una
   diferència que sí que és real: quan Render peta, algú altre ho està arreglant
   mentre tu dorms. Quan peti el teu VPS, no.
2. **Les còpies de seguretat passen a ser teves**, amb tot el que implica
   (§2.3). És l'obligació nova més gran.
3. **La seguretat passa a ser teva.** Pedaços del sistema, ports tancats, i el
   fet que a la teva màquina hi ha correus i hash de contrasenyes: si hi ha una
   bretxa, hi ha 72 hores per notificar-la. Es gestiona, però abans no existia.
4. **La latència de la primera càrrega** puja uns mil·lisegons (§2.1).
5. **El correu no marxa** (§2.5).

### 6.1 El risc que no es veu, i que és el més important

L'aplicació **funciona sencera sense compte**: qui no en té, fa seqüències i les
imprimeix igual. Avui això vol dir que, quan Render dorm o peta, **l'editor
s'obre igualment** perquè el serveix el CDN de Vercel.

Si el servidor propi serveix també l'SPA, aquesta propietat desapareix: **una
baixada de llum a casa o una hora de manteniment del VPS deixen l'app inaccessible
per a tothom**, també per als qui no hi tenen compte ni el volen. Per a una eina
d'AAC que algú pot estar fent servir a classe en aquell moment, això no és el
mateix que perdre el desat al núvol.

És exactament el mateix argument pel qual l'altre estudi descarta que l'Express
serveixi l'SPA (l'escenari E3), i val igual aquí. **Té una sortida barata**, i és
l'escenari H3 de sota.

---

## 7. Escenaris

| | Operadors | Cost/any | Feina | Risc |
|---|---|---|---|---|
| **Avui** | 5 | ~12 € | 0 | Cinc quotes, cinc fallades mudes possibles |
| **H1 — Tot a casa** | 1 + relé | ~30 € | Alta | CGNAT, llum, «torna quan tornis tu» |
| **H2 — Tot a un VPS** | 1 + relé | ~130 € | Mitjana | Una màquina, un punt de fallada |
| **H3 — Híbrid** ⭐ | 2 + relé | ~130 € | Mitjana | L'app sobreviu a la caiguda del servidor |

**H3, en concret:** l'**SPA es queda en un estàtic gratuït** (el Vercel d'ara, o
un Cloudflare Pages), i **l'API, la base de dades i les imatges van al servidor
propi**. El correu, per relé.

Sembla un pas enrere —es conserva un operador— i és justament al contrari: és
l'única distribució en què **el que no necessita servidor no depèn del servidor**.
Costa el mateix que H2, no afegeix cap feina de manteniment (un estàtic no es
manté) i converteix una caiguda del VPS en «avui no es pot desar al núvol» en lloc
de «avui no hi ha aplicació». Per a una eina d'AAC, aquesta diferència és tota la
diferència.

---

## 8. Si es fa, en quin ordre

Cap pas obliga el següent, i cada un es pot revertir sol:

1. **Muntar el VPS en paral·lel**, amb el domini de proves i les dades de mentida.
   La producció no s'assabenta de res.
2. **Moure Mongo primer.** És el que menys codi toca (una cadena de connexió) i el
   que més límits aixeca. Aquí és on s'estableix la rutina de còpies, i **no es
   passa d'aquest punt fins que s'hagi restaurat una còpia de debò**.
3. **Moure l'API.** Aquí s'esborra el desvetllament: les 265 línies i el temps
   d'espera de 90 segons. És el pas que es nota des del primer minut.
4. **Moure les imatges** (`imageAssets.ts` + imgproxy + migració). L'únic pas
   amb codi de veritat.
5. **Decidir l'SPA**: deixar-la on és (H3, recomanat) o portar-la (H2).
6. **El correu no es toca mai.**

---

## Troballes

Numerades per poder-hi tornar, com als altres estudis.

- **S1 — El correu és l'única peça que no marxa, i no per motius tècnics.**
  Muntar el servidor és una tarda; guanyar-se la reputació de l'IP és impossible
  amb el nostre volum. Els dos correus que enviem —verificació i contrasenya— són
  els que no es poden permetre la carpeta de brossa. **El terra és un servidor +
  un relé.**

- **S2 — La viabilitat del servidor a casa la decideix l'operador de fibra, no
  tu.** Amb Digi, MásMóvil o Pepephone hi ha CG-NAT i **no es poden obrir els
  ports 80 i 443**. Amb Movistar hi ha IP pública; amb Orange, si es demana. Cal
  comprovar-ho **abans** de qualsevol altra consideració.

- **S3 — Els límits del producte són els límits dels plans gratuïts.** Els 5 MB
  per compte, els 200 usuaris i les 3 paraules de vocabulari surten del
  pressupost d'Atlas i Cloudinary. Amb disc propi tornen a ser decisions.

- **S4 — Tot l'emmagatzematge possible de la plataforma és 1 GB** (200 × 5 MB).
  Substituir Cloudinary no demana cap magatzem d'objectes: és una carpeta amb un
  imgproxy al davant.

- **S5 — Les còpies de seguretat són l'obligació nova, i la que se salta tothom.**
  Nocturnes, fora de la màquina, xifrades i **restaurades almenys un cop**. Una
  còpia que no s'ha restaurat mai no és una còpia.

- **S6 — Autoallotjar l'SPA li treu la immunitat que té avui.** L'app funciona
  sencera sense compte, i avui una caiguda del backend no impedeix obrir-la.
  Servint-la des del servidor propi, qualsevol tall se l'endú sencera, també per
  a qui no hi té compte. És el mateix motiu pel qual E3 queda descartada a
  l'altre estudi. *Sortida:* l'escenari H3.

- **S7 — La comparació no és «professional contra amateur».** Els plans gratuïts
  de Render i Vercel no tenen SLA. El que es perd de debò no és la garantia
  —no n'hi ha— sinó **que hi hagi algú despert arreglant-ho mentre tu dorms**.

- **S8 — Autoallotjar habilita una còpia local d'ARASAAC.** Avui les imatges les
  demana el navegador directament i la cerca fa una petició per paraula contra un
  servei públic gratuït (L8). Amb servidor propi, es pot fer memòria cau: més
  ràpid per a l'usuari i més just amb qui ens regala els pictogrames.

- **S9 — Els diners no són l'argument.** 120–150 € l'any contra 12 €. El que
  decideix és el temps: 2–4 dies de muntatge i 1–2 h al mes, més els incidents,
  que sempre arriben en mal moment.

- **S10 — El guany més gran no és treure operadors, és treure la son.** El pla
  gratuït de Render obliga a mantenir 265 línies de codi al front que no
  descriuen cap funcionalitat del producte, sinó una propietat d'un pla
  d'allotjament.

---

## Recomanació

**Sí que és viable, i el nombre honest és «un servidor i un relé de correu», no
«un servidor i prou».**

Si es fa, **H3**: VPS europeu de 4 GB (6–8 €/mes) amb l'API, Mongo i les imatges;
l'SPA en un estàtic gratuït; el correu per relé. Costa el mateix que fer-ho tot a
la màquina pròpia i és l'única distribució que no li treu a l'aplicació la
propietat que la fa robusta avui: **que qui no té compte no depèn de cap
servidor.**

I una cosa que no és tècnica. Aquest projecte està ben preparat per a la mudança
—les portes de Cloudinary i de Resend són fitxers únics, l'`app` d'Express ja està
separada de l'arrencada, tot l'estat compartit ja viu a Mongo— o sigui que la
pregunta de debò no és *«es pot?»*. **Es pot.** La pregunta és si vols que el
manteniment d'un servidor formi part del projecte, perquè a partir del dia que es
faci, ho serà per sempre. Als plans gratuïts s'hi paga amb límits, sons de quinze
minuts i avaries mudes; a la màquina pròpia s'hi paga amb hores teves. Totes dues
monedes són reals, i només tu saps quina de les dues tens.

---

## Fonts

- [Self-hosted email in 2026: harder than ever](https://jorijn.com/en/blog/self-hosted-email-2026/) — rebuigs de Gmail (`5.7.26`) i Microsoft (`550 5.7.515`), reputació d'IP
- [Self-Hosting Email In 2026: Is It Still Worth It?](https://powerdmarc.com/self-hosting-email/) — llistes de Spamhaus i rangs de VPS
- [Running a Mail Server on a VPS in 2026](https://space-node.net/blog/vps-mail-server-guide-2026) — el patró híbrid (rebre propi, enviar per relé)
- [Hetzner Cloud — preus 2026](https://costgoat.com/pricing/hetzner)
- [OVH vs Hetzner 2026](https://1vps.com/ovh-vs-hetzner/) — pujades de preu de l'abril del 2026
- [Operadors amb CG-NAT a l'estat espanyol](https://www.redeszone.net/tutoriales/redes-cable/operadores-usan-cg-nat-internet/)
- [Com saber si tens CG-NAT](https://bandaancha.eu/articulos/solo-hay-forma-100-fiable-saber-tu-11293)
- [imgproxy vs Thumbor vs Sharp (2026)](https://www.pistack.xyz/posts/self-hosted-image-optimization-imgproxy-thumbor-sharp-2026/)
- `docs/ESTUDI-limits-serveis-gratuits.md` — el consum real de cada servei
- `docs/ESTUDI-aprimar-arquitectura.md` — la mateixa pregunta, sense sortir del núvol
