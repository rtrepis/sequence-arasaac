# Colors, zones i impressió

> **Quan llegir-lo:** abans de tocar cap color, fons, tema fosc, impressió o PDF.

- **Única font de veritat**: `apps/web/src/style/palette.ts` (importat per `themeMui.ts`). Mai definir hexadecimals fora d'aquest fitxer.
- El **verd oficial** de l'app és `primary.main: #8ac34a` (el de la NavBar, en clar i en fosc via `enableColorOnDark`).
- **Text/icones sobre verd**: sempre `primary.contrastText` (`#1E2A12`, fosc — contrast 7,2:1 WCAG AA). Mai blanc ni grisos clars sobre el verd (màxim 2,1:1, il·legible).
- El `secondary` són grisos amb matís verd (`main: #E3E8DC`) amb text fosc — mateixa lògica que el primary. **És un fons, mai una tinta**: `color="secondary"` en una icona la deixa a **1,15:1** sobre el full, que és el mateix que no dibuixar-la. Hi van caure els botons d'afegir pictograma i d'afegir seqüència, que són les dues accions amb què comença tot el que es fa a l'app.
- **El verd no és mai color de text ni d'icona.** `primary.main` sobre el paper de configuració o sobre el full es queda a **2,1:1**, quan el mínim és 4,5:1 per a text i 3:1 per a una icona. Un botó de text, un `outlined` o un botó només-icona porten `color="inherit"` (la tinta del tema); el verd només hi va quan **la superfície és verda** i el que hi ha a sobre és `primary.contrastText`, o dins d'un botó `contained`. Els botons només-icona es declaren amb **`StyledIconButton`** (`style/StyledIconButton.ts`), que hi posa la cantonada de la casa i la diana tàctil mínima (`APP_TOUCH_TARGET_MIN`), però **no** el color.
- **Mai hardcodejar colors** (`"green"`, `"whitesmoke"`, hex, rgba...) a components o styled: usar `theme.palette.*` (a `styled` amb `({ theme }) => ...`) o strings de tema a `sx` (`"primary.main"`, `"primary.contrastText"`).
- Per a tints/transparències derivar del tema amb `alpha(theme.palette..., x)` de `@mui/material`.
- Els botons i controls (Button, ToggleButton, etc.) es basen en `color="primary"` (el default del tema); dins la NavBar, `color="inherit"`.
- **Excepció**: els colors semàntics de pictogrames (`fitzgeraldColors.ts`, `inputColorList.ts`) són contingut, no UI — no s'han de tocar.

## Patró de zones (fons)

Hi ha **tres** superfícies, no dues:

- **`sheetSurface` = superfície de full** (`palette.ts`): **blanc en tots dos temes**. És tota zona on es veu un pictograma — targetes de `PictogramCard`, full de `.preview-container`, fullscreen i mostres de configuració. **El que es veu és el que s'imprimeix**: mateixos colors a pantalla, a paper i al PDF, sense compensacions per tema. Surt de `printColors.background` a propòsit: full i paper són la mateixa cosa.
- **`background.default` = escriptori** (el fons sobre el qual sura el full): blanc en clar, negre en fosc.
- **`background.paper` = zona de configuració** (diàlegs, panells, acordions, controls): gris verdós (`#F2F5EC` clar / `#242820` fosc).
- Valors definits a `appBackgrounds` de `palette.ts`. L'overlay d'elevació de MUI està desactivat (`MuiPaper: backgroundImage: none`) perquè el gris de config sigui uniforme.
- **Mai adaptar al tema res que estigui sobre el full**: ni el color de lletra triat per l'usuari, ni el traç dels pictogrames. El tema fosc governa només el que envolta el full (barra, tabs, panells, controls). El motiu és d'accessibilitat: el contrast del text sobre paper s'ha de poder jutjar mentre es configura, no en descobrir-lo a la impressora.
- `SettingsPreviewFrame` amb `background="default"` és superfície de full (`ViewSettingsPreview`). **Excepció**: la mostra de `DefaultForm` i la de `VocabularySettingsPanel` són un sol Card sobre el panell i usen `background="paper"` — el card ja és blanc i el gris li fa de passe-partout perquè no es fongui amb el marc.
- Al modal d'edició de pictograma (`PictEditForm`), la part superior (mostra + cerca) és escriptori i la targeta hi sura a sobre; només el `SettingAccordion` de sota és zona de configuració.

## Impressió i PDF

- **La sortida impresa i el PDF sempre són en clar** (paper blanc, text fosc), independentment del tema actiu. Tokens a `printColors` de `palette.ts`.
- Impressió (`window.print`): `generatePrintCSS` a `usePrintStyles.ts` força fons blanc al `body`, `.preview-container`, `.preview-content` i els `MuiPaper` interiors. Ara és **xarxa de seguretat**, no correcció: les superfícies de full ja són blanques a pantalla. Els pictogrames conserven regles `@media print` pròpies només per a la mida de lletra (`PictogramCard`).
- PDF (`useDownloadPdf.ts`): al clon de html2canvas es normalitzen els colors de tema amb `themeColorReplacements` (fons d'`appBackgrounds` → blanc, text blanc → negre). Els colors de contingut de l'usuari (font, vores, fitzgerald) no es toquen.
- El pictograma **sense color** (B/N) **no s'inverteix mai**: com que la targeta sempre és paper blanc, el traç negre es veu igual en clar, en fosc, a paper i al PDF. Les compensacions que hi havia per al mode fosc (`filter: invert(1)` a `pictogram__media`, `getDisplayColor` per al color de lletra, i les regles que les desfeien a `@media print` i al `safetyStyle` del PDF) s'han eliminat: amb una sola superfície de full ja no hi ha res a compensar.

