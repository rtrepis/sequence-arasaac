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
import toCapitalize from "../../utils/toCapitalize";

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
  itemKey: string;
  items: string[];
}

const SettingItem = ({ itemKey, items }: SettingItemProps): JSX.Element => {
  const [itemSelect, setItemSelect] = useState<string | null>("default");

  const handleItem = (
    event: React.MouseEvent<HTMLElement>,
    newItem: string | null
  ) => {
    setItemSelect(newItem);
  };

  return (
    <Stack direction={"row"} alignItems="center">
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {itemKey}
      </Typography>
      <Divider variant="inset" />

      <StyledToggleButtonGroup
        value={itemSelect}
        exclusive
        onChange={handleItem}
        aria-label={`${itemKey} settings`}
      >
        {items.map((item) => (
          <ToggleButton value={item} aria-label={item} key={item}>
            <Tooltip title={toCapitalize(item)} arrow>
              <img
                src={`/img/settings/${itemKey}/${item}.png`}
                alt={`${item} ${itemKey}`}
                width={40}
                height={40}
              />
            </Tooltip>
          </ToggleButton>
        ))}
        <ToggleButton value={"default"}>
          <Tooltip title="Default">
            <img
              src={`/img/settings/x.png`}
              alt={`default ${itemKey}`}
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
          textTransform: "capitalize",
          fontWeight: "bold",
          lineHeight: 1.25,
        }}
      >
        Apply all
      </Button>
    </Stack>
  );
};

export default SettingItem;
