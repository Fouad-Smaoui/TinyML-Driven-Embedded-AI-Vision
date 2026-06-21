"""Flask entrypoint for the Edge AI perception system.

Wires together: camera capture -> dlib landmark detection -> Kalman-smoothed
tracking -> ONNX face embedding -> cosine-similarity verification -> MQTT
publish -> MJPEG stream, while recording rolling performance metrics that
the Streamlit dashboard (dashboard/streamlit_app.py) polls via /metrics.
"""

import time

import cv2
from flask import Flask, Response, jsonify, render_template

from perception.capture import Camera
from perception.config import config
from perception.detection import FaceLandmarkDetector
from perception.embedding import FaceEmbedder
from perception.metrics import MetricsRecorder
from perception.mqtt_client import PerceptionPublisher
from perception.tracking import FaceTracker
from perception.verification import FaceVerifier

app = Flask(__name__)

detector = FaceLandmarkDetector(config.landmark_model_path)
embedder = FaceEmbedder(config.embedding_model_path, config.embedding_input_size)
verifier = FaceVerifier(config.enrolled_faces_path, config.verification_threshold)
tracker = FaceTracker()
metrics = MetricsRecorder(config.metrics_window_size)
publisher = PerceptionPublisher(
    broker_host=config.mqtt_broker_host,
    broker_port=config.mqtt_broker_port,
    verification_topic=config.mqtt_verification_topic,
    ear_topic=config.mqtt_ear_topic,
    enabled=config.mqtt_enabled,
)


def generate_frames():
    camera = Camera(config.camera_index)
    try:
        for frame in camera.frames():
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            t0 = time.perf_counter()
            faces = detector.detect(gray)
            detection_latency_ms = (time.perf_counter() - t0) * 1000.0

            embedding_latency_ms = 0.0

            for face in faces:
                rect = face.rect
                cx, cy = rect.left() + rect.width() / 2, rect.top() + rect.height() / 2
                tracker.predict()
                smoothed_x, smoothed_y = tracker.correct(cx, cy)

                for x, y in face.landmarks:
                    cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)

                half_w, half_h = rect.width() // 2, rect.height() // 2
                cv2.rectangle(
                    frame,
                    (int(smoothed_x) - half_w, int(smoothed_y) - half_h),
                    (int(smoothed_x) + half_w, int(smoothed_y) + half_h),
                    (0, 255, 0),
                    2,
                )

                t1 = time.perf_counter()
                embedding = embedder.embed(frame, face.landmarks)
                name, score = verifier.verify(embedding)
                embedding_latency_ms = (time.perf_counter() - t1) * 1000.0

                metrics.record_verification(name)
                publisher.publish_verification(name, score)
                publisher.publish_ear(face.ear)

                label = f"{name} ({score:.2f})"
                cv2.putText(
                    frame,
                    label,
                    (rect.left(), rect.top() - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (36, 255, 12),
                    2,
                )

            metrics.record_frame(detection_latency_ms, embedding_latency_ms)

            ok, jpeg = cv2.imencode(".jpg", frame)
            if not ok:
                continue
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n"
            )
    finally:
        camera.release()


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/metrics")
def metrics_endpoint():
    return jsonify(metrics.snapshot())


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host=config.flask_host, port=config.flask_port, debug=config.flask_debug)
