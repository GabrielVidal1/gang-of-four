import React from "react";
import { Color, COLORS } from "../types/colors";
import { Font, FONTS } from "../types/fonts";

interface ConfigurableCardPanelProps {
  selectedColors: Color[];
  selectedFont: Font;
  setSelectedColors: React.Dispatch<React.SetStateAction<Color[]>>;
  setSelectedFont: React.Dispatch<React.SetStateAction<Font>>;

  showMask?: boolean;
  setShowMask?: React.Dispatch<React.SetStateAction<boolean>>;

  className?: string;
}

const ConfigurableCardPanel: React.FC<ConfigurableCardPanelProps> = ({
  selectedColors,
  selectedFont,
  setSelectedColors,
  setSelectedFont,
  className,
  setShowMask,
  showMask,
}) => {
  // Handler for toggling colors
  const handleColorToggle = (color: Color) => {
    setSelectedColors((prevColors) =>
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  // Handler for changing font
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = FONTS.find((font) => font === event.target.value);
    if (selected) {
      setSelectedFont(selected);
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
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                />
                <span className="capitalize">{color}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Font:</h3>
          <select
            value={selectedFont}
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
            <input
              type="checkbox"
              checked={showMask}
              onChange={() => setShowMask?.((prev) => !prev)}
            />
            <span>Show Mask</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConfigurableCardPanel;
