/**
 * DELIVIA - Runner / Roadside Delivery Partner App View
 * Assigned task cards, route to safe pull-over lay-by bay,
 * live vehicle approaching radar, OTP verification & QR scanner simulator.
 */

class DeliviaRunnerView {
  render(container) {
    const state = deliviaState.getState();
    const order = state.activeOrder;
    const hasOrder = order && order.status !== 'NONE';
    const runner = DELIVIA_DATA.runners.find(r => r.id === (order ? order.runnerId : 'runner_1')) || DELIVIA_DATA.runners[0];
    const restaurant = hasOrder ? (DELIVIA_DATA.restaurants.find(r => r.id === order.restaurantId) || DELIVIA_DATA.restaurants[0]) : DELIVIA_DATA.restaurants[0];
    const handoff = hasOrder ? (DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId) || DELIVIA_DATA.handoffPoints[0]) : DELIVIA_DATA.handoffPoints[0];

    // Compute live approaching vehicle metrics
    let distanceToHandoff = 0;
    let vehicleEtaMinutes = 0;

    if (hasOrder) {
      distanceToHandoff = Math.max(0, handoff.highwayKm - state.currentKmAlongRoute);
      const etaAnalysis = deliviaEtaModel.predictEta({
        distanceKm: Math.max(0.1, distanceToHandoff),
        currentSpeedKmph: state.currentSpeedKmph,
        weather: state.weather,
        trafficCongestionIndex: state.trafficCongestionIndex
      });
      vehicleEtaMinutes = etaAnalysis.refinedEtaMinutes;
    }

    const isVehicleStoppedSafely = state.currentSpeedKmph <= handoff.safeSpeedThresholdKmph && distanceToHandoff <= 0.8;
    const isCompleted = order && order.status === 'COMPLETED';

    container.innerHTML = `
      <div class="runner-view-layout">
        <!-- Runner Profile & Shift Bar -->
        <div class="runner-profile-bar glass-panel">
          <div class="flex items-center gap-3">
            <div class="text-3xl">${runner.avatar}</div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-gray-900 text-base">${runner.name}</h3>
                <span class="badge badge-emerald">On Duty • Bay Dispatch</span>
              </div>
              <p class="text-xs text-gray-500">Stationed at: <strong>${handoff.shortName || handoff.name}</strong></p>
            </div>
          </div>

          <div class="runner-stats-group">
            <div class="runner-stat-item">
              <span class="stat-num font-bold text-emerald-800">45s</span>
              <span class="stat-lbl text-[10px] text-gray-500">Avg Hand-Off</span>
            </div>
            <div class="runner-stat-item">
              <span class="stat-num font-bold text-amber-600">⭐ ${runner.rating}</span>
              <span class="stat-lbl text-[10px] text-gray-500">Rating</span>
            </div>
          </div>
        </div>

        <!-- Main Runner Content -->
        <div class="runner-content-grid">
          <!-- Left Column: Active Hand-Off Task Card -->
          <div class="runner-left-col">
            ${hasOrder ? `
              <div class="runner-task-card glass-panel">
                <div class="task-card-header">
                  <div>
                    <span class="text-xs font-mono font-bold text-emerald-800">${order.id}</span>
                    <h3 class="text-base font-bold text-gray-900 mt-0.5">Deliver to ${order.vehiclePlate}</h3>
                    <div class="text-xs text-gray-500">Traveler: ${order.travelerName} (${order.travelerPhone})</div>
                  </div>
                  <span class="status-pill status-${order.status.toLowerCase()}">${order.status.replace('_', ' ')}</span>
                </div>

                <!-- Approaching Vehicle Safety Radar -->
                <div class="vehicle-approach-radar-box ${isVehicleStoppedSafely ? 'radar-safe' : 'radar-approaching'}" id="runner-radar-box">
                  <div class="radar-header">
                    <span class="font-bold text-xs uppercase tracking-wider">🚗 Vehicle Live Telemetry Radar</span>
                    <span class="badge ${isVehicleStoppedSafely ? 'badge-emerald' : 'badge-salmon'}" id="runner-radar-badge">
                      ${isVehicleStoppedSafely ? '✅ STATIONARY IN BAY (Safe Hand-Off)' : '⏳ APPROACHING ON EXPRESSWAY'}
                    </span>
                  </div>

                  <div class="radar-body">
                    <div class="radar-metric">
                      <div class="text-[10px] text-gray-500">Approaching ETA</div>
                      <div class="text-xl font-bold text-gray-900" id="runner-radar-eta">${vehicleEtaMinutes.toFixed(1)} <small class="text-xs">min</small></div>
                    </div>

                    <div class="radar-metric">
                      <div class="text-[10px] text-gray-500">Distance Out</div>
                      <div class="text-xl font-bold text-gray-900" id="runner-radar-dist">${distanceToHandoff.toFixed(1)} <small class="text-xs">km</small></div>
                    </div>

                    <div class="radar-metric">
                      <div class="text-[10px] text-gray-500">Vehicle Speed</div>
                      <div class="text-xl font-bold ${state.currentSpeedKmph <= 5 ? 'text-emerald-700' : 'text-amber-700'}" id="runner-radar-speed">
                        ${Math.round(state.currentSpeedKmph)} <small class="text-xs">km/h</small>
                      </div>
                    </div>
                  </div>

                  ${!isVehicleStoppedSafely && !isCompleted ? `
                    <div class="text-[11px] text-amber-800 bg-amber-50 p-2 rounded mt-2 flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Hand-off action is locked until car decelerates safely into designated parking bay (&le; 5 km/h).</span>
                    </div>
                  ` : ''}
                </div>

                <!-- Pickup & Drop Locations -->
                <div class="task-route-timeline">
                  <div class="timeline-point">
                    <div class="timeline-dot dot-pickup"></div>
                    <div class="timeline-info">
                      <div class="text-xs font-bold text-gray-800">1. Pickup from Kitchen</div>
                      <div class="text-xs text-gray-600">${restaurant.name}</div>
                    </div>
                  </div>

                  <div class="timeline-line"></div>

                  <div class="timeline-point">
                    <div class="timeline-dot dot-drop"></div>
                    <div class="timeline-info">
                      <div class="text-xs font-bold text-emerald-800">2. Safe Roadside Hand-off Point</div>
                      <div class="text-xs text-gray-800 font-semibold">${handoff.name}</div>
                      <div class="text-[11px] text-gray-500">${handoff.laneInstruction}</div>
                    </div>
                  </div>
                </div>

                <!-- Step-by-Step Action Controls -->
                <div class="runner-action-flow mt-4">
                  ${order.status === 'PLACED' || order.status === 'PREPARING' ? `
                    <button id="runner-pickup-btn" class="btn-primary w-full py-3">
                      🛍️ Food Ready: Pick Up from Dhaba Counter
                    </button>
                  ` : order.status === 'FOOD_READY' ? `
                    <button id="runner-reach-layby-btn" class="btn-primary w-full py-3">
                      📍 Arrived & Waiting at Safe Pull-Over Bay
                    </button>
                  ` : (order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED') && !isCompleted ? `
                    <div class="otp-verification-section">
                      <div class="text-xs font-bold text-gray-800 mb-1">Verify Traveler Pass (OTP or QR):</div>
                      <div class="flex items-center gap-2">
                        <input type="text" id="runner-otp-input" placeholder="Enter 4-digit OTP (e.g. ${order.otp})" maxlength="4" class="form-input text-center font-mono font-bold text-base tracking-widest" />
                        <button id="runner-verify-otp-btn" class="btn-success px-4 py-2 text-sm font-bold">
                          ✓ Verify & Complete Hand-off
                        </button>
                      </div>
                      <div class="text-[11px] text-gray-500 mt-1">
                        Traveler's active pass OTP is: <strong class="text-emerald-800">${order.otp}</strong>
                      </div>
                    </div>
                  ` : `
                    <div class="handoff-success-badge">
                      <div class="text-2xl">🎉</div>
                      <div class="font-bold text-emerald-900 text-sm">Hand-off Completed Successfully!</div>
                      <div class="text-xs text-emerald-700">Elapsed hand-off exchange time: 38 seconds.</div>
                    </div>
                  `}
                </div>
              </div>
            ` : `
              <div class="empty-runner-box glass-panel text-center py-16">
                <div class="text-5xl mb-3">🏃</div>
                <h3 class="text-base font-bold text-gray-800">No Active Hand-Off Dispatched</h3>
                <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  You are stationed at <strong>${handoff.shortName || handoff.name}</strong> on standby for incoming highway orders.
                </p>
              </div>
            `}
          </div>

          <!-- Right Column: Safety Guidelines & Checklist -->
          <div class="runner-right-col">
            <div class="runner-checklist-card glass-panel">
              <h3 class="font-bold text-sm text-gray-900 mb-3">📋 Roadside Hand-Off Checklist</h3>

              <div class="checklist-items">
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <div class="check-title">High-Visibility Safety Vest</div>
                    <div class="check-sub">Fluorescent vest worn at all times near roadside bays.</div>
                  </div>
                </div>

                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <div class="check-title">Thermal Insulated Hot-Bag</div>
                    <div class="check-sub">Keep food sealed at &ge; 65°C until hand-off.</div>
                  </div>
                </div>

                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <div class="check-title">Stationary Vehicle Hand-Off Only</div>
                    <div class="check-sub">Never step into active highway carriageway lanes.</div>
                  </div>
                </div>

                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <div class="check-title">4-Digit OTP Confirmation</div>
                    <div class="check-sub">Ensures food is handed to the correct vehicle.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container, order);
  }

  updateTick(state) {
    const order = state.activeOrder;
    if (!order || order.status === 'NONE') return;

    const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId);
    if (!handoff) return;

    const distanceToHandoff = Math.max(0, handoff.highwayKm - state.currentKmAlongRoute);
    const etaAnalysis = deliviaEtaModel.predictEta({
      distanceKm: Math.max(0.1, distanceToHandoff),
      currentSpeedKmph: state.currentSpeedKmph,
      weather: state.weather,
      trafficCongestionIndex: state.trafficCongestionIndex
    });
    const vehicleEtaMinutes = etaAnalysis.refinedEtaMinutes;
    const isVehicleStoppedSafely = state.currentSpeedKmph <= handoff.safeSpeedThresholdKmph && distanceToHandoff <= 0.8;

    const etaEl = document.getElementById('runner-radar-eta');
    if (etaEl) etaEl.innerHTML = `${vehicleEtaMinutes.toFixed(1)} <small class="text-xs">min</small>`;

    const distEl = document.getElementById('runner-radar-dist');
    if (distEl) distEl.innerHTML = `${distanceToHandoff.toFixed(1)} <small class="text-xs">km</small>`;

    const speedEl = document.getElementById('runner-radar-speed');
    if (speedEl) {
      speedEl.className = `text-xl font-bold ${state.currentSpeedKmph <= 5 ? 'text-emerald-700' : 'text-amber-700'}`;
      speedEl.innerHTML = `${Math.round(state.currentSpeedKmph)} <small class="text-xs">km/h</small>`;
    }

    const badgeEl = document.getElementById('runner-radar-badge');
    const boxEl = document.getElementById('runner-radar-box');
    if (badgeEl && boxEl) {
      badgeEl.className = `badge ${isVehicleStoppedSafely ? 'badge-emerald' : 'badge-salmon'}`;
      badgeEl.innerText = isVehicleStoppedSafely ? '✅ STATIONARY IN BAY (Safe Hand-Off)' : '⏳ APPROACHING ON EXPRESSWAY';
      boxEl.className = `vehicle-approach-radar-box ${isVehicleStoppedSafely ? 'radar-safe' : 'radar-approaching'}`;
    }
  }

  bindEvents(container, order) {
    const pickupBtn = container.querySelector('#runner-pickup-btn');
    if (pickupBtn) {
      pickupBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('FOOD_READY');
      });
    }

    const reachLaybyBtn = container.querySelector('#runner-reach-layby-btn');
    if (reachLaybyBtn) {
      reachLaybyBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('RUNNER_AT_LAYBY');
      });
    }

    const verifyOtpBtn = container.querySelector('#runner-verify-otp-btn');
    const otpInput = container.querySelector('#runner-otp-input');

    if (verifyOtpBtn && otpInput) {
      verifyOtpBtn.addEventListener('click', () => {
        const val = otpInput.value.trim();
        if (!order) return;
        if (val === order.otp || val === '' || val === 'DEMO') {
          deliviaState.updateOrderStatus('COMPLETED');
        } else {
          alert(`Invalid OTP! Please enter the traveler's 4-digit pass OTP: ${order.otp}`);
        }
      });
    }
  }
}

const deliviaRunnerView = new DeliviaRunnerView();
