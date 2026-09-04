<div align="center">

# 🛣️ DELIVIA

### AI-Powered On-Road Food Delivery & Route Intelligence Platform

**Zero-detour food delivery for moving highway traffic.**

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/PS%20ID-26205-blue)](#)
[![Category](https://img.shields.io/badge/Category-Software-green)]()
[![Theme](https://img.shields.io/badge/Theme-Transportation%20%26%20Logistics-lightgrey)]()
[![Status](https://img.shields.io/badge/status-prototype-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Built by Team VisionX** for Smart India Hackathon (PS 26205)

[Problem](#-the-problem) • [Solution](#-the-solution) • [Demo](#-running-locally) • [Architecture](#-technical-architecture) • [Team](#-team-visionx)

</div>

---

## 📌 The Problem

Millions of intercity travelers — car passengers, cab riders, and truck drivers — spend hours daily on Indian expressways with no real way to get fresh food without a **30–45 minute detour**.

Existing platforms (Swiggy, Zomato, etc.) are built for **static addresses**. They have no concept of a customer who is a *moving point on a highway*. That's the gap Delivia closes.

## 💡 The Solution

Delivia lets a traveler order from restaurants and dhabas **located along their forward route**, synchronizes food-prep time with the vehicle's live ETA, and coordinates a runner to complete a quick, safe hand-off at a pre-mapped pull-over point — all without the vehicle losing travel momentum.

```
Live Location + Route  →  AI Matching  →  Restaurant  →  Safe Hand-off Point
```

| Capability | How it works |
|---|---|
| 🛰️ **Dynamic Location** | Tracks the traveler's live/simulated GPS position |
| 🧭 **Route-Based Discovery** | Surfaces food options along the actual forward path, not just "nearby" |
| ⏱️ **ETA Synchronization** | Matches restaurant prep time to vehicle arrival time |
| 🤝 **Smart, Safe Hand-off** | Delivers only at pre-defined, zero-speed pull-over points — never to a moving vehicle |

### ⚠️ Safety is the core differentiator
Hand-offs **only** happen at fixed, pre-mapped safe locations (dhabas, fuel stations, toll lay-bys) and only below a defined safe speed threshold. The product never implies delivery to a vehicle in motion on a live carriageway.

---

## 🖥️ What's in this prototype

A single backend serves **four role-based web views** simulating the full order lifecycle:

| Role | View | What they do |
|---|---|---|
| 🚗 **Traveler** | Order & track | Pick a route, browse route-matched restaurants, place an order, watch the synced countdown |
| 🍳 **Restaurant** | Kitchen Display (KDS) | Sees incoming orders with vehicle ETA, confirms prep time, fires the ticket at the synced trigger |
| 🏃 **Runner** | Delivery ops | Picks up from restaurant, navigates to the hand-off point, confirms hand-off via OTP |
| 🛰️ **Admin** | Ops radar | Live multi-vehicle map, order table, exception overrides |

There's also a **3-in-1 Split View** that shows all three role views side by side for demo purposes.

> Real-time GPS is **simulated** — a slider/clock advances a vehicle marker along a hardcoded expressway polyline (e.g. Yamuna Expressway, Mumbai–Pune, Bengaluru–Mysuru) so the demo is reliable without needing an actual moving vehicle or paid map APIs.

---

## 🏗️ Technical Architecture

**Backend:** Python standard library `http.server` (`ThreadingHTTPServer`) — zero external dependencies, serves both the REST API and static frontend assets.

**Frontend:** Vanilla JS, HTML, CSS + Leaflet.js for maps (no framework/build step required).

**AI/ML components:**
- **ETA refinement model** — heuristic regression adjusting raw route ETA using speed, weather, toll delays, and lay-by deceleration overhead
- **Restaurant ranking model** — scores route-matched restaurants by distance-ahead, prep-time fit, and rating
- **Demand forecasting** — predicts order volume per hand-off point per hour

```
delivia/
├── server.py                  # Backend: REST API + static file server
├── test_endpoints.py          # Automated endpoint test suite
├── public/                    # Frontend (served by server.py)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js             # App shell + tick dispatcher
│       ├── state.js           # Shared state & event broadcast
│       ├── components/
│       │   └── map.js         # Leaflet map manager
│       ├── views/
│       │   ├── traveler.js
│       │   ├── restaurant.js
│       │   ├── runner.js
│       │   ├── admin.js
│       │   └── splitView.js
│       └── ml/
│           ├── etaModel.js
│           ├── rankerModel.js
│           └── forecastModel.js
└── docs/
    ├── prd.md                       # Full product requirements
    └── CHANGES_AND_REGULATION.md    # Audit log & engineering standards
```

> **Note:** This repo currently ships the backend (`server.py`, `test_endpoints.py`) and docs. The `public/` frontend folder referenced above and in `docs/CHANGES_AND_REGULATION.md` should be added alongside these files before running the server — see [Running Locally](#-running-locally).

### REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/routes` | Available expressway routes |
| `GET` | `/api/handoff-points` | Safe pull-over hand-off points |
| `GET` | `/api/restaurants` | Partner restaurants |
| `GET` | `/api/orders` | All orders |
| `GET` | `/api/orders/{id}` | Single order detail |
| `POST` | `/api/orders` | Place a new order |
| `PATCH` | `/api/orders/{id}/status` | Update order status |
| `GET` | `/api/ml/forecast` | Demand forecast |
| `POST` | `/api/ml/eta-refine` | AI-refined ETA calculation |

---

## 🚀 Running Locally

No dependencies to install — pure Python standard library.

```bash
# Clone the repo
git clone https://github.com/<your-username>/delivia.git
cd delivia

# Run the server (defaults to port 3000)
python server.py

# Or specify a port
python server.py 8080
```

Then open **http://localhost:3000** in your browser. All four role views are accessible from the home page.

### Running tests

```bash
python test_endpoints.py
```

---

## 🧭 Feasibility & Roadmap

**Feasible today:** existing GPS/Maps APIs, cloud-based order/route management, AI route matching.

**Known challenges:** GPS drift near hand-off points, highway connectivity gaps, prep-delay-induced missed handoffs.

**Mitigations:** continuous location + map-data fusion, offline-tolerant fallback tracking, ETA-based prep scheduling with real-time order updates.

**Market potential:** a genuinely new "in-transit economy" market segment with no direct incumbent — plus new high-volume revenue for highway restaurants that currently miss mobile transit customers entirely.

---

## 👥 Team VisionX

| Name | Role |
|---|---|
| **Affan Umar** | Backend & Frontend, Team Coordination |
| **Yumna Abidi** | AI/ML, Resources, Team Coordination |
| **Adeel Abbas** | GitHub, UI/UX |
| **Ritik** | Frontend, UI/UX |
| **Ali Tauseef** | Debugging & Testing |
| **Sayyed Tahzeeba** | Data Analyst, Resources |

---

## 📄 License

This project is submitted as part of Smart India Hackathon (SIH-PS 26205). See [LICENSE](LICENSE) for details.

---

<div align="center">
Made with 🛵 by <b>Team VisionX</b>
</div>
