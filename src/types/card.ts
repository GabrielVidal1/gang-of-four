import { Color } from "./colors";

export interface ICard {
  number: number;
  backgroundColor: Color;

  rawbase64?: string;
  maskbase64?: string;
  resultbase64?: string;
}
