import {
  Button,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyAllSettingItemActionCreator } from "../../app/slice/sequenceSlice";
import { SettingItemI, UpdateSettingItemI } from "../../types/sequence";
import { PictEditI } from "../../types/ui";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  "& .MuiToggleButtonGroup-grouped": {
    height: 55,
    width: 55,
    margin: 1,
    border: 1.75,
    "&.Mui-disabled": {
      border: 1.75,
    },
    "&:not(:first-of-type)": {
      borderRadius: 20,
    },
    "&:first-of-type": {
      borderRadius: 20,
    },
    "&:hover": {
      border: `1.75px solid`,
      borderColor: `green`,
      borderRadius: `20px`,
      boxShadow: "0px 0px 10px 1px #A6A6A6",
    },
  },
  "& .Mui-selected": {
    backgroundColor: "rgba(50,150,50,0.2)",
    border: `1.75px solid green`,
    borderRadius: `20px`,
    boxShadow: "0px 0px 10px 1px #A6A6A6",
    "&:not(:first-of-type)": {
      borderLeft: `1.75px solid green`,
    },
  },
}));

interface SettingItemProps {
  item: SettingItemI;
  action: (toUpdate: UpdateSettingItemI) => void;
  indexPict?: number;
}

const SettingItem = ({
  item: { types, message: messageItem, name: nameItem },
  action,
  indexPict,
}: SettingItemProps): JSX.Element => {
  const settingItemValue = useAppSelector((state) =>
    indexPict === undefined
      ? state.ui.setting[nameItem]
      : state.sequence[indexPict][nameItem]
  );
  const dispatch = useAppDispatch();
  const [itemSelect, setItemSelect] = useState<string | null>("default");

  const handleItem = (
    event: React.MouseEvent<HTMLElement>,
    newItem: string | null
  ) => {
    setItemSelect(newItem);
  };

  const handleApplyAll = () => {
    dispatch(
      applyAllSettingItemActionCreator({
        item: nameItem,
        value: settingItemValue!,
      })
    );
  };

  const payload: UpdateSettingItemI =
    indexPict === undefined
      ? { item: nameItem, value: "default" }
      : { index: indexPict, item: nameItem, value: "default" };

  const intl = useIntl();

  const message = defineMessages({
    default: {
      id: "components.settingItem.default.label",
      defaultMessage: "Default",
      description: "Type setting item",
    },
  });

  return (
    <Stack direction={"row"} alignItems="center" flexWrap={"wrap"}>
      <Typography variant="body1" sx={{ fontWeight: "bold" }} component="h4">
        <FormattedMessage {...messageItem} />
      </Typography>

      <StyledToggleButtonGroup
        value={itemSelect}
        exclusive
        onChange={handleItem}
        aria-label={`${intl.formatMessage({ ...messageItem })}`}
      >
        {types.map(({ name, message }) => (
          <ToggleButton
            value={name}
            aria-label={intl.formatMessage({ ...message })}
            key={name}
            onClick={() =>
              action(
                indexPict === undefined
                  ? { item: nameItem, value: name }
                  : { index: indexPict, item: nameItem, value: name }
              )
            }
          >
            <Tooltip title={intl.formatMessage({ ...message })} arrow>
              <img
                src={`/img/settings/${nameItem}/${name}.png`}
                alt={`${intl.formatMessage({
                  ...messageItem,
                })} ${intl.formatMessage({ ...message })}`}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        ))}

        <ToggleButton value={"default"} onClick={() => action(payload)}>
          <Tooltip title={intl.formatMessage({ ...message.default })}>
            <img
              src={`/img/settings/x.png`}
              alt={`${intl.formatMessage({
                ...messageItem,
              })} ${intl.formatMessage({ ...message.default })}`}
              width={40}
              height={40}
            />
          </Tooltip>
        </ToggleButton>
      </StyledToggleButtonGroup>

      <Button
        variant="contained"
        sx={{
          maxWidth: 40,
          maxHeight: 40,
          borderRadius: "20px",
          textTransform: "none",
          fontWeight: "bold",
          lineHeight: 1.25,
        }}
        onClick={handleApplyAll}
      >
        <FormattedMessage
          id="components.settingItem.applyAll.label"
          defaultMessage={"Apply All"}
          description={"apply to all pictograms"}
        />
      </Button>
    </Stack>
  );
};

export default SettingItem;
