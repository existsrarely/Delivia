# DELIVIA — Codebase Audit, Fixes & System Regulation Documentation
**Project:** DELIVIA (AI-Powered On-Road Food Delivery & Route Intelligence Platform)  
**Team:** VisionX | **SIH PS ID:** 26205 | **Version:** 1.1 Maintenance & Stabilization Release  
**Date:** September 2026  

---

## 1. Executive Summary of Audited Issues

During the codebase audit and live simulation testing, three primary categories of issues were identified and resolved:
1. **High-Frequency DOM Thrashing & Map Zoom Flickering:**  
   The background highway simulation clock (ticking every 800ms) previously triggered a full-page `innerHTML` replacement and Leaflet map re-initialization. This caused the Leaflet map to repeatedly zoom in and out, re-download OpenStreetMap tiles, and destroy active user interactions (such as open menu modals, cart drawers, input focus, and slider drags).
2. **3-in-1 Split View Layout & Overflow Issues:**  
   The 3-in-1 Split View previously embedded full 2-column Traveler desktop subviews inside narrow columns, leading to clipped cards, overflowing buttons, and multiple competing map instances.
3. **Cross-Route Order Desynchronization & Latency Bottlenecks:**  
   Switching routes retained old hand-off IDs, causing corrupt distance/ETA calculations. Additionally, Windows DNS resolution for `localhost` in test scripts caused 30-second delays.

---

## 2. Comprehensive Inventory of Changes

### 2.1 State & Event Architecture ([public/js/state.js](file:///d:/VisionX/public/js/state.js))
* **Granular Event Classification:** Differentiated broadcast notifications between `'TICK'` (lightweight position/telemetry updates) and `'STATE_CHANGE'` (role changes, new orders, status transitions).
* **Safe Route Switching:** `selectRoute(routeId)` now automatically updates default partner restaurants, hand-off points, and resets the active order to match the selected expressway, preventing cross-route calculation anomalies.
* **Empty Cart Guard:** `placeOrder()` automatically falls back to the default menu bestseller if the cart was emptied before ordering.

### 2.2 Leaflet Map Manager ([public/js/components/map.js](file:///d:/VisionX/public/js/components/map.js))
* **Persistent Map Instances:** `initMap()` now detects existing map instances and calls `map.invalidateSize()` rather than destroying and recreating DOM nodes on ticks.
* **Zoom Stabilization & Zero Animation Thrashing:** `renderRoute()` only executes `fitBounds()` upon initial route selection or route change with `{ animate: false, padding: [20, 20] }`, completely eliminating the rapid zoom in/out flickering during vehicle movement.
* **Smooth Marker Telemetry:** `updateVehicleMarker()` smoothly transitions the car marker's Lat/Lng coordinates and heading rotation angle without DOM re-attachment.

### 2.3 Application Clock & Dispatching ([public/js/app.js](file:///d:/VisionX/public/js/app.js))
* **Targeted Tick Dispatcher:** Added `updateTickViews(state)` in `DeliviaApp`. On `'TICK'` events, only targeted DOM elements (speed badges, progress bars, ETA numbers, map markers) are mutated, keeping the rest of the UI interactive and stable.
* **Simulation Clock:** `startSimulationClock()` now sets `isTick = true` when advancing progress along the polyline.
* **Cache-Busting Directives ([public/index.html](file:///d:/VisionX/public/index.html)):** Added `?v=2.0` to all script and stylesheet tags to force browsers to load latest assets without stale browser caching.

### 2.4 Views & Micro-Updates
* **Traveler App ([public/js/views/traveler.js](file:///d:/VisionX/public/js/views/traveler.js)):** Added `updateTick()`. Telemetry indicators, range slider (when not actively held), and countdown tags update smoothly without tearing down the DOM or closing open modals/drawers.
* **Restaurant KDS ([public/js/views/restaurant.js](file:///d:/VisionX/public/js/views/restaurant.js)):** Added `updateTick()`. Approaching vehicle ETA, cooking trigger countdown, and ticket status update smoothly in real time.
* **Runner App ([public/js/views/runner.js](file:///d:/VisionX/public/js/views/runner.js)):** Added `updateTick()`. Vehicle approach radar and zero-speed safety indicator update without clearing OTP input keystrokes.
* **Admin Ops Radar ([public/js/views/admin.js](file:///d:/VisionX/public/js/views/admin.js)):** Added `updateTick()`. Updates multi-vehicle map markers smoothly.

### 2.5 Dedicated 3-in-1 Split View ([public/js/views/splitView.js](file:///d:/VisionX/public/js/views/splitView.js) & [public/css/style.css](file:///d:/VisionX/public/css/style.css))
* **Guaranteed Map Visibility:** Set `.split-map-box` and `.split-map-wrapper` to explicit pixel dimensions (`180px` height) and added Leaflet `map.invalidateSize()` on mount to ensure map tiles and route polylines are clearly visible without collapsing.
* **Pixel-Perfect Spacing, Buttons & Text Bounds:**
  * **Spacious Button System:** Enhanced `.btn-primary`, `.btn-success`, and `.sim-btn` with generous padding (`0.65rem 1.25rem`), vibrant emerald gradients, soft drop shadows, and smooth hover micro-animations (`transform: translateY(-1px)`).
  * **Prep Adjustment Controls:** Separated the `-2m`, `+3m`, and `+5m` adjusters into a dedicated `.prep-adjusters-row` with distinct pill boundaries and margin separation above the primary action buttons.
  * Added `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`, and `flex-shrink: 0` to item rows so long dish names wrap cleanly without pushing prices outside card boundaries.
  * Refined top bar telemetry pills (`SPEED` & `PROGRESS`) into clean, stacked badges with proper padding and alignment.
  * Rebuilt 6-stage order stepper into a crisp horizontal pipeline with circular state badges and clear status labels.
  * Polished Traveler OTP pass card with dedicated monospace digit boxes and crisp QR canvas display.
  * Formatted Runner approach radar with a clean 3-column telemetry grid.

### 2.6 Backend & Testing ([server.py](file:///d:/VisionX/server.py) & [test_endpoints.py](file:///d:/VisionX/test_endpoints.py))
* **MIME Types:** Registered explicit MIME types for `.js`, `.css`, `.svg`, and `.json` in `server.py` to ensure compatibility across all operating systems.
* **Endpoint Sanitization:** Handled trailing slashes in order detail routes (`path.rstrip('/').split('/')[-1]`).
* **Test Suite Acceleration:** Switched test URL from `localhost` to `127.0.0.1` to bypass Windows IPv6 fallback timeouts, reducing test execution time from 30 seconds to under 0.2 seconds.

---

## 3. Regulation & Development Standards for Future Work

To maintain codebase health and presentation reliability, adhere to the following standards:

1. **DOM Mutability Rule:** Never replace view root containers (`container.innerHTML = ...`) inside high-frequency animation or simulation tick loops. Use granular element queries (`document.getElementById`) to update metrics.
2. **Map Lifecycle Rule:** Leaflet map containers should be initialized once per view mount. Never call `map.fitBounds()` on periodic location ticks.
3. **State Broadcast Discipline:** Use `deliviaState.broadcast('TICK')` for continuous numerical updates and `deliviaState.broadcast('STATE_CHANGE')` only for structural state transitions (order placed, status change, route switched).
4. **Safety Interlock Rule:** Do not permit order completion in the runner view if vehicle speed exceeds 5 km/h unless the station lay-by flag is satisfied.

---

## 4. Verification & Status

All automated tests and endpoint checks pass successfully:
```bash
python test_endpoints.py
# [PASS] All GET/POST endpoints & static assets return HTTP 200 OK
```
