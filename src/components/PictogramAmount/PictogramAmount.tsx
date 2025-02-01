import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  addPictogramActionCreator,
  subtractLastPictActionCreator,
} from "../../app/slice/sequenceSlice";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { Stack } from "@mui/system";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import messages from "./PictogramAmount.lang";
import useNewPictogram from "../../hooks/useNewPictogram";
import React from "react";

interface PictogramAmountProps {
  variant?: "navBar";
  info: { value: boolean; toggleValue?: () => void };
}

const PictogramAmount = ({
  variant,
  info,
}: PictogramAmountProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();
  const amountSequence = useAppSelector((state) => state.sequence.length);

  const handleChangesAmount = (operator: number) => {
    if (operator > 0 && amountSequence < 60)
      dispatch(addPictogramActionCreator(pictogramEmpty(amountSequence)));
    if (operator < 0) dispatch(subtractLastPictActionCreator());
  };

  return (
    <FormControl
      sx={{
        minWidth: 260,
        transition: "all 1s ease",
      }}
    >
      <Stack direction={"row"} alignItems={"center"}>
        <FormLabel htmlFor="amount">
          <Typography color={variant && "primary.contrastText"}>
            <FormattedMessage {...messages.amount} />
          </Typography>
        </FormLabel>

        <Tooltip title={intl.formatMessage(messages.subtract)}>
          <span>
            <IconButton
              color={variant ? "primary" : "secondary"}
              aria-label={intl.formatMessage({ ...messages.subtract })}
              onClick={() => handleChangesAmount(-1)}
              disabled={amountSequence <= 0}
            >
              <AiFillMinusCircle />
            </IconButton>
          </span>
        </Tooltip>

        <Input
          id={"amount"}
          value={amountSequence.toString()}
          disabled
          sx={{
            width: 50,
            input: { textAlign: "center" },
          }}
        />

        <Tooltip title={intl.formatMessage(messages.add)}>
          <span>
            <IconButton
              color={variant ? "primary" : "secondary"}
              aria-label={intl.formatMessage({
                ...messages.add,
              })}
              disabled={amountSequence > 59}
              onClick={() => handleChangesAmount(+1)}
            >
              <AiFillPlusCircle />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={intl.formatMessage(messages.info)}>
          <IconButton
            sx={{ alingSlef: "start" }}
            onClick={() => info.toggleValue?.()}
          >
            <Typography variant="body2" color={"primary"}>
              <BsInfoCircle />
            </Typography>
          </IconButton>
        </Tooltip>
      </Stack>

      {info.value && (
        <FormHelperText sx={{ margin: "0" }}>
          <FormattedMessage {...messages.helperText} />
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default PictogramAmount;
