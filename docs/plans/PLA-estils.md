# Pla: els estils, sense sorpreses

> **Estat**: decisions preses (2026-11-20), **revisades el 2026-11-21 (§8)**: l'estil va amb la
> seqüència i el bloc, i la pantalla d'edició canvia. Falta el pla d'execució (§9). Cap codi fet.

> **⚠️ Com llegir aquest document (2026-11-21).** És un document **en dues capes**:
>
> - **§0–§7** són l'anàlisi i les decisions del 2026-11-20. **Continuen valent** l'inventari (§1),
>   les troballes E1–E18 (§2), **la solució A** (§3) i les decisions D1, D3, D5, D6 i D7.
> - **§8** és la revisió del 2026-11-21 i **mana sobre tot el que la contradigui**. En concret,
>   **queden superats**: D8 i §4.3 («només a un bloc»), Q1, la fila de D4, i l'**ordre dels passos de
>   §7**, que el pla d'execució (§9) ha de substituir.
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
| D4 | Com es fa visible l'estil del document? **⚠️ A revisar (§8.1)** | **Una fila «Estil» al nivell Document de la columna, amb el nom** (camp `style.name`, §5). Amb D8, la fila **només informa**: vegeu Q2 |
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

> **⚠️ Superat per §8 i §9**: aquest ordre és d'abans de la revisió. El pla d'execució de la
> sessió següent el substitueix. Només continua valent que **la solució A va primer**.

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

> **Estat**: idees de l'usuari, recollides tal com les ha explicat. **Encara no és un pla
> d'execució**: el pla es fa a la sessió següent (vegeu l'encàrrec, §9). Aquesta revisió **mana
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
