"""Face embedding via ONNX Runtime.

Replaces the original app.py's broken pattern of calling
StandardScaler().fit_transform(...) and PCA().fit_transform(...) on a single
frame's pixels every iteration (which refits the transform from scratch on
noise each frame and isn't a trained model at all). Here, a pretrained
ONNX face-embedding network (see models/README.md for provenance) produces a
fixed-size, L2-normalized embedding vector per face crop. Identity decisions
are made downstream in verification.py via cosine similarity — no per-frame
fitting of anything.
"""

import cv2
import numpy as np
import onnxruntime as ort

# Indices of the eye-corner landmarks used to align the face before embedding.
_LEFT_EYE = [36, 37, 38, 39, 40, 41]
_RIGHT_EYE = [42, 43, 44, 45, 46, 47]


def _eye_center(points: list[tuple[int, int]], indices: list[int]) -> np.ndarray:
    pts = np.array([points[i] for i in indices], dtype=np.float32)
    return pts.mean(axis=0)


def align_face(
    frame: np.ndarray, landmarks: list[tuple[int, int]], output_size: int
) -> np.ndarray:
    """Rotate/scale the frame so the eyes are level, then crop to a square
    face-centered patch of `output_size` x `output_size`."""
    left_eye = _eye_center(landmarks, _LEFT_EYE)
    right_eye = _eye_center(landmarks, _RIGHT_EYE)

    dy = right_eye[1] - left_eye[1]
    dx = right_eye[0] - left_eye[0]
    angle = np.degrees(np.arctan2(dy, dx))

    eye_center = ((left_eye + right_eye) / 2.0).astype(np.float32)
    inter_eye_dist = np.linalg.norm(right_eye - left_eye)
    # Empirically, inter-eye distance is ~36% of a well-cropped face width.
    target_inter_eye = output_size * 0.36
    scale = target_inter_eye / max(inter_eye_dist, 1e-6)

    rot_matrix = cv2.getRotationMatrix2D(tuple(eye_center), angle, scale)
    # Recenter so the eye midpoint lands at (output_size/2, output_size*0.4)
    rot_matrix[0, 2] += output_size / 2.0 - eye_center[0]
    rot_matrix[1, 2] += output_size * 0.4 - eye_center[1]

    return cv2.warpAffine(frame, rot_matrix, (output_size, output_size))


class FaceEmbedder:
    def __init__(self, model_path: str, input_size: int = 112) -> None:
        self.session = ort.InferenceSession(
            model_path, providers=["CPUExecutionProvider"]
        )
        self.input_name = self.session.get_inputs()[0].name
        self.input_size = input_size

    def embed(self, frame: np.ndarray, landmarks: list[tuple[int, int]]) -> np.ndarray:
        aligned = align_face(frame, landmarks, self.input_size)
        rgb = cv2.cvtColor(aligned, cv2.COLOR_BGR2RGB).astype(np.float32)
        normalized = (rgb - 127.5) / 128.0
        chw = np.transpose(normalized, (2, 0, 1))
        batch = np.expand_dims(chw, axis=0)

        (output,) = self.session.run(None, {self.input_name: batch})
        embedding = output[0]
        norm = np.linalg.norm(embedding)
        return embedding / norm if norm > 0 else embedding
