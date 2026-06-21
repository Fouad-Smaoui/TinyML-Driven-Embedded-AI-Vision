# Architecture

EdgeVision AI is two implementations of the same ideas — landmark detection,
Kalman-filtered tracking, and latency-aware metrics — built for different
purposes:

- **Track A — Browser demo**: a Next.js app running MediaPipe's
  FaceLandmarker entirely client-side (WASM/WebGL), instantly accessible at
  a public URL, with a TypeScript port of the Kalman filter and a FastAPI
  backend for health/metrics/anonymous perf reporting.
- **Track B — Embedded pipeline**: the original Python system — dlib
  landmarks, ONNX face embeddings, MQTT, and a real TensorFlow Lite Micro
  classifier running on physical ESP32 hardware — run locally via Docker
  Compose.

The two tracks share concepts, not runtime data: there is no edge between
them in production, and the FastAPI backend never talks to the Flask app.

## Component diagram

```mermaid
graph TD
    subgraph TrackA["Track A — Browser Demo (recruiter-facing)"]
        Webcam[Visitor's webcam] --> VideoEl[HTMLVideoElement]
        VideoEl --> FaceLandmarker["MediaPipe FaceLandmarker<br/>WASM/WebGL, self-hosted assets"]
        FaceLandmarker --> TSKalman["lib/perception/kalman.ts<br/>TypeScript Kalman filter"]
        FaceLandmarker --> Overlay[Canvas overlay render]
        TSKalman --> Overlay
        FaceLandmarker --> TSMetrics["lib/metrics/perf-metrics.ts<br/>rolling FPS / latency"]
        TSKalman --> TSMetrics
        TSMetrics --> Ping["lib/metrics/backend-ping.ts"]
    end

    subgraph TrackB["Track B — Embedded Pipeline (local / Docker)"]
        Camera[Webcam] --> Capture[perception/capture.py]
        Capture --> Detection["perception/detection.py<br/>dlib HOG + 68-pt landmarks + EAR"]
        Detection --> Tracking["perception/tracking.py<br/>Kalman filter"]
        Detection --> Embedding["perception/embedding.py<br/>ONNX Runtime: align + embed"]
        Embedding --> Verification["perception/verification.py<br/>cosine similarity"]
        Tracking --> PyOverlay[Render landmarks / bbox / label]
        Verification --> PyOverlay
        PyOverlay --> Flask["app.py<br/>Flask: / , /video_feed, /metrics"]
        Detection --> PyMetrics[perception/metrics.py]
        Embedding --> PyMetrics
        Verification --> Publisher[perception/mqtt_client.py]
        Detection --> Publisher
        Publisher -->|MQTT publish| Broker[(Mosquitto Broker)]
        Broker -->|subscribe| ESP32["ESP32<br/>FreeRTOS + TFLite Micro blink classifier"]
        ESP32 --> LED[Onboard LED]
        Flask -->|"/metrics JSON"| Dashboard["dashboard/streamlit_app.py"]
    end

    subgraph API["FastAPI backend — supports Track A only, never touches Track B"]
        Ping -.->|"POST /ping<br/>(4 numbers, never video/face data)"| FastAPI["backend/app/main.py"]
        FastAPI --> Aggregator[app/metrics/aggregator.py]
        FastAPI --> Prom["/metrics — Prometheus"]
        FastAPI --> Health["/health, /status"]
    end
```

## Data flow diagram

```mermaid
flowchart TD
    subgraph FlowA["Track A — browser data flow"]
        A1[Camera frame] --> A2["MediaPipe detectForVideo()<br/>478 normalized landmarks"]
        A2 --> A3[Bounding box from landmark extent]
        A3 --> A4["TS Kalman: predict + correct"]
        A4 --> A5[Smoothed box + landmarks drawn on canvas]
        A2 --> A6[Inference latency, performance.now]
        A4 --> A7[Tracking latency, performance.now]
        A6 --> A8[PerfMetricsRecorder rolling window]
        A7 --> A8
        A8 -->|"every 6s, anonymized"| A9["POST /ping<br/>fps, inference_ms, tracking_ms, delegate"]
    end

    subgraph FlowB["Track B — embedded data flow"]
        B1[BGR frame] --> B2[Grayscale]
        B2 --> B3[dlib face rectangles]
        B3 --> B4[68 landmark points]
        B4 --> B5[Eye-aspect-ratio]
        B4 --> B6["Eye-aligned 112x112 crop"]
        B6 --> B7["ONNX Runtime: ArcFace embedding, 512-d"]
        B7 --> B8[Cosine similarity vs enrolled identities]
        B8 --> B9{">= threshold?"}
        B9 -->|yes| B10[name, score]
        B9 -->|no| B11[Unknown, score]
        B3 --> B12["face center (x, y)"]
        B12 --> B13["Kalman-smoothed (x, y)"]
        B10 --> B14["MQTT publish: perception/verification"]
        B11 --> B14
        B5 --> B15["MQTT publish: perception/ear"]
        B14 --> B16[ESP32 subscriber]
        B15 --> B16
        B16 --> B17[TFLite Micro blink classifier]
        B17 --> B18[LED / Serial log]
    end
```

## Deployment diagram

```mermaid
graph TB
    subgraph Prod["Production — recruiter-facing"]
        Visitor[Recruiter's browser] -->|HTTPS| Vercel["Vercel<br/>Next.js, static + edge"]
        Vercel -.->|"anonymous perf ping only —<br/>no video/face data, ever"| Render["Render<br/>FastAPI, persistent process"]
        Render --> RenderMetrics["/metrics — Prometheus"]
    end

    subgraph Local["Local / self-hosted — embedded track"]
        Mosquitto[(mosquitto:1883)]
        AppC["app container<br/>Flask :5000"]
        DashC["dashboard container<br/>Streamlit :8501"]
        AppC -->|publish| Mosquitto
        DashC -->|"poll /metrics"| AppC
        WebcamHW[(USB Webcam)] --> AppC
        Mosquitto -.->|same LAN| ESP32HW[Physical ESP32]
        ESP32HW --> LEDHW[LED]
    end
```

Why two deploy targets instead of one: Vercel's Python runtime executes each
request as a stateless function invocation, which can't reliably hold the
in-memory Prometheus counters and rolling aggregator the FastAPI backend
needs across requests. Render runs the backend as a normal persistent
process, where that state is real. The browser demo itself needs no backend
at all to function — `/ping` is purely supporting analytics infrastructure,
and the frontend degrades gracefully if it's unreachable.

## Model pipeline diagram

```mermaid
flowchart LR
    subgraph TrackAModels["Track A — pretrained, self-hosted"]
        MPModel["MediaPipe FaceLandmarker .task<br/>Google-provided, Apache-2.0<br/>NOT trained in this repo"]
        MPModel --> SelfHost["public/models/face_landmarker.task<br/>fetched once via scripts/prepare-models.mjs"]
        SelfHost --> BrowserLoad["Loaded client-side at runtime<br/>FilesetResolver + WASM, GPU-delegate first"]
    end

    subgraph TrackBModels["Track B — mostly pretrained, one model actually trained here"]
        direction TB
        DlibModel["dlib shape_predictor_68_face_landmarks.dat<br/>pretrained, fetched<br/>NOT trained in this repo"]
        ArcFaceModel["ONNX ArcFace ResNet100 INT8<br/>pretrained, fetched<br/>NOT trained in this repo"]

        Synth["tinyml/generate_synthetic_ear_dataset.py<br/>synthetic EAR windows"] --> Train["tinyml/train_blink_classifier.py<br/>Keras dense net — actually trained here"]
        Train --> Quant[INT8 TFLite quantization]
        Quant --> CArray[tinyml/convert_to_c_array.py]
        CArray --> Header["firmware/include/model_data.h<br/>generated C array"]
        Header --> Firmware[Compiled into ESP32 firmware]
    end
```

The blink classifier is the one model in this repository actually trained
from data here (synthetic, by design — see `tinyml/generate_synthetic_ear_dataset.py`).
Everything else — MediaPipe's landmarker, dlib's predictor, the ONNX ArcFace
model — is a pretrained artifact fetched from its public source, not
something this repo claims to have trained.
