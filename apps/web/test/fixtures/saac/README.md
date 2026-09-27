# Fixtures `.saac`

Fitxers `.saac` de referència per a les proves de regressió del canvi de model de dades del **mode
lliure** (`docs/spec-mode-lliure.md`, §4 «Compatibilitat» i §12 «Regressió»). La pregunta que
responen és una sola: *un fitxer desat amb la versió 2.1.0, s'obre, es torna a desar i es veu
exactament igual després del canvi?*

## Regla: no es toquen mai

Són el format **d'abans**. Si el format canvia, s'hi **afegeixen** fixtures noves (`08-…`) i
aquestes es queden com estan: regenerar-les amb el codi nou convertiria la prova de regressió en una
prova que sempre passa.

## D'on surten

Al repositori no hi havia cap `.saac` d'usuari real: només `e2e/fixtures/dues-sequencies.saac`, que
és sintètic i de format antic. Aquests s'han construït reproduint exactament el que escriu
`ModalDownload.tsx` a la 2.1.0 (`JSON.stringify` sense espais, `defaultSettings` abans que
`documentState`, camps `undefined` omesos) amb els valors per defecte de `defaultSettingsConfig.ts`,
`viewSettingsConfig.ts` i la manera com `useSearchPictogram` crea cada pictograma. Dues comprovacions
en garanteixen la fidelitat:

- **Tipus**: cada fitxer quadra amb `DocumentSAAC`, `DefaultSettings` i `Sequence` (`tsc`).
- **Anada i tornada** (`e2e/saac-fixtures.spec.ts`): l'app de debò obre els fitxers de format 2.1.0
  i, en tornar-los a desar, en surt **el mateix fitxer byte a byte**.

Els ids d'ARASAAC són versemblants però no s'han contrastat amb l'API (no era accessible en generar
els fitxers). No importa: les proves serveixen les imatges des de `e2e/fixtures/images/`.

> **Pendent**: afegir-hi un o dos `.saac` d'usuaris reals, amb permís i sense dades personals (el
> camp `author`, el títol i les imatges pròpies poden identificar algú), a `reals/`. Els sintètics
> cobreixen les formes que coneixem; els reals cobreixen les que no.

## Els fitxers

`manifest.json` en recull les expectatives en format llegible per màquina (pestanyes, pictogrames
per pestanya, pestanya activa, si porta configuració global i què se n'espera en tornar-lo a desar).

| Fitxer | Format | Pestanyes (pictogrames) | Config. global | Què cobreix |
|---|---|---|---|---|
| `01-una-pestanya` | 2.1.0 | 1 (7) | no | document nou; pictograma no trobat; imatge alternativa; text propi |
| `02-diverses-pestanyes` | 2.1.0 | 4 (3, 5, 4, 0) | sí | document del núvol (id Mongo, títol, autor, `order`); pestanya buida; activa ≠ 0; vista diferent per pestanya |
| `03-fonts-personalitzades` | 2.1.0 | 2 (6, 4) | sí | les sis fonts pròpies i dues de Google; numeració; creu; B/N; vores; imatge pròpia en base64 i a Cloudinary |
| `04-molts-pictogrames` | 2.1.0 | 3 (60, 24, 1) | no | volum; valors extrems de mida (0.4 / 3.8) i espai (0 / 10) |
| `05-nomes-configuracio` | 2.1.0 | — | sí | fitxer sense `documentState` |
| `06-format-antic-sense-viewsettings` | antic | 2 (2, 3) | no | sense `viewSettings`; `order` i `defaultSettings` a `null` |
| `07-format-primitiu-sequence` | primitiu | 1 (3) | no | clau `sequence` en lloc de `documentState` |

## El que cal saber del format abans de migrar-lo

- **Dues claus opcionals i independents** al primer nivell: `defaultSettings` (la configuració global,
  només si l'usuari marca la casella, que surt desmarcada) i `documentState` (el document). Un fitxer
  pot portar-ne una, l'altra o totes dues. El carregador (`AppNavigationDrawer.tsx`,
  `handleFileLoad`) encara accepta una tercera, `sequence`, del format primitiu.
- **No hi ha número de versió.** La migració l'ha de deduir de la forma: `sequence` → primitiu;
  `documentState` sense `viewSettings` → antic; la resta → 2.1.0. El `schemaVersion` nou ha de ser
  opcional en llegir, i un fitxer sense ha de voler dir «2.1.0 o anterior».
- **La pàgina no és al fitxer.** Mida, orientació, direcció i separació entre seqüències viuen a
  `ui.viewSettings` (preferència de l'usuari i esborrany), no al document (vegeu B20 a
  `docs/BACKLOG-ux.md`). El `Page { size, orientation, layoutMode }` del mode lliure és camp nou:
  un fitxer antic l'ha de prendre de les preferències, que és el que fa avui.
- **Entrar a la vista esborra la vista per seqüència del fitxer** (B25 al backlog): els
  `viewSettings` del `.saac` se substitueixen per les preferències globals en muntar-se la columna.
  Les captures de referència recullen aquest comportament tal com és avui. La disposició lliure que
  s'hi afegeixi no pot anar pel mateix camí.
- **El carregador no valida ni normalitza gairebé res**: `loadDocumentSaac` només omple els
  `viewSettings` que falten. Les normalitzacions de formats vells (`alignment` únic →
  `alignmentH`/`alignmentV`, `fitzgerald` com a objecte `{ value, color }`) viuen només a l'API
  (`apps/api/src/modules/documents/model.ts`, `serializeDocument`). Segons l'historial, el web no
  ha escrit mai aquestes formes en un fitxer, però si la migració nova es fa en un sol punt, és bo
  que les accepti totes dues.
- **Carregar un fitxer amb configuració global substitueix la de l'usuari** a l'estat (no a les
  preferències desades).
- **Les imatges pròpies** van a `img.url`: `data:image/…;base64` sense compte, URL de Cloudinary
  amb compte. Són el gruix del pes del fitxer (`03` fa 57 KB per dues imatges).

## Com s'executen

```bash
npm run dev                                   # a apps/web, en una altra terminal
npx playwright test e2e/saac-fixtures.spec.ts
```

Per cada fixture: s'obre amb les pestanyes i els pictogrames esperats; tornar-lo a desar dona el
mateix document; i la vista es pinta igual que la captura de referència
(`e2e/saac-fixtures.spec.ts-snapshots/`).

Les captures depenen de la plataforma (el nom porta `-linux`). Les que hi ha s'han fet a Linux amb
el codi de la 2.1.0, **abans de cap canvi del mode lliure**. Per tenir-les en una altra plataforma,
cal generar-les amb `--update-snapshots` des del commit que les va afegir, no des d'un de posterior:
una captura feta amb el codi nou no demostra res.
