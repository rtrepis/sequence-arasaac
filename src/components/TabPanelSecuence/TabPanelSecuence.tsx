import { useAppSelector } from "@/app/hooks";
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
  const sequence = useAppSelector((state) => state.sequence);

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`sequence-${index}`}
      aria-labelledby={`sequence-${index}`}
    >
      <PictEditModalList sequence={sequence} />
    </div>
  );
};
export default TabPanelSequence;
