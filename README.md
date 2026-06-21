# Edge AI Perception System

![Facial landmark tracking illustration](https://raw.githubusercontent.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision/main/assets_task_01jv89egk5f01rbv8ajfcbv19t_1747256392_img_2.webp)

A real-time facial landmark tracking and identity-verification system that
runs on a laptop webcam, communicates with an ESP32 over MQTT, and pushes a
tiny quantized classifier on-device for true edge inference. Built around
dlib's 68-point landmark detector, a Kalman filter for smooth tracking, an
ONNX Runtime face-embedding model for verification, and TensorFlow Lite
Micro for the embedded piece — with a live performance dashboard, Docker
packaging, and tests throughout.

See [docs/architecture.md](docs/architecture.md) for component, data-flow,
and deployment diagrams.

## What it does

1. **Captures** video from a webcam (`perception/capture.py`).
2. **Detects** faces and 68 facial landmarks with dlib, deriving
   eye-aspect-ratio (EAR) as a side effect (`perception/detection.py`).
3. **Tracks** the face center with a constant-velocity Kalman filter for
   smooth bounding boxes under motion (`perception/tracking.py`).
4. **Embeds** each face into a 512-d vector using a pretrained ONNX
   ArcFace model run through ONNX Runtime, after aligning the crop by eye
   landmarks (`perception/embedding.py`).
5. **Verifies** identity via cosine similarity against embeddings you
   enroll yourself (`perception/verification.py`, `enroll.py`).
6. **Publishes** verification results and the live EAR signal over MQTT
   (`perception/mqtt_client.py`).
7. **Runs a tiny on-device model on the ESP32** (`firmware/`): a
   TensorFlow-Lite-Micro classifier trained on EAR windows
   (`tinyml/`) decides blink/no-blink directly on the microcontroller and
   drives an LED — real TinyML, wired into the same pipeline, not a
   disconnected demo.
8. **Exposes live performance metrics** (FPS, detection/embedding latency,
   verification counts) at `/metrics`, polled by a Streamlit dashboard
   (`dashboard/streamlit_app.py`).

## Quick start (Docker)

```bash
git clone https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision.git
cd TinyML-Driven-Embedded-AI-Vision
touch enrolled_faces.json
docker compose up --build
```

- Live feed: http://localhost:5000
- Metrics JSON: http://localhost:5000/metrics
- Performance dashboard: http://localhost:8501

> Webcam passthrough in Docker only works reliably on Linux hosts. On
> Windows/macOS, run the app natively (below) for camera access; you can
> still run the broker and dashboard via Docker.

## Quick start (native)

```bash
pip install -r requirements.txt
python models/download_models.py     # fetches dlib + ONNX models (not committed to git)
python enroll.py --name yourname      # enroll your face
python app.py                          # http://localhost:5000
streamlit run dashboard/streamlit_app.py   # http://localhost:8501
```

## ESP32 firmware

```bash
cd firmware
cp include/secrets.h.example include/secrets.h   # fill in WiFi + broker details
pio run                  # compile
pio run --target upload  # flash
```

See [firmware/README.md](firmware/README.md) for details, including how to
regenerate the on-device blink classifier from `tinyml/`.

## Project layout

```
perception/      Core pipeline: capture, detection, tracking, embedding, verification, MQTT, metrics
app.py            Flask entrypoint (/, /video_feed, /metrics)
enroll.py         CLI to enroll a new identity's face embedding
dashboard/        Streamlit performance metrics dashboard
models/           Model download script + provenance notes (binaries are not committed)
firmware/         PlatformIO ESP32 project (WiFi/MQTT/FreeRTOS + on-device TFLite Micro)
tinyml/           Synthetic EAR dataset, training, and TFLite->C-array conversion for the firmware
tests/            Unit tests (tracking, verification, metrics)
docker/, docker-compose.yml   Container packaging for app + dashboard + MQTT broker
docs/             Architecture diagrams
```

## Testing

```bash
pip install -r requirements-dev.txt
pytest tests/
```

## License

MIT — see [LICENSE](LICENSE).
