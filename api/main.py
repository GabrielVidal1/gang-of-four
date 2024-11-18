"""Main FastAPI application."""

import asyncio
import traceback
import uuid

import replicate
import replicate.exceptions
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from replicate.exceptions import ReplicateError

from api.helpers import fetch_image_and_encode_base64, sanitize_filename
from api.settings import BASE_PARAMS, LOG_IMAGES, MODELS, PARAMS, RETRY_LIMIT

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
    id: str = None
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


def format_output(outputs: list[str], request: InpaintRequest):
    output = []
    for output_image_url in outputs:
        encoded_image, img = fetch_image_and_encode_base64(output_image_url)
        if LOG_IMAGES:
            img_name = sanitize_filename(request.prompt)
            img.save(f"logs/images/{img_name}.{img.format.lower()}")

        # Return the Base64-encoded image
        output.append({"base64_image": encoded_image})
    return {
        "id": request.id or uuid.uuid4(),
        "outputs": output,
        "prompt": request.prompt,
    }


async def replicate_inpaint(model, params, async_mode=False):
    if async_mode:
        return await replicate.async_run(model, input=params, use_file_output=False)
    else:
        return replicate.run(model, input=params)


async def inpaint(request: InpaintRequest, async_mode=False):
    model = request.model

    params = PARAMS[model]
    params.pop("id", None)

    for param in BASE_PARAMS:
        if not getattr(request, param):
            raise HTTPException(status_code=400, detail=f"Missing parameter {param}")
        params[param] = getattr(request, param)
    for additional_param in PARAMS[model].keys():
        params[additional_param] = getattr(
            request, additional_param, PARAMS[model][additional_param]
        )

    # Call the Replicate API
    output = []
    tries = 0
    while len(output) < request.num_outputs:
        try:
            output = await replicate_inpaint(MODELS[request.model], params, async_mode)
        except replicate.exceptions.ModelError:
            pass

        if len(output) < request.num_outputs:
            tries += 1
            print(f"Retrying... ({tries})")
            if tries >= RETRY_LIMIT:
                break
    if len(output) < request.num_outputs:
        raise ReplicateError(
            status=500,
            message="Failed to retrieve output",
        )

    return format_output(output, request)


@app.post("/inpaint")
async def inpaint_post(request: InpaintRequest):
    try:
        model = request.model
        if model not in MODELS:
            raise HTTPException(status_code=400, detail=f"Model {model} not found")
        result = await inpaint(request)
        return result

    except ReplicateError as e:
        print(e)
        return JSONResponse(
            status_code=e.status,
            content=e.to_dict(),
        )
    except Exception:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )


class InpaintBatchRequest(BaseModel):
    requests: list[InpaintRequest]


@app.post("/inpaint/batch")
async def inpaint_batch_post(request: InpaintBatchRequest):
    try:
        print("Processing batch request of size", len(request.requests))
        async with asyncio.TaskGroup() as tg:
            tasks = [
                tg.create_task(inpaint(request, True)) for request in request.requests
            ]

        results = await asyncio.gather(*tasks)

        return results

    except ReplicateError as e:
        print(e)
        return JSONResponse(
            status_code=e.status,
            content=e.to_dict(),
        )
    except Exception:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )
