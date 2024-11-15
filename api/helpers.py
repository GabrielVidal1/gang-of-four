"""Helper functions for the API."""

import base64
import io
from datetime import datetime

import requests
from fastapi import HTTPException
from PIL import Image


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
    return date + "-" + "".join(c if c.isalnum() else "_" for c in prompt)[:10]
    return date + "-" + "".join(c if c.isalnum() else "_" for c in prompt)[:10]
