import {
  Button,
  Divider,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyAllSettingItemActionCreator } from "../../app/slice/sequenceSlice";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { SettingItemI, UpdateSettingItemI } from "../../types/sequence";

interface SettingCardProps {
  item: SettingItemI;
  action: (toUpdate: UpdateSettingItemI) => void;
  indexPict?: number;
}

const SettingCard = ({
  item: { types, message: messageItem, name: nameItem },
  action,
  indexPict,
}: SettingCardProps): JSX.Element => {
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
    <Stack
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }} component="h4">
        <FormattedMessage {...messageItem} />
      </Typography>
      <Divider />

      <StyledToggleButtonGroup
        value={itemSelect}
        exclusive
        onChange={handleItem}
        aria-label={`${intl.formatMessage({ ...messageItem })}`}
      >
        {types.map(({ name, message }) => (
          <ToggleButton
            selected={settingItemValue === name}
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

        <ToggleButton
          value={"default"}
          onClick={() => action(payload)}
          selected={settingItemValue === "default"}
        >
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

      <Divider />

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

export default SettingCard;
