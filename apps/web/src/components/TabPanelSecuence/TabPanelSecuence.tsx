import { useAppSelector } from "@/app/hooks";
import { RootState } from "@/app/store";
import PictEditModalList from "@/Modals/PictEditModalList/PictEditModalList";
import React from "react";

interface TabPanelSequenceProps {
  index: number;
}

const TabPanelSequence = ({
  index,
}: TabPanelSequenceProps): React.ReactElement => {
  const getActiveSaacSequence = (state: RootState) =>
    state.document.content[index];
  const sequence = useAppSelector(getActiveSaacSequence);

  return <PictEditModalList sequence={sequence} />;
};
export default TabPanelSequence;
