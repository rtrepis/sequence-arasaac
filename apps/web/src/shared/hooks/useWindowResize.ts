import { useLayoutEffect, useState } from "react";

const useWindowResize = () => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    const updateSize = () => {
      // Sense maquetació (jsdom, a les proves), `clientWidth` és zero: llavors,
      // la finestra. Zero voldria dir «mòbil», i la vista canvia de disposició
      setSize([
        document.documentElement.clientWidth || window.innerWidth,
        document.documentElement.clientHeight || window.innerHeight,
      ]);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

export default useWindowResize;
