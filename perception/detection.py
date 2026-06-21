"""Face detection and 68-point facial landmark extraction using dlib.

This is the same dlib HOG detector + shape predictor pipeline the project
already used; it's wrapped in a small class and gains one new derived
signal (eye-aspect-ratio) that the original app.py never computed but the
68 landmarks always made available. EAR is what feeds the on-device TinyML
blink classifier on the ESP32.
"""

from dataclasses import dataclass

import dlib
import numpy as np

# Standard 68-point dlib landmark indices for the left/right eye contours.
_LEFT_EYE = [36, 37, 38, 39, 40, 41]
_RIGHT_EYE = [42, 43, 44, 45, 46, 47]


@dataclass
class DetectedFace:
    rect: dlib.rectangle
    landmarks: list[tuple[int, int]]
    ear: float


def _eye_aspect_ratio(points: list[tuple[int, int]]) -> float:
    p = np.array(points, dtype=np.float32)
    vertical_1 = np.linalg.norm(p[1] - p[5])
    vertical_2 = np.linalg.norm(p[2] - p[4])
    horizontal = np.linalg.norm(p[0] - p[3])
    if horizontal == 0:
        return 0.0
    return float((vertical_1 + vertical_2) / (2.0 * horizontal))


class FaceLandmarkDetector:
    def __init__(self, predictor_path: str) -> None:
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(predictor_path)

    def detect(self, gray_frame: np.ndarray) -> list[DetectedFace]:
        faces = []
        for rect in self.detector(gray_frame):
            shape = self.predictor(gray_frame, rect)
            points = [(shape.part(n).x, shape.part(n).y) for n in range(68)]

            left_ear = _eye_aspect_ratio([points[i] for i in _LEFT_EYE])
            right_ear = _eye_aspect_ratio([points[i] for i in _RIGHT_EYE])
            ear = (left_ear + right_ear) / 2.0

            faces.append(DetectedFace(rect=rect, landmarks=points, ear=ear))
        return faces
