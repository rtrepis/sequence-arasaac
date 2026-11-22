import { PictSequence } from "@/types/sequence";

// Un pictograma nou no porta cap estil: l'hereta tot de l'estil que li toca
// (solució A del pla dels estils). Buit no té categoria, i per tant pren el
// color de Fitzgerald dels que no en tenen
const useNewPictogram = () => {
  const getPictogramEmptyWithDefaultSettings = (indexSequence: number) => {
    const pictogramEmpty: PictSequence = {
      indexSequence: indexSequence,
      img: {
        searched: {
          word: "",
          bestIdPicts: [],
        },
        selectedId: 0,
        settings: {},
        variants: [],
        category: "none",
      },
      settings: {},
      cross: false,
    };

    return pictogramEmpty;
  };

  return { getPictogramEmptyWithDefaultSettings };
};

export default useNewPictogram;
