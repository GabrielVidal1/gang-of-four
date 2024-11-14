import React from "react";
import Card from "./Card";
import { Color, COLORS } from "../types/colors";
import { Font, FONTS } from "../types/fonts";

interface CardListProps {
  font?: Font;
  colors?: Color[];
  onClickCard?: (number: number, color: Color) => void;
  className?: string;
}

const CardList: React.FC<CardListProps> = ({
  colors = COLORS,
  font = FONTS[0],
  onClickCard,
  className,
}) => {
  return (
    <div className={className}>
      {colors.map((color) => (
        <div className="flex flex-row gap-2 justify-center p-2" key={color}>
          {Array.from({ length: 10 }, (_, index) => (
            <Card
              key={index}
              number={index + 1}
              backgroundColor={color}
              width={50}
              font={font}
              onClick={() => onClickCard && onClickCard(index + 1, color)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CardList;
