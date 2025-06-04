#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <esp_now.h>

extern "C" {
  #include "esp_wifi.h"
}


constexpr char WIFI_SSID[] = "shy";
constexpr char WIFI_PASSWORD[] = "12345678";
constexpr char TOKEN[] = "hEuhTIpi2zGCKytCHtsu";
constexpr char THINGSBOARD_SERVER[] = "app.coreiot.io";
constexpr uint16_t THINGSBOARD_PORT = 1883U;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);


float temp = 0.0;
float humidity = 0.0;
float rainfall = 0.0;


TaskHandle_t TaskSensorHandle = NULL;
TaskHandle_t TaskButtonHandle = NULL;


const uint8_t peerMac[6] = {0xCC, 0xBA, 0x97, 0x0D, 0xEA, 0x10}; 
const int ledPin = 2;
const int buttonPin = 4;

typedef struct {
  bool ledOn;
} Message;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Success" : "Fail");
}

void OnDataRecv(const esp_now_recv_info_t* recv_info, const uint8_t* data, int len) {
  if (len != sizeof(Message)) return;
  Message msgRecv;
  memcpy(&msgRecv, data, sizeof(msgRecv));
  Serial.print("Received LED state: ");
  Serial.println(msgRecv.ledOn ? "ON" : "OFF");
  digitalWrite(ledPin, msgRecv.ledOn ? HIGH : LOW);
}


void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Kết nối MQTT...");
    if (mqttClient.connect("ESP32Client", TOKEN, NULL)) {
      Serial.println("Thành công!");
    } else {
      Serial.print("Lỗi: ");
      Serial.print(mqttClient.state());
      Serial.println(" - Thử lại sau 5s");
      delay(5000);
    }
  }
}

void TaskSensor(void *pvParameters) {
  uint8_t temp_bytes[4];
  uint8_t humidity_bytes[4];
  uint8_t rainfall_bytes[4];

  while (true) {
    if (!mqttClient.connected()) {
      reconnectMQTT();
    }
    mqttClient.loop();

    if (Serial2.available() >= 12) {
      for (int i = 0; i < 4; i++) temp_bytes[i] = Serial2.read();
      for (int i = 0; i < 4; i++) humidity_bytes[i] = Serial2.read();
      for (int i = 0; i < 4; i++) rainfall_bytes[i] = Serial2.read();

      memcpy(&temp, temp_bytes, sizeof(temp));
      memcpy(&humidity, humidity_bytes, sizeof(humidity));
      memcpy(&rainfall, rainfall_bytes, sizeof(rainfall));

      Serial.printf("Nhiệt độ: %.2f C, Độ ẩm: %.2f %%, Mưa: %.2f mm\n", temp, humidity, rainfall);

      char payload[150];
      snprintf(payload, sizeof(payload),
               "{\"temperature\": %.2f, \"humidity\": %.2f, \"rainfall\": %.2f}",
               temp, humidity, rainfall);

      if (mqttClient.publish("v1/devices/me/telemetry", payload)) {
        Serial.println("Gửi dữ liệu thành công.");
      } else {
        Serial.println("Gửi dữ liệu thất bại.");
      }
    }

    vTaskDelay(pdMS_TO_TICKS(3000));
  }
}


void TaskButton(void *pvParameters) {
  bool lastButtonState = HIGH;
  bool ledState = false;
  Message msg;

  while (true) {
    bool buttonState = digitalRead(buttonPin);

    if (lastButtonState == HIGH && buttonState == LOW) {
      ledState = !ledState;
      msg.ledOn = ledState;

      esp_err_t result = esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
      Serial.print(result == ESP_OK ? "Send LED " : "Send fail LED ");
      Serial.println(ledState ? "ON" : "OFF");

      vTaskDelay(pdMS_TO_TICKS(50));
    }

    lastButtonState = buttonState;
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}


void setup() {
  Serial.begin(9600);
  Serial2.begin(9600, SERIAL_8N1, 16, 17); 

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(buttonPin, INPUT_PULLUP);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi đã kết nối!");

  mqttClient.setServer(THINGSBOARD_SERVER, THINGSBOARD_PORT);

 
  WiFi.disconnect(); 
  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed");
    while (true);
  }

  esp_now_register_send_cb(OnDataSent);
  esp_now_register_recv_cb(OnDataRecv);

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, peerMac, 6);
  peerInfo.channel = 1;
  peerInfo.encrypt = false;
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    while (true);
  }

  Serial.println("ESP-NOW Initialized and Ready");

  // Tạo các FreeRTOS task
  xTaskCreate(TaskSensor, "SensorTask", 4096, NULL, 1, &TaskSensorHandle);
  xTaskCreate(TaskButton, "ButtonTask", 2048, NULL, 1, &TaskButtonHandle);
}


void loop() {
  // Không xử lý gì ở đây 
}
