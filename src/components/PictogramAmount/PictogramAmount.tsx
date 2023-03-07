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
import { FormattedMessage } from "react-intl";

const PictogramAmount = (): JSX.Element => {
  const dispatch = useDispatch();

  const initialAmountPict = 0;
  const [amountPict, setAmountPict] = useState(initialAmountPict);

  const pictogramEmpty: PictogramI = {
    index: amountPict + 1,
    number: 26527,
    border: {
      in: { color: "blue", radius: 20, size: 2 },
      out: { color: "green", radius: 20, size: 2 },
    },
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
        <FormLabel htmlFor="amount">
          <FormattedMessage
            id={"components.pictogramAmount.label"}
            defaultMessage={"Pictograms:"}
            description={"Amount Pictogram"}
          />
        </FormLabel>
        <IconButton
          color="primary"
          aria-label="Add amount pictogram"
          onClick={() => handleChangesAmount(-1)}
          disabled={amountPict <= 0 ? true : false}
        >
          <AiFillMinusCircle />
        </IconButton>
        <Input
          id={"amount"}
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
        <FormattedMessage
          id="components.pictogramAmount.helperText"
          defaultMessage={"Enter the number of pictograms in the sequence"}
          description="Helper text amount pictograms"
        />
      </FormHelperText>
    </FormControl>
  );
};

export default PictogramAmount;