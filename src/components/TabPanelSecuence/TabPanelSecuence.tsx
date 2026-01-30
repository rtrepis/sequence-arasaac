import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { RootState } from "@/app/store";
import PictEditModalList from "@/Modals/PictEditModalList/PictEditModalList";
import React from "react";

interface TabPanelSequenceProps {
  isActive?: boolean;
  index: number;
}

const TabPanelSequence = ({
  index,
  isActive,
}: TabPanelSequenceProps): React.ReactElement => {
  const getActiveSaacSequence = (state: RootState) =>
    state.document.content[index];
  const sequence = useAppSelector(getActiveSaacSequence);

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={"sequence-active"}
      aria-labelledby={"sequence-active"}
    >
      <PictEditModalList sequence={sequence} />
    </div>
  );
};
export default TabPanelSequence;
