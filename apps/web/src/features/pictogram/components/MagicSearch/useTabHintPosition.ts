import { RefObject, useLayoutEffect, useRef, useState } from "react";

// Separació entre el final del text i el tag, perquè no quedin enganxats
const TAG_GAP = 20;

// Espai reservat a la dreta perquè el tag no envaeixi la icona de cerca
const RIGHT_RESERVED_SPACE = 90;

interface TabHintPositionRefs {
  inputRef: RefObject<HTMLInputElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

// Calcula la posició horitzontal del tag "Tab" perquè segueixi les lletres escrites.
// Usa un element mirall on es copia la lletra (mida, gruix, família) de l'input real:
// si no coincideixen exactament, l'amplada mesurada queda per sota de l'amplada real
// i el tag acaba tapant les últimes lletres
const useTabHintPosition = (
  phrase: string,
  { inputRef, containerRef }: TabHintPositionRefs,
) => {
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const [tagLeft, setTagLeft] = useState(14);

  useLayoutEffect(() => {
    if (!mirrorRef.current || !inputRef.current) return;
    const inputStyle = window.getComputedStyle(inputRef.current);
    mirrorRef.current.style.font = inputStyle.font;
    mirrorRef.current.style.letterSpacing = inputStyle.letterSpacing;
    const paddingLeft = parseFloat(inputStyle.paddingLeft) || 0;
    const textWidth = mirrorRef.current.offsetWidth;
    const containerWidth = containerRef.current?.offsetWidth ?? 0;
    const maxLeft =
      containerWidth > 0
        ? containerWidth - RIGHT_RESERVED_SPACE
        : paddingLeft + textWidth + TAG_GAP;
    setTagLeft(
      Math.min(
        paddingLeft + textWidth + TAG_GAP,
        Math.max(maxLeft, paddingLeft),
      ),
    );
  }, [phrase, inputRef, containerRef]);

  return { mirrorRef, tagLeft };
};

export default useTabHintPosition;
