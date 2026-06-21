"""Constant-velocity Kalman filter for smoothing a tracked face's center point.

Same model as the original kalman_filter.py: state is [x, y, vx, vy], we
measure [x, y]. Kept as-is (it was already correct) and given a small,
testable interface.
"""

import cv2
import numpy as np


class FaceTracker:
    def __init__(self) -> None:
        self.kalman = cv2.KalmanFilter(4, 2)
        self.kalman.measurementMatrix = np.array(
            [[1, 0, 0, 0], [0, 1, 0, 0]], np.float32
        )
        self.kalman.transitionMatrix = np.array(
            [[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]], np.float32
        )
        self.kalman.processNoiseCov = (
            np.eye(4, dtype=np.float32) * 0.03
        )
        self.kalman.measurementNoiseCov = np.eye(2, dtype=np.float32) * 1.0
        self.kalman.errorCovPost = np.eye(4, dtype=np.float32)
        self.kalman.statePost = np.zeros((4, 1), np.float32)

    def predict(self) -> tuple[float, float]:
        state = self.kalman.predict()
        return float(state[0, 0]), float(state[1, 0])

    def correct(self, x: float, y: float) -> tuple[float, float]:
        corrected = self.kalman.correct(
            np.array([[np.float32(x)], [np.float32(y)]])
        )
        return float(corrected[0, 0]), float(corrected[1, 0])
