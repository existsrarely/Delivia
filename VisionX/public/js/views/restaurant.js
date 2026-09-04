/**
 * DELIVIA - Restaurant / Dhaba Kitchen Dashboard View
 * Incoming live order queue, vehicle approaching ETA countdown,
 * synced kitchen ticket firing simulator, prep time adjuster, and "Food Ready" dispatcher.
 */

class DeliviaRestaurantView {
  render(container) {
    const state = deliviaState.getState();
    const order = state.activeOrder;
    const hasOrder = order && order.status !== 'NONE';
    const restaurant = hasOrder
      ? (DELIVIA_DATA.restaurants.find(r => r.id === order.restaurantId) || DELIVIA_DATA.restaurants[0])
      : DELIVIA_DATA.restaurants[0];

    // Compute live approaching vehicle metrics
    let distanceToHandoff = 0;
    let vehicleEtaMinutes = 0;
    let kitchenTriggerDelta = 0;

    if (hasOrder) {
      const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId);
      if (handoff) {
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
    }

    const isKitchenTriggerFired = order && (order.kitchenTicketFired || kitchenTriggerDelta <= 0 || order.status !== 'PLACED');
    const isPreparing = order && (order.status === 'PREPARING' || order.status === 'KITCHEN_TRIGGERED');
    const isReady = order && (order.status === 'FOOD_READY' || order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED');
    const isCompleted = order && order.status === 'COMPLETED';

    container.innerHTML = `
      <div class="restaurant-view-layout">
        <!-- Restaurant Header & KPI Banner -->
        <div class="kitchen-header-bar glass-panel">
          <div class="flex items-center gap-3">
            <div class="text-4xl">${restaurant.image || '🍛'}</div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold text-gray-900">${restaurant.name}</h2>
                <span class="badge badge-emerald">Kitchen KDS Online</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Highway Partner Kitchen • ${restaurant.cuisine} • Associated: ${DELIVIA_DATA.handoffPoints.find(h => h.id === restaurant.associatedHandoffId)?.name || 'Highway Bay'}</p>
            </div>
          </div>

          <div class="kitchen-kpis">
            <div class="kpi-box">
              <div class="kpi-val text-emerald-800 font-extrabold text-lg">18</div>
              <div class="kpi-label">Orders Today</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-val text-emerald-700 font-extrabold text-lg">+0.4m</div>
              <div class="kpi-label">Avg Sync Delta</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-val text-salmon-700 font-extrabold text-lg">99.2%</div>
              <div class="kpi-label">On-Time Hand-Off</div>
            </div>
          </div>
        </div>

        <!-- Kitchen Workspace Grid -->
        <div class="kitchen-grid">
          <!-- Left Column: Active Order Ticket & Actions -->
          <div class="kitchen-left-col">
            ${hasOrder ? `
              <!-- Synced Highway Kitchen Ticket -->
              <div class="kitchen-ticket-card glass-panel ${isKitchenTriggerFired ? 'ticket-active' : 'ticket-pending'}">
                <div class="ticket-tear-strip"></div>
                
                <div class="ticket-header">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-base text-gray-900">${order.id}</span>
                    <span class="ticket-status-pill status-${order.status.toLowerCase()}">${order.status.replace('_', ' ')}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">Vehicle: <strong class="text-gray-800">${order.vehiclePlate}</strong> (${order.travelerName})</div>
                </div>

                <!-- Synced ETA Firing Engine Countdown -->
                <div class="ticket-eta-monitor">
                  <div class="monitor-row">
                    <div class="monitor-col">
                      <div class="text-[10px] text-gray-500 font-bold uppercase">Approaching Car ETA</div>
                      <div class="text-2xl font-extrabold text-emerald-800" id="kds-approaching-eta">${vehicleEtaMinutes.toFixed(1)} <small class="text-xs">min</small></div>
                      <div class="text-[10px] text-gray-500" id="kds-approaching-sub">${distanceToHandoff.toFixed(1)} km out @ ${Math.round(state.currentSpeedKmph)} km/h</div>
                    </div>

                    <div class="monitor-divider">⚡</div>

                    <div class="monitor-col">
                      <div class="text-[10px] text-gray-500 font-bold uppercase">Kitchen Cooking Time</div>
                      <div class="text-2xl font-extrabold text-salmon-700" id="kds-prep-time-val">${order.prepTimeMinutes} <small class="text-xs">min</small></div>
                      <div class="text-[10px] text-gray-500">Target Fresh Window: ±2m</div>
                    </div>
                  </div>

                  <div class="synced-trigger-status-box ${isKitchenTriggerFired ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}" id="kds-trigger-status">
                    ${isCompleted ? '🎉 Order Hand-off Completed on Schedule!' :
                      isReady ? '✅ Food Packed & With Runner at Safe Bay!' :
                      isPreparing ? '🔥 KITCHEN TICKET FIRED — COOKING NOW!' :
                      `⏳ Auto-fires in ${Math.max(0, kitchenTriggerDelta).toFixed(1)} min when car is ${order.prepTimeMinutes}m away`}
                  </div>
                </div>

                <!-- Food Items Ordered -->
                <div class="ticket-items-list">
                  <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Order Items (Highway Spill-Proof Packing):</div>
                  ${order.items.map(item => `
                    <div class="ticket-item-row">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-emerald-800">${item.quantity}x</span>
                        <span class="font-semibold text-gray-900 text-sm">${item.name}</span>
                      </div>
                      <span class="font-mono text-xs text-gray-600">₹${item.price * item.quantity}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Prep Time Adjustment Controls -->
                ${!isReady && !isCompleted ? `
                  <div class="prep-adjustment-box">
                    <div class="text-xs font-semibold text-gray-700 mb-1.5">Adjust Kitchen Prep Time:</div>
                    <div class="flex items-center gap-2">
                      <button class="adjust-time-btn" data-delta="-2">-2 mins (Quick finish)</button>
                      <button class="adjust-time-btn" data-delta="3">+3 mins (Rush buffer)</button>
                      <button class="adjust-time-btn" data-delta="5">+5 mins (Heavy queue)</button>
                    </div>
                  </div>
                ` : ''}

                <!-- Action Button Trigger -->
                <div class="ticket-actions-row mt-4">
                  ${order.status === 'PLACED' ? `
                    <button id="manual-fire-ticket-btn" class="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      <span>🔥 Fire Kitchen Ticket Now</span>
                    </button>
                  ` : isPreparing ? `
                    <button id="mark-ready-btn" class="btn-success w-full py-3 flex items-center justify-center gap-2 text-base font-bold">
                      <span>✅ Mark Food Ready & Hand to Runner</span>
                    </button>
                  ` : isReady ? `
                    <div class="bg-emerald-50 border border-emerald-300 text-emerald-800 text-center py-3 rounded-lg font-bold text-sm">
                      🏃 Runner Assigned (${DELIVIA_DATA.runners[0].name}) En Route to Lay-by Bay
                    </div>
                  ` : `
                    <div class="bg-gray-100 text-gray-600 text-center py-2.5 rounded-lg text-xs font-semibold">
                      Completed Order Archive
                    </div>
                  `}
                </div>
              </div>
            ` : `
              <div class="empty-kitchen-box glass-panel text-center py-16">
                <div class="text-5xl mb-3">👨‍🍳</div>
                <h3 class="text-lg font-bold text-gray-800">Kitchen Ready for Highway Orders</h3>
                <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  When a traveler approaching on the highway places an order, the ticket will sync with their live speed and fire automatically.
                </p>
                <button id="kitchen-seed-order-btn" class="btn-secondary mt-4">
                  Simulate New Highway Order
                </button>
              </div>
            `}
          </div>

          <!-- Right Column: Live Runner Dispatch & Highway Safety Feed -->
          <div class="kitchen-right-col">
            <div class="runner-dispatch-card glass-panel">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-sm text-gray-900">🏃 Stationed Highway Runners</h3>
                <span class="text-xs text-emerald-700 font-semibold">2 Available at Bay</span>
              </div>

              <div class="runners-list-mini">
                ${DELIVIA_DATA.runners.slice(0, 2).map(runner => `
                  <div class="runner-item-mini">
                    <div class="flex items-center gap-2.5">
                      <div class="text-2xl">${runner.avatar}</div>
                      <div>
                        <div class="font-bold text-xs text-gray-900">${runner.name}</div>
                        <div class="text-[10px] text-gray-500">⭐ ${runner.rating} • ${runner.totalHandOffs} hand-offs (Avg: ${runner.avgHandOffTimeSeconds}s)</div>
                      </div>
                    </div>
                    <span class="badge ${runner.id === (order ? order.runnerId : 'runner_1') ? 'badge-emerald' : 'badge-gray'}">
                      ${runner.id === (order ? order.runnerId : 'runner_1') ? 'Assigned' : 'Standby'}
                    </span>
                  </div>
                `).join('')}
              </div>

              <div class="highway-safety-tip-box mt-4">
                <div class="font-bold text-xs text-emerald-900">🛡️ Delivia Zero-Speed Safety Protocol</div>
                <p class="text-[11px] text-gray-600 mt-1">
                  Runners will ONLY hand over food once the vehicle has come to a complete stop inside designated safe lay-by bays (Speed &le; 5 km/h).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
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
    const kitchenTriggerDelta = vehicleEtaMinutes - order.prepTimeMinutes;

    const etaEl = document.getElementById('kds-approaching-eta');
    if (etaEl) etaEl.innerHTML = `${vehicleEtaMinutes.toFixed(1)} <small class="text-xs">min</small>`;

    const subEl = document.getElementById('kds-approaching-sub');
    if (subEl) subEl.innerText = `${distanceToHandoff.toFixed(1)} km out @ ${Math.round(state.currentSpeedKmph)} km/h`;

    const statusEl = document.getElementById('kds-trigger-status');
    if (statusEl) {
      const isKitchenTriggerFired = order.kitchenTicketFired || kitchenTriggerDelta <= 0 || order.status !== 'PLACED';
      const isPreparing = order.status === 'PREPARING' || order.status === 'KITCHEN_TRIGGERED';
      const isReady = order.status === 'FOOD_READY' || order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED';
      const isCompleted = order.status === 'COMPLETED';

      statusEl.className = `synced-trigger-status-box ${isKitchenTriggerFired ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`;
      statusEl.innerText = isCompleted ? '🎉 Order Hand-off Completed on Schedule!' :
        isReady ? '✅ Food Packed & With Runner at Safe Bay!' :
        isPreparing ? '🔥 KITCHEN TICKET FIRED — COOKING NOW!' :
        `⏳ Auto-fires in ${Math.max(0, kitchenTriggerDelta).toFixed(1)} min when car is ${order.prepTimeMinutes}m away`;
    }
  }

  bindEvents(container) {
    const fireBtn = container.querySelector('#manual-fire-ticket-btn');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('PREPARING');
      });
    }

    const readyBtn = container.querySelector('#mark-ready-btn');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        deliviaState.updateOrderStatus('FOOD_READY');
      });
    }

    const seedBtn = container.querySelector('#kitchen-seed-order-btn');
    if (seedBtn) {
      seedBtn.addEventListener('click', () => {
        deliviaState.placeOrder();
      });
    }

    container.querySelectorAll('.adjust-time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(e.currentTarget.dataset.delta, 10);
        deliviaState.adjustPrepTime(delta);
        deliviaAudio.playChime();
      });
    });
  }
}

const deliviaRestaurantView = new DeliviaRestaurantView();
