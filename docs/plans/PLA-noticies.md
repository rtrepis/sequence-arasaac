# Pla: les notícies de Novetats de la release

> **Estat**: **aprovat** (2026-11-19), amb les decisions de §8. Es fan **les set notícies** (N-1 a
> N-7); les velles que ja no són certes **surten del carrusel i es queden a Novetats amb
> una marca, «Superada»**. Queda oberta **D5** (l'etiqueta «Nou»).
> **Fase 1 feta** (2026-11-19): sis notícies superades i set amb captures velles (§5). **Fases 2 i
> 4 fetes** (2026-11-20): les set notícies hi són, amb captures als cinc idiomes. Cada fase
> té una **porta**: no es passa a la següent fins que la decisió que la tanca és presa i apuntada a
> §8. **Per continuar, §11.**
> **Ve de**: §11 de `docs/plans/fets/PLA-vista-mobil.md` («la release no surt sense la vista al mòbil i sense
> les novetats al dia») i §13 de `docs/plans/fets/PLA-mode-lliure.md` («Una notícia per al mode de pàgines»,
> «Captures de la notícia de diverses seqüències»).
> **Estàndard**: `docs/estandards/noticies.md` (com s'escriu). **Referència de to**:
> `docs/estudis/NOTICIES-candidates-des-de-2.0.2.md` (com es tria i què no s'hi diu).

## 1. L'objectiu

Que qui obri Novetats després de la release hi trobi **tot el que ha canviat i ho veu a la
pantalla**, i que **cap notícia publicada expliqui un camí que ja no existeix**. Totes dues coses
pesen igual: una notícia vella que no és certa fa pensar que l'app està trencada (N2 del backlog).

## 2. On som

- **Publicades**: 15 entrades a `apps/web/src/data/newsItems.ts`. La darrera és del **2026-10-03**
  (`edit-text-on-card`). Des d'aleshores no se n'ha publicat cap.
- **Des del 3 d'octubre** hi ha hagut el mode de pàgines (`docs/plans/fets/PLA-mode-lliure.md`), «El meu estil»,
  la vista al mòbil (`docs/plans/fets/PLA-vista-mobil.md`), la pantalla sencera, ordenar pictogrames arrossegant
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
| **El meu estil** a la configuració, «Aplica el meu estil», «Actualitza amb el meu estil», estils de bloc, «Restableix els pictogrames d'aquesta seqüència» | 11-12 → 11-14 | **Sí** | N-2 |
| **La columna de la vista** en tres nivells (Document, Pàgina, Bloc), amb les molles | 11-07 | Dins de N-1 | N-1 |
| **«Pàgina i distribució»** (abans «Vista») a la configuració: amb quina disposició neixen els documents i les pàgines noves; mida per defecte 0,90 | 11-14 | Dins de N-1 | N-1 |
| **La vista al mòbil**: el full sencer a la pantalla, els ajustos al panell de baix, passar de pàgina lliscant o tocant la vora, tocar un bloc obre els seus ajustos, la capa del mòbil girat | 11-15 | **Sí** | N-3 |
| **Pantalla sencera**: un interruptor sota la mida de pàgina; el full pren la forma de la pantalla, sempre apaïsat, també amb blocs; **la pantalla completa només hi és amb la pantalla sencera** | 11-18 → 11-19 | **Sí**: canvia un camí que la gent ja coneixia | N-4 |
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

**Es fan les set** (D1, aclarit el 2026-11-19: en una primera lectura s'havia apuntat que N-2 i N-4
no es feien).

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
`docs/plans/fets/PLA-mode-lliure.md`, decisió D5).

### N-2 · El teu estil, a tot el document d'un cop · `my-style` · `nova` · **Alta**

> **Aturada (2026-11-20)**: canvia amb `docs/plans/PLA-estils.md`. Un estil ja no s'aplica a una pàgina
> ni a tot el document, sinó a un bloc des de la Galeria d'estils, i «Actualitza amb el meu estil»
> desapareix. **El títol i els passos d'aquí sota ja no són certs**: es reescriuen al pas 9 d'aquell
> pla.

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

**Decidit (D1)**: es fa, com a notícia pròpia.

### N-3 · La vista, també al mòbil · `mobile-view` · `nova` · **Alta**

**Què explica.** Al mòbil, el full es veu sencer i els ajustos són en un **panell de baix** que es
puja i es baixa. Passar de pàgina és lliscar, o tocar la vora. Tocar un bloc n'obre els ajustos (a
la disposició lliure, un doble toc). La vista es treballa amb el mòbil dret.

**Passos**: (1) El full sencer amb el panell plegat. (2) El panell a mig, amb un bloc seleccionat.
(3) Passar de pàgina (la fletxa de la vora). (4) La capa que demana posar el mòbil dret.

**Captures de mòbil**: és la primera notícia que n'ensenya. Vegeu §7 i D3.

**El que no s'hi diu**: «panell de baix», «sencer», «plegat», «mig». El panell es diu **«Ajustos»**
(M1 del pla de la vista al mòbil).

### N-4 · Pantalla sencera · `full-screen-sheet` · `millora` · **Alta**

**Què explica.** Un interruptor nou, sota la mida de pàgina: el full pren la forma de la pantalla,
per mostrar el document a pantalla completa en una tauleta o un projector, **no per imprimir-lo**.
També amb pàgines en blocs.

**El que s'hi ha de dir sense excusar-se**: el botó de **pantalla completa ara només hi és amb la
pantalla sencera encesa**. Qui el feia servir amb un A4 no el trobarà; la notícia ha de dir on és
ara, al primer paràgraf.

**Passos**: (1) L'interruptor a la columna. (2) El full apaïsat de pantalla. (3) La pantalla
completa, passant de pàgina.

**Decidit (D1)**: es fa, com a notícia pròpia.

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

### L'auditoria (fase 1, 2026-11-19)

S'han executat els 18 specs de `e2e/screenshots/` contra la interfície d'avui i s'han llegit els
textos de les 15 notícies, amb els noms dels botons de `ca.json`. Tres classes:

- **Superada**: el text explica un camí que ja no existeix. Porta la marca (D2).
- **Captures velles**: el text continua sent cert, però les imatges ensenyen una interfície que ja
  no és així. Proposta: **regenerar-ne les captures** (fase 3), sense tocar el text. No és
  automàtic: cal que el spec corri i mirar cada imatge (a `pdf-quality`, la captura nova surt pitjor
  enquadrada que la vella, i el spec s'ha d'ajustar).
- **Correcta**: el text és cert i les captures canvien només per soroll de l'entorn (menys del 2 %
  dels píxels, lletra i suavitzat).

| Notícia | Spec | Què hi ha | Classe | Substituïda per |
|---|---|---|---|---|
| `multiple-sequences` (02-15) | No corre (busca el lliscador «Mida» sense bloc seleccionat) | Passos 3 i 4: «Aplicar a totes» i l'acordió de cada seqüència ja no existeixen | **Superada** | N-1 |
| `view-improvements` (02-24) | No corre (el mateix) | Pas 2: l'alineació i la direcció «de cada seqüència», a la columna d'abans | **Superada** | N-1 |
| `logo-menu` (02-24) | No corre (busca l'entrada «Configuració» del menú) | Pas 3: el menú té una entrada per apartat («El meu estil», «Pàgina i distribució», «Usuari») i «Document nou» | **Superada** | — |
| `number-font` (02-27) | No corre (el mateix) | «Diàleg de Configuració per defecte» des del menú: ja no hi és | **Superada** | — |
| `new-languages` (03-13) | No corre (el mateix) | Pas 1: «entra a Configuració» (ara és l'entrada «Usuari»); la resta és certa | **Superada** | — |
| `user-preferences` (09-04) | No corre (el mateix) | Pas 1: «Obre Configuració des del menú principal» (el mateix) | **Superada** | — |
| `save-improvements` (02-28) | No corre (el lliscador «Mida») | El text és cert (la mida, l'espai i l'alineació es desen); la captura del pas 3 és la columna d'abans | Captures velles | — |
| `download-pdf` (03-13) | Corre | El botó PDF continua al costat de girar i imprimir; les captures ensenyen la columna d'abans | Captures velles | — |
| `pdf-quality` (09-04) | Corre | Text cert; captures de la vista d'abans (i la nova surt mal enquadrada) | Captures velles | — |
| `documents-everywhere` (10-01) | Corria amb errors: llegia els textos de `languages/`, que ja no existeix. **Arreglat** | El diàleg del fitxer d'estil ja no té «Aplica'l a aquest document» (ara «Fes-lo el meu estil»), i l'avís del document antic ja no té el botó «Estil del document». El text del pas 2 («aplicar-lo a qualsevol document») continua sent cert pel camí d'«Aplica el meu estil» | Captures velles | — |
| `edit-text-on-card` (10-03) | El mateix error de `languages/`. **Arreglat** | El menú del pictograma té més entrades («Mou abans», «Mou després»); el text és cert | Captures velles (només `menu`) | — |
| `pictogram-actions-touch` (09-04) | Corre | El menú porta «Copia abans un pictograma» sota «Enganxa»; text cert | Captures velles (pas 2) | — |
| `safe-delete` (09-04) | Corre | «Elimina» continua sol a l'últim lloc; el menú té més entrades | Captures velles (pas 2) | — |
| `autosave-draft` (09-04) | Corre | Canvis de soroll (< 2 %) | Correcta | — |
| `search-suggestions` (09-04) | Corre | Canvis de soroll (< 2 %) | Correcta | — |

**Sis superades**, set amb captures velles, dues correctes. Les de «Configuració» del menú
(`new-languages`, `user-preferences`, `number-font`, `logo-menu`) ho són per un sol pas, però el pas
és el camí per arribar-hi, i és el que la gent segueix.

### La marca

- **Qui la porta**: les sis superades de l'auditoria: `multiple-sequences` i `view-improvements`
  (enllaç a N-1), `logo-menu`, `number-font`, `new-languages` i `user-preferences` (sense enllaç).
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
- Les guies i el SEO de les notícies (`docs/estudis/ESTUDI-seo-noticies.md`): és un pla a part.
- Canviar com es pinta una notícia (`NewsPage`, el carrusel) més enllà del que calgui per a les
  captures de mòbil (D3).

## 7. La feina de les captures

- **Cada notícia nova, el seu spec** a `e2e/screenshots/<slug>-focused.spec.ts`, sobre `newsShot.ts`,
  amb **captures per idioma** (`public/img/news/<slug>/<idioma>/`, `{locale}` a la ruta), com les
  dues darreres. Els textos dels botons es llegeixen dels catàlegs, no s'escriuen al spec.
- **Un document de demostració** per a N-1, N-2 i N-4 (D4), el mateix per a totes tres: una fixture de `apps/web/test/fixtures/saac/` amb
  dues o tres pàgines (simple, columnes, lliure amb un rètol). Pictogrames servits des del
  repositori (`mockArasaac`).
- **Captures de mòbil (N-3, i potser N-4 i N-5)**: `shot` retalla a l'amplada de la finestra, i un
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
| D1 | Quantes notícies noves | **Les set**: N-1 (pàgines), N-2 (el meu estil), N-3 (vista al mòbil), N-4 (pantalla sencera), N-5 (ordenar arrossegant), N-6 (el text que no hi cap) i N-7 (impressió). Aclarit el 2026-11-19 |
| D2 | Les notícies velles que ja no són certes | **No es reescriuen**: surten del carrusel i es queden a Novetats com a registre de canvis, **amb una marca** que diu que són d'una versió anterior (§5, «La marca») |
| D3 | Les captures de mòbil | **Marc de telèfon** (plantilla HTML) |
| D4 | El document de demostració | **Una fixture**, compartida per N-1, N-2 i N-4 |
| D5 | L'etiqueta «Nou» de la fila «Disposició» | ⏳ **Oberta** («ja veurem»). Es decideix a la fase 5 |
| D6 | La data de les notícies | **La mateixa per a totes**, el dia de la release |
| D7 | L'ordre i quan es publica | **Tot es publica amb la release**: les set notícies i la marca de les velles, alhora |
| D8 | Com es diu la marca de les velles | **«Superada»** (2026-11-19). A la pàgina de la notícia, l'avís diu la data de la notícia (la que ja porta, `date`) i **enllaça a la notícia nova** que la substitueix |

## 9. Fases

### Fase 0 — Decisions · porta: §8 respost ✅ Tancada (2026-11-19), menys D5

D5 es decideix a la fase 5.

### Fase 1 — L'auditoria de les velles · porta: la llista de §5 tancada ✅ Feta (2026-11-19)

- Executar els `*-focused.spec.ts` de les notícies publicades, un per un, i apuntar a §5 quins ja no
  corren i quines captures canvien (sense desar-les: `git checkout` de les imatges que no toquen).
- Llegir cada notícia contra la interfície d'avui, als noms dels botons de `ca.json`.
- **Fet quan**: cada fila de §5 diu «correcta» o «porta la marca», i, si porta la marca, quina
  notícia nova la substitueix (si n'hi ha).

### Fase 2 — Les eines · porta: una captura de prova de cada mena ✅ Feta (2026-11-20)

**Fet**: la fixture `19-demostracio-noticies.saac` (A4 apaïsat: una pàgina simple, una en dues
columnes i una de lliure amb el rètol «Dissabte»; només les sis paraules que el repositori serveix),
amb la seva fila al `README.md` i una prova a `saac.test.ts`. `e2e/screenshots/demoDocument.ts`
l'obre traduïda a l'idioma de la captura (els títols, les paraules i el rètol) i porta el `t()` dels
catàlegs que fins ara cada spec es copiava. El marc de telèfon és `templates/phoneFrame.ts`, amb
`phoneScreen` i `phoneShot` a `newsShot.ts`: un o dos telèfons centrats a la mida de la notícia,
pintats a doble densitat perquè la lletra de l'app es llegeixi. Un spec de prova (esborrat després)
en va treure les tres pàgines a l'escriptori i el full al mòbil dins del marc.


- La fixture de demostració per a N-1, N-2 i N-4 (D4), amb la seva entrada al `README.md` de fixtures.
- La plantilla del marc de telèfon (D3).
- **Fet quan**: un spec de prova en treu una captura d'escriptori de les pàgines i una de mòbil, i
  totes dues es veuen bé a la pàgina d'una notícia.

### Fase 3 — La marca de les velles, i les captures velles ✅ Feta (2026-11-19)

**Les captures** (2026-11-19): regenerades les de les set notícies amb captures velles, totes les
imatges de cada notícia (perquè no hi convisquin dues lletres), i mirades una per una. Els specs
que ho necessitaven: `save-improvements` selecciona la seqüència abans de buscar el lliscador
«Mida» i retalla el nivell «Seqüència»; `pdf-quality` espera que marxi l'avís de «pictogrames
afegits»; `documents-everywhere` retalla només l'avís del document antic. `pdf-quality`,
`download-pdf` i `save-improvements` fan servir un navegador de Catalunya (`locale: "ca-ES"`): el
Chromium de proves diu que és dels Estats Units i el paper per defecte sortia Carta. `autosave-draft`
i `search-suggestions` no s'han tocat (correctes).

**Fet** (2026-11-19): l'usuari confirma que les set amb captures velles es regeneren i que
`new-languages` i `user-preferences` porten la marca. La marca ja hi és: `superseded` a
`NewsItem` (amb `replacedBy` opcional), `carouselNews()` al carrusel, l'etiqueta «Superada» a
Novetats i `SupersededNotice` a la pàgina de la notícia (`role="note"`: és part de la pàgina, no un
avís urgent). Les sis superades la porten; l'enllaç de `multiple-sequences` i `view-improvements`
a N-1 s'hi posa quan N-1 existeixi. Proves: `data/newsItems.test.ts` i
`SupersededNotice.test.tsx`. El carrusel passa de 15 notícies a 9.


**Les captures velles** (§5, set notícies): ajustar els specs que no corren o que enquadren
malament, regenerar-les i mirar-les una per una. Només les imatges: el text no es toca.

**La marca**: el camp a `NewsItem`, el carrusel que les filtra, l'etiqueta a Novetats i l'avís a la pàgina de la
notícia (§5, «La marca»), amb els textos als cinc idiomes i proves. Es marquen les de la fase 1.
L'enllaç a la notícia que la substitueix s'hi posa quan aquesta existeixi (fase 4).

### Fase 4 — Les notícies noves, una per commit ✅ Feta (2026-11-20)

**Fet**: les set, un commit cadascuna, amb el seu spec (`e2e/screenshots/<slug>-focused.spec.ts`)
i les captures per idioma. Slugs: `pages-and-blocks`, `my-style`, `mobile-view`,
`full-screen-sheet`, `reorder-pictograms`, `text-fit` i `print-matches-preview`.
`multiple-sequences` i `view-improvements` enllacen a `pages-and-blocks`. Comprovat en els cinc
idiomes: les pàgines de les set notícies, sense claus perdudes ni imatges trencades, i el carrusel.
Com s'han resolt les fitxes de §4:

- **N-1**: set apartats, com la proposta; tres preguntes freqüents. Les captures de la pàgina
  lliure es fan amb el teclat (les fletxes), perquè arrossegar amb el ratolí sobre una pàgina que
  s'acaba de desplaçar movia el bloc a un lloc imprevisible.
- **N-2**: quatre passos. El canvi d'estil que s'ensenya en actualitzar és el marc del color de la
  categoria: el blanc i negre no es veu amb les imatges de prova. El tancament diu que l'estil va
  en una sola direcció i que la columna ja no desa preferències, sense el nom del botó vell.
- **N-3**: quatre passos, tots dins del marc de telèfon (la portada, tres telèfons). La capa del
  mòbil girat es fa amb un telèfon ajagut.
- **N-4**: el primer paràgraf diu on és ara el botó de pantalla completa. Fora del català,
  l'interruptor i el botó tenen el mateix nom (C30 del backlog): la notícia descriu el botó per la
  icona.
- **N-5**: tres passos; «Enganxa» i el diàleg d'edició a pantalla completa, de passada.
- **N-6** i **N-7**: tres passos cadascuna. N-7 no diu les causes, només el que es podia notar.

**Pendent per a la fase 5**: la **data** de les set és `2026-11-20`, provisional; s'ha de posar la
del dia de la release (D6). (Els specs tanquen l'avís «Aquest document té el seu propi estil», que
surt perquè el document de demostració no té l'estil de fàbrica: no és cap error.)

Les set, de N-1 a N-7. Cada una: l'entrada a `newsItems.ts`, les claus `news.<slug>.*` als cinc idiomes
(`ca.json` amb descripció; els altres, només el text, traduït del català i no reescrit), el spec
i les captures per idioma.

**Fet quan**, per cada notícia (de `noticies.md`, «Abans de publicar»): els cinc idiomes tenen
totes les claus; `/<idioma>/news/<slug>` i la targeta del carrusel es veuen bé en tots cinc; cap
tecnicisme; els noms dels botons són els de la pantalla; `npm run typecheck` net.

### Fase 5 — Tancar

- **D5**: decidir què es fa amb l'etiqueta «Nou», i apuntar-ho al pas 8 del pla del mode lliure.
- **Tot es publica amb la release** (D7): les set notícies i les marques, amb la mateixa data (D6).
- `docs/plans/fets/PLA-vista-mobil.md` §11 i `docs/plans/fets/PLA-mode-lliure.md` §13: les files de les notícies, ✅.
- `docs/estudis/NOTICIES-candidates-des-de-2.0.2.md` i `docs/estudis/INVENTARI-funcionalitats-des-de-2.0.2.md`: una
  línia que digui que les notícies des del 3 d'octubre són en aquest pla. **O bé** un inventari
  nou des de la darrera release, si es decideix que cal (no és d'aquest pla).
- Al backlog, a «Novetats pendents de publicar», el que s'hagi deixat fora i per què.

## 10. Riscos

| Risc | Per què | Què s'hi fa |
|---|---|---|
| Les captures envelleixen abans de publicar | El pla «Estil i contingut dels blocs» canviarà la columna | Aquest pla va **abans** (§11 del pla de la vista al mòbil): la release surt, i després el pla nou. Si la columna canvia, els specs regeneren les captures |
| Set notícies d'un cop | Novetats s'omple el mateix dia i les petites tapen les grans | Dins del dia, l'ordre de §4: N-1 i N-3 a dalt |
| Traduccions | 7 notícies × ~10 claus × 5 idiomes ≈ 350 textos, més els de la marca | Traduir del català, sense reescriure; la prova de claus als cinc idiomes ho vigila |
| Les captures no coincideixen a l'entorn del núvol | Ja passa amb `saac-fixtures` | Les captures de notícia no comparen píxels, només es generen; si una surt amb un defecte de l'entorn, s'arregla l'entorn |
| Notícies de funcions que encara no s'han provat en dispositius de debò | P2 del backlog (la vista al mòbil) | Tot surt amb la release (D7), i la release no surt sense la vista al mòbil provada (§11 del pla de la vista al mòbil) |

## 11. Encàrrec per a la sessió següent

**On som** (2026-11-20): fases 0 a 4 fetes. Les set notícies són a `newsItems.ts` amb la data
provisional `2026-11-20`, i les sis velles porten la marca «Superada». Queda oberta D5 (l'etiqueta
«Nou»).

**Què**: **la fase 5** (§9), en aquest ordre:

1. **D5 amb l'usuari**: què es fa amb l'etiqueta «Nou» de la fila «Disposició», i apuntar-ho al pas
   8 de `docs/plans/fets/PLA-mode-lliure.md`.
2. **La data** de les set notícies, la del dia de la release (D6): `date` a `newsItems.ts` (set
   entrades, i el comentari que ho diu).
3. Els altres plans: `docs/plans/fets/PLA-vista-mobil.md` §11 i `docs/plans/fets/PLA-mode-lliure.md` §13, les files de
   les notícies a ✅; la línia a `NOTICIES-candidates-des-de-2.0.2.md` i
   `INVENTARI-funcionalitats-des-de-2.0.2.md`.
4. El backlog: a «Novetats pendents de publicar», el que s'ha deixat fora. **C30** (el nom de
   l'interruptor de pantalla sencera fora del català) és nova i toca la notícia N-4.

**On**: la feina d'aquest pla és a la branca `ccr-8761bdb3-cwk5f5`, que parteix de
`ccr-f5fab69a-xv8xmg` (fases 5 i 6 de la vista al mòbil). Cal integrar-la a la de la release
(`claude/release-before-new-plan-8x1xhp`) abans de publicar.

**Avisos de l'entorn del núvol** (après en aquesta feina):

- `npm ci` a l'arrel abans de res.
- Playwright necessita el Chromium de `/opt/pw-browsers/chromium`: un config local, sense pujar-lo,
  que estengui `playwright.config.ts` amb `launchOptions: { executablePath }` també a cada projecte.
  El servidor és `npx vite` a `apps/web` (port 5173). Llançar els specs amb `--timeout 90000`.
- **El servidor de desenvolupament no sempre veu els canvis dels catàlegs** de
  `packages/i18n/messages/app/`: després d'afegir-hi claus, si una pàgina diu que en falten,
  reiniciar `npx vite` abans de buscar l'error.
- **El paper per defecte surt de la regió del navegador**, i el Chromium de proves diu que és dels
  Estats Units (Carta). Un spec que ensenyi el paper ha de fer `test.use({ locale: "ca-ES" })`.
- Els specs nous comparteixen `e2e/screenshots/demoDocument.ts` (el document de demostració
  traduït, i `t()` per als textos dels catàlegs) i, per al mòbil, `phoneScreen` i `phoneShot` de
  `newsShot.ts`.
- **Un apòstrof just abans d'una etiqueta** (`l'<b>`) trenca el formatador; la prova de variables
  de `packages/i18n` ho detecta. Passar-la (`npx vitest run` a `packages/i18n`) després d'afegir
  textos.
- Regenerar una notícia no ha de tocar les altres: executar els specs un per un. Mirar cada imatge
  abans de desar-la.
