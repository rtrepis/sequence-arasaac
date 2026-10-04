# Skill: language

Gestiona l'addició o modificació de traduccions i18n en aquest projecte.
El perquè de tot plegat és a `docs/decisions/ADR-004-traduccions-paquet-i18n.md`.

## Flux obligatori

Sempre que afegeixis o modifiquis traduccions:

1. **Edita els catàlegs** a `packages/i18n/messages/<espai>/`: `app/` per a la interfície,
   `errors/` per als textos dels codis d'error.
   - `ca.json` és l'**idioma font**: `"clau": { "message": "text", "description": "per a qui tradueix" }`.
     La descripció va sempre en català i només aquí.
   - `es.json`, `en.json`, `fr.json`, `it.json` porten **només el text**: `"clau": "text"`.
   - Una clau nova va als cinc fitxers. Una clau que s'esborra, també dels cinc.

2. **Actualitza el `.lang.ts`** corresponent amb `defineMessages` si es tracta de missatges nous.

3. **No hi ha res a compilar.** L'app llegeix els JSON tal qual.

4. **Passa les proves**:
   ```bash
   npx turbo test --filter=@sequence-arasaac/i18n --filter=web
   ```
   - `packages/i18n/src/catalog.test.ts`: tots els idiomes tenen les mateixes claus, tots els
     textos són ICU vàlid i usen les mateixes variables que el català. Si falla, diu la clau i
     l'idioma.
   - `apps/web/src/app/providers/AppIntlProvider.test.tsx`: cada `id` del codi existeix a
     `app/ca.json`.

## Estructura de fitxers

```
packages/i18n/
├── messages/
│   ├── app/            ← la interfície del web
│   │   ├── ca.json     ← FONT: text + descripció
│   │   ├── es.json     ← només text
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── it.json
│   └── errors/         ← un text per codi d'error, claus `error.<CODI>`
└── src/
    ├── locales.ts      ← LANGS_APP: l'única llista d'idiomes
    ├── catalog.ts      ← loadAppMessages, toMessages
    └── errors.ts       ← API_ERROR_CODES, errorMessageFor
```

El web carrega només el catàleg de l'idioma actiu amb `AppIntlProvider`
(`apps/web/src/app/providers/`). Cap layout no fa servir `IntlProvider` amb catàlegs directament.

## Idiomes del projecte

| Codi | Idioma | Notes |
|------|--------|-------|
| `ca` | Català | Idioma principal i idioma font, sempre el primer |
| `es` | Castellà | |
| `en` | Anglès | |
| `fr` | Francès | |
| `it` | Italià | |

Afegir-ne un: entrada a `LANGS_APP` (`packages/i18n/src/locales.ts`) i un fitxer per espai de
noms. Les proves marquen tot el que falta.

## Convenció de claus

- Format: `domini.subdomini.clau` en camelCase
- Exemples:
  - `features.backend.auth.loginTitle`
  - `features.backend.auth.deleteDocument`
  - `components.settingCard.title`
- Els textos dels codis d'error van a `errors/` amb la clau `error.<CODI>` (UPPER_SNAKE_CASE), no
  a cap `.lang.ts`. Un codi nou de l'API s'afegeix primer a `API_ERROR_CODES`
  (`packages/i18n/src/errors.ts`); `errors.test.ts` exigeix que cada codi amb text en tingui i que
  el catàleg no en tingui cap de sobres. Al front es fan servir amb `errorMessageFor(codi, genèric)`.

## Format `.lang.ts`

```typescript
import { defineMessages } from "react-intl";

const messages = defineMessages({
  nomClau: {
    id: "clau.del.missatge",
    defaultMessage: "Text per defecte (català)",
    description: "Descripció per als traductors",
  },
});

export default messages;
```

## Checklist

- [ ] Afegit als 5 fitxers de `packages/i18n/messages/app/` (descripció només a `ca.json`)
- [ ] Actualitzat el `.lang.ts` si cal
- [ ] Passen les proves de `@sequence-arasaac/i18n` i de `web`
