"""Generates a small synthetic dataset of eye-aspect-ratio (EAR) windows
labeled blink / no-blink, used to train the tiny on-device classifier that
runs on the ESP32 (firmware/src/main.cpp).

This replaces the original project's disconnected MNIST digit-classifier
demo with a TinyML task that's actually wired into the facial-landmark
pipeline: perception/detection.py already computes EAR per frame, and the
ESP32 receives it live over MQTT (topic perception/ear).

The data here is synthetic (no public EAR dataset is bundled with this
repo) but the *shape* of the signal — a stable open-eye baseline with sharp,
brief dips during blinks — mirrors real EAR traces, which is sufficient for
a tiny binary classifier demonstrating a real, connected TinyML deployment.

Usage:
    python tinyml/generate_synthetic_ear_dataset.py
"""

import csv
from pathlib import Path

import numpy as np

WINDOW_SIZE = 5
NUM_SAMPLES = 4000
OPEN_EYE_MEAN = 0.30
OPEN_EYE_STD = 0.02
BLINK_MIN = 0.04
BLINK_MAX = 0.12
OUTPUT_PATH = Path(__file__).parent / "ear_dataset.csv"


def make_open_eye_window(rng: np.random.Generator) -> np.ndarray:
    return rng.normal(OPEN_EYE_MEAN, OPEN_EYE_STD, size=WINDOW_SIZE).clip(0.05, 0.45)


def make_blink_window(rng: np.random.Generator) -> np.ndarray:
    window = make_open_eye_window(rng)
    dip_index = rng.integers(0, WINDOW_SIZE)
    window[dip_index] = rng.uniform(BLINK_MIN, BLINK_MAX)
    return window


def main() -> None:
    rng = np.random.default_rng(seed=42)
    rows = []
    for _ in range(NUM_SAMPLES // 2):
        rows.append((*make_open_eye_window(rng), 0))
        rows.append((*make_blink_window(rng), 1))
    rng.shuffle(rows)

    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([f"ear_{i}" for i in range(WINDOW_SIZE)] + ["blink"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} samples to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
