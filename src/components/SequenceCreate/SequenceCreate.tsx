import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  addPictogramActionCreator,
  subtractPictogramActionCreator,
} from "../../app/slice/sequenceSlice";
import { PictogramI } from "../../types/sequence";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { Stack } from "@mui/system";

const SequenceCreate = (): JSX.Element => {
  const dispatch = useDispatch();

  const initialAmountPict = 0;
  const [amountPict, setAmountPict] = useState(initialAmountPict);

  const pictogramEmpty: PictogramI = {
    index: amountPict + 1,
    number: 2652,
    border: "none",
  };
  const handleChangesAmount = (operator: number) => {
    setAmountPict(amountPict + operator);
    operator > 0
      ? dispatch(addPictogramActionCreator(pictogramEmpty))
      : dispatch(subtractPictogramActionCreator());
  };

  return (
    <FormControl>
      <Stack direction={"row"} alignItems={"center"}>
        <FormLabel>Pictograms:</FormLabel>
        <IconButton
          color="primary"
          aria-label="Add amount pictogram"
          onClick={() => handleChangesAmount(-1)}
          disabled={amountPict <= 0 ? true : false}
        >
          <AiFillMinusCircle />
        </IconButton>
        <Input
          color="primary"
          value={amountPict.toString()}
          disabled
          sx={{ width: 50, input: { textAlign: "center" } }}
        ></Input>
        <IconButton
          color="primary"
          aria-label="Subtract amount pictogram"
          onClick={() => handleChangesAmount(+1)}
        >
          <AiFillPlusCircle />
        </IconButton>
      </Stack>
      <FormHelperText sx={{ margin: "0" }}>
        enter the number of pictograms in the sequence
      </FormHelperText>
    </FormControl>
  );
};

export default SequenceCreate;
