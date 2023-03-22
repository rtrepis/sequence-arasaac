import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
} from "@mui/material";
import {
  addPictogramActionCreator,
  subtractLastPictActionCreator,
} from "../../app/slice/sequenceSlice";
import { PictogramI } from "../../types/sequence";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import messages from "./PictogramAmount.lang";

const PictogramAmount = (): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const skin = useAppSelector((state) => state.ui.setting.skin);
  const amountSequence = useAppSelector((state) => state.sequence.length);

  const initialAmountPict = 0;
  const [amountPict, setAmountPict] = useState(initialAmountPict);

  const pictogramEmpty: PictogramI = {
    index: amountPict,
    number: 26527,
    border: {
      in: { color: "blue", radius: 20, size: 2 },
      out: { color: "green", radius: 20, size: 2 },
    },
    skin: skin,
    word: { keyWord: `${intl.formatMessage(messages.empty)}`, pictograms: [] },
  };

  const handleChangesAmount = (operator: number) => {
    setAmountPict(amountPict + operator);
    operator > 0
      ? dispatch(addPictogramActionCreator(pictogramEmpty))
      : dispatch(subtractLastPictActionCreator());
  };

  useEffect(() => setAmountPict(amountSequence), [amountSequence]);

  return (
    <FormControl sx={{ minWidth: 240 }}>
      <Stack direction={"row"} alignItems={"center"}>
        <FormLabel htmlFor="amount">
          <FormattedMessage {...messages.amount} />
        </FormLabel>

        <IconButton
          color="primary"
          aria-label={intl.formatMessage({ ...messages.add })}
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
            ...messages.subtract,
          })}
          onClick={() => handleChangesAmount(+1)}
        >
          <AiFillPlusCircle />
        </IconButton>
      </Stack>

      <FormHelperText sx={{ margin: "0" }}>
        <FormattedMessage {...messages.helperText} />
      </FormHelperText>
    </FormControl>
  );
};

export default PictogramAmount;
