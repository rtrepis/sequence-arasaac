# Solució: Passar Paràmetres Size a PictogramCard

## Problema Identificat

En la refactorització inicial, es va perdre la funcionalitat de passar dinàmicament els paràmetres `size` (`pictSize` i `scale`) des de `ViewSequencesSettings` fins a `PictogramCard`.

**Abans** (codi original):

```typescript
// ViewSequencePage.tsx - ORIGINAL
<ViewSequencesSettings
  view={view}
  setView={setView}
  author={author}
  setAuthor={setAuthor}
  scale={scale}
  setScale={setScale}
>
  {sequence.map((pictogram) => (
    <PictogramCard
      pictogram={pictogram}
      size={{
        pictSize: view.sizePict,  // ← Rep els valors
        scale: scale,             // ← Rep els valors
      }}
    />
  ))}
</ViewSequencesSettings>
```

**Problema** en la refactorització:

- El component `ViewSequencesSettings` calculava internament `viewSettings` i `scale`
- Però aquests valors no es passaven als `children`
- `PictogramCard` no rebia els paràmetres `size`
- Els pictogrames no canviaven de mida dinàmicament

## Solució: Render Prop Pattern

Hem implementat el **patró Render Prop** (també conegut com **Children as Function**) per passar els valors calculats als children.

### 1. Interfície Actualitzada

```typescript
// ViewSequencesSettings.refactored.tsx

interface ViewSequencesSettingsChildrenProps {
  viewSettings: ViewSettings; // Conté sizePict, columnGap, rowGap
  scale: number; // Escala calculada (screen o fullscreen)
  author: string; // Autor del document
}

interface ViewSequencesSettingsProps {
  // Children ara és una FUNCIÓ que rep props i retorna elements
  children: (
    props: ViewSequencesSettingsChildrenProps,
  ) => React.ReactElement | React.ReactElement[];
}
```

### 2. Implementació en ViewSequencesSettings

```typescript
// Dins del render de ViewSequencesSettings
<Stack className="preview-container" /* ... */>
  {/* Cridem children com a funció passant-li les props */}
  {children({
    viewSettings,    // Configuració actual de vista
    scale: activeScale,  // Escala activa (normal o fullscreen)
    author           // Autor
  })}
</Stack>
```

### 3. Ús en ViewSequencePage

```typescript
// ViewSequencePage.refactored.tsx

<ViewSequencesSettings>
  {/* Children és una FUNCIÓ que rep les props */}
  {({ viewSettings, scale, author }) => (
    <>
      {sequence.map((pictogram) => (
        <PictogramCard
          pictogram={pictogram}
          view={"complete"}
          variant="plane"
          size={{
            pictSize: viewSettings.sizePict,  // ✅ Ara rep el valor
            scale: scale,                     // ✅ Ara rep l'escala
          }}
        />
      ))}
      <CopyRight author={author} />
    </>
  )}
</ViewSequencesSettings>
```

## Com Funciona el Flux de Dades

```
┌─────────────────────────────────────────────────────────────┐
│                  ViewSequencesSettings                       │
│                                                              │
│  1. Calcula viewSettings amb useViewManager                 │
│  2. Calcula scale amb useScaleCalculator                    │
│  3. Gestiona author amb useAuthorManager                    │
│                                                              │
│  4. Passa aquests valors als children:                      │
│     children({ viewSettings, scale, author })               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ props flueixen cap avall
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              ViewSequencePage (children function)            │
│                                                              │
│  Destrueix les props rebudes:                               │
│  {({ viewSettings, scale, author }) => (                    │
│                                                              │
│    Usa viewSettings.sizePict i scale per crear              │
│    l'objecte size que es passa a PictogramCard              │
│  )}                                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ size prop
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    PictogramCard                             │
│                                                              │
│  Rep: size={{ pictSize, scale }}                            │
│                                                              │
│  Usa aquests valors per calcular dimensions:                │
│  - Font size: 20 * font.size * scale * pictSize             │
│  - Card width/height: dimensió * pictSize * scale           │
│  - Borders: border.size * pictSize * scale                  │
└─────────────────────────────────────────────────────────────┘
```

## Avantatges del Render Prop Pattern

### ✅ Pros

1. **Flexibilitat**: El component pare pot passar qualsevol dada calculada
2. **Type Safety**: TypeScript valida que les props són correctes
3. **Unidirectional Data Flow**: Les dades flueixen clarament de pare a fill
4. **Reutilitzable**: Diferents pàgines poden usar el mateix component de manera diferent

### Exemple de Flexibilitat

```typescript
// Pàgina 1: Usa tots els valors
<ViewSequencesSettings>
  {({ viewSettings, scale, author }) => (
    <PictogramCard size={{ pictSize: viewSettings.sizePict, scale }} />
  )}
</ViewSequencesSettings>

// Pàgina 2: Només usa alguns valors
<ViewSequencesSettings>
  {({ scale }) => (
    <CustomComponent scale={scale} />
  )}
</ViewSequencesSettings>

// Pàgina 3: Aplica transformacions
<ViewSequencesSettings>
  {({ viewSettings, scale }) => (
    <PictogramCard
      size={{
        pictSize: viewSettings.sizePict * 1.5,  // 50% més gran
        scale
      }}
    />
  )}
</ViewSequencesSettings>
```

## Exemple Complet Funcional

```typescript
// ViewSequencePage.refactored.tsx

import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import ViewSequencesSettings from "../../components/ViewSequencesSettings/ViewSequencesSettings.refactored";
import CopyRight from "../../components/CopyRight/CopyRight";

const ViewSequencePage = (): React.ReactElement => {
  const { document } = useAppSelector((state) => state);

  return (
    <ViewSequencesSettings>
      {/* ↓ Render prop: funció que rep props i retorna JSX */}
      {({ viewSettings, scale, author }) => (
        <>
          {Object.entries(document.content).map(([key, sequence]) => (
            <Box
              key={`sequence-${key}`}
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: viewSettings.columnGap * scale,
                rowGap: viewSettings.rowGap * scale,
                width: "100%",
              }}
            >
              {sequence.map((pictogram) => (
                <PictogramCard
                  pictogram={pictogram}
                  view={"complete"}
                  variant="plane"
                  size={{
                    pictSize: viewSettings.sizePict,  // ← Valor dinàmic
                    scale: scale,                     // ← Escala calculada
                  }}
                  key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
                />
              ))}
            </Box>
          ))}
          <CopyRight author={author} />
        </>
      )}
    </ViewSequencesSettings>
  );
};

export default ViewSequencePage;
```

## Comportament Esperat

### Quan l'usuari mou el slider de "Size"

```
1. Usuari mou slider → viewSettings.sizePict canvia (0.5 - 2.0)
2. ViewSequencesSettings detecta el canvi
3. Crida children({ viewSettings, scale, author })
4. ViewSequencePage rep nou viewSettings.sizePict
5. Passa nou size={{ pictSize: X, scale }} a PictogramCard
6. PictogramCard es re-renderitza amb nova mida
7. Els pictogrames es veuen més grans o més petits ✅
```

### Quan l'usuari canvia de format (A4 → A3)

```
1. Usuari selecciona A3
2. useScaleCalculator recalcula → nou scale
3. ViewSequencesSettings crida children amb nou scale
4. PictogramCard rep nou size={{ pictSize, scale: X }}
5. Tot s'ajusta proporcionalment ✅
```

### Quan l'usuari entra a Fullscreen

```
1. Usuari clica "Fullscreen"
2. activeScale canvia a 0.82 (FULLSCREEN_SCALE)
3. ViewSequencesSettings crida children amb scale: 0.82
4. PictogramCard s'ajusta a l'escala de fullscreen
5. Tot es veu amb l'escala correcta ✅
```

## Verificació

### Test Manual

1. **Obrir la pàgina de visualització**
2. **Moure el slider "Size"**:
   - Els pictogrames haurien de créixer/reduir-se en temps real
   - Font, borders, imatges haurien d'escalar proporcionalment
3. **Canviar de A4 a A3**:
   - Tot hauria d'ajustar-se mantenint proporcions
4. **Entrar a Fullscreen**:
   - L'escala hauria de canviar a fix 0.82
5. **Canviar orientation**:
   - Tot hauria de mantenir-se proporcionat

### Test Automatitzat

```typescript
import { render, screen } from '@testing-library/react';
import ViewSequencePage from './ViewSequencePage.refactored';

describe('ViewSequencePage - Size propagation', () => {
  it('should pass size props to PictogramCard', () => {
    const { container } = render(<ViewSequencePage />);

    // Verificar que PictogramCard rep les props size
    const pictogramCards = container.querySelectorAll('[data-testid="card-pictogram"]');

    expect(pictogramCards.length).toBeGreaterThan(0);

    // Els pictogrames haurien de tenir dimensions basades en size
    pictogramCards.forEach(card => {
      const styles = window.getComputedStyle(card);
      expect(styles.width).toBeTruthy();
      expect(styles.height).toBeTruthy();
    });
  });
});
```

## Alternativa: Context API

Si no t'agrada el render prop pattern, també es pot fer amb Context:

```typescript
// ViewSequencesContext.tsx
const ViewSequencesContext = createContext<ViewSequencesSettingsChildrenProps | null>(null);

// En ViewSequencesSettings
<ViewSequencesContext.Provider value={{ viewSettings, scale, author }}>
  {children}
</ViewSequencesContext.Provider>

// En ViewSequencePage
const { viewSettings, scale, author } = useContext(ViewSequencesContext);
```

Però el **render prop** és més explícit i type-safe.

## Resum

✅ **Problema resolt**: PictogramCard ara rep `size` dinàmicament  
✅ **Patró usat**: Render Prop (Children as Function)  
✅ **Type-safe**: TypeScript valida les props  
✅ **Reactiu**: Canvis en sliders actualitzen pictogrames en temps real  
✅ **Mantenible**: Flux de dades clar i unidireccional

Ara els pictogrames canvien de mida correctament quan l'usuari ajusta els controls! 🎉
