# Backlog d'UX i accessibilitat

Registre de les troballes obertes de la revisió d'UX de `apps/web/src` (auditoria de nomenclatura,
icones i accessibilitat). Existeix perquè les troballes que **no** es resolen en el moment de
detectar-les no es perdin al xat ni dins d'una pàgina publicada.

**Com es manté**

- Una entrada no s'esborra mai en resoldre-la: es marca `✅ Resolta` amb el commit o la branca. Així
  queda constància que s'ha mirat, i no es torna a proposar d'aquí sis mesos.
- Quan una entrada deixa de ser certa perquè el codi ha canviat per una altra via, es marca
  `➖ Caducada` amb el motiu. No és el mateix que resolta.
- En obrir una entrada nova cal **fitxer i línia**, per què importa per a l'usuari, i la proposta.
  Sense els tres, no és una entrada: és una opinió.
- Les referències de línia envelleixen. Val el nom del component i el símbol, no el número.

Llegenda d'estat: `🔴 Oberta` · `✅ Resolta` · `➖ Caducada`

---

## Gravetat alta

Risc real que l'usuari prengui l'acció equivocada, o exclusió d'accessibilitat.

### A1 — La seqüència no es desa mai sola ➖ Caducada

L'auditoria deia que `documentReducer` no tenia cap persistència. Ja no és cert: hi ha
`features/sequence/storage/draftStorage.ts` (IndexedDB), consumit per `useDocumentDraft` i muntat a
l'app via `DocumentDraftSync` a `LanguagesLayaut.tsx`. L'esborrany sobreviu a un refresc i a tancar
la pestanya.

**Residu que sí que queda obert** → vegeu A1b.

### A1b — Sortir amb feina no exportada no avisa 🔴 Oberta

- **On**: `features/sequence/hooks/useDocumentDraft.ts`
- **Per què importa**: l'esborrany d'IndexedDB és xarxa de seguretat, no desat — el navegador el pot
  desallotjar (Safari, als 7 dies sense visitar el lloc). L'usuari no té cap senyal que allò que veu
  a pantalla encara no és enlloc de durador, i «Descarrega» / «Desa al núvol» continuen sent
  explícits.
- **Proposta**: avís en sortir si hi ha canvis mai exportats ni desats al núvol, o un indicador
  d'estat permanent («esborrany local» vs «desat»).

### A2 — El menú contextual d'un pictograma és 100% en anglès 🔴 Oberta

- **On**: `components/utils/MouseActionList/MouseActionList.tsx` — `Copy`, `Paste`, `Edit`,
  `Delete`, `Insert`, `Duplicate` literals, sense `react-intl`
- **Per què importa**: és el menú que s'obre amb clic dret o pulsació llarga sobre qualsevol
  pictograma — probablement l'acció més repetida de l'editor. En una app de 5 idiomes amb públic
  català, un menú sencer en anglès és el pitjor lloc on deixar-lo.
- **Proposta**: `MouseActionList.lang.ts` amb `defineMessages()` i els sis verbs traduïts.

### A3 — El botó d'imprimir s'anunciava com «view» ✅ Resolta

Branca `claude/analisis-opcions-a3-g9i913`. Els quatre botons només-icona de la barra d'eines de
`ViewSquenceSettings` prenen l'`aria-label` del mateix missatge que el tooltip
(`tooltipOrientation`, `tooltipPrint`, `tooltipDownloadPdf`, `tooltipFullscreen`). Cap clau de
traducció nova: ja existien totes.

Es va descartar deixar que el `Tooltip` de MUI posés sol l'`aria-label`: el fill del tooltip del PDF
és el `<span>` embolcall (necessari perquè el `Button` pot estar `disabled`), i l'etiqueta hi cauria
sobre un element sense rol, deixant el botó **sense cap nom**.

### A4 — «Horitzontal» i «Vertical» volen dir dues coses al mateix panell 🔴 Oberta

- **On**: `ViewSequencesSettings/GlobalViewControls.tsx` — `tooltipDirectionRow` /
  `tooltipDirectionColumn` (**el mateix id de missatge**) fets servir per a l'orientació de la
  pàgina (`MdScreenRotation`) i per a la direcció d'apilament (`MdTableRows` / `MdViewColumn`)
- **Per què importa**: dos controls contigus mostren literalment el mateix text per configurar coses
  diferents. L'adjectiu sol no diu sobre què actua.
- **Proposta**: «Pàgina apaïsada / vertical» i «Seqüència en files / columnes» — dos parells de
  claus, no un.

### A5 — La mateixa icona és «Copiar» i «Duplicar» 🔴 Oberta

- **On**: `MouseActionList.tsx` — `AiOutlineCopy` per a *Copy* (porta-retalls intern) i per a
  *Duplicate* (insereix la còpia al costat)
- **Per què importa**: dues accions amb resultat diferent, mateix símbol, a dues línies del mateix
  menú.
- **Proposta**: porta-retalls per a «Copiar», còpies apilades per a «Duplicar».

### A6 — Un clip de paper vol dir «Enganxar» 🔴 Oberta

- **On**: `MouseActionList.tsx` — `AiOutlinePaperClip` per a l'acció *Paste*
- **Per què importa**: el clip és universalment «adjuntar arxiu». Fer servir un símbol reconegut per
  a un concepte que no és el seu gasta l'avantatge del símbol universal.
- **Proposta**: icona de porta-retalls.

### A7 — El botó de PDF desapareix del focus mentre genera 🔴 Oberta

*(Trobada en analitzar A3, fora del seu abast.)*

- **On**: `ViewSequencesSettings/ViewSquenceSettings.tsx` — `disabled={isGenerating}`
- **Per què importa**: un `Button` `disabled` no és focusable. Qui navega amb lector de pantalla
  prem el botó, el botó desapareix de l'ordre de tabulació i no rep cap anunci: no sap si s'està
  generant el PDF o si ha fallat.
- **Proposta**: `aria-disabled` + `aria-busy` en lloc de `disabled` (el botó continua focusable i
  anunciable), i ignorar el clic al handler mentre `isGenerating`.

---

## Gravetat mitjana

Ambigüitat real, però amb context (posició, títol de secció) que ajuda a desfer-la.

### B1 — Una icona de núvol per a dues destinacions oposades 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` — `AiOutlineCloudDownload` per a «Descarrega» (seqüència →
  fitxer local) i per a «Carrega del núvol» (servidor → app)
- **Proposta**: icona pròpia per a «Carrega del núvol», diferenciada de la de fitxer local.

### B2 — L'engranatge porta a «Configuració» i també a «Administració» 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` — `AiOutlineSetting` reutilitzada per a dos destins
- **Per què importa**: «Administració» només surt per a comptes admin, però quan surt comparteix
  símbol amb els ajustos personals.
- **Proposta**: icona d'escut o de panell per a «Administració».

### B3 — El mateix «+» / «−» gestiona pictogrames i seqüències senceres 🔴 Oberta

- **On**: `PictogramAmount.tsx` i `TabsSequences.tsx` — `AiFillPlusCircle` / `AiFillMinusCircle` a
  totes dues
- **Per què importa**: conviuen a la mateixa pantalla d'edició amb la mateixa forma i color;
  només canvien de mida i posició. Esborrar una seqüència per error costa molt més que esborrar un
  pictograma.
- **Proposta**: reservar el cercle ple per a pictogrames; pàgina amb +/− per a seqüències.

### B4 — Tres etiquetes catalanes per al mateix destí 🔴 Oberta

- **On**: `AppNavigationDrawer.tsx` («Edita» / «Previsualitza») vs `TabsEditView.tsx` («Editar» /
  «Vista») — mateixes icones, mateix destí
- **Proposta**: un únic parell de missatges reutilitzat als dos llocs.

### B5 — Quatre textos per al botó «restaurar per defecte» 🔴 Oberta

- **On**: `DefaultForm`, `ViewSettingsPanel`, `ViewSquenceSettings`, `PictEditForm` —
  `MdSettingsBackupRestore` amb «Restableix» / «Restableix» / «Restaurar per defecte» / «Valors per
  defecte»
- **Per què importa**: l'abast real difereix (un pictograma / la vista / la sessió / tota la
  configuració), cosa que justifica un matís — però no quatre formulacions.
- **Proposta**: patró únic «Restaura [àmbit]».

### B6 — Els tooltips de seqüències són català hardcodat 🔴 Oberta

- **On**: `TabsSequences.tsx` — «Afegir seqüència» / «Eliminar última seqüència», únic component de
  la zona sense `react-intl`
- **Per què importa**: un usuari d'es/en/fr/it hi veu català sense traduir, justament als botons que
  afegeixen o eliminen una pàgina sencera.
- **Proposta**: `TabsSequences.lang.ts` amb els dos tooltips.

---

## Gravetat baixa

Inconsistència de forma o deute intern, sense un moment concret d'acció equivocada.

### C1 — Diversos botons només mostren l'etiqueta en passar-hi el ratolí 🔴 Oberta

- **On**: `PictogramAmount`, `TabsSequences`, barra d'eines de vista
- **Per què importa**: en tàctil el hover no existeix; el tooltip no s'obre. És decisió de producte
  (fer lloc a etiquetes visibles), no un canvi de nomenclatura.

### C2 — «Eliminar» té tres representacions d'icona 🔴 Oberta

- **On**: `AiOutlineDelete` (menú contextual, càrrega de núvol) vs `MdDeleteOutline` (vocabulari,
  imatge pujada) vs sense icona (`PictEditModal`)
- El text sempre és clar, així que no indueix a error: és inconsistència visual.

### C3 — Quatre famílies d'icones barrejades sense patró 🔴 Oberta

- `react-icons/ai` (majoria), `/md` (barra de vista, restore), `/bs` (PDF, info), `/ri` (selector de
  tema), sense cap regla de quan toca cadascuna.
- **Proposta**: un estàndard d'icones a `CLAUDE.md`, com ja n'hi ha per a colors i per a tabs.

### C4 — Components morts i col·lisió de traduccions 🔴 Oberta

Verificat el 2026-08-22:

| Element | Problema |
|---|---|
| `ToggleButtonEditViewPages` | Cap import extern. Substituït per `TabsEditView`, però manté el seu `.lang.ts` amb «Edit»/«View» hardcodats |
| `ButtonWithFileLoad` | Cap import extern |
| `ButtonWithModalDownload/ButtonWithModalDonwload.tsx` | El botó no s'importa enlloc; només se'n fa servir `ModalDownload.tsx` (des d'`AppNavigationDrawer`) |
| `components.pictEdit.reset` | Definit dos cops: `PictEditForm.lang.ts` (usat, «Restore») i `PictEditModal/PictEdit.lang.ts` (no usat, «Reset to defaults») — mateix id, dos textos font |
| Missatges orfes | `upload`, `download`, `openMenu`, `langSelector`… a `BarNavigation.lang.ts` i `AppNavigationDrawer.lang.ts`, sense consumidor |

**Per què importa**: no confon l'usuari final, però tocar `components.pictEdit.reset` en un dels dos
fitxers pot canviar silenciosament el text de l'altre.

### C5 — `aria-label` en anglès literal als grups de toggles 🔴 Oberta

*(Trobada en analitzar A3, fora del seu abast.)*

- **On**: `GlobalViewControls.tsx` (`landscape`, `portrait`, `row`, `column`),
  `SequenceControlsPanel.tsx` i `Modals/DefaultSettingsModal/ViewSettingsPanel.tsx` (`left`,
  `center`, `right`, `top`, `bottom`), `TabsSequences.tsx` (`sequence number`),
  `ToggleButtonEditViewPages.tsx` (`Toggle view/edit`, `edit`, `view` — component mort, vegeu C4)
- **Per què importa**: mateixa causa que A3, però molt menys greu: aquests toggles viuen dins d'un
  `SettingRow` amb títol traduït, així que el context el dona la fila. Tot i així són noms
  accessibles en anglès en una app de 5 idiomes.
- **Proposta**: un `IconActionButton` compartit que prengui **un sol** missatge i en derivi tooltip i
  `aria-label`, de manera que no puguin tornar a divergir. Val la pena si es fa d'una tirada per a
  tots els casos; component a component no compensa el diff.
