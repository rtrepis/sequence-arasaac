// Amplada que les capes flotants del peu deixen lliure al racó inferior dret.
//
// Un avís del peu s'aparta perquè no tapi el botó que hi viu (troballa C7), i
// per sota de `sm` MUI l'estén de banda a banda sigui quin sigui l'`anchorOrigin`:
// l'única manera d'apartar-lo és retallar-li el costat. Ara bé, **el botó no hi
// és a totes les pàgines**: el d'estat del document només viu a l'editor i al
// visualitzador, i les fletxes de novetats, a les notícies. A la pàgina d'inici,
// al registre o al panell d'administració, un avís desplaçat 79 px cap a
// l'esquerra només es veu descentrat, sense res que ho expliqui.
//
// Per això la reserva la declara qui ocupa el racó, com l'alçada del peu la
// declara qui sura a `floatingInset`: quan no hi ha cap control, l'avís es queda
// on MUI el posa.
//
// Viu fora de Redux pel mateix motiu que `floatingInset`: no és estat de l'app,
// és una mida del navegador que un `sx` ha de poder llegir sense re-renderitzar
// ningú.

/** Nom de la variable CSS que llegeixen els avisos del peu. */
export const FLOATING_CORNER_VARIABLE = "--app-floating-corner";

const widths = new Map<string, number>();

const publish = (): void => {
  const widest =
    widths.size === 0 ? null : Math.max(...Array.from(widths.values()));

  if (widest === null) {
    document.documentElement.style.removeProperty(FLOATING_CORNER_VARIABLE);
    return;
  }

  document.documentElement.style.setProperty(
    FLOATING_CORNER_VARIABLE,
    `${Math.round(widest)}px`,
  );
};

/**
 * Declara (o retira, amb `null`) l'amplada que una capa flotant ocupa al racó
 * inferior dret de la finestra. L'identificador ha de ser estable: així la
 * mateixa capa s'actualitza en comptes d'acumular-se.
 */
export const setFloatingCorner = (id: string, width: number | null): void => {
  if (width === null) {
    if (!widths.delete(id)) return;
  } else {
    widths.set(id, width);
  }

  publish();
};
