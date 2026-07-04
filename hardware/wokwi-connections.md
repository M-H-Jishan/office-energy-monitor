# Hardware Schematic — Wokwi (ESP32)

A minimal Wokwi simulation showing **one representative room** (2 fans + 3 lights = 5 devices), as allowed by the problem statement. Only Wokwi-available parts are used.

---

## Components Needed (Wokwi)

| # | Component | Wokwi Part | Quantity | Notes |
|---|-----------|------------|----------|-------|
| 1 | ESP32 DevKit V1 | `board-esp32-devkit-v1` | 1 | Microcontroller with WiFi |
| 2 | Relay Module | `wokwi-relay-module` | 5 | One per device |
| 3 | LED (Blue) | `wokwi-led` | 2 | Simulates fans |
| 4 | LED (Yellow) | `wokwi-led` | 3 | Simulates lights |
| 5 | Push Button | `wokwi-pushbutton` | 1 | Manual override (toggle Fan 1) |
| 6 | I2C LCD 16×2 | `wokwi-lcd1602` | 1 | Live status display |
| 7 | 220Ω Resistor | `wokwi-resistor` | 5 | For LEDs |
| 8 | 10kΩ Resistor | `wokwi-resistor` | 1 | Pull-down for button |
| 9 | Breadboard | `breadboard` | 1 | For connections |

---

## Pin Mapping Table

| ESP32 Pin | Connected To | Purpose |
|-----------|-------------|---------|
| GPIO 23 | Relay 1 IN | Control Fan 1 |
| GPIO 5  | Relay 2 IN | Control Fan 2 |
| GPIO 4  | Relay 3 IN | Control Light 1 |
| GPIO 19 | Relay 4 IN | Control Light 2 |
| GPIO 18 | Relay 5 IN | Control Light 3 |
| GPIO 26 | Button → 3V3 | Toggle Fan 1 (manual override) |
| GPIO 21 | LCD SDA (I2C) | LCD data line (default I2C SDA) |
| GPIO 22 | LCD SCL (I2C) | LCD clock line (default I2C SCL) |
| 3V3 | Button 3V3 | 3.3V for button |
| GND | All GND pins | Common ground |
| VIN (5V) | LCD VCC, Relay VCC, Relay COM | 5V supply |

---

## Wiring Connections (Step-by-Step)

### 1. Relay Modules (×5)

Each relay module has pins: `VCC`, `GND`, `IN`, `COM`, `NO` (Normally Open), `NC` (Normally Closed).

**For each relay:**
- `VCC` → ESP32 `VIN` (5V)
- `GND` → ESP32 `GND`
- `IN` → ESP32 GPIO pin (see pin mapping table)
- `COM` → ESP32 `VIN` (5V)
- `NO` → LED anode (via 220Ω resistor)

### 2. LEDs (×5) — Simulating Fans & Lights

- **2 Blue LEDs** = Fans (Relay 1 & 2)
- **3 Yellow LEDs** = Lights (Relay 3, 4 & 5)

For each LED:
- Anode (long leg) → 220Ω resistor → Relay `NO` terminal
- Cathode (short leg) → ESP32 `GND`

### 3. Push Button (×1) — Manual Override

- One leg → ESP32 `GPIO 26`
- Same GPIO → 10kΩ resistor → ESP32 `GND` (pull-down)
- Other leg → ESP32 `3V3`

When pressed: GPIO reads HIGH (3.3V). When released: GPIO reads LOW (0V via pull-down).

### 4. I2C LCD 16×2

- `SDA` → ESP32 `GPIO 21` (default I2C SDA)
- `SCL` → ESP32 `GPIO 22` (default I2C SCL)
- `VCC` → ESP32 `VIN` (5V)
- `GND` → ESP32 `GND`

---

## Power Flow Diagram

```
ESP32 VIN (5V)
    │
    ├── Relay COM (×5)
    │       │
    │       └── [Relay closed] ── 220Ω resistor ── LED Anode
    │                                              │
    │                                           LED (Fan/Light)
    │                                              │
    │                                         LED Cathode
    │                                              │
    └──────────────────────────────────────────── GND
```

---

## ESP32 Firmware Code

The following code goes into `main.cpp` in Wokwi. It:
1. Connects to WiFi (Wokwi-GUEST)
2. Controls relays (device on/off)
3. Displays status on LCD
4. Sends device data to the backend via HTTP POST

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi credentials — Wokwi built-in WiFi
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Backend API URL (change to your machine's IP)
const char* BACKEND_URL = "http://YOUR_IP:3000/api/devices";

// Pin definitions
const int RELAY_PINS[5] = {23, 5, 4, 19, 18};
const int BUTTON_PIN = 26;

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

  // Initialize button
  pinMode(BUTTON_PIN, INPUT);

  // Initialize LCD
  Wire.begin(21, 22); // Default ESP32 I2C pins: SDA=21, SCL=22
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
  // Check button for manual override (toggle Fan 1)
  if (digitalRead(BUTTON_PIN) == HIGH) {
    toggleDevice(0);
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

float calculatePower(int index) {
  if (!deviceStates[index]) return 0;
  // Return rated wattage (no current sensor in simulation)
  return DEVICE_WATTAGE[index];
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

1. Go to [wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)
2. The ESP32 board is already placed — keep it
3. Click the **"+" button** to add parts. Add:
   - 5× Relay Module (`wokwi-relay-module`)
   - 2× Blue LED (fans)
   - 3× Yellow LED (lights)
   - 1× Push Button
   - 1× LCD 1602 (I2C mode)
   - 5× 220Ω Resistor
   - 1× 10kΩ Resistor
   - 1× Breadboard
4. Wire everything according to the pin mapping table above
5. Paste the firmware code into `main.cpp`
6. Create a file `libraries.txt` with:
   ```
   LiquidCrystal_I2C
   ```
7. Click the **green play button** (▶) to start simulation
8. Press the push button to toggle Fan 1 on/off
9. The LCD shows active device count and total power
10. Save the project and copy the URL for your submission

---

## Electrical Reasoning

- **Relays** are used because ESP32 GPIO outputs 3.3V, but real devices (fans/lights) run on 220V AC. The relay acts as a switch controlled by the low-voltage ESP32.
- **LEDs** simulate the devices in Wokwi — blue for fans, yellow for lights. In a real deployment, these would be actual fans and light fixtures connected through the relay NO terminals.
- **Pull-down resistor** on the button ensures a clean LOW signal when not pressed, preventing floating pin issues.
- **I2C LCD** uses only 2 data pins (SDA=21, SCL=22), the ESP32's default I2C pins, conserving GPIO pins for relays.
- **No current sensor in simulation** — the problem statement says current sensing is optional. Power draw is reported as rated wattage (60W for fans, 15W for lights). In a real circuit, an ACS712 or similar sensor would be added in series with each device.
