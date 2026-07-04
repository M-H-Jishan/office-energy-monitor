# Hardware Schematic — Wokwi (ESP32)

This document provides the complete wiring guide for building the office energy monitor circuit in [Wokwi](https://wokwi.com/). The schematic covers **one representative room** (2 fans + 3 lights = 5 devices), as allowed by the problem statement.

---

## Components Needed (Wokwi)

| # | Component | Quantity | Notes |
|---|-----------|----------|-------|
| 1 | ESP32 DevKit V1 | 1 | Microcontroller with WiFi |
| 2 | Relay Module (5V, 1-channel) | 5 | One per device (SRD-05VDC-SL-C) |
| 3 | ACS712 Current Sensor (5A) | 5 | One per device |
| 4 | LED (any color) | 3 | Simulates lights |
| 5 | DC Motor | 2 | Simulates fans |
| 6 | Push Button | 2 | Manual override |
| 7 | I2C LCD 16×2 | 1 | Live status display |
| 8 | 220Ω Resistor | 3 | For LEDs |
| 9 | 10kΩ Resistor | 2 | Pull-down for buttons |
| 10 | Breadboard + Jumper Wires | — | For connections |

---

## Pin Mapping Table

| ESP32 Pin | Connected To | Purpose |
|-----------|-------------|---------|
| GPIO 23 | Relay 1 IN | Control Fan 1 |
| GPIO 22 | Relay 2 IN | Control Fan 2 |
| GPIO 21 | Relay 3 IN | Control Light 1 |
| GPIO 19 | Relay 4 IN | Control Light 2 |
| GPIO 18 | Relay 5 IN | Control Light 3 |
| GPIO 34 | ACS712 #1 OUT | Read Fan 1 current (ADC1, input only) |
| GPIO 35 | ACS712 #2 OUT | Read Fan 2 current (ADC1, input only) |
| GPIO 32 | ACS712 #3 OUT | Read Light 1 current (ADC1) |
| GPIO 33 | ACS712 #4 OUT | Read Light 2 current (ADC1) |
| GPIO 25 | ACS712 #5 OUT | Read Light 3 current (ADC2) |
| GPIO 26 | Button 1 → 3V3 | Toggle Fan 1 (manual override) |
| GPIO 27 | Button 2 → 3V3 | Toggle Light 1 (manual override) |
| GPIO 16 | LCD SDA (I2C) | LCD data line |
| GPIO 17 | LCD SCL (I2C) | LCD clock line |
| 3V3 | Relay VCC, ACS712 VCC, Button 3V3 | 3.3V power |
| GND | All GND pins | Common ground |
| VIN (5V) | LCD VCC, Relay COM | 5V supply |

> **Note:** ESP32 GPIO 34 and 35 are input-only pins — perfect for ADC reads from ACS712 sensors.

---

## Wiring Connections (Step-by-Step)

### 1. Relay Modules (×5)

Each relay module has 6 pins: `VCC`, `GND`, `IN`, `COM`, `NO` (Normally Open), `NC` (Normally Closed).

**For each relay:**
- `VCC` → ESP32 `VIN` (5V)
- `GND` → ESP32 `GND`
- `IN` → ESP32 GPIO pin (see pin mapping table)
- `COM` → ESP32 `VIN` (5V) — this is the power that flows to the device when relay is active
- `NO` → Device positive terminal (LED anode via resistor, or DC motor +)
- Device negative → ESP32 `GND`

### 2. ACS712 Current Sensors (×5)

Each ACS712 has pins: `VCC`, `GND`, `OUT`, and two screw terminals `IP+` and `IP-` for current measurement.

**For each ACS712:**
- `VCC` → ESP32 `VIN` (5V)
- `GND` → ESP32 `GND`
- `OUT` → ESP32 ADC pin (see pin mapping table)
- `IP+` → Connect in series between Relay `NO` and Device positive
- `IP-` → Device positive terminal

> In Wokwi simulation, you can simplify by connecting the ACS712 `OUT` directly to the ESP32 ADC pin and using simulated values if the sensor model isn't available.

### 3. LEDs (×3) — Simulating Lights

For each LED:
- Anode (long leg) → 220Ω resistor → Relay `NO` terminal
- Cathode (short leg) → ESP32 `GND`

### 4. DC Motors (×2) — Simulating Fans

For each motor:
- Positive terminal → Relay `NO` terminal
- Negative terminal → ESP32 `GND`

### 5. Push Buttons (×2) — Manual Override

For each button:
- One leg → ESP32 GPIO pin (26 or 27)
- Same GPIO → 10kΩ resistor → ESP32 `GND` (pull-down)
- Other leg → ESP32 `3V3`

When pressed: GPIO reads HIGH (3.3V). When released: GPIO reads LOW (0V via pull-down).

### 6. I2C LCD 16×2

- `SDA` → ESP32 `GPIO 16`
- `SCL` → ESP32 `GPIO 17`
- `VCC` → ESP32 `VIN` (5V)
- `GND` → ESP32 `GND`
- `ADDR` → Leave unconnected (default 0x27)

---

## Power Flow Diagram

```
ESP32 VIN (5V)
    │
    ├── Relay COM (×5)
    │       │
    │       └── [Relay closed] ── ACS712 IP+ ── ACS712 IP- ── Device (+)
    │                                                            │
    │                                                       LED/Motor
    │                                                            │
    │                                                       Device (−)
    │                                                            │
    └──────────────────────────────────────────────────────── GND
```

---

## ESP32 Firmware Code

The following code goes into `main.cpp` in Wokwi. It:
1. Connects to WiFi
2. Controls relays (device on/off)
3. Reads ACS712 current sensors
4. Displays status on LCD
5. Sends data to the backend via HTTP POST

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend API URL
const char* BACKEND_URL = "http://YOUR_SERVER_IP:3000/api/devices";

// Pin definitions
const int RELAY_PINS[5] = {23, 22, 21, 19, 18};
const int ACS712_PINS[5] = {34, 35, 32, 33, 25};
const int BUTTON_PINS[2] = {26, 27};

// Device names
const char* DEVICE_NAMES[5] = {"Fan 1", "Fan 2", "Light 1", "Light 2", "Light 3"};
const char* DEVICE_TYPES[5] = {"fan", "fan", "light", "light", "light"};
const float DEVICE_WATTAGE[5] = {60.0, 60.0, 15.0, 15.0, 15.0};

// Device states
bool deviceStates[5] = {false, false, false, false, false};

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Timing
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);

  // Initialize relays
  for (int i = 0; i < 5; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);
  }

  // Initialize buttons
  for (int i = 0; i < 2; i++) {
    pinMode(BUTTON_PINS[i], INPUT);
  }

  // Initialize LCD
  Wire.begin(16, 17);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Office Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");

  // Connect to WiFi
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
  // Check buttons for manual override
  if (digitalRead(BUTTON_PINS[0]) == HIGH) {
    toggleDevice(0);
    delay(300); // Debounce
  }
  if (digitalRead(BUTTON_PINS[1]) == HIGH) {
    toggleDevice(2);
    delay(300); // Debounce
  }

  // Periodic update
  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = millis();
    sendDeviceData();
    updateLCD();
  }
}

void toggleDevice(int index) {
  deviceStates[index] = !deviceStates[index];
  digitalWrite(RELAY_PINS[index], deviceStates[index] ? HIGH : LOW);
  Serial.printf("Toggled %s: %s\n", DEVICE_NAMES[index],
                deviceStates[index] ? "ON" : "OFF");
}

float readCurrent(int pin) {
  int adcValue = analogRead(pin);
  // Convert ADC to voltage (ESP32: 0-4095 → 0-3.3V)
  float voltage = (adcValue / 4095.0) * 3.3;
  // ACS712: 2.5V = 0A, 185mV/A (for 5A version)
  float current = (voltage - 2.5) / 0.185;
  if (current < 0) current = 0;
  return current;
}

float calculatePower(int index) {
  if (!deviceStates[index]) return 0;
  float current = readCurrent(ACS712_PINS[index]);
  // Simulated 220V AC
  float power = 220.0 * current;
  // Fallback to rated wattage if reading is too low
  if (power < 1.0) power = DEVICE_WATTAGE[index];
  return power;
}

void sendDeviceData() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload
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

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.printf("Active: %d/5", onCount);
  lcd.setCursor(0, 1);
  lcd.printf("Power: %.0fW", totalPower);
}
```

---

## How to Build in Wokwi

1. Go to [wokwi.com](https://wokwi.com/) and create a new project
2. Select **ESP32** as the board
3. Add components from the parts library:
   - 5× Relay Module
   - 5× ACS712 (or use analog voltage sources as substitute)
   - 3× LED
   - 2× DC Motor
   - 2× Push Button
   - 1× I2C LCD 16×2
   - Resistors (220Ω ×3, 10kΩ ×2)
4. Wire everything according to the pin mapping table above
5. Paste the firmware code into `main.cpp`
6. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `BACKEND_URL` in the code
7. Start simulation

> **Wokwi Tip:** If ACS712 is not available in Wokwi's parts library, use a potentiometer connected to the ADC pins to simulate varying current readings.

---

## Electrical Reasoning

- **Relays** are used because ESP32 GPIO outputs 3.3V, but devices (fans/lights) in real life run on 220V AC. The relay acts as a switch controlled by the low-voltage ESP32.
- **ACS712** measures AC/DC current non-invasively. It outputs an analog voltage proportional to the current, which the ESP32 reads via its ADC.
- **Pull-down resistors** on buttons ensure a clean LOW signal when not pressed, preventing floating pin issues.
- **I2C LCD** uses only 2 data pins (SDA + SCL), conserving GPIO pins for relays and sensors.
- **GPIO 34/35** are input-only on ESP32 — ideal for ADC reads since they don't need to drive any output.
