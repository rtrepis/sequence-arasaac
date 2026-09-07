# Comparativa d'opcions d'infraestructura

Full de decisió: les sis opcions que hi ha sobre la taula, amb el que costen en
diners i en hores. **El raonament de cadascuna no és aquí** — és a
`ESTUDI-aprimar-arquitectura.md` (les que no surten del núvol, E1–E3) i a
`ESTUDI-servidor-propi.md` (les que sí, H1–H3). Aquest document només posa les
xifres de totes de costat, que és el que no es podia fer llegint-les per separat.

Xifres de setembre del 2026. El domini (~12 €/any) hi és a totes i no distingeix res.

---

## 1. Diners i hores

| # | Opció | Operadors | Any 1 | Any 2+ | Feina inicial | Manteniment |
|---|---|---|---|---|---|---|
| **0** | **Avui** — Vercel + Render + Atlas + Cloudinary + Resend | 5 | **~12 €** | **~12 €** | — | ~0 h |
| **E2** | **Tot a Render** — lloc estàtic + servei web | 4 | **~12 €** | **~12 €** | **½ dia** | ~0 h |
| **E1** | **Tot a Vercel** — l'API com a funció | 4 | **~12 €** | **~12 €** | **3–5 dies** | ~0 h |
| **H1** | **Servidor a casa** — mini-PC + relé de correu | 1 + relé | **~180–280 €** | **~30 €** | **6–9 dies** | **12–24 h/any** |
| **H2** | **Tot a un VPS** — Hetzner/OVH + relé | 1 + relé | **~80–150 €** | **~80–150 €** | **4–7 dies** | **12–24 h/any** |
| **H3** ⭐ | **Híbrid** — VPS + SPA en un estàtic gratuït | 2 + relé | **~80–150 €** | **~80–150 €** | **4–7 dies** | **12–24 h/any** |

### D'on surten les xifres

- **Els plans gratuïts (0, E1, E2) no costen res perquè no en costen.** Els cinc
  operadors tenen pla gratuït i l'app hi cap; l'únic desemborsament és el domini.
- **H1 (casa):** 150–250 € de maquinari una sola vegada + uns 18 €/any
  d'electricitat (10–15 W permanents ≈ 105 kWh). L'any 2 ja només és la llum.
- **H2/H3 (VPS):** 66–96 €/any de màquina (**Hetzner CX23 a 5,49 €/mes**, CPX22
  de 4 GB a **7,99 €/mes**, OVH VPS-1 a **7,60 €/mes** — tots tres van apujar
  preus l'abril del 2026) + 0–40 €/any de còpies fora de la màquina. **Les còpies
  poden ser gratuïtes**: tot el que s'ha de salvar són menys de 2 GB, i els 10 GB
  gratuïts de Cloudflare R2 o de Backblaze B2 hi caben de sobres.
- **El manteniment són hores, no euros**, i és l'única columna que no s'acaba mai:
  1–2 h al mes d'actualitzacions, comprovacions i còpies. **Els incidents no hi
  són comptats** perquè no es poden pressupostar, i arriben en mal moment.

> Per posar-ho en perspectiva: **H3 surten a ~0,75 € per usuari i any** amb el
> sostre de 200 comptes. El que decideix no són els diners.

---

## 2. Què canvia de debò (la columna que no és de diners)

| # | S'acaba la son de Render? | Sostres del pla gratuït | Si cau, què cau | Marxa enrere |
|---|---|---|---|---|
| **0** | No — fins a 1 min al primer desat | 5 MB/compte · 200 usuaris · 3 paraules | Només el núvol; l'editor s'obre igual | — |
| **E2** | **No** | Igual que avui | Només el núvol | Fàcil |
| **E1** | **Sí** | Igual que avui, i el sostre de Hobby passa a afectar **tota** l'app | Tot, si es passa la quota | Mitjana |
| **H1** | **Sí** | **Cap** | **Tot**, i fins que tornis a casa | Difícil |
| **H2** | **Sí** | **Cap** | **Tot** | Difícil |
| **H3** ⭐ | **Sí** | **Cap** | Només el núvol; **l'editor s'obre igual** | Difícil |

**Les dues files que expliquen la recomanació** són la tercera i la quarta
columna d'H2 contra H3. L'app funciona sencera sense compte: avui, quan Render
dorm o peta, l'editor s'obre igualment perquè el serveix el CDN de Vercel.
Autoallotjar-ho tot es queda aquella propietat pel camí; **H3 costa exactament el
mateix que H2 i la conserva**.

---

## 3. Feina que val la pena facis el que facis

Independent de l'opció que es triï. Es pot fer avui, no canvia cap operador i no
es llença si després es tria una altra cosa.

| Feina | Cost | Per què |
|---|---|---|
| **Pujada directa d'imatges** (A5) | 2–3 dies | Avui cada imatge fa dos salts de més (navegador → Vercel → Render → Cloudinary), infla un 33 % en base64 i es puja seqüencialment dins d'una sola petició. **És, a més, la precondició d'E1** |
| **Limitadors contra Mongo** (A6) | ½ dia | Ara compten en memòria del procés. Correcte amb una instància; decoratius amb més d'una |
| **Treure `cors` i `CORS_ORIGIN`** (A8) | Minuts | Vestigials: cap petició del navegador a l'API és mai d'origen creuat, ni en producció ni en desenvolupament |
| **Treure l'avís d'error per correu** (S1, L5) | ½ dia | És l'únic consumidor de la quota de correu que no és per a cap usuari. Té cost: et quedes sense canal que t'avisi |

---

## 4. En una frase cadascuna

- **0 — Avui.** Funciona i no costa res. El preu el pagues en límits, en un minut
  d'espera al primer desat del dia i en cinc llocs on una cosa pot fallar en silenci
  (ja ha passat dues vegades).
- **E2 — Tot a Render.** Mig dia, zero codi, un tauler menys. **No arregla res**, i
  és un cul-de-sac: la feina es llença si després es va a E1.
- **E1 — Tot a Vercel.** L'opció gratuïta que sí que millora l'app: s'acaba la son i
  se'n van 265 línies del front. **No hi cap tal com està l'API** (sostre dur de
  4,5 MB per petició), i el sostre de Hobby passaria a poder pausar el web sencer.
- **H1 — A casa.** La més barata a llarg termini i la que menys es pot recomanar:
  amb **Digi, MásMóvil o Pepephone hi ha CG-NAT i no pots obrir els ports 80 i 443**,
  i quan caigui la llum tornarà quan tornis tu.
- **H2 — Tot a un VPS.** Control total, cap límit, ~10 €/mes. Una caiguda se't porta
  l'aplicació sencera, també per als qui no hi tenen compte.
- **H3 — Híbrid.** ⭐ El mateix preu que H2 i sense aquell risc: API, base de dades i
  imatges a la teva màquina; l'SPA en un estàtic gratuït que no has de mantenir.

---

## 5. La tria, si s'ha de fer avui

| Si el que vols és… | Tria |
|---|---|
| No gastar ni un euro i que l'app millori | **E1** (amb la pujada directa primer) |
| Menys taulers, sense tocar codi, avui | **E2** — sabent que és un cul-de-sac |
| Manar-hi tu, sense límits i sense sons | **H3** |
| Gastar el mínim possible manant-hi tu | **H1**, i només si el teu operador no fa CG-NAT |
| No decidir encara | **La taula 3** — no en depèn cap |

**El que no s'ha de fer és E2 «de camí cap a E1»**, ni H2 quan H3 val el mateix.

Als plans gratuïts s'hi paga amb límits, sons de quinze minuts i avaries mudes; a
la màquina pròpia s'hi paga amb hores teves. Totes dues monedes són reals, i el
full de dalt només serveix per veure quant en costa cada opció — no per dir-te
quina de les dues tens més.

---

## Fonts

- [Hetzner Cloud — preus 2026](https://costgoat.com/pricing/hetzner) · [OVH vs Hetzner 2026](https://1vps.com/ovh-vs-hetzner/)
- [Vercel — límits de les funcions](https://vercel.com/docs/functions/limitations) · [`FUNCTION_PAYLOAD_TOO_LARGE`](https://vercel.com/docs/errors/FUNCTION_PAYLOAD_TOO_LARGE)
- [Render — Deploy for Free](https://render.com/docs/free) · [Static Sites](https://render.com/docs/static-sites)
- [Cloudflare R2 — 10 GB gratuïts](https://www.cloudflare.com/products/r2/)
- [Operadors amb CG-NAT a l'estat espanyol](https://www.redeszone.net/tutoriales/redes-cable/operadores-usan-cg-nat-internet/)
- `docs/ESTUDI-aprimar-arquitectura.md` — el raonament d'E1, E2 i E3
- `docs/ESTUDI-servidor-propi.md` — el raonament d'H1, H2 i H3
- `docs/ESTUDI-limits-serveis-gratuits.md` — el consum real de cada servei
