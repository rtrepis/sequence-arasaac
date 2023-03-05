export interface PictogramI {
  index: number;
  number: number;
  border: "color" | "none";
  skin?: skin;
}
export interface BorderPictI {
  radius: number;
  size: number;
}

export type skin = "asian" | "aztec" | "black" | "mulatto" | "white";

export type SequenceI = PictogramI[];
