# Exemples Pràctics d'Ús

Aquest document proporciona exemples concrets de com utilitzar els nous hooks i funcions en diferents contextos.

## Exemples Bàsics

### 1. Crear un Component de Previsualització Simple

```typescript
import { usePageFormat } from '@/hooks/usePageFormat';
import { useScaleCalculator } from '@/hooks/useScaleCalculator';
import useWindowResize from '@/hooks/useWindowResize';

const SimplePreview = ({ children }) => {
  const [screenWidth, screenHeight] = useWindowResize();
  const { pageFormat } = usePageFormat({ initialSize: 'A4' });
  const { displayWidth, displayHeight } = useScaleCalculator(
    pageFormat,
    screenWidth,
    screenHeight
  );

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        border: '1px solid #ccc',
      }}
    >
      {children}
    </div>
  );
};
```

### 2. Selector de Format de Pàgina

```typescript
import { usePageFormat } from '@/hooks/usePageFormat';

const PageFormatSelector = () => {
  const { pageSize, setPageSize, orientation, toggleOrientation } = usePageFormat();

  return (
    <div>
      <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="FULLSCREEN">Full Screen</option>
      </select>
      
      <button onClick={toggleOrientation}>
        {orientation === 'landscape' ? '📄 Portrait' : '📃 Landscape'}
      </button>
      
      <p>Current: {pageSize} - {orientation}</p>
    </div>
  );
};
```

### 3. Botó de Fullscreen amb Feedback

```typescript
import { useFullscreen } from '@/hooks/useFullscreen';
import { useState } from 'react';

const FullscreenButton = () => {
  const [message, setMessage] = useState('');
  
  const { isFullscreen, enterFullscreen } = useFullscreen({
    onEnter: () => setMessage('✓ Fullscreen activat'),
    onExit: () => setMessage('Fullscreen desactivat'),
  });

  return (
    <div>
      <button onClick={enterFullscreen} disabled={isFullscreen}>
        {isFullscreen ? '🖥️ En Fullscreen' : '⛶ Activar Fullscreen'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};
```

### 4. Controls de Visualització amb Persistència

```typescript
import { useViewManager } from '@/hooks/useViewManager';
import { useAppSelector } from '@/app/hooks';

const ViewControls = () => {
  const initialSettings = useAppSelector((state) => state.ui.viewSettings);
  
  const {
    viewSettings,
    updateViewSetting,
    persistViewSettings,
    resetViewSettings,
  } = useViewManager({ initialViewSettings: initialSettings });

  return (
    <div>
      <label>
        Size: {viewSettings.sizePict.toFixed(2)}
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.01"
          value={viewSettings.sizePict}
          onChange={(e) => updateViewSetting('sizePict', parseFloat(e.target.value))}
          onMouseUp={persistViewSettings} // Guardar quan acaba l'usuari
        />
      </label>
      
      <label>
        Column Gap: {viewSettings.columnGap}
        <input
          type="range"
          min="-2"
          max="10"
          step="0.5"
          value={viewSettings.columnGap}
          onChange={(e) => updateViewSetting('columnGap', parseFloat(e.target.value))}
          onMouseUp={persistViewSettings}
        />
      </label>
      
      <button onClick={resetViewSettings}>↺ Reset</button>
    </div>
  );
};
```

## Exemples Avançats

### 5. Component de Comparació d'Escales

```typescript
import { calculateDisplayDimensions } from '@/hooks/useScaleCalculator';
import { createPageFormat } from '@/types/pageFormat';

const ScaleComparison = () => {
  const screenWidth = 1920;
  const screenHeight = 1080;
  
  const formats = [
    { name: 'A4 Landscape', format: createPageFormat('A4', 'landscape') },
    { name: 'A4 Portrait', format: createPageFormat('A4', 'portrait') },
    { name: 'A3 Landscape', format: createPageFormat('A3', 'landscape') },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Format</th>
          <th>Display Width</th>
          <th>Display Height</th>
          <th>Scale</th>
        </tr>
      </thead>
      <tbody>
        {formats.map(({ name, format }) => {
          const result = calculateDisplayDimensions({
            pageFormat: format,
            screenWidth,
            screenHeight,
          });
          
          return (
            <tr key={name}>
              <td>{name}</td>
              <td>{result.displayWidth.toFixed(0)}px</td>
              <td>{result.displayHeight.toFixed(0)}px</td>
              <td>{result.scale.toFixed(2)}x</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

### 6. Visor amb Múltiples Formats Simultanis

```typescript
import { usePageFormat } from '@/hooks/usePageFormat';
import { useScaleCalculator } from '@/hooks/useScaleCalculator';
import useWindowResize from '@/hooks/useWindowResize';

const MultiFormatViewer = ({ content }) => {
  const [screenWidth, screenHeight] = useWindowResize();
  
  const formats = ['A4', 'A3', 'FULLSCREEN'] as const;
  
  return (
    <div style={{ display: 'flex', gap: '20px', overflow: 'auto' }}>
      {formats.map((size) => {
        const pageFormat = createPageFormat(size, 'landscape');
        const { displayWidth, displayHeight, scale } = useScaleCalculator(
          pageFormat,
          screenWidth / 3 - 20, // Dividir pantalla en 3
          screenHeight
        );
        
        return (
          <div key={size} style={{ flex: 1 }}>
            <h3>{size}</h3>
            <div
              style={{
                width: displayWidth,
                height: displayHeight,
                border: '2px solid green',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {content}
            </div>
            <p>Scale: {scale.toFixed(2)}x</p>
          </div>
        );
      })}
    </div>
  );
};
```

### 7. Hook Compost per a Gestió Completa

```typescript
import { usePageFormat } from '@/hooks/usePageFormat';
import { useScaleCalculator } from '@/hooks/useScaleCalculator';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useViewManager } from '@/hooks/useViewManager';
import useWindowResize from '@/hooks/useWindowResize';

/**
 * Hook compost que combina tota la funcionalitat de visualització
 */
export function usePageVisualization(initialViewSettings) {
  const [screenWidth, screenHeight] = useWindowResize();
  
  const pageFormat = usePageFormat({
    initialSize: 'A4',
    initialOrientation: 'landscape',
  });
  
  const scaleResult = useScaleCalculator(
    pageFormat.pageFormat,
    screenWidth,
    screenHeight
  );
  
  const fullscreen = useFullscreen({
    onEnter: () => console.log('Fullscreen enabled'),
    onExit: () => console.log('Fullscreen disabled'),
  });
  
  const viewManager = useViewManager({
    initialViewSettings,
    persistToStore: true,
  });

  // Determinar escala activa
  const activeScale = fullscreen.isFullscreen
    ? fullscreen.currentScale
    : scaleResult.scale;

  return {
    // Page format
    ...pageFormat,
    
    // Scale calculations
    displayWidth: scaleResult.displayWidth,
    displayHeight: scaleResult.displayHeight,
    scale: activeScale,
    
    // Fullscreen
    isFullscreen: fullscreen.isFullscreen,
    enterFullscreen: fullscreen.enterFullscreen,
    exitFullscreen: fullscreen.exitFullscreen,
    
    // View settings
    viewSettings: viewManager.viewSettings,
    updateViewSetting: viewManager.updateViewSetting,
    persistViewSettings: viewManager.persistViewSettings,
  };
}

// Ús:
const MyComponent = () => {
  const initialSettings = useAppSelector((state) => state.ui.viewSettings);
  const viz = usePageVisualization(initialSettings);
  
  return (
    <div>
      <button onClick={viz.toggleOrientation}>Rotate</button>
      <button onClick={viz.enterFullscreen}>Fullscreen</button>
      <div style={{ width: viz.displayWidth, height: viz.displayHeight }}>
        Content
      </div>
    </div>
  );
};
```

### 8. Exportar com a PDF amb Escala Correcta

```typescript
import { getPrintDimensions } from '@/hooks/useScaleCalculator';
import { createPageFormat } from '@/types/pageFormat';

const ExportPDF = ({ content }) => {
  const exportToPDF = async (size: 'A4' | 'A3', orientation: 'landscape' | 'portrait') => {
    const pageFormat = createPageFormat(size, orientation);
    const dimensions = getPrintDimensions(pageFormat);
    
    // Configurar jspdf amb les dimensions correctes
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [dimensions.width, dimensions.height],
    });
    
    // Renderitzar content al PDF
    const element = document.getElementById('content-to-export');
    if (element) {
      await pdf.html(element, {
        callback: (doc) => {
          doc.save(`export-${size}-${orientation}.pdf`);
        },
        x: 0,
        y: 0,
        width: dimensions.width,
        windowWidth: dimensions.width,
      });
    }
  };

  return (
    <div>
      <div id="content-to-export">{content}</div>
      
      <button onClick={() => exportToPDF('A4', 'landscape')}>
        Export A4 Landscape
      </button>
      <button onClick={() => exportToPDF('A4', 'portrait')}>
        Export A4 Portrait
      </button>
      <button onClick={() => exportToPDF('A3', 'landscape')}>
        Export A3 Landscape
      </button>
    </div>
  );
};
```

### 9. Responsive Preview amb Breakpoints

```typescript
import { useScaleCalculator } from '@/hooks/useScaleCalculator';
import { createPageFormat } from '@/types/pageFormat';
import useWindowResize from '@/hooks/useWindowResize';

const ResponsivePreview = ({ content }) => {
  const [screenWidth, screenHeight] = useWindowResize();
  
  // Determinar format segons mida de pantalla
  const getAdaptiveFormat = () => {
    if (screenWidth < 768) return createPageFormat('A4', 'portrait');
    if (screenWidth < 1024) return createPageFormat('A4', 'landscape');
    return createPageFormat('A3', 'landscape');
  };
  
  const pageFormat = getAdaptiveFormat();
  const { displayWidth, displayHeight, scale } = useScaleCalculator(
    pageFormat,
    screenWidth,
    screenHeight
  );

  return (
    <div>
      <p>Current format: {pageFormat.size} - {pageFormat.orientation}</p>
      <div
        style={{
          width: displayWidth,
          height: displayHeight,
          border: '1px solid #333',
          overflow: 'hidden',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {content}
        </div>
      </div>
    </div>
  );
};
```

### 10. Testing Helper

```typescript
// test-utils/page-visualization.ts

import { renderHook } from '@testing-library/react';
import { createPageFormat } from '@/types/pageFormat';
import { calculateDisplayDimensions } from '@/hooks/useScaleCalculator';

/**
 * Helper per testejar càlculs d'escala amb diferents configuracions
 */
export function testScaleCalculation(
  size: 'A4' | 'A3',
  orientation: 'landscape' | 'portrait',
  screenWidth: number,
  screenHeight: number
) {
  const pageFormat = createPageFormat(size, orientation);
  const result = calculateDisplayDimensions({
    pageFormat,
    screenWidth,
    screenHeight,
  });
  
  return {
    pageFormat,
    ...result,
    aspectRatio: result.displayHeight / result.displayWidth,
    expectedAspectRatio: pageFormat.dimensions.height / pageFormat.dimensions.width,
  };
}

// Ús en tests:
describe('Scale calculations', () => {
  it('should maintain aspect ratio for A4 landscape', () => {
    const result = testScaleCalculation('A4', 'landscape', 1920, 1080);
    
    expect(result.aspectRatio).toBeCloseTo(result.expectedAspectRatio, 2);
  });
});
```

## Casos d'Ús Reals

### Component Complet de Previsualització d'Impressió

```typescript
import React from 'react';
import { usePageFormat } from '@/hooks/usePageFormat';
import { useScaleCalculator, usePrintDimensions } from '@/hooks/useScaleCalculator';
import { useFullscreen } from '@/hooks/useFullscreen';
import useWindowResize from '@/hooks/useWindowResize';

const PrintPreview = ({ children }) => {
  const [screenWidth, screenHeight] = useWindowResize();
  
  const {
    pageSize,
    orientation,
    pageFormat,
    setPageSize,
    toggleOrientation,
    isFullscreen: isFullscreenFormat,
  } = usePageFormat();
  
  const { displayWidth, displayHeight, scale } = useScaleCalculator(
    pageFormat,
    screenWidth,
    screenHeight
  );
  
  const printDimensions = usePrintDimensions(pageFormat);
  
  const { isFullscreen, enterFullscreen } = useFullscreen();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-preview">
      {/* Controls */}
      <div className="controls" style={{ marginBottom: '20px' }}>
        <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="FULLSCREEN">Fullscreen</option>
        </select>
        
        {!isFullscreenFormat && (
          <button onClick={toggleOrientation}>
            {orientation === 'landscape' ? '↻ Portrait' : '↺ Landscape'}
          </button>
        )}
        
        <button onClick={handlePrint} disabled={isFullscreenFormat}>
          🖨️ Print
        </button>
        
        {isFullscreenFormat && (
          <button onClick={enterFullscreen}>
            ⛶ Enter Fullscreen
          </button>
        )}
      </div>
      
      {/* Preview */}
      <div
        className="preview-container"
        style={{
          width: displayWidth,
          height: displayHeight,
          border: '2px solid #4CAF50',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: printDimensions.width,
            height: printDimensions.height,
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Info */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>Display: {displayWidth.toFixed(0)} x {displayHeight.toFixed(0)}px</p>
        <p>Print: {printDimensions.width} x {printDimensions.height}px</p>
        <p>Scale: {scale.toFixed(2)}x</p>
      </div>
      
      {/* Fullscreen container */}
      <div className="displayFullScreen" style={{ display: 'none' }}>
        {children}
      </div>
      
      <style jsx>{`
        @media print {
          .controls,
          .displayFullScreen {
            display: none !important;
          }
          
          .preview-container {
            border: none !important;
            width: ${printDimensions.width}px !important;
            height: ${printDimensions.height}px !important;
          }
          
          .preview-container > div {
            transform: none !important;
          }
          
          @page {
            size: ${pageSize === 'FULLSCREEN' ? 'A4' : pageSize} ${orientation};
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPreview;
```

## Conclusió

Aquests exemples mostren la flexibilitat i composabilitat dels nous hooks. Els desenvolupadors poden:

1. **Usar individualment** cada hook segons necessitats
2. **Composar** múltiples hooks per funcionalitat complexa
3. **Crear abstraccions** pròpies basades en els hooks base
4. **Testejar fàcilment** funcions pures i lògica de negoci

La clau és que cada hook té **una responsabilitat clara** i pot **combinar-se amb altres** per crear solucions personalitzades.
