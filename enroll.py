"""CLI to enroll a new identity: captures several frames from the webcam,
averages their face embeddings, and saves the result to enrolled_faces.json
for perception.verification.FaceVerifier to match against later.

Usage:
    python enroll.py --name alice [--samples 20]
"""

import argparse
import sys

import cv2
import numpy as np

from perception.capture import Camera
from perception.config import config
from perception.detection import FaceLandmarkDetector
from perception.embedding import FaceEmbedder
from perception.verification import FaceVerifier


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", required=True, help="Identity to enroll")
    parser.add_argument(
        "--samples", type=int, default=20, help="Number of frames to average"
    )
    args = parser.parse_args()

    detector = FaceLandmarkDetector(config.landmark_model_path)
    embedder = FaceEmbedder(config.embedding_model_path, config.embedding_input_size)
    camera = Camera(config.camera_index)

    print(f"Enrolling '{args.name}' — look at the camera ({args.samples} samples)...")
    embeddings = []
    for frame in camera.frames():
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detect(gray)
        if faces:
            embeddings.append(embedder.embed(frame, faces[0].landmarks))
            print(f"  captured {len(embeddings)}/{args.samples}")
        if len(embeddings) >= args.samples:
            break

    camera.release()

    if not embeddings:
        print("No face captured — aborting enrollment.", file=sys.stderr)
        return 1

    mean_embedding = np.mean(embeddings, axis=0)
    mean_embedding /= np.linalg.norm(mean_embedding)

    FaceVerifier.save_enrollment(config.enrolled_faces_path, args.name, mean_embedding)
    print(f"Saved enrollment for '{args.name}' to {config.enrolled_faces_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
