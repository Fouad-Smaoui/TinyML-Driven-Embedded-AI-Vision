// ESP32 perception client.
//
// Subscribes to the two MQTT topics the Flask app (app.py / perception/
// mqtt_client.py) publishes:
//   - perception/verification : {"name": "...", "score": 0.xx}
//   - perception/ear          : {"ear": 0.xx}   (eye-aspect-ratio, per frame)
//
// The verification topic just drives status logging/an LED. The EAR topic
// feeds a tiny on-device TensorFlow Lite Micro classifier (model_data.h,
// trained by tinyml/train_blink_classifier.py from real, connected signal —
// not the original project's disconnected MNIST digit classifier) that
// classifies a 5-sample EAR window as blink / no-blink directly on the MCU.
//
// This replaces the original main.cpp, which had an invalid `'''`-wrapped
// block (not valid C++) and referenced an undefined `your_model_data`
// symbol, so it never compiled.

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/micro/micro_log.h"
#include "tensorflow/lite/schema/schema_generated.h"

#include "secrets.h"
#include "model_data.h"

constexpr int LED_PIN = 2;             // built-in LED on most ESP32 dev boards
constexpr int EAR_WINDOW_SIZE = 5;
constexpr int TENSOR_ARENA_SIZE = 4 * 1024;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

uint8_t tensorArena[TENSOR_ARENA_SIZE];
const tflite::Model* tfliteModel = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* modelInput = nullptr;
TfLiteTensor* modelOutput = nullptr;

float earWindow[EAR_WINDOW_SIZE] = {0};
int earWindowCount = 0;

void setupWifi() {
    Serial.printf("Connecting to %s", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("WiFi connected, IP: ");
    Serial.println(WiFi.localIP());
}

void setupBlinkClassifier() {
    tfliteModel = tflite::GetModel(g_blink_model_data);
    if (tfliteModel->version() != TFLITE_SCHEMA_VERSION) {
        Serial.println("Model schema version mismatch — aborting TinyML setup");
        return;
    }

    static tflite::MicroMutableOpResolver<3> resolver;
    resolver.AddFullyConnected();
    resolver.AddLogistic();
    resolver.AddReshape();

    static tflite::MicroInterpreter staticInterpreter(
        tfliteModel, resolver, tensorArena, TENSOR_ARENA_SIZE);
    interpreter = &staticInterpreter;

    if (interpreter->AllocateTensors() != kTfLiteOk) {
        Serial.println("Failed to allocate tensors for blink classifier");
        interpreter = nullptr;
        return;
    }
    modelInput = interpreter->input(0);
    modelOutput = interpreter->output(0);
}

// Quantizes a float EAR window into the model's expected int8 input and
// returns true if the model classifies it as a blink.
bool classifyBlink(const float window[EAR_WINDOW_SIZE]) {
    if (!interpreter) return false;

    const float inputScale = modelInput->params.scale;
    const int inputZeroPoint = modelInput->params.zero_point;
    for (int i = 0; i < EAR_WINDOW_SIZE; i++) {
        int8_t quantized = static_cast<int8_t>(
            window[i] / inputScale + inputZeroPoint);
        modelInput->data.int8[i] = quantized;
    }

    if (interpreter->Invoke() != kTfLiteOk) {
        Serial.println("Blink classifier inference failed");
        return false;
    }

    const float outputScale = modelOutput->params.scale;
    const int outputZeroPoint = modelOutput->params.zero_point;
    float blinkProbability =
        (modelOutput->data.int8[0] - outputZeroPoint) * outputScale;
    return blinkProbability > 0.5f;
}

void onMqttMessage(char* topic, uint8_t* payload, unsigned int length) {
    StaticJsonDocument<128> doc;
    if (deserializeJson(doc, payload, length) != DeserializationError::Ok) {
        return;
    }

    if (strcmp(topic, "perception/verification") == 0) {
        const char* name = doc["name"] | "Unknown";
        double score = doc["score"] | 0.0;
        Serial.printf("Verification: %s (%.2f)\n", name, score);
        digitalWrite(LED_PIN, strcmp(name, "Unknown") == 0 ? LOW : HIGH);

    } else if (strcmp(topic, "perception/ear") == 0) {
        double ear = doc["ear"] | 0.0;
        earWindow[earWindowCount % EAR_WINDOW_SIZE] = static_cast<float>(ear);
        earWindowCount++;

        if (earWindowCount >= EAR_WINDOW_SIZE && classifyBlink(earWindow)) {
            Serial.println("TinyML: blink detected on-device");
        }
    }
}

void reconnectMqtt() {
    while (!mqttClient.connected()) {
        Serial.print("Connecting to MQTT broker...");
        if (mqttClient.connect("ESP32PerceptionClient")) {
            Serial.println("connected");
            mqttClient.subscribe("perception/verification");
            mqttClient.subscribe("perception/ear");
        } else {
            Serial.printf("failed, rc=%d, retrying in 5s\n", mqttClient.state());
            delay(5000);
        }
    }
}

void mqttTask(void* pvParameters) {
    for (;;) {
        if (!mqttClient.connected()) {
            reconnectMqtt();
        }
        mqttClient.loop();
        vTaskDelay(50 / portTICK_PERIOD_MS);
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);

    setupWifi();
    setupBlinkClassifier();

    mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
    mqttClient.setCallback(onMqttMessage);

    xTaskCreate(mqttTask, "MqttTask", 8192, nullptr, 1, nullptr);
}

void loop() {
    // All work happens in mqttTask; nothing to do here.
}
