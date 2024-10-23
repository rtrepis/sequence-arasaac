import {
  Alert,
  ButtonBase,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
} from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FormattedMessage, useIntl } from "react-intl";
import useAraSaac from "../../hooks/useAraSaac";
import StyledToggleButtonGroup from "../../style/StyledToggleButtonGroup";
import messages from "./PictogramSearch.lang";
import { useAppSelector } from "../../app/hooks";
import React from "react";
import { MdOutlineDriveFolderUpload } from "react-icons/md";

interface PropsPictogramSearch {
  indexPict: number;
  state: {
    selectedId: number;
    fitzgerald: string | undefined;
    url: string | undefined;
  };
  setState: React.Dispatch<
    React.SetStateAction<{
      selectedId: number;
      fitzgerald: string | undefined;
      url: string | undefined;
    }>
  >;
}

const PictogramSearch = ({
  indexPict,
  state,
  setState,
}: PropsPictogramSearch): React.ReactElement => {
  const {
    settings: { skin, hair },
    searched: { word, bestIdPicts },
  } = useAppSelector((state) => state.sequence[indexPict].img);

  const intl = useIntl();
  const {
    getSearchPictogram,
    toUrlPath: toUrlPathApiAraSaac,
    getSettingsPictId,
  } = useAraSaac();

  const initialWord =
    word === `${intl.formatMessage({ ...messages.empty })}` ? "" : word;
  const [newWord, setNewWord] = useState(initialWord);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewWord(event.target.value);
  };

  const handleUpDatePictNumber = async (upDatePictNumber: number) => {
    const pictApiAraSettings = await getSettingsPictId(
      upDatePictNumber,
      indexPict,
    );

    const fitzgerald = pictApiAraSettings
      ? pictApiAraSettings.fitzgerald
      : "#999999";

    setState({
      selectedId: upDatePictNumber,
      fitzgerald: fitzgerald,
      url: undefined,
    });
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    await getSearchPictogram(newWord, indexPict, true);
  };

  const [isPlus, setIsPlus] = useState(false);

  const handelPlusAction = async (plus: boolean) => {
    await getSearchPictogram(newWord, indexPict, true, plus);
    setIsPlus(!isPlus);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);

      setState({ selectedId: 0, fitzgerald: undefined, url: imageURL });
    }
  };

  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    if (bestIdPicts[0] === -1) {
      setIsAlert(true);
    }
    setTimeout(() => setIsAlert(false), 3000);
  }, [bestIdPicts]);

  return (
    <Stack flex={1} sx={{ width: "-webkit-fill-available" }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label={intl.formatMessage({ ...messages.search })}
          id={"search"}
          variant="outlined"
          helperText={intl.formatMessage({ ...messages.helperText })}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                component={ButtonBase}
                onClick={handleSubmit}
                aria-label={"toSearch"}
              >
                <AiOutlineSearch fontSize={"large"} />
              </InputAdornment>
            ),
          }}
          autoComplete={"off"}
          value={newWord}
          onChange={handleChange}
          fullWidth
          sx={{ width: "100%" }}
        />
      </form>
      <StyledToggleButtonGroup>
        {bestIdPicts[0] !== -1 &&
          bestIdPicts.map((pictogram, index) => (
            <ToggleButton
              value={pictogram}
              aria-label={`${intl.formatMessage({
                ...messages.pictogram,
              })}`}
              key={`p_${pictogram}_i_${index}`}
              onClick={() => handleUpDatePictNumber(pictogram)}
              selected={pictogram === state.selectedId}
            >
              <img
                src={toUrlPathApiAraSaac(pictogram, skin, hair)}
                alt={`${intl.formatMessage({
                  ...messages.pictogram,
                })} ${newWord}`}
                width={40}
                height={40}
              />
            </ToggleButton>
          ))}
        {!isPlus && bestIdPicts.length > 0 && bestIdPicts[0] !== 0 && (
          <ToggleButton
            value={"plus"}
            aria-label={`${intl.formatMessage({
              ...messages.plus,
            })}`}
            key={`plus`}
            onClick={() => handelPlusAction(true)}
          >
            <img
              src={"../img/settings/+.png"}
              alt={`${intl.formatMessage({
                ...messages.plus,
              })}`}
              width={25}
              height={25}
            />
          </ToggleButton>
        )}

        {isPlus && (
          <ToggleButton
            value={"minus"}
            aria-label={`${intl.formatMessage({
              ...messages.minus,
            })}`}
            key={`minus`}
            onClick={() => handelPlusAction(false)}
            sx={{ width: 30, height: 30 }}
          >
            <img
              src={"../img/settings/-.png"}
              alt={`${intl.formatMessage({
                ...messages.minus,
              })}`}
              width={25}
              height={25}
            />
          </ToggleButton>
        )}

        <ToggleButton
          value={"plus"}
          aria-label={`${intl.formatMessage({
            ...messages.plus,
          })}`}
          key={"upload"}
          onClick={() => {
            const imageUpload = document.getElementById("select-image");
            if (imageUpload) imageUpload.click();
          }}
        >
          <MdOutlineDriveFolderUpload size={80} />
          <input
            id="select-image"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            hidden
          />
        </ToggleButton>
      </StyledToggleButtonGroup>
      {isAlert && (
        <Alert severity="info">
          <FormattedMessage {...messages.alert} />
        </Alert>
      )}
    </Stack>
  );
};

export default PictogramSearch;
