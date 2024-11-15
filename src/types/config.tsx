import React, { createContext, useEffect } from "react";
import { InpaintParams } from "../hooks/useInpaint";
import { Font, FONTS } from "./fonts";
import { Color } from "./colors";
import { Model } from "../constants/inpainting";
import useLocalStorage from "../hooks/useLocalStorage";
import { ICard } from "./card";

export interface Transform {
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface CardsConfig {
  colors: [Color, Color, Color];
  font: Font;
  textColor: string;
  centerChar: Transform;
  numberInCorner: Transform;
  backgroundColor: string;
}

interface DisplayConfig {
  viewWidth: number;
  showMask: boolean;
  showSource: boolean;
  showResult: boolean;
}

interface Config {
  colors: [Color, Color, Color];
  cardsConfig: CardsConfig;

  displayConfig: DisplayConfig;

  prompt: string;
  renderWidth: number;
  model: Model;

  inpaintParams: Omit<
    InpaintParams,
    "image" | "mask" | "prompt" | "width" | "height"
  >;
}

const DEFAULT_TRANSFORM: Transform = {
  scale: 1,
  rotation: 0,
  offsetX: 1,
  offsetY: 1,
};

type Result = Record<Color, Record<number, ICard>>;

const DEFAULT_CONFIG: Config = {
  colors: ["red", "green", "blue"],
  cardsConfig: {
    colors: ["red", "green", "blue"],
    font: FONTS[0],
    textColor: "white",
    backgroundColor: "black",
    centerChar: DEFAULT_TRANSFORM,
    numberInCorner: DEFAULT_TRANSFORM,
  },
  displayConfig: {
    viewWidth: 300,
    showMask: false,
    showSource: false,
    showResult: true,
  },
  model: "stable-diffusion-inpainting",
  inpaintParams: {
    strength: 1,
    num_outputs: 1,
    output_format: "png",
    guidance_scale: 7,
    output_quality: 90,
    num_inference_steps: 30,
  },
  prompt:
    "A steampunk inspired card design featuring intricate gears and cogs, with a color palette of brass, copper, and iron.",
  renderWidth: 512,
};

interface ConfixContextType {
  config: Config;
  setConfigValue: (key: keyof Config, value: any) => void;

  results: Result;
  setResult: (color: Color, number: number, card: ICard) => void;
  getResult: (card: ICard) => ICard | null;
}

const ConfigContext = createContext<ConfixContextType>({
  config: DEFAULT_CONFIG,
  setConfigValue: () => {},

  results: {} as Result,
  setResult: () => {},
  getResult: () => null,
});

const useConfig = () => {
  const context = React.useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigContextProvider");
  }
  return context;
};

const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useLocalStorage<Config>("config", DEFAULT_CONFIG);
  const [results, setResults] = useLocalStorage<Result>(
    "results",
    {} as Result
  );

  const setConfigValue = (key: keyof Config, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const setResult = (color: Color, number: number, card: ICard) => {
    setResults((prevResults) => ({
      ...prevResults,
      [color]: {
        ...prevResults[color],
        [number]: card,
      },
    }));
  };

  const getResult = (card: ICard) => {
    return results?.[card.backgroundColor]?.[card.number] ?? null;
  };

  useEffect(() => {
    if (!Object.keys(results).length)
      setConfig((prevConfig) => ({
        ...prevConfig,
        results: {
          red: {},
          green: {},
          blue: {},
        },
      }));
  }, [results]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        setConfigValue,

        results,
        setResult,
        getResult,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigContext, ConfigContextProvider, useConfig };
