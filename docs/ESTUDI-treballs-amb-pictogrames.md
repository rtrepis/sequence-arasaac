# Estudi: els treballs que es fan amb pictogrames, i les plantilles que en surten

> **Per a què serveix**: R3 de `docs/PLA-mode-lliure.md` (§12). Les plantilles de pàgina han de
> sortir dels documents que fan de debò famílies, mestres i logopedes, no de formes geomètriques.
> **Abast**: entorn d'ARASAAC (Aula Abierta, CATEDU, guies de centres i administracions de parla
> hispana) i, internacionalment, guies d'educació especial i de comunicació augmentativa i
> alternativa (TEACCH, suports visuals per a l'autisme, taulers de vocabulari nuclear, Widgit,
> Boardmaker).
> **Data**: 2026-11-07. Primera versió.

## Com s'ha fet, i què no diu

- Cerques a la xarxa en català, castellà i anglès. Les fonts són **guies de pràctica** (universitats,
  escoles, administracions, l'Aula Abierta d'ARASAAC) i **catàlegs de plantilles** de programes
  comercials (Widgit, Boardmaker). Les fonts són a §5.
- **No hi ha xifres d'ús.** Cap font no diu quins treballs es fan més; l'ordre de §2 surt de quantes
  fonts els esmenten i de com hi insisteixen, no d'una mesura. Validar-lo amb usuaris reals és el pas
  següent (§4).
- Sobre l'eficàcia: una revisió de 2014 recull que **l'horari visual diari** està considerat
  pràctica basada en l'evidència (National Autism Center, 2009), i que els sistemes de treball de
  TEACCH encara no. Els colors del Fitzgerald als taulers tenen suport sobretot anecdòtic. No canvia
  què es fa, però sí què val la pena posar primer.

## 1. Tres coses que tots els treballs tenen en comú

1. **L'ordre de lectura importa, i és fix**: de dalt a baix en vertical, d'esquerra a dreta en
   horitzontal. A TEACCH és una regla explícita («l'element de dalt, o el de l'esquerra, és el
   primer»), perquè la persona no hagi de decidir per on començar. L'app ja l'aplica (`direction`,
   `readingOrder.ts`).
2. **Gairebé tots porten un rètol**: «Primer» i «Després», el dia de la setmana, «Avui és…», «Treballo
   per…», el títol de la rutina, «Primer plat». **L'app no té cap manera de posar un text sol** fora
   d'un pictograma. És la troballa més important d'aquest estudi (§3, T0).
3. **Sovint es retallen i es plastifiquen**: tires per a l'agenda amb velcro, targetes soltes per
   anar traient. Al full hi ha d'haver lloc per a les línies de tall, i les peces han de tenir mida
   de targeta.

## 2. Els treballs, de més a menys esmentats

| # | Treball | Forma habitual | Quantes seqüències (blocs) | Font principal |
|---|---|---|---|---|
| 1 | **Agenda o horari del dia** | Una tira llarga, vertical o horitzontal, en ordre de pas. Sovint a mig full o retallada, amb una zona de «fet» | 1 (a vegades amb capçalera «Avui és…») | TEACCH (Indiana IRCA), Aula Abierta ARASAAC, guies TEA de CyL, UNC |
| 2 | **Seqüència de passos** (rentar-se les mans, vestir-se, anar al lavabo) | 5–8 passos numerats en fila o en graella, en ordre | 1 | PictogramAgenda (INTEF), guies d'aula TEA |
| 3 | **Primer / Després** | Dos espais grans, l'un al costat de l'altre, amb el rètol a sobre | 2 | Suports visuals per a l'autisme (UC, NHS, Illinois State) |
| 4 | **Horari setmanal** | Taula: una columna per dia (5 o 7) amb el nom a dalt; files per franges | 5–7, un per dia, + capçalera | Guies TEA, Widgit (InPrint), CEP de Cantàbria |
| 5 | **Tauler d'elecció** | 2–6 opcions grans en graella; es comença per 2–3 i se n'afegeixen | 1 (graella) | Suports visuals (UC, Kerry's Place) |
| 6 | **Tauler de comunicació** (vocabulari nuclear) | Graella fixa i gran; el nuclear sempre al mateix lloc, a vegades fent de marc d'una zona temàtica; colors de Fitzgerald | 1 gran (+ 1 temàtic) | CPS, Universitat de Colònia, PrAACtical AAC |
| 7 | **Normes de l'aula** | Llista vertical; sovint «sí / no» (correcte i incorrecte) | 1 o 2 | Treballs finals TEA (CyL), Picto Selector |
| 8 | **Història social o conte adaptat** | Pàgines successives; a cada una, una frase amb els seus pictogrames | 1 per pàgina (o per frase) | Suports visuals, Aula Abierta |
| 9 | **Economia de fitxes** | Una tira de 3–5 espais per a les fitxes i un espai gran amb el premi («Treballo per…») | 2 | Special Learning, Boardmaker, guies escolars |
| 10 | **Anticipació d'una visita** (metge, perruqueria) | Com una seqüència de passos, una per situació | 1 | Guia del Hospital Macarena (plantilles predefinides) |
| 11 | **Menú del menjador** | Tres franges: primer, segon, postres; a vegades per triar | 3 | Educación 3.0, TES (menús amb pictogrames) |

**Pistes del que fan els programes comercials** (Widgit InPrint, Boardmaker): les seves plantilles
tenen exactament aquests noms —horari vertical, horari horitzontal, tires, «primer / després»,
taulers de comunicació, horari setmanal, llibres—, i InPrint té una guia sencera per fer un horari
setmanal fusionant cel·les d'una taula.

## 3. Les plantilles que en surten

Cada plantilla es diu pel **treball**, no per la forma: qui obre el selector busca «una agenda», no
«dues en files». Entre parèntesis, la forma.

| Plantilla | Treballs | Blocs i forma | Orientació |
|---|---|---|---|
| **T0 — Rètol** (no és una plantilla) | Tots | Un text sol, sense pictograma: el títol d'un bloc o d'una pàgina | — |
| **T1 — Una seqüència** (sencera) | Passos, normes, anticipació | 1 bloc a tota la pàgina | Vertical o horitzontal |
| **T2 — Agenda en tira** | Agenda del dia | 1 bloc estret i llarg (una sola columna o fila), o 2–3 tires per full per retallar | Vertical (tira vertical) |
| **T3 — Avui és + agenda** | Agenda del dia | 1 bloc estret a dalt (la data o «Avui és»), comú, + 1 bloc gran | Vertical |
| **T4 — Primer / Després** | Primer / Després | 2 blocs iguals, l'un al costat de l'altre, cadascun amb el seu rètol | Horitzontal |
| **T5 — Setmana** | Horari setmanal | 5 o 7 blocs en columnes, amb el nom del dia a cada un | Horitzontal |
| **T6 — Tauler** | Tauler d'elecció, de comunicació | 1 bloc gran amb columnes fixes (2×2, 3×2… fins a graelles grans) | Totes dues |
| **T7 — Economia de fitxes** | Economia de fitxes | 1 tira de 3–5 espais + 1 bloc gran per al premi | Horitzontal |
| **T8 — Pàgina de conte** | Història social, conte adaptat | 2–4 blocs en files, un per frase | Vertical |
| **T9 — Menú** | Menú del menjador | 3 blocs en files, amb el seu rètol | Vertical |

Algunes conseqüències per al disseny (R1–R8 del pla):

- **T0 (rètol) és un prerequisit** de mitja dotzena de plantilles. Sense rètols, «Primer / Després»,
  la setmana, el menú o l'economia de fitxes queden a mitges.
- **Les columnes fixes** (T6, T2) són tan importants com el repartiment de blocs: en un tauler de
  comunicació, el nombre de columnes no l'ha de decidir l'app.
- **Els blocs comuns** ja resolen la capçalera de T3 i el marc fix del tauler de vocabulari nuclear.
- **Tires per retallar** (T2, T7): demanen línies de tall al full imprès. És una idea nova; no és al
  pla.
- **L'orientació va amb la plantilla**: la setmana i «primer / després» són apaïsades, l'agenda i el
  menú verticals. En triar-ne una, l'app pot proposar l'orientació que li toca.

## 4. Què queda per validar

1. **L'ordre de §2 amb usuaris reals**: tres o quatre persones (una família, una mestra
   d'educació especial, una logopeda) i dues preguntes: quins d'aquests fan més sovint, i quin els
   falta. És el que pot convertir una llista raonable en una prioritat.
2. **Exemples reals** dels que ja fan servir l'app, si se'n poden aconseguir (amb permís i sense
   dades personals), per veure si els documents que es desen avui s'assemblen a aquestes formes.
3. **Materials CAA de l'Aula Abierta**: la secció de materials d'ARASAAC té exemples publicats que val
   la pena recórrer un per un. Aquesta primera versió no ho ha pogut fer en detall.

## 5. Fonts

**Entorn ARASAAC i parla hispana**
- [Aula Abierta ARASAAC: materials CAA](https://aulaabierta.arasaac.org/en/aac-materials)
- [Aula Abierta ARASAAC: com fer una agenda visual amb pictogrames](https://aulaabierta.arasaac.org/en?p=67699)
- [Aula Abierta ARASAAC: PictoAgenda](https://aulaabierta.arasaac.org/en/pictoagenda-0-home)
- [CATEDU: curs ARASAAC, «Nos orientamos en el tiempo con pictogramas»](https://libros.catedu.es/books/arasaac/chapter/4-nos-orientamos-en-el-tiempo-con-pictogramas/export/pdf)
- [CATEDU: curs ARASAAC, «Creamos y adaptamos propuestas didácticas»](https://libros.catedu.es/books/arasaac/chapter/3-creamos-y-adaptamos-propuestas-didacticas-con-las-nuevas-tecnologias/export/pdf)
- [CATEDU: «Trasteando con pictos»](https://equiposespecializados.catedu.es/wp-content/uploads/sites/234/2020/05/TRASTEANDO-CON-pictos.pdf)
- [INTEF: PictogramAgenda](https://intef.es/wp-content/uploads/2026/04/79_25_RED_OTE_PDF_PICTOGRAMAGENDA-1.pdf)
- [Junta de Castilla y León: intervenció educativa amb alumnat TEA](https://www.educa.jcyl.es/crol/es/recursos-educativos/intervencion-educativa-alumnos-tea-a05bc.ficheros/1668336-Intervenci%C3%B3n%20educativa%20con%20alumnado%20con%20TEA.pdf)
- [Junta de Castilla y León: mesures d'integració TEA (CEIP San Ildefonso)](https://www.educa.jcyl.es/crol/es/recursos-educativos/medidas-integracion-alumnos-tea-ceip-san-ildefonso.ficheros/1619865-TRABAJO%20FINAL%20TEA.pdf)
- [Universitat de Múrcia: rutines diàries d'un infant amb TEA](https://digitum.um.es/digitum/bitstream/10201/87079/1/PROPUESTA%20DE%20ACTUACI%c3%93N%20PARA%20TRABAJAR%20LAS%20RUTINAS%20DIARIAS%20DE%20UN%20NI%c3%91O%20CON%20TRASTORNO%20DEL%20ESPECTRO%20AUTISTA%20%28TEA%29%20PARA%20MEJORAR%20SU%20INTERACCI%c3%93N%20EN%20EL%20AULA.pdf)
- [Hospital Virgen Macarena: guia de pictogrames TEA (plantilles predefinides)](https://www.hospitalmacarena.es/wp-content/uploads/2021/10/Guia-Pictogramas-TEA.pdf)
- [ICBF (Colòmbia): exemple de CAA](https://www.icbf.gov.co/system/files/procesos/A1.G3.MD1_.DE%20Anexo%201.%20Ejemplo%20de%20Comunicaci%C3%B3n%20Aumentativa%20y%20Alternativa%20v1.pdf)
- [AFIRM (UNC): ajudes visuals](https://afirm.fpg.unc.edu/wp-content/uploads/Copia-de-AYUDAS-VISUALES-MÓDULO-TR-SPANISH.pdf)
- [Educación 3.0: comedor escolar inclusiu](https://www.educaciontrespuntocero.com/noticias/comedor-escolar-inclusivo/)

**Internacional: educació especial i CAA**
- [Indiana IRCA: horaris visuals (TEACCH)](https://www.iidc.indiana.edu/doc/resources/structured-teaching-strategies-visual-schedules.pdf)
- [Indiana IRCA: sistemes de treball (TEACCH)](https://www.iidc.indiana.edu/doc/resources/structured-teaching-strategies-work-systems.pdf)
- [Reading Rockets: estratègies d'ensenyament estructurat](https://readingrockets.org/article/structured-teaching-strategies-students-autism-spectrum-disorder)
- [University of Cincinnati: guia ràpida de suports visuals](https://cech.uc.edu/content/dam/refresh/cech-62/school-of-education/visual-supports/Visual%20Supports%20Cheat%20Sheet.pdf)
- [Illinois State University: suports visuals](https://education.illinoisstate.edu/downloads/asi/VisualSupports.pdf)
- [East Sussex NHS: suports visuals](https://www.esht.nhs.uk/wp-content/uploads/2021/02/Visual-Supports.pdf)
- [Kerry's Place: exemples de suports visuals](https://kerrysplace.org/wp-content/uploads/2026/05/Examples-of-Visual-Supports.pdf)
- [Chicago Public Schools: taulers de comunicació nuclear](https://sites.google.com/cps.edu/lite-tech-aac/lite-tech-systems/communication-boards)
- [Universitat de Colònia: materials de vocabulari nuclear](https://www.fbz-uk.uni-koeln.de/en/materials/core-vocabulary-materials/)
- [PrAACtical AAC: taulers de llenguatge](https://praacticalaac.org/praactical/how-we-do-it-using-language-boards-to-support-aac-use-by-nerissa-hall-and-hillary-jellison/)
- [Inclusive Technology: què volen dir els colors d'un tauler](https://www.inclusive.com/blogs/inclusive-insights/what-do-the-colours-on-a-communication-board-mean)
- [Global Symbols: tipus de taulers de comunicació](https://globalsymbols.com/knowledge-base/1Eytp3z0XGXoMpniKEezCi?locale=en)
- [Widgit: plantilles d'InPrint](https://www.widgit.com/support/inprint4/faq/templates.htm)
- [Widgit: com fer un horari visual amb InPrint 3](https://cdn.shopify.com/s/files/1/1192/0390/files/inprint3_creating_visual_timetables.pdf)
- [Durham County Library: Boardmaker (tipus d'exemples)](https://durhamcountylibrary.org/?p=2395)
- [ASHA Evidence Maps: resum de la revisió de 2014](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/33b523c2-cf9e-48e2-841d-bcac12cc18e4)
