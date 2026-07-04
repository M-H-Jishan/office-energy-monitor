# Real Hardware Build Guide — Office Energy Monitor

This guide covers building the **physical circuit** (not Wokwi simulation). You'll wire real ESP32 hardware to relays, current sensors, LEDs, and DC motors to represent the 15 office devices.

---

## What to Buy (Shopping List)

| # | Component | Qty | Est. Price (BDT) | Notes |
|---|-----------|-----|------------------|-------|
| 1 | ESP32 DevKit V1 | 1 | 600–800 | WiFi-enabled microcontroller |
| 2 | 5V Relay Module (1-channel, active HIGH) | 5 | 80×5 = 400 | One per device (SRD-05VDC-SL-C) |
| 3 | ACS712 Current Sensor (5A version) | 5 | 150×5 = 750 | One per device |
| 4 | LED (any color, 5mm) | 3 | 5×3 = 15 | Simulates lights |
| 5 | 220Ω Resistor | 3 | 2×3 = 6 | For LEDs |
| 6 | DC Motor (3V–6V, small) | 2 | 50×2 = 100 | Simulates fans |
| 7 | Push Button (tactile, 4-pin) | 2 | 10×2 = 20 | Manual override |
| 8 | 10kΩ Resistor | 2 | 2×2 = 4 | Pull-down for buttons |
| 9 | I2C LCD 16×2 | 1 | 200–300 | Live status display |
| 10 | Breadboard (full size) | 1 | 150 | Or 2 medium breadboards |
| 11 | Jumper wires (M-M, M-F assortment) | 40+ | 100 | For all connections |
| 12 | 5V USB Power Supply (2A+) | 1 | 200 | Powers ESP32 + relays + motors |
| 13 | Multimeter | 1 | 300 | For debugging (optional but recommended) |

**Total estimated: ~2,500–3,000 BDT**

> You can buy these from:
> - **RoboTech BD** (robotechbd.com) — Dhaka
> - **TechShop BD** (techshopbd.com) — Dhaka
> - **STEMBD** (stembd.com) — online
> - **Amazon/AliExpress** — if you have time to wait

---

## Pin Mapping (Same as Wokwi)

| ESP32 Pin | Connected To | Purpose |
|-----------|-------------|---------|
| GPIO 23 | Relay 1 IN | Control Fan 1 |
| GPIO 22 | Relay 2 IN | Control Fan 2 |
| GPIO 21 | Relay 3 IN | Control Light 1 |
| GPIO 19 | Relay 4 IN | Control Light 2 |
| GPIO 18 | Relay 5 IN | Control Light 3 |
| GPIO 34 | ACS712 #1 OUT | Read Fan 1 current |
| GPIO 35 | ACS712 #2 OUT | Read Fan 2 current |
| GPIO 32 | ACS712 #3 OUT | Read Light 1 current |
| GPIO 33 | ACS712 #4 OUT | Read Light 2 current |
| GPIO 25 | ACS712 #5 OUT | Read Light 3 current |
| GPIO 26 | Button 1 | Toggle Fan 1 (manual) |
| GPIO 27 | Button 2 | Toggle Light 1 (manual) |
| GPIO 16 | LCD SDA | I2C data |
| GPIO 17 | LCD SCL | I2C clock |
| VIN (5V) | Relay VCC, LCD VCC | 5V supply |
| 3V3 | ACS712 VCC, Button 3V3 | 3.3V supply |
| GND | All GND pins | Common ground |

> **Note:** This covers **1 room** (5 devices). For all 3 rooms, you'd need 15 relays + 15 ACS712 sensors. For the hackathon demo, wiring 1 room is sufficient — the other 2 rooms are simulated in software.

---

## Step-by-Step Assembly

### Step 1: Set Up ESP32 on Breadboard

1. Place the ESP32 on the breadboard straddling the center gap
2. Connect USB power to ESP32 — confirm the power LED turns on
3. Install ESP32 board support in Arduino IDE:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Board Manager → Search "esp32" → Install

### Step 2: Wire the Relays (×5)

For each relay module:

```
Relay VCC  →  ESP32 VIN (5V)
Relay GND  →  ESP32 GND
Relay IN   →  ESP32 GPIO (23, 22, 21, 19, 18 respectively)
Relay COM  →  ESP32 VIN (5V) — power source for device
Relay NO   →  Device positive (LED anode via resistor / DC motor +)
Device (−) →  ESP32 GND
```

**Test each relay:**
```cpp
void setup() {
  pinMode(23, OUTPUT);
}
void loop() {
  digitalWrite(23, HIGH);  // Relay ON
  delay(2000);
  digitalWrite(23, LOW);   // Relay OFF
  delay(2000);
}
```
You should hear the relay "click" every 2 seconds.

### Step 3: Wire the ACS712 Current Sensors (×5)

For each ACS712:

```
ACS712 VCC  →  ESP32 VIN (5V)
ACS712 GND  →  ESP32 GND
ACS712 OUT  →  ESP32 ADC pin (34, 35, 32, 33, 25 respectively)
ACS712 IP+  →  Relay NO terminal (in series with device)
ACS712 IP−  →  Device positive terminal
```

**Test ACS712 reading:**
```cpp
void setup() {
  Serial.begin(115200);
}
void loop() {
  int adc = analogRead(34);
  float voltage = (adc / 4095.0) * 3.3;
  float current = (voltage - 2.5) / 0.185;  // 185mV/A for 5A version
  Serial.printf("ADC: %d, Voltage: %.2fV, Current: %.2fA\n", adc, voltage, current);
  delay(1000);
}
```
With no current flowing, you should see ~2.5V and ~0A.

### Step 4: Wire the LEDs (×3 — Simulating Lights)

```
Relay NO  →  220Ω resistor  →  LED Anode (long leg)
LED Cathode (short leg)  →  ESP32 GND
```

### Step 5: Wire the DC Motors (×2 — Simulating Fans)

```
Relay NO  →  DC Motor positive (+)
DC Motor negative (−)  →  ESP32 GND
```

> **Tip:** Add a small flyback diode (1N4007) across the motor terminals to protect against voltage spikes.

### Step 6: Wire the Push Buttons (×2)

For each button:
```
Button leg A  →  ESP32 GPIO (26 or 27)
GPIO pin      →  10kΩ resistor  →  ESP32 GND  (pull-down)
Button leg B  →  ESP32 3V3
```

When pressed: GPIO reads HIGH (3.3V)
When released: GPIO reads LOW (0V via pull-down)

### Step 7: Wire the I2C LCD 16×2

```
LCD SDA  →  ESP32 GPIO 16
LCD SCL  →  ESP32 GPIO 17
LCD VCC  →  ESP32 VIN (5V)
LCD GND  →  ESP32 GND
```

Install the LiquidCrystal_I2C library:
- Sketch → Include Library → Manage Libraries → Search "LiquidCrystal I2C" → Install

### Step 8: Upload the Full Firmware

Use the firmware code from `hardware/wokwi-connections.md` (the same code works on real ESP32). Update these variables:
- `WIFI_SSID` → your WiFi name
- `WIFI_PASSWORD` → your WiFi password
- `BACKEND_URL` → `http://<your-laptop-IP>:3000/api/devices`

> **Find your laptop IP:** Run `ip addr` or `ifconfig` on your laptop, look for your WiFi IP (e.g., `192.168.1.105`)

### Step 9: Test End-to-End

1. Start the Next.js server on your laptop: `npm run dev`
2. Power on the ESP32 — it should connect to WiFi and start sending data
3. Check the dashboard at `http://localhost:3000` — device states should update
4. Press buttons to toggle devices — dashboard should reflect changes
5. LCD should show active device count and total power

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ESP32 won't connect to WiFi | Check SSID/password; ensure 2.4GHz (ESP32 doesn't support 5GHz) |
| Relay not clicking | Check VCC is 5V (not 3.3V); check IN pin wiring |
| ACS712 reads garbage | Ensure VCC is 5V; calibrate zero point (may not be exactly 2.5V) |
| LCD shows nothing | Check I2C address — run I2C scanner sketch; may be 0x3F instead of 0x27 |
| POST to backend fails | Ensure laptop and ESP32 are on same WiFi; check IP address; check firewall |
| Devices don't appear on dashboard | The simulator may override ESP32 data; stop simulator or disable it |

---

## For the Hackathon Demo

Since wiring all 15 devices is impractical for a demo:

1. **Wire 1 room** (5 devices: 2 fans + 3 lights) with real hardware
2. **The other 2 rooms** are simulated by the software simulator
3. Both real and simulated data go to the same MySQL database
4. The dashboard and Discord bot show all 15 devices seamlessly
5. For the judges, you can point to the real circuit and say "this is one room, the other two are software-simulated using the same data pipeline"

This demonstrates the full system architecture without needing 15 relays and 15 sensors on a breadboard.
