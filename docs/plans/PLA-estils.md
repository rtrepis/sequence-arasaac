# Pla: els estils, sense sorpreses

> **Estat**: decisions preses (2026-11-20), **revisades el 2026-11-21 (§8)**, i **pla d'execució
> escrit el 2026-11-21 (§10)**. Passos 1 (fonaments), 2 (solució A i D1, §3.5), 4 (el format, §12.1),
> 5 (la galeria i l'estil de la seqüència a l'edició, §13.1), 6 (l'estil del bloc a la vista,
> §14.1), 7 (l'esbós, §15.1, revisat: D25–D28) i 8 (l'edició nova al mòbil, §16.1) fets, el
> 2026-11-22. Es continua amb l'encàrrec de §17: el pas 3 (l'estudi), del qual depèn el pas 9.

> **⚠️ Com llegir aquest document (2026-11-21).** És un document **en dues capes**:
>
> - **§0–§7** són l'anàlisi i les decisions del 2026-11-20. **Continuen valent** l'inventari (§1),
>   les troballes E1–E18 (§2), **la solució A** (§3) i les decisions D1, D3, D5, D6 i D7.
> - **§8** és la revisió del 2026-11-21 i **mana sobre tot el que la contradigui**. En concret,
>   **queden superats**: D8 i §4.3 («només a un bloc»), Q1, la fila de D4, i l'**ordre dels passos de
>   §7**.
> - **§10** és el pla d'execució (2026-11-21): les decisions D10–D24 i els passos. **Mana sobre
>   §0–§8** i **substitueix §7**. Per treballar, es llegeix §10 i s'hi va a buscar el detall que
>   cita (§3 per a la solució A, §4.4 per a l'estudi).
> - Les seccions superades porten la marca **«⚠️ Superat per §8»**. No s'esborren perquè expliquen
>   d'on venen les decisions.
>
> **Quan llegir-lo**: abans de tocar res que creï, apliqui, restableixi o compari l'estil d'un
> pictograma, d'un bloc o del document; abans de tocar el panell «El meu estil», els menús «⋯» de
> pàgina i de bloc, o la marca «personalitzat»; i abans de fer el catàleg d'estils predefinits.
>
> Llegir abans: `docs/fonaments/03-model-contingut-estil.md` (§1, §4, §5, §6 i §7) i la decisió 24
> de `docs/decisions/ADR-005-disposicio-lliure.md`. Entrada al backlog: **B37**.

## 0. D'on surt i què vol

Revisant la notícia N-2 («El teu estil, a tot el document d'un cop», `docs/plans/PLA-noticies.md`) van
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

> **Decidit (D1)**: el document nou neix amb una còpia d'El meu estil i no el segueix mai.

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

> **Decidit (D2, D8)**: una sola acció, «Tria un estil…», només a un bloc. Fora «Actualitza».

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

> **Decidit (D3)**: el snackbar diu quants retocs es conserven i ofereix «Treu els retocs».

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

> **Decidit (D8, D9)**: no s'aplica a tot el document; es canvia el títol de la notícia. El cost de
> canviar un document gran és Q2.

- **Què passa**: «Aplica el meu estil» només és al menú d'una pàgina (sense els blocs comuns) o
  d'un bloc. Les pàgines simples no tenen menú de bloc. Un document de cinc pàgines són cinc clics,
  i els blocs comuns un a un.
- La notícia N-2 es diu «El teu estil, a tot el document d'un cop».
- **Proposta**: l'abast *tot el document* de D2 (a). Aplicar a tot el document canvia **l'estil
  del document** amb la regla de sempre (`applyStyleToDocument`: el que era igual a l'estil vell
  segueix el nou; els retocs es queden) i treu els estils de bloc que deixen de fer falta. Amb això,
  la notícia diu la veritat. Si no es fa, **cal canviar el títol de la notícia abans de publicar-la**.

### E9 «L'estil del document» és invisible

> **Decidit (D4)**: una fila «Estil» al nivell Document de la columna, amb el nom.

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

> **Decidit (D5)**: es manté marcat i el tooltip ho diu.

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

> **Decidit (D8)**: només blocs. Les pàgines simples són Q1; els blocs comuns, Q3.

- «Aplica el meu estil» d'una pàgina no toca els blocs comuns («A totes les pàgines»). Les pàgines
  simples no tenen menú de bloc ni de seqüència, i «Restableix els pictogrames d'aquesta
  seqüència» no s'hi arriba (pendent del pas 8 del mode lliure).
- **Proposta**: amb *tot el document* (D2 a) queda cobert. A la pàgina, els comuns es diuen al
  selector: «Aquesta pàgina (els blocs de totes les pàgines, no)».

### E18 El desfer es perd en silenci

> **Decidit**: sense confirmació; n'hi ha prou amb Desfés (l'abast és un sol bloc).

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

### 3.5 Com s'ha fet (pas 2, 2026-11-21)

> El que el codi d'avui ha obligat a afinar respecte de §3.2 i §3.3. Cap d'aquests punts no canvia
> cap decisió ni el format del fitxer.

- **Quines variants admet un pictograma** (pell, cabell, color): abans ho deia que el pictograma
  en portés el valor copiat. Amb només retocs, això ja no serveix, i Redux té un camp nou,
  `img.variants` (el mateix que `image.variants` del `.saac`). Sense el camp (un pictograma
  d'abans), es dedueix com abans, del que porta (`variantsOf`).
- **Tot viu a `features/sequence/style/pictogramStyle.ts`**: `resolvePictogram` (la cascada que fa
  servir la targeta; `PictogramCardDefaults` porta ara la posició del text, la pell, el cabell, el
  color i els colors de Fitzgerald), `stripInherited` (treu el que és igual al que heretaria),
  `pictogramFromLegacy` (el mateix, amb «sense posició» → `"none"`, E3), `isPictogramCustomized`
  (té retocs?) i `resetPictogramStyle` (els buida).
- **El formulari d'edició** ensenya els valors resolts i, en desar, escriu la diferència amb el que
  hereta (`stripInherited`). Cobreix «només escriu el que es toca»: el que no es toca és igual al
  que hereta.
- **El vocabulari personal** (D5) només deixa un retoc si canvia alguna cosa respecte de l'estil:
  una paraula del vocabulari amb la pell de l'estil no encén la marca.
- **`followStyle` i `blockSequence` se'n van**: canviar l'estil del document ja no toca cap
  pictograma, i un bloc amb estil amb nom pinta els pictogrames tal com són amb els valors de
  l'estil amb nom (`cardDefaultsOf(styleWithNamed(…))`).
- **«Aplica a tots»** (`pictStyleAppliedToAll`) esborra la propietat dels retocs en lloc d'escriure-hi
  el valor nou.
- **El núvol no passa per `serialize.ts`** (§3.3 deia que sí): `saveDocumentThunk` envia el
  `documentState` de Redux tal com és, i l'API i la lectura del núvol (el lector dels formats antics)
  esperen l'estil copiat. Per no canviar el contracte de l'API, en desar s'hi envien els pictogrames
  amb l'estil resolt (`documentToLegacyPictograms`) i el que torna es redueix als retocs
  (`documentFromLegacyPictograms`). Els comptes estan apagats; quan tornin, és aquí.
- **Els fitxers antics** (2.1.0, `sequence`, esquema 2) passen per `pictogramFromLegacy` abans de
  `documentToV3`. Les deu fixtures antigues continuen donant la mateixa targeta.
- **L'esborrany** porta `pictogramModel: "retouches"`. Un esborrany sense la marca es converteix en
  obrir-lo (`restoreDraftDocumentThunk`) amb l'estil del document en aquell moment, i el desat
  següent ja el reescriu amb la marca: no es converteix mai dues vegades.
- **D1, quan neix el document**: les preferències es llegeixen del navegador en arrencar, i el
  document nou en rep la còpia (`NewDocumentStyleSync`, `documentStyleAdopted`) quan s'ha resolt
  l'esborrany, com la disposició. També en reben un esborrany d'abans sense estil propi (amb el meu
  estil d'ara: no hi ha manera de saber el de quan es va fer, §3.3) i cada document que es comença
  de nou. **Queda obert**: amb els comptes tornats, si les preferències del compte arriben després
  que el document hagi nascut, el document es queda amb les del navegador. Cal mirar-ho quan es
  tornin a encendre (B33).
- **`style.name`** es llegeix i s'escriu ja en aquest pas (Redux: `styleName`), perquè D1 el
  necessita; la resta de camps del pas 4 (`sequences[].title`, `sequences[].namedStyle`) no s'han
  tocat. Clau nova: `features.sequence.style.myStyleName`, en els cinc idiomes.
- **«Desa el document»** (`ModalDownload.tsx`) ja no hi escriu l'estil (el document el té des que
  neix), però continua escrivint-hi la pàgina i l'autor, que segueixen les preferències fins que es
  desa (fonament 03, §7).
- **Proves**: `features/sequence/style/pictogramStyle.test.ts` (les de §3.4). La fixture 15, escrita
  a mà, no porta `variants` ni `alternatives`, i l'app els escriu explícits (com abans): d'aquella
  es comparen els retocs; les 16–19 fan el viatge idèntic.
- **e2e** (Playwright, `draft-restore`, `pictogram-customized`, `card-text-edit`, `saac-v3`,
  `pictogram-actions`, `download-and-status`, `document-style-panel`): 32 de 35 passen. Les tres que
  fallen (`pictogram-customized` «la marca no surt a la vista…», `saac-v3` «un document antic ho
  diu…» i «un estil obert com a document…») ja fallaven igual sense aquests canvis, en aquest entorn.
  Les captures de la previsualització d'`document-style-panel` coincideixen abans i després.

---

## 4. La feature nova: estils per triar

### 4.1 El nom — D6, decidit: «Galeria d'estils»

- La col·lecció és la **Galeria d'estils**. Cada estil, pel seu nom («Contorn gruixut», «Text a
  dalt, en majúscules»…). Dins, dos grups: **«El meu estil»** (o «Els meus estils» amb comptes,
  B33) i els estils de l'app (nom del grup per decidir en escriure els textos: «De l'app»,
  «Proposats»…).
- L'acció del menú del bloc: **«Tria un estil…»** (obre la galeria). El nom final, amb els textos.
- **Prohibit**: «tema» (fonament 03 §1: només clar/fosc) i «plantilla» (és de la pàgina: «Tria
  una plantilla»). Fer-les servir faria creure que un estil canvia la pàgina. «Predeterminat»
  tampoc: es confon amb «per defecte», el nom vell d'El meu estil.
- Cal provar «galeria d'estils» en els cinc idiomes abans d'escriure les claus, perquè «estil» i
  «plantilla» no es confonguin en cap (vegeu C30, que va passar amb «pantalla completa»).

### 4.2 Què porta un estil — D7, decidit: fix, i «Fes-lo el meu estil»

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

### 4.3 On s'aplica i com — D2 i D8, decidit: només a un bloc

> **⚠️ Superat per §8.1**: l'estil també es tria a la **seqüència**, des de l'edició. El que
> segueix val per a l'estil d'un bloc a la vista.

- **Un estil s'aplica sempre a un bloc, i a un de sol.** No hi ha abast de pàgina ni de document.
  L'estil del document no el canvia cap acció de la interfície: neix amb El meu estil (D1) i és
  seu.
- **Una sola entrada**: «Tria un estil…» al menú «⋯» del bloc. Obre la galeria, amb la mostra de
  cada estil (la mateixa targeta d'exemple que la mostra d'«El meu estil», amb un pictograma del
  bloc si en té).
- **La primera opció de la galeria és «L'estil del document»** (substitueix «Treu l'estil de
  bloc», decidit 2026-11-20). Després, El meu estil, i després els de l'app. La que fa servir el
  bloc surt marcada.
- **Fora del menú de la pàgina**: «Aplica el meu estil» i «Actualitza amb el meu estil». **Fora del
  menú del bloc**: «Aplica el meu estil», «Actualitza amb el meu estil» i «Treu l'estil de bloc».
  «Restableix els pictogrames d'aquesta seqüència» es queda.
- **Sense grups invisibles**: aplicar un estil a un bloc mai no en canvia cap altre. Si dos blocs
  tenen el mateix estil, a `styles` comparteixen entrada (com ara, `sameNamedContent`), però és un
  detall del fitxer: canviar-ne un no toca l'altre.
- **El missatge** (D3): un snackbar amb Desfés que diu quin estil s'ha aplicat i, si n'hi ha,
  quants pictogrames conserven els seus retocs, amb **«Treu els retocs»**. Com que els retocs són de
  la seqüència, el text diu que canvien a tots els blocs on surt (la regla de B35).
- **Sense confirmació** (E18, decidit): n'hi ha prou amb Desfés, perquè l'abast és un sol bloc.

### 4.4 L'estudi — abans de fer la llista

Com l'estudi de plantilles (`docs/estudis/ESTUDI-treballs-amb-pictogrames.md`), un document a part,
`docs/estudis/ESTUDI-estils-de-targetes.md`, que respongui:

- Quines formes de targeta es fan de debò: amb vora o sense, gruix, cantonades, text a dalt o a
  baix, majúscules o minúscules, lletra escolar, numeració, color de Fitzgerald com a vora o com a
  fons, mida del text.
- On: l'entorn d'ARASAAC (materials publicats, AraWord, PictoSelector, Pictotraductor), escoles
  d'educació especial i CAA d'altres països (Boardmaker, TEACCH, PECS, les guies de colors de
  Fitzgerald i de Goossens).
- Quantes n'hi posem (proposta: **entre quatre i sis**; amb més, triar costa més que fer-se'l).
- **Un dels estils ha de ser «Sense vores»** (decidit per l'usuari el 2026-11-21): el pictograma
  sol, sense marc exterior ni interior. La targeta ja ho admet (vora de gruix 0,
  `PictogramCard.styled.ts`); cal comprovar com queda el text i el número sense vora, i que la
  mostra de la galeria es vegi bé damunt del full blanc.
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
| D2/D8: estils de bloc amb el nom de l'estil aplicat | Cap (el nom ja hi és) | — |
| E13: `styles` sense orfes en desar | Cap | Prova |
| Estils predefinits | Cap (es copien) | Les traduccions dels noms |
| `.saacstyle` d'un predefinit («Desa en un fitxer») | Cap | — |

---

## 6. Decisions

Preses el 2026-11-20.

| # | Pregunta | Decisió |
|---|---|---|
| D1 | Quan deixa un document nou de seguir El meu estil? | **Mai el segueix**: neix amb una còpia. Treu E4, E6 i E16 |
| D2 | «Aplica» i «Actualitza» acaben igual a la pantalla | **Una sola acció**, «Tria un estil…», i cap grup invisible. Fora «Actualitza» |
| D3 | Aplicar un estil ofereix treure els retocs? | **Sí**: el snackbar diu quants n'hi ha i ofereix «Treu els retocs», dient que canvien a tots els blocs on surt la seqüència |
| D4 | Com es fa visible l'estil del document? **⚠️ Substituïda per §10.1**: sense fila al nivell Document; és la primera opció de la galeria | **Una fila «Estil» al nivell Document de la columna, amb el nom** (camp `style.name`, §5). Amb D8, la fila **només informa**: vegeu Q2 |
| D5 | El color del vocabulari personal encén la marca «personalitzat»? | **Sí, i ho diu**: el tooltip i el nom accessible de la marca diuen «color del teu vocabulari» |
| D6 | El nom de la col·lecció | **Galeria d'estils** (§4.1) |
| D7 | Un estil de l'app es pot retocar? | **No**: és fix. «Fes-lo el meu estil» per partir-ne i retocar-lo a la configuració. Mai porta distribució ni pàgina |
| D8 | On s'aplica un estil | ~~**Només a un bloc**, d'un en un. Ni pàgina ni document~~ **⚠️ Superat per §8.1**: a la seqüència (des de l'edició) i al bloc (a la vista, només aquell bloc). Ni pàgina ni document |
| — | «Treu l'estil de bloc» | **Passa a ser la primera opció de la galeria**, «L'estil del document» |
| E18 | Confirmació abans d'aplicar | **No**: n'hi ha prou amb Desfés |
| D9 | La notícia N-2 | **Cal canviar-ne el títol**: amb D8, l'estil ja no va «a tot el document d'un cop». Es reescriu al pas 9 |

### Qüestions obertes que surten de D8

> **⚠️ Superat en part per §8.1**: Q1 queda gairebé resolta (l'estil es tria a la seqüència); Q2
> continua oberta; Q3 continua valent.

- **Q1 — Les pàgines simples no tenen blocs amb menú.** Un document fet abans del mode de pàgines,
  o qualsevol pàgina «Simple», no té cap menú «⋯» de bloc. Amb D8, en aquestes pàgines **no es pot
  triar cap estil**. Opcions: (a) acceptar-ho, i per triar estil cal passar la pàgina a columnes,
  files o lliure; (b) donar a cada seqüència d'una pàgina simple el seu menú «⋯» (és el
  «Pendent del pas 8» del pla del mode lliure, que ja ho deixava obert); (c) a les pàgines simples,
  «Tria un estil…» al menú de la pàgina i s'aplica a totes les seves seqüències. **Proposta: (b)**,
  perquè ja era pendent i és el mateix menú que els blocs.
- **Q2 — Canviar l'estil d'un document sencer ja fet.** Amb D1 i D8, un document que ja té estil
  propi (el d'un altre, o el meu de fa un mes) només canvia bloc a bloc. Per a un document gran
  són molts clics. Opcions: (a) acceptar-ho per a aquesta release i apuntar-ho al backlog; (b) que
  la fila «Estil» del nivell Document (D4) tingui «Canvia…», que és l'única excepció a D8.
  **Proposta: (a)**, i mirar-ho amb usuaris després de la release.
- **Q3 — Els blocs comuns** («A totes les pàgines») tenen menú propi i se'ls pot triar estil com a
  qualsevol bloc. Cal comprovar que la galeria s'obre també des d'ells i que el missatge diu que
  canvia a totes les pàgines.

## 7. Ordre dels passos

> **⚠️ Substituït per §10** (2026-11-21): l'ordre dels passos és el de §10.3. Es conserva només
> per explicar d'on surt; d'aquí, continua valent que **la solució A va primer**.

1. **Actualitzar el fonament 03** (§1 vocabulari, §5 accions, §6 marca, §7 documents nous) i la
   decisió 24 de l'ADR-005 amb D1–D9, **abans** del codi: mana el fonament. Decidir Q1–Q3.
2. **Solució A** (§3), sola, amb les seves proves. És un canvi de model sense canvi de pantalla
   (excepte que E1 deixa de passar). Inclou E3, E12, E14 i la lectura dels esborranys vells.
3. **D1**: el document nou amb estil propi des que neix. Treu E4, E6 i E16.
4. **L'estudi** d'estils de targetes (§4.4), en paral·lel amb 2 i 3.
5. **La galeria al menú del bloc** («Tria un estil…»), amb «L'estil del document» i El meu estil
   (D2, D3, D8). Treu «Aplica el meu estil», «Actualitza amb el meu estil» i «Treu l'estil de bloc»
   dels menús de pàgina i de bloc. E5, E7, E13. Q1 i Q3, segons el que s'hagi decidit.
6. **L'estil del document visible** a la columna (D4), amb el nom. E9; revisar E11.
7. **Els estils de l'app** dins de la galeria (D6, D7), amb els resultats de l'estudi, i «Fes-lo el
   meu estil».
8. **Textos i vocabulari** (E10, E15, D5): revisar totes les claus de `features.freeLayout.*`,
   `features.sequence.style.changed.*`, `components.pictEdit.*` i `components.defaultSettings.*` en
   els cinc idiomes, i el text d'ajuda d'«El meu estil» (`components.defaultSettings.panelHint`), que
   parla del menú de la pàgina.
9. **La notícia N-2** (D9): títol nou, passos nous i captures, i actualitzar `docs/plans/PLA-noticies.md`.

Normes de cada pas: `npm run typecheck` net i tests passant; textos a `packages/i18n/messages/`
en els cinc idiomes; cap color fora de `palette.ts`; `ConfirmDialog` i `AppDialog` per a les
capes; tota acció acaba amb un missatge.

---

## 8. Revisió del 2026-11-21: l'estil va amb la seqüència i el bloc, i la pantalla d'edició nova

> **Estat**: idees de l'usuari, recollides tal com les ha explicat. Les preguntes s'han respost i
> el pla d'execució és **§10**, que mana sobre aquesta secció. Aquesta revisió **mana
> sobre D8 i sobre Q1–Q3** (§6) allà on es contradiuen.

### 8.1 Els estils van amb la seqüència i amb el bloc

Paraules de l'usuari: «Els estils aniran amb les seqüències/bloc».

- **Des de la pantalla d'edició** es podrà **aplicar un estil a una seqüència** (de la Galeria
  d'estils) i **posar-li nom**. Quan la seqüència es posa a la vista, el bloc **ensenya aquest
  nom**.
- **A la vista**, cada bloc ensenya **el nom de l'estil** que fa servir, i es pot canviar. El
  canvi és **només d'aquell bloc**. Exemple de l'usuari: la mateixa seqüència en dos blocs, un dels
  quals és comú; al comú es pot canviar la mida i l'espai (ja es fa, és la distribució del bloc) i
  també l'estil, i **només canvia aquell bloc**, no tots dos.
- Per tant, la cascada passa a ser: **document → estil de la seqüència → estil del bloc →
  pictograma**. L'estil de la seqüència és el que reben tots els seus blocs mentre no en triïn un
  altre.

**Què canvia respecte del que hi havia decidit**:

- **D8** («només a un bloc») s'amplia: també a la **seqüència**, des de l'edició.
- **Fonament 03, §4**: avui el nivell «Seqüència» porta **només `view`** (la distribució). Ara
  portarà també estil (o una referència a un estil amb nom). Cal revisar el fonament i el format
  (fonament 06, §1; `docs/schema/saac-v3.schema.json`, `sequences[].style`) abans del codi.
- **Q1** (pàgines simples sense menú de bloc) queda **resolta en gran part**: l'estil es tria a la
  seqüència, des de l'edició, i una pàgina simple el pinta.
- **Q2** (canviar l'estil d'un document sencer) **continua oberta**: ara són tants clics com
  seqüències, no com blocs.
- **E11** (l'edició i la vista no ensenyen el mateix) **millora**: l'edició ensenya l'estil de la
  seqüència. Continua passant quan un bloc en tria un altre.
- **D4** (l'estil del document visible): cal tornar-hi. Si cada seqüència ensenya el seu estil,
  potser l'estil del document només és el de partida de les seqüències noves.

**El nom de la seqüència ja existeix al format**: `sequences[].title` és a l'esquema v3
(`saac-v3.schema.json`, i fonament 06 §1), però **Redux no el llegeix** (`toRedux.ts` només llegeix
`meta.title`, el títol del document). Cal comprovar si es conserva com a camp desconegut en desar,
o si avui es perd.

**Preguntes per al pla**:

- Si una seqüència no té nom, què ensenya el bloc a la vista? «Seqüència 1», com la pestanya?
- El nom de la seqüència **s'imprimeix** o és només per a qui edita? (Avui els rètols són blocs de
  text a part.)
- Canviar l'estil d'una seqüència a l'edició: què passa amb els blocs que ja n'havien triat un
  altre a la vista? Proposta per discutir: es queden amb el seu, perquè és un retoc del bloc.
- Com s'ensenya a la vista que un bloc té un estil **diferent** del de la seva seqüència?

**Una seqüència amb diversos estils** (afegit el 2026-11-21). Paraules de l'usuari: comptant que
una seqüència pot tenir pictogrames amb estils diferents, i que a la columna de la vista es podrà
aplicar a un bloc un estil diferent del de la seqüència, cal trobar una manera d'**indicar que hi
ha diversos estils**.

- **Els casos**, de més petit a més gran:
  1. Una seqüència amb **pictogrames retocats** (la marca «personalitzat», fonament 03 §6): l'estil
     de la seqüència és un, però no tots els pictogrames el segueixen.
  2. **Un bloc amb un estil diferent** del de la seva seqüència (§8.1).
  3. Tots dos alhora: un bloc amb estil propi i pictogrames retocats a dins.
- **On s'ha de veure**: al selector d'estil de la seqüència (edició), al del bloc (columna de la
  vista) i, potser, a la pestanya o el nom de la seqüència. Ha de ser **informatiu**, com la marca
  «personalitzat», i **mai** a la impressió, la pantalla completa ni el PDF.
- **Preguntes per al pla**: com es diu («Estil: Contorn gruixut + 3 retocats», «Diversos estils»,
  una marca al costat del nom…)? Des d'aquella indicació es pot arribar a «Restableix els
  pictogrames d'aquesta seqüència» o a «Treu els retocs» (D3)? Quan un bloc té estil propi, el
  selector de la seqüència a l'edició ho ha de dir («a la pàgina 2 surt amb un altre estil»,
  E11)?

### 8.2 Carregar estils

Paraules de l'usuari: «com que donem la possibilitat de guardar, també de càrrega».

- Avui El meu estil es pot **desar** en un `.saacstyle` i **carregar** d'un fitxer
  (panell «El meu estil»), i obrir un `.saacstyle` pregunta «Fes-lo el meu estil».
- La idea nova: que des de la **Galeria d'estils** també es pugui **carregar un estil d'un fitxer**
  i aplicar-lo a una seqüència o a un bloc, i que un estil de la galeria es pugui **desar** en un
  fitxer.
- **Preguntes**: un estil carregat a la galeria, s'hi queda (com un tercer grup, «Carregats») o
  només s'aplica un cop? On es guarda (preferències del navegador; amb comptes, al núvol, B33)?

### 8.3 La pantalla d'edició nova, al mòbil

L'usuari l'explica **de moment per al mòbil**; l'escriptori, més endavant.

| Zona | Avui | Nou |
|---|---|---|
| **Dalt** | Les pestanyes de les seqüències (`TabsSequences`), amb els botons d'afegir i treure seqüència | **«Seqüència 1»**, el nom de la seqüència activa, **editable** al mateix lloc |
| **Dalt** (a decidir) | Les pestanyes diuen quantes seqüències hi ha | Una manera de saber **quantes seqüències** té el document i de **passar d'una a l'altra** |
| **Dalt** (a decidir) | — | Una manera de **triar l'estil de la seqüència** (la Galeria d'estils, §8.1) |
| **Baix** | El camp de cerca de pictogrames és a dalt (`EditSequencesPage`, `PictogramAmount`, `MagicSearch`) | **El camp de cerca baixa a baix**, amb la **cerca màgica** (`MagicSearch`) al costat de la icona de l'estat del document (`DocumentStatusFab`) |
| **Baix a l'esquerra** | — | El **«+»** de sempre, que obre un **panell de baix** per **afegir un pictograma** o **una seqüència** |

**Peces d'avui que hi entren** (per al pla): `apps/web/src/pages/EditSequencesPage/`,
`components/TabsSequences/`, `components/PictogramAmount/`,
`features/pictogram/components/MagicSearch/`, `features/sequence/components/DocumentStatusFab/` i
`components/AppBottomSheet/` (l'únic panell de baix de l'app; no és modal, i cap funció pot
dependre d'arribar a sencer).

**Preguntes per al pla**:

- El panell del «+» és `AppBottomSheet` (que avui és el dels ajustos de la vista) o un menú? Què
  hi ha exactament: afegir un pictograma (buit? per cerca?), afegir una seqüència… i res més?
- Com es passa de seqüència: lliscar, fletxes, un selector amb la llista, punts com un carrusel?
  (La vista al mòbil ja passa de pàgina lliscant: convé que s'hi assembli.)
- Amb el camp de cerca a baix, què passa quan surt el teclat del mòbil?
- On van «Treu aquesta seqüència» i les accions que avui són a les pestanyes?
- L'escriptori: es queda com ara fins que l'usuari l'expliqui, o es fa el mateix?
- Abans del codi: **un esbós** com els de la vista al mòbil (`docs/esbossos/esbos-vista-mobil.html`) i les
  captures d'avui per comparar.

### 8.4 Lligams amb altres plans

- **`docs/plans/fets/PLA-mode-lliure.md`** (tancat): el que en quedava obert ve a §8.5.
- **`docs/plans/fets/PLA-vista-mobil.md`**: el patró del panell de baix i el lliscar per passar de pàgina.
- **`docs/plans/PLA-noticies.md`**: la N-2 continua aturada; amb aquesta revisió, canvia encara més.
- **`docs/BACKLOG-ux.md`**: B37 (aquest pla), C1 (botons que només es diuen amb el hover; al
  mòbil no n'hi ha), C28 (girar el mòbil tanca el diàleg d'edició).

### 8.5 Heretat del mode lliure (2026-11-21)

El pla del mode lliure es tanca i aquest pla n'absorbeix dues coses, perquè totes dues toquen
l'estil del bloc o la columna que aquest pla redissenya.

**L'estil d'un bloc a la columna de la vista** (era «Estil i contingut dels blocs», punt 1, de §13
del pla del mode lliure; mai no es va escriure). La idea de l'usuari era: si la columna parla de
disposició i distribució, també ha de poder parlar d'**estil**, amb la **lletra**, el **color del
text** i el **color de fons** d'un bloc, com a retoc del bloc (com la mida i la negreta dels
rètols). Es trepitja amb §8.1: totes dues coses canvien l'estil d'un bloc.

- **Primera pregunta del pla d'execució**: com conviuen **l'estil triat de la galeria** (seqüència
  i bloc, §8.1) i **els retocs d'un bloc a la columna**? Què mana sobre què, què passa amb els
  retocs quan es tria un altre estil, i si cal que existeixin tots dos camins (cal evitar el duplicat
  que va obrir aquest pla, E5).
- **El fons del bloc s'imprimeix**: toca l'estàndard de colors (`docs/estandards/colors.md`; el
  que és damunt del full no s'adapta al tema) i el PDF.
- **Els blocs d'imatge** (el punt 2 d'aquell pla) **no** venen aquí: són contingut, no estil. Són
  **B38** del backlog.

**El «Pendent del pas 8»** del pla del mode lliure (§13). Es va ajornar perquè la columna havia de
canviar i calia documentar-la una sola vegada; aquest pla és el que la canvia:

- **Les peces a prova, a l'estàndard** (`docs/estandards/configuracions.md`, «Components
  compartits»): `SettingsLevel` (targeta amb vora, excepció a C8), `SettingsLevels` i la línia de
  la cascada, `LevelCrumbs` (C7) i l'etiqueta de la disposició. Decidir si passen tal com són.
- **Treure l'etiqueta «Nou»** de la fila «Disposició» (proposta: amb la notícia N-1).
- **Les pàgines simples no tenen menú de seqüència**: amb §8.1 (l'estil es tria a la seqüència,
  des de l'edició) queda en part resolt; cal decidir si «Restableix els pictogrames d'aquesta
  seqüència» hi ha d'arribar.
- **Revisar els textos** d'ajuda de la columna i de la configuració que encara parlin de «vista» en
  el sentit antic (la pàgina «Vista» sí que es diu així).

## 9. Encàrrec per obrir la sessió següent

> **✅ Fet** (2026-11-21): les preguntes s'han fet i el pla d'execució és §10.

> Branca: **`estils-seqüencia-i-edicio`**, sortida de `master` després del PR #310 (2026-11-21).
>
> La tasca d'aquesta sessió és **fer el pla d'execució**, no el codi. Llegeix primer aquest
> document sencer, en especial **§8** (la revisió del 2026-11-21, que mana sobre D8 i Q1–Q3) i §3
> (la solució A, que ja està decidida i és el primer pas de codi). Després el fonament 03 (§1, §4,
> §5, §6 i §7), el fonament 06 (§1, el format de les seqüències), la decisió 24 de l'ADR-005,
> `docs/plans/fets/PLA-vista-mobil.md` (el patró del panell de baix) i, abans de dissenyar res,
> `docs/estandards/configuracions.md`, `navegacio.md` i `capes-flotants.md`.
>
> Fes-me **les preguntes de §8.1 (també «Una seqüència amb diversos estils»), §8.2, §8.3 i §8.5
> abans d'escriure el pla** (la primera, la de §8.5:
> l'estil de la galeria i els retocs del bloc a la columna), d'una en una o en grups
> petits. Després escriu el pla: l'ordre dels passos (la solució A primer), què canvia al
> fonament i al format a cada pas, l'esbós de la pantalla d'edició al mòbil i les proves.
>
> Normes: `npm run typecheck` net i tests passant; textos a `packages/i18n/messages/` en els cinc
> idiomes; cap color fora de `palette.ts`; si canvia el format `.saac` o `.saacstyle`, esquema,
> fixture i fonament 06. Entorn: cal `npm ci` a l'arrel; per a Playwright,
> `launchOptions.executablePath: "/opt/pw-browsers/chromium"`. **`master` està protegida**: s'hi
> arriba amb una PR i el control de GitGuardian.

---

## 10. Pla d'execució (2026-11-21)

> **Estat**: aprovat per l'usuari a la sessió del 2026-11-21. **Substitueix §7.** Les decisions
> d'aquesta secció (D10–D21) manen sobre §0–§8 allà on es contradiuen; de §0–§7 continua valent
> el que diu la nota del capdamunt.

### 10.1 Decisions de la sessió

Preses a partir de les preguntes de §8.1, §8.2, §8.3 i §8.5.

| # | Pregunta | Decisió |
|---|---|---|
| D10 | §8.5: com conviuen l'estil de la galeria i els retocs del bloc a la columna? | **Un bloc de seqüència té un sol estil**: el de la seva seqüència o un que se li **reassigna** de la galeria. **No hi ha retocs d'estil del bloc** (lletra, color del text, fons): no hi ha dos camins per a la mateixa cosa (E5). |
| D11 | Què pot retocar un bloc de seqüència a la columna en aquesta release? | **Res més que la distribució**, que ja té. La lletra, el color del text i el fons del bloc se'n van al backlog (**B39**). |
| D12 | D'on s'obre la galeria per a un bloc? | **De la columna i del menú «⋯» del bloc**: una fila «Estil» al nivell Bloc, amb el nom i «Canvia…», i «Tria un estil…» al «⋯». Totes dues obren la mateixa galeria i fan la mateixa acció. |
| D13 | Què s'ensenya quan una seqüència o un bloc té pictogrames retocats? | En lloc del nom de l'estil surt **«Personalitzat»**, amb la **mateixa marca** que els pictogrames (fonament 03 §6), i una ajuda (icona d'ajuda amb tooltip) que diu què vol dir i quin és l'estil de base. Lliga les dues coses amb un sol símbol. |
| D14 | E11, redefinit: com se sap que un bloc no té l'estil de la seva seqüència? | A la fila «Estil» del bloc, una **marca de «reassignat»** (diferent de la de «Personalitzat») i un botó **«Torna a l'estil de la seqüència»**, que treu la reassignació. L'edició no avisa dels blocs reassignats: la marca és al bloc, que és on es va fer. |
| D15 | Canviar l'estil d'una seqüència quan algun bloc en té un de reassignat | **El bloc reassignat es queda el seu.** El snackbar de l'edició ho diu: «_n_ blocs tenen un altre estil i no han canviat». |
| D16 | Una seqüència sense nom; s'imprimeix el nom? | Sense nom surt **«Seqüència _N_»**, com la pestanya d'avui. El nom **no s'imprimeix**: és per a qui edita (edició, columna, menús, galeria). Per imprimir un títol hi ha els blocs de text. |
| D17 | §8.2: un estil carregat d'un fitxer, es queda a la galeria? | **No**: «Carrega d'un fitxer…» l'aplica a la seqüència o al bloc i prou. Per tenir-lo sempre, «Fes-lo el meu estil». Un grup «Carregats» seria cosa de B33 (comptes). |
| D18 | §8.2: què es pot desar en un fitxer des de la galeria? | **Qualsevol estil** (El meu estil, el del document i els de l'app): «Desa en un fitxer» en fa un `.saacstyle`. El format no canvia. |
| D19 | §8.3: com es passa de seqüència al mòbil i com se sap quantes n'hi ha? | **Lliscant** sobre la graella (com la vista al mòbil), amb **«2 de 5»** al costat del nom, que obre la llista de seqüències. Fletxes ‹ › com a alternativa a lliscar (accessibilitat). |
| D20 | §8.3: el «+» de baix a l'esquerra | **Un menú curt** que s'obre cap amunt: «Afegeix un pictograma» i «Afegeix una seqüència». No és `AppBottomSheet`, que continua sent només dels ajustos. |
| D21 | §8.3: on van «Treu aquesta seqüència» i l'estil de la seqüència | **Menú «⋯» al costat del nom**: «Estil: _nom_ — Canvia…», «Canvia el nom», «Restableix els pictogrames» i «Treu aquesta seqüència» (amb `ConfirmDialog`). Es treu **la seqüència oberta**, no l'última. |
| D22 | §8.3: el teclat del mòbil amb la cerca a baix | **La barra de baix puja amb el teclat** (viewport visible, `useVisibleViewport`), i els suggeriments s'obren cap amunt. |
| D23 | §8.3: l'escriptori | **A decidir després de l'esbós** (pas 7 de §10.3). L'usuari s'inclina per la pantalla nova a totes les mides, però vol poder comparar-la: (a) la pantalla nova a totes les mides, (b) la nova com a vista alternativa durant un temps, o (c) un pla a part. Fins aleshores, l'escriptori conserva les pestanyes i rep el mateix «⋯» de la seqüència (pas 5 de §10.3), perquè l'estil s'hi pugui triar. |
| D24 | §8.5, «Pendent del pas 8»: peces a prova de la columna | `SettingsLevel`, `SettingsLevels` amb la línia de la cascada, `LevelCrumbs` i l'etiqueta de la disposició **passen a l'estàndard tal com són** (`docs/estandards/configuracions.md`). L'etiqueta «Nou» i la revisió dels textos de «vista» no s'han triat: no entren en aquest pla. |
| D25 | E1 de l'esbós (§15.1): la línia «Estil: …» sota la capçalera de l'edició al mòbil | **No hi és**: l'estil ja es veu a les targetes. Al seu lloc, un **botó d'estil al costat del nom** (icona de paleta), que obre la Galeria d'estils. Si algun pictograma té retocs, el botó porta la **marca de «Personalitzat»** (D13). El nom de l'estil va al nom accessible i al tooltip. El «⋯» continua portant «Estil: _nom_ — Canvia…». Decidit el 2026-11-22. |
| D26 | E2 / D23: l'escriptori | **(b)**: la pantalla nova com a **vista alternativa durant un temps**, al costat de les pestanyes de sempre. Com s'hi passa i quan s'acaba el temps, al pas 10 (Q4). Decidit el 2026-11-22. |
| D27 | E3: la cerca màgica | **Dins del camp de cerca** (✨), a la barra de baix. Decidit el 2026-11-22. |
| D28 | E4: el mòbil girat | L'edició **funciona girada**, amb més columnes a la graella: no porta la capa de «posa el mòbil dret» (`RotatePhoneOverlay`) que porta la vista. Decidit el 2026-11-22. |
| D29 | El «+» de la barra de baix (D20) | ~~Sense «+»~~ **Revertida el mateix dia**: era un malentès (la proposta de treure un menú es referia al «⋯»), i finalment l'usuari va triar deixar-ho tot com era. **D20 continua valent**: el «+» hi és, amb «Afegeix un pictograma» i «Afegeix una seqüència», i el «⋯» de la seqüència es queda. 2026-11-22. |
| D30 | Pas 3: quins estils de l'app van a la galeria (§6 de `docs/estudis/ESTUDI-estils-de-targetes.md`) | **Quatre**: Sense vores, Color de la categoria, Per retallar i Passos numerats. **Sense** «Lletra d'escola» (depèn de l'idioma) ni «Lletra gran i clara» (tret el mateix dia: amb Atkinson Hyperlegible a tots, s'assemblava massa a «Per retallar»). Decidit el 2026-11-22. |
| D31 | Pas 3: què porta un estil de l'app | **Tot el que es pot configurar a El meu estil** (D7 confirmada): un estil de l'app és complet i fix. **Tots porten Atkinson Hyperlegible** (text i número). Decidit el 2026-11-22. |
| D32 | Aplicar un estil a una seqüència (o un bloc) que té pictogrames retocats | ~~Es pregunta abans~~ **Revisada el mateix dia: no es pregunta.** L'estil s'aplica i els pictogrames retocats conserven els seus retocs (solució A, com ja fa el pas 5); **D3 continua valent**: el snackbar diu quants en conserven, amb Desfés i «Treu els retocs». Per treure la personalització n'hi ha prou amb el que ja hi ha: «Treu els retocs» del snackbar, «Restableix els pictogrames» del «⋯» de la seqüència i «Restableix l'estil» de cada pictograma. 2026-11-22. |
| D33 | Treure la personalització d'un pictograma | **Queda amb l'estil de la seva seqüència** (o del bloc, si en té un de reassignat), no amb el del document. És el que ja fa el codi (solució A i cascada del pas 4), comprovat amb la fixture 20 el 2026-11-22. Els textos que diuen «torna a l'estil del document» (la descripció de `components.mouseActionList.resetStyle` i l'ajuda d'El meu estil) es corregeixen al pas 12. |
| D34 | Q4: com es passa a la pantalla d'edició nova a l'escriptori, i quan es retira la vella | Un **interruptor a l'edició** («Prova l'edició nova» / «Torna a l'edició d'abans»), recordat **en aquest navegador** com a preferència d'interfície: no entra al document ni va al compte. La vella **es retira quan ho decideixi l'usuari**, sense data (B42). Decidit el 2026-11-22. |

**Què queda superat**:

- **D4** (fila «Estil» al nivell Document): **substituïda**. L'estil del document és l'estil de
  partida de les seqüències noves; es veu com la **primera opció de la galeria** («L'estil del
  document», amb el seu nom) i al nom de l'estil de cada seqüència que no n'ha triat cap. No hi ha
  fila al nivell Document.
- **§4.3**: «Tria un estil…» ja no és l'única entrada (D12), i la galeria també serveix la
  seqüència. La primera opció del bloc ja no és «L'estil del document», sinó **«L'estil de la
  seqüència»** (D14); la de la seqüència sí que és «L'estil del document».
- **Q1**: resolta. L'estil es tria a la seqüència, i una pàgina simple el pinta. «Restableix els
  pictogrames» arriba a tothom des del «⋯» de la seqüència a l'edició (D21).
- **Q2**: continua oberta, i ara són tants clics com seqüències. Es mira amb usuaris després de la
  release.
- **Q3**: continua valent (pas 6 de §10.3).

### 10.2 El model resultant

**La cascada** (fonament 03 §4):

```
document → estil de la seqüència → (si el bloc en té un de reassignat, aquest en lloc del de la seqüència) → pictograma
```

- L'estil de la seqüència i el reassignat d'un bloc són **estils amb nom** (`styles`), copiats de la
  galeria (direcció única, decisió 23 de l'ADR-005). El reassignat **substitueix** el de la
  seqüència, no s'hi suma: un bloc té un sol estil (D10).
- Cap nivell intermedi no té retocs propis d'estil: només el document (sencer), els estils amb
  nom (retocs del document, com ara) i els pictogrames (solució A).
- La distribució (`view`) no canvia: seqüència → bloc, com ara.

**El format** (fonament 06 §1 i §1.2; `docs/schema/saac-v3.schema.json`):

| Camp | Nou? | Què és |
|---|---|---|
| `sequences[].namedStyle` | **Nou**, opcional | L'`id` de l'estil amb nom de la seqüència. Sense valor, l'estil del document |
| `page…blocks[].namedStyle` | Ja hi era | Ara vol dir «reassignat»: substitueix el de la seqüència. Als documents d'avui cap seqüència no en porta, i per tant es pinten igual |
| `sequences[].title` | Ja hi era (esquema v3) | El nom de la seqüència. Avui Redux no el llegeix però es conserva com a camp desconegut (`SEQUENCE_KEYS` de `toRedux.ts` no el porta). Passa a ser un camp conegut |
| `style.name` | **Nou**, opcional | El nom de l'estil del document (D4 b, §5): el de l'estil del qual surt («El meu estil», «Sense vores»…) |

- **No cal pujar `schemaVersion`**: tots dos camps són opcionals i una versió anterior els
  conserva com a desconeguts. Una versió anterior pinta la seqüència amb l'estil del document (es
  veu diferent, no es perd res), com ja passa amb les pàgines.
- `.saacstyle`: no canvia. Ja porta `meta.title`, que és el nom de l'estil.
- Fixture nova: `20-estil-de-sequencia.saac` (seqüència amb estil, bloc reassignat, seqüència
  amb nom, `style.name`).

### 10.3 Els passos

Normes de tots els passos: `npm run typecheck` net i tests passant; textos a
`packages/i18n/messages/` en els cinc idiomes; cap color fora de `palette.ts`; només `AppDialog`,
`AppFullScreenDialog`, `ConfirmDialog` i `AppBottomSheet` com a capes; tota acció acaba amb un
missatge i es pot desfer amb el desfer de sempre. Cada pas és una PR a `master`.

**Pas 1 — Fonaments, abans del codi.** ✅ **Fet** (2026-11-21): fonament 03 (§1, §2, §3, §4, §5, §6,
§7), fonament 06 (§1, §1.2, §5, §6), esquema i **ADR-006**, que substitueix la part d'estils de les
decisions 23 i 24 de l'ADR-005. Els fonaments porten una nota que diu que descriuen el model cap on
va el codi. Fonament 03: §1 (vocabulari: «estil de la seqüència»,
«reassignat», «Personalitzat» per a seqüència i bloc; E10), §3, §4 (la cascada nova), §5 (les
accions noves i les que se'n van), §6 (la marca a la fila «Estil» i l'ajuda), §7 (D1: el document
neix amb una còpia d'El meu estil i no el segueix). Fonament 06: §1 i §1.2 amb els camps de §10.2.
ADR nova que substitueixi la 24 en el que toca als estils de bloc.
Esquema `saac-v3.schema.json`. **Cap codi.**

**Pas 2 — Solució A (§3) i D1.** ✅ **Fet** (2026-11-21): com s'ha fet i què ha calgut afinar, a
§3.5. Tal com és a §3: E1, E2, E3, E12, E14, la lectura dels
esborranys vells amb versió. Amb D1, el document nou porta l'estil copiat des que neix (treu E4, E6
i E16), amb `style.name` = «El meu estil». Proves de §3.4.

**Pas 3 — L'estudi** d'estils de targetes (§4.4), en paral·lel als passos 2–5. ✅ **Fet** (2026-11-22):
`docs/estudis/ESTUDI-estils-de-targetes.md`. Revisat per l'usuari el mateix dia: quatre estils
(Sense vores, Color de la categoria, Per retallar, Passos numerats), tots amb Atkinson Hyperlegible
(D30–D33). Troballes: B40 i B41. Inclou **«Sense
vores»** (decidit) i la comprovació del text i el número sense vora. Surt
`docs/estudis/ESTUDI-estils-de-targetes.md` i s'afegeix a l'índex.

**Pas 4 — El format i el model de la seqüència.** ✅ **Fet** (2026-11-21): com s'ha fet i què queda
per al pas 5, a §12.1. Llegir i escriure `sequences[].title`,
`sequences[].namedStyle` i `style.name` (`toRedux.ts`, `serialize.ts`, `shared-types`). La
resolució de la cascada (`resolveStyle`, `cardMeasureKey`) amb el nivell de la seqüència i el
bloc reassignat que el substitueix. E13: en desar, `styles` només porta els estils que fa servir
alguna seqüència o algun bloc. Fixture 20 i viatge d'anada i tornada de totes les fixtures. Sense
canvi de pantalla.

**Pas 5 — La galeria i l'estil de la seqüència a l'edició.** ✅ **Fet** (2026-11-22): com s'ha fet i
què queda per al pas 6, a §13.1. La **Galeria d'estils** (`AppDialog`;
a pantalla completa al mòbil si ho diu `capes-flotants.md`) a `features/sequence/components/`, amb:
la primera opció (la de damunt: «L'estil del document» per a una seqüència, «L'estil de la
seqüència» per a un bloc), El meu estil, i el lloc dels estils de l'app (buit fins al pas 9); la
mostra de cada estil amb un pictograma de la seqüència; «Carrega d'un fitxer…» (D17), «Desa en un
fitxer» (D18) i «Fes-lo el meu estil» (D7). A l'edició, el **menú «⋯» de la seqüència** (D21) a la
pestanya activa, també a l'escriptori (D23), amb el nom editable (D16), l'estil i
«Personalitzat» amb la marca i l'ajuda (D13). Snackbar de D3 i de D15. «Treu aquesta seqüència»
treu l'oberta.

**Pas 6 — L'estil del bloc a la vista.** ✅ **Fet** (2026-11-22): com s'ha fet i què queda, a §14.1. La
fila **«Estil»** al nivell Bloc de la columna (amb
`SettingRow`), el nom, «Personalitzat» (D13), la marca de **reassignat** i «Torna a l'estil de la
seqüència» (D14). «Tria un estil…» al «⋯» del bloc (D12). **Fora** dels menús de pàgina i de bloc:
«Aplica el meu estil», «Actualitza amb el meu estil» i «Treu l'estil de bloc» (E5). Q3: la galeria
s'obre des dels blocs comuns i el missatge diu que canvia a totes les pàgines. Al mòbil, la fila
és al panell de baix de la vista (`AppBottomSheet`), com la resta de la columna.

**Pas 7 — L'esbós de la pantalla d'edició al mòbil.** ✅ **Fet** (2026-11-22), pendent de la revisió
de l'usuari: §15.1. `docs/esbossos/esbos-edicio-mobil.html`, com
`esbos-vista-mobil.html`, a partir de §10.4, amb les **captures d'avui** per comparar (Playwright,
amplada de mòbil). Inclou també l'amplada d'escriptori, perquè l'usuari decideixi D23. **L'usuari
el revisa abans del pas 8.**

**Pas 8 — La pantalla d'edició nova al mòbil.** ✅ **Fet** (2026-11-22): com s'ha fet, a §16.1. La capçalera (nom editable, el botó d'estil amb la
marca de «Personalitzat» (D25), «2 de 5», llista, «⋯»),
el lliscar entre seqüències amb fletxes ‹ › (D19), la barra de baix amb el «+» (D20), la cerca, la
cerca màgica dins del camp (D27) i `DocumentStatusFab`, que puja amb el teclat (D22). Funciona amb el
mòbil girat (D28). Les accions de
`PictogramAmount` (afegir i treure l'últim) se'n van: afegir és al «+», i treure un pictograma és a
la graella. Cobreix C1 (cap botó només amb hover) i C28 (girar el mòbil) per a aquesta pantalla.

**Pas 9 — Els estils de l'app a la galeria** (D6, D7), amb el que surti de l'estudi, «Sense vores»
inclòs. Els noms, traduïts; al document s'hi escriu el nom en l'idioma de qui l'aplica. ✅ **Fet** (2026-11-22): vegeu §17.1.

**Pas 10 — L'escriptori** (D23, decidit a D26: la pantalla nova com a vista alternativa durant un
temps). Queda per decidir (**Q4**): com es passa d'una vista a l'altra (un interruptor a l'edició?
desat com a preferència d'interfície, que no entra al document?) i quan es retira la vista vella. ✅ **Fet** (2026-11-22, amb D34): vegeu §18.1.

**Pas 11 — La columna a l'estàndard** (D24): `SettingsLevel`, `SettingsLevels`, `LevelCrumbs` i
l'etiqueta de la disposició a `docs/estandards/configuracions.md`, «Components compartits». ✅ **Fet** (2026-11-22): vegeu §19.1.

**Pas 12 — Textos i vocabulari**: com l'antic pas 8 de §7 (E10, E15, D5), més les claus noves
(«Personalitzat» per a seqüència i bloc, «reassignat», «Torna a l'estil de la seqüència»), provades
en els cinc idiomes, i el text d'ajuda d'«El meu estil» (`components.defaultSettings.panelHint`).

**Pas 13 — La notícia N-2** (D9): títol nou, passos i captures; `docs/plans/PLA-noticies.md`.

En tancar el pla: B37 resolta al backlog, Q2 apuntada al backlog si continua oberta, i el pla a
`plans/fets/`.

### 10.4 L'esbós de la pantalla d'edició al mòbil

És el punt de partida del pas 7, no el disseny final.

```
┌─────────────────────────────────┐
│ ☰  SequenciAAC            ⚙  👤 │  barra de l'app (no canvia)
├─────────────────────────────────┤
│ ‹  Matí ✎       2 de 5 ▾   ⋯  › │  nom editable · llista · menú de la seqüència
│    Estil: Contorn gruixut  ●ⓘ   │  ● = marca «Personalitzat» si n'hi ha (D13)
├─────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐           │
│  │ 1  │ │ 2  │ │ 3 ●│           │  la graella de sempre
│  └────┘ └────┘ └────┘           │  ← lliscar → canvia de seqüència
│  ┌────┐ ┌────┐                  │
│  │ 4  │ │ 5  │                  │
│  └────┘ └────┘                  │
│                                 │
├─────────────────────────────────┤
│ (+)  [ Cerca un pictograma… ✨ ] (⬤)│  + · cerca · cerca màgica · estat del document
└─────────────────────────────────┘
      ▲ puja amb el teclat (D22)

Menú del «+» (s'obre cap amunt):      Menú «⋯» de la seqüència:
  ▸ Afegeix un pictograma               ▸ Estil: Contorn gruixut — Canvia…
  ▸ Afegeix una seqüència               ▸ Canvia el nom
                                        ▸ Restableix els pictogrames
                                        ▸ Treu aquesta seqüència
```

- Objectius tàctils de 44 × 44 px com a mínim; les fletxes ‹ › també.
- La línia «Estil» pot anar a dins del «⋯» si l'esbós demostra que no hi cap: és a decidir en
  revisar-lo.

### 10.5 Les proves

| Pas | Proves |
|---|---|
| 2 | Les de §3.4; un document nou no canvia en canviar El meu estil (D1) |
| 4 | Fixture 20 d'anada i tornada; totes les fixtures iguals; una seqüència amb estil es pinta amb el seu estil i un bloc reassignat amb el seu; un document d'avui (sense `sequences[].namedStyle`) es pinta igual que abans; `styles` sense orfes; `sequences[].title` es llegeix i es desa |
| 5 | Triar un estil a la seqüència canvia tots els seus blocs no reassignats i no els reassignats (D15); el snackbar diu els retocs (D3) i els blocs que no han canviat; Desfés ho torna tot; «Personalitzat» surt només amb retocs; carregar d'un fitxer no deixa res a la galeria; desar un estil de l'app fa un `.saacstyle` vàlid; treure la seqüència oberta |
| 6 | Reassignar un bloc no toca l'altre bloc de la mateixa seqüència (l'exemple del bloc comú de §8.1); «Torna a l'estil de la seqüència»; les tres accions velles ja no hi són; la marca i «Personalitzat» no surten a la impressió, la pantalla completa ni el PDF |
| 8 | e2e a amplada de mòbil: lliscar i fletxes, «2 de 5» i la llista, el «+», el «⋯»; la barra visible amb el teclat (viewport visible simulat); objectius de 44 px |
| 9 | La mostra de cada estil de l'app, «Sense vores» inclòs, damunt del full blanc i en tots dos temes |
| Tots | `npm run typecheck` net; les captures dels e2e de la vista no canvien (amb la precaució de §13 del pla del mode lliure) |

## 11. Encàrrec per obrir la sessió següent (pas 2: la solució A)

> **✅ Fet** (2026-11-21): vegeu §3.5.

> Branca: **`estils-seqüencia-i-edicio`**. Es porta a `master` amb una PR **en acabar el pla**, no
> pas a pas (decisió de l'usuari, 2026-11-21). `master` està protegida (PR i GitGuardian).
>
> La tasca és el **pas 2 de §10.3**: la solució A (§3) i D1. **És codi.** Llegeix primer, per
> aquest ordre: §10.1 i §10.2 d'aquest document; §3 sencer (la regla, on es toca, la compatibilitat
> i les proves); el fonament 03, §2, §4, §6 i §7 (ja descriuen el model nou, amb la nota del
> capdamunt); el fonament 06, §1 i §4; i `docs/estandards/estat-i-persistencia.md` (l'esborrany
> d'IndexedDB).
>
> Comença per les proves de §3.4 que fallen avui (E1: un pictograma nou no hi escriu cap estil;
> E3: «sense text» explícit), i després el codi de la taula de §3.2. Compte amb E3: `textPosition`
> buit ha de passar a voler dir «hereta», i `"none"` s'ha d'escriure sempre explícit. La versió de
> l'esborrany i la lectura dels vells (§3.3) són part del pas. D1: el document nou porta l'estil
> copiat des que neix, amb `style.name` = «El meu estil» en l'idioma de la interfície; treu la
> materialització de `ModalDownload.tsx`.
>
> **No** facis encara res del pas 4 (`sequences[].namedStyle`) ni de la galeria. Si trobes que §3
> no encaixa amb el codi d'avui, apunta-ho a §3 i pregunta abans de canviar el pla.
>
> Normes: `npm run typecheck` net i tests passant (`npm ci` a l'arrel si cal); les fixtures `.saac`
> han de fer el viatge d'anada i tornada iguals; textos a `packages/i18n/messages/` en els cinc
> idiomes; cap color fora de `palette.ts`. En acabar, marca el pas 2 com a fet a §10.3 i actualitza
> `docs/README.md` en el mateix commit.

## 12. Encàrrec per obrir la sessió següent (pas 4: el format i el model de la seqüència)

> **✅ Fet** (2026-11-21): vegeu §12.1.

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 4 de §10.3**: llegir i escriure `sequences[].title` i
> `sequences[].namedStyle` (`toRedux.ts`, `serialize.ts`, `shared-types`; `style.name` ja hi és,
> §3.5), la cascada amb el nivell de la seqüència i el bloc reassignat que el substitueix
> (`resolveStyle`, `cardMeasureKey`, i a Redux `styleWithNamed` i `cardDefaultsOf`, que ara ja són
> el lloc on es resol: la targeta no rep còpies), E13 (`styles` sense orfes en desar), la fixture
> 20 i el viatge d'anada i tornada de totes les fixtures. **Sense canvi de pantalla.** Llegeix
> primer §10.2, §3.5, el fonament 03 (§4) i el fonament 06 (§1 i §1.2).
>
> Normes: les de §11. No facis res de la galeria (pas 5) ni de la vista (pas 6). En acabar, marca
> el pas 4 com a fet a §10.3 i actualitza `docs/README.md` en el mateix commit.

### 12.1 Com s'ha fet (pas 4, 2026-11-21)

> El que el codi d'avui ha obligat a concretar respecte de §10.2. Cap d'aquests punts no canvia cap
> decisió ni el format del fitxer.

- **Redux**: dos camps nous de `DocumentSAAC`, per clau de seqüència com `sequenceIds`:
  `sequenceNames` (`sequences[].title`) i `sequenceStyleIds` (`sequences[].namedStyle`). Treure
  l'última seqüència n'esborra el nom i l'estil, i una de nova no en té. `title` i `namedStyle`
  passen a ser camps coneguts (`SEQUENCE_KEYS`); el lector descarta un `namedStyle` que apunta a un
  estil que no hi és, com ja feia amb els blocs.
- **Els esborranys d'abans** portaven el nom entre els camps desconeguts de la seqüència
  (`saacExtra.sequences[].title`): en obrir-los passa a `sequenceNames`
  (`withSequenceNamesFromExtras`, a `restoreDraftDocumentThunk`). `useSequenceName` llegeix el camp
  nou.
- **La resolució viu a `features/sequence/style/namedStyle.ts`**: `namedStyleOf` i
  `styleWithNamed` (abans a `blockStyle.ts`, que els reexporta), `cardNamedStyleOf` (el reassignat
  del bloc si existeix, si no el de la seqüència) i `sequenceStyleOf` (l'estil amb què es pinten els
  pictogrames d'una seqüència sense bloc). Al fitxer, `cascade.ts`: `styleWithNamedV3`,
  `sequenceStyleOfV3` i `resolveStyle(doc, seqüència, pictograma, bloc?)`.
- **L'estil de la seqüència no porta distribució**: el `view` d'un estil amb nom només es pinta
  quan és el reassignat d'un bloc (els estils de bloc d'abans en porten), com diu la taula del
  fonament 03 §4. Per això `resolveBlockView` i tot el que mira la distribució no han canviat.
- **On es pinten les targetes**: `useBlockLooks` i la mesura (`cardMeasureKey` amb l'estil que
  pinta, el de la seqüència inclòs), `cardSizeOf` (ara rep el document per saber-lo), la pàgina
  simple de la vista (`selectSequenceCardDefaults`) i l'edició (`selectActiveSequenceCardDefaults`
  i companyia: el formulari, el menú del pictograma, la cerca, enganxar i «el text no hi cap»). Una
  seqüència sense estil rep el mateix objecte que abans: els documents d'avui es pinten igual.
- **Els retocs dels pictogrames són respecte de l'estil de la seva seqüència**, en llegir
  (`pictogramToRedux`) i en desar (`pictogramToV3`), com diu el fonament 06 §1. Redux continua
  guardant sencers els objectes retocats (la lletra, les vores), resolts amb l'estil de la seqüència.
- **E13**: en desar, `styles` només porta els estils que fa servir alguna seqüència o algun bloc,
  també els blocs que l'app no entén (es tornen a escriure tal com eren, i el seu estil hi ha de
  ser). Redux no els treu: en desar, simplement no s'escriuen.
- **`shared-types` no s'ha tocat**: el núvol no passa per `serialize.ts` i l'API no guarda ni
  `styles`, ni `pages`, ni `styleName` (§3.5). El nom i l'estil de la seqüència hi arribaran amb la
  resta, quan es tornin a encendre els comptes (B33).
- **Proves**: `saac.test.ts` («l'estil de la seqüència (20)»), `namedStyle.test.ts` (Redux) i
  `blockStyle.test.ts` (`cardSizeOf`); la fixture 20 s'afegeix al viatge per Redux de
  `pictogramStyle.test.ts`. La 17 ara llegeix els noms de les seqüències com a camp conegut i fa el
  viatge igual.

**Queda per al pas 5** (no són errors d'avui: cap acció no posa encara un estil a una seqüència):

- El desfer de l'estil (`takeDocumentStyleSnapshot`) no porta `sequenceStyleIds` ni
  `sequenceNames`: triar l'estil d'una seqüència i canviar-ne el nom s'hi han d'afegir.
- Canviar l'estil d'una seqüència no toca els objectes retocats sencers dels seus pictogrames (una
  lletra retocada es queda amb la família de l'estil d'abans). És el mateix que passa avui en
  canviar l'estil del document, i el snackbar de D3 ha de comptar-los igual.
- «Aplica a tots» (`applyToAllPictogramsThunk`) porta el valor a l'estil del document: en una
  seqüència amb estil que defineix aquella propietat, no s'hi veuria. Cal decidir-ho amb la galeria.
- La marca d'«estil de bloc» del full (`PlacementBox`) mira només el reassignat: és el pas 6.

## 13. Encàrrec per obrir la sessió següent (pas 5: la galeria i l'estil de la seqüència a l'edició)

> **✅ Fet** (2026-11-22): vegeu §13.1.

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 5 de §10.3**: la Galeria d'estils i el menú «⋯» de la seqüència a l'edició
> (D12, D13, D15–D18, D21, D23), amb les proves de §10.5. **És codi i pantalla.** Llegeix primer
> §10.1, §10.3 (pas 5), §12.1 (sobretot «Queda per al pas 5»), §4, el fonament 03 (§5 i §6),
> `docs/estandards/capes-flotants.md` i `docs/estandards/configuracions.md`.
>
> El model ja hi és (§12.1): l'acció de triar un estil per a una seqüència escriu
> `sequenceStyleIds` i copia l'estil a `styles` (o en reaprofita un d'igual, com
> `applyNamedStyle`), i el nom, `sequenceNames`.
>
> Normes: les de §11. No facis res de la vista (pas 6). En acabar, marca el pas 5 com a fet a §10.3
> i actualitza `docs/README.md` en el mateix commit.

### 13.1 Com s'ha fet (pas 5, 2026-11-22)

> El que el codi d'avui ha obligat a concretar respecte de §10.3. Cap d'aquests punts no canvia cap
> decisió ni el format del fitxer.

- **La capçalera de la seqüència** (`features/sequence/components/SequenceHeader/`) va damunt de la
  graella de la seqüència oberta, a totes les mides (D23): el nom (amb un llapis per canviar-lo),
  «Estil: _nom_» o «Estil: Personalitzat» amb la marca de la targeta (`customizedMark`) i una
  ajuda (icona amb tooltip i el mateix text al nom accessible), i el «⋯». El nom es canvia en un
  `AppDialog` petit, no al lloc: l'edició en línia és cosa del pas 8, amb la capçalera del mòbil.
  Sense nom de l'estil (un document d'abans), «L'estil del document».
- **El «⋯»** porta «Estil: _nom_ — Canvia…», «Canvia el nom», «Restableix els pictogrames» (només
  si n'hi ha de retocats, com «Restableix l'estil» del pictograma) i «Treu aquesta seqüència»
  (només si n'hi ha més d'una, amb `ConfirmDialog` si té pictogrames). **El botó «Elimina l'última
  seqüència» de les pestanyes se'n va**: el substitueix aquesta acció.
- **Treure una seqüència qualsevol** (`removeSequence`, `utils/removeSequence.ts`): les claus són
  la posició de la pestanya, i en treure'n una les de després baixen una clau amb tot el que hi
  apunta (vista, nom, estil, `sequenceIds`, camps desconeguts, `order` i els blocs). La seqüència
  oberta passa a ser la que n'ocupa el lloc. Treure-la acaba amb un snackbar; com abans, no es
  pot desfer.
- **La galeria** (`features/sequence/components/StyleGallery/`) és un `AppDialog` d'amplada `sm`
  (una llista; no és un formulari d'ús freqüent, per això no és `fullScreenOnMobile`). Les
  opcions: «L'estil del document» (amb el seu nom a la segona línia), el grup «El meu estil» i el
  grup «Estils de l'app», que diu «Aviat n'hi haurà.» fins al pas 9. **Si la seqüència fa servir
  un estil que no és cap d'aquests** (un de carregat d'un fitxer, o un de la fixture 20), surt a
  dalt en un grup «El d'ara», marcat: sense, no es veia d'on es partia. Triar-lo no fa res.
  La mostra és el primer pictograma amb imatge de la seqüència **sense els seus retocs** (o un
  d'exemple si no en té cap), pintat amb cada estil. Cada estil té un «⋯» amb «Desa en un fitxer»
  (D18; `ModalDownload` rep ara l'estil i el nom que desa) i, si no és el meu, «Fes-lo el meu
  estil» (D7; `useSetDefaultStyle` sense la distribució, que un estil de la galeria no porta).
  «Carrega d'un fitxer…» és l'acció sola de l'esquerra del peu.
- **El nom del distintiu**: l'`AppDialog` té el distintiu per a un número (el del pictograma); el
  nom d'una seqüència hi quedava malament, i va en una línia sota el títol («Tria l'estil de
  «Matí».»), que és la descripció del diàleg.
- **L'acció** (`store/sequenceStyleThunks.ts`, `chooseSequenceStyleThunk`): copia l'estil amb
  `namedStyleFrom` i `addNamedStyle` (que ara viuen a `style/namedStyle.ts`, amb
  `uniqueStyleName` i `sameNamedContent`; `blockStyle.ts` els reexporta i `applyNamedStyle` fa
  servir el mateix camí), hi apunta la seqüència i **treu l'estil d'abans si ja no el fa servir
  ningú** (cap seqüència, cap bloc, cap bloc desconegut amb `namedStyle`): sense, canviar d'estil
  diverses vegades deixava còpies que feien sortir «El meu estil 2».
- **El desfer** porta ara `sequenceStyleIds` i `sequenceNames` (§12.1, «Queda per al pas 5»).
  Canviar el nom no és un canvi d'estil i no té «Desfés», però sí que fa que el canvi d'estil
  d'abans ja no es pugui desfer.
- **El snackbar** (D3 i D15) diu l'estil triat, quants pictogrames conserven els seus retocs i
  quants blocs tenen un altre estil i no han canviat, cada cosa en una frase amb el seu plural.
  Amb retocs, porta **«Treu els retocs»** al costat de «Desfés»; totes dues van sota el text (al
  costat, el text quedava en una columna d'una paraula al mòbil). «Treu els retocs» fa el mateix
  que «Restableix els pictogrames» i **el seu «Desfés» torna també l'estil d'abans**: l'usuari ho
  ha fet com una sola cosa (`removeSequenceRetouchesThunk`).
- **«Aplica a tots»** (`applyToAllPictogramsThunk`) no s'ha tocat: no és a la interfície des de R10,
  i la galeria no l'ha necessitat. Si torna, ha de saber que una seqüència amb estil no veu el que
  porta a l'estil del document.
- **Proves**: `store/sequenceStyle.test.ts` (triar, D15, el snackbar, «L'estil del document»,
  sense còpies, Desfés, «Treu els retocs», el fitxer, el nom, treure la seqüència del mig i el
  document que en queda) i `SequenceHeader.test.tsx` («Personalitzat» només amb retocs, la galeria
  des del «⋯», carregar d'un fitxer no deixa res a la galeria, treure l'oberta i canviar el nom).
  E2E: `destructive-actions` i `accessible-names` fan servir el «⋯» en lloc del botó que se'n va.

**Queda per al pas 6** (no són errors d'avui):

- La galeria només sap triar per a una seqüència (`sequenceKey`). Per al bloc, la primera opció és
  «L'estil de la seqüència» i l'acció és reassignar (D12, D14): cal donar-li un destí.
- `applyMyStyleThunk`, `updateMyStyleThunk` i `removeBlockStyleThunk` (i els seus orígens del
  snackbar) continuen vius per als menús de pàgina i de bloc, que el pas 6 treu (E5).
- `deleteLastSequence` ja no el fa servir la interfície; només les proves. Es pot treure quan es
  toquin.

## 14. Encàrrec per obrir la sessió següent (pas 6: l'estil del bloc a la vista)

> **✅ Fet** (2026-11-22): vegeu §14.1.

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 6 de §10.3**: la fila «Estil» al nivell Bloc de la columna, «Personalitzat»
> (D13), la marca de reassignat i «Torna a l'estil de la seqüència» (D14), «Tria un estil…» al «⋯»
> del bloc (D12), i fora dels menús de pàgina i de bloc «Aplica el meu estil», «Actualitza amb el
> meu estil» i «Treu l'estil de bloc» (E5). Q3 (els blocs comuns). Amb les proves de §10.5. **És
> codi i pantalla.** Llegeix primer §10.1, §10.3 (pas 6), §13.1 (sobretot «Queda per al pas 6»), el
> fonament 03 (§5 i §6), `docs/estandards/configuracions.md` i `docs/estandards/capes-flotants.md`.
>
> La galeria (`StyleGallery`) i el snackbar ja hi són: el bloc hi ha d'arribar com un altre destí.
>
> Normes: les de §11. En acabar, marca el pas 6 com a fet a §10.3 i actualitza `docs/README.md` en
> el mateix commit.

### 14.1 Com s'ha fet (pas 6, 2026-11-22)

> El que el codi d'avui ha obligat a concretar respecte de §10.3. Cap d'aquests punts no canvia cap
> decisió ni el format del fitxer.

- **La fila «Estil»** (`features/free-layout/components/ViewLevels/BlockStyleRow.tsx`) és la
  primera del nivell «Bloc» d'un bloc de seqüència, amb `SettingRow` i `control="block"` (el valor
  i dos botons no hi cabien al costat del títol a 350 px). Diu el nom de l'estil que pinta el bloc
  (el reassignat, o el de la seqüència, o el del document) o «Personalitzat» amb la marca de la
  targeta i la mateixa ajuda que la capçalera de l'edició (D13). Amb un estil reassignat, la
  **marca de reassignat** (`reassignedMark`, al costat de `customizedMark`: els mateixos colors i
  un quadrat en lloc d'una rodona, amb tooltip i nom accessible), el botó **«Torna a l'estil de la
  seqüència»** i una ajuda sota la fila que diu quin estil fa servir la seqüència (D14).
  «Canvia…» obre la galeria per a aquest bloc. Al mòbil va al panell de baix, com la resta de la
  columna, sense cap canvi.
- **Les pàgines simples d'un document sense pàgines** (el nivell «Seqüència» de la columna) no
  tenen fila «Estil»: no hi ha bloc a reassignar, i l'estil de la seqüència es tria a l'edició.
- **El menú «⋯» del bloc** porta **«Tria un estil…»** (només als blocs de seqüència; un rètol no té
  estil de pictogrames) i ja no porta «Aplica el meu estil», «Actualitza amb el meu estil» ni «Treu
  l'estil de bloc». **El de la pàgina** ja no porta cap acció d'estil (E5). Se'n van també els
  thunks (`applyMyStyleThunk`, `updateMyStyleThunk`, `removeBlockStyleThunk`), les funcions del
  model que només feien servir ells (`applyNamedStyle`, `targetStyleIds`, `updateNamedStyles`,
  `removeNamedStyle`), els seus orígens del snackbar i les seves claus de traducció.
- **La galeria** rep ara un destí (`GalleryTarget`: seqüència o bloc). Per a un bloc, la primera
  opció és **«L'estil de la seqüència»** (amb el nom de l'estil de la seqüència a sota), que fa el
  mateix que «Torna a l'estil de la seqüència»; un bloc reassignat a un estil que no és a la galeria
  (els «estils de bloc» d'abans) surt a dalt, a «El d'ara». La línia de sota el títol diu que només
  canvia aquell bloc. L'opció marcada diu «El fa servir aquest bloc» o «… aquesta seqüència».
- **L'acció** (`chooseBlockStyleThunk`, a `store/sequenceStyleThunks.ts`) copia l'estil com la de la
  seqüència, hi apunta el bloc (`withPlacementStyle`, a `blockStyle.ts`, que en conserva la
  distribució) i treu l'estil d'abans si ja no el fa servir ningú. **Q3**: un bloc comú canvia a
  totes les pàgines perquè és un sol bloc; el snackbar ho diu («…, a totes les pàgines.»). El
  snackbar porta «Treu els retocs» com el de la seqüència, i el text del resultat ja diu que canvia
  tots els blocs on surt la seqüència (D3).
- **Textos que enviaven a «Aplica el meu estil»**: l'ajuda del panell «El meu estil»
  (`components.defaultSettings.panelHint`) i la del diàleg d'un fitxer d'estil obert com a document
  (`features.sequence.style.styleFileOpened.body`) ara diuen la Galeria d'estils. El pas 12 els pot
  tornar a mirar.
- **«Aplica a tots»** continua sense tocar-se (§13.1).
- **Proves**: `sequenceStyle.test.ts` (reassignar només un bloc i conservar-ne la distribució,
  «Torna a l'estil de la seqüència» amb Desfés, el bloc comú), `BlockStyleRow.test.tsx` (la fila,
  la marca, tornar, «Canvia…» i «Personalitzat»), `ViewLevels.test.tsx` (el menú del bloc sense
  les accions velles i «Tria un estil…» fins a la galeria; el menú de la pàgina sense cap acció
  d'estil) i `blockStyle.test.ts` (`withPlacementStyle`). E2E: la prova de `saac-fixtures` que
  provava «Aplica el meu estil» ara tria el meu estil a la galeria des del «⋯» de la seqüència, a
  l'edició, i el desfà. Que la marca no surti al paper no necessita prova nova: la columna no hi
  arriba mai (`usePrintSheet`).

**Queda per a més endavant** (no són errors d'avui):

- **`e2e/screenshots/my-style-focused.spec.ts` queda trencada**: fa les captures de la notícia N-2
  amb «Aplica el meu estil» i «Actualitza amb el meu estil», que ja no hi són. El pas 13 refà la
  notícia, els passos i les captures; s'hi ha de reescriure (o treure) aquest spec.
- `deleteLastSequence` (§13.1) continua viu només per a les proves.

## 15. Encàrrec per obrir la sessió següent (pas 7: l'esbós de la pantalla d'edició al mòbil)

> **✅ Fet** (2026-11-22): vegeu §15.1.

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 7 de §10.3**: `docs/esbossos/esbos-edicio-mobil.html`, com
> `esbos-vista-mobil.html`, a partir de §10.4, amb les **captures d'avui** per comparar (Playwright,
> amplada de mòbil i d'escriptori, perquè l'usuari decideixi D23). **És un document, no codi.** La
> capçalera de la seqüència del pas 5 (§13.1: nom, estil, «⋯») és el punt de partida de la del
> mòbil. **L'usuari el revisa abans del pas 8**: en acabar, s'atura i ho diu.
>
> En paral·lel, i abans del pas 9: el **pas 3** (l'estudi d'estils de targetes, §4.4).
>
> Normes: les de §11. En acabar, marca el pas 7 com a fet a §10.3 i actualitza `docs/README.md` en
> el mateix commit.

### 15.1 Com s'ha fet (pas 7, 2026-11-22)

- **L'esbós** és `docs/esbossos/esbos-edicio-mobil.html`, amb la mateixa base que
  `esbos-vista-mobil.html` (al mòbil de debò, el simulador ocupa la pantalla i les notes s'obren a
  sobre). Simula la capçalera de §10.4 (‹ nom ✎ · «1 de 5» ▾ · ⋯ ›, i la línia «Estil: …» amb
  «Personalitzat»), la graella que es llisca, la llista de seqüències, el «⋯» (el mateix menú del
  pas 5), el «+» cap amunt, i la barra de baix que puja amb un teclat simulat amb els suggeriments
  cap amunt. Un botó en mostra la mateixa pantalla a amplada d'escriptori (D23, opció a).
- **Les captures d'avui** són a `docs/esbossos/img/edicio-mobil/` (mòbil Pixel 7 i escriptori
  1280 px, amb el document de demostració i les imatges d'ARASAAC servides des del repositori, com
  les captures de les notícies). S'han fet amb un spec temporal fora del repositori, que no es desa:
  quan calgui tornar-les a fer, el pas 8 en farà les de la pantalla nova.
- **Preguntes que planteja l'esbós** (amb un botó per copiar les respostes):
  - **E1**: la línia «Estil: …» sota la capçalera, o només dins del «⋯» (§10.4 ho deixava obert).
  - **E2**: D23, l'escriptori: (a), (b) o (c).
  - **E3**: la cerca màgica dins del camp de cerca o com a botó a part.
  - **E4**: si l'edició funciona amb el mòbil girat o demana posar-lo dret, com la vista.
- **Una troballa de les captures**: un document sense `style.name` (el de demostració, i qualsevol
  d'abans de D1) diu «Estil: L'estil del document» a la capçalera. És correcte però sona redundant;
  el pas 12 (textos) ho pot mirar.

## 16. Encàrrec per obrir la sessió següent (revisió de l'esbós i pas 8)

> **✅ Fet** (2026-11-22): vegeu §16.1.

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> **L'esbós ja està revisat** (2026-11-22): les respostes són D25–D28 a §10.1, i l'esbós
> (`docs/esbossos/esbos-edicio-mobil.html`, v2) ja les porta.
>
> La tasca és el **pas 8 de §10.3** (la pantalla d'edició nova al mòbil), amb les proves de §10.5.
> Llegeix primer §10.1, §10.3 (pas 8), §10.4, §15.1, `docs/estandards/capes-flotants.md` (sobretot
> el panell de baix i els botons flotants) i `docs/plans/fets/PLA-vista-mobil.md`, que va fer el
> mateix camí per a la vista.
>
> En paral·lel, i abans del pas 9: el **pas 3** (l'estudi d'estils de targetes, §4.4).
>
> Normes: les de §11.

### 16.1 Com s'ha fet (pas 8, 2026-11-22)

> El que el codi d'avui ha obligat a concretar respecte de §10.3, §10.4 i D25–D29.

- **Només per sota de `md`**: l'escriptori es queda amb les pestanyes fins al pas 10 (D26). Al
  mòbil, `EditSequencesPage` no pinta el comptador de pictogrames (`PictogramAmount`), ni la cerca de
  dalt, ni la tira de pestanyes: només la capçalera, la graella i la barra de baix.
- **La capçalera** (`SequenceHeader`, amb `compact` al mòbil) és la mateixa a totes les mides, amb
  D25: el nom (tocar-lo el canvia, en el diàleg del pas 5) i al costat el **botó d'estil** (paleta),
  amb la marca de «Personalitzat» a la cantonada si hi ha retocs; el nom de l'estil i l'ajuda van al
  tooltip i al nom accessible. La línia «Estil: …» se'n va **també a l'escriptori**, per tenir una
  sola capçalera. Al mòbil, a més, les fletxes ‹ › (desactivades a les puntes), «2 de 5» (botó que
  obre la llista de seqüències, amb quants pictogrames té cadascuna i també «Afegeix una seqüència»
  al final) i el «⋯» de sempre. Tots els controls, 44 × 44 px.
- **Lliscar** sobre la graella (`TabsSequences`, al mòbil) canvia de seqüència amb un gest
  horitzontal clar (60 px, i més horitzontal que vertical), com a la vista. Moure una targeta demana
  mantenir el dit 250 ms, i un lliscament ràpid no hi arriba: no es trepitgen.
- **La barra de baix** (`features/sequence/components/EditBottomBar/`) porta el **«+»** (D20): un
  menú curt que s'obre cap amunt amb «Afegeix un pictograma» (una targeta buida al final, com el «+»
  del comptador d'abans, amb el mateix límit de 60) i «Afegeix una seqüència». Al costat, la cerca
  màgica de sempre (D27), sense la línia d'ajuda i amb els suggeriments cap amunt (`MagicSearch` amb
  `bottomBar`). És
  fixa a baix i **puja amb el teclat** amb `useVisibleViewport`, el mateix del panell de baix de la
  vista. Declara la seva alçada a `FloatingLayer` (sòcol, terra i reserva): **el botó d'estat
  queda just a sobre de la barra**, al racó de sempre, i no a dins com a l'esbós; els avisos també
  s'hi posen a sobre, i la graella en reserva l'alçada.
- **Girat (D28)**: no hi ha capa de «posa el mòbil dret». Un Pixel 7 girat fa 915 px d'ample, més que
  `md` (900): hi surt la pantalla d'escriptori, amb pestanyes, que hi cap. Els mòbils més estrets
  girats es queden amb la pantalla nova, amb més columnes a la graella.
- **C1** (cap botó només amb hover): la pantalla nova no en té cap. **C28** (girar el mòbil): vegeu
  D28.
- **Proves**: `SequenceHeader.test.tsx` (el botó d'estil amb la marca i el nom accessible; les
  fletxes, la llista i afegir-hi una seqüència) i el nou `e2e/edit-mobile.spec.ts` a Pixel 7 (sense
  pestanyes ni comptador, la barra a baix; fletxes, lliscar i la llista; el «⋯»; la barra puja amb
  un teclat simulat de 300 px; dianes de 44 px). `pictogram-reorder.spec.ts` (el grup «amb el dit»,
  que és a Pixel 7) ja no espera les pestanyes.

**Queda per a més endavant**:

- **Q4** (pas 10): com es passa a la vista nova a l'escriptori i quan es retira la vella.
- La notícia de la pantalla nova del mòbil (amb el pas 13 o en una de pròpia, `PLA-noticies.md`).

## 17. Encàrrec per obrir la sessió següent (pas 3: l'estudi d'estils de targetes)

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 3 de §10.3**: l'estudi de §4.4, `docs/estudis/ESTUDI-estils-de-targetes.md`,
> amb «Sense vores» (decidit) i la comprovació del text i el número sense vora. **És un document,
> amb recerca a la web.** Surt la llista d'estils de l'app (entre quatre i sis) que farà servir el
> pas 9, i s'afegeix a l'índex (`docs/README.md`). L'usuari el revisa abans del pas 9.
>
> Després: el pas 9 (els estils de l'app a la galeria), el pas 10 (l'escriptori, amb Q4), i els
> passos 11–13.
>
> Normes: les de §11.
>
> **Fet** (2026-11-22): l'estudi és a `docs/estudis/ESTUDI-estils-de-targetes.md`, amb les captures a
> `docs/estudis/img/estils-de-targetes/`. **Revisat per l'usuari el mateix dia** (§6 de l'estudi):
> D30 (quatre estils: Sense vores, Color de la categoria, Per retallar i Passos numerats), D31 (un
> estil de l'app és complet, com El meu estil, i tots porten Atkinson Hyperlegible), D32 (aplicar un
> estil no pregunta res: els pictogrames retocats conserven els retocs, i D3 continua valent) i D33
> (treure la personalització deixa el pictograma amb l'estil de la seqüència). Les majúscules, al
> backlog (B41).
>
> **El pas 9 ha de fer**: els quatre estils amb els valors de §3 de l'estudi; la mostra de la galeria
> en una caixa fixa amb marge (V7 de l'estudi); B40; i els colors dels estils a `palette.ts`.

### 17.1 Com s'ha fet (pas 9, 2026-11-22)

- **Els quatre estils** (D30) són a `features/sequence/style/appStyles.ts`: `APP_STYLE_KEYS` (l'ordre
  de la galeria) i `appStyleOf(key, view)`, que en torna l'estil sencer (D31): la targeta de §3 de
  l'estudi, amb **Atkinson Hyperlegible** al text i al número, i la pell, el cabell, el color i els
  colors de Fitzgerald d'origen de l'app. La `view` és la de la base, només perquè la mostra es
  pinti com la resta: en triar-lo no es copia (`namedStyleFrom`).
- **Els colors** de les vores són a `palette.ts` com a `appStyleBorderColors` (`ink`, que és
  `printColors.text`, i `grey`). Són contingut: es copien al document en triar l'estil.
- **La galeria** (`StyleGallery.tsx`) els posa al grup «Estils de l'app», amb «Desa en un fitxer» i
  «Fes-lo el meu estil». El nom es tradueix (claus `features.sequence.styleGallery.appStyle.*`, als
  cinc idiomes) i s'escriu al document en l'idioma de qui el tria. Se'n va el text «Aviat n'hi
  haurà» (`appStylesEmpty`). Si la seqüència o el bloc ja fa servir un estil de l'app, aquest surt
  **marcat al seu lloc** i no al grup «El d'ara» (es compara el contingut; el nom no compta, perquè
  pot ser d'un altre idioma).
- **D32**: triar-lo no pregunta res; els retocs es conserven i el snackbar de D3 ho diu, com ja feia.
- **La mostra** (V7 de l'estudi) va dins d'una caixa blanca d'amplada fixa (`SAMPLE_BOX_WIDTH`, 96
  px) amb marge, i sense l'ombra de la graella (`variant="plane"`): a «Sense vores» l'ombra feia de
  marc. Comprovat amb captures en clar, en fosc i al mòbil (Pixel 7).
- **B40, resolta**: el peu de la targeta calcula el farciment amb la vora exterior, com la
  capçalera (`PictogramCard.tsx`).
- **Proves**: `SequenceHeader.test.tsx` (els quatre estils i l'ordre, triar «Sense vores»: es copia
  sencer amb Atkinson Hyperlegible, el snackbar diu els retocs que es conserven, i tornant-hi surt
  marcat) i `PictogramCardPadding.test.tsx` (B40; falla amb el codi d'abans). Typecheck net; web
  588 proves i i18n 67, verdes.

## 18. Encàrrec per obrir la sessió següent (pas 10: l'escriptori)

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 10 de §10.3**: a l'escriptori, la pantalla d'edició nova com a **vista
> alternativa durant un temps** (D26), al costat de les pestanyes. **Primer cal decidir Q4 amb
> l'usuari**: com es passa d'una vista a l'altra (un interruptor a l'edició, desat com a
> preferència d'interfície, que no entra al document?) i quan es retira la vella. Llegeix §10.1
> (D23, D26), §16.1 (com és la pantalla nova al mòbil) i `docs/estandards/navegacio.md`.
>
> Després: els passos 11 (la columna a l'estàndard), 12 (textos: inclou D33, «restablir torna a
> l'estil de la seqüència») i 13 (la notícia N-2).
>
> Normes: les de §11.
>
> **✅ Fet** (2026-11-22): Q4 decidida (D34) i pas 10 fet, vegeu §18.1.

### 18.1 Com s'ha fet (pas 10, 2026-11-22)

- **`useEditLayout`** (`features/sequence/hooks/`) diu quina pantalla es pinta: al mòbil, sempre la
  nova; a l'escriptori, la que l'usuari ha triat, desada a `localStorage` (`editLayout`: `new` o
  `classic`; sense tria, la d'abans). Si el navegador no hi deixa escriure, la tria val per a la
  visita. No passa pel compte ni per `saveUserUiThunk`: és la tria d'aquest dispositiu, i se'n va
  amb la vista vella (B42).
- **`EditLayoutSwitch`** (`features/sequence/components/`) és el botó: a la vista d'abans, al
  costat de la cerca («Prova l'edició nova»); a la nova, a dalt a la dreta («Torna a l'edició
  d'abans»). Al mòbil no hi és. Es diu «edició», no «vista», perquè «Vista» és l'altra pàgina.
- **`TabsSequences`** pinta la pantalla nova amb la prop `newLayout`, i no pel breakpoint: és
  `EditSequencesPage` qui decideix. **`EditBottomBar`** a l'escriptori queda centrada, amb
  l'amplada de `md`: una cerca de punta a punta d'una pantalla gran no es llegeix.
- **Sense snackbar** en canviar: el canvi de pantalla és la resposta, i el botó per tornar-hi és al
  mateix lloc.
- **Proves**: `EditSequencesPage.test.tsx` (a l'escriptori: passa a la nova, ho recorda en tornar a
  obrir l'edició, i torna a la d'abans). Comprovat també amb captures a 1280 px i recarregant la
  pàgina. Typecheck net; web 589 proves i i18n 67, verdes.

## 19. Encàrrec per obrir la sessió següent (pas 11: la columna a l'estàndard)

> Branca: **`estils-seqüencia-i-edicio`**, com §11 (la PR a `master`, en acabar el pla).
>
> La tasca és el **pas 11 de §10.3** (D24): `SettingsLevel`, `SettingsLevels` amb la línia de la
> cascada, `LevelCrumbs` i l'etiqueta de la disposició passen a `docs/estandards/configuracions.md`,
> «Components compartits», tal com són. És documentació: llegeix-los al codi i escriu-ne la regla i
> el perquè, com la resta de l'estàndard.
>
> Després: el pas 12 (textos i vocabulari, amb D33: «restablir torna a l'estil de la seqüència», i
> els noms dels estils de l'app als cinc idiomes) i el 13 (la notícia N-2). En tancar el pla: B37
> resolta, Q2 al backlog si continua oberta, el pla a `plans/fets/` i la PR a `master`.
>
> Normes: les de §11.
>
> **✅ Fet** (2026-11-22): vegeu §19.1.

### 19.1 Com s'ha fet (pas 11, 2026-11-22)

- `docs/estandards/configuracions.md`, «Components compartits», porta ara **`SettingsLevel`**,
  **`SettingsLevels`** (amb la línia de la cascada i com se'n calcula la posició), **`LevelCrumbs`** i
  **l'etiqueta de la disposició** (el `Chip` d'`arrangementTag` de `PageHeader` i de
  `ViewSettingsPreview`), tal com són al codi (D24), amb la regla i el perquè de cadascun.
  `SettingsLevel` hi queda com l'**única excepció declarada** a «una zona no es marca amb una caixa».
- A «Estat de migració», la columna de la vista ja no diu que són «a prova», i
  `settingsAccordion` hi apunta directament. Els comentaris de `SettingsLevel.tsx` i
  `LevelCrumbs.tsx` diuen el mateix.
- Cap canvi de codi més enllà dels comentaris. L'etiqueta «Nou» de la fila «Disposició» no és del
  pas (D24): va amb la notícia.
