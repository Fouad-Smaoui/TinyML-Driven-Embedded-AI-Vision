"""Fetches the two pretrained models this project depends on, instead of
committing ~95MB+ of binaries to git (as the original repo did with the
dlib landmark model).

Run once before starting the app:
    python models/download_models.py

Downloads:
  1. dlib's 68-point facial landmark predictor (CC0/permissive, see
     https://github.com/davisking/dlib-models)
  2. ArcFace ResNet100 (int8-quantized) face embedding model from the
     ONNX Model Zoo, Apache-2.0 licensed
     (https://github.com/onnx/models/tree/main/validated/vision/body_analysis/arcface)

See models/README.md for full provenance and license notes.
"""

import bz2
import shutil
import sys
import urllib.request
from pathlib import Path

MODELS_DIR = Path(__file__).parent

LANDMARK_URL = (
    "https://github.com/davisking/dlib-models/raw/master/"
    "shape_predictor_68_face_landmarks.dat.bz2"
)
LANDMARK_DAT = MODELS_DIR / "shape_predictor_68_face_landmarks.dat"

EMBEDDING_URL = (
    "https://github.com/onnx/models/raw/main/validated/vision/"
    "body_analysis/arcface/model/arcfaceresnet100-11-int8.onnx"
)
EMBEDDING_ONNX = MODELS_DIR / "face_embedding.onnx"


def _download(url: str, dest: Path) -> None:
    print(f"Downloading {url} -> {dest}")
    with urllib.request.urlopen(url) as response, open(dest, "wb") as out_file:
        shutil.copyfileobj(response, out_file)


def fetch_landmark_model() -> None:
    if LANDMARK_DAT.exists():
        print(f"Skipping landmark model — already present at {LANDMARK_DAT}")
        return
    compressed = MODELS_DIR / "shape_predictor_68_face_landmarks.dat.bz2"
    _download(LANDMARK_URL, compressed)
    print(f"Decompressing -> {LANDMARK_DAT}")
    with bz2.open(compressed, "rb") as src, open(LANDMARK_DAT, "wb") as dst:
        shutil.copyfileobj(src, dst)
    compressed.unlink()


def fetch_embedding_model() -> None:
    if EMBEDDING_ONNX.exists():
        print(f"Skipping embedding model — already present at {EMBEDDING_ONNX}")
        return
    _download(EMBEDDING_URL, EMBEDDING_ONNX)


def main() -> int:
    try:
        fetch_landmark_model()
        fetch_embedding_model()
    except OSError as exc:
        print(f"Download failed: {exc}", file=sys.stderr)
        print(
            "If the URLs above have moved, check models/README.md for "
            "current sources and set LANDMARK_MODEL_PATH / "
            "EMBEDDING_MODEL_PATH env vars to a manually downloaded copy.",
            file=sys.stderr,
        )
        return 1
    print("All models ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
