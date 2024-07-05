#include <WiFi.h>               // Include the WiFi library for ESP32
#include <PubSubClient.h>       // Include the PubSubClient library for MQTT communication
#include <freertos/FreeRTOS.h>  // Include the FreeRTOS library for task management
#include <freertos/task.h>      // Include the FreeRTOS task library

// WiFi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// MQTT broker details
const char* mqtt_server = "your_MQTT_BROKER_IP";

// Initialize WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// Function to connect to WiFi
void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    // Begin WiFi connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    // Print WiFi connection details
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}
// Callback function for MQTT messages
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    // Print the payload
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
    // Process facial recognition data
    if (strcmp(topic, "facial/recognition") == 0) {
        payload[length] = '\0';  // Null-terminate the payload
        String message = String((char*)payload);
        
        // Take action based on facial recognition result
        if (message == "Verified") {
            Serial.println("Face Verified! Taking action...");
            // Implement actions like logging, triggering alarms, etc.
        } else {
            Serial.println("Face Not Verified.");
        }
    }
}

// Function to reconnect to the MQTT broker
void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        // Attempt to connect
        if (client.connect("ESP32Client")) {
            Serial.println("connected");
            client.subscribe("test/topic");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}
// FreeRTOS task for handling facial recognition data
void facialRecognitionTask(void * pvParameters) {
    for (;;) {
        // Reconnect to MQTT broker if disconnected
        if (!client.connected()) {
            reconnect();
        }

        // Handle MQTT client loop
        client.loop();
        
        // Delay for 100 ms
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
// Setup function
void setup() {
    Serial.begin(115200);
    setup_wifi();
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
}
// Main loop function
void loop() {
        // The main loop is left empty as tasks handle the functionality
    '''
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
    client.publish("test/topic", "Hello from ESP32");
    delay(2000);
    '''
}
