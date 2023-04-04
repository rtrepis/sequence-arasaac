import { Divider, Input, Stack, TextField } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import { useState } from "react";
import NotPrint from "../../components/NotPrint/NotPrint";

const ViewSequencePage = (): JSX.Element => {
  const sequence = useAppSelector((state) => state.sequence);

  const [size, setSize] = useState(1);
  const [columnGap, setColumnGap] = useState(1);
  const [rowGap, setRowGap] = useState(1);

  return (
    <>
      <NotPrint>
        <Stack spacing={2} direction={"row"} marginTop={2}>
          <TextField
            type="number"
            color="primary"
            label="Size"
            fullWidth
            InputProps={{
              componentsProps: { input: { step: 0.05, min: 0.1, max: 2 } },
            }}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
          <Input value={150 * size} sx={{ display: "none" }} />
          <TextField
            type="number"
            color="primary"
            label="Space Column"
            fullWidth
            InputProps={{
              componentsProps: { input: { step: 0.5, min: 0, max: 10 } },
            }}
            value={columnGap}
            onChange={(event) => setColumnGap(Number(event.target.value))}
          />
          <TextField
            type="number"
            color="primary"
            label="Space Row"
            fullWidth
            InputProps={{
              componentsProps: { input: { step: 0.5, min: 0, max: 10 } },
            }}
            value={rowGap}
            onChange={(event) => setRowGap(Number(event.target.value))}
          />
        </Stack>
        <Divider
          variant="inset"
          sx={{ marginBlock: 2, marginInlineStart: 0 }}
        />
      </NotPrint>
      <Stack
        direction={"row"}
        flexWrap={"wrap"}
        alignContent={"start"}
        columnGap={columnGap}
        rowGap={rowGap}
        maxWidth={1080}
        height={750}
        overflow={"hidden"}
        sx={{
          border: "1px solid red",
          "@media print": { "@page": { size: "A4 landscape", margin: 1 } },
        }}
      >
        {sequence.map((pictogram) => (
          <PictogramCard
            pictogram={pictogram}
            view={"complete"}
            variant="plane"
            size={size}
          />
        ))}
      </Stack>
    </>
  );
};

export default ViewSequencePage;
