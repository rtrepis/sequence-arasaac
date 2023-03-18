import {
  Button,
  Divider,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { SettingItemI } from "../../types/sequence";

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
}

const SettingItem = ({
  item: { types, message: messageItem, name: nameItem },
}: SettingItemProps): JSX.Element => {
  const [itemSelect, setItemSelect] = useState<string | null>("default");

  const handleItem = (
    event: React.MouseEvent<HTMLElement>,
    newItem: string | null
  ) => {
    setItemSelect(newItem);
  };

  const intl = useIntl();

  const message = defineMessages({
    default: {
      id: "components.settingItem.default.label",
      defaultMessage: "Default",
      description: "Type setting item",
    },
  });

  return (
    <Stack direction={"row"} alignItems="center">
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        <FormattedMessage {...messageItem} />
      </Typography>
      <Divider variant="inset" />

      <StyledToggleButtonGroup
        value={itemSelect}
        exclusive
        onChange={handleItem}
        aria-label={`${intl.formatMessage({ ...messageItem })} settings`}
      >
        {types.map(({ name, message }) => (
          <ToggleButton value={name} aria-label={name} key={name}>
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
        <ToggleButton value={"default"}>
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
      <Divider variant="inset" />
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