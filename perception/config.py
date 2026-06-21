"""Centralized, environment-driven configuration.

Every value that was previously hardcoded in app.py / main.cpp (camera index,
model paths, broker address, thresholds) lives here so the same code runs
unmodified on a laptop, in Docker, or against a real MQTT broker.
"""

import os
from dataclasses import dataclass


def _bool(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Config:
    camera_index: int = int(os.environ.get("CAMERA_INDEX", "0"))

    landmark_model_path: str = os.environ.get(
        "LANDMARK_MODEL_PATH", "models/shape_predictor_68_face_landmarks.dat"
    )
    embedding_model_path: str = os.environ.get(
        "EMBEDDING_MODEL_PATH", "models/face_embedding.onnx"
    )
    embedding_input_size: int = int(os.environ.get("EMBEDDING_INPUT_SIZE", "112"))

    enrolled_faces_path: str = os.environ.get(
        "ENROLLED_FACES_PATH", "enrolled_faces.json"
    )
    verification_threshold: float = float(
        os.environ.get("VERIFICATION_THRESHOLD", "0.45")
    )

    mqtt_enabled: bool = _bool("MQTT_ENABLED", True)
    mqtt_broker_host: str = os.environ.get("MQTT_BROKER_HOST", "localhost")
    mqtt_broker_port: int = int(os.environ.get("MQTT_BROKER_PORT", "1883"))
    mqtt_verification_topic: str = os.environ.get(
        "MQTT_VERIFICATION_TOPIC", "perception/verification"
    )
    mqtt_ear_topic: str = os.environ.get("MQTT_EAR_TOPIC", "perception/ear")

    metrics_window_size: int = int(os.environ.get("METRICS_WINDOW_SIZE", "120"))

    flask_host: str = os.environ.get("FLASK_HOST", "0.0.0.0")
    flask_port: int = int(os.environ.get("FLASK_PORT", "5000"))
    flask_debug: bool = _bool("FLASK_DEBUG", False)


config = Config()
