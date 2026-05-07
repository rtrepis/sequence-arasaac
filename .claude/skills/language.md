# Skill: language

Gestiona l'addició o modificació de traduccions i18n en aquest projecte.

## Flux obligatori

Sempre que afegeixis o modifiquis traduccions:

1. **Edita els fitxers FONT** a `apps/web/languages/` (ca, es, en, fr, it)
   - Format: `"clau": { "defaultMessage": "text", "description": "descripció" }`
   - MAI editis directament `apps/web/src/languages/` — aquests fitxers es generen automàticament

2. **Actualitza el `.lang.ts`** corresponent amb `defineMessages` si es tracta de missatges nous

3. **Compila** des de `apps/web/`:
   ```bash
   cd apps/web && npm run prepare
   ```
   Això executa `scripts/compile-languages.mjs` que crida `formatjs compile` per a cada idioma i genera els fitxers AST a `src/languages/`.

4. **Verifica** que els fitxers compilats contenen les noves claus:
   ```bash
   grep "la.clau.nova" apps/web/src/languages/ca.json
   ```

## Estructura de fitxers

```
apps/web/
├── languages/          ← FONTS (edita aquí)
│   ├── ca.json
│   ├── es.json
│   ├── en.json
│   ├── fr.json
│   └── it.json
└── src/languages/      ← COMPILATS (no tocar)
    ├── ca.json
    ├── es.json
    ├── en.json
    ├── fr.json
    └── it.json
```

## Idiomes del projecte

| Codi | Idioma | Notes |
|------|--------|-------|
| `ca` | Català | Idioma principal, sempre el primer |
| `es` | Castellà | |
| `en` | Anglès | |
| `fr` | Francès | |
| `it` | Italià | |

## Convenció de claus

- Format: `domini.subdomini.clau` en camelCase
- Exemples:
  - `features.backend.auth.loginTitle`
  - `features.backend.auth.error.INVALID_CREDENTIALS`
  - `components.settingCard.title`
- Les claus d'error del backend usen UPPER_SNAKE_CASE: `error.CODI_ERROR`

## Format font JSON

```json
{
  "clau.del.missatge": {
    "defaultMessage": "Text en l'idioma corresponent",
    "description": "Comentari en català per als traductors"
  }
}
```

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

- [ ] Afegit als 5 fitxers font (ca, es, en, fr, it)
- [ ] Actualitzat el `.lang.ts` si cal
- [ ] Executat `npm run prepare` des de `apps/web/`
- [ ] Verificat que `src/languages/` conté les claus noves
