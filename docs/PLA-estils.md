# Pla: els estils, sense sorpreses

> **Estat**: esborrany per decidir (2026-11-20). Cap codi fet.
>
> **Quan llegir-lo**: abans de tocar res que creï, apliqui, restableixi o compari l'estil d'un
> pictograma, d'un bloc o del document; abans de tocar el panell «El meu estil», els menús «⋯» de
> pàgina i de bloc, o la marca «personalitzat»; i abans de fer el catàleg d'estils predefinits.
>
> Llegir abans: `docs/fonaments/03-model-contingut-estil.md` (§1, §4, §5, §6 i §7) i la decisió 24
> de `docs/decisions/ADR-005-disposicio-lliure.md`. Entrada al backlog: **B37**.

## 0. D'on surt i què vol

Revisant la notícia N-2 («El teu estil, a tot el document d'un cop», `docs/PLA-noticies.md`) van
sortir dues coses:

1. **Accions que al `.saac` són diferents i per a l'usuari són iguals.** «Aplica el meu estil» i
   «Actualitza amb el meu estil» deixen el bloc que tens davant exactament igual; només canvia què
   passa amb altres blocs que no veus.
2. **Un error de debò** (E1): en un document nou, canviar El meu estil deixa els pictogrames que ja
   hi havia amb l'estil vell i amb la marca de «personalitzat», i en desar-lo aquells valors s'hi
   graven com a retocs que l'usuari no ha fet mai.

Decidit (2026-11-20):

- **E1 es resol d'arrel (solució A)**: un pictograma guarda **només els seus retocs**; tota la resta
  l'hereta. És el que ja diu el fonament 03 (§2.3, «cada nivell guarda només les diferències»), i
  el que ja fa el `.saac` v3. Qui no ho fa és el model de Redux.
- **Abans de la release** es fa una feature nova: **El meu estil es completa amb estils
  predefinits**, amb el mateix concepte que les plantilles de pàgina. Es buscaran a la web les formes
  més habituals de fer targetes de pictogrames, i l'usuari podrà aplicar El meu estil o un
  d'aquests. **Cal un nom** (§4.1).

L'objectiu d'aquest pla és **posar damunt la taula tot el que avui pot semblar estrany**, perquè
la feature nova no l'hereti, i decidir-ho una sola vegada.

**El criteri per jutjar cada cas**: l'usuari ha de poder predir què canviarà **abans** de fer
clic, i ha de veure **on** ha canviat després. Si dues accions acaben igual a la pantalla, n'hi
sobra una o li falta dir-ne la diferència.

---

## 1. Inventari: totes les accions d'estil d'avui

| Acció | On | Què canvia al `.saac` | Què veu l'usuari |
|---|---|---|---|
| Canviar **El meu estil** | Configuració, «El meu estil» | Res de cap document desat. Un document **sense estil propi** (nou, mai descarregat) el segueix en viu | Una part dels pictogrames canvia (la lletra, els números) i una part no (E1) |
| **Carrega un estil des d'un fitxer** / «Fes-lo el meu estil» | «El meu estil»; obrir un `.saacstyle` | Com l'anterior | Com l'anterior. El fonament diu que «cap dels dos camins toca el document obert», però sí que el toca si és nou (E4) |
| **Restaura els pictogrames** | «El meu estil» | Com l'anterior | Com l'anterior |
| **Aplica el meu estil** | «⋯» de pàgina (sense els blocs comuns) o de bloc | Copia El meu estil a `styles` (o en reaprofita un d'igual, o en crea «El meu estil 2») i hi apunta els blocs | El bloc canvia. Els pictogrames retocats no |
| **Actualitza amb el meu estil** | «⋯» de pàgina o de bloc, si ja tenen estil de bloc | Reescriu els estils de bloc que fan servir | El bloc canvia **i** tots els que comparteixen l'estil, a qualsevol pàgina, que no es veuen |
| **Treu l'estil de bloc** | «⋯» de bloc | El bloc deixa d'apuntar a l'estil; si ningú més el fa servir, l'estil surt de `styles` | El bloc torna a «l'estil del document», que no es veu enlloc (E9) |
| **Restableix els pictogrames d'aquesta seqüència** | «⋯» de bloc de seqüència | Esborra els retocs dels pictogrames | Canvia a **tots** els blocs on surt la seqüència |
| **Restableix** (un pictograma) | Formulari del pictograma; menú contextual de la graella | Esborra els retocs del pictograma | La marca «personalitzat» desapareix |
| **Redueix la lletra de tot el document** | Avís «el text no hi cap» | Canvia l'estil del document **i el fa propi** si no en tenia | Canvia la lletra; a partir d'aquí el document ja no segueix El meu estil (E16) |
| **Redueix la lletra d'aquest pictograma** | Avís «el text no hi cap» | Un retoc | La marca «personalitzat» |
| Color del **vocabulari personal** | En triar el pictograma | Un retoc de Fitzgerald | La marca «personalitzat» sense haver editat res (E15) |
| `applyToAllPictogramsThunk` («Aplica a tots») | Cap lloc de la interfície | — | — |

Són **dotze** accions, amb **cinc verbs** diferents per a coses que s'assemblen (Aplica, Actualitza,
Treu, Restableix, Restaura) i **tres abasts** que no es veuen: el bloc, la seqüència (tots els
seus blocs) i el grup d'un estil de bloc (blocs de qualsevol pàgina).

---

## 2. Troballes

Cada troballa té el que passa, per què és estrany, la proposta i si cal una decisió. Les marcades
amb ⚠️ són errors; la resta són de comprensió.

### E1 ⚠️ Un pictograma nou copia l'estil en comptes d'heretar-lo — decidit: solució A

- **Què passa**: `useNewPictogram.ts` i `useSearchPictogram.ts` escriuen al pictograma els valors de
  l'estil del document d'aquell moment: la posició del text, les dues vores, la pell, el cabell,
  el color i el color de Fitzgerald. La lletra i els números no (queden buits i s'hereten).
- **Què veu l'usuari**: en un document nou, canvia El meu estil. La lletra canvia a tots els
  pictogrames; les vores i la posició del text només als que afegeixi després. Els d'abans surten
  com a «personalitzats» (`isPictogramCustomized` compara amb l'estil del document, que ja és el nou).
- **Què es grava**: en desar, `pictogramStyleOverride` (`serialize.ts:582`) escriu la diferència
  com a retoc. Al `.saac` queden retocs que ningú no ha fet, i ja són per sempre.
- **Proposta**: solució A, detallada a §3.

### E2 ⚠️ El model de Redux és mig copiat, mig heretat

- **Què passa**: segons d'on ve el pictograma, guarda una cosa o una altra.
  - **Creat a l'app**: posició del text, vores, pell, cabell, color i Fitzgerald, **copiats**.
  - **Obert d'un `.saac`** (`toRedux.ts:148`): les vores **només si són retoc**; la posició del text,
    la pell, el cabell i el Fitzgerald, **copiats sempre**.
- Per això el mateix document es comporta diferent abans i després de desar-lo i tornar-lo a obrir.
  `followStyle` («el que era igual a l'estil vell segueix el nou») ho tapa: tracta un valor copiat
  igual a l'estil com si fos heretat. Funciona mentre la cadena no es trenca, i E1 és un cas en què
  es trenca.
- **Proposta**: la mateixa solució A. Un sol model: «buit vol dir heretat».

### E3 ⚠️ «Sense posició del text» vol dir «sense text»

- **Què passa**: `settings.textPosition` buit es llegeix com a `"none"` (`serialize.ts:233`,
  `PictogramCard.styled.ts`). Amb la solució A, buit ha de voler dir «hereta».
- **Risc**: és el canvi més fàcil de fer malament. Un pictograma sense text que heretés una posició
  passaria a tenir text.
- **Proposta**: `"none"` sempre explícit. Si un pictograma no vol text i l'estil sí, `"none"` és el
  seu retoc. Proves específiques (§3.4).

### E4 Un document nou segueix El meu estil fins que es **descarrega**, i només aleshores

- **Què passa**: el document neix sense estil propi (`defaultSettings: undefined`) i l'estil es
  resol en viu amb El meu estil (`resolveDocumentStyle`). Només es fa propi en un lloc:
  `documentStyleMaterialized`, que es crida **només** des de `ModalDownload.tsx` (descarregar el fitxer).
- **Conseqüències que l'usuari no pot preveure**:
  - L'esborrany d'IndexedDB conserva el document **sense estil propi**. Si l'usuari tanca el
    navegador, canvia El meu estil una setmana després i torna a obrir, el document ha canviat
    sol.
  - Si l'usuari no descarrega mai el document (treballa des de l'esborrany i imprimeix), aquest
    document **no tindrà mai estil propi**.
  - Carregar un `.saacstyle`, «Restaura els pictogrames» o qualsevol canvi a El meu estil toca el
    document obert si és nou, encara que el fonament 03 (§5) digui que no.
  - «Redueix la lletra de tot el document» (E16) o «Aplica el meu estil» fan que el document deixi
    de seguir-lo (E6), sense dir-ho.
- **Decisió D1**: quan deixa de seguir El meu estil un document nou?
  - **(a) Mai el segueix**: neix amb una còpia (com ja fa amb la disposició quan té feina). És
    coherent amb «una sola direcció»: per portar-hi el meu estil nou, «Aplica el meu estil» al
    document (§4.3). És **el que proposo**.
  - (b) El segueix mentre és **buit**, com la disposició (pas 7b, fonament 03 §7). Amb el primer
    pictograma, es fa propi. Proposta de reserva, si (a) sembla massa estricta.
  - (c) Com ara (fins que es descarrega). Desaconsellat: depèn d'una acció que no té res a veure
    amb l'estil.
- Amb la solució A, (c) ja no deixa pictogrames a mitges, però continua canviant documents sense
  avís.

### E5 «Aplica» i «Actualitza» deixen el bloc igual

- **Què passa**: al bloc que tens davant totes dues hi posen El meu estil d'ara. La diferència és
  què passa amb els altres blocs:
  - **Aplica** el separa del seu grup. Si El meu estil ha canviat, crea «El meu estil 2», i els
    altres blocs es queden amb el vell.
  - **Actualitza** canvia el grup sencer, també a altres pàgines.
- **Per què és estrany**: l'usuari no veu el grup enlloc. Els noms dels estils de bloc («El meu
  estil», «El meu estil 2») no surten a cap lloc de la interfície (la columna «no en diu res»,
  fonament 03 §5). No pot saber quins blocs canviaran amb «Actualitza», ni que «Aplica» n'ha fet un
  grup nou.
- **Decisió D2**:
  - **(a) Una sola acció, «Aplica un estil…»**, amb l'abast a la vista: *aquest bloc*, *aquesta
    pàgina* o *tot el document* (§4.3). Desapareixen «Actualitza» i els grups invisibles: el que
    canvia és sempre el que s'ha triat. És **el que proposo**.
  - (b) Es manté «Actualitza», amb un nom que digui l'abast («Actualitza tots els blocs amb aquest
    estil (_n_)») i, en fer-ho, una vora als blocs que han canviat. El grup continua sense nom
    visible.
  - (c) Els estils de bloc tenen nom visible (a la columna, al menú) i es gestionen. És el catàleg
    dins del document; és molt més feina i no l'ha demanat ningú.

### E6 «Aplica el meu estil» en un document que encara el segueix no fa res visible, però el talla

- **Què passa**: en un document nou, l'estil del document **és** El meu estil. Aplicar-lo a una
  pàgina crea un estil de bloc idèntic. No canvia res a la pantalla i surt el missatge «aplicat».
  Quan després es canvia El meu estil, el document el segueix (E4) però aquells blocs no: es
  queden amb la còpia. La pàgina on l'usuari «ha aplicat el meu estil» és justament la que **no**
  té el seu estil.
- **Proposta**: se'n va sola amb D1 (a) i D2 (a). Si no, «Aplica» no ha de crear cap estil de bloc
  quan és igual a l'estil del document.

### E7 Aplicar un estil no toca els retocs, i l'usuari no ho sap

- **Què passa**: després d'«Aplica el meu estil», un pictograma retocat continua retocat (és la
  regla de sempre, i és bona). Però la vista no té la marca «personalitzat» (només és a l'edició,
  fonament 03 §6), i des de la vista no hi ha manera de saber per què una targeta no ha canviat.
- Avui, per deixar-ho net, calen dues accions amb abasts diferents: «Aplica» (bloc o pàgina) i
  «Restableix els pictogrames d'aquesta seqüència» (tots els blocs on surt).
- Amb la solució A, els retocs seran **només** els que l'usuari ha fet (avui n'hi ha de falsos per
  E1), i això ja treu la major part del problema.
- **Decisió D3**: el snackbar de l'aplicació diu quants pictogrames s'han quedat amb els seus
  retocs i ofereix «Treu-los també»? **Proposta**: sí, només si n'hi ha. Recordar que els retocs
  són de la seqüència: si la seqüència surt en un altre bloc, també hi canvien, i el missatge ho
  ha de dir (la regla de B35).

### E8 No es pot aplicar a tot el document, i la notícia diu que sí

- **Què passa**: «Aplica el meu estil» només és al menú d'una pàgina (sense els blocs comuns) o
  d'un bloc. Les pàgines simples no tenen menú de bloc. Un document de cinc pàgines són cinc clics,
  i els blocs comuns un a un.
- La notícia N-2 es diu «El teu estil, a tot el document d'un cop».
- **Proposta**: l'abast *tot el document* de D2 (a). Aplicar a tot el document canvia **l'estil
  del document** amb la regla de sempre (`applyStyleToDocument`: el que era igual a l'estil vell
  segueix el nou; els retocs es queden) i treu els estils de bloc que deixen de fer falta. Amb això,
  la notícia diu la veritat. Si no es fa, **cal canviar el títol de la notícia abans de publicar-la**.

### E9 «L'estil del document» és invisible

- **Què passa**: des de R10 no es pot veure ni editar enlloc. Però:
  - «Treu l'estil de bloc» diu «el bloc torna a l'estil del document»;
  - «Restableix» diu «torna aquest pictograma a l'estil del document»;
  - la marca «personalitzat» vol dir «diferent de l'estil del document».
- L'usuari no sap quin és. En un document nou, és El meu estil. En un document que ha rebut d'algú,
  és el de l'altra persona. En un de seu, descarregat fa un mes, és El meu estil **de fa un mes**.
- **Decisió D4**: com es fa visible? Opcions, no excloents:
  - **(a)** Una fila al nivell «Document» (o «Pàgina») de la columna de la vista: «Estil: *nom*»,
    amb una mostra petita i el botó «Canvia…» que obre el selector d'estils (§4). **Proposta.**
  - (b) Que l'estil del document tingui **nom** (el de l'estil del qual surt: «El meu estil»,
    «Contorn gruixut»…). Ajuda a (a) i als missatges. Afegeix un camp opcional a `style` del
    `.saac` (§5).
  - (c) Canviar els textos perquè no diguin «estil del document» i diguin què veurà («torna a com
    són els altres pictogrames»). Pegat mínim si no es fa (a).

### E10 Cinc verbs per a coses semblants

- **Aplica**, **Actualitza**, **Treu**, **Restableix** i **Restaura** conviuen, i «Restableix» i
  «Restaura» volen dir el mateix.
- **Proposta de vocabulari** (per afegir al fonament 03, §1):
  - **Aplica** porta un estil d'un catàleg (El meu estil o un predefinit) cap al document. És
    l'única acció d'entrada.
  - **Restableix** treu retocs: d'un pictograma o dels pictogrames d'una seqüència. Torna a l'estil
    de damunt.
  - **Restaura** es reserva per a la configuració (tornar una preferència als valors de l'app).
  - **Actualitza** i **Treu l'estil de bloc** desapareixen si es pren D2 (a). Si no, «Treu l'estil
    de bloc» passa a ser un «Restableix» («Restableix l'estil del bloc»).

### E11 L'edició i la vista no ensenyen el mateix pictograma

- **Què passa**: la graella d'edició pinta la seqüència amb l'estil del document. Un estil de bloc
  només es veu a la vista. Si una seqüència surt en un bloc amb un estil diferent, a l'edició es veu
  d'una manera i al paper d'una altra. La marca «personalitzat» de l'edició tampoc no en sap res.
- **A verificar** al navegador abans de decidir.
- **Proposta**: es redueix molt amb D2 (a), perquè la majoria d'usos passen a ser *tot el
  document*. Per als blocs amb estil propi, una línia a sobre de la graella d'edició («Aquesta
  seqüència surt amb un altre estil a la pàgina 2») o res, si es considera prou rar.

### E12 La marca «personalitzat» compara amb una cosa que es mou

- Mentre E4 no es resol, la marca depèn d'El meu estil: canviar-lo encén o apaga marques en un
  document que l'usuari no ha tocat. Amb la solució A, la marca vol dir «té retocs propis» i no
  depèn de cap comparació: és el que s'ha de mirar (`settings` no buit).

### E13 Estils de bloc que queden orfes o repetits

- **Què passa**: cada «Aplica» fet després de canviar El meu estil afegeix un estil a `styles`
  («El meu estil 2», «3»…). Si els blocs que el feien servir s'esborren o en canvien, l'estil pot
  quedar a `styles` sense ningú (només «Treu l'estil de bloc» el neteja). No es veu, però el fitxer
  creix i, quan els estils de bloc tinguin nom visible, sortiran.
- **Proposta**: en desar, `styles` només porta els estils que fa servir algun bloc. Si es pren
  D2 (a), el nom de l'estil de bloc és el de l'estil aplicat, no «El meu estil _n_».

### E14 Fitzgerald: color copiat i color de la categoria

- **Què passa**: el color de Fitzgerald es copia al pictograma en crear-lo (E1) i en obrir-lo
  (E2), però el fonament diu que es resol: retoc → color de la categoria a l'estil → `none`.
- **Proposta**: amb la solució A, només es guarda si és un retoc (un color triat a mà o el del
  vocabulari personal). Els estils predefinits poden portar els seus colors de categoria (§4.2).

### E15 El vocabulari personal encén la marca «personalitzat» sense que l'usuari hagi editat res

- Un color del vocabulari personal és un retoc (fonament 03 §4). Però l'usuari tria un pictograma i
  li surt marcat. **Decisió D5**: es manté (és cert que és un retoc), però el tooltip de la marca ho
  diu («color del teu vocabulari»), o el vocabulari no compta com a «personalitzat». **Proposta**: es
  manté i es diu.

### E16 «Redueix la lletra de tot el document» fa propi l'estil sense dir-ho

- **Què passa**: canvia l'estil del document. En un document nou, l'escriu (`defaultSettings` passa
  a existir) i el document deixa de seguir El meu estil (E4).
- **Proposta**: desapareix amb D1 (a) (tots els documents tenen estil propi). Si no, documentar-ho
  al fonament i acceptar-ho.

### E17 Els blocs comuns i les pàgines simples queden fora

- «Aplica el meu estil» d'una pàgina no toca els blocs comuns («A totes les pàgines»). Les pàgines
  simples no tenen menú de bloc ni de seqüència, i «Restableix els pictogrames d'aquesta
  seqüència» no s'hi arriba (pendent del pas 8 del mode lliure).
- **Proposta**: amb *tot el document* (D2 a) queda cobert. A la pàgina, els comuns es diuen al
  selector: «Aquesta pàgina (els blocs de totes les pàgines, no)».

### E18 El desfer es perd en silenci

- El «Desfés» del snackbar només funciona «mentre no s'hagi tocat des d'aleshores». Si l'usuari
  aplica un estil a tot el document, toca un pictograma i vol desfer, no pot, i no hi ha historial
  (B30). Amb *tot el document*, l'abast d'un error és més gran.
- **Proposta**: no cal resoldre B30 ara, però aplicar a tot el document **demana confirmació**
  (`ConfirmDialog`) si el document té pictogrames retocats o estils de bloc, i diu què es
  conservarà.

---

## 3. La solució A: el pictograma només guarda els seus retocs

### 3.1 La regla

Un pictograma porta a `settings` i `img.settings` **només** el que l'usuari ha canviat. Tot el que
és buit s'hereta, a qualsevol nivell: estil del document → estil de bloc → pictograma. És la regla
del fonament 03 (§2.3 i §4) aplicada també a Redux, no només al fitxer.

- **Personalitzat** = té algun retoc. Ja no es compara amb l'estil del document.
- **Restableix** = buidar els retocs. No cal saber l'estil del document.
- **Canviar l'estil del document** = canviar-lo i prou. `followStyle` ja no cal per als pictogrames
  (els retocs es queden sols); es manté per llegir esborranys vells (§3.3).
- **Pintar un bloc amb estil de bloc** = resoldre-ho a la targeta, sense còpies
  (`blockSequence` deixa de copiar pictogrames).
- Un retoc **igual** a l'estil de sobre deixa de ser retoc en desar (`diffStyle`), com ara.

### 3.2 On es toca

| Lloc | Avui | Amb A |
|---|---|---|
| `features/pictogram/hooks/useNewPictogram.ts`, `useSearchPictogram.ts` | Copien posició del text, vores, pell, cabell, color i Fitzgerald | No hi posen res d'estil. Pell, cabell i color, només si el pictograma admet variants **i** l'usuari les tria |
| `features/sequence/saac/toRedux.ts` (`pictogramToRedux`) | Copia posició del text, pell, cabell i Fitzgerald | Només el que el `.saac` porta com a retoc |
| `components/PictogramCard/` | Rep valors ja resolts en part | Resol la cascada sencera (estil del document o de bloc + retoc) amb la funció de sempre (fonament 03 §4, «Resoldre») |
| `features/sequence/style/pictogramStyle.ts` | `isPictogramCustomized` compara; `resetPictogramStyle` copia l'estil | Comprova si hi ha retocs; buida |
| `features/sequence/components/PictEdit/PictEditForm.tsx` | Mostra el valor del pictograma o el per defecte | Mostra el valor resolt, i només escriu el que es toca |
| `features/sequence/saac/serialize.ts` | Compara amb l'estil i escriu la diferència | Igual (el `diffStyle` es queda: treu els retocs iguals) |
| `features/sequence/style/styleModel.ts` (`followStyle`, `applyStyleToDocument`) | Mou els valors copiats | Només per a la migració de l'esborrany |
| `features/free-layout/model/blockStyle.ts` (`blockSequence`) | Copia i segueix l'estil | Desapareix o passa a ser el «estil base» del bloc |
| Vocabulari personal | Escriu el color | Igual: és un retoc |
| `applyToAllPictogramsThunk` | Esborra propietats dels retocs | Igual |

### 3.3 Compatibilitat

- **El `.saac` no canvia**: ja guarda només les diferències (`docs/schema/saac-v3.schema.json`). No
  cal pujar `schemaVersion` ni fer migració de fitxer. Cal comprovar-ho amb les fixtures
  (`apps/web/test/fixtures/saac/`): obrir i desar ha de donar el mateix fitxer.
- **L'esborrany d'IndexedDB sí**: hi ha documents amb valors copiats. En llegir-lo, una sola vegada,
  cada valor igual a l'estil del document resolt **en aquell moment** es buida (la regla de
  `followStyle` a l'inrevés). Els documents nous sense estil propi (E4) es resolen amb El meu estil
  de quan es llegeix: no hi ha manera de saber el de quan es van fer, i és el comportament d'avui.
  Cal posar una versió a l'esborrany per no fer-ho dues vegades.
- **El núvol**: els comptes estan apagats. Quan tornin, el desat al núvol ja va per
  `serialize.ts`.

### 3.4 Proves

- Crear un pictograma no hi escriu cap estil.
- El cas d'E1: document nou, pictograma, canviar El meu estil (amb D1 b o c), la targeta canvia
  sencera i no surt la marca; amb D1 (a), no canvia.
- Desar un document sense retocs no escriu cap `style` de pictograma.
- **Posició del text** (E3): un pictograma sense text en un estil amb text es desa amb
  `"none"` i es torna a obrir sense text; un pictograma amb text hereta el canvi de posició de
  l'estil.
- Fitzgerald: un pictograma sense retoc canvia de color amb els colors de categoria de l'estil;
  un amb color triat, no.
- Les fixtures `.saac` fan el viatge d'anada i tornada iguals.
- Un esborrany vell (fixture d'IndexedDB) es llegeix sense marques falses.
- Les captures dels e2e de la vista no canvien (amb la precaució de §13 del pla del mode lliure: en
  aquest entorn ja no coincidien abans).

---

## 4. La feature nova: estils per triar

### 4.1 El nom — decisió D6

Han de quedar clares dues paraules: la **col·lecció** i **cadascun**.

- **Prohibit**: «tema» (fonament 03 §1: només clar/fosc) i «plantilla» (és de la pàgina: «Tria
  una plantilla»). Fer-les servir faria creure que un estil canvia la pàgina.
- **Proposta**: **«Estils»** per a la col·lecció, i cadascun pel seu nom («Contorn gruixut»,
  «Text a dalt, en majúscules»…). Dins, dos grups: **«El meu estil»** (o «Els meus estils» amb
  comptes, B33) i **«Estils de l'app»** (els predefinits). L'acció és **«Aplica un estil…»**.
- Alternatives: «Galeria d'estils», «Estils proposats», «Models d'estil», «Estils predeterminats»
  (aquest es confon amb «per defecte», que és el nom vell d'El meu estil al codi).
- El nom s'ha de provar en els cinc idiomes abans de decidir (cal que «estil» i «plantilla» no es
  confonguin en cap; vegeu C30, que va passar amb «pantalla completa»).

### 4.2 Què porta un estil — decisió D7

- **Només estil** (`pictogram` i `card`, i els colors de Fitzgerald): lletra, vores, posició del
  text, numeració, pell i cabell. **Mai** distribució ni pàgina (fonament 03 §1), com El meu estil.
- **La lletra ha de ser una que l'app té** (`FontFamily`). Si l'estudi troba que les targetes
  habituals fan servir lletra lligada o en majúscules, cal veure si l'app la té abans de prometre-la.
- **Un estil predefinit és fix**: no s'edita. Per tenir-ne un de semblant: «Fes-lo el meu estil» i
  retocar-lo a la configuració (el mateix camí que el `.saacstyle`).
- **El nom** del predefinit és una traducció (`packages/i18n`), però al document s'hi escriu el text
  en l'idioma de qui l'aplica (com «El meu estil» avui): és contingut.
- **Si l'app canvia un predefinit**, els documents no canvien: aplicar-lo en copia els valors (com
  els colors de Fitzgerald, fonament 03 §4).

### 4.3 On s'aplica i com — decisió D8 (lligada a D2)

- **Una entrada**: «Aplica un estil…» al menú «⋯» de la pàgina i del bloc, i (D4 a) a la fila
  «Estil» del nivell Document de la columna.
- **Un selector** amb la mostra de cada estil (la mateixa targeta d'exemple que la mostra d'«El meu
  estil», amb un pictograma de debò del document si n'hi ha), i **l'abast**:
  - **Tot el document** — canvia l'estil del document (`applyStyleToDocument`). Treu els estils de
    bloc (la pregunta de E18). Els retocs dels pictogrames es queden, i el missatge diu quants.
  - **Aquesta pàgina** — estil de bloc als blocs de la pàgina (dir si els comuns hi entren, E17).
  - **Aquest bloc** — estil de bloc al bloc.
- L'abast per defecte: **tot el document** des de la columna; **aquesta pàgina** o **aquest bloc**
  des del menú d'on s'obre.
- Un **sol** snackbar amb Desfés, que diu l'abast («S'ha aplicat “Contorn gruixut” a tot el
  document. 3 pictogrames conserven els seus retocs.» + Desfés + «Treu els retocs», D3).
- **El document nou**: neix amb El meu estil (com ara) i, amb D1 (a), en té una còpia.

### 4.4 L'estudi — abans de fer la llista

Com l'estudi de plantilles (`docs/ESTUDI-treballs-amb-pictogrames.md`), un document a part,
`docs/ESTUDI-estils-de-targetes.md`, que respongui:

- Quines formes de targeta es fan de debò: amb vora o sense, gruix, cantonades, text a dalt o a
  baix, majúscules o minúscules, lletra escolar, numeració, color de Fitzgerald com a vora o com a
  fons, mida del text.
- On: l'entorn d'ARASAAC (materials publicats, AraWord, PictoSelector, Pictotraductor), escoles
  d'educació especial i CAA d'altres països (Boardmaker, TEACCH, PECS, les guies de colors de
  Fitzgerald i de Goossens).
- Quantes n'hi posem (proposta: **entre quatre i sis**; amb més, triar costa més que fer-se'l).
- Quines **no** es poden fer amb l'app d'avui (p. ex. el color de fons de la targeta per categoria),
  i si s'apunten al backlog o es descarten.

### 4.5 El que **no** fa aquesta feature

- No crea un editor d'estils dins del document (direcció única, decisió 23 de l'ADR-005).
- No fa el catàleg de diversos «meus estils» (és B33, amb comptes).
- No toca la distribució ni la pàgina.
- No aplica estils a blocs de text, més enllà de la lletra que ja hereten (pla «Estil i contingut
  dels blocs»).

---

## 5. Què canvia al format

| Canvi | Format | Cal |
|---|---|---|
| Solució A | Cap (Redux i esborrany) | Versió a l'esborrany i lectura dels vells (§3.3) |
| D1 (a): el document nou té estil propi de seguida | Cap | — |
| D4 (b): nom de l'estil del document | Camp opcional `style.name` al `.saac` | Esquema, fixture, fonament 06. No trenca: un lector vell el conserva com a camp desconegut |
| D2 (a): estils de bloc amb el nom de l'estil aplicat | Cap (el nom ja hi és) | — |
| E13: `styles` sense orfes en desar | Cap | Prova |
| Estils predefinits | Cap (es copien) | Les traduccions dels noms |
| `.saacstyle` d'un predefinit («Desa en un fitxer») | Cap | — |

---

## 6. Decisions per prendre

| # | Pregunta | Proposta |
|---|---|---|
| D1 | Quan deixa un document nou de seguir El meu estil? | (a) Mai el segueix: neix amb una còpia |
| D2 | «Aplica» i «Actualitza»: com es resol que acabin igual a la pantalla? | (a) Una sola acció, «Aplica un estil…», amb l'abast a la vista; fora «Actualitza» i els grups invisibles |
| D3 | Aplicar un estil ofereix treure els retocs? | Sí, al snackbar, només si n'hi ha, i dient que és a tots els blocs de la seqüència |
| D4 | Com es fa visible l'estil del document? | (a) Una fila «Estil» al nivell Document de la columna, amb (b) el nom |
| D5 | El color del vocabulari personal encén la marca «personalitzat»? | Sí, i el tooltip ho diu |
| D6 | El nom de la col·lecció | «Estils», amb «El meu estil» i «Estils de l'app» |
| D7 | Què porta un estil predefinit i si es pot editar | Només estil; fix; «Fes-lo el meu estil» per retocar-lo |
| D8 | Abasts del selector i per defecte | Document, pàgina, bloc; per defecte, el lloc d'on s'obre |
| D9 | La notícia N-2 | Esperar aquest pla. Amb D2 (a), el títol és cert; si no, canviar-lo |

---

## 7. Ordre dels passos

1. **Decisions** D1–D9 (aquest document). Actualitzar el fonament 03 (§1 vocabulari, §5 accions,
   §6 marca, §7 documents nous) **abans** del codi: mana el fonament.
2. **Solució A** (§3), sola, amb les seves proves. És un canvi de model sense canvi de pantalla
   (excepte que E1 deixa de passar). Inclou E3, E12, E14 i la lectura dels esborranys vells.
3. **D1**: el document nou amb estil propi. Treu E4, E6 i E16.
4. **L'estudi** d'estils de targetes (§4.4), en paral·lel amb 2 i 3.
5. **El selector «Aplica un estil…»** amb El meu estil sol i els tres abasts (D2, D3, D8). Treu
   «Actualitza amb el meu estil» i, si es decideix, «Treu l'estil de bloc». E5, E7, E8, E17, E18.
6. **L'estil del document visible** a la columna (D4). E9; revisar E11.
7. **Els estils de l'app** dins del selector (D6, D7), amb els resultats de l'estudi.
8. **Textos i vocabulari** (E10, E15): revisar totes les claus de `features.freeLayout.*`,
   `features.sequence.style.changed.*`, `components.pictEdit.*` i `components.defaultSettings.*` en
   els cinc idiomes.
9. **La notícia N-2** (D9), amb captures noves, i actualitzar `docs/PLA-noticies.md`.

Normes de cada pas: `npm run typecheck` net i tests passant; textos a `packages/i18n/messages/`
en els cinc idiomes; cap color fora de `palette.ts`; `ConfirmDialog` i `AppDialog` per a les
capes; tota acció acaba amb un missatge.
