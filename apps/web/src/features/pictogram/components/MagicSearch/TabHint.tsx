import { Box, Chip } from "@mui/material";
import React from "react";
import useTabHintPosition from "./useTabHintPosition";
import { TabHintProps } from "./TabHint.types";

// Xip "Tab" que segueix el text escrit a l'input per suggerir la tecla de selecció
const TabHint = ({
  phrase,
  visible,
  inputRef,
  containerRef,
}: TabHintProps): React.ReactElement => {
  const { mirrorRef, tagLeft } = useTabHintPosition(phrase, {
    inputRef,
    containerRef,
  });

  return (
    <>
      {/* Mirall invisible per mesurar l'amplada del text i posicionar el xip seguint les lletres */}
      <Box
        component="span"
        ref={mirrorRef}
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          whiteSpace: "pre",
        }}
      >
        {phrase}
      </Box>
      {visible && (
        <Chip
          label="Tab"
          size="small"
          variant="outlined"
          color="default"
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 9,
            left: tagLeft,
            pointerEvents: "none",
            backgroundColor: "background.paper",
            opacity: 0.3,
          }}
        />
      )}
    </>
  );
};

export default TabHint;
