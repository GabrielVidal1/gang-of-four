import React from "react";
import { Color, COLORS } from "../types/colors";
import { FONTS } from "../types/fonts";
import { useConfig } from "../types/config";
import { MODELS } from "../constants/inpainting";
import TransformWidget from "./TransformWidget";

interface ConfigurableCardPanelProps {
  className?: string;
}

const ConfigurableCardPanel: React.FC<ConfigurableCardPanelProps> = ({
  className,
}) => {
  const { config, setConfigValue } = useConfig();

  // Handler for toggling colors
  const handleColorToggle = (color: Color) => {
    const prevColors = config.colors;
    setConfigValue(
      "colors",
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  // Handler for changing font
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = FONTS.find((font) => font === event.target.value);
    if (selected) {
      setConfigValue("cardsConfig", {
        ...config.cardsConfig,
        font: selected,
      });
    }
  };

  return (
    <div className={className}>
      <div className="p-4 border rounded-lg bg-gray-100">
        <h2 className="text-lg font-bold mb-4">Configuration Panel</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Colors:</h3>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <label key={color} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.colors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                />
                <span className="capitalize">{color}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Prompt</h3>
          <textarea
            value={config.prompt}
            onChange={(e) => setConfigValue("prompt", e.target.value)}
            className="p-2 border rounded h-20"
          />
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Font:</h3>
          <select
            value={config.cardsConfig.font}
            onChange={handleFontChange}
            className="p-2 border rounded"
          >
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <select
              value={config.model}
              onChange={(e) => setConfigValue("model", e.target.value)}
              className="p-2 border rounded"
            >
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.displayConfig.showMask}
              onChange={(e) =>
                setConfigValue("displayConfig", {
                  ...config.displayConfig,
                  showMask: e.target.checked,
                })
              }
            />
            Show Mask
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.displayConfig.showSource}
              onChange={(e) =>
                setConfigValue("displayConfig", {
                  ...config.displayConfig,
                  showSource: e.target.checked,
                })
              }
            />
            Show Source
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.displayConfig.showResult}
              onChange={(e) =>
                setConfigValue("displayConfig", {
                  ...config.displayConfig,
                  showResult: e.target.checked,
                })
              }
            />
            Show Result
          </label>
        </div>
        <TransformWidget
          name="Center"
          transform={config.cardsConfig.centerChar}
          onChange={(transform) => {
            setConfigValue("cardsConfig", {
              ...config.cardsConfig,
              centerChar: transform,
            });
          }}
        />
      </div>
      <TransformWidget
        name="Number in corner"
        transform={config.cardsConfig.numberInCorner}
        onChange={(transform) => {
          setConfigValue("cardsConfig", {
            ...config.cardsConfig,
            numberInCorner: transform,
          });
        }}
      />
    </div>
  );
};

export default ConfigurableCardPanel;
