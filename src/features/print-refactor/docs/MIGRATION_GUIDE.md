# Guia de Migració: Sistema de Visualització Refactoritzat

## Visió General

Aquesta guia proporciona els passos pràctics per migrar del sistema actual al sistema refactoritzat, assegurant una transició suau i sense disrupcions.

## Estratègia de Migració

### Fase 1: Preparació (1-2 dies)

- ✅ Revisar i entendre la nova arquitectura
- ✅ Configurar tests per a funcions pures
- ✅ Crear branch de desenvolupament

### Fase 2: Implementació Paral·lela (3-5 dies)

- ✅ Afegir nous mòduls sense tocar els existents
- ✅ Validar càlculs amb proves A/B
- ✅ Ajustar petites diferències

### Fase 3: Migració Gradual (5-7 dies)

- ✅ Migrar un component a la vegada
- ✅ Verificar comportament idèntic
- ✅ Desplegar progressivament

### Fase 4: Neteja (2-3 dies)

- ✅ Eliminar codi antic
- ✅ Actualitzar documentació
- ✅ Cleanup final

## Pas a Pas Detallat

### Pas 1: Afegir Nous Fitxers

```bash
# Crear estructura de carpetes si no existeix
mkdir -p src/types
mkdir -p src/hooks

# Copiar els nous fitxers
cp pageFormat.ts src/types/
cp useScaleCalculator.ts src/hooks/
cp usePageFormat.ts src/hooks/
cp useFullscreen.ts src/hooks/
cp useViewManager.ts src/hooks/

# Copiar tests
cp pageFormat.test.ts src/types/
cp useScaleCalculator.test.ts src/hooks/
```

### Pas 2: Executar Tests

```bash
# Executar tests nous
npm test -- --testPathPattern="pageFormat.test"
npm test -- --testPathPattern="useScaleCalculator.test"

# Verificar que tots passen
```

### Pas 3: Crear Component de Transició

Crear un component wrapper que permeti comparar ambdues implementacions:

```typescript
// src/components/ViewSequencesSettings/ViewSequencesSettings.wrapper.tsx

import { useState } from 'react';
import ViewSequencesSettingsOriginal from './ViewSequencesSettings';
import ViewSequencesSettingsRefactored from './ViewSequencesSettings.refactored';

interface Props {
  children: React.ReactElement | React.ReactElement[];
  useRefactored?: boolean; // Flag per activar la nova versió
}

const ViewSequencesSettingsWrapper = ({
  children,
  useRefactored = false
}: Props) => {
  if (useRefactored) {
    return <ViewSequencesSettingsRefactored>{children}</ViewSequencesSettingsRefactored>;
  }

  return <ViewSequencesSettingsOriginal>{children}</ViewSequencesSettingsOriginal>;
};

export default ViewSequencesSettingsWrapper;
```

### Pas 4: Validar Càlculs

Crear un script de validació per comparar resultats:

```typescript
// scripts/validate-calculations.ts

import { calculateDisplayDimensions } from "../src/hooks/useScaleCalculator";
import { createPageFormat } from "../src/types/pageFormat";

// Casos de test basats en valors reals del sistema actual
const testCases = [
  {
    name: "A4 Landscape - Medium Screen",
    pageFormat: createPageFormat("A4", "landscape"),
    screenWidth: 1920,
    screenHeight: 1080,
    expectedScale: 1.54, // Valor del sistema actual (aproximat)
  },
  {
    name: "A3 Portrait - Small Screen",
    pageFormat: createPageFormat("A3", "portrait"),
    screenWidth: 800,
    screenHeight: 600,
    expectedScale: 0.52,
  },
  // Afegir més casos...
];

testCases.forEach((testCase) => {
  const result = calculateDisplayDimensions({
    pageFormat: testCase.pageFormat,
    screenWidth: testCase.screenWidth,
    screenHeight: testCase.screenHeight,
  });

  const scaleDiff = Math.abs(result.scale - testCase.expectedScale);
  const tolerance = 0.05; // 5% de tolerància

  if (scaleDiff > tolerance) {
    console.error(`❌ ${testCase.name}: Scale difference too large`);
    console.error(`   Expected: ${testCase.expectedScale}`);
    console.error(`   Got: ${result.scale}`);
    console.error(`   Diff: ${scaleDiff}`);
  } else {
    console.log(`✅ ${testCase.name}: OK`);
  }
});
```

### Pas 5: Actualitzar ViewSequencePage

Modificar la pàgina per usar el component wrapper:

```typescript
// src/pages/ViewSequencePage/ViewSequencePage.tsx

import ViewSequencesSettingsWrapper from "../../components/ViewSequencesSettings/ViewSequencesSettings.wrapper";

const ViewSequencePage = (): React.ReactElement => {
  const { document } = useAppSelector((state) => state);

  // Feature flag (pot venir de config, Redux, etc.)
  const useRefactoredView = process.env.REACT_APP_USE_REFACTORED_VIEW === 'true';

  return (
    <>
      <ViewSequencesSettingsWrapper useRefactored={useRefactoredView}>
        {Object.entries(document.content).map(([key, sequence]) => (
          <Box key={`sequence-${key}`} /* ... */>
            {sequence.map((pictogram) => (
              <PictogramCard /* ... */ />
            ))}
          </Box>
        ))}
      </ViewSequencesSettingsWrapper>
      <CopyRight author={author} />
    </>
  );
};
```

### Pas 6: Testing A/B

```typescript
// .env.development
REACT_APP_USE_REFACTORED_VIEW=false

// .env.staging
REACT_APP_USE_REFACTORED_VIEW=true

// .env.production
REACT_APP_USE_REFACTORED_VIEW=false  # Començar amb false
```

### Pas 7: Tests d'Integració

```typescript
// src/components/ViewSequencesSettings/ViewSequencesSettings.integration.test.tsx

import { render, screen } from '@testing-library/react';
import ViewSequencesSettingsRefactored from './ViewSequencesSettings.refactored';
import { preloadedState } from '../../utils/test-utils';

describe('ViewSequencesSettings Refactored - Integration', () => {
  it('should render all page size tabs', () => {
    render(
      <ViewSequencesSettingsRefactored>
        <div>Test content</div>
      </ViewSequencesSettingsRefactored>,
      { preloadedState }
    );

    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('A3')).toBeInTheDocument();
    expect(screen.getByText('Full Screen')).toBeInTheDocument();
  });

  it('should toggle orientation when button clicked', () => {
    const { container } = render(
      <ViewSequencesSettingsRefactored>
        <div>Test content</div>
      </ViewSequencesSettingsRefactored>,
      { preloadedState }
    );

    const rotateButton = screen.getByLabelText('page orientation');
    // Test orientation toggle logic
  });

  // Més tests...
});
```

### Pas 8: Proves Visuals

```typescript
// Crear un storybook story per comparació visual

import { ComponentStory, ComponentMeta } from '@storybook/react';
import ViewSequencesSettingsOriginal from './ViewSequencesSettings';
import ViewSequencesSettingsRefactored from './ViewSequencesSettings.refactored';

export default {
  title: 'Migration/ViewSequencesSettings',
} as ComponentMeta<typeof ViewSequencesSettingsRefactored>;

const mockContent = (
  <Box>
    {/* Mock pictograms */}
  </Box>
);

export const Original: ComponentStory<typeof ViewSequencesSettingsOriginal> = () => (
  <ViewSequencesSettingsOriginal>{mockContent}</ViewSequencesSettingsOriginal>
);

export const Refactored: ComponentStory<typeof ViewSequencesSettingsRefactored> = () => (
  <ViewSequencesSettingsRefactored>{mockContent}</ViewSequencesSettingsRefactored>
);

export const SideBySide = () => (
  <div style={{ display: 'flex', gap: '20px' }}>
    <div style={{ flex: 1 }}>
      <h2>Original</h2>
      <ViewSequencesSettingsOriginal>{mockContent}</ViewSequencesSettingsOriginal>
    </div>
    <div style={{ flex: 1 }}>
      <h2>Refactored</h2>
      <ViewSequencesSettingsRefactored>{mockContent}</ViewSequencesSettingsRefactored>
    </div>
  </div>
);
```

### Pas 9: Validació de Comportament

Checklist de funcionalitats a validar:

```markdown
## Funcionalitats a Validar

### Canvi de Format de Pàgina

- [ ] A4 → A3 actualitza dimensions correctament
- [ ] A3 → Fullscreen canvia controls UI
- [ ] Fullscreen → A4 restaura tot correctament

### Orientació

- [ ] Landscape → Portrait gira dimensions
- [ ] Portrait → Landscape gira dimensions
- [ ] Botó de rotació visible només en A4/A3

### Escala

- [ ] Escala calculada correctament en diferents resolucions
- [ ] Escala en fullscreen fixa a 0.82
- [ ] Escala s'ajusta quan canvia mida de finestra

### Impressió

- [ ] Format d'impressió correcte (A4/A3)
- [ ] Orientació d'impressió correcta
- [ ] Dimensions d'impressió exactes
- [ ] Botó print visible només en A4/A3

### Fullscreen

- [ ] Enter fullscreen funciona
- [ ] Exit fullscreen (ESC) funciona
- [ ] Container ocult quan no està en fullscreen
- [ ] Tracking event s'envia correctament

### Controls UI

- [ ] Sliders actualitzen viewSettings
- [ ] Blur persiteix settings a Redux
- [ ] Author field funciona correctament
- [ ] Tots els FormLabels es mostren
```

### Pas 10: Neteja i Eliminació

Un cop validat tot:

```bash
# Backup del codi original (per si de cas)
git tag backup-before-refactoring

# Eliminar fitxers originals
rm src/components/ViewSequencesSettings/ViewSequencesSettings.tsx

# Renombrar refactored a original
mv src/components/ViewSequencesSettings/ViewSequencesSettings.refactored.tsx \
   src/components/ViewSequencesSettings/ViewSequencesSettings.tsx

# Eliminar wrapper (ja no cal)
rm src/components/ViewSequencesSettings/ViewSequencesSettings.wrapper.tsx

# Actualitzar imports a ViewSequencePage
# (eliminar referència al wrapper)
```

### Pas 11: Actualitzar Documentació

```markdown
# README.md

## Visualització de Seqüències

El sistema de visualització utilitza una arquitectura modular basada en:

- **Hooks composables**: Lògica separada i reutilitzable
- **Funcions pures**: Càlculs testables i predictibles
- **Tipus estrictes**: Seguretat en temps de compilació

### Afegir Nous Formats

1. Actualitza `src/types/pageFormat.ts`:
   \`\`\`typescript
   export type PageSize = 'A4' | 'A3' | 'NOU_FORMAT' | 'FULLSCREEN';

   export const PAGE_FORMATS: Record<PageSize, PageDimensions> = {
   // ...
   NOU_FORMAT: { width: XXX, height: YYY },
   };
   \`\`\`

2. Afegeix tab al component (opcional)
3. Actualitza tests

Veure [REFACTORING_DOCUMENTATION.md](./REFACTORING_DOCUMENTATION.md) per més detalls.
```

## Checklist Final de Migració

```markdown
### Pre-Deploy

- [ ] Tots els tests unitaris passen
- [ ] Tests d'integració passen
- [ ] Validació visual completa
- [ ] Càlculs validats vs sistema antic
- [ ] Code review completat
- [ ] Documentació actualitzada

### Deploy a Staging

- [ ] Feature flag activat
- [ ] QA manual realitzat
- [ ] Performance equivalent o millor
- [ ] No hi ha errors a console
- [ ] Tracking events funcionen

### Deploy a Producció

- [ ] Feature flag activat progressivament (10% → 50% → 100%)
- [ ] Monitoring actiu durant 48h
- [ ] No hi ha increment d'errors
- [ ] Feedback d'usuaris positiu
- [ ] Rollback plan preparat

### Post-Deploy

- [ ] Codi antic eliminat
- [ ] Tags i branques netejats
- [ ] Documentació final publicada
- [ ] Team actualitzat sobre canvis
```

## Possibles Problemes i Solucions

### Problema 1: Diferències d'Escala

**Símptoma**: L'escala calculada difereix lleugerament de l'original

**Solució**:

```typescript
// Afegir constant d'ajust si cal
export const SCALE_ADJUSTMENT_FACTOR = 1.02; // 2% d'ajust

const scale = calculatedScale * SCALE_ADJUSTMENT_FACTOR;
```

### Problema 2: Fullscreen No Funciona en Alguns Navegadors

**Símptoma**: requestFullscreen() falla

**Solució**:

```typescript
// Afegir fallback al hook useFullscreen
try {
  await display.requestFullscreen();
} catch (e) {
  // Fallback a maximitzar dins de finestra
  display.setAttribute(
    "style",
    "position: fixed; inset: 0; z-index: 9999; display: flex",
  );
}
```

### Problema 3: Performance en Dispositius Mòbils

**Símptoma**: Càlculs lents en mòbils antics

**Solució**:

```typescript
// Debounce dels càlculs d'escala
import { useDebouncedValue } from "./useDebounce";

const debouncedWidth = useDebouncedValue(screenWidth, 100);
const debouncedHeight = useDebouncedValue(screenHeight, 100);

const scaleResult = useScaleCalculator(
  pageFormat,
  debouncedWidth,
  debouncedHeight,
);
```

## Contacte i Suport

Per dubtes sobre la migració:

- Revisar [REFACTORING_DOCUMENTATION.md](./REFACTORING_DOCUMENTATION.md)
- Obrir issue a GitHub amb tag `migration`
- Contactar l'equip de desenvolupament

## Referències

- [Principis SOLID](https://en.wikipedia.org/wiki/SOLID)
- [React Hooks Best Practices](https://react.dev/learn)
- [Testing Library](https://testing-library.com/)
