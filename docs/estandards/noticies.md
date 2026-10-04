# Notícies (Novetats)

> **Quan llegir-lo:** abans d'escriure o tocar una notícia de Novetats:
> `apps/web/src/data/newsItems.ts`, les claus `news.*` dels fitxers de traducció,
> les captures de `apps/web/public/img/news/` i els specs de
> `apps/web/e2e/screenshots/`. **Què** es publica ho decideix
> `docs/NOTICIES-candidates-des-de-2.0.2.md`; aquest document diu **com**.

## A qui va adreçada

- **La notícia és per a l'usuari, no per a desenvolupadors. Sense tecnicismes.**
  Ni JSON, ni «format», ni «versió del format», ni «cascada», ni «esquema», ni
  «repositori», ni noms de camps o de components. Tot s'explica amb el que la
  persona **veu i fa a l'app**: els botons, les finestres, el que passa quan hi
  clica. L'extensió dels fitxers (`.saac`, `.saacstyle`) sí que s'hi pot dir,
  perquè és el que l'usuari veu a les seves carpetes.
  *Per què*: qui llegeix Novetats és una família, una mestra o una logopeda. Una
  paraula tècnica no l'ajuda a fer res, i li fa pensar que el canvi no és per a
  ella.
- **Els noms dels botons, els reals de cada idioma**, copiats de
  `packages/i18n/messages/app/<idioma>.json`, no traduïts a mà. Si l'app diu «Aplicar
  tots», la notícia no diu «Aplica a tots». *Per què*: la persona busca a la
  pantalla el nom que ha llegit.
- **El català és l'idioma de referència.** Les altres versions es tradueixen, no
  es reescriuen: diuen el mateix, en el mateix ordre.

## On viu

- **Les dades**, a `apps/web/src/data/newsItems.ts`: una entrada per notícia, la
  més nova a dalt. `slug` en anglès i amb guions; `date` (AAAA-MM-DD) és el dia de
  publicació; `category` és `nova`, `millora` o `correccio`.
- **Els textos**, a `packages/i18n/messages/app/*.json` (els cinc idiomes), amb claus
  `news.<slug>.*`: `title`, `summary` (la targeta del carrusel, una frase),
  `content` (la introducció) i, per a cada pas, `stepN.description` i
  `stepN.alt`. No es compilen; les proves comproven que hi són als cinc idiomes (vegeu la skill `language`).
- **Les imatges**, a `apps/web/public/img/news/`.

## Com es construeix

- **Per passos** (`steps`): cada pas té un text i una captura. És la forma de
  totes les notícies curtes.
- **Per apartats**, per a una notícia llarga: el pas porta `titleId` (el títol de
  l'apartat, que surt al costat del número) i el text va a sota, a tota
  l'amplada. Un apartat pot tenir més d'una captura (`moreImages`).
- **Preguntes freqüents** (`faq`) i **paràgraf de tancament** (`closingId`), al
  final i opcionals.
- **El text pot portar etiquetes**: `<p>` (paràgraf), `<b>` (negreta), `<ul>` i
  `<ol>` amb `<li>` (llistes). Res més: ni enllaços ni estils. Un apòstrof no pot
  anar just abans d'una etiqueta (`d'<b>`): el formatador de missatges el llegiria
  com un escapament.

## Captures

- **Es generen amb un spec**, `apps/web/e2e/screenshots/<slug>-focused.spec.ts`,
  que fa servir `newsShot.ts` (ARASAAC servit des del repositori, captura centrada
  en el protagonista). Així es poden tornar a fer quan la interfície canvia. Les
  mides de referència són `COVER` (portada, 700×290) i `STEP` (pas, 700×560).
- **Un document de demostració fix, sense dades personals**: sempre el mateix,
  creat pel mateix spec, amb els pictogrames que el repositori serveix sense xarxa.
- **Cada idioma, les seves captures.** Una notícia amb captures per idioma les
  desa a `public/img/news/<slug>/<idioma>/` i a `newsItems.ts` la ruta porta
  `{locale}` (`/img/news/<slug>/{locale}/desar.png`). Cada versió de la notícia
  ensenya l'app en el seu idioma. Els textos dels botons que el spec ha de clicar
  es llegeixen dels fitxers de traducció, no s'escriuen al spec.
- **Tota imatge porta text alternatiu traduït** (`altId`), que diu què s'hi veu,
  no com es diu el fitxer.
- **Un dibuix que no és una captura** (un esquema) es fa amb una plantilla HTML a
  `e2e/screenshots/templates/`, amb els textos traduïts i els colors de
  `apps/web/src/style/palette.ts`.
- **Res de l'entorn de proves a la imatge**: si una captura surt amb un avís que
  només passa a la màquina de proves (una lletra que no arriba, un error de
  xarxa), s'arregla l'entorn, no la imatge.
- **Regenerar les captures d'una notícia no toca les de les altres.** Si en
  executar la carpeta sencera canvien imatges d'altres notícies, es descarten.

## Abans de publicar

- Els cinc idiomes tenen totes les claus, i `npm run prepare` compila sense
  errors.
- La pàgina `/<idioma>/news/<slug>` es veu bé en els cinc idiomes, i la targeta
  del carrusel també.
- `npm run typecheck` net.
