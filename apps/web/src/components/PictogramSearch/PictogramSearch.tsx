import {
  Alert,
  Autocomplete,
  Stack,
  TextField,
  ToggleButton,
} from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useSearchPictogram from "../../features/pictogram/hooks/useSearchPictogram";
import usePictogramUrl from "../../features/pictogram/hooks/usePictogramUrl";
import StyledToggleButtonGroup from "../../style/StyledToggleButtonGroup";
import messages from "./PictogramSearch.lang";
import { useAppSelector } from "../../app/hooks";
import type { FitzgeraldCategory } from "@features/sequence/saac/fitzgerald";
import React from "react";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { Hair, Skin } from "@/types/sequence";
import type { RootState } from "../../app/store";
import usePersonalKeywords from "@features/word-profile/hooks/usePersonalKeywords";
import UploadImageButton from "../UploadImageButton";
import { TbMinus, TbPlus } from "react-icons/tb";
import { searchToggleIcon } from "./PictogramSearch.styled";

const filterOptions = createFilterOptions<string>({
  matchFrom: "start",
  limit: 100,
});

interface PropsPictogramSearch {
  indexPict: number;
  state: {
    selectedId: number;
    fitzgerald: string | undefined;
    url: string | undefined;
  };
  setState: React.Dispatch<
    React.SetStateAction<{
      color: boolean | undefined;
      hair: Hair | undefined;
      skin: Skin | undefined;
      selectedId: number;
      fitzgerald: string | undefined;
      url: string | undefined;
      category: FitzgeraldCategory | "none" | undefined;
    }>
  >;
}

const PictogramSearch = ({
  indexPict,
  state,
  setState,
}: PropsPictogramSearch): React.ReactElement => {
  const getActiveSAACPictImg = (state: RootState) =>
    state.document.content[state.document.activeSAAC][indexPict].img;
  const {
    settings: { skin, hair },
    searched: { word, bestIdPicts },
  } = useAppSelector(getActiveSAACPictImg);
  const keywords = usePersonalKeywords();

  const intl = useIntl();
  const { getSearchPictogram, getSettingsPictId } = useSearchPictogram();
  const { buildPictogramUrl } = usePictogramUrl();

  const initialWord =
    word === `${intl.formatMessage({ ...messages.empty })}` ? "" : word;
  const [newWord, setNewWord] = useState(initialWord);
  const [inputValue, setInputValue] = useState(initialWord);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (
    _: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setInputValue(value);
    // Obre només quan l'usuari escriu >= 3 caràcters; tanca en qualsevol altre cas
    setIsOpen(reason === "input" && value.length >= 3);
  };

  const handleChangeAutocomplete = (
    event: React.SyntheticEvent,
    value: string | null,
  ) => {
    if (value !== null) {
      setNewWord(value);
      setIsOpen(false);
      handleSubmit(event, value);
    }
  };

  const handleUpDatePictNumber = async (upDatePictNumber: number) => {
    const found = await getSettingsPictId(upDatePictNumber, indexPict);

    // Si ARASAAC no respon, sense color: la targeta pren el dels pictogrames
    // sense categoria de l'estil del document
    setState({
      color: found?.settings.color,
      hair: found?.settings.hair,
      skin: found?.settings.skin,
      selectedId: upDatePictNumber,
      fitzgerald: found?.settings.fitzgerald,
      url: undefined,
      category: found?.category ?? "none",
    });
  };

  const handleSubmit = async (event: SyntheticEvent, value: string) => {
    event.preventDefault();
    setIsPlus(false);
    await getSearchPictogram(value, indexPict, true);
  };

  const [isPlus, setIsPlus] = useState(false);

  const handelPlusAction = async (plus: boolean) => {
    await getSearchPictogram(newWord, indexPict, true, plus);
    setIsPlus(!isPlus);
  };

  // La imatge pròpia substitueix el pictograma: no té ni color ni variants,
  // ni categoria de Fitzgerald
  const applyUploadedImage = (url: string | undefined) =>
    setState({
      selectedId: 0,
      fitzgerald: undefined,
      url,
      color: undefined,
      hair: undefined,
      skin: undefined,
      category: "none",
    });

  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    if (bestIdPicts[0] === -1) {
      setIsAlert(true);
    }
    setTimeout(() => setIsAlert(false), 3000);
  }, [bestIdPicts]);

  return (
    <Stack flex={1} sx={{ width: "-webkit-fill-available" }}>
      <Autocomplete
        open={isOpen}
        onClose={() => setIsOpen(false)}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={keywords}
        filterOptions={filterOptions}
        onChange={handleChangeAutocomplete}
        sx={{ width: "100%" }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={intl.formatMessage({ ...messages.search })}
            helperText={intl.formatMessage({ ...messages.helperText })}
          />
        )}
      />
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
                src={buildPictogramUrl(pictogram, skin, hair)}
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
            sx={searchToggleIcon}
          >
            <TbPlus size={25} aria-hidden />
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
            sx={{ ...searchToggleIcon, width: 30, height: 30 }}
          >
            <TbMinus size={25} aria-hidden />
          </ToggleButton>
        )}

        <UploadImageButton
          key={"upload"}
          imageUrl={state.url}
          onUpload={applyUploadedImage}
          onRemove={() => applyUploadedImage(undefined)}
        />
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
