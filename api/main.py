import base64
import io
import traceback
from datetime import datetime

import replicate
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


# Pydantic model for request body
class InpaintRequest(BaseModel):
    image: str  # Base64-encoded image
    mask: str  # Base64-encoded mask
    prompt: str
    strength: float = 1.0
    guidance_scale: float = 7.0
    num_inference_steps: int = 30
    output_format: str = "webp"
    width: int = 1024
    height: int = 1024
    output_quality: int = 90


# Helper function to encode image to base64
def encode_base64_image(image: Image.Image, format: str = "WEBP") -> str:
    buffered = io.BytesIO()
    image.save(buffered, format=format)
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


# Helper function to fetch image from URL and convert to Base64
def fetch_image_and_encode_base64(url: str):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        img = Image.open(io.BytesIO(response.content))
        return encode_base64_image(img), img
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching image: {str(e)}")


def sanitize_filename(prompt: str) -> str:
    date = datetime.now().strftime("%Y-%m-%d %H-%M-%S")
    return date + "-" + "".join(c if c.isalnum() else "_" for c in prompt)[:10]


@app.post("/inpaint")
async def inpaint(request: InpaintRequest):
    try:
        # Call the Replicate API
        output = replicate.run(
            "zsxkib/flux-dev-inpainting:ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008",
            input={
                "mask": request.mask,
                "image": request.image,
                "width": request.width,
                "height": request.height,
                "prompt": request.prompt,
                "strength": request.strength,
                "num_outputs": 1,
                "output_format": request.output_format,
                "guidance_scale": request.guidance_scale,
                "output_quality": request.output_quality,
                "num_inference_steps": request.num_inference_steps,
            },
        )

        # Assuming the output is a downloadable image
        for output_image_url in output:  # Get the first image URL from the output
            encoded_image, img = fetch_image_and_encode_base64(output_image_url)

            img_name = sanitize_filename(request.prompt)
            img.save(f"logs/images/{img_name}.{img.format.lower()}")

            # Return the Base64-encoded image
            return {
                "base64_image": encoded_image
            }  # Adjust this to return the actual base64 image
        raise HTTPException(status_code=500, detail="No image found in output")

    except Exception:
        traceback.print_exc()
        return JSONResponse
