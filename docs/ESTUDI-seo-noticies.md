# Estudi de SEO: notícies i guies

Què veu un cercador de l'app avui, què caldria perquè les notícies es trobin, i quin contingut
faria venir gent nova. No és cap tasca començada: és el pla per a la sessió que s'hi posi.

Data de l'estudi: octubre del 2026 (branca `ccr-a1cb09af-trao52`, després del paper Carta).

---

## Estat: què veu Google avui

L'app és una SPA pura i **un cercador o una xarxa social que no executen JavaScript no hi veuen
res**. Google sí que l'executa, però tard i no sempre; WhatsApp, Facebook, Telegram, X o LinkedIn
no l'executen mai.

| Què | On | Problema |
|---|---|---|
| Totes les rutes tornen el mateix `index.html` | `apps/web/vercel.json` (`"/(.*)" → /index.html`) | Cada notícia, en cada idioma, és la mateixa pàgina buida fins que corre el JavaScript |
| Descripció genèrica, en anglès i mal escrita | `apps/web/index.html`: «Web site crate for make pictograms sequence» | És el text que surt sota l'enllaç a Google |
| `<html lang="en">` fix | `apps/web/index.html` | Les notícies en català, castellà, francès i italià es declaren angleses |
| El títol es posa des del navegador | `NewsDetailPage.tsx`, `ChangelogPage.tsx`, `WelcomePage.tsx` (`document.title = …`) | Només el veu qui executa JavaScript |
| Cap etiqueta per compartir (Open Graph, Twitter) | — | Un enllaç compartit en un grup de mestres o famílies surt sense títol ni imatge |
| Cap `hreflang` ni `canonical` | — | Google no sap que `/ca/news/x` i `/es/news/x` són la mateixa notícia en dos idiomes |
| Cap `sitemap.xml` | `apps/web/public/` només té `robots.txt` | Google ha de descobrir les notícies seguint enllaços que no veu |
| Qualsevol URL respon 200 | El `rewrite` de `vercel.json` + `<Route path="*">` a `App.tsx` | Una URL inexistent és una pàgina «vàlida» buida (*soft 404*) |
| `robots.txt` ho permet tot | `apps/web/public/robots.txt` | No apunta al sitemap, i no aparta `/admin` ni `/set-password` |

El que **sí** hi ha i és un bon actiu: 15 notícies, cada una en 5 idiomes, amb URL pròpia
(`/:locale/news/:slug`), captures per idioma (`public/img/news/<slug>/{locale}/`) i GA4 ja
connectat.

## Pla

L'ordre importa: el contingut nou (fase 2) no serveix de res mentre Google no el pugui llegir
(fase 1).

### Fase 1 — Que les notícies es puguin llegir sense JavaScript (M)

Tot és estàtic i cap dins del pla gratuït de Vercel. No cal canviar de framework ni muntar SSR.

1. **Pàgines estàtiques en compilar.** Un script que s'executi després de `vite build`
   (`apps/web/scripts/prerender-news.ts` o similar) recorre `newsItems` × `LANGS_APP` i escriu
   `dist/<locale>/news/<slug>/index.html`, a partir del `dist/index.html`, amb:
   - `<html lang="<locale>">`, `<title>` i `<meta name="description">` (el `summary`);
   - Open Graph i Twitter: títol, descripció, `og:image` (la `coverImage`, amb URL absoluta),
     `og:locale`;
   - `<link rel="canonical">` i un `<link rel="alternate" hreflang="…">` per idioma, més
     `x-default`;
   - JSON-LD `Article` (o `BlogPosting`): títol, data, imatge, idioma;
   - el **text de la notícia dins de `#root`** (títol, introducció, passos, FAQ), en HTML pla.
     `createRoot` el substitueix en muntar React, així que l'usuari no hi veu cap diferència.
   - El mateix per a la llista de notícies (`/<locale>/news/`) i la portada de cada idioma.

   **Per què funciona:** les traduccions són JSON sense compilar (ADR-004) i Node les pot llegir
   tal qual, i `newsItems.ts` és un fitxer de dades. Vercel serveix els fitxers estàtics **abans**
   d'aplicar els `rewrites`, així que aquestes pàgines guanyen al `index.html` comú sense tocar
   `vercel.json`.
   `newsItems.ts` no importa res, així que l'script el pot carregar directament amb `tsx`, que ja
   és al monorepo (l'API el fa servir).

2. **`sitemap.xml`** generat pel mateix script: una URL per notícia i idioma, amb `lastmod` (la
   `date`) i les alternatives `xhtml:link hreflang`. `robots.txt` hi apunta i fa `Disallow` de
   `/admin` i `/set-password`.

3. **`index.html` digne**: una descripció de debò (en anglès, que és el *fallback*). I que el
   `LanguageLayout` o el `NewsLayout` posin `document.documentElement.lang` segons el `:locale`
   de la ruta, per a qui hi arriba navegant per dins de l'app.

4. **Donar d'alta el domini a Google Search Console** i enviar-hi el sitemap. És la manera de
   saber què indexa Google, per quines cerques surt i què falla. És gratuït.

**Com es comprova:** `curl https://<domini>/es/news/download-pdf/` (sense JavaScript) ha de tornar
el títol, la descripció i el text en castellà. Les eines de previsualització d'enllaços de Facebook
i LinkedIn i la prova de resultats enriquits de Google ho confirmen des de fora.

**El *soft 404*** (qualsevol URL respon 200) es pot deixar per més endavant: amb el sitemap,
Google ja sap quines són les pàgines bones. Si es vol resoldre, el camí és una pàgina
`404.html` estàtica i acotar el `rewrite` a les rutes que existeixen.

### Fase 2 — Contingut que la gent busca: guies (M per guia, L la primera)

Les notícies d'avui expliquen **canvis de l'app** («PDF de més qualitat», «Esborrar amb
seguretat»). Són útils per a qui ja la fa servir, però **gairebé ningú no les busca**. El que una
mestra, una logopeda o una família escriuen a Google és la tasca:

| Cerca típica | Idioma | Guia |
|---|---|---|
| «agenda visual rutina del matí pictogrames» | ca, es | Fer una agenda visual del matí |
| «secuencia lavarse las manos pictogramas para imprimir» | es | Seqüència de rentar-se les mans |
| «visual schedule printable» / «letter size» | en | Agenda visual en paper Carta (lliga amb el canvi del paper Carta) |
| «secuencia ir al baño pictogramas» | es | Anar al lavabo |
| «séquence pictogrammes habillage» | fr | Vestir-se |
| «anticipar visita al metge pictogrames» | ca, es | Anticipar una visita al metge o al dentista |
| «com imprimir i plastificar pictogrames» | ca, es | Imprimir, retallar i plastificar |

Cada guia: el problema, els passos fets **amb l'app** (captures per idioma, com ara) i, idealment,
el **document d'exemple** per descarregar (`.saac`) i fer-lo servir o adaptar-lo. La regla de
`docs/estandards/noticies.md` val igual: **sense tecnicismes**.

**Decisions prèvies** (la primera tasca de la fase 2 és prendre-les):

1. **On viuen les guies.** Dins de Novetats (una `category: "guia"` a `newsItems.ts`) o en una
   secció pròpia (`/:locale/guides/:slug`). La recomanació és una **secció pròpia**: Novetats és
   «què hi ha de nou», una guia no caduca, i barrejar-les fa que la llista de novetats deixi de
   servir per a allò.
2. **On viuen els textos.** Avui tots els textos de les notícies són al catàleg de l'app, i
   **ocupen el 59 % del catàleg anglès** (21.700 de 37.000 caràcters). Cada usuari se'l baixa
   sencer en obrir l'app, encara que no llegeixi cap notícia. Les guies són més llargues: posar-les
   també al catàleg el faria créixer a cada guia. La recomanació és **un fitxer per guia i
   idioma** (Markdown o JSON a `apps/web/src/content/guides/<locale>/<slug>.md`), que la pàgina
   carregui només quan s'obre i que l'script de la fase 1 llegeixi per generar l'HTML estàtic.
   Moure-hi també les notícies existents seria coherent, però no és imprescindible.
3. **Slug per idioma o comú.** Avui el slug és en anglès per a tots els idiomes. Un slug traduït
   (`/es/guias/lavarse-las-manos`) ajuda una mica a la cerca, però complica les redireccions i el
   `hreflang`. La recomanació és **mantenir el slug comú en anglès**: el `hreflang` ja fa la
   feina important.
4. **«Obre aquest exemple a l'app».** Descarregar el `.saac` i obrir-lo des del menú funciona
   avui. Un botó que l'obrís directament (per exemple `/<locale>/create-sequence?example=<slug>`)
   seria molt més còmode, però és una funcionalitat nova: s'ha de demanar a part.

### Fase 3 — Mesurar (S)

- **Search Console**: impressions, clics i posició per cerca i per idioma. Mirar-ho al cap d'un
  mes de tenir el sitemap, no abans.
- **GA4** ja compta les visites a les notícies (`usePageTracking`); amb les guies cal poder
  distingir qui hi arriba des de Google i qui hi arriba des de dins de l'app (la font de trànsit
  ja ho diu).
- La guia que no rep impressions al cap de tres mesos es revisa: el títol i la descripció són el
  primer que s'ajusta.

## Què no s'ha de fer

- **No comptar amb els resultats enriquits de FAQ o HowTo.** Des del 2023 Google només mostra els
  de FAQ a llocs oficials i de salut, i ha retirat els de HowTo. L'`Article` sí que val.
- **No passar a Next.js o a un framework amb SSR per això.** El prerenderitzat de les pàgines de
  notícies resol el problema sencer, i l'editor i la vista no tenen res a indexar.
- **No prerenderitzar l'editor (`/create-sequence`) ni la vista.** No hi ha contingut a indexar,
  i depenen de l'estat del navegador.
- **No escriure guies abans de la fase 1.** Contingut que Google no pot llegir no posiciona.
