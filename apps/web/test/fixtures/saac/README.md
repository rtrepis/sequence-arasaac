# Fixtures `.saac`

Fitxers `.saac` de referència per a les proves de regressió del canvi de model de dades del **mode
lliure** (encàrrec a la branca `feature/mode-lliure`, `docs/spec-mode-lliure.md`, §4 i §12). La pregunta que
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
- **Anada i tornada** (`e2e/saac-fixtures.spec.ts`): l'app de la 2.1.0 obria els fitxers de format
  2.1.0 i, en tornar-los a desar, en sortia **el mateix fitxer byte a byte**. Des de l'esquema 2,
  tornar a desar un fitxer de la 2.1.0 en dona el mateix document **amb l'estil a dins**; el que
  continua sortint byte a byte és l'anada i tornada d'un fitxer de l'esquema 2 (08 i 09).

Els ids d'ARASAAC són versemblants però no s'han contrastat amb l'API (no era accessible en generar
els fitxers). No importa: les proves serveixen les imatges des de `e2e/fixtures/images/`.

> **Pendent**: afegir-hi un o dos `.saac` d'usuaris reals, amb permís i sense dades personals (el
> camp `author`, el títol i les imatges pròpies poden identificar algú), a `reals/`. Els sintètics
> cobreixen les formes que coneixem; els reals cobreixen les que no.
>
> **Pendent també**: el camí amb compte (desar al núvol, imatges a Cloudinary). Es farà quan es
> tornin a encendre els comptes: vegeu P1 a `docs/BACKLOG-ux.md`.

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
| `08-esquema-2-sequencia` | esquema 2 | 4 (3, 5, 4, 0) | dins del document | el 02 desat amb «Desa el document»: estil dins del document; anada i tornada byte a byte |
| `09-esquema-2-estil.saacstyle` | esquema 2 | — | és un estil | el 02 desat amb «Desa l'estil en un fitxer…» |
| `10-estil-parcial` | 2.1.0 | 1 (7) | parcial | el 01 amb una configuració d'abans de `numberFont`: fusió camp a camp |
| `11-una-pestanya.saac.txt` | 2.1.0 | 1 (7) | no | el 01 byte a byte, amb el nom que li posava el mòbil: el tipus es decideix pel contingut |
| `12-imatge-repetida` | 2.1.0 | 2 (3, 3) | no | una imatge en base64 tres cops i una de Cloudinary dues: al v3 hi ha d'haver dos `assets` |
| `13-malmes` | — | — | — | la meitat del 02: no s'ha de poder obrir, i s'ha de dir |
| `14-versio-99` | v3, `schemaVersion: 99` | 1 (2) | dins del document | una versió més nova: s'obre, avisa i conserva els camps que no coneix |
| `15-paper-carta` | v3 | 1 (2) | dins del document | pàgina en paper Carta (`LETTER`): s'obre en Carta i es torna a desar igual; amb una mida desconeguda, cau a la de qui obre |

Les 08 i 09 les ha escrit l'app (obrir el 02 i desar-lo), no s'han fet a mà; la 10 sí, a partir de
la 01. La captura del 08 és idèntica, píxel a píxel, a la del 02: és la prova que una seqüència es
veu igual després de desar-la en el format nou i tornar-la a obrir.

Les 11–14 s'han afegit amb el format v3 (`docs/decisions/ADR-003-model-document-saac-v3.md`), a
mà: la 11 és una còpia exacta de la 01, la 12 fa servir les imatges de la 03 i la 14 segueix
l'esquema `docs/schema/saac-v3.schema.json`. Els tests del model v3 són a
`src/features/sequence/saac/saac.test.ts` i fan servir totes les fixtures.

## El que cal saber del format

> Des del **model v3** (`docs/decisions/ADR-003-model-document-saac-v3.md`) l'app escriu sempre
> el format v3 (`format: "sequenciaac"`, `schemaVersion: 3`), i l'esquema 2 de la branca
> `claude/sequencia-estil-b25-16pluv` va ser un pas intern que no es va publicar. Els punts de sota
> descriuen el format **d'abans** (el de les fixtures 01–07), que el lector continua acceptant sencer
> i migra al v3 en obrir-lo (`docs/fonaments/06-compatibilitat-i-dades.md`, §4).

- **Dues claus opcionals i independents** al primer nivell: `defaultSettings` (la configuració global,
  només si l'usuari marca la casella, que surt desmarcada) i `documentState` (el document). Un fitxer
  pot portar-ne una, l'altra o totes dues. El carregador (`AppNavigationDrawer.tsx`,
  `handleFileLoad`) encara accepta una tercera, `sequence`, del format primitiu.
- **No hi havia número de versió.** El lector (`features/sequence/style/saacFile.ts`) el dedueix
  de la forma: `sequence` → primitiu; `documentState` sense `viewSettings` → antic; la resta →
  2.1.0. Un fitxer sense `schemaVersion` vol dir «2.1.0 o anterior».
- **La pàgina no és al fitxer.** Mida, orientació i direcció viuen a `ui.viewSettings`
  (preferència de l'usuari i esborrany), no al document; l'esquema 2 ja admet `layout`, i portar-la
  al fitxer és B26 a `docs/BACKLOG-ux.md`. La separació entre seqüències sí que hi va ara, com a
  part de l'estil (`styleView`). El `Page { size, orientation, layoutMode }` del mode lliure és camp
  nou: un fitxer antic l'ha de prendre de les preferències, que és el que fa avui.
- **Entrar a la vista esborrava la vista per seqüència del fitxer** (B25, ✅ resolta): els
  `viewSettings` del `.saac` se substituïen per les preferències globals en muntar-se la columna.
  Ja no: cada pestanya es veu amb la seva vista. Les captures de 01–04 s'han regenerat a propòsit
  per aquest motiu, i totes sis perquè la lletra de reserva és ara sans-serif (el test bloqueja
  Google Fonts); vegeu la nota de B25 al backlog.
- **El carregador valida i normalitza en un sol punt** (`saacFile.ts`): fusió camp a camp dels
  estils parcials, i les formes velles que abans només entenia l'API (`alignment` únic,
  `fitzgerald` com a objecte).
- **Carregar un fitxer amb configuració global ja no substitueix la de l'usuari**: aquella
  configuració és l'estil de la seqüència. Un fitxer que **només** porta configuració (05)
  s'interpreta com a fitxer d'estil.
- **Les imatges pròpies** van a `img.url`: `data:image/…;base64` sense compte, URL de Cloudinary
  amb compte. Són el gruix del pes del fitxer (`03` fa 57 KB per dues imatges).

## Com s'executen

```bash
npm run dev                                   # a apps/web, en una altra terminal
npx playwright test e2e/saac-fixtures.spec.ts e2e/saac-v3.spec.ts
```

Per cada fixture: s'obre amb les pestanyes i els pictogrames esperats; tornar-lo a desar dona el
mateix document amb el seu estil (i, de l'esquema 2, el mateix fitxer); i la vista es pinta igual
que la captura de referència (`e2e/saac-fixtures.spec.ts-snapshots/`). Els tests unitaris de la
lectura, la fusió i la migració són a `src/features/sequence/style/*.test.ts` i fan servir aquestes
mateixes fixtures (`npx vitest run src/features/sequence`).

Les captures depenen de la plataforma (el nom porta `-linux`). Les de 01–07 es van fer a Linux amb
el codi de la 2.1.0 i **s'han regenerat a propòsit una vegada**, en resoldre B25: cada canvi hi és
explicat a la nota de B25 de `docs/BACKLOG-ux.md` (la vista del fitxer, que abans s'esborrava, i la
lletra de reserva). Per tenir-les en una altra plataforma, cal generar-les amb `--update-snapshots`
des del commit que les va regenerar, no des d'un de posterior: una captura feta amb el codi nou no
demostra res.
