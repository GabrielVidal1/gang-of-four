import React, { useEffect, useRef } from "react";
import { useConfig } from "../types/config";
import { drawFullCard, drawMask, drawSourceImage } from "../services/canvas";
import { ICard } from "../types/card";
import classNames from "classnames";

export const ASPECT_RATIO = 1.5;
const WIDTH = 300;

interface CardProps {
  cardData: ICard;
  width?: number;
  onRender?: (context: HTMLCanvasElement) => void;
  onClick?: () => void;
  renderType: "full" | "mask" | "source";
  className?: string;
}

const DRAW_FUNCTIONS: Record<CardProps["renderType"], typeof drawFullCard> = {
  full: drawFullCard,
  mask: drawMask,
  source: drawSourceImage,
};

const Card: React.FC<CardProps> = ({
  cardData,
  className,
  width = WIDTH,
  onRender,
  onClick,
  renderType,
}) => {
  const { number, backgroundColor } = cardData;
  const {
    config: { cardsConfig },
  } = useConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not get canvas context");
      // Set canvas size
      canvas.width = width;
      canvas.height = width * ASPECT_RATIO;
      DRAW_FUNCTIONS[renderType](canvas, context, cardData, cardsConfig).then(
        () => onRender?.(canvas)
      );
    }
  }, [
    number,
    backgroundColor,
    width,
    cardsConfig.font,
    cardData.number,
    cardData.backgroundColor,
    cardData.resultbase64,
    cardsConfig,
    renderType,
  ]);

  return (
    <div
      className={classNames(className, "flex justify-center items-center")}
      style={{
        width: width,
        height: width * ASPECT_RATIO,
      }}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="border rounded-lg" />
    </div>
  );
};

export default Card;
