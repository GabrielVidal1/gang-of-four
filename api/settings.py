"""Settings for the API"""

LOG_IMAGES = True

MODELS = {
    "flux-dev-inpainting": "zsxkib/flux-dev-inpainting:ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008",
    "stable-diffusion-inpainting": "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
}

BASE_PARAMS = [
    "image",
    "mask",
    "prompt",
]

PARAMS = {
    "flux-dev-inpainting": {
        "width": 1024,
        "height": 1024,
        "strength": 1.0,
        "guidance_scale": 7.0,
        "num_inference_steps": 30,
        "output_format": "webp",
        "output_quality": 90,
    },
    "stable-diffusion-inpainting": {
        "width": 1024,
        "height": 1024,
        "guidance_scale": 7.5,
        "num_inference_steps": 25,
        "scheduler": "DPMSolverMultistep",
    },
}
