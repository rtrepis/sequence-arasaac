# Correus transaccionals

> **Quan llegir-lo:** abans de tocar `apps/api/src/shared/emailLayout.ts` o `mailer.ts`, o d'afegir cap correu nou.

Tots els correus que surten de l'aplicació tenen la mateixa cara. Font única de veritat:
`apps/api/src/shared/emailLayout.ts` (com es dibuixa) i `mailer.ts` (què diu i qui l'envia).

- **`renderEmail` és l'única manera d'escriure un correu.** Cap altre fitxer escriu HTML de
  correu: si la marca s'ha de poder canviar, s'ha de poder canviar en un sol lloc. L'avís intern
  d'error hi entra igual que els altres —arriba a la mateixa safata i s'ha de reconèixer igual
  de ràpid—, amb les dades en una taula en comptes d'un `<pre>`.
- **El contingut hi arriba en text pla i la plantilla l'escapa sencer.** El nom de l'usuari i el
  detall d'un error els escriu algú de fora i acaben dins d'un document HTML: amb l'escapat al
  render, injectar-hi marcatge és impossible per construcció i no per haver-se'n recordat a cada
  crida.
- **HTML i text pla surten de la mateixa declaració.** Mantenir-los per separat vol dir que un dia
  diran coses diferents i ningú se n'assabentarà, perquè la versió de text la llegeix justament
  qui no pot llegir l'altra. A més, un correu amb les dues parts arriba millor a la safata.
- **El nom de qui el rep va al cos, no a l'assumpte.** És el senyal que distingeix un correu de
  debò d'una imitació, que només en coneix l'adreça; l'assumpte, en canvi, identifica el fil i no
  ha de canviar segons qui el rebi. Si no hi ha nom, la salutació funciona sense («Hola!»).
- **Tot correu diu per què ha arribat** (`reason`, al peu). És el que separa un transaccional
  legítim d'un que no s'ha demanat, i el que evita que qui no l'esperava el marqui com a brossa.
- **Tot enllaç va dues vegades: al botó i en text.** Els botons es bloquegen, es trenquen i no es
  poden dictar per telèfon. El botó porta la forma de la casa (`APP_CORNER_RADIUS`) i fa 48 px
  d'alt, per damunt del mínim WCAG de diana tàctil.
- **Layout de taules, estils en línia i 600 px d'amplada.** No és estil antic: Outlook renderitza
  amb el motor del Word i no coneix flex ni grid, i molts clients esborren el `<style>`. Per això
  el botó porta el fons a la cel·la (no a l'enllaç) i una versió VML per a l'Outlook d'escriptori,
  i el bloc `<style>` només porta el que no es pot escriure en línia (les media queries).
- **El correu s'ha de reconèixer amb les imatges bloquejades**: el nom de la marca va en text al
  costat del logotip, mai dins de la imatge, i el logotip porta `alt`, amplada i alçada. En PNG i
  no en SVG: cap client de correu dibuixa SVG.
- **Ni blanc pur ni negre pur**: són els que disparen la inversió més agressiva dels clients en
  mode fosc. Els tokens de la paleta ja hi van bé (`#1E2A12` de tinta) i el correu declara
  `color-scheme: light dark`.
- **Excepció declarada a la regla de colors**: `emailLayout.ts` té els hexadecimals literals
  perquè un correu no pot importar el tema ni carregar cap full d'estil. Són els mateixos valors
  de `palette.ts` i viuen en un sol lloc de l'API.
- **Text de previsualització (`preheader`) sempre**: sense ell, la safata ensenya el primer text
  del cos, que aquí seria el nom de la marca repetit.

