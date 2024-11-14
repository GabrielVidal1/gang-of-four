import { Color } from "./colors";
import { Font } from "./fonts";

export interface ICard {
  number: number;
  backgroundColor: Color;
  width: number;
  font: Font;

  rawbase64?: string;
  maskbase64?: string;
  resultbase64?: string;
}
