import { Stack } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import "./App.css";
import { useAppDispatch } from "./app/hooks";
import { updateSkinActionCreator } from "./app/slice/uiSlice";
import { RootState } from "./app/store";
import PictogramAmount from "./components/PictogramAmount/PictogramAmount";
import PictogramCardList from "./components/PictogramCardList/PictogramCardList";
import SettingItem from "./components/SettingItem/SettingItem";
import PictEditModal from "./components/modals/PictEditModal";
import Settings from "./model/Settings";
import { UpdateSettingItemI } from "./types/sequence";

const App = () => {
  const dispatch = useAppDispatch();
  const sequence = useSelector((state: RootState) => state.sequence);

  const handleUpDateSkin = (toUpdate: UpdateSettingItemI) => {
    dispatch(updateSkinActionCreator(toUpdate));
  };

  return (
    <Stack alignItems={"center"}>
      <h1 className="App">Sequence - AraSaac</h1>
      <SettingItem item={Settings.skins} action={handleUpDateSkin} />
      <PictogramAmount />
      <PictogramCardList sequence={sequence} />
      <PictEditModal />
    </Stack>
  );
};

export default App;
