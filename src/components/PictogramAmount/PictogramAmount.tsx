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
import { PictSequence } from "../../types/sequence";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import messages from "./PictogramAmount.lang";
import { preloadedState } from "../../utils/test-utils";

const PictogramAmount = (): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const amountSequence = useAppSelector((state) => state.sequence.length);
  const pictSequenceDefault = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence
  );

  let pictogramEmpty: PictSequence = {
    ...preloadedState.sequence[0],
    indexSequence: amountSequence,
    img: {
      ...preloadedState.sequence[0].img,
      searched: {
        word: `${intl.formatMessage(messages.empty)}`,
        bestIdPicts: [],
      },
      selectedId: 26527,
      settings: { fitzgerald: "#22f" },
    },
    settings: {
      textPosition: pictSequenceDefault.textPosition,
      borderIn: {
        color: pictSequenceDefault.borderIn!.color,
        radius: 20,
        size: pictSequenceDefault.borderIn!.size,
      },
      borderOut: {
        color: pictSequenceDefault.borderOut!.color,
        radius: 20,
        size: pictSequenceDefault.borderIn!.size,
      },
    },
  };

  const handleChangesAmount = (operator: number) => {
    operator > 0
      ? dispatch(addPictogramActionCreator(pictogramEmpty))
      : dispatch(subtractLastPictActionCreator());
  };

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
          disabled={amountSequence <= 0 ? true : false}
        >
          <AiFillMinusCircle />
        </IconButton>

        <Input
          id={"amount"}
          color="primary"
          value={amountSequence.toString()}
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
