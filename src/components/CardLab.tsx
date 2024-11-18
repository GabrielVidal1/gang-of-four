import { useState } from "react";
import { ICard } from "../types/card";
import Card, { ASPECT_RATIO } from "./Card";
import CardList from "./CardList";
import ConfigurableCardPanel from "./ConfigurableCardPanel";
import useInpaint from "../hooks/useInpaint";
import { useConfig } from "../types/config";
import classNames from "classnames";
import BatchButton from "./BatchButton";
import { Button } from "antd";
import { roundToNearest } from "../services/helpers";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CardLab: React.FC = () => {
  const {
    setResult,
    getResult,
    config: {
      colors,
      cardsConfig: { font },
      renderWidth,
      prompt,
      displayConfig: { showMask, showSource, viewWidth, showResult },
    },
  } = useConfig();
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);

  const { inpaintImage, loading } = useInpaint();

  const renderCurrentCard = async () => {
    console.log("rendering current card...");
    // await sleep(1000); // Wait for the mask to be rendered
    if (!selectedCard) {
      console.log("no card selected");
      return;
    }

    const { rawbase64, maskbase64 } = selectedCard;
    if (!rawbase64) {
      console.log("no rawbase64");
      return;
    } else if (!maskbase64) {
      console.log("no maskbase64");
      return;
    }

    const result = await inpaintImage({
      image: rawbase64,
      mask: maskbase64,
      width: roundToNearest(renderWidth, 8),
      height: roundToNearest(Math.round(renderWidth * ASPECT_RATIO), 8),
      prompt:
        prompt +
        "the center of the card is a symbol in " +
        selectedCard.backgroundColor,
    });

    if (!result) {
      console.error("no result");
      return;
    }
    const newCard: ICard = {
      ...selectedCard,
      resultbase64: "data:image/png;base64," + result.outputs[0].base64_image,
    };

    console.log("newCard", newCard);

    setSelectedCard(newCard);
    setResult(newCard.backgroundColor, newCard.number, newCard);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="grid grid-cols-4 gap-4">
          <ConfigurableCardPanel className="col-span-1" />
          <CardList
            className="col-span-2"
            colors={colors}
            font={font}
            onClickCard={(number, backgroundColor) => {
              setSelectedCard({
                number,
                backgroundColor,
              });
            }}
          />
          {selectedCard && (
            <div className="flex flex-col items-center justify-start">
              <div className="p-5 flex gap-2">
                <Card
                  cardData={selectedCard}
                  renderType="source"
                  className={classNames({
                    hidden: !showSource,
                  })}
                  width={viewWidth}
                  onRender={async (context: HTMLCanvasElement) => {
                    setSelectedCard((prev) =>
                      prev
                        ? {
                            ...prev,
                            rawbase64: context.toDataURL(),
                          }
                        : null
                    );
                  }}
                />
                <Card
                  cardData={selectedCard}
                  width={viewWidth}
                  renderType="mask"
                  className={classNames({
                    hidden: !showMask,
                  })}
                  onRender={async (context: HTMLCanvasElement) => {
                    await sleep(500); // Wait for the raw image to be rendered
                    setSelectedCard((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        maskbase64: context.toDataURL(),
                      };
                    });
                  }}
                />
                {showResult && (
                  <Card
                    cardData={getResult(selectedCard) ?? selectedCard}
                    width={viewWidth}
                    renderType="full"
                  />
                )}
              </div>
              <Button
                className={classNames("p-2 bg-blue-500 text-white rounded-lg", {
                  "bg-gray-400": !selectedCard,
                  "bg-blue-200": loading,
                })}
                onClick={() => renderCurrentCard()}
                disabled={loading || !selectedCard}
                loading={loading}
              >
                Render card
              </Button>
            </div>
          )}
          <BatchButton />
        </div>
      </div>
    </>
  );
};

export default CardLab;
