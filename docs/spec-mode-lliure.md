# Encàrrec: "Mode lliure de pàgina" a SequenciAAC

## 1. Rol i context
Ets un enginyer frontend sènior especialitzat en usabilitat i accessibilitat (WCAG 2.2 AA, ARIA Authoring Practices Guide) i en arquitectura de codi net (SOLID).

Treballes al repositori de **SequenciAAC** (sequenciaac.vercel.app), una app web gratuïta (Vite) per crear seqüències de pictogrames ARASAAC per a usuaris de Comunicació Augmentativa i Alternativa (CAA). Els usuaris són famílies, docents i logopedes; molts no són tècnics i treballen des de tauleta. Alguns usuaris finals fan servir commutadors o teclats adaptats.

## 2. Missió
Implementar el **Mode lliure de pàgina**: cada seqüència passa a ser una **capa** que l'usuari pot moure, redimensionar i distribuir lliurement sobre la pàgina (A4/Carta, vertical/horitzontal). Una pàgina pot contenir diverses capes. Ha de ser igual de fàcil d'usar amb ratolí, amb el dit i amb el teclat.

## 3. Pas 0 — Abans d'escriure codi (obligatori)
1. Explora el repo: framework, gestió d'estat, model de dades de seqüència/pestanya, format `.saac` (JSON amb imatges en base64), exportació PDF, i la variable `VITE_ACCOUNTS_ENABLED`.
2. Escriu `PLAN.md` amb: fitxers afectats, canvis al model de dades, estratègia de migració, estructura de carpetes proposada i riscos.
3. Atura't i demana confirmació abans d'implementar. Si trobes contradiccions entre aquest encàrrec i el codi real, explica-les.

## 4. Principis no negociables
- **Compatibilitat**: els `.saac` antics s'obren sense canvis visibles. Afegeix `schemaVersion` i una funció de migració pura i testejada. Un document sense dades de disposició lliure es mostra amb el comportament actual (mode "flux").
- **El mode actual es manté per defecte**. El mode lliure és opcional i s'activa per pàgina ("Disposició: Automàtica / Lliure").
- **WYSIWYG**: el PDF coincideix amb la pantalla. Coordenades en unitats de document (mm), mai en píxels.
- **Tot local**: funciona igual amb `VITE_ACCOUNTS_ENABLED=false`.
- **Pictogrames mai deformats**: sempre mantenen la proporció.
- **Sense dependències pesades** si no cal; justifica qualsevol llibreria nova (mida del bundle, accessibilitat, llicència compatible).
- **Cap acció destructiva sense desfer.**
- **Convencions del repo**: segueix `docs/design-conventions.md` (tokens, components, estil de codi, i18n, tests). Reutilitza components existents; si cal un component o token nou, justifica-ho i documenta'l allà mateix. Mai inventis estils paral·lels.

## 5. Model de dades (proposta, adapta-la al codi real)
```
Page  { id, size, orientation, layoutMode: 'flow' | 'free', layers: Layer[] }
Layer { id, sequenceId, x, y, width, height (mm), zIndex, locked, visible, label,
        columns: 'auto' | number }
```

## 6. Arquitectura d'accions i dreceres (SOLID, clean code)
Objectiu: **cap handler de teclat dins dels components de UI**. Totes les interaccions passen per un sistema d'accions únic.

### Mòduls
- `actions/` — Registre d'accions (Command pattern). Cada acció:
  `{ id: 'layer.move.left', labelKey, scope, canExecute(ctx), execute(ctx, params), undo?(ctx, snapshot) }`
  Organitzades per domini (layer, page, selection, view). Funcions pures sempre que sigui possible.
- `keybindings/` — Mapa declaratiu drecera → id d'acció, per scope. Ctrl/Cmd segons plataforma. Sense lògica.
- `input/` — Un únic `KeyboardManager`: escolta, resol el scope actiu i despatxa. Ignora esdeveniments dins d'`input`, `textarea` i `contenteditable` (excepte Esc). Els diàlegs modals atrapen focus i dreceres.
- `history/` — `UndoManager` genèric basat en comandes, independent de la UI.
- `announcer/` — Servei únic per a missatges `aria-live`; les accions retornen un missatge i el servei l'anuncia.
- `layout/` — Lògica pura de disposició: `computeGrid`, imant, guies, conversió mm↔px.

### Principis
- **S**: cada mòdul, una responsabilitat (definir, mapar, escoltar, historial, anunciar, calcular).
- **O**: afegir una acció o drecera = afegir una entrada, sense modificar el `KeyboardManager`.
- **L**: totes les accions compleixen la mateixa interfície.
- **I**: interfícies petites (`Executable`, `Undoable`, `Announceable`).
- **D**: la UI depèn de `dispatch(actionId, params)`, no d'implementacions concretes.
- **Clean code**: noms descriptius en anglès al codi; textos d'usuari només via i18n; constants en lloc de números màgics (`MOVE_STEP_MM = 1`, `MOVE_STEP_LARGE_MM = 10`, `MIN_PICTO_MM = 15`); funcions curtes i testejables.

### Reutilització obligatòria
Barra d'eines, menú contextual, panell numèric i teclat criden **les mateixes accions**. El diàleg d'ajuda (tecla `?`) es genera automàticament des del registre, agrupat per scope, amb etiquetes traduïdes.

### Preparat per al futur
Estructura pensada perquè més endavant l'usuari pugui personalitzar dreceres (commutadors, teclats adaptats). No s'implementa ara.

## 7. Interacció
- **Seleccionar**: clic/toc. Marc de selecció visible amb nanses.
- **Moure**: arrossegar. **Redimensionar**: nanses.
- **Ajudes**: quadrícula opcional, imant a vores de pàgina, marges i altres capes, guies d'alineació temporals.
- **Accions sobre capa**: portar al davant/enrere, duplicar, bloquejar, amagar, eliminar, alinear i distribuir (selecció múltiple).
- **Desfer/refer** per a totes les operacions de disposició.
- **Tàctil**: Pointer Events; sense conflictes amb scroll i zoom del navegador; provat en iPad i Android.
- **Límits**: una capa no pot sortir completament de la pàgina; avís si queda fora de l'àrea imprimible.

### Dreceres de teclat (definides al mapa, no al codi de UI)
| Drecera | Acció |
|---|---|
| Tab / Shift+Tab | Recórrer capes en ordre de lectura (dalt→baix, esquerra→dreta), no per zIndex |
| Fletxes | Moure 1 mm |
| Shift+Fletxes | Moure 10 mm |
| Alt+Fletxes | Redimensionar |
| Ctrl/Cmd+Z | Desfer |
| Ctrl/Cmd+Shift+Z | Refer |
| Ctrl/Cmd+D | Duplicar |
| Supr / Retrocés | Eliminar (amb desfer) |
| Esc | Deseleccionar / tancar diàleg |
| ? | Diàleg d'ajuda de dreceres |

## 8. Redimensionat d'una capa amb N pictogrames (reflow)
- En redimensionar, els pictogrames **no s'escalen lliurement ni es deformen**: es reorganitzen en graella.
- **Algorisme** (`computeGrid(N, boxW, boxH, opts)`, funció pura): per a cada nombre de columnes vàlid (files = ceil(N/columnes)), calcula la mida de pictograma que hi cap (proporció fixa, incloent etiqueta i espaiat) i tria la més gran. En cas d'empat, menys files.
- **Ordre de lectura sempre preservat**: LTR per defecte, RTL segons l'idioma.
- **Mida mínima**: pictograma ≥ `MIN_PICTO_MM` i font ≥ mínim configurat. La capa no es pot reduir per sota; la nansa s'atura i es mostra un avís no intrusiu (també per `aria-live`).
- **Columnes per capa**: "Automàtic" (per defecte) o un nombre fix (per exemple, tira d'1 fila o 1 columna). Amb columnes fixes, la caixa es limita a proporcions que respectin el mínim.
- **Espai sobrant**: contingut centrat; botó "Ajustar la caixa al contingut".
- **Si N canvia** (afegir o treure pictogrames): es recalcula la graella mantenint la mida de la caixa si és possible.
- **Anunci**: "Capa redimensionada: 2 files, 3 columnes, pictogrames de 42 mm".

## 9. Accessibilitat (WCAG 2.2 AA)
- **2.5.7 Moviments d'arrossegament**: tot el que es fa arrossegant té alternativa sense arrossegar: panell "Posició i mida" (X, Y, amplada, alçada en mm, columnes) i botons ↑↓←→.
- **2.1.1 Teclat**: tot operable amb teclat (vegeu taula de dreceres).
- **2.4.7 / 2.4.11 Focus visible i no tapat**: el focus mai queda ocult per capes o barres.
- **2.5.8 Mida dels objectius**: nanses i botons ≥ 24×24 px CSS (ideal 44×44 en tàctil).
- **Lectors de pantalla**: cada capa té nom accessible ("Seqüència: Rentar-se les mans, 6 pictogrames"). Canvis anunciats pel servei `announcer`. Només rols i patrons de l'ARIA APG.
- **1.4.11 Contrast no textual**: marcs, nanses i guies ≥ 3:1 sobre qualsevol fons.
- **Moviment reduït**: respecta `prefers-reduced-motion`.
- **Accessibilitat cognitiva**: textos curts i clars, icones amb etiqueta, estat sempre visible (mode actiu, capa seleccionada).
- **Idiomes**: totes les cadenes noves traduïdes a tots els idiomes existents de l'app.

## 10. Exportació
- **PDF**: respecta posicions, mides, graella i ordre de capes; les capes amagades no s'exporten.
- **.saac**: inclou la disposició; exportar i reimportar dona un document idèntic.

## 11. Lliurament per fases
Un PR/commit per fase; cada fase ha de deixar l'app funcional.
1. **Fonaments**: model de dades, migració d'esquema, mòduls `actions/`, `keybindings/`, `input/`, `history/`, `announcer/` i `layout/` (sense UI nova) + tests.
2. **Canvas amb capes**: selecció, moure, redimensionar amb ratolí/tàctil, reflow de pictogrames, desfer/refer.
3. **Alternatives accessibles**: dreceres, panell numèric, anuncis live, diàleg d'ajuda autogenerat.
4. **Ajudes de disposició**: quadrícula, imant, guies, alinear/distribuir, ordre de capes, columnes fixes.
5. **Exportació**: PDF i `.saac` + proves de fidelitat.

## 12. Proves i criteris d'acceptació
**Unitaris**
- Migració d'esquema (documents antics → nou esquema).
- Conversió mm↔px, imant, guies.
- `computeGrid` amb N = 1..12, caixes extremes (molt ampla, molt alta, al mínim), columnes fixes i RTL.
- Cada acció: `execute` + `undo` retornen a l'estat inicial.

**Arquitectura**
- Falla si dues accions comparteixen drecera en el mateix scope.
- Falla si una acció no té `labelKey` traduït a tots els idiomes.
- Cap drecera s'activa amb el focus dins d'un camp de text.

**Integració / E2E** (framework existent o Playwright)
- Crear pàgina lliure; moure una capa amb ratolí, amb teclat i amb el panell numèric; redimensionar i comprovar el reflow; exportar i reimportar.

**Accessibilitat**
- axe-core sense errors nous.
- Prova manual documentada: només teclat; NVDA o VoiceOver; tauleta tàctil; zoom al 200%.

**Regressió**
- Un `.saac` creat amb la versió actual s'obre i s'exporta a PDF exactament igual que abans.

## 13. En acabar cada fase
Resumeix: què has fet, decisions preses i per què, limitacions conegudes i què queda pendent. En acabar la fase 5, actualitza el CHANGELOG i la documentació d'usuari amb una explicació breu del nou mode.
