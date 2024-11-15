import { useState } from "react";
import { useConfig } from "../types/config";

export interface InpaintParams {
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

const useInpaint = () => {
  const {
    config: { model },
  } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the processed image
  const inpaintImage = async ({
    mask,
    image,
    width,
    height,
    prompt,
    strength = 1,
    num_outputs = 1,
    output_format = "png",
    guidance_scale = 7,
    output_quality = 90,
    num_inference_steps = 50,
  }: InpaintParams): Promise<string | null> => {
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
          mask,
          image,
          width,
          height,
          prompt,
          strength,
          num_outputs,
          output_format,
          guidance_scale,
          output_quality,
          num_inference_steps,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.base64_image;
    } catch (err) {
      setError((err as any)?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { inpaintImage, loading, error };
};

export default useInpaint;
