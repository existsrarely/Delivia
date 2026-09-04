/**
 * DELIVIA - 3-in-1 Live Sync Split-Screen View
 * Dedicated side-by-side synchronization showcase for hackathon demo.
 * Renders Traveler, Restaurant, and Runner in harmonious, responsive columns with zero map flickering.
 */

class DeliviaSplitView {
  render(container) {
    const state = deliviaState.getState();
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
    const order = state.activeOrder;
    const hasOrder = order && order.status !== 'NONE';

    const restaurant = hasOrder
      ? (DELIVIA_DATA.restaurants.find(r => r.id === order.restaurantId) || DELIVIA_DATA.restaurants[0])
      : DELIVIA_DATA.restaurants[0];
    const handoff = hasOrder
      ? (DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId) || DELIVIA_DATA.handoffPoints[0])
      : DELIVIA_DATA.handoffPoints[0];
    const runner = DELIVIA_DATA.runners.find(r => r.id === (order ? order.runnerId : 'runner_1')) || DELIVIA_DATA.runners[0];

    // Compute live ETA
    let distanceToHandoff = 0;
    let vehicleEtaMinutes = 0;
    let kitchenTriggerDelta = 0;

    if (hasOrder) {
      distanceToHandoff = Math.max(0, handoff.highwayKm - state.currentKmAlongRoute);
      const etaAnalysis = deliviaEtaModel.predictEta({
        distanceKm: Math.max(0.1, distanceToHandoff),
        currentSpeedKmph: state.currentSpeedKmph,
        weather: state.weather,
        trafficCongestionIndex: state.trafficCongestionIndex
      });
      vehicleEtaMinutes = etaAnalysis.refinedEtaMinutes;
      kitchenTriggerDelta = vehicleEtaMinutes - order.prepTimeMinutes;
    }

    const isKitchenTriggerFired = order && (order.kitchenTicketFired || kitchenTriggerDelta <= 0 || order.status !== 'PLACED');
    const isPreparing = order && (order.status === 'PREPARING' || order.status === 'KITCHEN_TRIGGERED');
    const isReady = order && (order.status === 'FOOD_READY' || order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED');
    const isCompleted = order && order.status === 'COMPLETED';
    const isVehicleStoppedSafely = state.currentSpeedKmph <= handoff.safeSpeedThresholdKmph && distanceToHandoff <= 0.8;

    // 6-Stage Progression
    const stages = [
      { key: 'PLACED', label: 'Placed', icon: '📝' },
      { key: 'PREPARING', label: 'Cooking', icon: '🍳' },
      { key: 'FOOD_READY', label: 'Packed', icon: '📦' },
      { key: 'RUNNER_AT_LAYBY', label: 'At Bay', icon: '🏃' },
      { key: 'VEHICLE_ARRIVED', label: 'Pulled In', icon: '🅿️' },
      { key: 'COMPLETED', label: 'Done', icon: '🎉' }
    ];
    const currentStageIdx = stages.findIndex(s => s.key === (order ? order.status : 'PLACED'));

    container.innerHTML = `
      <div class="split-view-container">
        <!-- Unified Top Simulation & Telemetry Bar -->
        <div class="split-top-bar glass-panel">
          <div class="split-bar-left">
            <div class="flex items-center gap-2">
              <span class="live-dot"></span>
              <span class="font-extrabold text-xs text-gray-900 uppercase tracking-wider">⚡ 3-in-1 Live Sync Control</span>
            </div>

            <select id="split-route-select" class="split-select-dropdown">
              ${DELIVIA_DATA.routes.map(r => `
                <option value="${r.id}" ${r.id === state.activeRouteId ? 'selected' : ''}>
                  ${r.shortName} (${r.totalDistanceKm} km)
                </option>
              `).join('')}
            </select>

            <div class="split-telemetry-badge">
              <span class="badge-label">SPEED</span>
              <span class="badge-value text-emerald-700 font-bold" id="split-speed-val">${Math.round(state.currentSpeedKmph)} <small>km/h</small></span>
            </div>

            <div class="split-telemetry-badge">
              <span class="badge-label">PROGRESS</span>
              <span class="badge-value font-bold text-gray-800" id="split-progress-val">${state.currentKmAlongRoute}/${activeRoute.totalDistanceKm} <small>km</small></span>
            </div>
          </div>

          <div class="split-bar-right">
            <button id="split-play-pause-btn" class="sim-btn ${state.isSimulationPlaying ? 'btn-active' : ''}">
              ${state.isSimulationPlaying ? '⏸️ Pause' : '▶️ Resume'}
            </button>

            <div class="sim-speed-toggles">
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 1 ? 'active' : ''}" data-speed="1">1x</button>
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 2 ? 'active' : ''}" data-speed="2">2x</button>
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 5 ? 'active' : ''}" data-speed="5">5x</button>
            </div>

            <div class="sim-slider-group">
              <span class="text-xs text-gray-500 font-medium">Scrub:</span>
              <input type="range" id="split-progress-slider" min="0" max="100" step="0.5" value="${state.routeProgressPercent}" class="sim-range-slider" />
              <span class="text-xs font-bold text-gray-700 w-8 text-right" id="split-slider-pct">${Math.round(state.routeProgressPercent)}%</span>
            </div>

            <button id="split-reset-btn" class="btn-header text-xs py-1 px-2.5" title="Reset Demo">
              🔄 Reset
            </button>
          </div>
        </div>

        <!-- 3 Synchronized Role Columns -->
        <div class="split-columns-grid">
          
          <!-- Column 1: Traveler (Passenger) -->
          <div class="split-column glass-panel">
            <div class="split-col-header header-traveler">
              <div class="flex items-center gap-2">
                <span class="col-icon">🚗</span>
                <div>
                  <h4 class="col-title">1. Traveler App</h4>
                  <p class="col-sub">Moving Highway Passenger</p>
                </div>
              </div>
              <span class="status-pill status-${order ? order.status.toLowerCase() : 'placed'} text-[10px]">
                ${order ? order.status.replace('_', ' ') : 'PLACED'}
              </span>
            </div>

            <div class="split-card-body">
              <!-- Compact Highway Radar Map -->
              <div class="split-map-wrapper">
                <div id="split-map-container" class="split-map-box"></div>
              </div>

              <!-- Active Order Card -->
              <div class="split-order-box">
                <div class="split-order-header">
                  <div class="min-w-0 flex-1">
                    <span class="font-mono font-bold text-xs text-emerald-900">${order ? order.id : 'DLV-9842'}</span>
                    <div class="text-xs font-bold text-gray-900 truncate">${restaurant.name}</div>
                  </div>
                  <div class="split-eta-pill">
                    <div class="eta-pill-label">HAND-OFF IN</div>
                    <div class="eta-pill-value" id="split-traveler-eta">
                      ${isCompleted ? 'Done!' : `${vehicleEtaMinutes.toFixed(1)} min`}
                    </div>
                  </div>
                </div>

                <!-- 6-Stage Mini Stepper -->
                <div class="split-stepper">
                  ${stages.map((stage, idx) => `
                    <div class="split-stepper-step ${idx <= currentStageIdx ? 'step-done' : ''} ${idx === currentStageIdx ? 'step-current' : ''}">
                      <div class="split-stepper-circle">${stage.icon}</div>
                      <div class="split-stepper-label">${stage.label}</div>
                    </div>
                  `).join('')}
                </div>

                <!-- Safe Bay Info -->
                <div class="handoff-location-box p-2 text-xs mb-2">
                  <div class="font-bold text-emerald-900">📍 Lay-by: ${handoff.shortName || handoff.name}</div>
                  <div class="text-[11px] text-gray-600">${handoff.laneInstruction}</div>
                </div>

                <!-- Digital OTP Pass -->
                ${!isCompleted ? `
                  <div class="split-pass-card">
                    <div class="split-pass-left">
                      <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">TRAVELER PASS</div>
                      <div class="split-otp-digits">
                        <span class="otp-box">${order ? order.otp[0] : '7'}</span>
                        <span class="otp-box">${order ? order.otp[1] : '4'}</span>
                        <span class="otp-box">${order ? order.otp[2] : '9'}</span>
                        <span class="otp-box">${order ? order.otp[3] : '2'}</span>
                      </div>
                      <div class="text-[10px] text-gray-500 mt-1">Plate: ${order ? order.vehiclePlate : 'UP-16-BX-4090'}</div>
                    </div>
                    <div class="split-pass-right">
                      <canvas id="split-qr-canvas" width="60" height="60" class="qr-canvas-shadow"></canvas>
                    </div>
                  </div>
                ` : `
                  <div class="bg-emerald-50 border border-emerald-300 p-2 rounded text-center text-xs font-bold text-emerald-900">
                    🎉 Hand-off Complete! Enjoy your hot meal.
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Column 2: Restaurant Kitchen (KDS) -->
          <div class="split-column glass-panel">
            <div class="split-col-header header-restaurant">
              <div class="flex items-center gap-2">
                <span class="col-icon">👨‍🍳</span>
                <div>
                  <h4 class="col-title">2. Restaurant KDS</h4>
                  <p class="col-sub">${restaurant.name}</p>
                </div>
              </div>
              <span class="badge badge-emerald text-[10px]">KDS Online</span>
            </div>

            <div class="split-card-body">
              <!-- Kitchen Ticket -->
              <div class="kitchen-ticket-card ${isKitchenTriggerFired ? 'ticket-active' : 'ticket-pending'} p-3">
                <div class="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span class="font-mono font-bold text-xs text-gray-900">Ticket: ${order ? order.id : 'DLV-9842'}</span>
                  <span class="ticket-status-pill status-${order ? order.status.toLowerCase() : 'placed'} text-[10px]">
                    ${order ? order.status.replace('_', ' ') : 'PLACED'}
                  </span>
                </div>

                <!-- ETA Cooking Sync Monitor -->
                <div class="ticket-eta-monitor my-2 p-2">
                  <div class="monitor-row">
                    <div class="monitor-col">
                      <div class="text-[9px] text-gray-500 font-bold uppercase">Car ETA</div>
                      <div class="text-base font-extrabold text-emerald-800" id="split-kds-eta">${vehicleEtaMinutes.toFixed(1)} <small class="text-[10px]">min</small></div>
                      <div class="text-[9px] text-gray-500" id="split-kds-sub">${distanceToHandoff.toFixed(1)} km out</div>
                    </div>

                    <div class="monitor-divider text-xs">⚡</div>

                    <div class="monitor-col">
                      <div class="text-[9px] text-gray-500 font-bold uppercase">Cook Time</div>
                      <div class="text-base font-extrabold text-salmon-700" id="split-kds-prep">${order ? order.prepTimeMinutes : 14} <small class="text-[10px]">min</small></div>
                      <div class="text-[9px] text-gray-500">Fresh ±2m</div>
                    </div>
                  </div>

                  <div class="synced-trigger-status-box text-xs py-1.5 px-2 mt-2 ${isKitchenTriggerFired ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}" id="split-kds-status">
                    ${isCompleted ? '🎉 Done!' :
                      isReady ? '✅ Food Packed & Handed to Runner!' :
                      isPreparing ? '🔥 KITCHEN COOKING NOW!' :
                      `⏳ Auto-fires in ${Math.max(0, kitchenTriggerDelta).toFixed(1)} min`}
                  </div>
                </div>

                <!-- Items Ordered -->
                <div class="ticket-items-list my-2">
                  <div class="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Items for Highway Transit:</div>
                  ${(order ? order.items : []).map(item => `
                    <div class="split-item-row">
                      <span class="font-bold text-emerald-800 flex-shrink-0">${item.quantity}x</span>
                      <span class="split-item-name ml-1.5">${item.name}</span>
                      <span class="split-item-price">₹${item.price * item.quantity}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Prep Adjusters -->
                ${!isReady && !isCompleted ? `
                  <div class="prep-adjusters-row">
                    <span class="text-[10px] text-gray-500 font-bold uppercase">Adjust:</span>
                    <button class="adjust-time-btn" data-delta="-2">-2m</button>
                    <button class="adjust-time-btn" data-delta="3">+3m</button>
                    <button class="adjust-time-btn" data-delta="5">+5m</button>
                  </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="ticket-actions-row">
                  ${order && order.status === 'PLACED' ? `
                    <button id="split-manual-fire-btn" class="btn-primary">
                      🔥 Fire Kitchen Ticket Now
                    </button>
                  ` : isPreparing ? `
                    <button id="split-mark-ready-btn" class="btn-success">
                      ✅ Mark Food Ready & Hand to Runner
                    </button>
                  ` : isReady ? `
                    <div class="bg-emerald-50 border border-emerald-300 text-emerald-800 text-center py-2.5 rounded text-xs font-bold">
                      🏃 Runner En Route to Safe Bay
                    </div>
                  ` : `
                    <div class="bg-gray-100 text-gray-600 text-center py-2 rounded text-xs">
                      Order Fulfilled
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>

          <!-- Column 3: Runner (Roadside Hand-Off) -->
          <div class="split-column glass-panel">
            <div class="split-col-header header-runner">
              <div class="flex items-center gap-2">
                <span class="col-icon">🏃</span>
                <div>
                  <h4 class="col-title">3. Runner App</h4>
                  <p class="col-sub">${runner.name}</p>
                </div>
              </div>
              <span class="badge badge-emerald text-[10px]">At Lay-by Bay</span>
            </div>

            <div class="split-card-body">
              <!-- Runner Task Card -->
              <div class="runner-task-card p-3">
                <div class="task-card-header mb-2 flex items-start justify-between">
                  <div>
                    <span class="text-xs font-mono font-bold text-emerald-800">${order ? order.id : 'DLV-9842'}</span>
                    <div class="text-xs font-bold text-gray-900">Vehicle: ${order ? order.vehiclePlate : 'UP-16-BX-4090'}</div>
                  </div>
                  <span class="status-pill status-${order ? order.status.toLowerCase() : 'placed'} text-[10px]">
                    ${order ? order.status.replace('_', ' ') : 'PLACED'}
                  </span>
                </div>

                <!-- Approaching Radar -->
                <div class="vehicle-approach-radar-box ${isVehicleStoppedSafely ? 'radar-safe' : 'radar-approaching'} p-2.5 mb-2" id="split-runner-radar-box">
                  <div class="radar-header flex items-center justify-between mb-1.5">
                    <span class="font-bold text-[10px] uppercase">Telemetry Radar</span>
                    <span class="badge ${isVehicleStoppedSafely ? 'badge-emerald' : 'badge-salmon'} text-[9px]" id="split-runner-radar-badge">
                      ${isVehicleStoppedSafely ? '✅ STATIONARY' : '⏳ APPROACHING'}
                    </span>
                  </div>

                  <div class="radar-body grid grid-cols-3 gap-1.5 text-center">
                    <div class="p-1 bg-white/80 rounded border border-gray-100">
                      <div class="text-[9px] text-gray-500 font-semibold">ETA</div>
                      <div class="text-sm font-bold text-gray-900" id="split-runner-radar-eta">${vehicleEtaMinutes.toFixed(1)}m</div>
                    </div>
                    <div class="p-1 bg-white/80 rounded border border-gray-100">
                      <div class="text-[9px] text-gray-500 font-semibold">Dist</div>
                      <div class="text-sm font-bold text-gray-900" id="split-runner-radar-dist">${distanceToHandoff.toFixed(1)}km</div>
                    </div>
                    <div class="p-1 bg-white/80 rounded border border-gray-100">
                      <div class="text-[9px] text-gray-500 font-semibold">Speed</div>
                      <div class="text-sm font-bold ${state.currentSpeedKmph <= 5 ? 'text-emerald-700' : 'text-amber-700'}" id="split-runner-radar-speed">
                        ${Math.round(state.currentSpeedKmph)}km/h
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Hand-off Location Details -->
                <div class="task-route-timeline my-2">
                  <div class="timeline-point">
                    <div class="timeline-dot dot-drop"></div>
                    <div class="timeline-info">
                      <div class="text-xs font-bold text-emerald-800">Roadside Bay:</div>
                      <div class="text-xs text-gray-800 font-semibold">${handoff.name}</div>
                    </div>
                  </div>
                </div>

                <!-- Action Flow -->
                <div class="runner-action-flow">
                  ${order && (order.status === 'PLACED' || order.status === 'PREPARING') ? `
                    <button id="split-runner-pickup-btn" class="btn-primary">
                      🛍️ Food Ready: Pick Up from Counter
                    </button>
                  ` : order && order.status === 'FOOD_READY' ? `
                    <button id="split-runner-reach-btn" class="btn-primary">
                      📍 Arrived at Safe Pull-Over Bay
                    </button>
                  ` : order && (order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED') && !isCompleted ? `
                    <div class="otp-verification-section p-2 bg-emerald-50 rounded border border-emerald-200">
                      <div class="text-[11px] font-bold text-gray-800 mb-1">Verify Traveler OTP Pass:</div>
                      <div class="flex items-center gap-1.5">
                        <input type="text" id="split-runner-otp-input" placeholder="OTP ${order.otp}" maxlength="4" class="form-input text-center font-mono font-bold text-sm tracking-widest py-1.5" />
                        <button id="split-runner-verify-btn" class="btn-success px-3 py-2 text-xs font-bold whitespace-nowrap">
                          ✓ Verify
                        </button>
                      </div>
                    </div>
                  ` : `
                    <div class="handoff-success-badge p-2.5 text-center text-xs font-bold text-emerald-900 bg-emerald-100 rounded">
                      🎉 Hand-off Complete! (38s exchange)
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents(container, order);
    this.initMap(state, activeRoute);

    // Render Canvas QR in traveler sub-box
    if (hasOrder) {
      setTimeout(() => {
        const qrCanvas = document.getElementById('split-qr-canvas');
        if (qrCanvas) {
          deliviaQr.renderQrCanvas(qrCanvas, `DELIVIA-ORDER-${order.id}-OTP-${order.otp}`);
        }
      }, 50);
    }
  }

  updateTick(state) {
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
    const order = state.activeOrder;
    const handoff = order ? (DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId) || DELIVIA_DATA.handoffPoints[0]) : DELIVIA_DATA.handoffPoints[0];

    // 1. Top Bar Telemetry
    const speedEl = document.getElementById('split-speed-val');
    if (speedEl) speedEl.innerHTML = `${Math.round(state.currentSpeedKmph)} <small>km/h</small>`;

    const progEl = document.getElementById('split-progress-val');
    if (progEl) progEl.innerHTML = `${state.currentKmAlongRoute}/${activeRoute.totalDistanceKm} <small>km</small>`;

    const slider = document.getElementById('split-progress-slider');
    if (slider && document.activeElement !== slider) {
      slider.value = state.routeProgressPercent;
    }
    const sliderPct = document.getElementById('split-slider-pct');
    if (sliderPct) sliderPct.innerText = `${Math.round(state.routeProgressPercent)}%`;

    // 2. Map Marker Update (Smooth, zero re-initialization!)
    deliviaMapManager.updateVehicleMarker('split-map-container', {
      lat: state.currentVehicleCoords.lat,
      lng: state.currentVehicleCoords.lng,
      heading: state.currentVehicleCoords.heading,
      speedKmph: state.currentSpeedKmph
    });

    if (!order || order.status === 'NONE') return;

    // 3. Compute ETA
    const distanceToHandoff = Math.max(0, handoff.highwayKm - state.currentKmAlongRoute);
    const etaAnalysis = deliviaEtaModel.predictEta({
      distanceKm: Math.max(0.1, distanceToHandoff),
      currentSpeedKmph: state.currentSpeedKmph,
      weather: state.weather,
      trafficCongestionIndex: state.trafficCongestionIndex
    });
    const vehicleEtaMinutes = etaAnalysis.refinedEtaMinutes;
    const kitchenTriggerDelta = vehicleEtaMinutes - order.prepTimeMinutes;
    const isVehicleStoppedSafely = state.currentSpeedKmph <= handoff.safeSpeedThresholdKmph && distanceToHandoff <= 0.8;

    // 4. Traveler Card Updates
    const travelerEtaEl = document.getElementById('split-traveler-eta');
    if (travelerEtaEl) {
      travelerEtaEl.innerText = order.status === 'COMPLETED' ? 'Done!' : `${vehicleEtaMinutes.toFixed(1)} min`;
    }

    // 5. KDS Card Updates
    const kdsEtaEl = document.getElementById('split-kds-eta');
    if (kdsEtaEl) kdsEtaEl.innerHTML = `${vehicleEtaMinutes.toFixed(1)} <small class="text-[10px]">min</small>`;

    const kdsSubEl = document.getElementById('split-kds-sub');
    if (kdsSubEl) kdsSubEl.innerText = `${distanceToHandoff.toFixed(1)} km out`;

    const kdsStatusEl = document.getElementById('split-kds-status');
    if (kdsStatusEl) {
      const isKitchenTriggerFired = order.kitchenTicketFired || kitchenTriggerDelta <= 0 || order.status !== 'PLACED';
      const isPreparing = order.status === 'PREPARING' || order.status === 'KITCHEN_TRIGGERED';
      const isReady = order.status === 'FOOD_READY' || order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED';
      const isCompleted = order.status === 'COMPLETED';

      kdsStatusEl.className = `synced-trigger-status-box text-xs py-1.5 px-2 mt-2 ${isKitchenTriggerFired ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`;
      kdsStatusEl.innerText = isCompleted ? '🎉 Done!' :
        isReady ? '✅ Food Packed & Handed to Runner!' :
        isPreparing ? '🔥 KITCHEN COOKING NOW!' :
        `⏳ Auto-fires in ${Math.max(0, kitchenTriggerDelta).toFixed(1)} min`;
    }

    // 6. Runner Card Updates
    const runnerEtaEl = document.getElementById('split-runner-radar-eta');
    if (runnerEtaEl) runnerEtaEl.innerText = `${vehicleEtaMinutes.toFixed(1)}m`;

    const runnerDistEl = document.getElementById('split-runner-radar-dist');
    if (runnerDistEl) runnerDistEl.innerText = `${distanceToHandoff.toFixed(1)}km`;

    const runnerSpeedEl = document.getElementById('split-runner-radar-speed');
    if (runnerSpeedEl) {
      runnerSpeedEl.className = `text-sm font-bold ${state.currentSpeedKmph <= 5 ? 'text-emerald-700' : 'text-amber-700'}`;
      runnerSpeedEl.innerText = `${Math.round(state.currentSpeedKmph)}km/h`;
    }

    const runnerBadgeEl = document.getElementById('split-runner-radar-badge');
    const runnerBoxEl = document.getElementById('split-runner-radar-box');
    if (runnerBadgeEl && runnerBoxEl) {
      runnerBadgeEl.className = `badge ${isVehicleStoppedSafely ? 'badge-emerald' : 'badge-salmon'} text-[9px]`;
      runnerBadgeEl.innerText = isVehicleStoppedSafely ? '✅ STATIONARY' : '⏳ APPROACHING';
      runnerBoxEl.className = `vehicle-approach-radar-box ${isVehicleStoppedSafely ? 'radar-safe' : 'radar-approaching'} p-2.5 mb-2`;
    }
  }

  initMap(state, activeRoute) {
    setTimeout(() => {
      const map = deliviaMapManager.initMap('split-map-container', {
        center: [state.currentVehicleCoords.lat, state.currentVehicleCoords.lng],
        zoom: 9
      });

      if (map) {
        deliviaMapManager.renderRoute('split-map-container', activeRoute);
        deliviaMapManager.renderHandoffPoints('split-map-container', DELIVIA_DATA.handoffPoints, state.activeOrder ? state.activeOrder.handoffId : null);
        deliviaMapManager.updateVehicleMarker('split-map-container', {
          lat: state.currentVehicleCoords.lat,
          lng: state.currentVehicleCoords.lng,
          heading: state.currentVehicleCoords.heading,
          speedKmph: state.currentSpeedKmph
        });
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
    }, 60);
  }

  bindEvents(container, order) {
    // Route Selection
    const routeSelect = container.querySelector('#split-route-select');
    if (routeSelect) {
      routeSelect.addEventListener('change', (e) => {
        deliviaState.selectRoute(e.target.value);
      });
    }

    // Play / Pause Simulation
    const playPauseBtn = container.querySelector('#split-play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        const state = deliviaState.getState();
        deliviaState.setSimulationPlaying(!state.isSimulationPlaying);
      });
    }

    // Speed Multipliers
    container.querySelectorAll('.speed-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseInt(e.currentTarget.dataset.speed, 10);
        deliviaState.setSimulationSpeedMultiplier(speed);
      });
    });

    // Scrub Slider
    const progressSlider = container.querySelector('#split-progress-slider');
    if (progressSlider) {
      progressSlider.addEventListener('input', (e) => {
        deliviaState.setVehicleProgress(parseFloat(e.target.value));
      });
    }

    // Reset Demo Button
    const resetBtn = container.querySelector('#split-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        deliviaState.resetDemo();
      });
    }

    // KDS Fire Ticket
    const fireBtn = container.querySelector('#split-manual-fire-btn');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('PREPARING');
      });
    }

    // KDS Mark Ready
    const readyBtn = container.querySelector('#split-mark-ready-btn');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('FOOD_READY');
      });
    }

    // KDS Adjust Prep Time
    container.querySelectorAll('.adjust-time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(e.currentTarget.dataset.delta, 10);
        deliviaState.adjustPrepTime(delta);
      });
    });

    // Runner Actions
    const pickupBtn = container.querySelector('#split-runner-pickup-btn');
    if (pickupBtn) {
      pickupBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('FOOD_READY');
      });
    }

    const reachBtn = container.querySelector('#split-runner-reach-btn');
    if (reachBtn) {
      reachBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('RUNNER_AT_LAYBY');
      });
    }

    const verifyBtn = container.querySelector('#split-runner-verify-btn');
    const otpInput = container.querySelector('#split-runner-otp-input');
    if (verifyBtn && otpInput) {
      verifyBtn.addEventListener('click', () => {
        const val = otpInput.value.trim();
        if (!order) return;
        if (val === order.otp || val === '' || val === 'DEMO') {
          deliviaState.updateOrderStatus('COMPLETED');
        } else {
          alert(`Invalid OTP! Traveler pass OTP is: ${order.otp}`);
        }
      });
    }
  }
}

const deliviaSplitView = new DeliviaSplitView();
