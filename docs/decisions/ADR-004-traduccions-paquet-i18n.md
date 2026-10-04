# ADR-004: Traduccions en un paquet compartit, sense compilació ni Crowdin

- **Estat**: acceptada i aplicada (2026-10-04). Els cinc passos del pla són fets; el que es va
  ajustar en implementar-los és a «Com ha quedat», al final.
- **Substitueix**: el flux «fonts a `apps/web/languages/` → `formatjs compile` → `apps/web/src/languages/`»
  i la configuració de Crowdin (`apps/web/crowdin.yml`).
- **Estàndard afectat**: «Traduccions» de `docs/estandards/estat-i-persistencia.md` i la skill
  `language` (`.claude/skills/language.md`). S'actualitzen a mesura que es fa cada pas.

## Context

Les traduccions del projecte viuen avui en tres llocs que no es parlen:

- **La interfície** (`apps/web/languages/*.json`): 729 claus per idioma, amb el text i una
  descripció. Es compilen a AST amb `formatjs compile` dins del `build` del web, i els compilats
  queden fora del repositori (`.gitignore`). El pas de compilació ja ha fallat en silenci un cop: a
  la 2.2.0, la notícia `documents-everywhere` tenia la traducció a la font però no a producció,
  perquè el desplegament va reaprofitar compilats antics.
- **Els correus** (`apps/api/src/shared/mailer.ts` i `emailLayout.ts`): els textos dels cinc
  idiomes estan escrits dins del codi, en taules `Record<LangsApp, …>`.
- **La llista d'idiomes** apareix tres vegades: el tipus `LangsApp` (`packages/shared-types`), la
  llista de valors de l'API (`apps/api/src/shared/langsApp.ts`) i la del web
  (`apps/web/src/configs/languagesConfigs.ts`, `langTranslateApp`). Afegir un idioma vol dir
  recordar-se de totes tres.

**Crowdin ja no el fa servir ningú.** `crowdin.yml` hi és, però ningú no tradueix allà. El que sí
que es vol conservar és el que Crowdin aportava: **clau + text + descripció per a qui tradueix**, i
saber què falta per traduir.

L'objectiu: **un sol lloc per als idiomes i els textos, compartit pel front i pel back, sense cap
pas de compilació de traduccions del qual depengui el desplegament, i amb una xarxa de seguretat
que trobi els errors abans de producció.**

## Decisió

1. **Un paquet nou, `packages/i18n` (`@sequence-arasaac/i18n`)**, és l'única font de veritat dels
   idiomes i dels textos traduïbles del front i del back.
2. **`LANGS_APP` (a `packages/i18n/src/locales.ts`) és l'única llista d'idiomes.** El tipus
   `LangsApp`, l'idioma per defecte (`DEFAULT_LANGS_APP`, `ca`) i la normalització
   (`toLangsApp`) en surten. `shared-types` en reexporta el tipus perquè els imports actuals no
   canviïn. Afegir un idioma és afegir-lo aquí i posar-ne els fitxers de textos.
3. **Els textos s'organitzen per espais de noms**, una carpeta per a cadascun i un fitxer per idioma:
   `messages/app/` (la interfície), `messages/errors/` (els textos dels codis d'error de l'API) i
   `messages/email/` (els correus). Un espai de noms nou és una carpeta nova.
4. **El català és l'idioma font.** Cada entrada de `ca.json` porta `message` i `description`; els
   altres idiomes porten només `"clau": "text"`. La descripció és per a qui tradueix i viu en un
   sol lloc, no repetida cinc vegades.
5. **Es carreguen les fonts directament, sense compilar-les.** Els textos són ICU, i
   l'intèrpret d'ICU (el de `react-intl` al front, `@formatjs/intl` al back) els llegeix en temps
   d'execució. Desapareixen `formatjs compile`, `scripts/compile-languages.mjs`, el pas de
   traduccions del `build` i del `prepare`, i els fitxers compilats.
6. **El front carrega només l'idioma actiu** amb `import()` dinàmic. Avui es carreguen tots cinc a
   l'inici.
7. **El back no envia mai text a l'API: envia codis.** Ja és així (`INVALID_CREDENTIALS` →
   `error.INVALID_CREDENTIALS` al front); es manté. Els codis queden tipats en un `ApiErrorCode`
   compartit, i cada codi ha de tenir el seu text a `messages/errors/`.
8. **Els correus fan servir el catàleg `email` amb `@formatjs/intl`**: el mateix motor i la mateixa
   sintaxi ICU que el front (plurals, `select`, variables).
9. **Les claus són tipades sense generar codi**: el tipus de les claus es treu del JSON font
   (`keyof typeof ca`). Una clau mal escrita la detecta `npm run typecheck`.
10. **Un test substitueix el compilador i Crowdin alhora.** Entra al `npm test` que ja reparteix
    Turbo i comprova, per a cada espai de noms:
    - que cada idioma té exactament les claus del català (ni en falta cap ni n'hi sobra cap);
    - que cada text es pot interpretar com a ICU;
    - que cada traducció usa les mateixes variables que el català;
    - que cada `ApiErrorCode` té text, i que cada `id` dels `.lang.ts` existeix a `app/ca.json`.

    Quan falla, diu la clau i l'idioma: és la llista de feina pendent de traducció.
11. **El paquet es compila per al back com qualsevol altre codi TypeScript.** L'API s'executa amb
    `node dist/index.js` i no pot carregar `.ts`, així que `packages/i18n` té un `build` (`tsc` a
    `dist/`, CommonJS). El web en consumeix directament la font (condició `import` dels `exports`),
    i l'API la versió compilada (condició `require`). Turbo ja construeix les dependències abans
    (`build` depèn de `^build`), i Render ja crida `turbo build --filter=api`: **no hi ha cap pas
    nou per a qui desplega**. No és una compilació de traduccions: els JSON es copien tal qual.
12. **Les claus actuals de la interfície es mantenen.** No es reanomena res en migrar, llevat dels
    textos d'error, que passen a `errors/` amb la clau `error.<CODI>` (pas 3).

## Pla de migració

Cada pas es pot desplegar sol i deixa l'app funcionant.

1. **El paquet i la llista d'idiomes**: crear `packages/i18n` amb `locales.ts`; `shared-types`,
   l'API i el web en treuen la llista d'idiomes. Esborrar `apps/api/src/shared/langsApp.ts`.
2. **La interfície**: moure `apps/web/languages/` a `messages/app/` (font en català amb
   descripció, la resta només text), carregar-les directament i només l'idioma actiu, i afegir el
   test de coherència. Treure la compilació, `crowdin.yml` i el `README` de `languages`.
3. **Els errors**: separar els `error.*` a `messages/errors/` i tipar `ApiErrorCode`.
4. **Els correus**: passar els textos de `mailer.ts` i `emailLayout.ts` a `messages/email/` i
   usar `createTranslator(locale)` de `packages/i18n/src/server.ts`.
5. **La documentació**: actualitzar la secció «Traduccions» de l'estàndard, la skill `language` i
   el `CLAUDE.md`.

## Alternatives descartades

| Alternativa | Per què no |
|---|---|
| Continuar compilant en desplegar (com ara) | El desplegament depèn d'un pas que ja ha fallat en silenci un cop (2.2.0), i el back continuaria amb els seus textos a part |
| Pujar els compilats al repositori (treure'ls del `.gitignore`) | Dues còpies de cada traducció que es poden desajustar: si algú edita la font i no recompila, producció ensenya el text vell sense cap avís. Diffs d'AST illegibles. Caldria un test més per vigilar que coincideixen |
| Llegir les fonts directament però només al web | Resol el desplegament del web, però deixa els correus i la llista d'idiomes duplicats al back |
| Mantenir Crowdin | Ningú no hi tradueix. El test de coherència dona la llista del que falta, que era el que se'n feia servir |
| Descripció repetida a tots els idiomes | Cinc còpies del mateix comentari que es desajusten. Qui tradueix la llegeix al català |
| Generar un fitxer de tipus per a les claus | Seria un altre pas de generació a mantenir. `keyof typeof` sobre el JSON dona el mateix sense res a generar |
| Una altra biblioteca (i18next, etc.) | Canviaria les 108 crides a `defineMessages` i els 84 fitxers que fan servir `react-intl`, per tenir el mateix. `@formatjs/intl` és el motor de `react-intl`, i al back dona la mateixa sintaxi |
| Separar la interfície en molts fitxers per funcionalitat | 729 claus en un fitxer per idioma es manegen bé avui. Els espais de noms ho permeten fer més endavant si cal |

## Conseqüències

- **Cap pas de compilació de traduccions.** Canviar un text és editar un JSON; el que es veu a
  producció és el que hi ha al repositori.
- **Els errors de traducció surten al `npm test`**, no a la pantalla d'un usuari: una clau que
  falta, una `{` sense tancar o una variable perduda fan fallar el test amb la clau i l'idioma.
- **El bundle del web inclou l'intèrpret d'ICU.** Ja l'incloïa (no hi ha l'alias que el treu a
  `vite.config.ts`). Interpretar les claus en carregar costa pocs mil·lisegons.
- **El back depèn de `packages/i18n` en temps d'execució** (decisió 11): cal que `dist/` existeixi.
  En desenvolupament, el `dev` del paquet el manté al dia; en desplegar, Turbo el construeix.
- **Afegir un idioma** és una entrada a `LANGS_APP` i un fitxer per espai de noms. Els tipus i el
  test marquen tot el que falta.
- **Qui tradueix** treballa amb el JSON en català (text i descripció) al costat del JSON del seu
  idioma, o amb la skill `language`.

## Com ha quedat

El que es va ajustar respecte de les decisions en aplicar el pla:

- **Claus tipades (decisió 9), només on el codi les escriu**: als correus (`EmailMessageKey`, de
  `messages/email/ca.json`) i als codis d'error (`ApiErrorCode`, `ErrorCodeWithText`). Les claus de
  la interfície continuen sent text lliure als `.lang.ts`, perquè `defineMessages` de react-intl hi
  espera un `string`; la barrera allà és el test que comprova que cada `id` del codi existeix a
  `app/ca.json`.
- **Codis d'error (decisió 7)**: hi ha 45 codis de l'API (`API_ERROR_CODES`). 12 no tenen text
  (`API_ERROR_CODES_WITHOUT_TEXT`): no arriben a l'usuari tal qual i, si n'arriba un, s'ensenya el
  genèric del context, com abans. El front en té 5 de propis (`CLIENT_ERROR_CODES`). Es van esborrar
  tres textos que l'API ja no enviava (`VERIFICATION_RESEND_TOO_SOON`, `VERIFICATION_RESEND_LIMIT`,
  `EMAIL_ALREADY_VERIFIED`).
- **El traductor del back és una entrada a part** (`@sequence-arasaac/i18n/server`), perquè el web
  no s'emporti els catàlegs de correu ni `@formatjs/intl`. L'API, amb `moduleResolution: node`, la
  troba per `typesVersions`.
- **La compilació del paquet (decisió 11) té l'arrel a `packages/i18n`**, no a `src/`: així els
  catàlegs que importa `server.ts` es copien a `dist/messages/` i el camí relatiu és el mateix des de
  `src/` i des de `dist/src/`.
- **L'avís intern d'error** continua amb els textos en català dins de `mailer.ts`: el llegeix una
  sola persona i no es tradueix.
- **Es van esborrar restes del sistema antic**: `vite-plugin-i18n` (només actuava sobre els
  compilats), i el `vite.config.ts` i els compilats `src/languages/` de l'arrel del repositori,
  d'abans del monorepo.
