import { useState } from "react";
import { useConfig } from "../types/config";

const AssetsLoader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const { config } = useConfig();

  return (
    <>
      <link
        key={config.cardsConfig.font}
        href={`./src/assets/fonts/${config.cardsConfig.font}.ttf`}
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
        rel="preload"
        onLoad={() => {
          setLoading(false);
        }}
      />
      {loading ? null : children}
    </>
  );
};

export default AssetsLoader;
