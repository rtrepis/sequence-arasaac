# Quines funcionalitats poden ser notícia

Tria editorial sobre l'inventari de `docs/INVENTARI-funcionalitats-des-de-2.0.2.md`.
Diu **què es publica a Novetats, què no, i per què**; no escriu cap notícia.

## El criteri

Una entrada d'inventari passa a notícia si respon que sí a les tres preguntes:

1. **Ho veu o ho fa l'usuari?** Si el canvi és de codi, d'infraestructura o
   d'estàndard, no hi ha res a ensenyar.
2. **Cap en una pantalla amb una captura?** Novetats explica amb passos i
   imatges. El que no es pot fotografiar no s'hi publica bé.
3. **Explicar-ho genera confiança?** Hi ha correccions que val la pena dir
   («ara les accions del pictograma funcionen a l'iPad») i altres que només
   sembrarien dubte sobre coses que l'usuari no havia notat mai.

**El cost per notícia no és menor** i condiciona quantes se'n fan: entre 5 i 13
claus de missatge (× 5 idiomes = 25–65 traduccions), una imatge de portada, una
per pas, i idealment un `*-focused.spec.ts` a `e2e/screenshots/` que generi les
captures —que és com s'han fet totes les existents i el que fa que es puguin
regenerar quan la interfície canvia.

---

## Resum de la tria

| # | Notícia proposada | `slug` | Categoria | Prioritat |
|---|---|---|---|---|
| 1 | La teva feina ja no es perd | `autosave-draft` | `millora` | **Alta** |
| 2 | Ja pots tenir compte a SequenciAAC | `user-account` | `nova` | **Alta** |
| 3 | El teu vocabulari i els teus pictogrames | `personal-vocabulary` | `nova` | **Alta** |
| 4 | Desa les seqüències al núvol | `cloud-documents` | `nova` | **Alta** |
| 5 | Les accions del pictograma, també a l'iPad | `pictogram-actions-touch` | `correccio` | **Alta** |
| 6 | Escriu la frase i troba els pictogrames | `search-suggestions` | `millora` | Mitjana |
| 7 | Tema fosc i preferències que et segueixen | `user-preferences` | `nova` | Mitjana |
| 8 | El PDF, a la resolució que toca | `pdf-quality` | `correccio` | Mitjana |
| 9 | Ningú esborra una seqüència sense avisar | `safe-delete` | `millora` | Baixa |
| 10 | Una app que es llegeix millor | `readability` | `millora` | Baixa |

Deu notícies de ~60 entrades d'inventari. La resta no és notícia, i l'apartat
«El que no es publica» diu de què es tracta.

---

## Les fitxes

### 1. La teva feina ja no es perd · `autosave-draft` · `millora`

**Per què va primera.** És l'únic canvi d'aquesta tanda que afecta *tothom* que
ja fa servir l'app, sense compte ni res nou a aprendre, i resol la pèrdua més
gran que hi havia: un refresc accidental s'enduia hores de feina sense cap avís.

**Què explica.** La seqüència es desa sola al navegador mentre treballes. El
botó rodó de baix a la dreta diu **on és la teva feina** i de quan és: només en
aquest dispositiu, en un fitxer, o al núvol. Des d'allà mateix pots desar,
descarregar o començar un **document nou** —que abans no existia.

**Passos i captures.** (1) L'editor amb el botó verd al racó. (2) El botó obert
amb la frase d'estat i les tres accions. (3) El botó **groc**, per explicar
l'estat més subtil: tens còpia, però s'ha quedat enrere del que hi ha a pantalla.

**El que s'hi ha de dir sense excusar-se.** Que l'esborrany **no és un desat**:
el navegador el pot buidar, i Safari el descarta als set dies sense visites. És
la raó de ser de l'indicador, i si la notícia diu «desat» a seques desfà tota la
feina de vocabulari que s'ha posat a la interfície.

**El que hi va de passada, sense article propi:** que dues pestanyes obertes ja
no es trepitgen la feina, i que el format de pàgina torna amb la seqüència.

---

### 2. Ja pots tenir compte a SequenciAAC · `user-account` · `nova`

**Què explica.** Alta amb nom, ús previst i correu —**sense contrasenya**—; un
correu de benvinguda porta a la pantalla on la tries i el compte queda actiu.
Amb compte, la configuració i el vocabulari et segueixen entre dispositius.

**Passos i captures.** (1) Els botons nous a la pantalla d'inici. (2) El
formulari de registre. (3) La pantalla d'establir contrasenya.

**Això és el que decideix si la notícia surt bé o malament:** ha de dir, i aviat,
que **tot el que funcionava sense compte continua funcionant sense compte**.
Qui llegeixi «ara hi ha comptes» a una eina d'AAC gratuïta pensarà primer que li
prenen alguna cosa. El compte hi afegeix; no hi tanca res.

**Hi va de passada:** que quan el servidor triga a despertar-se (pla gratuït)
l'app ho diu i continua funcionant, i que si la sessió caduca t'ho diu en comptes
de fer veure que hi és.

---

### 3. El teu vocabulari i els teus pictogrames · `personal-vocabulary` · `nova`

**Per què és la més valuosa per a l'usuari real.** És l'única funcionalitat
d'aquesta tanda que canvia què *pots representar*: fins ara només existia el que
hi hagués a ARASAAC.

**Què explica.** Desa les teves paraules amb el pictograma que triïs, **puja una
imatge pròpia** com a pictograma (una foto de la persona, de l'objecte de casa,
del lloc), i les teves paraules surten al cercador junt amb les d'ARASAAC.

**Passos i captures.** (1) El tab Vocabulari amb la llista de paraules i la
mostra. (2) Pujar una imatge com a pictograma d'una paraula. (3) La paraula
pròpia apareixent als suggeriments del cercador.

**Requereix compte** — dir-ho al resum, no al final. I dir per què: les imatges
es desen al servidor, i deixar-les al navegador d'un dispositiu compartit —el
cas normal en AAC— vol dir deixar-hi el vocabulari d'algú altre.

---

### 4. Desa les seqüències al núvol · `cloud-documents` · `nova`

**Què explica.** Desar la seqüència al compte amb un nom (proposat a partir de
les primeres paraules), recuperar-la des de qualsevol dispositiu, veure-les al
llistat amb la miniatura dels tres primers pictogrames, i **desar-ne una còpia**
per no perdre la versió anterior.

**Passos i captures.** (1) El diàleg de desar amb el nom proposat. (2) El
llistat amb les miniatures. (3) «Desa'n una còpia» al peu del diàleg.

**El punt delicat: el sostre de tres documents.** S'ha de dir **a la notícia**,
no descobrir-lo prement el botó. I s'ha de dir amb el que el compensa: el fitxer
`.saac` no té cap límit i continua sent la manera d'arxivar-ne tants com vulguis.
Si això no hi surt, la notícia promet un calaix i n'entrega un prestatge.

---

### 5. Les accions del pictograma, també a l'iPad · `pictogram-actions-touch` · `correccio`

**Per què és alta tot i ser una correcció.** L'iPad és el dispositiu típic d'un
usuari d'AAC, i a iOS el menú del clic dret **no s'obre mai**: copiar, enganxar,
inserir i duplicar hi eren inaccessibles. No és un detall, és mitja caixa d'eines
de l'editor que no existia per a bona part dels usuaris.

**Què explica.** Les sis accions són ara al menú del diàleg d'edició del
pictograma, igual a l'ordinador i a la tauleta. I, de passada, **el menú ja no
està en anglès**: estava escrit literalment en anglès, sense traduir, i tres
etiquetes descrivien malament el que feien («Enganxa» substitueix, no insereix).

**Passos i captures.** (1) El diàleg d'edició amb el menú obert. (2) Les
etiquetes noves i honestes.

---

### 6. Escriu la frase i troba els pictogrames · `search-suggestions` · `millora`

**Què explica.** El cercador suggereix paraules mentre escrius —d'ARASAAC i del
teu vocabulari— i es completen amb el **tabulador**. D'una frase sencera en surt
la seqüència, amb una barra que va dient per quina paraula va.

**Passos i captures.** (1) Suggeriment amb la pista del tabulador. (2) La frase
escrita. (3) La seqüència resultant amb la barra de progrés.

**No barrejar-hi la cerca amb IA.** `features/ai-search/` és avui una interfície
buida, sense proveïdor. Anunciar-la seria prometre el que no hi ha.

---

### 7. Tema fosc i preferències que et segueixen · `user-preferences` · `nova`

**Què explica.** El diàleg de configuració té ara quatre tabs (Usuari,
Pictogrames, Vista, Vocabulari). A Usuari hi ha l'idioma de l'app, l'idioma de
cerca i el **tema clar/fosc**. El que hi deixes es desa quan tu ho demanes, i
amb compte et segueix a qualsevol dispositiu.

**Passos i captures.** (1) El tab Usuari amb el selector de tema. (2) L'app en
fosc. (3) El botó «Desa com a preferències».

**Un detall que val la pena dir perquè és una decisió, no un descuit:** el full
és blanc **també en tema fosc**. El que veus és el que s'imprimeix, i el
contrast del text sobre paper s'ha de poder jutjar mentre configures, no en
descobrir-lo a la impressora.

---

### 8. El PDF, a la resolució que toca · `pdf-quality` · `correccio`

**Què explica.** El PDF sortia a la resolució a què *es veia* la
previsualització, cosa que castigava justament qui exporta des d'una tauleta;
ara surt sempre a la que toca. El full es centra a la pàgina en comptes
d'acumular tot el marge a un cantó. I mentre es genera, l'app diu què està
fent, quan acaba i si falla.

**Passos i captures.** (1) El missatge durant la generació. (2) El PDF amb els
marges correctes.

**El que no s'hi ha de dir amb detall:** que a l'iPad el PDF podia sortir en
blanc sense que ningú ho digués. Està corregit i hi ha una xarxa que ho detecta,
però explicar-ho amb detall sembra dubte sobre tots els PDF que l'usuari ja té
desats. Amb «i ja no pot sortir cap full en blanc» n'hi ha prou.

---

### 9. Ningú esborra una seqüència sense avisar · `safe-delete` · `millora`

**Què explica.** Esborrar una seqüència se'n porta tots els seus pictogrames i
no hi ha desfer: ara es pregunta abans, **dient quants pictogrames se'n van**. Si
la seqüència és buida no es pregunta res. I «Elimina» ha sortit del mig del menú
del pictograma —on es premia sense voler— i ha anat a l'últim lloc, sol.

**Passos i captures.** (1) El diàleg amb la xifra. (2) El menú amb «Elimina»
separat al final.

**Notícia curta, de tres claus.** No li calen tres passos.

---

### 10. Una app que es llegeix millor · `readability` · `millora`

**Què és.** El calaix de tot el que individualment no és notícia però junt sí:
el verd de la casa ha marxat d'on feia de text i d'icona (no arribava al mínim
de contrast i la impressora de la barra de vista es llegia com una taca), els
botons d'afegir pictograma i afegir seqüència eren pràcticament invisibles, tots
els diàlegs es tanquen igual, els avisos i el botó flotant ja no tapen l'última
fila de pictogrames, i els controls de configuració ja no salten de lloc.

**Una sola captura d'abans i després** de la barra de la pàgina de vista, que és
on més es nota.

**Aquesta és la primera que cau si hi ha poc temps.** És la de menys valor per
minut invertit, i la que menys es perd si no es publica.

---

## El que no es publica (i per què)

| Del inventari | Motiu |
|---|---|
| Monorepo, Turborepo, `shared-types`, arquitectura per features | Res a veure per a l'usuari |
| `npm run typecheck` com a barrera, 14 suites e2e, neteja de codi mort | Qualitat interna |
| Estàndards de colors, configuracions, tabs, feedback, capes flotants | Documentació d'equip |
| Antifrau: `emailCanonical`, hash d'IP, límits de peticions, esdeveniments de seguretat | **No s'anuncia mai com es frena l'abús.** Explicar els frens és ensenyar-ne la mida |
| Panell d'administració | Eina interna d'una sola persona |
| Registre d'errors del client, avisos per correu | Instrumentació |
| Desplegament, proxy, cookies, mateix origen | Infraestructura |
| Imatges fora del camí calent de l'esborrany (de 22 ms a 2 ms) | Invisible; com a molt, una frase dins de la notícia 1 |
| Correccions de coses que mai van arribar a producció visible | No hi ha res a corregir a la percepció de ningú |
| `features/ai-search/` | **No existeix encara.** Cap proveïdor implementat |

---

## Tres decisions que s'han de prendre abans d'escriure res

1. **Com es diu que hi ha compte sense que soni a peatge.** La notícia 2 és la
   que fixa el to de tota la tanda. Proposta: el títol i el resum parlen del que
   s'hi guanya, i la primera frase del cos diu que sense compte tot continua
   igual.
2. **Si el sostre de 3 documents surt a la notícia 4 o no.** Recomanació: sí, amb
   el `.saac` il·limitat al costat. L'alternativa —que es descobreixi al quart
   document— és pitjor per a la confiança que dir-ho.
3. **Fins on s'expliquen les correccions.** Les notícies 5 i 8 són `correccio` i
   admeten to planer; el que no admeten és detall forense. La regla que proposo:
   es diu **què funciona ara**, i el que fallava només en una frase i en passat.

---

## Avís: hi ha notícies publicades que ja són falses

No entra a la tria, però s'ha de resoldre abans o alhora, perquè afecta
credibilitat:

- **`logo-menu`** — el pas 1 anomena el menú «Edita» i «Previsualitza»; avui es
  diuen **Edició** i **Vista**. El pas 3 diu que el selector d'idioma és a baix
  del menú: **ja no hi és**, ha passat al tab Usuari de configuració i a la
  pantalla d'inici.
- **`new-languages`** — els passos 1 i 2 expliquen com canviar d'idioma **des del
  menú lateral**. Aquell camí ja no existeix.
- **La resta (`download-pdf`, `view-improvements`, `save-improvements`,
  `number-font`, `multiple-sequences`)** continuen sent certes de contingut, però
  les captures són d'abans del canvi d'icones i de contrast de la barra de vista.

Les captures es poden regenerar amb els `*-focused.spec.ts` que ja hi ha a
`e2e/screenshots/`; els textos de `logo-menu` i `new-languages` s'han de
reescriure als cinc idiomes.

---

## Ordre de publicació proposat

No totes de cop: la pàgina de Novetats es llegeix per sobre, i deu articles el
mateix dia es converteixen en cap.

1. **Tanda 1 — la feina i el tàctil** (notícies 1 i 5). No demanen compte, van
   per a tothom, i són les dues que arreglen una pèrdua real.
2. **Tanda 2 — el compte** (2, després 3 i 4). En aquest ordre: el compte primer,
   perquè les altres dues en depenen.
3. **Tanda 3 — la resta** (6, 7, 8, i 9 i 10 si hi ha temps), més la correcció de
   `logo-menu` i `new-languages`.
