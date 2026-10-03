import { InputBase } from "@mui/material";
import React, { useRef, useState } from "react";
import { cardTextEditor } from "./PictEditModal.styled";

interface CardTextEditorProps {
  initialText: string;
  label: string;
  position: "top" | "bottom";
  /**
   * Desa el text. `fromKeyboard` diu si s'ha acabat amb Retorn: llavors el
   * focus ha de tornar a la targeta; si s'ha acabat clicant fora, no se'l pren
   */
  onCommit: (text: string, fromKeyboard: boolean) => void;
  /** Esc: es deixa el text com era i el focus torna a la targeta */
  onCancel: () => void;
}

/**
 * Edició del text d'un pictograma directament damunt de la seva targeta, a la
 * graella d'edició. Retorn o clicar fora desen; Esc ho deixa tot com era.
 */
const CardTextEditor = ({
  initialText,
  label,
  position,
  onCommit,
  onCancel,
}: CardTextEditorProps): React.ReactElement => {
  const [value, setValue] = useState(initialText);
  // Retorn i Esc acaben l'edició abans que arribi el `blur`: no s'ha de desar
  // dues vegades, ni desar el que Esc acaba de descartar
  const finished = useRef(false);

  const finish = (action: () => void) => {
    if (finished.current) return;
    finished.current = true;
    action();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(() => onCommit(value, true));
    }
    if (event.key === "Escape") {
      // Que Esc no arribi a res de sota (cap diàleg ni menú es tanca)
      event.preventDefault();
      event.stopPropagation();
      finish(onCancel);
    }
  };

  return (
    <InputBase
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => finish(() => onCommit(value, false))}
      // Tot seleccionat en entrar: el més habitual és reescriure'l sencer
      onFocus={(event) => event.target.select()}
      inputProps={{ "aria-label": label }}
      sx={cardTextEditor(position)}
    />
  );
};

export default CardTextEditor;
