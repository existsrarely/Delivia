file:///c%3A/Users/Admin/Documents/VisionX/prd.md {"mtime":1788280601533,"ctime":1788280601533,"size":0,"etag":"3gjbml48l0","orphaned":false,"typeId":""}
# Product Requirements Document (PRD)

## Project: DELIVIA — AI-Powered On-Road Food Delivery & Route Intelligence Platform
**SIH Problem Statement ID:** 26205
**Team:** VisionX
**Version:** 1.0 (Hackathon Prototype Scope)
**Date:** September 2026

---

## 1. Executive Summary

Delivia is a route-intelligence food delivery platform that lets travelers on intercity highways (private car passengers, cab riders, truck drivers) order food from partner restaurants/dhabas located along their forward travel path, and receive it via a quick roadside hand-off at a designated safe pull-over point — without taking a long detour or losing significant travel time.

This document defines the scope for a **hackathon-stage clickable/functional prototype**, not the full production system. It is written to be handed to an AI coding agent (Antigravity) to scaffold and build the prototype end-to-end.

---

## 2. Problem Statement (Reference: SIH PS 26205)

The official problem statement asks for ideas addressing growing pressure on a city's resources, transport networks, and logistics infrastructure. Delivia addresses the **intercity highway logistics gap**: millions of commuters, cab travelers, and truck drivers spend hours on expressways daily with no access to fresh, on-demand food without stopping and losing 30–45 minutes per stop. Existing food delivery apps (Swiggy/Zomato-style) are built for **static addresses**, not moving vehicles.

---

## 3. Goals & Objectives

| Goal | Description |
|---|---|
| G1 | Allow a user traveling along a highway to discover restaurants located along their route (not just nearby a static pin). |
| G2 | Estimate vehicle ETA to each candidate restaurant/hand-off point using live location + route data. |
| G3 | Synchronize restaurant food-prep time with vehicle ETA so food is ready exactly when the vehicle arrives at the hand-off point. |
| G4 | Coordinate a runner to carry the order from the restaurant to a designated safe pull-over point and complete a fast hand-off. |
| G5 | Do all of this **safely** — hand-off only happens at zero/near-zero vehicle speed at a pre-mapped safe location, never to a vehicle in motion on live carriageway. |

### Non-Goals (Out of Scope for hackathon prototype)
- Real payment gateway integration (use mock payment flow).
- Real restaurant POS/kitchen printer integration (simulate with a dashboard).
- Real GPS hardware integration with commercial fleet systems.
- Production-grade user auth / KYC.
- Actual live traffic API billing-tier integration (use mocked/sample data or free-tier API with fallback mock data).

---

## 4. Target Users / Personas

1. **Traveler (Passenger)** — riding in a private car/cab, wants hot food without the driver stopping. Primary app user; places orders.
2. **Truck Driver** — long-haul driver, wants food without losing driving time; likely orders via voice or a companion passenger/co-driver.
3. **Restaurant/Dhaba Partner** — highway-side food outlet that receives route-matched orders and needs prep-time-synced kitchen tickets.
4. **Runner (Delivery Partner)** — stationed near a partner outlet, physically carries food to the roadside hand-off point and completes the exchange.
5. **Ops/Admin (Delivia internal)** — monitors live orders, hand-off status, exceptions, and partner network health.

---

## 5. Prototype Scope (What Antigravity Should Build)

Build a **web-based multi-role simulation prototype** (does not require a real mobile app or real GPS hardware) with 4 interfaces sharing one backend + database:

1. **Traveler Web App** (mobile-responsive) — order placement & live tracking
2. **Restaurant Dashboard** — incoming orders, prep timer, kitchen ticket
3. **Runner App View** — assigned hand-off tasks, navigation to pull-over point, "confirm hand-off" action
4. **Admin/Ops Dashboard** — live map of all active orders, vehicles, runners, and exceptions

All "real-time GPS" can be **simulated** — i.e., the traveler's app should let a user either (a) allow live browser geolocation, or (b) manually simulate movement along a preset route (e.g., a slider/play button that moves a marker along a hardcoded Delhi–Agra route polyline) so the demo is reliable without needing an actual moving vehicle.

---

## 6. Functional Requirements

### 6.1 Traveler Web App

| ID | Requirement |
|---|---|
| FR-1 | User selects/enters a route (origin + destination) or picks from preset demo routes (e.g., Delhi–Agra, Delhi–Lucknow, Mumbai–Pune). |
| FR-2 | System shows current/simulated live position on a map along the selected route. |
| FR-3 | System queries and displays a list of partner restaurants located within a configurable distance-ahead window along the forward path (e.g., next 20–40 km), each tagged with distance-ahead and estimated prep time. |
| FR-4 | User selects a restaurant and menu items, places an order. |
| FR-5 | System calculates: vehicle ETA to nearest safe hand-off point near that restaurant, and compares it against restaurant's estimated prep time. |
| FR-6 | System displays a synced countdown: "Your food will be ready and handed off in X minutes at [Hand-off Point Name]." |
| FR-7 | System sends live status updates: Order Placed → Preparing → Ready → Runner Assigned → Runner En Route to Pull-over → Arriving at Pull-over → Handed Off. |
| FR-8 | User receives a push/in-app alert 2–3 minutes before arrival at the hand-off point telling them which lane/side to pull into. |
| FR-9 | Mock payment step (dummy UPI/card screen, no real transaction). |
| FR-10 | Order history / receipt screen. |

### 6.2 Restaurant Dashboard

| ID | Requirement |
|---|---|
| FR-11 | Restaurant sees incoming orders in real time with vehicle's live ETA to the hand-off point. |
| FR-12 | Restaurant can input/confirm prep time per order; system recalculates the synced kitchen-ticket trigger time. |
| FR-13 | Simulated "auto-print kitchen ticket" event fires when (vehicle ETA − prep time) reaches zero, shown as a visual/audio alert in the dashboard. |
| FR-14 | Restaurant marks order "Ready" and hands to runner (button action), which updates traveler + runner views. |

### 6.3 Runner App View

| ID | Requirement |
|---|---|
| FR-15 | Runner sees assigned order with restaurant pickup point and destination pull-over/hand-off point on a map. |
| FR-16 | Runner marks "Picked up from restaurant" and "Arrived at pull-over point." |
| FR-17 | Runner marks "Hand-off complete" (with optional OTP/QR confirmation step for demo realism). |

### 6.4 Admin/Ops Dashboard

| ID | Requirement |
|---|---|
| FR-18 | Live map showing all active vehicles (simulated), restaurants, runners, and hand-off points with color-coded statuses. |
| FR-19 | Table/list view of all active orders with current stage and any delay/exception flags. |
| FR-20 | Manual override controls (reassign runner, cancel order, mark exception) for demo purposes. |

### 6.5 Safety & Hand-off Logic (Core Differentiator — Must Be Correctly Modeled)

| ID | Requirement |
|---|---|
| FR-21 | Hand-off points are **pre-defined, fixed safe locations** (dhabas, fuel stations, toll plaza lay-bys) stored in the database with lat/lng — never an arbitrary point on the live carriageway. |
| FR-22 | The system must never suggest or simulate a hand-off to a vehicle moving above a defined safe threshold speed (e.g., 0–5 km/h, i.e., stopped/crawling in a lay-by). Reflect this explicitly in UI copy: "Pull over safely at [Point] to receive your order" rather than any language implying delivery while driving at speed. |
| FR-23 | If the traveler's simulated vehicle does not reach the hand-off point within a tolerance window, order auto-reassigns to the next matching hand-off point ahead, with restaurant notified to hold/adjust. |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | ETA recalculation should refresh every 10–15 seconds (simulated tick) without visible lag. |
| Usability | Mobile-first responsive design for Traveler app (judges will likely view on a phone/tablet during demo). |
| Reliability (demo) | All simulated data flows must work fully offline / without dependency on paid APIs, with a fallback mock-data mode in case live API/network fails during the live demo. |
| Scalability (conceptual only) | Architecture should be described as horizontally scalable (stateless services + message queue) even if not implemented at hackathon stage — mention in tech design doc. |
| Accessibility | Basic contrast/legible font sizes; no strict WCAG compliance needed for prototype. |

---

## 8. Core User Flow (Happy Path)

1. Traveler opens app → selects/simulates route (e.g., Delhi–Agra).
2. App shows live/simulated position + list of route-matched restaurants ahead.
3. Traveler selects restaurant + items → places order (mock payment).
4. System computes ETA to nearest hand-off point vs. restaurant prep time → shows synced countdown.
5. Restaurant dashboard receives order, confirms prep time, "kitchen ticket" fires at the synced trigger time.
6. Runner is assigned, picks up food, moves to hand-off point (simulated).
7. Traveler gets "pull over in 2 minutes" alert.
8. Runner marks arrival; traveler simulated marker "stops" at hand-off point.
9. Runner marks "Hand-off complete" (with OTP/QR shown on traveler screen, scanned/entered by runner).
10. Order marked complete; feedback screen shown.

---

## 9. Technical Architecture (Recommended for Antigravity to Scaffold)

### 9.1 High-Level Architecture
- **Frontend:** React (Vite) + Tailwind CSS — 3 separate route-based views (Traveler, Restaurant, Runner) + Admin dashboard, all within one app using role-based routing for simplicity in a hackathon build (`/traveler`, `/restaurant`, `/runner`, `/admin`).
- **Backend:** Node.js + Express (or FastAPI/Python if the ML/ETA logic is Python-heavy) exposing REST APIs; WebSocket (Socket.IO) for real-time status/location push updates between traveler, restaurant, runner, and admin views.
- **Database:** PostgreSQL (or lightweight SQLite for hackathon) for orders, restaurants, hand-off points, users, runners. Optionally Redis for live location/ETA cache.
- **Maps/Routing:** Leaflet.js or Mapbox GL JS for map rendering; use a free routing/geocoding API (e.g., OpenRouteService, OSRM, or Google Maps JS API with a demo key) for route polylines and ETA; if API access is unavailable, fall back to a hardcoded polyline + linear interpolation for the "simulate movement" slider.
- **ML/AI Components (for "AI-powered" claim — must be real, not just buzzword):**
  1. **ETA refinement model** — simple regression/heuristic model adjusting raw routing-API ETA using historical/simulated traffic delay factors.
  2. **Restaurant ranking model** — ranks route-matched restaurants by a weighted score (distance-ahead, prep time fit, rating, cuisine match to user preference/history).
  3. **Demand forecasting (stretch goal)** — predicts likely order volume per hand-off point per hour using synthetic historical data, shown on Admin dashboard as a chart.

### 9.2 Suggested Folder Structure
```
delivia/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── traveler/
│   │   │   ├── restaurant/
│   │   │   ├── runner/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── services/ (API calls, socket client)
│   │   ├── data/ (mock routes, mock restaurants)
│   │   └── App.jsx
├── backend/
│   ├── src/
│   │   ├── routes/ (orders, restaurants, users, runners)
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── etaService.js
│   │   │   ├── matchingService.js (route-matching + ranking logic)
│   │   │   └── socketService.js
│   │   └── ml/
│   │       ├── eta_refine.py (or .js)
│   │       └── restaurant_ranker.py (or .js)
│   └── server.js
├── db/
│   └── schema.sql
└── README.md
```

### 9.3 Data Model (Core Entities)

**User**
- id, name, phone, role (traveler/restaurant/runner/admin)

**Route**
- id, origin, destination, polyline (array of lat/lng points)

**Restaurant**
- id, name, lat, lng, cuisine, avg_prep_time_minutes, rating, associated_handoff_point_id

**HandoffPoint**
- id, name (e.g., "Highway Dhaba, Km 45, NH-19"), lat, lng, type (dhaba/fuel station/toll plaza), safe_speed_threshold_kmph (default 5)

**Order**
- id, traveler_id, restaurant_id, handoff_point_id, items (json), status (enum: placed/preparing/ready/runner_assigned/en_route/arriving/handed_off/completed/cancelled), prep_time_minutes, eta_to_handoff_minutes, synced_trigger_time, created_at, updated_at

**Runner**
- id, name, current_lat, current_lng, status (available/assigned/en_route/completed), assigned_order_id

**VehiclePosition** (simulated live tracking)
- order_id, lat, lng, speed_kmph, timestamp

### 9.4 Key API Endpoints (Suggested)

```
POST   /api/routes/select              -> select/simulate a route
GET    /api/restaurants/along-route    -> params: route_id, current_position -> returns ranked list
POST   /api/orders                     -> create order
GET    /api/orders/:id                 -> get order status
PATCH  /api/orders/:id/status          -> update status (restaurant/runner actions)
POST   /api/orders/:id/eta-recalculate -> recompute ETA sync
GET    /api/handoff-points             -> list all safe hand-off points
POST   /api/runners/:id/assign         -> assign runner to order
WS     /socket -> events: position_update, order_status_update, eta_update
```

---

## 10. Success Metrics (For Judges / Demo Narrative)

| Metric | Target (conceptual, for pitch) |
|---|---|
| Time saved per food stop | 30–45 minutes vs. traditional highway stop |
| Hand-off accuracy window | Food ready within ±3 minutes of vehicle arrival at hand-off point |
| Restaurant onboarding potential | New revenue channel for highway dhabas/restaurants previously missing mobile transit customers |
| Safety compliance | 100% of hand-offs occur at zero/near-zero speed at pre-mapped safe points only |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Judges perceive hand-off as delivery-to-moving-vehicle (safety concern) | Explicit UI/pitch language: hand-off always at a safe stationary pull-over point; never in motion. |
| Live GPS/traffic API unavailable or rate-limited during demo | Build a robust offline "simulate route" fallback mode as the primary demo path. |
| "AI-powered" claim not backed by real ML | Implement at least the ETA-refinement and restaurant-ranking models with visible model logic/output in the demo, even if simplified. |
| Scope too large for hackathon timeframe | Strictly build only the 4 views + core happy-path flow first; treat ML depth, payments, and admin analytics as stretch goals. |

---

## 12. Team & Role Mapping (VisionX)

| Member | Role in Build |
|---|---|
| Affan Umar | Backend & Frontend, team coordination |
| Ritik | Frontend, UI/UX |
| Adeel Abbas | GitHub/version control, UI/UX |
| Yumna Abidi | AI/ML components, presentation/resources, team lead |
| Sayyed Tahzeeba | Data (mock datasets, analytics for admin dashboard) |
| Ali Tauseef | Debugging & testing |

---

## 13. Build Priority Order (Recommended for Antigravity)

1. Scaffold project structure (frontend + backend + db schema).
2. Seed mock data: 2–3 demo routes, 8–10 restaurants, 4–5 hand-off points.
3. Build Traveler flow: route selection → restaurant list → order placement → status tracking (with simulated movement slider).
4. Build Restaurant dashboard: incoming orders + prep timer + ready button.
5. Build Runner view: assignment + status updates.
6. Wire up WebSocket real-time sync across all three views.
7. Build Admin dashboard: live map + order table.
8. Add ETA-refinement + restaurant-ranking logic (ML layer).
9. Polish UI (use Delivia's brand colors: olive green, terracotta/salmon, cream background — matching the pitch deck theme).
10. Final end-to-end demo run-through + fallback/offline mode check.

---

## 14. Open Questions to Resolve Before/During Build

- Exact list of demo routes and real-world hand-off point names to use (for realism).
- Which routing/map API key is available (Google Maps, Mapbox, or OpenRouteService free tier)?
- Whether OTP/QR hand-off confirmation should be a stretch goal or core requirement for the demo.
- Final color palette / logo asset to reuse from the pitch deck for UI consistency.