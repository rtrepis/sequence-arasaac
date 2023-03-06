export interface PictogramI {
  index: number;
  number: number;
  border?: {
    in?: BorderPictI;
    out?: BorderPictI;
  };
  skin?: skin;
}
export interface BorderPictI {
  color: string;
  radius: number;
  size: number;
}

export type skin = "asian" | "aztec" | "black" | "mulatto" | "white";

export type SequenceI = PictogramI[];
