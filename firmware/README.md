# ESP32 Perception Client (Firmware)

A PlatformIO project — the original repo only had a bare `main.cpp` with no
build configuration, an invalid `'''`-wrapped block (not valid C++), and an
undefined `your_model_data` symbol, so it never compiled.

## What it does

1. Connects to WiFi and an MQTT broker.
2. Subscribes to `perception/verification` (identity + score from the Flask
   app) and `perception/ear` (live eye-aspect-ratio per frame).
3. Runs a tiny, real, quantized TensorFlow Lite Micro model
   (`include/model_data.h`) on-device to classify each 5-sample EAR window
   as blink / no-blink — this is the TinyML piece, and unlike the original
   MNIST demo it is actually wired into the rest of the system.
4. Drives the onboard LED based on verification state and logs detected
   blinks over Serial.

## Build

```bash
cp include/secrets.h.example include/secrets.h
# edit include/secrets.h with your WiFi + MQTT broker details
pio run                  # compile
pio run --target upload  # flash to a connected ESP32
pio device monitor        # view Serial output
```

## Regenerating the TinyML model

`include/model_data.h` is generated from a trained model, not hand-written.
To regenerate it (e.g. after retraining on different data):

```bash
pip install -r ../requirements-tinyml.txt
python ../tinyml/generate_synthetic_ear_dataset.py
python ../tinyml/train_blink_classifier.py
python ../tinyml/convert_to_c_array.py
```
