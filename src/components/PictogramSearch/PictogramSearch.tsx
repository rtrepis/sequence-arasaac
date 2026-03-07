import {
  Alert,
  Autocomplete,
  Stack,
  TextField,
  ToggleButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SyntheticEvent, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useSearchPictogram from "../../features/pictogram/hooks/useSearchPictogram";
import usePictogramUrl from "../../features/pictogram/hooks/usePictogramUrl";
import StyledToggleButtonGroup from "../../style/StyledToggleButtonGroup";
import messages from "./PictogramSearch.lang";
import { useAppSelector } from "../../app/hooks";
import React from "react";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { Hair, Skin } from "@/types/sequence";
import { fileToBase64 } from "@/utils/imageToBase64";
import type { RootState } from "../../app/store";

// Input visualment ocult però accessible per a lectors de pantalla (diferent de hidden)
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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
  const { keywords } = useAppSelector((state) => state.ui.lang);

  const intl = useIntl();
  const { getSearchPictogram, getSettingsPictId } = useSearchPictogram();
  const { buildPictogramUrl } = usePictogramUrl();

  const initialWord =
    word === `${intl.formatMessage({ ...messages.empty })}` ? "" : word;
  const [newWord, setNewWord] = useState(initialWord);

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length >= 3) setIsAutoComplete(true);
    if (value.length < 3) setIsAutoComplete(false);
  };

  const handleChangeAutocomplete = (
    event: React.SyntheticEvent,
    value: string | null,
  ) => {
    if (value !== null) {
      setNewWord(value);
      setIsAutoComplete(false);
      handleSubmit(event, value);
    }
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
      color: pictApiAraSettings?.color,
      hair: pictApiAraSettings?.hair,
      skin: pictApiAraSettings?.skin,
      selectedId: upDatePictNumber,
      fitzgerald: fitzgerald,
      url: undefined,
    });
  };

  const handleSubmit = async (event: SyntheticEvent, value: string) => {
    event.preventDefault();
    setIsPlus(false);
    await getSearchPictogram(value, indexPict, true);
  };

  const [isPlus, setIsPlus] = useState(false);
  const [isAutoComplete, setIsAutoComplete] = useState(false);

  const handelPlusAction = async (plus: boolean) => {
    await getSearchPictogram(newWord, indexPict, true, plus);
    setIsPlus(!isPlus);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convertim la imatge a base64 (amb compressió automàtica si supera 2MB)
      const base64Url = await fileToBase64(file);

      setState({
        selectedId: 0,
        fitzgerald: undefined,
        url: base64Url,
        color: undefined,
        hair: undefined,
        skin: undefined,
      });
    } catch (error) {
      console.error("Error carregant imatge:", error);
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
      <Autocomplete
        options={keywords}
        filterOptions={filterOptions}
        onChange={handleChangeAutocomplete}
        open={isAutoComplete}
        sx={{ width: "100%" }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={intl.formatMessage({ ...messages.search })}
            onChange={handleChangeInput}
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

        {/* Botó d'upload: usa component="label" perquè el clic activi l'input de forma accessible */}
        <ToggleButton
          value={"upload"}
          aria-label={`${intl.formatMessage({ ...messages.uploadImage })}`}
          key={"upload"}
          component="label"
        >
          <MdOutlineDriveFolderUpload size={80} />
          {/* VisuallyHiddenInput manté l'input accessible als lectors de pantalla */}
          <VisuallyHiddenInput
            type="file"
            onChange={handleImageChange}
            accept="image/*"
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
