
# space_mission_planner(STELRIS)

An advanced mission planning and telemetry simulation dashboard for the NASA Space Launch System (SLS). Designed for Chief Flight Architects to model mission profiles, validate engineering constraints against ESD-30000, and simulate real-time telemetry downlinks.

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Visuals:** Lucide React (Iconography), HTML5 Canvas (Orbital Mechanics), Recharts (Telemetry Charts)
- **Intelligence:** Google Gemini API (gemini-3-flash-preview) for heuristic mission analysis and technical support.
- **Persistence:** Local Storage Persistence Layer (simulated SQLite/dbService) for offline mission profiles.
- **Routing:** React Router (HashRouter) for multi-module navigation.
- **Styling:** Adaptive Glassmorphism (Mesh Gradients, Backdrop Blurs) with full Dark/Light mode support.

## 🏛 Architecture

The application follows a modular "Mission Control" architecture:
- **Service Layer (`/services`):** Decentralized logic for AI processing (`geminiService`) and data persistence (`dbService`).
- **Context Layer (`/contexts`):** Global state management for Atmosphere (Theme) and User Security.
- **Interface Modules (`/components`):**
  - **Architect:** Strategic mission parameters and hardware matrix configuration.
  - **Maneuver Lab:** Physics-based canvas engine for trajectory modeling.
  - **Flight Recorder:** State-machine driven real-time telemetry simulation.
  - **Mission Assistant:** LLM-integrated support terminal.

## 🛠 Features

- **Mission Architect:** Configure SLS Block 1B/2 hardware, payload mass, and destination (LEO, Moon, Mars).
- **Go/No-Go Engine:** Automated validation of structural limits (4.1g axial) and trajectory energy (C3 = 15 km²/s² for Mars).
- **Maneuver Lab:** Visualize orbital eccentricity, periapsis/apoapsis, and planned Delta-V burns using a custom physics engine.
- **Flight Recorder:** High-fidelity telemetry simulation (1Hz) with real-time thermal and pressure monitoring.
- **Mission Assistant:** A technical support matrix powered by Gemini for instant ESD-30000 documentation retrieval.
- **Data Replay:** Archive system with CSV export capabilities for post-flight analysis.

## 📚 References

- **NASA ESD 30000:** Space Launch System Mission Planner’s Guide.
- **Artemis Program:** NASA’s sustainable lunar exploration protocols.
- **NASA-STD-5001:** Structural Design and Test Factors of Safety for Spaceflight Hardware.

---
*Developed for the next generation of deep space exploration.*

---


