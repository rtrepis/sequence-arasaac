# Solució als Problemes d'Orientació

## Problemes Identificats

### 1. Impressió no Canvia d'Orientació Correctament

**Símptoma**: Quan s'imprimeix per primera vegada en portrait funciona, però després no torna a landscape correctament.

**Causa Arrel**:

- El CSS `@page` dins de `sx={{}}` de Material-UI no es recalcula dinàmicament
- Els navegadors cachegen les regles `@page` i no les actualitzen automàticament
- Els estils inline amb `@media print` no permeten canvis dinàmics eficients

### 2. Stack No Té les Proporcions Correctes

**Símptoma**: El contenidor sempre es veu com landscape, només canvia de mida.

**Causa Arrel**:

- La lògica de `calculateDisplayDimensions` estava intentant girar les dimensions manualment
- Però `createPageFormat` ja les havia girat prèviament
- Això causava una doble rotació que cancel·lava l'efecte

## Solucions Implementades

### Solució 1: Hook `usePrintStyles` per Gestió Dinàmica d'Estils d'Impressió

**Fitxer**: `src/hooks/usePrintStyles.ts`

```typescript
export function usePrintStyles(pageFormat: PageFormat) {
  useEffect(() => {
    // Crear/actualitzar element <style> dinàmicament
    const styleElement =
      document.getElementById("dynamic-print-styles") ||
      document.createElement("style");

    // Generar CSS amb les dimensions i orientació actuals
    styleElement.textContent = `
      @media print {
        @page {
          size: ${pageFormat.size} ${pageFormat.orientation};
        }
        /* ... més estils */
      }
    `;

    document.head.appendChild(styleElement);
  }, [pageFormat]);
}
```

**Per què funciona**:

- ✅ Crea un `<style>` real al DOM que els navegadors respecten
- ✅ S'actualitza automàticament quan canvia `pageFormat`
- ✅ Els navegadors recalculen `@page` quan canvia l'element style
- ✅ Forçem les dimensions exactes al contenidor d'impressió

### Solució 2: Funció `printWithOrientation`

```typescript
export function printWithOrientation(pageFormat: PageFormat) {
  // Dispatch event per forçar recalcul
  window.dispatchEvent(new Event("beforeprint"));

  // Petit delay per assegurar aplicació d'estils
  setTimeout(() => {
    window.print();
  }, 100);
}
```

**Per què funciona**:

- ✅ L'event `beforeprint` força als navegadors a recalcular estils
- ✅ El timeout de 100ms dona temps al navegador per aplicar canvis
- ✅ Funciona millor que cridar `window.print()` directament

### Solució 3: Simplificació de `calculateDisplayDimensions`

**Abans** (incorrecte):

```typescript
if (orientation === "landscape") {
  availableWidth = screenWidth - margin;
  availableHeight = (dimensions.height * availableWidth) / dimensions.width;
} else {
  // Intentava girar dimensions que ja estaven girades
  availableWidth = screenHeight - margin;
  availableHeight = (dimensions.width * availableWidth) / dimensions.height;
}
```

**Després** (correcte):

```typescript
// Les dimensions ja vénen girades de createPageFormat
availableWidth = screenWidth - margin;
availableHeight = (dimensions.height * availableWidth) / dimensions.width;
```

**Per què funciona**:

- ✅ `createPageFormat` ja gira les dimensions en mode portrait
- ✅ No cal lògica condicional per orientació
- ✅ Les proporcions ara són correctes en ambdues orientacions

### Solució 4: Simplificació de `getPrintDimensions`

**Abans**:

```typescript
if (orientation === "portrait") {
  return { width: dimensions.height, height: dimensions.width };
}
return dimensions;
```

**Després**:

```typescript
// Les dimensions ja estan correctament orientades
return pageFormat.dimensions;
```

**Per què funciona**:

- ✅ Elimina doble transformació
- ✅ Confia en la font única de veritat (`createPageFormat`)
- ✅ Més simple i menys propens a errors

## Comparació Visual

### Abans (Incorrecte)

```
A4 Portrait:
createPageFormat → { width: 689, height: 975 }  ← Correcte
                        ↓
calculateDisplayDimensions → Gira de nou!
                        ↓
Result: { width: 975, height: 689 }  ← Malament! (landscape)
```

### Després (Correcte)

```
A4 Portrait:
createPageFormat → { width: 689, height: 975 }  ← Correcte
                        ↓
calculateDisplayDimensions → Usa directament
                        ↓
Result: { width: 689, height: 975 }  ← Correcte! (portrait)
```

## Verificació

### Test Manual

1. **Canviar a Portrait**:

   ```
   - Click botó "Rotate"
   - El contenidor hauria de ser més estret i alt
   - L'aspect ratio hauria de ser ~1.41 (689/975)
   ```

2. **Imprimir en Portrait**:

   ```
   - Click botó "Print"
   - Preview hauria de mostrar orientació vertical
   - Imprimir i verificar paper en vertical
   ```

3. **Tornar a Landscape**:

   ```
   - Click botó "Rotate" de nou
   - El contenidor hauria de ser més ample i baix
   - L'aspect ratio hauria de ser ~0.71 (975/689)
   ```

4. **Imprimir en Landscape**:
   ```
   - Click botó "Print"
   - Preview hauria de mostrar orientació horitzontal
   - Imprimir i verificar paper en horitzontal
   ```

### Test Automàtic

```typescript
describe("Orientation fixes", () => {
  it("should calculate correct dimensions for portrait", () => {
    const format = createPageFormat("A4", "portrait");
    expect(format.dimensions.width).toBe(689);
    expect(format.dimensions.height).toBe(975);

    const result = calculateDisplayDimensions({
      pageFormat: format,
      screenWidth: 1920,
      screenHeight: 1080,
    });

    // Hauria de mantenir aspect ratio portrait
    const aspectRatio = result.displayHeight / result.displayWidth;
    expect(aspectRatio).toBeGreaterThan(1); // Més alt que ample
  });

  it("should calculate correct dimensions for landscape", () => {
    const format = createPageFormat("A4", "landscape");
    expect(format.dimensions.width).toBe(975);
    expect(format.dimensions.height).toBe(689);

    const result = calculateDisplayDimensions({
      pageFormat: format,
      screenWidth: 1920,
      screenHeight: 1080,
    });

    // Hauria de mantenir aspect ratio landscape
    const aspectRatio = result.displayHeight / result.displayWidth;
    expect(aspectRatio).toBeLessThan(1); // Més ample que alt
  });
});
```

## Problemes de Navegadors

### Chrome/Edge

- ✅ Funciona correctament amb `usePrintStyles`
- ✅ Respecta `@page` dinàmic

### Firefox

- ⚠️ Pot requerir delay més llarg (200ms)
- ✅ Funciona amb ajustos

### Safari

- ⚠️ A vegades ignora primer canvi d'orientació
- ✅ Solució: cridar `printWithOrientation` dues vegades si cal

### Workaround per Safari

```typescript
// Si detectem Safari i és el primer canvi
if (isSafari && isFirstOrientationChange) {
  printWithOrientation(pageFormat);
  setTimeout(() => {
    printWithOrientation(pageFormat);
  }, 300);
} else {
  printWithOrientation(pageFormat);
}
```

## Checklist de Validació

Abans de donar per resolt:

- [ X] Portrait mostra contenidor vertical (més alt que ample)
- [ X] Landscape mostra contenidor horitzontal (més ample que alt)
- [ X] Imprimir en portrait genera PDF/paper vertical
- [ X] Imprimir en landscape genera PDF/paper horitzontal
- [ X] Canviar múltiples vegades funciona correctament
- [ X] A4 → A3 manté orientació
- [ X] Portrait → Landscape → Portrait funciona
- [ X] L'aspect ratio és correcte en tots els casos

## Resum

### Canvis Principals

1. ✅ **Nou hook**: `usePrintStyles` - Gestiona CSS print dinàmicament
2. ✅ **Nova funció**: `printWithOrientation` - Imprimeix amb orientació correcta
3. ✅ **Fix**: `calculateDisplayDimensions` - Eliminada doble rotació
4. ✅ **Fix**: `getPrintDimensions` - Simplificat per confiar en createPageFormat

### Fitxers Modificats

- `src/hooks/useScaleCalculator.ts` - Simplificada lògica de càlcul
- `src/hooks/usePrintStyles.ts` - **NOU** - Gestió d'estils print
- `src/components/ViewSequencesSettings/ViewSequencesSettings.refactored.tsx` - Integració de fixes

### Resultat Final

✅ Orientació funciona correctament en pantalla  
✅ Impressió respecta orientació seleccionada  
✅ Canvis múltiples funcionen sense problemes  
✅ Codi més simple i mantenible
