# Flux de settings: Skin/Hair vs Borders

## La diferència clau entre els dos tipus de settings

Hi ha dos grups de settings que afecten els pictogrames de maneres molt diferents:

**Skin / Hair** — afecten la *imatge* que es demana a l'API d'ARASAAC. Quan canvies el color de pell o el color de cabell, el navegador fa una nova petició HTTP a ARASAAC amb paràmetres a la URL (`?skin=black&hair=red`). Per tant, cal saber el valor *en el moment de crear el pictograma* per construir la URL correcta.

**Borders (interior i exterior)** — afecten l'*aparença visual del contenidor* del pictograma, no la imatge en si. Són estils CSS que s'apliquen en el moment de renderitzar. No intervenen en cap crida de xarxa.

---

## On viu cada valor

```
PictSequence
├── img
│   └── settings          ← aquí viuen skin, hair, color, fitzgerald
│       ├── skin?
│       ├── hair?
│       ├── color?
│       └── fitzgerald?
└── settings              ← aquí viuen els borders i la tipografia
    ├── borderIn?
    ├── borderOut?
    ├── textPosition?
    ├── font?
    ├── numberFont?
    └── fontSize?
```

Els defaults globals estan a Redux (`uiSlice`):
- `defaultSettings.pictApiAra` → conté `skin`, `hair`, `color`
- `defaultSettings.pictSequence` → conté `borderIn`, `borderOut`, `textPosition`, `font`...

---

## Escenari 1: Afegir un pictograma nou

Quan l'usuari cerca una paraula, el hook `useAraSaac` (`getSearchPictogram`) fa dues coses:

1. Crida l'API d'ARASAAC per obtenir el pictograma.
2. Crea un objecte `PictSequence` nou amb tots els valors inicials copiats dels defaults.

```
Usuari cerca "gat"
  → useAraSaac.getSearchPictogram()
      → makeSettingsProperty(data)
          skin  ← defaultSettings.pictApiAra.skin   (condicional: si el pictograma té pell)
          hair  ← defaultSettings.pictApiAra.hair   (condicional: si el pictograma té cabell)
          color ← defaultSettings.pictApiAra.color  (sempre)
      → crea newPict:
          img.settings  = { skin, hair, color, fitzgerald }
          settings      = { fontSize, textPosition, borderIn, borderOut }
                                                    ↑ tots des dels defaults
      → dispatch addPictogram(newPict)
```

**Important:** si el pictograma no es troba (error de l'API), es crea igualment un pictograma buit (blanc, `selectedId: 0`) però amb els mateixos valors de defaults per a tots els camps, incloent els borders.

`skin` i `hair` s'assignen *condicionalment* perquè no tots els pictogrames d'ARASAAC tenen pell ni cabell (objectes, símbols, etc.). `borderIn` i `borderOut` s'assignen *sempre*.

---

## Escenari 2: Editar un pictograma individual

Quan l'usuari obre el modal d'edició d'un pictograma (`PictEditForm`), el formulari s'inicialitza amb el valor individual del pictograma, amb fallback al default si no té valor propi:

```
skin      = pictogram.img.settings.skin      ?? defaultSettings.pictApiAra.skin
hair      = pictogram.img.settings.hair      ?? defaultSettings.pictApiAra.hair
borderIn  = pictogram.settings.borderIn      ?? defaultSettings.pictSequence.borderIn
borderOut = pictogram.settings.borderOut     ?? defaultSettings.pictSequence.borderOut
```

En tancar el modal, `handlerSubmit` fa dispatch de `updatePictSequence` amb el pictograma sencer actualitzat. Tots els camps es guarden al document (`documentSlice`).

---

## Escenari 3: Modificar defaults i Apply All

El modal de Default Settings (`DefaultForm`) gestiona dos nivells:

**Desar** (botó principal del modal): actualitza `uiSlice.defaultSettings` i guarda a `localStorage`/`sessionStorage` (clau `"pictDefaultSettings"`). Afecta només els pictogrames que es creïn a partir d'ara, no els existents.

**Apply All** (botó individual de cada setting): fa dispatch directament a `documentSlice` i sobreescriu el valor de *tots* els pictogrames de *totes* les seqüències del document en aquell moment.

```
Apply All de skin/hair  → pictAraSettingsApplyAll()
                           itera Object.values(content) → tots els pictogrames
                           p.img.settings.skin = nou valor

Apply All de borderIn   → borderInApplyAll()
                           itera Object.values(content) → tots els pictogrames
                           p.settings.borderIn = nou valor

Apply All de borderOut  → borderOutApplyAll()
                           itera Object.values(content) → tots els pictogrames
                           p.settings.borderOut = nou valor
```

El missatge de confirmació que apareix mostra el total de pictogrames actualitzats sumant totes les seqüències (`Object.values(content).reduce(...)`).

**Nota:** Apply All de skin/hair actualitza tots dos camps en un sol dispatch. Apply All de borders té un dispatch per a cada border (interior i exterior per separat), perquè el component `SettingCardBorder` els gestiona individualment.

---

*Darrera actualització: 2026-06-17*
