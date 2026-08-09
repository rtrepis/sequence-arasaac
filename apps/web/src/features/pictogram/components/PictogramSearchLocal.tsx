import {
  Alert,
  Autocomplete,
  Stack,
  TextField,
  ToggleButton,
} from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useAppSelector } from "@/app/hooks";
import StyledToggleButtonGroup from "../../../style/StyledToggleButtonGroup";
import {
  searchPictogramByWord,
  fetchPictogramData,
  buildPictogramUrl,
  extractPictSettings,
} from "../api/arasaacClient";
import { Hair, PictApiAraSettings, Skin } from "@/types/sequence";
import messages from "./PictogramSearchLocal.lang";
import usePersonalKeywords from "@features/word-profile/hooks/usePersonalKeywords";
import UploadImageButton from "../../../components/UploadImageButton";
import React from "react";

const filterOptions = createFilterOptions<string>({
  matchFrom: "start",
  limit: 100,
});

export interface PictogramSearchLocalResult {
  selectedId: number;
  fitzgerald: string | undefined;
  url: string | undefined;
  color: boolean | undefined;
  hair: Hair | undefined;
  skin: Skin | undefined;
}

interface PictogramSearchLocalProps {
  selectedId: number;
  /** Data URL de la imatge pròpia, si l'usuari n'ha pujada cap. */
  imageUrl?: string;
  onSelect: (result: PictogramSearchLocalResult) => void;
}

const PictogramSearchLocal = ({
  selectedId,
  imageUrl,
  onSelect,
}: PictogramSearchLocalProps): React.ReactElement => {
  const intl = useIntl();
  const locale = useAppSelector((state) => state.ui.lang.search);
  const keywords = usePersonalKeywords();
  const defaultPictApiAra = useAppSelector(
    (state) => state.ui.defaultSettings.pictApiAra,
  );

  const [newWord, setNewWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [bestIdPicts, setBestIdPicts] = useState<number[]>([]);
  const [isPlus, setIsPlus] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const handleInputChange = (
    _: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    setInputValue(value);
    setIsOpen(reason === "input" && value.length >= 3);
  };

  const doSearch = async (word: string, extended: boolean) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await searchPictogramByWord(word, locale, extended)) as any[];
      if (!data.length) {
        setBestIdPicts([-1]);
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 3000);
        return;
      }
      setBestIdPicts(data.map((p) => p._id));
    } catch {
      setBestIdPicts([-1]);
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 3000);
    }
  };

  const handleSelectId = async (id: number) => {
    try {
      const data = await fetchPictogramData(id, locale);
      const settings: PictApiAraSettings = extractPictSettings(data, defaultPictApiAra);
      onSelect({
        selectedId: id,
        fitzgerald: settings.fitzgerald,
        color: settings.color,
        hair: settings.hair,
        skin: settings.skin,
        url: undefined,
      });
    } catch {
      onSelect({ selectedId: id, fitzgerald: undefined, color: undefined, hair: undefined, skin: undefined, url: undefined });
    }
  };

  const handleSubmit = async (event: SyntheticEvent, word: string) => {
    event.preventDefault();
    setIsPlus(false);
    await doSearch(word, false);
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

  const handlePlusAction = async (plus: boolean) => {
    await doSearch(newWord, plus);
    setIsPlus(!isPlus);
  };

  // La imatge pròpia substitueix el pictograma: no té ni color ni variants
  const applyUploadedImage = (url: string | undefined) =>
    onSelect({
      selectedId: 0,
      fitzgerald: undefined,
      url,
      color: undefined,
      hair: undefined,
      skin: undefined,
    });

  return (
    <Stack sx={{ width: "100%" }}>
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
          bestIdPicts.map((id, index) => (
            <ToggleButton
              value={id}
              key={`p_${id}_i_${index}`}
              onClick={() => handleSelectId(id)}
              selected={id === selectedId}
            >
              <img
                src={buildPictogramUrl(id)}
                alt={`pictogram ${id}`}
                width={40}
                height={40}
              />
            </ToggleButton>
          ))}

        {!isPlus && bestIdPicts.length > 0 && bestIdPicts[0] !== 0 && (
          <ToggleButton value="plus" key="plus" onClick={() => handlePlusAction(true)}>
            <img src="../img/settings/+.png" alt="more" width={25} height={25} />
          </ToggleButton>
        )}

        {isPlus && (
          <ToggleButton value="minus" key="minus" onClick={() => handlePlusAction(false)}>
            <img src="../img/settings/-.png" alt="less" width={25} height={25} />
          </ToggleButton>
        )}

        <UploadImageButton
          key="upload"
          imageUrl={imageUrl}
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

export default PictogramSearchLocal;
