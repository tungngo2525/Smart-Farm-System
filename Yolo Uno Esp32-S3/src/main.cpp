#include <Arduino.h>
#include <WiFi.h>
#include <Arduino_MQTT_Client.h>
#include <OTA_Firmware_Update.h>
#include <ThingsBoard.h>
#include <Shared_Attribute_Update.h>
#include <Attribute_Request.h>
#include <Espressif_Updater.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/timers.h>
#include <ESP32Servo.h>
#include <esp_now.h>
extern "C" {
  #include "esp_wifi.h"
}

#define CONFIG_THINGSBOARD_ENABLE_DEBUG true
constexpr char CURRENT_FIRMWARE_TITLE[] = "OTA";
constexpr char CURRENT_FIRMWARE_VERSION[] = "1.0";
constexpr uint8_t FIRMWARE_FAILURE_RETRIES = 12U;
constexpr uint16_t FIRMWARE_PACKET_SIZE = 4096U;
constexpr uint8_t MAX_ATTRIBUTES = 1U;
constexpr std::array<const char*, MAX_ATTRIBUTES> SHARED_ATTRIBUTES = {
  "ledState"
};
constexpr uint16_t MAX_MESSAGE_SEND_SIZE = 256U;
constexpr uint16_t MAX_MESSAGE_RECEIVE_SIZE = 256U;
constexpr uint64_t REQUEST_TIMEOUT_MICROSECONDS = 10000U * 1000U;

const uint8_t peerMac[6] = {0x10, 0x06, 0x1C, 0xB5, 0xC2, 0x48};
const int ledPin = 10;
const int buttonPin = 9;

typedef struct {
  bool ledOn;
} Message;

Message msg;
bool lastButtonState = HIGH;
bool ledState = false;

TaskHandle_t TaskSensorHandle = NULL;
TaskHandle_t OTATaskHandle = NULL;
TaskHandle_t ButtonTaskHandle = NULL;
TimerHandle_t ledSchedulerTimer = NULL;

constexpr char WIFI_SSID[] = "shy";
constexpr char WIFI_PASSWORD[] = "12345678";
constexpr char TOKEN[] = "hEuhTIpi2zGCKytCHtsu";
constexpr char THINGSBOARD_SERVER[] = "app.coreiot.io";
constexpr uint16_t THINGSBOARD_PORT = 1883U;

WiFiClient wifiClient;
Arduino_MQTT_Client mqttClient(wifiClient);
OTA_Firmware_Update<> ota;
Shared_Attribute_Update<1U, MAX_ATTRIBUTES> shared_update;
Attribute_Request<2U, MAX_ATTRIBUTES> attr_request;
const std::array<IAPI_Implementation*, 3U> apis = {
    &shared_update,
    &attr_request,
    &ota
};
ThingsBoard tb(mqttClient, MAX_MESSAGE_RECEIVE_SIZE, MAX_MESSAGE_SEND_SIZE, Default_Max_Stack_Size, apis);
Espressif_Updater<> updater;

const int soilMoisturePin = A2;
const int waterLevelPin = A3;
const int relayPin = 17;
Servo myServo;
const int servoPin = 16;

const int sensorMax = 4095;
const int sensorMin = 0;

bool shared_update_subscribed = false;
bool currentFWSent = false;
bool updateStarted = false;
bool updateSubscribed = false;
bool requestedShared = false;
bool isUpdating = false;

struct Schedule {
  int onHour;
  int onMinute;
  int offHour;
  int offMinute;
  bool enabled;
} ledSchedule = {0, 0, 0, 0, false};

void ledSchedulerCallback(TimerHandle_t xTimer) {
  unsigned long currentMillis = millis();
  static unsigned long dayMillis = 24 * 60 * 60 * 1000; // 1 day
  unsigned long currentTimeInDay = currentMillis % dayMillis;
  int currentHour = (currentTimeInDay / (60 * 60 * 1000));
  int currentMinute = (currentTimeInDay / (60 * 1000)) % 60;

  if (ledSchedule.enabled) {
    if (currentHour == ledSchedule.onHour && currentMinute == ledSchedule.onMinute) {
      ledState = true;
      digitalWrite(ledPin, HIGH);
      Serial.println("Scheduler: LED ON");
      msg.ledOn = true;
      esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
      tb.sendAttributeData("ledState", ledState);
    } else if (currentHour == ledSchedule.offHour && currentMinute == ledSchedule.offMinute) {
      ledState = false;
      digitalWrite(ledPin, LOW);
      Serial.println("Scheduler: LED OFF");
      msg.ledOn = false;
      esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
      tb.sendAttributeData("ledState", ledState);
    }
  }
}

void requestTimedOut() {
  Serial.println("Attribute request timed out.");
}

void update_starting_callback() {
  Serial.println("Starting firmware update...");
  isUpdating = true;
}

void finished_callback(const bool &success) {
  isUpdating = false;
  if (success) {
    Serial.println("Firmware update completed. Rebooting...");
    esp_restart();
  } else {
    Serial.println("Firmware update failed.");
  }
}

void progress_callback(const size_t current, const size_t &total) {
  Serial.printf("Progress: %.2f%%\n", static_cast<float>(current * 100U) / total);
}

void processSharedAttributeUpdate(const JsonObjectConst &data) {
  const size_t jsonSize = Helper::Measure_Json(data);
  char buffer[jsonSize];
  serializeJson(data, buffer, jsonSize);
  Serial.print("Shared attributes updated: ");
  Serial.println(buffer);

  if (data.containsKey("ledState")) {
    ledState = data["ledState"].as<bool>();
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    Serial.printf("LED set to %s via shared attribute\n", ledState ? "ON" : "OFF");
    msg.ledOn = ledState;
    esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
  }
}

void processSharedAttributeRequest(const JsonObjectConst &data) {
  const size_t jsonSize = Helper::Measure_Json(data);
  char buffer[jsonSize];
  serializeJson(data, buffer, jsonSize);
  Serial.print("Shared attributes received: ");
  Serial.println(buffer);
}

int readAnalogAverage(int pin, int samples = 5, int delayMs = 10) {
  long total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(pin);
    vTaskDelay(pdMS_TO_TICKS(delayMs));
  }
  return total / samples;
}

void reconnectMQTT() {
  unsigned long startTime = millis();
  while (!tb.connected() && millis() - startTime < 10000) {
    Serial.printf("Connecting to ThingsBoard (%s) with token (%s)...\n", THINGSBOARD_SERVER, TOKEN);
    if (tb.connect(THINGSBOARD_SERVER, TOKEN, THINGSBOARD_PORT)) {
      Serial.println("Connected to ThingsBoard");

      if (!requestedShared) {
        Serial.println("Requesting shared attributes...");
        const Attribute_Request_Callback<MAX_ATTRIBUTES> sharedCallback(&processSharedAttributeRequest, REQUEST_TIMEOUT_MICROSECONDS, &requestTimedOut, SHARED_ATTRIBUTES);
        requestedShared = attr_request.Shared_Attributes_Request(sharedCallback);
        if (!requestedShared) {
          Serial.println("Failed to request shared attributes");
        }
      }

      if (!shared_update_subscribed) {
        Serial.println("Subscribing for shared attribute updates...");
        const Shared_Attribute_Callback<MAX_ATTRIBUTES> callback(&processSharedAttributeUpdate, SHARED_ATTRIBUTES);
        if (shared_update.Shared_Attributes_Subscribe(callback)) {
          Serial.println("Subscribe done");
          shared_update_subscribed = true;
        } else {
          Serial.println("Failed to subscribe for shared attribute updates");
        }
      }
    } else {
      Serial.println("Failed to connect to ThingsBoard");
      vTaskDelay(pdMS_TO_TICKS(1000));
    }
  }
  if (!tb.connected()) {
    Serial.println("MQTT reconnection timed out");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String message = String((char*)payload);
  Serial.printf("RPC received: %s\n", message.c_str());

  if (message.indexOf("\"method\":\"setServoAngle\"") >= 0) {
    int angleStart = message.indexOf("\"params\":") + 9;
    int angle = message.substring(angleStart).toInt();
    angle = constrain(angle, 0, 180);
    myServo.write(angle);
    Serial.printf("Servo rotated to %d degrees\n", angle);
  }
  else if (message.indexOf("\"method\":\"setLed\"") >= 0) {
    int stateStart = message.indexOf("\"state\":") + 8;
    String stateStr = message.substring(stateStart, message.indexOf("}", stateStart));
    ledState = (stateStr == "true");
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    Serial.printf("LED set to %s\n", ledState ? "ON" : "OFF");
    msg.ledOn = ledState;
    esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
    tb.sendAttributeData("ledState", ledState);
  }
  else if (message.indexOf("\"method\":\"setLedSchedule\"") >= 0) {
    int paramsStart = message.indexOf("\"params\":") + 9;
    String params = message.substring(paramsStart);
    int onTimeStart = params.indexOf("\"onTime\":\"") + 10;
    int offTimeStart = params.indexOf("\"offTime\":\"") + 11;
    String onTime = params.substring(onTimeStart, params.indexOf("\"", onTimeStart));
    String offTime = params.substring(offTimeStart, params.indexOf("\"", offTimeStart));

    ledSchedule.onHour = onTime.substring(0, onTime.indexOf(":")).toInt();
    ledSchedule.onMinute = onTime.substring(onTime.indexOf(":") + 1).toInt();
    ledSchedule.offHour = offTime.substring(0, offTime.indexOf(":")).toInt();
    ledSchedule.offMinute = offTime.substring(offTime.indexOf(":") + 1).toInt();
    ledSchedule.enabled = true;

    Serial.printf("Schedule set: ON at %02d:%02d, OFF at %02d:%02d\n",
                  ledSchedule.onHour, ledSchedule.onMinute,
                  ledSchedule.offHour, ledSchedule.offMinute);
  }
}

void ButtonTask(void *pvParameters) {
  while (true) {
    bool buttonState = digitalRead(buttonPin);

    if (lastButtonState == HIGH && buttonState == LOW) {
      ledState = !ledState;
      msg.ledOn = ledState;
      esp_err_t result = esp_now_send(peerMac, (uint8_t *)&msg, sizeof(msg));
      if (result == ESP_OK) Serial.print("Send LED ");
      else Serial.print("Send fail LED ");
      Serial.println(ledState ? "ON" : "OFF");

      digitalWrite(ledPin, ledState ? HIGH : LOW);
      tb.sendAttributeData("ledState", ledState);
      vTaskDelay(pdMS_TO_TICKS(50)); // Debounce
    }

    lastButtonState = buttonState;
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void TaskSensor(void *pvParameters) {
  while (true) {
    if (!tb.connected()) {
      reconnectMQTT();
    }
    tb.loop();

    int rawSoil = readAnalogAverage(soilMoisturePin);
    int rawWater = readAnalogAverage(waterLevelPin);

    int soilPercent = map(rawSoil, sensorMax, sensorMin, 100, 0);
    soilPercent = constrain(soilPercent, 0, 100);

    int waterPercent = map(rawWater, sensorMin, sensorMax, 0, 100);
    waterPercent = constrain(waterPercent, 0, 100);

    Serial.printf("Soil Moisture: %d%%, Water Level: %d%%\n", soilPercent, waterPercent);

    if (waterPercent < 50) {
      digitalWrite(relayPin, HIGH);
      Serial.println("Pump ON");
    } else {
      digitalWrite(relayPin, LOW);
      Serial.println("Pump OFF");
    }

    tb.sendTelemetryData("soilmoisture", soilPercent);
    tb.sendTelemetryData("waterlevel", waterPercent);

    vTaskDelay(pdMS_TO_TICKS(3000));
    yield();
  }
}

void OTATask(void *pvParameters) {
  for (;;) {
    if (tb.connected() && !isUpdating) {
      if (!currentFWSent) {
        currentFWSent = ota.Firmware_Send_Info(CURRENT_FIRMWARE_TITLE, CURRENT_FIRMWARE_VERSION);
        if (currentFWSent) {
          Serial.println("Firmware info sent: " + String(CURRENT_FIRMWARE_TITLE) + " v" + String(CURRENT_FIRMWARE_VERSION));
        }
      }

      if (!updateStarted) {
        Serial.println("Checking for firmware update...");
        const OTA_Update_Callback callback(CURRENT_FIRMWARE_TITLE, CURRENT_FIRMWARE_VERSION, &updater, &finished_callback, &progress_callback, &update_starting_callback, FIRMWARE_FAILURE_RETRIES, FIRMWARE_PACKET_SIZE);
        updateStarted = ota.Start_Firmware_Update(callback);
        if (updateStarted && !updateSubscribed) {
          Serial.println("Firmware update subscription...");
          updateSubscribed = ota.Subscribe_Firmware_Update(callback);
        }
      }
    }
    #if CONFIG_THINGSBOARD_ENABLE_DEBUG
    Serial.printf("OTATask - Free heap: %d bytes\n", ESP.getFreeHeap());
    #endif
    vTaskDelay(30000 / portTICK_PERIOD_MS);
  }
}

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

  ledState = msgRecv.ledOn;
  digitalWrite(ledPin, ledState ? HIGH : LOW);
  tb.sendAttributeData("ledState", ledState);
}

void setup() {
  Serial.begin(115200);

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  pinMode(soilMoisturePin, INPUT);
  pinMode(waterLevelPin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(buttonPin, INPUT_PULLUP);

  myServo.attach(servoPin);
  myServo.write(0);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  unsigned long wifiConnectStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiConnectStart < 15000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi connection failed, retrying in 5s...");
    delay(5000);
    ESP.restart();
  }
  Serial.println("\nWiFi connected!");

  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed, retrying in 5s...");
    delay(5000);
    ESP.restart();
  }

  esp_now_register_send_cb(OnDataSent);
  esp_now_register_recv_cb(OnDataRecv);

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, peerMac, 6);
  peerInfo.channel = 1;
  peerInfo.encrypt = false;
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer, retrying in 5s...");
    delay(5000);
    ESP.restart();
  }
  Serial.println("ESP-NOW Initialized and Ready");

  ledSchedulerTimer = xTimerCreate("LedScheduler", pdMS_TO_TICKS(60000), pdTRUE, (void*)0, ledSchedulerCallback);
  if (ledSchedulerTimer == NULL) {
    Serial.println("Failed to create LED scheduler timer");
    while (true);
  }
  xTimerStart(ledSchedulerTimer, 0);

  xTaskCreate(TaskSensor, "TaskSensor", 4096, NULL, 2, &TaskSensorHandle);
  xTaskCreate(OTATask, "OTATask", 8192, NULL, 1, &OTATaskHandle);
  xTaskCreate(ButtonTask, "ButtonTask", 4096, NULL, 2, &ButtonTaskHandle);
}

void loop() {
  // Empty loop
}