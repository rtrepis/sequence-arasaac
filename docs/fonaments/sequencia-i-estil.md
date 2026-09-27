# Fonament: Seqüència i estil

> **Quan llegir-lo:** abans de tocar qualsevol cosa que **desi**, **carregui** o **apliqui
> estils** a una seqüència: el `.saac` (`ModalDownload`, `handleFileLoad`), el desat al núvol,
> `documentSlice`, `uiSlice.defaultSettings` i `ui.viewSettings`, la columna de la pàgina de vista
> i el panell de configuració dels pictogrames.
>
> Un **fonament** no és un estàndard: no diu com s'escriu el codi, sinó **què és cada cosa i de
> qui és**. Els estàndards de `docs/estandards/` hi han de ser coherents; si un estàndard i aquest
> document es contradiuen, mana aquest, i l'estàndard s'ha de corregir.
>
> És la decisió de producte que demanava **B25** (`docs/BACKLOG-ux.md`) i la que tanca la
> confusió de fons de **B21**.

## 1. Tres conceptes separats

- **Seqüència**: el contingut —pictogrames, textos, ordre, pestanyes, disposició— **i el seu
  estil**. Es desa al `.saac`.
- **Estil**: l'aparença d'una seqüència —fonts, mides, colors, vores, espaiats—. Es pot desar
  també en un **fitxer propi**, reutilitzable.
- **Preferències**: com vol la interfície qui fa servir l'app —zoom, alt contrast dels menús,
  moviment reduït, idioma—. **Són de l'usuari, i no es desen mai dins cap document.**

L'usuari té també un **estil per defecte**, que és el que reben les seqüències noves.

## 2. Desar

- **«Desar seqüència»** inclou sempre el seu estil.
- **«Desar estil»** desa només l'aparença, sense contingut.
- **No hi ha cap opció per desar una seqüència sense estil.**

## 3. Obrir

- Una seqüència **es veu sempre tal com es va desar**.
- Les **preferències d'interfície** de qui l'obre **s'apliquen sempre**.
- **«Canvia l'estil»**, disponible en obrir i en qualsevol moment, ofereix:
  - **«El meu estil per defecte»**
  - **«Carrega un estil…»**

  **Es pot desfer**, i **no modifica el fitxer fins que es desa**.
- En obrir un **fitxer d'estil**, s'aplica a la seqüència oberta (amb desfer) o es pot establir
  com a estil per defecte.

## 4. Compatibilitat amb fitxers antics

| Fitxer antic | Com s'obre |
|---|---|
| **«Només seqüència»** (sense estil) | Amb l'estil per defecte de l'usuari |
| **Amb estil parcial** | Es fan servir les propietats del fitxer, i les que falten s'omplen amb l'estil per defecte |
| **«Només preferències»** | S'interpreta com a fitxer d'estil |

**Cap fitxer antic pot deixar d'obrir-se.**

## 5. Per què

- **Previsibilitat.** Qui prepara una seqüència (mestra, logopeda) decideix com es veu; qui l'obre
  (família, infant) la veu igual. En CAA la previsibilitat és essencial.
- **Decideix qui coneix el context.** La decisió de canviar l'estil la pren qui obre, que és qui
  coneix el context.
- **Menys opcions en desar, menys errors.**
