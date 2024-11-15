"""Main FastAPI application."""

import traceback

import replicate
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from api.helpers import fetch_image_and_encode_base64, sanitize_filename
from api.settings import BASE_PARAMS, MODELS, PARAMS

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
    model: str = "flux-dev-inpainting"
    image: str  # Base64-encoded image
    mask: str  # Base64-encoded mask
    prompt: str
    # Additionnal Parameters
    num_outputs: int = 1

    # Optional parameters
    strength: float = 1.0
    guidance_scale: float = 7.0
    num_inference_steps: int = 30
    output_format: str = "webp"
    width: int = 1024
    height: int = 1024
    output_quality: int = 90


@app.post("/inpaint")
async def inpaint(request: InpaintRequest):
    model = request.model
    if model not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model {model} not found")

    params = PARAMS[model]

    for param in BASE_PARAMS:
        if not getattr(request, param):
            raise HTTPException(status_code=400, detail=f"Missing parameter {param}")
        params[param] = getattr(request, param)
    for additional_param in PARAMS[model].keys():
        params[additional_param] = getattr(
            request, additional_param, PARAMS[model][additional_param]
        )

    try:
        # Call the Replicate API
        output = replicate.run(
            MODELS[request.model],
            input=params,
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
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )
