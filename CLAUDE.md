# Regles del projecte

- Usa TypeScript estricte, res amb `any`
- Comentaris sempre en català
- No afegir funcionalitat que no ha estat demanada
- Totes les components han de ser funcionals (no classes)
- Sempre usar arrow functions

> **Aquest fitxer és l'índex, no el manual.** Els estàndards viuen a
> `docs/estandards/` i es llegeixen **quan es toca l'àrea corresponent** (vegeu
> «Índex d'estàndards», al final). Carregar-los tots a cada sessió costaria unes
> 30.000 paraules de context que gairebé mai no fan falta senceres.

## Descripció del projecte

App per crear seqüències de pictogrames (ARASAAC), previsualitzar-les i imprimir-les.
Té dos pàgines principals:
- **Edició** (`/create-sequence`): es construeix la seqüència afegint pictogrames
- **Visualització** (`/view-sequence`): es previsualitza amb control de mida dels pictogrames i separació entre files i columnes. Permet imprimir i veure a full screen.

Funciona sencer **sense compte**: la configuració i les seqüències es guarden al navegador (`sessionStorage`/`localStorage`). Amb un compte (opcional), la configuració d'usuari i el vocabulari personal es desen al núvol i se sincronitzen entre dispositius — vegeu `docs/estandards/backend.md`.

## Tech stack

**Monorepo** (npm workspaces + Turborepo, `turbo.json`): `apps/web` (front), `apps/api` (back) i `packages/shared-types` (tipus compartits). Cada workspace té el seu propi `package.json`; les ordres `npm run dev|build|lint|test` a l'arrel les reparteix Turbo a cada workspace (`--filter=<workspace>` per acotar-ne un).

**Front (`apps/web`)**:
- **React 18** + **TypeScript** (Vite, `@vitejs/plugin-react-swc`)
- **Redux Toolkit** — estat global amb 2 slices: `uiSlice` (`features/user-settings`) i `documentSlice` (`features/sequence`)
- **React Router v6** — enrutament amb paràmetre `/:locale`
- **MUI (Material UI)** + **Emotion** — components UI i estils
- **react-intl** — multiidioma (ca, es, en, fr, it)
- **Path aliases** (`vite.config.ts` i `tsconfig.json`, han de coincidir): `@/*` → `src/*`, `@features/*`, `@shared/*`, `@app/*`, `@components/*`

**Back (`apps/api`)**:
- **Express** + **TypeScript**, executat amb `tsx` en dev
- **MongoDB** + **Mongoose** — persistència de documents, usuaris i esdeveniments de seguretat
- **Zod** — validació d'entrada i de variables d'entorn (`config/env.ts`)
- **JWT** (access + refresh amb cookie `httpOnly`) — autenticació
- **Cloudinary** — imatges personalitzades de vocabulari
- **Resend** — correu transaccional (verificació, avisos d'error)
- Desplegat a **Render** (pla gratuït: el contenidor s'adorm als 15 min d'inactivitat — vegeu `docs/estandards/backend.md`)

**Tipus compartits (`packages/shared-types`)**: tipus de domini (`document.ts`, `sequence.ts`, `ui.ts`, `admin.ts`, `FontFamily.ts`) importats com a `@sequence-arasaac/shared-types` tant des del front com del back, perquè el contracte de l'API i el model de Redux no divergeixin.

## Estructura clau

```
apps/
├── web/
│   ├── languages/           # Traduccions FONT (ca, es, en, fr, it) — editar aquí
│   ├── e2e/                 # Tests Playwright (captures/vídeos de funcionalitats)
│   └── src/
│       ├── pages/            # Pàgines (WelcomePage, EditSequencesPage, ViewSequencePage, AdminPage...)
│       ├── components/       # Components reutilitzables (SettingsLayout, AppTabs, PictogramCard...)
│       ├── Modals/           # DefaultSettingsModal, PictEditModal, PictEditModalList
│       ├── features/         # Features modularitzades:
│       │   ├── backend/        #   crida a l'API: api/ (apiClient, wake-up), auth/, documents/, user-settings/
│       │   ├── user-settings/  #   estat local (Redux) + persistència al navegador
│       │   ├── sequence/       #   documentSlice, contingut de les seqüències
│       │   ├── print/          #   hooks d'impressió i format de pàgina
│       │   ├── pictogram/      #   cerca i keywords d'ARASAAC
│       │   ├── word-profile/   #   vocabulari personal
│       │   ├── admin/          #   panell d'administració
│       │   └── ai-search/
│       ├── app/               # Redux store (store.ts, hooks.ts)
│       ├── types/              # Tipus locals (estenen els de shared-types)
│       ├── style/               # palette.ts, themeMui.ts (única font de veritat de colors)
│       ├── languages/          # JSON COMPILATS (AST react-intl) — generats, no editar
│       └── configs/            # Configuracions generals
├── api/
│   └── src/
│       ├── modules/          # Un mòdul per domini, cadascun amb controller/service/model/routes/validators:
│       │   ├── auth/           #   registre, login, refresh, verificació de correu
│       │   ├── documents/      #   CRUD de seqüències desades + assets Cloudinary
│       │   ├── user-settings/  #   configuració UI sincronitzada (PUT /user/ui-settings)
│       │   ├── client-errors/  #   registre d'errors arribats a l'usuari + avís per correu
│       │   ├── admin/          #   panell d'administració (requireAdmin)
│       │   ├── config/         # interruptor de registre / sostre d'usuaris (a BD)
│       │   └── security/       #   SecurityEvent (traça antiabús, TTL 30 dies)
│       ├── middleware/       # authMiddleware, requireAdmin, requireVerifiedEmail, errorHandler
│       ├── shared/            # emailCanonical, ipHash, tierLimits, mailer, mongooseSchemas, zodSchemas
│       └── config/            # env.ts (validació zod de l'entorn), database.ts
└── packages/shared-types/    # Tipus de domini compartits pel front i el back
```

## Build i compilació

- Ordres a l'arrel del monorepo (`npm run dev|build|lint|test|typecheck`) les reparteix **Turbo** a tots els workspaces; `--filter=web` o `--filter=api` acota a un de sol.
- **`npm run typecheck` és l'única barrera de tipus, i cal passar-la abans de donar res per bo.** `vite build` **no** comprova tipus: `@vitejs/plugin-react-swc` els llença sense mirar-los, i ESLint no els mira tampoc. Un `✓ built` verd al web no vol dir que el TypeScript quadri. (Aquest apartat deia el contrari fins a la branca `claude/document-limit-users-sjig8o`; hi havia codi de producció amb tipus trencats que passava el build cada dia.)
- **Front** (`apps/web`): `npm run typecheck` = `tsc --noEmit`; `npm run lint` = `eslint ./src`; `npm run build` = `vite build` (només empaqueta). `npm test` i `npm run test-coverage` són encara placeholders (`echo ... && exit 0`) tot i que el workspace té `@testing-library/react`, `msw` i tests `.test.ts(x)` reals — no assumir que `npm test` executa res. Els tests e2e (captures/vídeos de funcionalitats) van amb **Playwright** (`apps/web/playwright.config.ts`, carpeta `e2e/`).
- **Back** (`apps/api`): `npm run typecheck` i `npm run lint` són tots dos `tsc --noEmit` (el nom `lint` hi era abans); `npm test` = `vitest run` (usa `mongodb-memory-server`, per això els fitxers `*.test.ts` i `src/test/` queden exclosos del `tsconfig.json` de build/producció).
- **Els tests del web queden fora del `typecheck`** (`exclude` del `tsconfig.json`: `*.test.*`, `setupTests.ts`, `test-utils.tsx`), com a l'API. Ja hi havien de ser des de sempre, però l'`exclude` tenia les dues rutes dins d'una sola cadena separades per una coma i no excloïa res. La suite no compila contra el codi actual (referencia un `sequenceSlice` que ja no existeix i props que han canviat): mentre no es revisqui o s'esborri, no pot ser la barrera de ningú. Vegeu C10 de `docs/BACKLOG-ux.md`.
- **`npm run lint` del web surt vermell amb errors preexistents** (13, a `test-utils.tsx` i a pàgines soltes): quan s'hi passa, cal filtrar la sortida amb grep pels fitxers tocats per verificar que els errors nous no són nostres. El `typecheck`, en canvi, ha d'estar **net**: si en surt un, és nostre.
- `test-utils.tsx` (`apps/web/src/utils`) conté una mock de l'estat Redux, avui **desincronitzada** amb l'store real. No serveix de referència fins que es refaci.
- Desplegament: front a **Vercel**, back a **Render** (`render.yaml`, `buildCommand: npx turbo build --filter=api`) — vegeu «Desplegament» a `docs/estandards/comptes-i-quotes.md` per als detalls de per què han de compartir origen.

## Hooks principals

| Hook | Ubicació | Rol |
|------|----------|-----|
| `usePageFormat` | `features/print/hooks` | Formats de pàgina (A4, A3, FULLSCREEN) i orientació |
| `useScaleCalculator` | `features/print/hooks` | Càlcul d'escales segons DPI i dimensions |
| `usePrintStyles` | `features/print/hooks` | Estils dinàmics per impressió |
| `useFullScreen` | `features/print/hooks` | Mode fullscreen |
| `useArasaacKeywords` | `features/pictogram/hooks` | Connexió amb API ARASAAC per obtenir pictogrames |
| `useSaveUiSettings` | `features/backend/user-settings/hooks` | Desat en segon pla de la configuració d'usuari, amb reintent i diàleg d'error (`docs/estandards/backend.md`) |
| `useIsBackendWakingUp` | `features/backend/api` | Estat de «el servidor s'està despertant» per a `BackendWakeUpNotice` |

---

## Regles transversals (no cal obrir cap document per respectar-les)

Són el resum executable dels estàndards. **Quan una d'aquestes regles entri en joc
de debò —o quan calgui saber-ne el perquè— cal obrir el document de l'àrea**, que és
on viu el criteri complet i el motiu de cada decisió.

- **Colors**: única font de veritat `apps/web/src/style/palette.ts`. Mai un hexadecimal,
  un `rgba` ni un nom de color CSS fora d'aquell fitxer. El verd **no és mai color de
  text ni d'icona**; sobre verd, sempre `primary.contrastText`.
- **Tres superfícies**: full (`sheetSurface`, blanc en tots dos temes), escriptori
  (`background.default`) i zona de configuració (`background.paper`). El que està
  **sobre el full no s'adapta mai al tema**.
- **Impressió i PDF sempre en clar**, independentment del tema actiu.
- **Un ajust = una fila = `SettingRow`.** Mai reescriure la fila a mà. Els botons d'un
  panell, sempre via `SettingsActions`; les seccions, via `SectionTitle`.
- **`AppDialog` és l'única manera de declarar un `Dialog`**; `ConfirmDialog`, l'única
  confirmació de l'app; `AppTab`, l'única manera de declarar un tab amb icona i text.
- **Tota acció que l'usuari ha demanat acaba amb un missatge**, vagi bé o malament.
  Mai `disabled` per dir «s'està fent».
- **Les preferències d'usuari només es desen quan l'usuari ho demana**: cap control
  d'una pàgina de treball dispara `saveUserUiThunk` per si sol.
- **Traduccions**: s'editen a `apps/web/languages/*.json` (font) i es compilen a
  `apps/web/src/languages/*.json` (generats, **mai editar-los a mà**). Vegeu la skill
  `language` (`.claude/skills/language.md`).
- **`npm run typecheck` és l'única barrera de tipus**: `vite build` no comprova tipus.
  Cal passar-la neta abans de donar res per bo.
- **Abans de proposar una millora d'UX**, mirar `docs/BACKLOG-ux.md`: si ja hi és, s'hi
  continua (marcant-la resolta o caducada), no s'obre de nou.

## Índex d'estàndards

Cada document és autònom i conté les regles **i el motiu de cada regla**. Llegir-ne un
abans de tocar la seva àrea; no cal llegir-los tots.

| Document | Llegir-lo abans de tocar |
|---|---|
| `docs/estandards/colors.md` | Colors, fons, tema fosc, impressió i PDF |
| `docs/estandards/configuracions.md` | Panells d'ajustos: `SettingsLayout/`, `DefaultSettingsModal`, `PictEditForm`, columna de la pàgina de vista |
| `docs/estandards/navegacio.md` | `AppTabs/`, `TabsEditView`, `BarNavigation`, `UserAvatar` |
| `docs/estandards/capes-flotants.md` | Qualsevol `Dialog`, `Snackbar` o botó flotant |
| `docs/estandards/feedback-i-accions.md` | Progrés, backdrops, snackbars i accions que esborren feina |
| `docs/estandards/estat-i-persistencia.md` | Redux (`uiSlice`, `documentSlice`, `documentStatusSlice`), esborrany d'IndexedDB, imatges pujades, tipografia, traduccions |
| `docs/estandards/backend.md` | `features/backend/*` i els mòduls d'`apps/api` |
| `docs/estandards/comptes-i-quotes.md` | Autenticació, registre, quotes, imatges al núvol, panell d'administració, desplegament |
| `docs/estandards/correus.md` | `apps/api/src/shared/emailLayout.ts` i `mailer.ts` |

## Estudis i feina pendent

Els estàndards diuen **què** s'ha de fer; aquests documents diuen **per què** i **què
queda obert**. Cap d'ells és de lectura habitual: s'hi va quan la pregunta que es té
al davant hi encaixa.

- `docs/BACKLOG-ux.md` recull les troballes obertes de la revisió d'UX, icones i accessibilitat, amb
  fitxer, motiu i proposta. **Consultar-lo abans de proposar una millora d'UX**: si ja hi és, cal
  continuar-hi (marcar-la resolta o caducada), no obrir-la de nou. Una troballa detectada i no
  resolta al moment s'hi apunta; no es deixa només a la conversa.
- `docs/ESTUDI-limits-serveis-gratuits.md` inventaria els límits del pla gratuït de cada servei
  (Atlas, Cloudinary, Render, Vercel, Resend, ARASAAC, GA4) i els contrasta amb el que l'app en
  consumeix de debò. **Consultar-lo abans d'afegir res que desi, pugi o enviï correu**: hi ha les
  troballes L1–L8, de les quals L1–L4 estan resoltes i L5–L8 continuen obertes. La primera de
  les que queden és que els avisos d'error i els correus de verificació comparteixen els 100
  correus diaris de Resend.
- `docs/ESTANDARD-capes-flotants.md` és l'estudi que hi ha darrere de l'estàndard de capes
  flotants: l'inventari del que hi havia, les tretze divergències numerades (F1–F13) amb fitxer i
  motiu, i el pla de migració. L'estàndard viu a `docs/estandards/capes-flotants.md`; **aquest
  document és la raó de cada regla**, i s'hi va a mirar quan una regla sembla arbitrària o quan
  se'n vol canviar alguna.
- `docs/INVENTARI-funcionalitats-des-de-2.0.2.md` recull, per blocs, tot el que l'app fa avui i no
  feia a la 2.0.2. **Consultar-lo quan cal explicar la versió a algú de fora** —una nota de
  llançament, un resum a l'equip— en comptes de tornar a recórrer el registre de commits.
- `docs/NOTICIES-candidates-des-de-2.0.2.md` és la tria editorial que en surt: què d'aquell
  inventari es publica a Novetats i què no, amb la fitxa de cada notícia i el que **no** s'hi ha
  de dir. **Consultar-lo abans d'escriure una entrada de `newsItems.ts`.**
