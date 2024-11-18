import { Button } from "antd";
import { useConfig } from "../types/config";
import useInpaintBatch from "../hooks/useInpaintBatch";
import { Color } from "../types/colors";
import { ICard } from "../types/card";
import { useRef, useState } from "react";
import Card, { ASPECT_RATIO } from "./Card";
import { chain, cloneDeep, fromPairs, map, values } from "lodash";
import { roundToNearest, wait } from "../services/helpers";

const getCardKey = (card: ICard) => `${card.backgroundColor}-${card.number}`;

const BatchButton: React.FC = () => {
  const {
    results,
    setResults,
    config: { renderWidth, colors, inpaintParams, prompt },
  } = useConfig();

  const cardsToRenderRef = useRef<Record<string, ICard>>({});

  const { inpaintImageBatch } = useInpaintBatch();

  // const [cardsToRender, setCardsToRender] = useState<Record<string, ICard>>({});
  const [loading, setLoading] = useState(false);
  const inpaintAll = async () => {
    if (loading) return;
    setLoading(true);
    console.log("inpainting all...");
    const cardsToRendertemp = chain(colors)
      .map((color) =>
        new Array(10).fill(0).map((_, number) => {
          const card = results?.[color]?.[number];
          return card?.resultbase64
            ? null
            : {
                ...card,
                number,
                backgroundColor: color as Color,
              };
        })
      )
      .flatMap()
      .compact()
      .value();

    for (const color in colors.values()) {
      for (let i = 1; i <= 10; i++) {
        const card = results?.[color as Color]?.[i];
        console.log("card", card);
        if (!card?.resultbase64) {
          cardsToRendertemp.push({
            ...card,
            number: i,
            backgroundColor: color as Color,
          });
        }
      }
    }
    console.log("cardsToRender", cardsToRenderRef.current);
    cardsToRenderRef.current = fromPairs(
      cardsToRendertemp.map((card) => [getCardKey(card), card])
    );

    await wait(1000); // Wait for the mask to be rendered

    const getParams = (card: ICard) => ({
      prompt:
        prompt +
        "the center of the card is a symbol in " +
        card.backgroundColor,
    });

    const cardsToRenderArray = values(cardsToRenderRef.current);

    const images = map(cardsToRenderArray, "rawbase64") as string[];
    const masks = map(cardsToRenderArray, "maskbase64") as string[];
    const prompts = map(
      map(cardsToRenderArray, getParams),
      "prompt"
    ) as string[];

    if (
      !images.length ||
      images.length !== masks.length ||
      masks.length !== prompts.length
    )
      throw new Error("No images, masks or prompts");
    const result = await inpaintImageBatch({
      images: images,
      masks: masks,
      prompts: prompts,
      width: roundToNearest(renderWidth, 8),
      height: roundToNearest(Math.round(renderWidth * ASPECT_RATIO), 8),
      ...inpaintParams,
    });

    if (!result) throw new Error("No result");

    let newResults = { ...results };
    cardsToRendertemp.forEach((card, index) => {
      const newCard: ICard = {
        ...card,
        resultbase64:
          "data:image/png;base64," + result[index].outputs[0].base64_image,
      };
      newResults[card.backgroundColor][card.number] = newCard;
    });
    setResults(newResults);
    setLoading(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          inpaintAll();
        }}
        loading={loading}
      >
        All{" "}
        {loading
          ? chain(cardsToRenderRef.current).values().filter(Boolean).value()
              .length
          : ""}
      </Button>
      {values(cardsToRenderRef.current).map((card) => (
        <>
          <Card
            className="hidden"
            key={`batch-source-${card.backgroundColor}-${card.number}`}
            cardData={card}
            width={renderWidth}
            renderType="source"
            onRender={(context) => {
              cardsToRenderRef.current[getCardKey(card)]["rawbase64"] =
                context.toDataURL();
            }}
          />
          <Card
            className="hidden"
            key={`batch-mask-${card.backgroundColor}-${card.number}`}
            cardData={card}
            width={renderWidth}
            renderType="mask"
            onRender={(context) => {
              cardsToRenderRef.current[getCardKey(card)]["maskbase64"] =
                context.toDataURL();
            }}
          />
        </>
      ))}
    </>
  );
};

export default BatchButton;
