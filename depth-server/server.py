import base64
import io
from contextlib import asynccontextmanager

import numpy as np
from sklearn.cluster import KMeans
import torch
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image
from transformers import pipeline

MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"

depth_estimator = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global depth_estimator
    load_model()
    yield
    depth_estimator = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_model():
    global depth_estimator
    device = 0 if torch.cuda.is_available() else -1
    depth_estimator = pipeline(
        task="depth-estimation",
        model=MODEL_ID,
        device=device,
    )


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": depth_estimator is not None}

def compute_layers(depth_array: np.ndarray, n_layers: int) -> np.ndarray:
    values = depth_array.flatten().reshape(-1, 1)
    kmeans = KMeans(n_clusters=n_layers, random_state=42, n_init="auto")
    kmeans.fit(values)

    labels = kmeans.labels_.reshape(depth_array.shape)
    centers = kmeans.cluster_centers_.flatten()

    order = np.argsort(centers)
    rank_of_cluster = np.empty_like(order)
    rank_of_cluster[order] = np.arange(len(order))

    layer_indices = rank_of_cluster[labels]
    return (layer_indices)
    

@app.post("/depth")
async def estimate_depth(file: UploadFile = File(...), bricks_width: int = 64, bricks_height: int = 64, n_layers: int = 6):

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    result = depth_estimator(image)
    depth_image: Image.Image = result["depth"]

    depth_array = np.array(depth_image).astype(np.float32)
    normalized = (depth_array - depth_array.min()) / (depth_array.max() - depth_array.min() + 1e-8)
    depth_8bit = (normalized * 255).astype(np.uint8)

    small_depth = Image.fromarray(depth_array).resize((bricks_width, bricks_height))
    small_depth_array = np.array(small_depth)

    layer_indices = compute_layers(small_depth_array, n_layers)

    out = Image.fromarray(depth_8bit, mode="L")
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    png_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "depth_preview": f"data:image/png;base64,{png_base64}",
        "layers": layer_indices.tolist(),
    }

