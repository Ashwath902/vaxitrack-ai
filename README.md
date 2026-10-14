
# VaxiTrack AI — Intelligent Vaccine Cold-Chain Logistics & Excursion Monitoring

**VaxiTrack AI** is an enterprise-grade vaccine cold-chain monitoring dashboard designed for healthcare logistics coordinators, QA compliance directors, and cold-freight carriers. It actively monitors real-time temperature telemetry during transit, triggers rule-based excursion alerts, tracks synthetic GPS breadcrumbs, records verifiable custody transfers, and stages affected batches for authorized review.

---

## 🌟 Key Capabilities

### 1. Unified Operations Overview
- **KPI Metrics**: Total Monitored Shipments, Active Excursions, Cold-Chain Integrity Compliance Rate (%), Batches on Quarantine Hold, and Verified Custody Transfers.
- **Interactive Live Temperature Chart**: Built with **Recharts**, featuring configurable WHO standard safe envelope (2.0°C – 8.0°C), upper/lower excursion threshold markers, and live telemetry stream with shipment switcher.
- **Active In-Transit Shipments Summary**: Real-time telemetry indicators with direct links to GPS waypoint breadcrumbs and sensor history.

### 2. Live Shipments & Synthetic GPS Breadcrumbs
- Real-time temperature dials with status pills and battery/humidity monitoring.
- **Shipment Detail Modal**: Step-by-step synthetic GPS breadcrumb trail showing origin, intermediate airport cargo vaults, in-transit interstate reefer waypoints, and hospital intake depots.

### 3. Automated Rule-Based Excursions & Alerts
- Real-time detection when telemetry breaches safe limits (e.g., >8.0°C or <2.0°C).
- **Interactive Acknowledgment Flow**: Cold-chain operators can sign off incidents with custom operational notes and timestamps.
- Built-in protection against duplicate alert spam.

### 4. Vaccine Batch Inventory & QA Authorization
- Clear status tracking:
  - `In Transit`
  - `Within Range`
  - `Quarantined for Review` (Automated rule trigger on excursion)
  - `Released` (Authorized by QA Director)
- **Authorized QA Release Protocol**: Regulatory-compliant sign-off modal capturing stability justification, Mean Kinetic Temperature (MKT) budget compliance, and authorized reviewer name per SOP-704.

### 5. Digital Chain of Custody
- Cryptographic and biometric transfer ledger capturing sender, receiver, timestamp, checkpoint location, handoff temperature, and verification method.
- "Record New Handoff" action to simulate transfer events.

### 6. VaxiTrack AI Incident Copilot
- **Clearly Labeled AI Advisory**: Real-time incident synthesis and Mean Kinetic Temperature analysis.
- **Mandatory Clinical Safety Disclaimer**: Explicitly states that quarantine decisions are strictly rule-based and AI recommendations are operational only, without making clinical safety assumptions or declaring vaccines spoiled.
- **5-Step Standard Operating Procedure (SOP) Checklist** for rapid triage.
- Interactive prompt chips and dynamic chat assistant for cold-chain queries.

### 7. Interactive Demo Controls
- **"Simulate Temperature Excursion"**: Spikes temperature of shipment `SHP-8821` above 8°C, automatically trips the rule engine, logs a Critical Alert, shifts the shipment to excursion state, and flags batch `BT-MRNA-2026-08` for quarantine review.
- **"Reset Demo"**: Restores all pristine initial data, clears excursions, and resets batches.
- **"Safe Range Configurator"**: Modal to dynamically adjust the demo safe temperature envelope (default 2°C–8°C).
- **"Telemetry Toggle"**: Pause or resume live periodic background sensor fluctuations.

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18+) and npm

### Steps
1. Open a terminal in the project directory:
   ```bash
   cd "vaxitrack AI"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

5. To build for production:
   ```bash
   npm run build
   ```

---

## 🏗️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS Design System (Dark navy sidebar `#0B132B`, light workspace `#F8FAFC`, vibrant teal accents `#0D9488`, micro-animations)
- **Charts**: Recharts (AreaChart, ReferenceArea, ReferenceLine)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & JetBrains Mono (via Google Fonts)
- **Data Engine**: Reactive Synthetic Cold-Chain Telemetry Simulation Loop

