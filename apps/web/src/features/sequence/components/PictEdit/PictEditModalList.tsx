import { Grid2 } from "@mui/material";
import { PictSequence, Sequence } from "@/types/sequence";
import PictEditModal from "./PictEditModal";
import SortablePictogram from "./SortablePictogram";
import { useRef, useState } from "react";
import useNewPictogram from "@features/pictogram/hooks/useNewPictogram";
import React from "react";
import { useIntl } from "react-intl";
import {
  Announcements,
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useAppDispatch } from "@app/hooks";
import { movePictogramActionCreator } from "@features/sequence/store/documentSlice";
import messages from "./PictEdit.lang";

interface PictEditModalProps {
  sequence: Sequence;
}

/** Id de la targeta dins de la llista ordenable: la posició, que és única */
const sortableIdOf = (index: number): string => `pict${index}`;

/**
 * Menys que això, en píxels, és deixar anar sense haver mogut el dit: amb el
 * tàctil, vol dir que es volia el menú i no moure la targeta
 */
const TOUCH_MENU_MAX_MOVE = 8;

/** Si el gest ha començat amb el dit (a Firefox d'escriptori no hi ha `TouchEvent`) */
const isTouchEvent = (event: Event | null): boolean =>
  event?.type === "touchstart";

/** La posició que correspon a un id de la llista ordenable */
const indexOfSortableId = (id: UniqueIdentifier): number =>
  Number(String(id).slice("pict".length));

const PictEditModalList = ({
  sequence,
}: PictEditModalProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();

  const initialCopyPictogram: PictSequence = pictogramEmpty(-1);
  const [copyPictogram, setPictogram] = useState(initialCopyPictogram);

  // En deixar anar la targeta damunt d'ella mateixa, el navegador hi dispara
  // un clic: no ha d'obrir el diàleg d'edició
  const justDropped = useRef(false);

  // Cal moure's una mica amb el ratolí, o mantenir el dit un moment, abans
  // que comenci l'arrossegament: així el clic obre el diàleg com sempre i
  // lliscar el dit continua desplaçant la pàgina
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const sortableIds = sequence.map((pictogram) =>
    sortableIdOf(pictogram.indexSequence),
  );

  const positionOf = (id: UniqueIdentifier): number =>
    indexOfSortableId(id) + 1;

  // El que diu el lector de pantalla mentre s'arrossega, en l'idioma de l'app
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      intl.formatMessage(messages.dragStart, { number: positionOf(active.id) }),
    onDragOver: ({ over }) =>
      over
        ? intl.formatMessage(messages.dragOver, { number: positionOf(over.id) })
        : undefined,
    onDragEnd: ({ over }) =>
      over
        ? intl.formatMessage(messages.dragEnd, { number: positionOf(over.id) })
        : intl.formatMessage(messages.dragCancel),
    onDragCancel: () => intl.formatMessage(messages.dragCancel),
  };

  // Mentre s'arrossega, el menú contextual no s'obre: a Android la pulsació
  // llarga el dispara igualment al cap de mig segon, amb la targeta a la mà
  const dragging = useRef(false);

  const handlerDragStart = ({ activatorEvent }: DragStartEvent) => {
    dragging.current = true;
    // Una vibració curta diu que la targeta ja es pot moure (només Android)
    if (isTouchEvent(activatorEvent)) navigator.vibrate?.(10);
  };

  const handlerContextMenuCapture = (event: React.MouseEvent) => {
    if (!dragging.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Amb el dit, mantenir premut i deixar anar sense moure'l obre el menú de la
   * targeta: així moure i obrir el menú són dos gestos que no es confonen. És
   * també el menú contextual dels iPhone i iPad, on el navegador no el dispara
   */
  const openMenuOf = (id: UniqueIdentifier) => {
    const button = document
      .querySelector(`[data-sortable-id="${String(id)}"]`)
      ?.querySelector("button");
    button?.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true }),
    );
  };

  const handlerDragEnd = ({
    active,
    over,
    delta,
    activatorEvent,
  }: DragEndEvent) => {
    dragging.current = false;
    justDropped.current = true;
    setTimeout(() => {
      justDropped.current = false;
    });
    if (
      isTouchEvent(activatorEvent) &&
      Math.hypot(delta.x, delta.y) < TOUCH_MENU_MAX_MOVE
    ) {
      // Després que l'arrossegament hagi acabat de netejar
      setTimeout(() => openMenuOf(active.id));
      return;
    }
    if (!over || active.id === over.id) return;
    dispatch(
      movePictogramActionCreator({
        from: indexOfSortableId(active.id),
        to: indexOfSortableId(over.id),
      }),
    );
  };

  const handlerClickCapture = (event: React.MouseEvent) => {
    if (!justDropped.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handlerDragStart}
      onDragEnd={handlerDragEnd}
      onDragCancel={() => {
        dragging.current = false;
      }}
      accessibility={{ announcements }}
    >
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <Grid2
          container
          marginTop={0}
          flex={1}
          onClickCapture={handlerClickCapture}
          onContextMenuCapture={handlerContextMenuCapture}
        >
          {sequence.map((pictogram) => (
            <SortablePictogram
              key={`pict${pictogram.indexSequence}`}
              id={sortableIdOf(pictogram.indexSequence)}
            >
              <PictEditModal
                pictogram={pictogram}
                copy={
                  copyPictogram.indexSequence === -1 ? undefined : copyPictogram
                }
                setCopy={setPictogram}
              />
            </SortablePictogram>
          ))}
        </Grid2>
      </SortableContext>
    </DndContext>
  );
};

export default PictEditModalList;
