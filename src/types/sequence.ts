export interface BorderPictI {
  radius: number;
  size: number;
}

export interface PictogramI {
  index: number;
  number: number;
  border: "color" | "none";
}

export type SequenceI = PictogramI[];
