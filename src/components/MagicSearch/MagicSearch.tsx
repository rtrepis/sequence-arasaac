import { ButtonBase, InputAdornment, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addPictogramActionCreator } from "../../app/slice/sequenceSlice";
import useAraSaac from "../../hooks/useAraSaac";
import { PictogramI } from "../../types/sequence";
import messages from "./MagicSearch.lang";

const MagicSearch = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const pictograms = useAppSelector((state) => state.sequence);
  const intl = useIntl();
  const { getSearchPictogram } = useAraSaac();

  const initialPhrase = "";
  const [phrase, setPhrase] = useState(initialPhrase);

  const magicEngine = (event: SyntheticEvent) => {
    event.preventDefault();
    const words = phrase.trim().split(" ", 60);

    words.forEach((word, index) => {
      const newIndex = index + pictograms.length;
      const newPict: PictogramI = {
        index: newIndex,
        number: 0,
        word: { keyWord: word, pictograms: [0] },
      };
      dispatch(addPictogramActionCreator(newPict));
      getSearchPictogram(word, newIndex, true);
      setPhrase("");
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhrase(value);
  };

  return (
    <form onSubmit={magicEngine}>
      <TextField
        label={intl.formatMessage({ ...messages.field })}
        id={"search"}
        variant="outlined"
        helperText={intl.formatMessage({ ...messages.helperText })}
        autoComplete={"off"}
        size="small"
        value={phrase}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              component={ButtonBase}
              onClick={magicEngine}
              aria-label={intl.formatMessage({ ...messages.button })}
            >
              <AiOutlineSearch fontSize={"large"} />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 300 }}
      />
    </form>
  );
};

export default MagicSearch;
