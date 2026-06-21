"""MQTT publisher for the perception app.

The original app.py connected and subscribed to "facial/recognition" but
never published anything, so the ESP32 firmware (which only subscribes)
never received a real event from the host. This client closes that loop:
it publishes the verification result and the live eye-aspect-ratio signal
that the ESP32's on-device blink classifier consumes.

Connection failures (e.g. no broker reachable, common when just running the
Flask app standalone without docker-compose) are logged and otherwise
non-fatal — perception keeps running without MQTT.
"""

import json
import logging

import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)


class PerceptionPublisher:
    def __init__(
        self,
        broker_host: str,
        broker_port: int,
        verification_topic: str,
        ear_topic: str,
        enabled: bool = True,
    ) -> None:
        self.verification_topic = verification_topic
        self.ear_topic = ear_topic
        self.enabled = enabled
        self.client: mqtt.Client | None = None

        if not enabled:
            return

        self.client = mqtt.Client()
        try:
            self.client.connect(broker_host, broker_port, keepalive=60)
            self.client.loop_start()
        except (ConnectionError, OSError) as exc:
            logger.warning("MQTT broker unreachable (%s) — continuing without MQTT", exc)
            self.client = None

    def publish_verification(self, name: str, score: float) -> None:
        if not self.client:
            return
        payload = json.dumps({"name": name, "score": round(score, 4)})
        self.client.publish(self.verification_topic, payload)

    def publish_ear(self, ear: float) -> None:
        if not self.client:
            return
        payload = json.dumps({"ear": round(ear, 4)})
        self.client.publish(self.ear_topic, payload)
