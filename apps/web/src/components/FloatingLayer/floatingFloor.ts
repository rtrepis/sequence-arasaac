// Alçada del terra sobre el qual suren les capes flotants del peu.
//
// El botó d'estat i els avisos s'ancoren a `FLOATING_EDGE_GAP` de baix de la
// finestra. Amb un panell de baix (`AppBottomSheet`) obert, aquell «baix» ja no
// és la vora de la finestra sinó la vora de dalt del panell: si no, el panell
// els tapa. El panell declara aquí quant ocupa i les capes en llegeixen la
// variable CSS per posar-s'hi damunt.
//
// No és el mateix que `floatingInset`: aquell diu quant ha de reservar el
// contingut al final, i el declara cada avís amb la seva alçada. Si el botó
// d'estat llegís aquella reserva, saltaria amunt cada cop que surt un avís al
// seu costat. El terra només el declara qui fa de terra.
//
// Viu fora de Redux pel mateix motiu que `floatingInset`: és una mida del
// navegador, no estat de l'app.

/** Nom de la variable CSS que llegeixen les capes que suren al peu. */
export const FLOATING_FLOOR_VARIABLE = "--app-floating-floor";

const floors = new Map<string, number>();

const publish = (): void => {
  const highest =
    floors.size === 0 ? null : Math.max(...Array.from(floors.values()));

  if (highest === null) {
    document.documentElement.style.removeProperty(FLOATING_FLOOR_VARIABLE);
    return;
  }

  document.documentElement.style.setProperty(
    FLOATING_FLOOR_VARIABLE,
    `${Math.round(highest)}px`,
  );
};

/**
 * Declara (o retira, amb `null`) l'alçada que una capa ocupa a baix de tot de
 * la finestra, de manera que les capes flotants s'hi posin damunt.
 * L'identificador ha de ser estable: així la mateixa capa s'actualitza en
 * comptes d'acumular-se.
 */
export const setFloatingFloor = (id: string, height: number | null): void => {
  if (height === null) {
    if (!floors.delete(id)) return;
  } else {
    floors.set(id, height);
  }

  publish();
};

/** El terra com a valor CSS, amb zero si no n'hi ha cap de declarat. */
export const floatingFloorCss = `var(${FLOATING_FLOOR_VARIABLE}, 0px)`;
