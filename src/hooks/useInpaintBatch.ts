import { useState } from "react";
import { useConfig } from "../types/config";
import { merge } from "lodash";
import { InpaintParams, InpaintResult } from "./useInpaint";
import { v4 as uuidv4 } from "uuid";

export type InpaintBatchParams = Omit<
  InpaintParams,
  "mask" | "image" | "prompt"
> & {
  masks: string[];
  images: string[];
  prompts: string[];
};

const useInpaintBatch = () => {
  const {
    config: { model, inpaintParams },
  } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the processed image
  const inpaintImageBatch = async ({
    images,
    masks,
    prompts,
    ...params
  }: InpaintBatchParams): Promise<InpaintResult[] | null> => {
    setLoading(true);
    setError(null);

    console.log("inpainting batch...", images, masks, prompts, params);

    const bodies = {
      requests: images.map((image, i) => ({
        id: uuidv4(),
        model,
        mask: masks[i],
        image,
        prompt: prompts[i],
        ...merge(inpaintParams, params),
      })),
    };

    try {
      const response = await fetch("http://localhost:8000/inpaint/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodies),
      });

      const data: InpaintResult[] = await response.json();

      return data;
    } catch (err) {
      setError((err as any)?.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { inpaintImageBatch, loading, error };
};

export default useInpaintBatch;
