"""Trains a tiny dense network to classify a 5-sample eye-aspect-ratio (EAR)
window as blink / no-blink, then exports an int8-quantized TFLite model
small enough for the ESP32's tensor arena.

This is a build-time-only script — it requires `requirements-tinyml.txt`
(TensorFlow), which is intentionally NOT part of the runtime app/dashboard
images. Run it, then run convert_to_c_array.py to embed the result into the
firmware.

Usage:
    pip install -r requirements-tinyml.txt
    python tinyml/generate_synthetic_ear_dataset.py
    python tinyml/train_blink_classifier.py
"""

from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense

DATASET_PATH = Path(__file__).parent / "ear_dataset.csv"
OUTPUT_TFLITE = Path(__file__).parent / "blink_classifier.tflite"
WINDOW_SIZE = 5


def main() -> None:
    data = pd.read_csv(DATASET_PATH)
    features = data[[f"ear_{i}" for i in range(WINDOW_SIZE)]].to_numpy(dtype=np.float32)
    labels = data["blink"].to_numpy(dtype=np.float32)

    split = int(len(features) * 0.8)
    train_x, test_x = features[:split], features[split:]
    train_y, test_y = labels[:split], labels[split:]

    model = Sequential(
        [
            Dense(8, activation="relu", input_shape=(WINDOW_SIZE,)),
            Dense(1, activation="sigmoid"),
        ]
    )
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    model.fit(train_x, train_y, epochs=15, validation_data=(test_x, test_y), verbose=2)

    test_loss, test_acc = model.evaluate(test_x, test_y, verbose=0)
    print(f"Test accuracy: {test_acc:.4f} (loss {test_loss:.4f})")

    def representative_dataset():
        for sample in train_x[:200]:
            yield [sample.reshape(1, WINDOW_SIZE)]

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.representative_dataset = representative_dataset
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.int8
    tflite_model = converter.convert()

    OUTPUT_TFLITE.write_bytes(tflite_model)
    print(f"Wrote quantized model ({len(tflite_model)} bytes) to {OUTPUT_TFLITE}")


if __name__ == "__main__":
    main()
