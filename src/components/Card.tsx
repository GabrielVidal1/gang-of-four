import React, { useEffect, useRef } from "react";
import { NUMBER_TO_CHINESE } from "../utils";
import { Color } from "../types/colors";

export const ASPECT_RATIO = 1.5;
const WIDTH = 300;

interface CardProps {
  number: number;
  backgroundColor: Color;
  width?: number;
  font?: string;
  onRender?: (context: HTMLCanvasElement) => void;
  onClick?: () => void;
  renderText?: boolean;
  mask?: boolean;
  roundAroundText?: boolean;
}

const Card: React.FC<CardProps> = ({
  number,
  backgroundColor,
  width = WIDTH,
  font = "sans-serif",
  onRender,
  onClick,
  mask = false,
  renderText = true,
  roundAroundText = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const multiplier = mask ? 1.01 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        // Set canvas size
        canvas.width = width;
        canvas.height = width * ASPECT_RATIO;

        if (mask) {
          context.filter = "blur(1px)"; // Apply a slight blur
        } else {
          context.filter = "none"; // Remove blur
        }

        // Draw the background
        context.fillStyle = mask ? "white" : backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Set text style
        context.fillStyle = mask ? "black" : "white";
        context.font = `bold ${0.15 * canvas.width}px sans-serif`;
        context.textAlign = "left";
        context.textBaseline = "top";

        const cornerDistance = 0.1 * canvas.width;

        if (renderText) {
          // Draw the number in the top-left corner

          if (mask && roundAroundText) {
            context.beginPath();
            context.arc(
              cornerDistance +
                0.5 * context.measureText(number.toString()).width,
              cornerDistance + 0.7 * context.measureText("0").width,
              0.1 * canvas.width,
              0,
              2 * Math.PI
            );
            context.fill();
          }

          context.fillText(number.toString(), cornerDistance, cornerDistance);

          // Rotate and draw the number in the bottom-right corner
          context.save();
          context.translate(canvas.width, canvas.height);
          context.rotate(Math.PI); // Rotate 180 degrees
          context.fillText(number.toString(), cornerDistance, cornerDistance);
          if (mask && roundAroundText) {
            context.beginPath();
            context.arc(
              cornerDistance +
                0.5 * context.measureText(number.toString()).width,
              cornerDistance + 0.7 * context.measureText("0").width,
              0.1 * canvas.width,
              0,
              2 * Math.PI
            );
            context.fill();
          }
          context.restore();

          // Draw the number in Chinese Traditional characters in the center
          const chineseCharacter = NUMBER_TO_CHINESE[number];
          if (chineseCharacter) {
            context.fillStyle = mask ? "black" : "white";
            context.font = `${0.9 * canvas.width * multiplier}px ${font}`; // 80% of canvas width
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillText(
              chineseCharacter,
              canvas.width / 2,
              canvas.height / 2
            );
          }
        }

        onRender?.(canvas);
      }
    }
  }, [number, backgroundColor, width, font, mask, multiplier, renderText]);

  return (
    <div
      className="flex justify-center items-center"
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
