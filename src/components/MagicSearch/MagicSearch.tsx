import { ButtonBase, InputAdornment, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import useAraSaac from "../../hooks/useAraSaac";
import messages from "./MagicSearch.lang";

const MagicSearch = (): JSX.Element => {
  const intl = useIntl();
  const { getSearchPictogram } = useAraSaac();

  const initialPhrase = "";
  const [phrase, setPhrase] = useState(initialPhrase);

  const SubmitMagicEngine = (event: SyntheticEvent) => {
    event.preventDefault();

    const words = phrase.split(" ", 60);
    words.map(
      async (word, index) => await getSearchPictogram(word, index, false)
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhrase(value);
  };

  return (
    <form onSubmit={SubmitMagicEngine}>
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
              onClick={SubmitMagicEngine}
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
