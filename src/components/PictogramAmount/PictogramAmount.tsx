import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
} from "@mui/material";
import {
  addPictogramActionCreator,
  subtractPictogramActionCreator,
} from "../../app/slice/sequenceSlice";
import { PictogramI } from "../../types/sequence";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const PictogramAmount = (): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const skin = useAppSelector((state) => state.ui.setting.skin);

  const initialAmountPict = 0;
  const [amountPict, setAmountPict] = useState(initialAmountPict);

  const pictogramEmpty: PictogramI = {
    index: amountPict + 1,
    number: 26527,
    border: {
      in: { color: "blue", radius: 20, size: 2 },
      out: { color: "green", radius: 20, size: 2 },
    },
    skin: skin,
    word: { keyWord: "Empty" },
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
          aria-label={intl.formatMessage({
            id: "components.pictogramAmount.add.label",
            defaultMessage: "Add pictogram",
            description: "Add a pictogram to the amounts",
          })}
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
          aria-label={intl.formatMessage({
            id: "components.pictogramAmount.subtract.label",
            defaultMessage: "Subtract pictogram",
            description: "Subtract a pictogram from the amounts",
          })}
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
