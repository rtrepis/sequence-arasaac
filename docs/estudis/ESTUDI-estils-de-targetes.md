# Estudi: les formes de targeta que es fan de debò, i els estils de l'app que en surten

> **Per a què serveix**: pas 3 de `docs/plans/PLA-estils.md` (§4.4 i §10.3). Els estils de l'app de
> la **Galeria d'estils** (D6, D7) han de sortir de les targetes que fan de debò famílies, mestres i
> logopedes, no d'una tria de combinacions boniques. En surt la llista que farà servir el **pas 9**.
> **Abast**: l'entorn d'ARASAAC (el web i la personalització dels pictogrames, AraWord,
> PictoSelector, PictogramAgenda, els manuals de CATEDU) i, fora, programes i guies de comunicació
> augmentativa i alternativa (Boardmaker, Widgit, PECS, TEACCH, els codis de colors de Fitzgerald i
> de Goossens, Crain i Elder, les guies per a la discapacitat visual cerebral).
> **Data**: 2026-11-22. Primera versió. **L'usuari la revisa abans del pas 9** (§6, les decisions).

## Com s'ha fet, i què no diu

- **Cerques a la xarxa** en català, castellà i anglès. Les fonts són a §7. Les pàgines de l'Aula
  Abierta d'ARASAAC **no s'han pogut obrir** des de l'entorn on s'ha fet l'estudi (el nom del
  servidor no resolia): el que se'n diu surt dels extractes del cercador i dels manuals de CATEDU,
  que en citen els mateixos tutorials.
- **No hi ha xifres d'ús.** Cap font no diu quina forma de targeta es fa més. Com a l'estudi de
  plantilles (`ESTUDI-treballs-amb-pictogrames.md`), l'ordre surt de quantes fonts en parlen i de
  si els programes ho porten d'origen, no d'una mesura.
- **Cap guia no prescriu una forma de targeta.** Les guies de suports visuals diuen que el format
  s'ha de fer a la mida de cada persona («the first step … is to design the format of the schedule
  based on the individual needs of the student», Reading Rockets). Els estils de l'app, per tant, no
  són «els correctes»: són **punts de partida habituals** que estalvien feina.
- **La comprovació visual** (§4) s'ha fet amb l'app d'aquesta branca, un document de prova amb una
  seqüència per estil candidat (els estils amb nom del pas 4 ja ho permeten) i captures de
  Playwright a 1280 px, en clar i en fosc. Les imatges d'ARASAAC no arribaven a l'entorn: s'hi han
  posat les de `apps/web/e2e/fixtures/images/`, que són pictogrames d'ARASAAC. **La impressió en
  paper no s'ha provat**: la targeta fa servir els mateixos valors a `@media print`, però no s'ha
  vist imprès.

## 1. Què es pot triar d'una targeta, i què en fan els programes

| Tret | Què en diuen les fonts | L'app d'avui |
|---|---|---|
| **Vora o sense** | ARASAAC i PictoSelector deixen **mostrar o amagar** el marc («podrás mostrar u ocultar la imagen o el borde de color»). A Widgit Online, per defecte, **el text i els símbols van sense caixa** («free text – they are not enclosed in boxes»), i la vora s'encén a part. A Boardmaker els símbols són dins d'un botó amb vora, de gruix ajustable | Sí: vora exterior i interior, cadascuna amb gruix 0 (sense) o d'1 a 10 |
| **Gruix i cantonades** | Widgit: color, gruix, radi de la cantonada, estil i separació del símbol. Boardmaker: eina de gruix i vores discontínues. ARASAAC: «ancho» i color del marc | Sí: gruix 1–10 i radi 1–70, per vora. **Discontínua, no** |
| **Text a dalt o a baix** | Totes les eines ho deixen triar: ARASAAC, AraWord («colocar sus nombres encima o debajo de la imagen»), Widgit («symbol on top, text on top, symbol-only, text-only»), Boardmaker (posició del text) | Sí: a dalt, a baix o sense |
| **Majúscules** | El web d'ARASAAC té un botó per **passar el text a majúscules**. La progressió que es descriu per a l'agenda d'alumnat amb TEA és: imatges reals → pictogrames en color → en blanc i negre → **text, primer en majúscules i després en minúscules** (INTEF, PictogramAgenda). Hi ha material comercial de pictogrames «en letra mayúscula» per a les primeres lectures | **No.** El text s'escriu com es tecleja |
| **Lletra escolar** | Les eines deixen triar qualsevol lletra (AraWord: «cualquier fuente instalada»). No s'ha trobat cap guia que compari lletra lligada i de pal per a l'agenda | Sí: **Massallera** (lletra lligada d'escola, en català) i **Escolar** (també lligada), a més d'OpenDyslexic, Atkinson Hyperlegible i Memima |
| **Mida del text** | Tots la deixen triar. Boardmaker escala el símbol i deixa el text fix | Sí: de 0,5 a 2 vegades |
| **Numeració** | No surt com a opció de les eines de targetes; és pròpia de les seqüències de passos (TEACCH: l'ordre és fix i visible) | Sí: el número va a l'altra banda del text |
| **Color de Fitzgerald com a vora** | ARASAAC: «añadir Color de fondo o Marco a los pictogramas» segons la clau de Fitzgerald. AraWord i PictoSelector: el color de la vora diu el tipus de paraula | Sí: qualsevol de les dues vores pot ser «Fitzgerald» |
| **Color de Fitzgerald com a fons** | ARASAAC: amb la casella del color de fons, «the pictogram appears superimposed on the color assigned to the word». Als taulers de comunicació, el codi de Goossens, Crain i Elder pinta la casella; altres fonts hi posen el text sobre blanc perquè ressalti | **No.** La targeta és sempre del color del full |
| **Fons fosc** | Per a la discapacitat visual cerebral, algunes guies recomanen fons negre o llis; d'altres avisen que l'alt contrast pot afegir complexitat i proposen **pocs colors i un fons neutre** | **No**, i no ha de ser-hi: el full és blanc en tots dos temes (`docs/estandards/colors.md`) |
| **Mida de la targeta** | PECS no té una mida oficial; els jocs que es venen van de 1,5 a 2,25 polzades (de 4 a 6 cm), plastificats i amb velcro | Sí, a la distribució (mida dels pictogrames), que no és estil |

**Què en surt**: l'app ja pot fer **gairebé totes les formes** que es fan. Les que no pot fer són
dues, i totes dues demanen un camp nou al format (§5): **el text en majúscules** i **el color de la
categoria com a fons**.

## 2. Les formes que es repeteixen

Agrupant les fonts per la forma que donen a la targeta, en surten sis de reconeixibles. L'ordre és
el que s'explica a «Com s'ha fet»: de més a menys fonts que la fan o la porten d'origen.

| # | Forma | D'on surt | Per a què |
|---|---|---|---|
| F1 | **El pictograma sol, amb el text a baix i sense cap marc** | Widgit (per defecte), ARASAAC sense marc, els pictogrames que es posen dins d'un text o d'un conte | Pàgines amb molta cosa (contes, normes, receptes), on els marcs fan soroll; la persona ja reconeix els pictogrames |
| F2 | **Marc del color de la categoria** | ARASAAC (marc), AraWord i PictoSelector (vora per tipus de paraula), la clau de Fitzgerald | Frases i taulers on el color ajuda a construir la frase (qui, què fa, què) |
| F3 | **Targeta amb un contorn gruixut, per retallar** | PECS i l'agenda amb velcro: targetes soltes, plastificades, que s'enganxen i es treuen | Agenda que es retalla, intercanvi de targetes; el contorn és la línia de tall |
| F4 | **Passos numerats** | Seqüències de passos (rentar-se les mans, vestir-se), TEACCH i el «primer / després» | Quan l'ordre importa i se n'ha de poder parlar («ara toca el 3») |
| F5 | **Lletra grossa i molt clara, contorn fosc** | Guies de baixa visió i de discapacitat visual cerebral: pocs colors, fons neutre, separació | Persones amb poca visió, gent gran, lectura de lluny (un horari a la paret) |
| F6 | **Text en lletra d'escola, a dalt** | Primeres lectures: la paraula es llegeix abans de mirar el dibuix, en la lletra que s'aprèn a classe | Aprenentatge de la lectura amb suport del pictograma |

## 3. La llista proposada: cinc estils, i un sisè per decidir

Cada estil porta **només estil** (D7): les vores, la posició del text, la lletra i la numeració.
Mai la distribució (mida, espai) ni la pàgina. Els valors que no es diuen són els de l'app (Roboto
a 1, text negre, pell i cabell per defecte).

| # | Nom (proposta) | Forma | Text | Número | Vora exterior | Vora interior | Lletra |
|---|---|---|---|---|---|---|---|
| 1 | **Sense vores** | F1 | A baix | No | Cap | Cap | La del document |
| 2 | **Color de la categoria** | F2 | A baix | No | Cap | Fitzgerald, gruix 6, radi 12 | La del document |
| 3 | **Per retallar** | F3 | A baix | No | Tinta (negre), gruix 4, radi 4 | Cap | La del document |
| 4 | **Passos numerats** | F4 | A baix | Sí, a 1,4 | Gris, gruix 2, radi 12 | Cap | La del document |
| 5 | **Lletra gran i clara** | F5 | A baix | No | Tinta (negre), gruix 3, radi 8 | Cap | Atkinson Hyperlegible a 1,3 (també el número) |
| 6 | *Lletra d'escola* (per decidir, §6) | F6 | A dalt | No | Gris, gruix 2, radi 20 | Fitzgerald, gruix 2 | Massallera a 1,6 |

**Per què aquests i no d'altres**:

- **Cinc** és dins de la forquilla de §4.4 del pla (entre quatre i sis). Cada un respon a un ús diferent de
  §2, i **cap no és una variant d'un altre**: si dos estils només es diferencien en un número, triar
  costa més que fer-se'l (és el criteri de §4.4 del pla).
- **No hi ha un «Clàssic»**: l'estil d'origen de l'app (vora grisa i marc de categoria, gruix 2) ja
  és a la galeria com a «El meu estil» de qui no l'ha tocat, i com a «L'estil del document».
- **La lletra del document**: els estils 1–4 **no** canvien la lletra. Una lletra és una tria molt
  personal (i lligada a l'idioma); canviar-la per posar una vora seria un efecte que l'usuari no ha
  demanat. *Atenció*: amb D7 un estil és fix i porta tots els seus valors. Si la lletra «no hi va»,
  el pas 9 ha de poder fer un estil que **no porti lletra** i la prengui de la base, com ja fan els
  estils amb nom (`NamedStyle` només porta el que canvia). Cal comprovar-ho al pas 9.
- **«Per retallar» i «Lletra gran i clara» s'assemblen** (contorn fosc i cap marc interior). Es
  distingeixen per la lletra: la 5 és per llegir de lluny i amb poca visió, la 3 és la targeta de
  sempre amb una línia de tall clara. Si l'usuari en vol una de menys, la 3 és la que sobra (§6).
- **El text va a baix a tots** menys a la 6: és com es pinten els pictogrames d'ARASAAC per defecte,
  i, sense vores, és l'única posició que deixa les imatges alineades (§4.2).

**Els noms** són una proposta per als textos del pas 12. Han de dir **què es veu**, no per a qui és
(«Per a l'autisme» etiquetaria la persona i no la targeta). Res de «tema», «plantilla» ni
«predeterminat» (§4.1 del pla).

## 4. «Sense vores»: el text i el número sense vora

### 4.1 Què fa la targeta sense vora

Al codi (`PictogramCard.styled.ts`), quan la vora exterior és 0:

- La targeta fa **150** d'amplada en comptes de 182 (`180 + gruix`), i perd el farciment lateral.
  Els pictogrames queden més junts: l'únic espai entre ells és el de la distribució.
- El text manté l'amplada de la imatge (150): parteix les paraules igual que amb vora.
- Sense número i amb el text a baix, la capçalera buida no té farciment: la imatge comença a dalt de
  tot.

### 4.2 Què s'ha vist

Captures a `docs/estudis/img/estils-de-targetes/`. `full-1-sense-vores.png`: d'amunt a avall,
l'estil de l'app, sense vores, sense vores amb número, sense vores amb text a dalt i número, i color
de la categoria. `full-2-candidats.png`: per retallar, passos numerats, lletra gran i clara, lletra
d'escola (Escolar, a dalt) i Massallera sense vores.

| # | Cas | Com queda | Conseqüència per a l'estil |
|---|---|---|---|
| V1 | **Text a baix, sense número** | Bé. Les imatges s'alineen per dalt; una etiqueta de dues línies només allarga la seva targeta per baix. Entre etiquetes veïnes queda prou aire a mida 1 | «Sense vores» porta el text a baix |
| V2 | **Amb número** | El número va **a dalt, solt**, entre l'última línia de la seqüència d'abans i la imatge. Amb poc espai entre seqüències, sembla el número de la de dalt | «Sense vores» **sense número**. Qui vulgui números, «Passos numerats», on el contorn agrupa número, imatge i text |
| V3 | **Text a dalt** | Una etiqueta de dues línies («sopar i rentar les dents») **baixa la imatge**: les imatges de la fila deixen d'estar alineades, i els números de sota també. Amb vora passa igual, però el marc ho dissimula | Text a dalt només amb vora (l'estil 6) |
| V4 | **El color de la categoria** | Desapareix: no hi ha cap vora on pintar-lo | És el que vol dir «sense vores». La descripció de l'estil ho ha de deixar entendre |
| V5 | **Imatges amb fons propi** | Un pictograma amb fons (l'«escola», amb aigua blava) queda com un quadrat entre figures soltes | Cap: és la imatge. Es nota més sense vores |
| V6 | **Lletres d'escola** | Massallera i Escolar es pinten bé sense vora. **Escolar a 1,3 es veu petita** al costat de la resta: té l'ull de la lletra baix | Si l'estil 6 tira endavant, la lletra va a 1,6 |
| V7 | **La mostra a la galeria** (`galeria-mostra-sense-vores*.png`) | Es veu en clar i en fosc, perquè la targeta és del color del full i destaca sobre el panell. Però **no té marge**: la imatge i el text toquen la vora de la mostra, i la mostra és **més estreta** que les altres, de manera que els noms de la llista no queden alineats | Al pas 9: la mostra va dins d'una caixa d'amplada fixa i amb marge, la mateixa per a tots els estils. És de la galeria, no de la targeta (el full no ha de canviar) |

### 4.3 Una troballa de pas: el peu de la targeta mira la vora que no toca

`PictogramCard.tsx` calcula el farciment de la capçalera amb el gruix de la **vora exterior** i el
del peu amb el de la **vora interior**. Amb vora exterior i sense interior (els estils 3 i 5) i el
text **a dalt**, el peu queda sense farciment i **la imatge toca la vora de sota**
(`text-a-dalt-sense-vora-interior.png`). Amb el text a baix, que és com van els estils proposats,
no es nota. Apuntada al backlog com a **B40**; és una línia, i convé arreglar-la al pas 9, perquè
qui triï «Per retallar» i posi el text a dalt s'hi trobarà.

## 5. El que l'app no pot fer avui

| # | Què | Qui ho fa | Proposta |
|---|---|---|---|
| N1 | **Text en majúscules** | ARASAAC (botó), la progressió de lectura de l'agenda (majúscules → minúscules), material de primeres lectures | **Backlog**, per decidir (§6). Demana un camp nou de la targeta (`textCase` o semblant), i per tant esquema, fixture i lector que el conservi (fonament 06). Sense pujar `schemaVersion`: seria opcional. Amb aquest camp, l'estil 6 podria ser «Primeres lectures, en majúscules» |
| N2 | **Color de la categoria com a fons** | ARASAAC (color de fons), taulers amb el codi de Goossens, Crain i Elder | **Descartar** per ara. Gasta molta tinta, toca l'estàndard de colors (el full és blanc; el fons de la targeta seria el primer color de superfície que no ho és), i la vora de color ja dona la categoria. Si torna, va amb B39 (el fons del bloc), que ja és fora d'aquesta release |
| N3 | **Fons fosc** (discapacitat visual cerebral) | Algunes guies de CVI | **Descartar**: va contra la regla del full blanc i de la impressió en clar. Les guies no hi estan d'acord, i proposen sobretot pocs colors i separació, que l'estil 5 ja dona |
| N4 | **Vora discontínua** | Boardmaker, Widgit | **Descartar**: cap font no la fa servir per a res en concret |

## 6. El que l'usuari ha de decidir abans del pas 9

1. **La llista**: els cinc estils de §3 (1–5), o amb algun canvi. Si se'n vol un de menys, el que
   sobra és «Per retallar» (s'assembla a «Lletra gran i clara»).
2. **L'estil 6, «Lletra d'escola»**: entra o no. Arguments en contra: la lletra d'escola **depèn de
   l'idioma** (Massallera és la de Catalunya; Escolar, la de bona part de l'escola en castellà; en
   anglès, francès i italià no n'hi ha cap a l'app), i un estil és fix (D7). Si entra, cal triar una
   lletra per a tothom o fer un estil per idioma.
3. **Els estils que no canvien la lletra**: confirmar que 1–4 prenen la lletra de la base (la del
   document o la de la seqüència) i no la fixen. És el que proposa §3; demana comprovar al pas 9 que
   un estil de l'app pot no portar lletra.
4. **Les majúscules (N1)**: s'apunten al backlog com a feature futura, o es descarten.
5. **Els noms**, que són provisionals: es fixen amb els textos (pas 12), en els cinc idiomes.

**Per al pas 9, a més** (no cal decidir-ho, però cal fer-ho): la mostra de la galeria en una caixa
fixa amb marge (V7), B40 (§4.3), i on viuen els colors dels estils. Avui els valors per defecte de la
targeta són hexadecimals a `configs/defaultSettingsConfig.ts`; la regla és que cap color no surti de
`style/palette.ts`, així que la tinta i el gris dels estils 3–6 hi han d'anar com a colors de paper
(com `printColors`).

## 7. Fonts

**Entorn d'ARASAAC**

- ARASAAC, Aula Abierta: [Tutorial 7, personalització: color de fons i marc](https://aulaabierta.arasaac.org/en?p=67192);
  [Tutorial 10, opcions de text](https://aulaabierta.arasaac.org/en/customization-options-text-arasaac);
  [Com reconèixer les claus de color dels pictogrames](https://aulaabierta.arasaac.org/en?p=67992).
  No s'han pogut obrir; se'n cita el que en mostra el cercador.
- [Manual d'AraWord](https://static.arasaac.org/docs/Manual_AraWord.pdf) i
  [Manual de PictoSelector](https://static.arasaac.org/docs/Manual_PictoSelector.pdf).
- CATEDU, [curs d'ARASAAC: crear i adaptar propostes](https://libros.catedu.es/books/arasaac/chapter/3-creamos-y-adaptamos-propuestas-didacticas-con-las-nuevas-tecnologias/export/pdf)
  i [catàleg de pictogrames](https://libros.catedu.es/books/arasaac/page/22-catalogo-de-pictogramas-de-arasaac/export/pdf).
- INTEF, [PictogramAgenda](https://intef.es/wp-content/uploads/2026/04/79_25_RED_OTE_PDF_PICTOGRAMAGENDA-1.pdf):
  la progressió imatge → pictograma en color → en blanc i negre → text en majúscules → en minúscules.
- Universidad de Zaragoza, [TFG sobre AraWord](https://zaguan.unizar.es/record/61128/files/TAZ-TFG-2016-4191_ANE.pdf?version=1).

**Programes de CAA**

- Widgit: [Tips of the week](https://www.widgit.com/support/widgit-online/tips.htm),
  [Border settings](https://www.widgit.com/support-docs/uk/widgit-online/helpsheets/general/border-settings.pdf).
- Tobii Dynavox, Boardmaker 6: [gruix de la vora](https://us.tobiidynavox.com/blogs/support-articles/boardmaker-how-do-i-change-the-button-border-thickness-in-boardmaker-version-6),
  [el text a sota del símbol](https://uk.tobiidynavox.com/blogs/support-articles/how-do-i-move-the-text-below-the-symbol-in-a-symbolate-button-in-boardmaker-version-6).
- PECS: [Pyramid, kit de plastificar](https://pecsusa.com/?p=4295); mides de targetes a
  [LessonPix](https://lessonpix.com/articles/5/42/Picture+Cards...).

**Colors i guies**

- PrAACtical AAC, [Communication Boards: Colorful Considerations](https://praacticalaac.org/strategy/communication-boards-colorful-considerations/)
  (Goossens, Crain i Elder; Fitzgerald modificat).
- Inclusive Technology, [Què volen dir els colors d'un tauler de comunicació](https://www.inclusive.com/blogs/inclusive-insights/what-do-the-colours-on-a-communication-board-mean).
- Global Symbols, [Símbols de CAA per a la discapacitat visual cerebral](https://globalsymbols.com/news/2024-06-28-aac-symbols-for-individuals-with-cerebral-visual-impairment-cvi?locale=en);
  PrAACtical AAC, [AAC & CVI](https://praacticalaac.org/praactical/aac-cvi-can-we-chat/).
- Reading Rockets, [Visual schedules in the school setting](https://www.readingrockets.org/article/visual-schedules-school-setting).
