import { useState } from "react";
import { useConfig } from "../types/config";

export interface InpaintParams {
  id?: string;
  mask: string; // URL of the mask image
  image: string; // URL of the input image
  width: number;
  height: number;
  model?: string;
  prompt: string;
  strength?: number;
  num_outputs?: number;
  output_format?: string;
  guidance_scale?: number;
  output_quality?: number;
  num_inference_steps?: number;
}

export type InpaintResult = {
  id: string;
  prompt: string;
  outputs: { base64_image: string }[];
};

const useInpaint = () => {
  const {
    config: { model },
  } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the processed image
  const inpaintImage = async (
    params: InpaintParams
  ): Promise<InpaintResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/inpaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          ...params,
        }),
      });
      const data: InpaintResult = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      setError((err as any)?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { inpaintImage, loading, error };
};

export default useInpaint;
