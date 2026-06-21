"""Thin wrapper around cv2.VideoCapture so app.py doesn't own OpenCV camera
lifecycle directly (previously inlined in the Flask route generator)."""

from collections.abc import Iterator

import cv2
import numpy as np


class Camera:
    def __init__(self, index: int) -> None:
        self.capture = cv2.VideoCapture(index)
        if not self.capture.isOpened():
            raise RuntimeError(f"Could not open camera at index {index}")

    def frames(self) -> Iterator[np.ndarray]:
        while True:
            ok, frame = self.capture.read()
            if not ok:
                break
            yield frame

    def release(self) -> None:
        self.capture.release()
