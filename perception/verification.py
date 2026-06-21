"""Identity verification: cosine similarity between a live embedding and a
set of enrolled reference embeddings (produced by enroll.py).

This replaces app.py's previous hardcoded threshold on a single Keras
sigmoid output. There is no "the" face anymore — there can be zero, one, or
several enrolled identities, and the result names whoever matched best.
"""

import json
from pathlib import Path

import numpy as np


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


class FaceVerifier:
    def __init__(self, enrolled_faces_path: str, threshold: float) -> None:
        self.enrolled_faces_path = Path(enrolled_faces_path)
        self.threshold = threshold
        self.enrolled: dict[str, np.ndarray] = self._load()

    def _load(self) -> dict[str, np.ndarray]:
        if not self.enrolled_faces_path.exists():
            return {}
        with open(self.enrolled_faces_path) as f:
            raw = json.load(f)
        return {name: np.array(vec, dtype=np.float32) for name, vec in raw.items()}

    def reload(self) -> None:
        self.enrolled = self._load()

    def verify(self, embedding: np.ndarray) -> tuple[str, float]:
        if not self.enrolled:
            return "Unknown", 0.0

        best_name, best_score = "Unknown", -1.0
        for name, ref_embedding in self.enrolled.items():
            score = cosine_similarity(embedding, ref_embedding)
            if score > best_score:
                best_name, best_score = name, score

        if best_score >= self.threshold:
            return best_name, best_score
        return "Unknown", best_score

    @staticmethod
    def save_enrollment(
        enrolled_faces_path: str, name: str, embedding: np.ndarray
    ) -> None:
        path = Path(enrolled_faces_path)
        existing = {}
        if path.exists():
            with open(path) as f:
                existing = json.load(f)
        existing[name] = embedding.tolist()
        with open(path, "w") as f:
            json.dump(existing, f, indent=2)
