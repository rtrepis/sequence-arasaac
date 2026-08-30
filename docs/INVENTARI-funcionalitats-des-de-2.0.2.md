# Inventari de funcionalitats noves des de la versió 2.0.2

Estat a **30 d'agost de 2026** (`master`, `apps/web` a la versió 3.0.0).

## Abast d'aquest document

Compara el tag **`v2.0.2`** (2026-06-17) amb el `master` actual. Recull **què fa
l'aplicació avui que no feia aleshores**; els refactors interns només hi surten
quan expliquen una funcionalitat o quan canvien com es treballa al projecte.

Dues advertències sobre la comparació:

- `v2.0.2` **no és avantpassat de `master`**. Va sortir d'una branca que se'n va
  separar el 18 de març de 2026, i hi porta tres commits propis (la correcció de
  l'escala de la previsualització d'impressió i la de l'assignació de
  configuracions per defecte). Totes dues correccions són també a `master`, per
  una via diferent, així que no hi ha res del tag que hi falti.
- Des d'aquell punt de separació, `master` ha rebut **194 commits** (120 sense
  comptar les fusions) i **53 pull requests**.

En xifres gruixudes: de **275 a 533** claus de traducció per idioma (els cinc
idiomes ja hi eren), i d'una aplicació **només de navegador** a una aplicació
**amb servidor propi, comptes d'usuari i sincronització al núvol**.

---

## 1. Comptes d'usuari i backend (tot nou)

A la 2.0.2 no hi havia cap servidor: `src/` era una sola app de React. Avui el
repositori és un **monorepo** amb tres workspaces i una API pròpia desplegada.

### API pròpia (`apps/api`)

Express + TypeScript + MongoDB/Mongoose, validació amb Zod, desplegada a Render.
Sis mòduls, cadascun amb `controller` / `service` / `model` / `routes` /
`validators`:

| Mòdul | Endpoints |
|---|---|
| `auth` | `POST /auth/signup`, `/login`, `/refresh`, `/logout`, `/set-password`, `/forgot-password`, `/resend-verification` |
| `documents` | `GET|POST /documents`, `GET|PUT|DELETE /documents/:id` |
| `user-settings` | `GET|PUT /user/ui-settings`, `DELETE /user/me` |
| `client-errors` | `POST /client-errors` |
| `admin` | `/admin/stats`, `/admin/users`, `/admin/events`, `/admin/client-errors`, `/admin/config` |
| `config` / `security` | interruptor de registre i sostre d'usuaris a BD; `SecurityEvent` amb TTL de 30 dies |

### Registre i sessió

- **Alta en dos passos**: una pàgina de registre demana nom, ús previst de
  l'aplicació i correu (**sense contrasenya**); un correu de benvinguda porta a
  una pantalla d'establir contrasenya —amb repetició i guia de requisits— que
  activa el compte.
- **Recuperació de contrasenya** reutilitzant aquella mateixa pantalla.
- **Verificació de correu**: un compte `pending` pot entrar i treballar; només no
  pot desar al núvol. Esborrar sempre es permet.
- **JWT** amb access token de 15 minuts i refresh token en cookie `httpOnly`.
- **Codis d'error semàntics** compartits entre front i back, traduïts als 5 idiomes.
- **No es revela mai si un correu té compte**: el registre respon igual existeixi
  o no, i qui ja en té rep un avís a la bústia amb enllaç de recuperació.
- **Correus transaccionals traduïts als 5 idiomes** (verificació, avís de compte
  duplicat, recuperació), via Resend. L'enviament **no bloqueja mai el registre**.
- **Sessió caducada**: quan el refresc silenciós falla —cookie caducada, sessió
  tancada des d'un altre dispositiu, compte suspès— l'app ho **diu** amb un avís
  persistent i, quan té sentit, un botó per tornar a entrar; abans continuava
  fent veure que hi havia sessió.
- **Tancar la sessió tanca també el document**, perquè en AAC el dispositiu es
  comparteix; si la feina no té còpia, es confirma abans.
- **Esborrar el compte** (`DELETE /user/me`).

### Entrada des de la interfície

- Botons de **iniciar sessió**, **registrar-se** i **selector d'idioma** a la
  pantalla d'inici, amb **tres nivells responsius** (escriptori en línia,
  tauleta amb el registre en línia i la resta plegada, mòbil tot al menú).
- Pàgines d'autenticació autònomes (`AuthStandaloneLayout`) amb el seu propi
  proveïdor de traduccions, perquè viuen fora del layout amb `:locale`.

---

## 2. Documents al núvol

- **Desar i carregar seqüències al compte**, amb pujada de les imatges pròpies a
  Cloudinary.
- **Diàleg de nom en desar**, amb el títol **proposat** a partir de les quatre
  primeres paraules de la seqüència. El nom viu al document, així que sobreviu a
  l'esborrany i al fitxer `.saac`.
- **«Desa'n una còpia»**: deriva un document nou del que s'està editant; a partir
  d'aquell moment es treballa sobre la còpia, i el missatge de confirmació ho diu.
  La còpia no pot dur el nom de l'original.
- **Miniatura al llistat**, derivada pel servidor dels tres primers pictogrames
  com a **referències** (no es genera ni es puja cap imatge nova: no costa ni
  Cloudinary ni quota de l'usuari).
- **Barra de progrés real** de pujada i baixada, treta dels esdeveniments d'axios;
  indeterminada quan no se'n sap la mida.
- **Quotes per pla** (`free`: 3 documents, 200 paraules de vocabulari, 50 MB),
  comprovades **abans** de pujar res a Cloudinary; cada document guarda els bytes
  dels seus assets per poder-los restar en esborrar.
- Confirmació amb missatge en desar, carregar i esborrar; els errors es queden
  dins del diàleg amb el codi visible, per poder tornar-ho a provar sense
  reescriure el nom.

---

## 3. Vocabulari personal

- **Paraules pròpies amb el seu pictograma**, desades al compte i sincronitzades
  entre dispositius.
- **Pictogrames personals**: es pot **pujar una imatge pròpia** com a pictograma,
  a més de triar-ne un d'ARASAAC.
- **Tab «Vocabulari»** al modal de configuracions: mostra a l'esquerra, llista de
  paraules desades amb la miniatura de cadascuna, i formulari a la dreta. Triar
  una paraula la carrega en mode edició; reanomenar-la la mou i bloqueja el desat
  si el nom nou ja existeix.
- El vocabulari **només viu al compte**: no es desa al `localStorage` de l'usuari
  anònim i **s'esborra en tancar la sessió** (imatges en base64 en un dispositiu
  compartit).
- Les paraules pròpies **entren al cercador** junt amb les d'ARASAAC.

---

## 4. Durabilitat de la feina: tres nivells

El canvi de comportament més visible per a qui fa servir l'app cada dia. A la
2.0.2, un refresc accidental s'enduia hores de feina sense cap avís.

### Autodesat a IndexedDB

- **Esborrany automàtic** del document (contingut, títol i format de pàgina), amb
  debounce d'1 s i forçat en amagar la pestanya (`visibilitychange` i `pagehide`,
  no només `beforeunload`: a iOS el sistema pot matar una pestanya sense
  disparar-lo mai).
- Va a **IndexedDB i no als storages del navegador**: aquests donen uns 5 MB per
  origen i una sola imatge en base64 ja se'ls menja.
- **Les imatges viuen en un magatzem a part**, escrites un sol cop, i el document
  en desa una referència: el desat freqüent passa de 22 ms a 2 ms amb dotze
  imatges, i el registre de l'esborrany de 391 KB a 1 KB.
- **Restauració només en arrencar** i només sobre un document verge.
- **Es demana emmagatzematge persistent al navegador** perquè no el desallotgi
  (després de la primera escriptura correcta i en obrir el botó d'estat, que és
  un gest d'usuari — Firefox no concedeix res sense gest).
- **Dues pestanyes ja no es trepitgen**: l'escriptura compara dins de la mateixa
  transacció i, si una altra pestanya ha desat després, es rebutja i s'avisa en
  comptes d'esborrar feina que aquesta pestanya no ha vist mai.
- Si el navegador no pot desar, **es diu** (un sol cop per sessió).

### Indicador d'estat (botó flotant)

- **`DocumentStatusFab`**: botó flotant a baix a la dreta, a l'editor i al
  visualitzador, que diu **on és la feina** —només en aquest dispositiu, en un
  fitxer, o al núvol— i **de quan és** (amb la data quan no és d'avui).
- **Estat `stale` en groc**: hi ha còpia, però s'ha quedat enrere respecte del que
  hi ha a pantalla. Abans això es deia amb el mateix verd que un document acabat
  de desar.
- De l'esborrany **no se'n diu mai «desat» a seques**.
- Des del mateix botó: desa al núvol, descarrega i **«Document nou»**, que abans
  no existia (recarregar era el reset de facto, i des de l'esborrany restaurava).

### Format de pàgina i configuració en tornar

- **El format de pàgina torna amb la seqüència**: mida, orientació, direcció i
  separació viatgen amb l'esborrany. Qui deixava la feina en A3 apaïsat se la
  retrobava dins d'un A4 vertical.
- **L'app arrenca amb la configuració del compte**, desada al navegador sota una
  clau pròpia, en comptes d'esperar fins a un minut que respongui el servidor i
  canviar-ho tot de cop a mitja feina.

---

## 5. Cerca de pictogrames

- **Suggeriments de paraula mentre s'escriu**, barrejant les paraules d'ARASAAC i
  les del vocabulari personal, amb **compleció amb el tabulador** i un indicador
  visual de què completarà.
- **Cerca seqüencial d'una frase sencera** amb **progrés determinat** (N paraules,
  N passos): d'una frase en surt la seqüència.
- **Cercador de pictogrames personals** com a origen propi, al costat d'ARASAAC.
- `features/ai-search/` queda com a **interfície preparada** per a un proveïdor
  d'IA; encara no hi ha implementació real.

---

## 6. Impressió i PDF

- **El PDF ja no pot sortir en blanc en silenci**: l'escala de captura respecta
  els sostres publicats de Safari a iOS i, si la captura surt transparent, la
  generació **falla amb codi propi** en comptes de desar un full buit.
- **Resolució correcta**: la captura compensa l'escala visual de la
  previsualització. Abans el PDF sortia a la resolució a què es *veia* el full,
  cosa que castigava justament qui exporta des d'una tauleta (de 248 a 288 dpi en
  la mesura de referència).
- **El full es centra a la pàgina** amb la seva mida real; abans la imatge anava a
  0,0 i tot el marge s'acumulava a la dreta i a baix.
- **Feedback complet** durant la generació: missatge concret mentre dura,
  confirmació en acabar i error amb el codi visible si falla —amb el detall
  (format, mida, escala i dimensions del canvas) al registre d'errors.
- El botó **no surt de l'ordre de tabulació** mentre genera (`aria-busy` en lloc
  de `disabled`).

---

## 7. Configuracions

- **Modal de configuracions amb quatre tabs**: Usuari, Pictogrames, Vista i
  Vocabulari, amb **estàndard únic** de layout (mostra a l'esquerra, controls a la
  dreta, guia al capdamunt de cada tab, una fila per ajust).
- **Tab Usuari**: idioma de l'app, idioma de cerca i **tema clar/fosc**.
- **Tab Vista**: format de pàgina, orientació, direcció, separació i **peu
  d'impressió amb l'autor de la seqüència**, amb previsualització a escala real.
- **Restaurar i aplicar a tot**: «Restaura [àmbit]» amb el mateix verb arreu i el
  tooltip dient a quins valors torna; «aplica a tots els pictogrames» un sol cop
  per secció.
- **Les preferències només es desen quan es demanen.** Fins fa poc, qualsevol
  control que perdés el focus a la pàgina de vista enviava **tota** la
  configuració —idioma, tema, vista, pictogrames i el vocabulari sencer amb les
  imatges— al compte o al `localStorage`, en silenci. Ara ho fa el botó **«Desa
  com a preferències»**, amb reintent, confirmació i diàleg d'error.
- **Persistència del tab actiu** de configuracions.
- Els tabs mostren **icona + text**, i per sota de 600 px **només el tab
  seleccionat conserva el text** —així sempre hi ha un text que diu on ets sense
  malgastar amplada—, amb el nom accessible sempre present.

---

## 8. Feedback, errors i robustesa

- **Estàndard de feedback amb quatre mecanismes** i un criteri per triar-los
  (bloqueja o no, hi ha passos comptables o no): pantalla d'espera amb missatge,
  missatge sol, progrés determinat, o indicador al mateix botó.
- **Avís de desvetllament del servidor**: Render adorm el servei als 15 minuts i
  la primera petició pot trigar prop d'un minut. Ara es dedueix de la durada de
  les peticions reals i es diu, **sense bloquejar** (l'editor funciona sencer
  sense servidor).
- **Ping preventiu** en obrir el formulari d'entrada, en arribar al registre, en
  obrir el diàleg de desar i **en tornar a la pestanya** després de 5 minuts o més
  d'absència.
- **Classificació de fallades**: les transitòries (xarxa, timeout, 502-504) es
  reintenten soles i només arriben a l'usuari si el segon intent també falla.
- **Registre d'errors del client** al servidor, amb avís per correu amb tall d'una
  hora per codi, TTL de 30 dies i pantalla al panell d'administració. Els 5xx del
  propi servidor també hi entren.
- **Cap error mut**: l'espai del navegador exhaurit, les excepcions del client i
  els 500 del servidor tenen missatge, codi visible i traça.

---

## 9. Accions destructives i accions del pictograma

- **`ConfirmDialog`**, única confirmació de l'app, amb el criteri declarat: es
  confirma pel cost de refer-ho, no perquè l'acció soni greu. Treure un pictograma
  no es confirma; **esborrar una seqüència sí**, i el cos diu **quants pictogrames
  se'n van**. Si la seqüència és buida, no es pregunta.
- **«Elimina» surt del mig del menú** i passa a l'últim lloc, sol i en color
  d'error.
- **Les accions del pictograma arriben al tàctil**: el menú contextual no s'obre
  mai a iOS (WebKit no dispara `contextmenu`), així que copiar, enganxar, inserir
  i duplicar ara també viuen al menú del diàleg d'edició, igual per a tothom.
- **Menú del pictograma traduït als 5 idiomes** —estava literalment en anglès— i
  amb etiquetes honestes: «Enganxa (substitueix)», «Insereix un buit a
  continuació», «Duplica a continuació».

---

## 10. Accessibilitat i coherència de llenguatge

- **Nom accessible a tots els controls**, derivat del títol de la seva fila: el
  botó d'imprimir s'anunciava com «view», i els desplegables arribaven com un
  «combobox» que llegia el valor però no deia de què era.
- **Un sol origen per al tooltip i l'`aria-label`** dels botons només-icona
  (`IconToggleButton`), perquè no puguin tornar a divergir; els setze botons
  d'alineació, orientació i direcció hi han migrat.
- **`describeChild` als tooltips de botons amb text**, perquè el tooltip no tapi
  l'etiqueta visible (WCAG 2.5.3 «Label in Name»).
- **Un destí es diu amb un nom; una acció, amb un verb**: «Edició» / «Vista» als
  tabs i al menú lateral, amb el criteri aplicat per idioma i no traduint
  mecànicament.
- **Les icones diuen on va cada cosa**: el núvol només a les operacions que hi van
  de debò; carpeta oberta per carregar un fitxer; escut per a l'administració;
  cercle per als pictogrames i full per a les seqüències.
- **Enllaços de debò** a les pàgines de compte: eren text amb `onClick`, invisible
  per al tabulador.
- **`e2e/accessible-names.spec.ts`** fixa que cap nom accessible torni a quedar en
  anglès.

---

## 11. Sistema visual

- **Font única de colors** (`style/palette.ts`), amb **tema fosc** i tres
  superfícies declarades: full (blanc sempre, també en fosc — el que es veu és el
  que s'imprimeix), escriptori i zona de configuració.
- **El verd deixa de ser color de text o d'icona**: es quedava a 2,1:1 sobre el
  paper, quan el mínim és 4,5:1. Corregits els botons de la barra de vista, els de
  la portada, els peus de diàleg, els rètols i —a 1,15:1— **els botons d'afegir
  pictograma i afegir seqüència**, que són les dues accions amb què comença tot.
- **Estàndard de capes flotants** (`docs/ESTANDARD-capes-flotants.md`): inventari,
  dotze divergències numerades i migració completa.
  - **`AppDialog`**: capçalera de tres franges amb el títol centrat i el distintiu
    que diu sobre què actua (i que forma part del nom accessible), i peu únic. Els
    set diàlegs de l'app hi han passat.
  - **Una sola manera de tancar un diàleg**: el peu. N'hi havia cinc, i una d'elles
    era no tenir-ne cap (el diàleg de descàrrega només es tancava clicant fora).
  - **Un sol radi** (20 px) per a botons, diàlegs i avisos, i un de propi (12 px)
    per als camps.
  - **El que sura ja no tapa la feina**: el contingut reserva al final l'espai del
    botó flotant i **l'alçada mesurada** dels avisos que no marxen sols; la columna
    de la pàgina de vista, que acaba al mateix racó, reserva l'**amplada**.
- **`SettingRow`, `SectionTitle`, `SettingsActions`, `SettingsPanelLayout`**: una
  sola implementació de la fila d'un ajust i de la fila de botons, vàlida a tot
  arreu (modal, panell de vista, modal d'edició).
- **Comportament en mòbil declarat amb un únic breakpoint**, sense components
  duplicats.

---

## 12. Antifrau, control de comptes i administració

- **`emailCanonical` com a única clau d'identitat**: sense això,
  `algu@gmail.com`, `a.l.g.u@gmail.com` i `algu+1@gmail.com` són tres comptes i
  una sola bústia. Els punts només s'ignoren als dominis de Google.
- **Estat de compte** (`pending` / `active` / `suspended`) i **rol**
  (`user` / `admin`), separats del pla comercial. Suspendre invalida els refresh
  tokens existents.
- **Frens de registre**: límit de peticions per IP, interruptor de registre i
  sostre d'usuaris **a la base de dades** (tancar el registre és un clic, no un
  desplegament), i descart de dominis d'un sol ús.
- **La IP no es desa mai en clar**: només un HMAC-SHA256, que permet comptar
  altes d'un mateix origen sense tenir cap IP a la base de dades. Purga
  automàtica als 30 dies.
- **Panell d'administració** a `/admin`: estadístiques, llistat i edició
  d'usuaris, esdeveniments de seguretat, errors del client i configuració global.
  Protegit al servidor amb `requireAdmin`.
- **Excepció d'alias `+`** per a bústies concretes de l'equip, per poder tenir un
  usuari de prova per idioma amb un sol compte real.

---

## 13. Infraestructura i qualitat

- **Monorepo** amb npm workspaces + Turborepo: `apps/web`, `apps/api` i
  `packages/shared-types` (tipus de domini compartits, perquè el contracte de
  l'API i el model de Redux no divergeixin).
- **Arquitectura per features** al front, amb la separació declarada entre l'estat
  local (`features/<domini>`) i el que parla amb l'API (`features/backend/<domini>`).
- **Desplegament**: front a Vercel, API a Render, amb la regla de reescriptura que
  els fa compartir origen — necessària perquè la cookie del refresh token és
  `sameSite: "strict"` i, si no, Safari (i per tant l'iPad, el dispositiu típic
  d'un usuari d'AAC) no la desaria mai.
- **`npm run typecheck` com a barrera real de tipus.** Fins fa poc el build del
  web no comprovava tipus i el `CLAUDE.md` deia que sí: hi havia codi de producció
  amb tipus trencats passant el build cada dia. La barrera surt neta.
- **14 suites e2e de Playwright** noves, la majoria escrites per fixar una
  correcció concreta (estat del document, esborrany, dues pestanyes, PDF, accions
  destructives, sessió caducada, noms accessibles, còpia de document…).
- **Tests d'API** amb Vitest i `mongodb-memory-server`.
- **Documentació del projecte**: `CLAUDE.md` amb els estàndards (colors,
  configuracions, tabs, feedback, accions destructives, capes flotants,
  antifrau), `docs/BACKLOG-ux.md` i `docs/ESTANDARD-capes-flotants.md`.
- **Neteja**: quatre components morts esborrats i 23 claus de traducció sense cap
  consumidor tretes dels cinc idiomes.

---

## Què queda obert

`docs/BACKLOG-ux.md` porta el compte de les troballes de la revisió d'UX: **50
entrades**, de les quals **11 continuen obertes**. Les que afecten més el que veu
l'usuari:

| | Troballa |
|---|---|
| B8 | El porta-retalls és invisible i «Enganxar» desactivat no s'explica |
| B11 | Pujar una imatge congela la interfície mig segon llarg |
| B13 | Amb tres documents de sostre, ningú diu quants en queden |
| B14 | El sostre del canvas del PDF és un valor publicat, no mesurat en un iPad |
| B22 | Les pestanyes no es posen al dia entre elles |
| B23 | L'idioma desat del compte contra el locale de l'URL en un enllaç compartit |
| C1 | Botons que només mostren l'etiqueta amb el ratolí a sobre |
| C3 | Quatre famílies d'icones barrejades sense patró |
| C10 | La suite de tests unitaris del web no compila ni s'executa |
| C11 | Una vora «fitzgerald» sense classificació es pinta del color del text |

I fora del backlog: **`newsItems.ts` (la pàgina de Novetats) no s'ha tocat des del
març** i no recull res del que hi ha en aquest document — que és, de fet, el
primer candidat a fer servir aquest inventari.
