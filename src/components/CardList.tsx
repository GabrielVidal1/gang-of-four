import React from "react";
import Card from "./Card";
import { Color, COLORS } from "../types/colors";
import { Font } from "../types/fonts";
import { useConfig } from "../types/config";

interface CardListProps {
  font?: Font;
  colors?: Color[];
  onClickCard?: (number: number, color: Color) => void;
  className?: string;
}

const CardList: React.FC<CardListProps> = ({
  colors = COLORS,
  onClickCard,
  className,
}) => {
  const { results } = useConfig();
  console.log("results", results);
  return (
    <div className={className}>
      {colors.map((color) => (
        <div
          className="flex flex-row flex-wrap gap-2 justify-center p-2"
          key={color}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <Card
              renderType="full"
              key={index}
              cardData={{
                ...results?.[color]?.[index + 1],
                number: index + 1,
                backgroundColor: color,
              }}
              width={50}
              onClick={() => onClickCard && onClickCard(index + 1, color)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CardList;
