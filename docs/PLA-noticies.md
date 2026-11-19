# Pla: les notícies de Novetats de la release

> **Estat**: **aprovat** (2026-11-19), amb les decisions de §8. Es fan **cinc notícies** (N-1, N-3,
> N-5, N-6 i N-7); les velles que ja no són certes **surten del carrusel i es queden a Novetats amb
> una marca, «Superada»**. Queda oberta **D5** (l'etiqueta «Nou»). Cada fase
> té una **porta**: no es passa a la següent fins que la decisió que la tanca és presa i apuntada a
> §8. **Per continuar, §11.**
> **Ve de**: §11 de `docs/PLA-vista-mobil.md` («la release no surt sense la vista al mòbil i sense
> les novetats al dia») i §13 de `docs/PLA-mode-lliure.md` («Una notícia per al mode de pàgines»,
> «Captures de la notícia de diverses seqüències»).
> **Estàndard**: `docs/estandards/noticies.md` (com s'escriu). **Referència de to**:
> `docs/NOTICIES-candidates-des-de-2.0.2.md` (com es tria i què no s'hi diu).

## 1. L'objectiu

Que qui obri Novetats després de la release hi trobi **tot el que ha canviat i ho veu a la
pantalla**, i que **cap notícia publicada expliqui un camí que ja no existeix**. Totes dues coses
pesen igual: una notícia vella que no és certa fa pensar que l'app està trencada (N2 del backlog).

## 2. On som

- **Publicades**: 15 entrades a `apps/web/src/data/newsItems.ts`. La darrera és del **2026-10-03**
  (`edit-text-on-card`). Des d'aleshores no se n'ha publicat cap.
- **Des del 3 d'octubre** hi ha hagut el mode de pàgines (`docs/PLA-mode-lliure.md`), «El meu estil»,
  la vista al mòbil (`docs/PLA-vista-mobil.md`), la pantalla sencera, ordenar pictogrames arrossegant
  i un grapat de correccions d'impressió. La vista de la pàgina **Vista** ha canviat tant que almenys
  tres notícies velles l'ensenyen com ja no és (§5).
- **Fora d'aquest pla**: les tres notícies de compte (N1 del backlog, ajornades mentre els comptes
  siguin apagats) i la de llegibilitat (N3, prioritat baixa pel cost de la captura d'«abans»).

## 3. Què ha canviat des del 3 d'octubre

Recorregut del registre de commits (2026-10-03 → 2026-11-19), amb el criteri de les tres preguntes
de `NOTICIES-candidates` (ho veu l'usuari? cap en una captura? explicar-ho genera confiança?).

| Què | Quan | Notícia? | On va |
|---|---|---|---|
| **Pàgines**: cada pàgina tria la disposició (Simple, Columnes, Files, Lliure), plantilles, blocs de seqüència i de text (rètols), moure'ls i canviar-ne la mida, afegir, duplicar i moure pàgines, «Sense col·locar», blocs a totes les pàgines | 11-07 → 11-14 | **Sí**, la més gran | N-1 |
| **El meu estil** a la configuració, «Aplica el meu estil», «Actualitza amb el meu estil», estils de bloc, «Restableix els pictogrames d'aquesta seqüència» | 11-12 → 11-14 | **Sí** | N-2 (no es fa, D1) |
| **La columna de la vista** en tres nivells (Document, Pàgina, Bloc), amb les molles | 11-07 | Dins de N-1 | N-1 |
| **«Pàgina i distribució»** (abans «Vista») a la configuració: amb quina disposició neixen els documents i les pàgines noves; mida per defecte 0,90 | 11-14 | Dins de N-1 | N-1 |
| **La vista al mòbil**: el full sencer a la pantalla, els ajustos al panell de baix, passar de pàgina lliscant o tocant la vora, tocar un bloc obre els seus ajustos, la capa del mòbil girat | 11-15 | **Sí** | N-3 |
| **Pantalla sencera**: un interruptor sota la mida de pàgina; el full pren la forma de la pantalla, sempre apaïsat, també amb blocs; **la pantalla completa només hi és amb la pantalla sencera** | 11-18 → 11-19 | **Sí**: canvia un camí que la gent ja coneixia | N-4 (no es fa, D1) |
| **Ordenar pictogrames arrossegant** a l'edició, també amb el dit (moure'l mou la targeta; deixar-lo anar obre el menú) | 10-10 | **Sí** | N-5 |
| «Enganxa» diu què hi ha copiat o per què encara no es pot | 10-10 | De passada | N-5 |
| El diàleg d'edició del pictograma ocupa tota la pantalla al mòbil | 10-10 | De passada | N-5 |
| **Avís quan el text no hi cap a la targeta**, amb com fer-lo cabre | 10-04 | **Sí**, curta | N-6 |
| **Impressió**: el botó i Ctrl+P donen el mateix full, el full ocupa més paper (marges de 5 mm), el peu ja no trepitja l'última fila, el text imprès respecta la mida de lletra | 10-04 | **Sí** (`correccio`) | N-7 |
| **Paper Carta i Tabloide**, i el paper per defecte segons la regió | 10-04 | Dins de N-7 | N-7 |
| **La llicència del peu es pot treure** (si no hi ha autor), i diu per què no quan n'hi ha | 10-04 | Dins de N-7 | N-7 |
| **Menú lateral**: «Configuració» és una entrada per apartat; «Document nou» | 11-18 | No: corregeix `logo-menu` | §5 |
| L'idioma el mana l'adreça; les fonts servides des de l'app; l'autor és del document i arriba al fitxer | 10-10 | No (no es veu, o no genera confiança) | — |
| Traduccions en un paquet, catàlegs d'errors i de correus, refactors, proves | 10-04 | No (intern) | — |

## 4. Les notícies noves (proposta)

Se'n van proposar set; **se'n fan cinc** (D1): N-1, N-3, N-5, N-6 i N-7. N-2 i N-4 es queden
escrites aquí, marcades «no es fa», per si un dia es recuperen.

### N-1 · Pàgines a la teva manera · `pages-and-blocks` · `nova` · **Alta**

**Què explica.** Un document pot tenir diverses pàgines, i cada pàgina tria com es reparteix:
**Simple** (com sempre), **Columnes**, **Files** o **Lliure**, i hi pot posar una **plantilla**. En
blocs, s'hi afegeixen seqüències i **textos**, que es mouen i canvien de mida damunt del full.

**Forma**: per apartats (`titleId`), perquè és llarga. Proposta d'apartats:

1. **Res no canvia si no vols**: el document comença com sempre. La pàgina es canvia al menú «⋯»
   de la pàgina o a la columna. *(Captura: la capçalera de la pàgina amb el menú obert.)*
2. **Columnes, files o lliure**. *(Captura: la mateixa seqüència en tres disposicions; `moreImages`.)*
3. **Plantilles**: les miniatures, i que passar-hi per damunt en dibuixa els espais al full.
4. **Moure i canviar la mida d'un bloc**, amb la quadrícula de punts i el teclat.
5. **Text al full** (rètols).
6. **Més d'una pàgina**: afegir, duplicar, moure; «Sense col·locar»; un bloc a totes les pàgines.
7. **Amb quina disposició comencen els documents nous**: «Pàgina i distribució» a la configuració.

**FAQ** proposada: s'imprimeix igual? (sí, cada pàgina és un full); els documents antics? (s'obren
en una pàgina simple, com eren); i al mòbil? (sí, vegeu N-3).

**El que no s'hi diu**: «mode lliure», «plantilla desada», «bloc comú» ni cap nom intern. Les
paraules són les de la pantalla (l'etiqueta «Lliure», el menú «⋯», «Sense col·locar»).

**En publicar-la**: es treu l'etiqueta «Nou» de la fila «Disposició» (pendent del pas 8 de
`docs/PLA-mode-lliure.md`, decisió D5).

### N-2 · El teu estil, a tot el document d'un cop · `my-style` · ~~`nova`~~ · **No es fa (D1)**

**Què explica.** L'estil dels pictogrames es fa una vegada, a **El meu estil** de la configuració,
i els documents nous el reben. Per portar-lo a un document que ja existeix: «Aplica el meu estil»,
al menú «⋯» de la pàgina o del bloc. Si després canvies el teu estil, «Actualitza amb el meu estil»
el posa al dia a tots els blocs que el fan servir.

**Passos**: (1) El meu estil a la configuració. (2) «Aplica el meu estil» al menú d'una pàgina.
(3) Un bloc amb un estil diferent dels altres. (4) «Actualitza amb el meu estil».

**El que s'hi ha de dir**: que els estils **van en una sola direcció**, de la configuració cap al
document, i que «Desa com a preferències» de la columna ja no hi és. Qui el feia servir el
buscarà. **Relació amb `documents-everywhere`**: aquella notícia parla d'«estil general» i de
`.saacstyle`; N-2 n'és la continuació i l'hauria de citar, no contradir-la (vegeu §5).

**Decidit (D1)**: no es fa. Vegeu el risc «Canvis que no explica cap notícia» (§10).

### N-3 · La vista, també al mòbil · `mobile-view` · `nova` · **Alta**

**Què explica.** Al mòbil, el full es veu sencer i els ajustos són en un **panell de baix** que es
puja i es baixa. Passar de pàgina és lliscar, o tocar la vora. Tocar un bloc n'obre els ajustos (a
la disposició lliure, un doble toc). La vista es treballa amb el mòbil dret.

**Passos**: (1) El full sencer amb el panell plegat. (2) El panell a mig, amb un bloc seleccionat.
(3) Passar de pàgina (la fletxa de la vora). (4) La capa que demana posar el mòbil dret.

**Captures de mòbil**: és la primera notícia que n'ensenya. Vegeu §7 i D3.

**El que no s'hi diu**: «panell de baix», «sencer», «plegat», «mig». El panell es diu **«Ajustos»**
(M1 del pla de la vista al mòbil).

### N-4 · Pantalla sencera · `full-screen-sheet` · ~~`millora`~~ · **No es fa (D1)**

**Què explica.** Un interruptor nou, sota la mida de pàgina: el full pren la forma de la pantalla,
per mostrar el document a pantalla completa en una tauleta o un projector, **no per imprimir-lo**.
També amb pàgines en blocs.

**El que s'hi ha de dir sense excusar-se**: el botó de **pantalla completa ara només hi és amb la
pantalla sencera encesa**. Qui el feia servir amb un A4 no el trobarà; la notícia ha de dir on és
ara, al primer paràgraf.

**Passos**: (1) L'interruptor a la columna. (2) El full apaïsat de pantalla. (3) La pantalla
completa, passant de pàgina.

**Decidit (D1)**: no es fa. Vegeu el risc «Canvis que no explica cap notícia» (§10).

### N-5 · Canvia l'ordre dels pictogrames arrossegant-los · `reorder-pictograms` · `nova` · **Mitjana**

**Què explica.** A l'edició, un pictograma s'arrossega al seu lloc nou. Amb el dit: moure'l el mou;
deixar-lo anar sense moure'l obre el menú. **De passada**: «Enganxa» diu què hi ha copiat, i al
mòbil el diàleg d'edició ocupa tota la pantalla.

**Passos**: (1) Arrossegant amb el ratolí. (2) Amb el dit, a la tauleta. (3) El menú amb «Enganxa».

### N-6 · Quan el text no hi cap, t'ho diu · `text-fit` · `millora` · **Baixa**

**Què explica.** Si el text d'un pictograma no hi cap a la targeta, l'app ho avisa i proposa com
fer-l'hi cabre. Continua `edit-text-on-card`.

**Decidit (D1)**: es fa, com a notícia pròpia.

### N-7 · El que imprimeixes és el que veus · `print-matches-preview` · `correccio` · **Mitjana**

**Què explica.** El full imprès és el de la previsualització, tant amb el botó com amb Ctrl+P;
ocupa més paper; el peu ja no tapa l'última fila; el text surt a la mida triada. **De passada**: el
paper **Carta** i **Tabloide**, el paper per defecte segons el país, i la **llicència del peu**,
que es pot treure si no hi ha autor.

**El que no s'hi diu**: les causes (tooltips, píxels, `transform`). Sí que s'hi diu el que
l'usuari havia pogut notar: «si alguna vegada t'havia sortit més petit».

**Passos**: (1) La previsualització i el paper, iguals. (2) Format de pàgina amb Carta i Tabloide.
(3) La fila de la llicència, amb l'ajuda que diu per què no es pot treure amb autor.

## 5. Les notícies publicades que ja no són certes

Una notícia vella que ensenya un camí que ja no hi és no pot quedar com si fos vigent: és el
defecte de N2 del backlog. **Decidit (D2)**: **no es reescriuen**. Surten del carrusel de la
pantalla d'inici i es queden a Novetats com a registre de canvis, **amb una marca** que diu que
expliquen com era l'app aleshores (vegeu «La marca», a sota, i D8). La columna «Proposta» de la
taula era la de la primera versió del pla; ara, cada fila que no sigui «correcta» rep la marca.

| Notícia | Què ja no és cert | Proposta |
|---|---|---|
| `multiple-sequences` (02-15) | Els passos 3 i 4: «Aplicar a totes» i l'acordió de cada seqüència no existeixen; la columna és en tres nivells | **Reescriure els passos 3 i 4** («La mateixa a tots els blocs», el nivell «Seqüència») i regenerar les captures (`multiple-sequences*.spec.ts`, que ja no corren: §13 del pla del mode lliure) |
| `view-improvements` (02-24) | El pas 2: l'alineació i la direcció ja no són «de cada seqüència» a la mateixa columna | **Retocar el pas 2** i regenerar les captures. Alternativa: deixar-la com a història (és de febrer) amb una línia que remeti a N-1 |
| `logo-menu` (02-24) | El pas 3: «Configuració» ja no és una entrada sola, les pestanyes han canviat de nom («El meu estil», «Pàgina i distribució»); hi ha «Document nou» | **Reescriure el pas 3** i regenerar-ne la captura |
| `number-font` (02-27) | Parla del «diàleg de Configuració per defecte», que ja no es diu així; la numeració deu ser a «El meu estil» (cal comprovar-ho a la fase 1) | **Retocar el text** (on és) i regenerar |
| `documents-everywhere` (10-01) | L'apartat 3 parla de l'«estil general»; ara es diu «El meu estil» i s'hi arriba diferent | **Revisar** l'apartat 3 i la FAQ contra la interfície d'avui; si ja no són certs, la marca |
| `autosave-draft`, `user-preferences`, `new-languages`, `download-pdf`, `pdf-quality`, `safe-delete`, `search-suggestions`, `pictogram-actions-touch`, `save-improvements`, `edit-text-on-card` | No s'hi ha vist res de fals en llegir-ne els textos | **Auditar-les a la fase 1**: tornar a executar el seu `*-focused.spec.ts` i mirar si la captura canvia. Un spec que ja no corre és una troballa |

### La marca

- **Qui la porta**: les notícies que la fase 1 trobi que ja no són certes. Segur, `multiple-sequences`,
  `view-improvements` i `logo-menu`; per veure, `number-font` i `documents-everywhere`.
- **Què fa**:
  - **Al carrusel** de la pantalla d'inici, no hi surt.
  - **A Novetats** (la llista per mesos), s'hi queda al seu lloc, amb una etiqueta al costat de la
    categoria.
  - **A la pàgina de la notícia**, un avís a dalt, abans del text: que explica com era l'app en
    aquella data, i, si n'hi ha, l'enllaç a la notícia que la substitueix (per exemple,
    `multiple-sequences` → N-1).
  - Les fletxes d'anterior i següent de les notícies continuen passant-hi: és un registre, i
    saltar-les-hi trencaria l'ordre.
- **Com es diu (D8, decidit: «Superada»)**. Les opcions que es van mirar:
  - **«Superada»**: curta i clara; la que es proposa.
  - «Ja no és vigent»: més explícita, però més llarga per a una etiqueta.
  - «Versió anterior»: suau, però pot fer pensar en una versió que es pot descarregar.
  - «Història»: amable, però no diu que el que explica ha canviat.

  I l'avís de la pàgina, per exemple: «Aquesta notícia explica com era SequenciAAC el febrer de
  2026. Des d'aleshores ha canviat: vegeu *Pàgines a la teva manera*.»
- **Al codi**: un camp opcional a `NewsItem` (`newsItems.ts`), amb la data des de quan i la notícia
  que la substitueix, si n'hi ha; el carrusel la filtra; `ChangelogPage` i `NewsDetailPage` la
  mostren. Textos nous als cinc idiomes. Amb proves (la notícia marcada no és al carrusel, i
  l'avís hi és). **No toca el text de les notícies velles**, que es queden com es van publicar.

## 6. Fora d'abast

- **N1** (les tres de compte): ajornades fins que s'encenguin els comptes. No s'escriuen ara.
- **N3** (llegibilitat): continua amb prioritat baixa.
- Les guies i el SEO de les notícies (`docs/ESTUDI-seo-noticies.md`): és un pla a part.
- Canviar com es pinta una notícia (`NewsPage`, el carrusel) més enllà del que calgui per a les
  captures de mòbil (D3).

## 7. La feina de les captures

- **Cada notícia nova, el seu spec** a `e2e/screenshots/<slug>-focused.spec.ts`, sobre `newsShot.ts`,
  amb **captures per idioma** (`public/img/news/<slug>/<idioma>/`, `{locale}` a la ruta), com les
  dues darreres. Els textos dels botons es llegeixen dels catàlegs, no s'escriuen al spec.
- **Un document de demostració** per a N-1 (D4): una fixture de `apps/web/test/fixtures/saac/` amb
  dues o tres pàgines (simple, columnes, lliure amb un rètol). Pictogrames servits des del
  repositori (`mockArasaac`).
- **Captures de mòbil (N-3, i potser N-5)**: `shot` retalla a l'amplada de la finestra, i un
  mòbil fa 412 px, menys que els 700 de `STEP`. Cal decidir com es presenten (D3):
  - **(a) un marc de telèfon** — **decidit (D3)**: una plantilla HTML a `e2e/screenshots/templates/`
    (com `documentStructure.ts`) que posa la captura del mòbil dins d'un telèfon dibuixat, centrat
    a 700 × 560, amb els colors de `palette.ts`.
  - (b) la captura tal qual, més estreta, centrada per la pàgina de la notícia: més senzill, però
    canvia com es veuen les notícies i cal mirar-ho a `NewsPage`.
- **Res de l'entorn de proves a la imatge** (`noticies.md`). A l'entorn del núvol, Playwright
  necessita `executablePath: "/opt/pw-browsers/chromium"` en un config local que no es puja.
- **Regenerar una notícia no toca les altres**: s'executen els specs un per un.

## 8. Decisions (porta de la fase 0) — preses el 2026-11-19

| Id | Pregunta | Decisió |
|---|---|---|
| D1 | Quantes notícies noves | **Cinc**: N-1 (pàgines), N-3 (vista al mòbil), N-5 (ordenar arrossegant), N-6 (el text que no hi cap) i N-7 (impressió). **N-2 i N-4 no es fan** |
| D2 | Les notícies velles que ja no són certes | **No es reescriuen**: surten del carrusel i es queden a Novetats com a registre de canvis, **amb una marca** que diu que són d'una versió anterior (§5, «La marca») |
| D3 | Les captures de mòbil | **Marc de telèfon** (plantilla HTML) |
| D4 | El document de demostració | **Una fixture**, només per a N-1 |
| D5 | L'etiqueta «Nou» de la fila «Disposició» | ⏳ **Oberta** («ja veurem»). Es decideix a la fase 5 |
| D6 | La data de les notícies | **La mateixa per a totes**, el dia de la release |
| D7 | L'ordre i quan es publica | **Tot es publica amb la release**: les cinc notícies i la marca de les velles, alhora |
| D8 | Com es diu la marca de les velles | **«Superada»** (2026-11-19). A la pàgina de la notícia, l'avís diu la data de la notícia (la que ja porta, `date`) i **enllaça a la notícia nova** que la substitueix |

## 9. Fases

### Fase 0 — Decisions · porta: §8 respost ✅ Tancada (2026-11-19), menys D5

D5 es decideix a la fase 5.

### Fase 1 — L'auditoria de les velles · porta: la llista de §5 tancada

- Executar els `*-focused.spec.ts` de les notícies publicades, un per un, i apuntar a §5 quins ja no
  corren i quines captures canvien (sense desar-les: `git checkout` de les imatges que no toquen).
- Llegir cada notícia contra la interfície d'avui, als noms dels botons de `ca.json`.
- **Fet quan**: cada fila de §5 diu «correcta» o «porta la marca», i, si porta la marca, quina
  notícia nova la substitueix (si n'hi ha).

### Fase 2 — Les eines · porta: una captura de prova de cada mena

- La fixture de demostració per a N-1 (D4), amb la seva entrada al `README.md` de fixtures.
- La plantilla del marc de telèfon (D3).
- **Fet quan**: un spec de prova en treu una captura d'escriptori de les pàgines i una de mòbil, i
  totes dues es veuen bé a la pàgina d'una notícia.

### Fase 3 — La marca de les velles

El camp a `NewsItem`, el carrusel que les filtra, l'etiqueta a Novetats i l'avís a la pàgina de la
notícia (§5, «La marca»), amb els textos als cinc idiomes i proves. Es marquen les de la fase 1.
L'enllaç a la notícia que la substitueix s'hi posa quan aquesta existeixi (fase 4).

### Fase 4 — Les notícies noves, una per commit

N-1, N-3, N-5, N-6 i N-7. Cada una: l'entrada a `newsItems.ts`, les claus `news.<slug>.*` als cinc idiomes
(`ca.json` amb descripció; els altres, només el text, traduït del català i no reescrit), el spec
i les captures per idioma.

**Fet quan**, per cada notícia (de `noticies.md`, «Abans de publicar»): els cinc idiomes tenen
totes les claus; `/<idioma>/news/<slug>` i la targeta del carrusel es veuen bé en tots cinc; cap
tecnicisme; els noms dels botons són els de la pantalla; `npm run typecheck` net.

### Fase 5 — Tancar

- **D5**: decidir què es fa amb l'etiqueta «Nou», i apuntar-ho al pas 8 del pla del mode lliure.
- **Tot es publica amb la release** (D7): les cinc notícies i les marques, amb la mateixa data (D6).
- `docs/PLA-vista-mobil.md` §11 i `docs/PLA-mode-lliure.md` §13: les files de les notícies, ✅.
- `docs/NOTICIES-candidates-des-de-2.0.2.md` i `docs/INVENTARI-funcionalitats-des-de-2.0.2.md`: una
  línia que digui que les notícies des del 3 d'octubre són en aquest pla. **O bé** un inventari
  nou des de la darrera release, si es decideix que cal (no és d'aquest pla).
- Al backlog, a «Novetats pendents de publicar», el que s'hagi deixat fora i per què.

## 10. Riscos

| Risc | Per què | Què s'hi fa |
|---|---|---|
| Les captures envelleixen abans de publicar | El pla «Estil i contingut dels blocs» canviarà la columna | Aquest pla va **abans** (§11 del pla de la vista al mòbil): la release surt, i després el pla nou. Si la columna canvia, els specs regeneren les captures |
| Cinc notícies d'un cop | Novetats s'omple el mateix dia i les petites tapen les grans | Dins del dia, l'ordre de §4: N-1 i N-3 a dalt |
| Traduccions | 5 notícies × ~10 claus × 5 idiomes ≈ 250 textos, més els de la marca | Traduir del català, sense reescriure; la prova de claus als cinc idiomes ho vigila |
| **Canvis que no explica cap notícia** | Sense N-2 i N-4, ningú no explica que el botó de pantalla completa ara només surt amb la pantalla sencera encesa, ni que «Desa com a preferències» ja no és a la columna | Acceptat (D1). Si arriben preguntes, una línia a la FAQ de N-1 ho pot dir sense una notícia nova |
| Les captures no coincideixen a l'entorn del núvol | Ja passa amb `saac-fixtures` | Les captures de notícia no comparen píxels, només es generen; si una surt amb un defecte de l'entorn, s'arregla l'entorn |
| Notícies de funcions que encara no s'han provat en dispositius de debò | P2 del backlog (la vista al mòbil) | Tot surt amb la release (D7), i la release no surt sense la vista al mòbil provada (§11 del pla de la vista al mòbil) |

## 11. Encàrrec per a la sessió següent

**Què**: la fase 1 (l'auditoria de les velles) i la fase 2 (la fixture de N-1 i el marc de
telèfon).

**On**: a la branca de la release, `claude/release-before-new-plan-8x1xhp`, un cop hi hagi les
fases 5 i 6 de la vista al mòbil (branques `ccr-d6733228-d9h9t0` i `ccr-f5fab69a-xv8xmg`).

**Què cal llegir abans**: aquest pla; `docs/estandards/noticies.md`; i, per al to, una notícia
llarga (`documents-everywhere`) i una de curta (`edit-text-on-card`) a `ca.json`.
