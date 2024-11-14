import { useMemo, useState } from "react";
import { ICard } from "../types/card";
import { Color, COLORS } from "../types/colors";
import { Font } from "../types/fonts";
import Card, { ASPECT_RATIO } from "./Card";
import CardList from "./CardList";
import ConfigurableCardPanel from "./ConfigurableCardPanel";
import useInpaint from "../hooks/useInpaint";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const roundToNearest = (n: number, nearest: number) =>
  Math.round(n / nearest) * nearest;

const CardLab: React.FC = () => {
  const [selectedColors, setSelectedColors] = useState<Color[]>(
    COLORS.concat()
  );
  const [selectedFont, setSelectedFont] = useState<Font>("sans-serif");
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);
  const [showMask, setShowMask] = useState(false);
  const { inpaintImage, loading, error } = useInpaint();

  const [renderWidth, setRenderWidth] = useState(512);
  const [prompt, setPrompt] = useState(
    "A beautifully detailed card design inspired by the style of Ernst Haeckel, featuring intricate and symmetrical patterns of marine life forms, like jellyfish, corals, and sea anemones. The artwork is rich in detail, with a harmonious blend of natural organic shapes and vibrant colors, capturing the essence of underwater biodiversity. The background features a subtle gradient of deep blues and aquamarine, highlighting the delicate lines and structures of the organisms."
  );

  const renderCurrentCard = async () => {
    setShowMask(true);
    await sleep(500); // Wait for the mask to be rendered
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

    const resultbase64 = await inpaintImage({
      image: rawbase64,
      mask: maskbase64,
      width: roundToNearest(renderWidth, 8),
      height: roundToNearest(Math.round(renderWidth * ASPECT_RATIO), 8),
      prompt:
        prompt +
        "the center of the card is a symbol in " +
        selectedCard.backgroundColor,
    });

    if (!resultbase64) return;
    setSelectedCard({
      ...selectedCard,
      resultbase64: "data:image/png;base64," + resultbase64,
    });
  };

  const result = useMemo(() => selectedCard?.resultbase64, [selectedCard]);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="grid grid-cols-4 gap-4">
          <ConfigurableCardPanel
            selectedColors={selectedColors}
            selectedFont={selectedFont}
            setSelectedColors={setSelectedColors}
            setSelectedFont={setSelectedFont}
            setShowMask={setShowMask}
            showMask={showMask}
            className="col-span-1"
          />
          <CardList
            className="col-span-3"
            colors={selectedColors}
            font={selectedFont}
            onClickCard={(number, backgroundColor) => {
              setSelectedCard({
                number,
                backgroundColor,
                width: 200,
                font: selectedFont,
              });
            }}
          />
        </div>
        {selectedCard && (
          <div className="p-5 flex gap-2">
            <Card
              number={selectedCard.number}
              backgroundColor={selectedCard.backgroundColor}
              width={renderWidth}
              font={selectedFont}
              onRender={async (context: HTMLCanvasElement) => {
                console.log("rendering rawbase64");
                setSelectedCard((prev) =>
                  prev
                    ? {
                        ...prev,
                        rawbase64: context.toDataURL(),
                      }
                    : null
                );
              }}
              renderText={!showMask}
            />
            {showMask && (
              <Card
                number={selectedCard.number}
                backgroundColor={selectedCard.backgroundColor}
                width={renderWidth}
                font={selectedFont}
                mask
                onRender={async (context: HTMLCanvasElement) => {
                  console.log("rendering maskbase64");
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
            )}
          </div>
        )}
        <button
          className="p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => renderCurrentCard()}
          disabled={loading || !selectedCard}
        >
          Render card
        </button>
        {loading && <p>Generating...</p>}
        {error && <p>Error: {error}</p>}

        {result && (
          <img
            style={{
              width: renderWidth,
              height: renderWidth * ASPECT_RATIO,
            }}
            src={result}
            alt="Result"
            className="border rounded-lg"
          />
        )}
      </div>
    </>
  );
};

export default CardLab;
