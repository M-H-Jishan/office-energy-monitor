#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi — Wokwi built-in
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Backend API URL (change to your machine's IP)
const char* BACKEND_URL = "http://127.0.0.1:42571/api/devices";

// Pin definitions
const int RELAY_PINS[5] = {23, 5, 4, 19, 18};
const int BUTTON_PINS[5] = {26, 25, 27, 15, 14};
// Fan1=D26, Fan2=D25, Light1=D27, Light2=D15, Light3=D14

// Device info
const char* DEVICE_NAMES[5] = {"Fan 1", "Fan 2", "Light 1", "Light 2", "Light 3"};
const char* DEVICE_TYPES[5] = {"fan", "fan", "light", "light", "light"};
const float DEVICE_WATTAGE[5] = {60.0, 60.0, 15.0, 15.0, 15.0};

bool deviceStates[5] = {false, false, false, false, false};

LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 5000;

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < 5; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW); // npn: LOW = OFF (COM->NC)
  }

  for (int i = 0; i < 5; i++) {
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
  }

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Office Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.print("Connected!");
  delay(1000);
}

void loop() {
  static bool lastBtnState[5] = {HIGH, HIGH, HIGH, HIGH, HIGH};

  for (int i = 0; i < 5; i++) {
    bool btnState = digitalRead(BUTTON_PINS[i]);
    if (lastBtnState[i] == HIGH && btnState == LOW) {
      delay(10);
      btnState = digitalRead(BUTTON_PINS[i]);
      if (btnState == LOW) {
        toggleDevice(i);
        updateLCD();
      }
    }
    lastBtnState[i] = btnState;
  }

  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = millis();
    sendDeviceData();
    updateLCD();
  }
}

void toggleDevice(int index) {
  deviceStates[index] = !deviceStates[index];
  digitalWrite(RELAY_PINS[index], deviceStates[index] ? HIGH : LOW); // npn: HIGH=ON (COM->NO), LOW=OFF (COM->NC)
  Serial.printf("Toggled %s: %s\n", DEVICE_NAMES[index],
                deviceStates[index] ? "ON" : "OFF");
}

float calculatePower(int index) {
  if (!deviceStates[index]) return 0;
  return DEVICE_WATTAGE[index];
}

void sendDeviceData() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  String json = "[";
  for (int i = 0; i < 5; i++) {
    float power = calculatePower(i);
    json += "{";
    json += "\"name\":\"" + String(DEVICE_NAMES[i]) + "\",";
    json += "\"type\":\"" + String(DEVICE_TYPES[i]) + "\",";
    json += "\"status\":" + String(deviceStates[i] ? "true" : "false") + ",";
    json += "\"powerDraw\":" + String(DEVICE_WATTAGE[i]) + ",";
    json += "\"currentPower\":" + String(power, 2);
    json += "}";
    if (i < 4) json += ",";
  }
  json += "]";

  int responseCode = http.POST(json);
  Serial.printf("POST response: %d\n", responseCode);
  http.end();
}

void updateLCD() {
  int onCount = 0;
  float totalPower = 0;
  for (int i = 0; i < 5; i++) {
    if (deviceStates[i]) {
      onCount++;
      totalPower += calculatePower(i);
    }
  }

  // No lcd.clear() — it's slow on I2C. Just overwrite in place.
  lcd.setCursor(0, 0);
  lcd.printf("Active: %d/5   ", onCount);
  lcd.setCursor(0, 1);
  lcd.printf("Power: %.0fW   ", totalPower);
}
