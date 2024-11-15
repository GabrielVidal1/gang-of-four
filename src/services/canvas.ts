import { ICard } from "../types/card";
import { CardsConfig } from "../types/config";
import { NUMBER_TO_CHINESE } from "../utils";

export const blur = (context: CanvasRenderingContext2D, radius: number) => {
  context.filter = `blur(${radius}px)`;
};

export const unblur = (context: CanvasRenderingContext2D) => {
  context.filter = "none";
};

export const drawBG = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  color: string
) => {
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

export const drawChineseCharacter = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  char: string,
  { centerChar, font, textColor }: CardsConfig
) => {
  context.fillStyle = textColor;
  context.font = `${0.9 * canvas.width * centerChar.scale}px ${font}`; // 80% of canvas width
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.rotate(centerChar.rotation);
  context.fillText(
    char,
    (canvas.width / 2) * centerChar.offsetX,
    (canvas.height / 2) * centerChar.offsetY
  );
};

export const drawNumberInCorners = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  { number }: ICard,
  { font, textColor, numberInCorner }: CardsConfig
) => {
  context.fillStyle = textColor;
  context.font = `bold ${0.15 * canvas.width * numberInCorner.scale}px ${font}`;
  context.textAlign = "left";
  context.textBaseline = "top";

  const cornerDistance = 0.1 * canvas.width;
  context.fillText(
    number.toString(),
    cornerDistance * numberInCorner.offsetX,
    cornerDistance * numberInCorner.offsetY
  );
  // Rotate and draw the number in the bottom-right corner

  context.save();
  context.translate(canvas.width, canvas.height);
  context.rotate(Math.PI); // Rotate 180 degrees
  context.fillText(
    number.toString(),
    cornerDistance * numberInCorner.offsetX,
    cornerDistance * numberInCorner.offsetY
  );
  context.restore();
};

export const drawRoundsInCorners = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  _cardData: ICard,
  { backgroundColor }: CardsConfig
) => {
  const cornerDistance = 0.15 * canvas.width;

  context.fillStyle = backgroundColor;
  context.beginPath();
  context.arc(
    cornerDistance + 0.5,
    cornerDistance + 0.7,
    0.1 * canvas.width,
    0,
    2 * Math.PI
  );
  context.fill();
  // Rotate and draw the number in the bottom-right corner
  context.save();
  context.translate(canvas.width, canvas.height);
  context.rotate(Math.PI); // Rotate 180 degrees
  context.beginPath();
  context.arc(
    cornerDistance + 0.5,
    cornerDistance + 0.7,
    0.1 * canvas.width,
    0,
    2 * Math.PI
  );
  context.fill();
  context.restore();
};

export const drawImage = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: CanvasImageSource
) => {
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
};

export const drawSourceImage = async (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  card: ICard,
  _cardsConfig: CardsConfig
) => {
  drawBG(canvas, context, card.backgroundColor);
};

export const drawMask = async (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  card: ICard,
  cardsConfig: CardsConfig
) => {
  drawBG(canvas, context, "white");
  drawChineseCharacter(canvas, context, NUMBER_TO_CHINESE[card.number], {
    ...cardsConfig,
    textColor: "black",
  });
  drawRoundsInCorners(canvas, context, card, {
    ...cardsConfig,
    backgroundColor: "black",
  });
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
};

export const drawFullCard = async (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  card: ICard,
  cardsConfig: CardsConfig
) => {
  drawBG(canvas, context, card.backgroundColor);
  if (card.resultbase64) {
    const image = await loadImage(card.resultbase64);
    drawImage(canvas, context, image);
  }
  drawRoundsInCorners(canvas, context, card, cardsConfig);
  drawNumberInCorners(canvas, context, card, {
    ...cardsConfig,
    textColor: "white",
  });
  drawChineseCharacter(canvas, context, NUMBER_TO_CHINESE[card.number], {
    ...cardsConfig,
    textColor: "white",
  });
};
