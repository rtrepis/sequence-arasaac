// El sòcol: el que ocupa, a baix de tot, un panell de baix **plegat**.
//
// El botó d'estat no segueix el panell quan puja (això és el terra,
// `floatingFloor`, que segueixen els avisos): es queda fix just per damunt del
// panell plegat, i quan el panell puja a mig o a sencer, el panell el tapa.
// Només es torna a veure quan el panell baixa. Un avís és de pas i ha de ser a
// la vista; el botó d'estat és permanent, i a mig o a sencer, qui treballa
// mira els ajustos, no el desat.
//
// Viu fora de Redux pel mateix motiu que `floatingFloor`: és una mida del
// navegador, no estat de l'app.

/** Nom de la variable CSS que llegeix el botó d'estat. */
export const FLOATING_BASE_VARIABLE = "--app-floating-base";

const bases = new Map<string, number>();

const publish = (): void => {
  const highest =
    bases.size === 0 ? null : Math.max(...Array.from(bases.values()));

  if (highest === null) {
    document.documentElement.style.removeProperty(FLOATING_BASE_VARIABLE);
    return;
  }

  document.documentElement.style.setProperty(
    FLOATING_BASE_VARIABLE,
    `${Math.round(highest)}px`,
  );
};

/**
 * Declara (o retira, amb `null`) l'alçada que una capa ocupa a baix de tot
 * quan és plegada. L'identificador ha de ser estable.
 */
export const setFloatingBase = (id: string, height: number | null): void => {
  if (height === null) {
    if (!bases.delete(id)) return;
  } else {
    bases.set(id, height);
  }

  publish();
};

/** El sòcol com a valor CSS, amb zero si no n'hi ha cap de declarat. */
export const floatingBaseCss = `var(${FLOATING_BASE_VARIABLE}, 0px)`;
