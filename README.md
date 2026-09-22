*This project has been created as part of the 42 curriculum by pacda-si.*

# BrickDepth

## Description

BrickDepth turns a single 2D image into a 3D LEGO-style brick mosaic. It estimates a depth map from the picture, slices that depth into a small number of discrete layers, and re-colors every "brick" using the closest match from a fixed LEGO color palette - then renders the result as an interactive 3D scene.

The pipeline has three stages:
1. **Depth estimation** - a monocular depth estimation model infers a per-pixel depth map from the uploaded image.
2. **Layering** - the continuous depth map is collapsed into a configurable number of discrete layers (foreground/subject/mid-ground/background, roughly), used as the height of each brick.
3. **Color quantization** - each brick's color is snapped to the nearest color in a LEGO palette, compared in the perceptually-uniform Lab color space rather than raw RGB.

The app has two parts running side by side:
- an **Electron + React + Three.js** desktop app (the UI and the 3D rendering)
- a **Python (FastAPI) server** that runs the depth estimation model, started automatically by Electron

## Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- [Python](https://www.python.org/) 3.11+
- An NVIDIA GPU with CUDA is recommended for fast inference, but not required - the server falls back to CPU automatically if no GPU is detected (just slower).

### Setup

**1. Node dependencies**

```bash
npm install
```

**2. Depth estimation server (Python)**

From the project root:

```bash
cd depth-server
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

`torch` (with CUDA support) is a large download (a few GB). If the install fails with a `disk quota exceeded` error related to `/tmp`, redirect pip's temp directory elsewhere before retrying (that's what happened to me lol):

```bash
export TMPDIR=$HOME/.local/tmp
mkdir -p "$TMPDIR"
pip install -r ../requirements.txt
```

The first time the app runs, it also downloads the depth model's weights from the Hugging Face Hub (~100 MB, cached locally afterward).

### Running the app end-to-end

From the project root:

```bash
npm run dev
```

This starts the Vite dev server (`http://localhost:5123`) and opens the Electron window. Electron itself spawns the Python server on `http://localhost:8000` and waits for `http://localhost:8000/health` to respond before showing the window - no manual step needed to start the backend.

Once the window is open:
1. Drag an image onto the dashed panel on the left (or click it to open a file picker).
2. The image is sent to the local depth server; after a couple of seconds, the generated 3D brick mosaic appears automatically in the panel on the right, and a depth-map thumbnail shows in its bottom-right corner.
3. Use the sliders on the left (resolution, number of depth layers, layer spacing, block height) to adjust the reconstruction - each change re-runs the pipeline on the last uploaded image.
4. The list below the sliders shows every LEGO color used in the current mosaic, with how many bricks use it.
5. Export the file to .glb, using the button for that function

No Docker or external URL is involved beyond the two local ports above (5123 for the dev UI, 8000 for the depth server).

### Build

```bash
npm run dist:linux
```

Produces a Linux build (via `electron-builder`) in `dist/`. The Python server is **not** bundled into this build - the `depth-server/venv` from the setup step must exist on the machine running the packaged app.

An AppImage runs from a temporary mount point that changes on every launch, so the packaged app can't guess where that venv is - point it explicitly at the `depth-server` directory (the one containing `venv/`) via an environment variable. From the project root:

```bash
BRICKDEPTH_DEPTH_SERVER_PATH="$(pwd)/depth-server" ./dist/*.AppImage
```

Without it (or if the venv inside it is missing/incomplete), the app shows an error dialog explaining what's missing instead of failing silently.

## External services & models

- **[Depth Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf)** (`depth-anything/Depth-Anything-V2-Small-hf`), loaded through Hugging Face `transformers`. Downloaded automatically from the Hugging Face Hub on first run - it is a public model, no API key or credentials needed.
- **[Three.js](https://threejs.org/)** / **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)**, **[@react-three/drei](https://github.com/pmndrs/drei)**, **[@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)** for the 3D rendering (camera controls, SSAO) - local, open-source libraries, no external service.
- No image-generation model is used.
- No other paid or external API is involved.

## Resources

### References

- Monocular depth estimation: [MiDaS](https://github.com/isl-org/MiDaS) ("Towards Robust Monocular Depth Estimation"), [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2).
- Color quantization & perceptual color distance: [Wikipedia - Color quantization](https://en.wikipedia.org/wiki/Color_quantization), [CIELAB color space](https://en.wikipedia.org/wiki/CIELAB_color_space),
- Clustering for depth-layer slicing: [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering), [scikit-learn `KMeans` docs](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html).
- 3D rendering: [Three.js `InstancedMesh` docs](https://threejs.org/docs/#api/en/objects/InstancedMesh), [Three.js shadow mapping guide](https://threejs.org/docs/#manual/en/introduction/How-to-use-lights), [`@react-three/postprocessing` SSAO](https://github.com/pmndrs/react-postprocessing).
- Backend & app shell: [FastAPI documentation](https://fastapi.tiangolo.com/), [Electron IPC documentation](https://www.electronjs.org/docs/latest/tutorial/ipc).

### AI usage

AI assistance (Claude Code) was used throughout the project, mainly for:
- **Environment/dependency troubleshooting**: diagnosing a `/tmp` tmpfs quota causing `pip install` failures, resolving an npm `ERESOLVE` peer-dependency conflict when adding `@react-three/drei`/`@react-three/postprocessing`, and diagnosing a Vite dev-server crash caused by it trying to watch a Python virtual environment (hitting the OS file-watcher limit).
- **Explaining concepts before implementation**: monocular depth estimation, color quantization and the Lab color space, k-means/quantile/Jenks approaches and the Three.js `InstancedMesh` GPU instancing.
- **Co-writing specific modules**: the FastAPI depth-estimation server (`depth-server/server.py`), the vast majority of the UI (sliders, widgets...).
- **Dependency cleanup**: identifying and removing unused npm packages left over from an earlier UI iteration.

All AI-assisted code was reviewed, tested end-to-end (including manual verification in the running app), and iterated on before being kept.

## Pipeline ownership

This is a solo project (single author, `pacda-si`). Mapping of the pipeline stages to the code, for reference:

| Stage | Files |
|---|---|
| Depth estimation server | `depth-server/server.py`, `requirements.txt` |
| Electron ↔ Python orchestration | `src/electron/main.ts` |
| Pixel extraction & LEGO color quantization | `src/ui/render/ImageUtils.tsx`, `src/ui/render/ColorUtils.ts`, `palette.json` |
| 3D rendering (instanced bricks, shadows, SSAO) | `src/ui/render/LegoRenderer.tsx` |
| UI (upload, controls, color usage list) | `src/ui/App.tsx`, `src/ui/UploadPanel.tsx`, `src/ui/ResolutionSlider.tsx`, `src/ui/LayersSlider.tsx`, `src/ui/LayerSpacingSlider.tsx`, `src/ui/BlockHeightSlider.tsx`, `src/ui/BlocksList.tsx`, `src/ui/ColorSwatch.tsx` |
