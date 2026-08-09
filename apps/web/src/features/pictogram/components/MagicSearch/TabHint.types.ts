import { RefObject } from "react";

export interface TabHintProps {
  // Frase actual de l'input, per mesurar on acaba el text
  phrase: string;
  // Mostra o amaga el xip (el mirall de mesura sempre es renderitza)
  visible: boolean;
  // Input real d'on es copia la tipografia per a la mesura
  inputRef: RefObject<HTMLInputElement | null>;
  // Contenidor que limita la posició màxima del xip
  containerRef: RefObject<HTMLDivElement | null>;
}
