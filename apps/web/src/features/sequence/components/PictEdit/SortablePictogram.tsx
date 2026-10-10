import React from "react";
import { Grid2 } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePictogramProps {
  /** Identificador de la targeta dins de la llista ordenable */
  id: string;
  children: React.ReactNode;
}

/**
 * Casella de la graella d'edició que es pot arrossegar per canviar l'ordre.
 *
 * Només s'hi posen els `listeners` (ratolí i tàctil), no els `attributes`:
 * aquests en farien una segona parada del tabulador damunt del botó de la
 * targeta. Amb el teclat, l'ordre es canvia amb «Mou abans» i «Mou després»
 * del menú del pictograma.
 */
/**
 * Si el gest ha de poder començar un arrossegament. El diàleg d'edició i el
 * menú són portals: al DOM no són dins de la casella, però els esdeveniments
 * de React hi pugen igualment. Tampoc no s'arrossega des del camp que edita
 * el text damunt de la targeta, on el ratolí selecciona text.
 */
const startsOnCard = (event: React.SyntheticEvent<HTMLElement>): boolean =>
  event.target instanceof Element &&
  event.currentTarget.contains(event.target) &&
  !event.target.closest("input, textarea, [contenteditable='true']");

const SortablePictogram = ({
  id,
  children,
}: SortablePictogramProps): React.ReactElement => {
  const { setNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id });

  const cardListeners = Object.fromEntries(
    Object.entries(listeners ?? {}).map(([name, listener]) => [
      name,
      (event: React.SyntheticEvent<HTMLElement>) => {
        if (startsOnCard(event)) listener(event);
      },
    ]),
  );

  return (
    <Grid2
      ref={setNodeRef}
      {...cardListeners}
      // Amb el dit, deixar anar sense moure'l obre el menú d'aquesta targeta
      data-sortable-id={id}
      // Sense l'arrossegament natiu de la imatge, que es menjaria el gest
      onDragStart={(event: React.DragEvent<HTMLElement>) => {
        if (startsOnCard(event)) event.preventDefault();
      }}
      display={"flex"}
      justifyContent={"flex-start"}
      alignItems={"start"}
      sx={{
        // La que es mou s'aixeca: es fa una mica més gran i fa ombra. Amb el
        // dit, és el senyal que ja es pot moure
        transform: [
          CSS.Translate.toString(transform),
          isDragging ? "scale(1.05)" : undefined,
        ]
          .filter(Boolean)
          .join(" "),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        boxShadow: isDragging ? 8 : undefined,
        borderRadius: 2,
        cursor: isDragging ? "grabbing" : undefined,
        touchAction: "manipulation",
        "& img": { WebkitUserDrag: "none" },
      }}
    >
      {children}
    </Grid2>
  );
};

export default SortablePictogram;
