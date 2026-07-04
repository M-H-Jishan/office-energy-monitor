# High-Level System Diagram

The system diagram below shows the full flow of information from device state to both the web dashboard and Discord bot.

## Architecture Diagram (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650" font-family="Arial, sans-serif">
  <!-- Background -->
  <rect width="900" height="650" fill="#0a0a0a" rx="12"/>

  <!-- Title -->
  <text x="450" y="35" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">Office Energy Monitor — System Architecture</text>

  <!-- Layer 1: Hardware / ESP32 -->
  <rect x="50" y="70" width="200" height="100" fill="#1a1a2e" stroke="#4a4a6a" stroke-width="2" rx="8"/>
  <text x="150" y="100" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="bold">ESP32 + Sensors</text>
  <text x="150" y="120" text-anchor="middle" fill="#888" font-size="11">Relays × 5</text>
  <text x="150" y="138" text-anchor="middle" fill="#888" font-size="11">ACS712 × 5</text>
  <text x="150" y="156" text-anchor="middle" fill="#888" font-size="11">I2C LCD</text>

  <!-- Arrow: ESP32 → Simulator -->
  <line x1="150" y1="170" x2="150" y2="210" stroke="#4a4a6a" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="160" y="195" fill="#666" font-size="10">HTTP POST</text>

  <!-- Layer 2: Simulator -->
  <rect x="50" y="215" width="200" height="80" fill="#1a2a1a" stroke="#4a6a4a" stroke-width="2" rx="8"/>
  <text x="150" y="245" text-anchor="middle" fill="#86efac" font-size="14" font-weight="bold">Device Simulator</text>
  <text x="150" y="265" text-anchor="middle" fill="#888" font-size="11">Random toggles</text>
  <text x="150" y="280" text-anchor="middle" fill="#888" font-size="11">Usage logging</text>

  <!-- Arrow: Simulator → Database -->
  <line x1="250" y1="255" x2="350" y2="255" stroke="#4a6a4a" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="280" y="248" fill="#666" font-size="10">Prisma ORM</text>

  <!-- Layer 3: Database -->
  <rect x="355" y="200" width="190" height="110" fill="#2a1a1a" stroke="#6a4a4a" stroke-width="2" rx="8"/>
  <text x="450" y="230" text-anchor="middle" fill="#fca5a5" font-size="14" font-weight="bold">MySQL Database</text>
  <text x="450" y="255" text-anchor="middle" fill="#888" font-size="11">Room table</text>
  <text x="450" y="273" text-anchor="middle" fill="#888" font-size="11">Device table</text>
  <text x="450" y="291" text-anchor="middle" fill="#888" font-size="11">Alert table</text>
  <text x="450" y="309" text-anchor="middle" fill="#888" font-size="11">UsageLog table</text>

  <!-- Arrow: Database → API -->
  <line x1="545" y1="255" x2="640" y2="255" stroke="#6a4a4a" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="560" y="248" fill="#666" font-size="10">Queries</text>

  <!-- Layer 4: Backend API -->
  <rect x="645" y="180" width="210" height="150" fill="#1a1a3a" stroke="#4a4a8a" stroke-width="2" rx="8"/>
  <text x="750" y="210" text-anchor="middle" fill="#93c5fd" font-size="14" font-weight="bold">Next.js API</text>
  <text x="750" y="235" text-anchor="middle" fill="#888" font-size="11">/api/devices</text>
  <text x="750" y="253" text-anchor="middle" fill="#888" font-size="11">/api/rooms</text>
  <text x="750" y="271" text-anchor="middle" fill="#888" font-size="11">/api/usage</text>
  <text x="750" y="289" text-anchor="middle" fill="#888" font-size="11">/api/alerts</text>
  <text x="750" y="307" text-anchor="middle" fill="#888" font-size="11">/api/events (SSE)</text>

  <!-- Arrow: API → Dashboard (up-right) -->
  <path d="M 750 180 L 750 130 L 580 130" stroke="#4a4a8a" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  <text x="660" y="122" fill="#666" font-size="10">SSE Stream</text>

  <!-- Arrow: API → Discord Bot (down-right) -->
  <path d="M 750 330 L 750 390 L 580 390" stroke="#4a4a8a" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  <text x="660" y="382" fill="#666" font-size="10">DB Queries</text>

  <!-- Layer 5a: Web Dashboard -->
  <rect x="300" y="80" width="280" height="100" fill="#1a2a3a" stroke="#4a6a8a" stroke-width="2" rx="8"/>
  <text x="440" y="110" text-anchor="middle" fill="#67e8f9" font-size="14" font-weight="bold">Web Dashboard (React)</text>
  <text x="440" y="132" text-anchor="middle" fill="#888" font-size="11">Device Panel | Power Meter</text>
  <text x="440" y="150" text-anchor="middle" fill="#888" font-size="11">Alerts Panel | Floor Plan</text>
  <text x="440" y="168" text-anchor="middle" fill="#888" font-size="11">Real-time via SSE</text>

  <!-- Arrow: Dashboard → User -->
  <line x1="440" y1="80" x2="440" y2="50" stroke="#4a6a8a" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- User (Browser) -->
  <circle cx="440" cy="35" r="18" fill="#1a3a2a" stroke="#4a8a6a" stroke-width="2"/>
  <text x="440" y="40" text-anchor="middle" fill="#86efac" font-size="10">User</text>
  <text x="440" y="60" text-anchor="middle" fill="#666" font-size="9">Browser</text>

  <!-- Layer 5b: Discord Bot -->
  <rect x="300" y="370" width="280" height="100" fill="#3a1a3a" stroke="#8a4a8a" stroke-width="2" rx="8"/>
  <text x="440" y="400" text-anchor="middle" fill="#e879f9" font-size="14" font-weight="bold">Discord Bot (discord.js)</text>
  <text x="440" y="422" text-anchor="middle" fill="#888" font-size="11">!status | !room | !usage</text>
  <text x="440" y="440" text-anchor="middle" fill="#888" font-size="11">Gemini API (LLM)</text>
  <text x="440" y="458" text-anchor="middle" fill="#888" font-size="11">Proactive Alerts (Bonus)</text>

  <!-- Arrow: Bot → Gemini API -->
  <line x1="580" y1="420" x2="680" y2="420" stroke="#8a4a8a" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#arrow)"/>
  <rect x="680" y="400" width="120" height="45" fill="#2a2a2a" stroke="#555" stroke-width="1" rx="6"/>
  <text x="740" y="420" text-anchor="middle" fill="#ccc" font-size="11">Google Gemini</text>
  <text x="740" y="435" text-anchor="middle" fill="#888" font-size="10">API</text>

  <!-- Arrow: Bot → Discord -->
  <line x1="440" y1="470" x2="440" y2="510" stroke="#8a4a8a" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Discord Server -->
  <rect x="350" y="515" width="180" height="60" fill="#2a1a3a" stroke="#6a4a8a" stroke-width="2" rx="8"/>
  <text x="440" y="540" text-anchor="middle" fill="#e879f9" font-size="13" font-weight="bold">Discord Server</text>
  <text x="440" y="560" text-anchor="middle" fill="#888" font-size="11">Boss & Staff</text>

  <!-- Arrow: ESP32 → Backend (direct, for real hardware) -->
  <path d="M 150 170 L 150 400 L 300 400" stroke="#4a4a6a" stroke-width="1.5" stroke-dasharray="6" fill="none" marker-end="url(#arrow)"/>
  <text x="180" y="395" fill="#555" font-size="9">(real hardware path)</text>

  <!-- Arrow marker -->
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#666"/>
    </marker>
  </defs>

  <!-- Legend -->
  <rect x="50" y="510" width="250" height="120" fill="#111" stroke="#333" stroke-width="1" rx="6"/>
  <text x="60" y="530" fill="#888" font-size="11" font-weight="bold">Legend:</text>
  <line x1="60" y1="545" x2="90" y2="545" stroke="#666" stroke-width="2"/>
  <text x="95" y="549" fill="#888" font-size="10">Data flow</text>
  <line x1="60" y1="560" x2="90" y2="560" stroke="#666" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="95" y="564" fill="#888" font-size="10">Optional/Alt path</text>
  <rect x="60" y="575" width="12" height="12" fill="#1a2a1a" stroke="#4a6a4a" stroke-width="1" rx="2"/>
  <text x="78" y="585" fill="#888" font-size="10">Simulator layer</text>
  <rect x="60" y="595" width="12" height="12" fill="#2a1a1a" stroke="#6a4a4a" stroke-width="1" rx="2"/>
  <text x="78" y="605" fill="#888" font-size="10">Database (source of truth)</text>
</svg>
```

## Data Flow Summary

1. **ESP32** reads device states via relays and current via ACS712 sensors
2. **ESP32** sends HTTP POST to backend (or in demo mode, the **Simulator** generates data)
3. **Simulator** writes device states and usage logs to **MySQL** via Prisma
4. **Next.js API** reads from MySQL and serves:
   - REST endpoints (`/api/devices`, `/api/rooms`, `/api/usage`, `/api/alerts`)
   - SSE stream (`/api/events`) for real-time updates
5. **Web Dashboard** subscribes to SSE and fetches initial data from API
6. **Discord Bot** queries the same MySQL database and uses **Gemini API** for conversational responses
7. Both interfaces reflect the **same live data** from the single MySQL database

## Key Principle

> **Single source of truth**: The MySQL database is the shared backend. Both the web dashboard and Discord bot read from it, ensuring they always reflect the same reality.
