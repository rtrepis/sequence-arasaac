# Guia d'Ús de l'Eina de Calibratge

## 🎯 Objectiu

L'eina de calibratge permet ajustar les constants del sistema per aconseguir que la previsualització a pantalla coincideixi exactament amb la impressió real.

## 📊 Problema Identificat

Segons les teves dades:

- **Previsualització**: Pictogrames de 127px
- **Impressió**: Pictogrames de 155.5px
- **Diferència**: 22.4% més grans en impressió

Això indica un desajust en els càlculs d'escala.

## 🔧 Com Usar l'Eina

### 1. Afegir l'Eina al Projecte

```typescript
// src/App.tsx o similar
import CalibrationTool from './components/CalibrationTool/CalibrationTool';

// Afegir una ruta per a l'eina (només en desenvolupament)
<Route path="/calibrate" element={<CalibrationTool />} />
```

### 2. Accedir a l'Eina

Obre el navegador a: `http://localhost:3000/calibrate`

### 3. Introduir les Teves Dades Reals

#### Dades de Test (secció inferior esquerra):

1. **sizePict**: Introdueix el valor actual (0.85)
2. **Mida en previsualització**: Introdueix 127 px
3. **Mida en impressió**: Introdueix 155.5 px

#### Paràmetres del Sistema (secció superior):

Comença amb els valors per defecte i ajusta segons els resultats.

### 4. Ajustar Paràmetres

L'eina té 3 paràmetres principals per ajustar:

#### A) DPI (Dots Per Inch)

**Valor per defecte**: 96 DPI (estàndard web)

**Quan ajustar**:

- Si tens una pantalla d'alta resolució (Retina, 4K): prova 120-144 DPI
- Si la previsualització és molt petita: augmenta DPI
- Si la previsualització és molt gran: redueix DPI

**Com afecta**:

- ↑ DPI → Dimensions en px més grans (més espai útil)
- ↓ DPI → Dimensions en px més petites (menys espai útil)

#### B) Marge d'Impressió (mm)

**Valor per defecte**: 10 mm

**Quan ajustar**:

- Si la impressora té marges grans: augmenta (15-20 mm)
- Si la impressora imprimeix gairebé sense marges: redueix (5-8 mm)
- Si vols comprovar els marges reals: imprimeix una pàgina de prova

**Com afecta**:

- ↑ Marges → Menys espai útil → Pictogrames més petits en impressió
- ↓ Marges → Més espai útil → Pictogrames més grans en impressió

#### C) Container Padding

**Valor per defecte**: 0 px (canviat de 24)

**Quan ajustar**:

- Si la previsualització és lleugerament més petita que la impressió: augmenta
- Si la previsualització és lleugerament més gran: manté a 0 o negatius

**Com afecta**:

- ↑ Padding → Scale més petit → Previsualització més petita
- ↓ Padding → Scale més gran → Previsualització més gran

## 📈 Interpretar els Resultats

### Panell "Resultats Calculats"

L'eina mostra:

1. **Dimensions útils** (després de descomptar marges):

   ```
   A4 Landscape:
   - Paper: 210 × 297 mm
   - Útil: 190 × 277 mm (amb marges de 10mm)
   - Píxels: 717 × 1046 px (a 96 DPI)
   ```

2. **Escala calculada**:

   ```
   Scale A4 Landscape: 0.943
   ```

   Aquest valor indica quant es redueix la pàgina per encaixar a pantalla

3. **Anàlisi del Desajust**:
   ```
   Ratio actual: 1.224 (22.4% diferència)
   Mida calculada previsualització: 120.5 px
   Mida real previsualització: 127 px
   Error: 6.5 px
   ```

### Objectiu: Error < 5 px

Quan l'error és inferior a 5 píxels, les constants estan ben calibrades.

## 🎓 Exemple Pràctic de Calibratge

### Situació Inicial (les teves dades):

```
Previsualització: 127 px
Impressió: 155.5 px
Ratio: 1.224 (22% més gran)
```

### Pas 1: Analitzar el Problema

El pictograma en impressió és **més gran** que en previsualització.
Això significa que l'escala de previsualització és **massa petita**.

### Pas 2: Identificar la Causa

Possibles causes:

1. **PRINT_CONTAINER_PADDING massa gran** (24 px) → Escala més petita
2. **Marges d'impressió mal calculats** → Dimensions útils incorrectes
3. **DPI incorrecte** → Conversió mm→px incorrecta

### Pas 3: Ajustar

Prova aquest ordre:

1. **Primer**: Ajusta PRINT_CONTAINER_PADDING

   ```
   Comença amb: 0 px
   Si encara hi ha error: prova valors negatius (-10, -20)
   ```

2. **Segon**: Ajusta marges d'impressió

   ```
   Si tens impressora amb marges grans: augmenta a 15-20 mm
   Si tens impressora sense marges: redueix a 5-8 mm
   ```

3. **Tercer**: Comprova DPI
   ```
   Pantalla Retina/4K: prova 120 DPI
   Pantalla estàndard: manté 96 DPI
   ```

### Pas 4: Verificar

Amb cada ajust, comprova l'"Anàlisi del Desajust":

- Error inicial: ~28 px
- Objectiu: < 5 px
- Ideal: < 2 px

## 💡 Consells Pràctics

### Per Trobar els Marges d'Impressió Reals

1. Crea un document de prova:

   ```html
   <div style="width: 210mm; height: 297mm; border: 1px solid red;">
     <div style="margin: 10mm; border: 1px solid blue;">
       Àrea útil amb marges de 10mm
     </div>
   </div>
   ```

2. Imprimeix-lo

3. Mesura amb un regle:
   - Distància del vora del paper al borde blau
   - Aquest és el teu marge real

### Per Diferents Impressores

Si treballes amb múltiples impressores amb marges diferents:

```typescript
// Crea configuracions per impressora
export const PRINT_CONFIGS = {
  hp_laserjet: { marginMM: 8, dpi: 96 },
  canon_inkjet: { marginMM: 15, dpi: 96 },
  epson_photo: { marginMM: 5, dpi: 96 },
};

// Deixa que l'usuari seleccioni la seva impressora
const selectedPrinter = "hp_laserjet";
const config = PRINT_CONFIGS[selectedPrinter];
```

### Per Pantalles d'Alta Resolució

Si molts usuaris tenen pantalles Retina/4K:

```typescript
// Detectar DPI automàticament
export function detectDPI(): number {
  const dpr = window.devicePixelRatio || 1;
  return 96 * dpr; // 96 per pantalla normal, 192 per Retina, etc.
}
```

## 📋 Checklist de Calibratge

- [ ] Afegir CalibrationTool al projecte
- [ ] Introduir dades reals de test
- [ ] Ajustar PRINT_CONTAINER_PADDING fins error < 10 px
- [ ] Mesurar marges reals d'impressió
- [ ] Ajustar PRINT_MARGIN_MM segons mesures
- [ ] Verificar en diferents resolucions de pantalla
- [ ] Verificar amb diferents valors de sizePict (0.5, 1.0, 1.5, 2.0)
- [ ] Provar impressió real i comparar
- [ ] Copiar codi generat a pageFormat.ts
- [ ] Eliminar CalibrationTool de producció (opcional)

## 🔄 Workflow Recomanat

```
1. Desenvolupament
   ├─ Usar CalibrationTool per trobar valors òptims
   ├─ Testejar amb diferents configuracions
   └─ Documentar valors trobats

2. Testing
   ├─ Verificar previsualització vs impressió
   ├─ Provar en diferents navegadors
   └─ Provar en diferents resolucions

3. Producció
   ├─ Aplicar constants calibrades
   ├─ Desactivar/eliminar CalibrationTool
   └─ Monitoritzar feedback d'usuaris
```

## 🎯 Valors Recomanats Inicials

Basant-me en les teves dades, prova començar amb:

```typescript
export const STANDARD_DPI = 96;
export const PRINT_MARGIN_MM = 10;
export const PRINT_CONTAINER_PADDING = 0; // Canviat de 24
```

Això hauria de donar dimensions A4 de:

- Amplada: 717 px (190 mm)
- Alçada: 1046 px (277 mm)

I una escala aproximada de 0.94 per A4 Landscape en pantalla 1920px.

## 📞 Si Els Valors No Quadren

Si després d'ajustar tot encara hi ha un desajust significatiu:

1. **Comprova que PictogramCard usa correctament size.pictSize i size.scale**
2. **Verifica que no hi ha cap altre multiplicador amagat**
3. **Assegura't que la font base dels càlculs és consistent (150px)**
4. **Comprova els estils CSS d'impressió (@media print)**

Pots compartir els valors finals que obtinguis i t'ajudaré a afinar-los!
