/**
 * DELIVIA - Traveler Web App View
 * Route selection, live simulation controls, AI restaurant discovery,
 * cart & checkout, synced ETA countdown, pull-over alerts, and OTP/QR pass.
 */

class DeliviaTravelerView {
  constructor() {
    this.selectedRestaurantForMenu = null;
    this.cartDrawerOpen = false;
  }

  render(container) {
    const state = deliviaState.getState();
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
    const order = state.activeOrder;
    const hasActiveOrder = order && order.status !== 'NONE';

    // Compute ranked restaurants ahead
    const rankedRestaurants = deliviaRestaurantRanker.rankRestaurants(
      DELIVIA_DATA.restaurants.filter(r => r.routeId === state.activeRouteId),
      state.currentKmAlongRoute,
      state.currentSpeedKmph,
      deliviaEtaModel
    );

    // Compute handoff for active order
    let activeHandoff = null;
    let distanceToOrderHandoff = 0;
    let etaToOrderHandoff = 0;

    if (hasActiveOrder) {
      activeHandoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId);
      if (activeHandoff) {
        distanceToOrderHandoff = Math.max(0, activeHandoff.highwayKm - state.currentKmAlongRoute);
        const etaAnalysis = deliviaEtaModel.predictEta({
          distanceKm: Math.max(0.1, distanceToOrderHandoff),
          currentSpeedKmph: state.currentSpeedKmph,
          weather: state.weather,
          trafficCongestionIndex: state.trafficCongestionIndex
        });
        etaToOrderHandoff = etaAnalysis.refinedEtaMinutes;
      }
    }

    container.innerHTML = `
      <div class="traveler-view-layout">
        <!-- Top Highway Telemetry & Simulation Controller -->
        <div class="sim-control-bar glass-panel">
          <div class="sim-left">
            <div class="route-select-wrapper">
              <label class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">🛣️ Active Expressway</label>
              <select id="traveler-route-select" class="route-select-dropdown">
                ${DELIVIA_DATA.routes.map(r => `
                  <option value="${r.id}" ${r.id === state.activeRouteId ? 'selected' : ''}>
                    ${r.name} (${r.totalDistanceKm} km)
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="telemetry-pill">
              <span class="telemetry-label">CURRENT SPEED</span>
              <span class="telemetry-val text-emerald-700 font-bold" id="traveler-speed-val">${Math.round(state.currentSpeedKmph)} <small>km/h</small></span>
            </div>

            <div class="telemetry-pill">
              <span class="telemetry-label">HIGHWAY PROGRESS</span>
              <span class="telemetry-val font-bold text-gray-800" id="traveler-progress-val">${state.currentKmAlongRoute} / ${activeRoute.totalDistanceKm} <small>km</small></span>
            </div>
          </div>

          <div class="sim-right">
            <button id="sim-play-pause-btn" class="sim-btn ${state.isSimulationPlaying ? 'btn-active' : ''}">
              ${state.isSimulationPlaying ? '⏸️ Pause Sim' : '▶️ Resume Sim'}
            </button>

            <div class="sim-speed-toggles">
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 1 ? 'active' : ''}" data-speed="1">1x</button>
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 2 ? 'active' : ''}" data-speed="2">2x</button>
              <button class="speed-toggle-btn ${state.simulationSpeedMultiplier === 5 ? 'active' : ''}" data-speed="5">5x</button>
            </div>

            <div class="sim-slider-group">
              <span class="text-xs text-gray-500 font-medium">Scrub Route:</span>
              <input type="range" id="sim-progress-slider" min="0" max="100" step="0.5" value="${state.routeProgressPercent}" class="sim-range-slider" />
              <span class="text-xs font-bold text-gray-700 w-10 text-right" id="sim-slider-percent-tag">${Math.round(state.routeProgressPercent)}%</span>
            </div>
          </div>
        </div>

        <!-- 2-Minute Pull-Over Emergency Alert (Conditional) -->
        ${hasActiveOrder && order.pullOverAlertShown && order.status !== 'COMPLETED' ? `
          <div class="pullover-alert-banner animate-bounce-subtle" id="traveler-pullover-banner">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <div class="alert-title">PREPARE TO PULL OVER IN ${etaToOrderHandoff.toFixed(1)} MIN (~${distanceToOrderHandoff.toFixed(1)} km)</div>
              <div class="alert-desc">
                Decelerate safely and steer into <strong>${activeHandoff ? activeHandoff.laneInstruction : 'Left Lay-by Bay'}</strong> at <strong>${activeHandoff ? activeHandoff.name : 'Designated Stop'}</strong>. Runner is waiting at the bay!
              </div>
            </div>
            <div class="alert-speed-indicator">
              Target: <span class="bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded text-xs">0–5 km/h</span>
            </div>
          </div>
        ` : ''}

        <!-- Main 2-Column Content Grid -->
        <div class="traveler-main-grid">
          <!-- Left Column: Interactive Map & Live Active Order Card -->
          <div class="traveler-left-col">
            <div class="map-card glass-panel">
              <div class="map-header">
                <div class="map-title">
                  <span class="live-dot"></span> Live Highway Route Radar
                </div>
                <div class="map-badges">
                  <span class="badge badge-emerald">GPS Mode: Simulated</span>
                  <span class="badge badge-salmon">${activeRoute.shortName}</span>
                </div>
              </div>
              <div id="traveler-map-container" class="map-view-box"></div>
            </div>

            <!-- Active Highway Order Live Tracking Card -->
            ${hasActiveOrder ? this.renderActiveOrderCard(order, activeHandoff, distanceToOrderHandoff, etaToOrderHandoff) : `
              <div class="empty-order-card glass-panel text-center p-6">
                <div class="text-4xl mb-2">🚗💨</div>
                <h4 class="text-base font-bold text-gray-800">No Active Highway Order</h4>
                <p class="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Select a partner dhaba along your forward route below. Our AI syncs your arrival speed with kitchen cooking time so food is ready right as you pull in!
                </p>
              </div>
            `}
          </div>

          <!-- Right Column: AI-Ranked Forward Restaurants & Cart -->
          <div class="traveler-right-col">
            <div class="restaurants-panel glass-panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">🍽️ Dhabas & Eateries Along Your Path</h3>
                  <p class="panel-subtitle">AI-ranked by forward distance and kitchen prep synchronization</p>
                </div>
                <button id="open-cart-btn" class="cart-trigger-btn">
                  <span>🛒 Cart (${state.cart.items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span class="cart-total-pill">₹${state.cart.totalAmount}</span>
                </button>
              </div>

              <div class="restaurant-cards-list">
                ${rankedRestaurants.map(r => this.renderRestaurantCard(r, state)).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Modal (Conditional) -->
        <div id="menu-modal-container"></div>

        <!-- Cart Drawer (Conditional) -->
        <div id="cart-drawer-container"></div>
      </div>
    `;

    this.bindEvents(container);
    this.initMap(state, activeRoute);

    // If order has OTP/QR pass, render canvas QR
    if (hasActiveOrder) {
      const qrCanvas = document.getElementById('traveler-qr-canvas');
      if (qrCanvas) {
        deliviaQr.renderQrCanvas(qrCanvas, `DELIVIA-ORDER-${order.id}-OTP-${order.otp}`);
      }
    }
  }

  renderActiveOrderCard(order, handoff, distanceKm, etaMin) {
    const restaurant = DELIVIA_DATA.restaurants.find(r => r.id === order.restaurantId) || DELIVIA_DATA.restaurants[0];
    const isReady = order.status === 'FOOD_READY' || order.status === 'RUNNER_AT_LAYBY' || order.status === 'VEHICLE_ARRIVED';
    const isCompleted = order.status === 'COMPLETED';

    // Stage progression index (0 to 6)
    const stages = [
      { key: 'PLACED', label: 'Order Placed', icon: '📝' },
      { key: 'PREPARING', label: 'Kitchen Cooking', icon: '🍳' },
      { key: 'FOOD_READY', label: 'Packed & Fresh', icon: '📦' },
      { key: 'RUNNER_AT_LAYBY', label: 'Runner At Lay-by', icon: '🏃' },
      { key: 'VEHICLE_ARRIVED', label: 'Car Pulled In', icon: '🅿️' },
      { key: 'COMPLETED', label: 'Hand-off Done', icon: '🎉' }
    ];

    const currentStageIdx = stages.findIndex(s => s.key === order.status);

    return `
      <div class="active-order-card glass-panel">
        <div class="order-card-header">
          <div>
            <div class="flex items-center gap-2">
              <span class="order-id-tag font-mono font-bold text-emerald-900">${order.id}</span>
              <span class="status-pill status-${order.status.toLowerCase()}">${order.status.replace('_', ' ')}</span>
            </div>
            <div class="text-sm font-bold text-gray-800 mt-1">${restaurant.name}</div>
          </div>

          <div class="eta-countdown-box ${isReady ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}">
            <div class="text-[10px] uppercase font-bold text-gray-500">HAND-OFF IN</div>
            <div class="text-xl font-extrabold ${isReady ? 'text-emerald-700' : 'text-amber-700'}" id="traveler-order-countdown-val">
              ${isCompleted ? 'Done!' : `${etaMin.toFixed(1)} <small class="text-xs font-normal">min</small>`}
            </div>
            <div class="text-[10px] text-gray-500" id="traveler-order-countdown-dist">${distanceKm.toFixed(1)} km ahead</div>
          </div>
        </div>

        <!-- 6-Stage Progress Stepper -->
        <div class="order-stepper">
          ${stages.map((stage, idx) => {
            const isPassed = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return `
              <div class="step-item ${isPassed ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}">
                <div class="step-circle">${stage.icon}</div>
                <div class="step-label">${stage.label}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Safe Pull-over Hand-off Instructions -->
        <div class="handoff-location-box">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>📍 Designated Safe Pull-Over Bay:</span>
                <span class="underline">${handoff ? handoff.name : 'Highway Lay-by'}</span>
              </div>
              <div class="text-xs text-gray-600 mt-0.5">${handoff ? handoff.laneInstruction : 'Left Slow Bay'}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Max Speed: 5 km/h
              </span>
            </div>
          </div>
        </div>

        <!-- Hand-off Verification Pass (OTP & QR) -->
        ${!isCompleted ? `
          <div class="handoff-pass-box">
            <div class="pass-info">
              <div class="pass-title">DIGITAL HAND-OFF PASS</div>
              <div class="pass-desc">Show this 4-digit code or QR to the Delivia runner at the pull-over bay:</div>
              <div class="otp-display">
                <span class="otp-digit">${order.otp[0]}</span>
                <span class="otp-digit">${order.otp[1]}</span>
                <span class="otp-digit">${order.otp[2]}</span>
                <span class="otp-digit">${order.otp[3]}</span>
              </div>
              <div class="vehicle-plate-tag">🚗 Car: ${order.vehiclePlate}</div>
            </div>
            <div class="pass-qr">
              <canvas id="traveler-qr-canvas" width="100" height="100" class="qr-canvas-shadow"></canvas>
            </div>
          </div>
        ` : `
          <div class="handoff-completed-banner">
            <div class="text-2xl">🎉</div>
            <div>
              <div class="font-bold text-emerald-900 text-sm">Food Handed Off Successfully!</div>
              <div class="text-xs text-emerald-700">Thank you for dining with Delivia on the highway. Drive safe!</div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  renderRestaurantCard(restaurant, state) {
    const isSelected = state.cart.restaurantId === restaurant.id;
    const isPassed = !restaurant.isAhead;

    return `
      <div class="restaurant-card ${isPassed ? 'card-passed' : ''} ${restaurant.isAiRecommended ? 'card-recommended' : ''}">
        <div class="card-header-row">
          <div class="flex items-center gap-3">
            <div class="rest-avatar">${restaurant.image || '🍛'}</div>
            <div>
              <div class="rest-title">${restaurant.name}</div>
              <div class="rest-meta">
                <span class="rating-star">⭐ ${restaurant.rating}</span>
                <span>•</span>
                <span>${restaurant.cuisine}</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            ${restaurant.badge ? `<span class="ai-badge">${restaurant.badge}</span>` : ''}
            <div class="distance-ahead-tag mt-1">
              ${isPassed ? 'Passed' : `📍 ${restaurant.distanceAheadKm} km ahead`}
            </div>
          </div>
        </div>

        <div class="card-ai-explanation">
          ${restaurant.aiExplanation || `Located on your forward travel trajectory.`}
        </div>

        <div class="card-footer-row">
          <div class="prep-indicator">
            ⏱️ Avg Kitchen Prep: <strong>${restaurant.avgPrepTimeMin} mins</strong>
          </div>

          <div class="card-actions">
            <button class="btn-secondary view-menu-btn" data-rest-id="${restaurant.id}">
              Browse Menu (${restaurant.menu.length})
            </button>
            <button class="btn-primary quick-add-btn" data-rest-id="${restaurant.id}" data-item-id="${restaurant.menu[0].id}">
              + Add ${restaurant.menu[0].name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  updateTick(state) {
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];

    // 1. Update speed & progress in telemetry bar
    const speedEl = document.getElementById('traveler-speed-val');
    if (speedEl) speedEl.innerHTML = `${Math.round(state.currentSpeedKmph)} <small>km/h</small>`;

    const progEl = document.getElementById('traveler-progress-val');
    if (progEl) progEl.innerHTML = `${state.currentKmAlongRoute} / ${activeRoute.totalDistanceKm} <small>km</small>`;

    // 2. Update slider if user is not actively dragging it
    const slider = document.getElementById('sim-progress-slider');
    if (slider && document.activeElement !== slider) {
      slider.value = state.routeProgressPercent;
    }
    const sliderPct = document.getElementById('sim-slider-percent-tag');
    if (sliderPct) sliderPct.innerText = `${Math.round(state.routeProgressPercent)}%`;

    // 3. Update map car marker smoothly
    deliviaMapManager.updateVehicleMarker('traveler-map-container', {
      lat: state.currentVehicleCoords.lat,
      lng: state.currentVehicleCoords.lng,
      heading: state.currentVehicleCoords.heading,
      speedKmph: state.currentSpeedKmph
    });

    // 4. Update ETA countdown in active order card if visible
    const order = state.activeOrder;
    if (order && order.status !== 'NONE') {
      const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId);
      if (handoff) {
        const distanceToHandoff = Math.max(0, handoff.highwayKm - state.currentKmAlongRoute);
        const etaAnalysis = deliviaEtaModel.predictEta({
          distanceKm: Math.max(0.1, distanceToHandoff),
          currentSpeedKmph: state.currentSpeedKmph,
          weather: state.weather,
          trafficCongestionIndex: state.trafficCongestionIndex
        });
        const etaMin = etaAnalysis.refinedEtaMinutes;

        const countdownVal = document.getElementById('traveler-order-countdown-val');
        if (countdownVal) {
          countdownVal.innerHTML = order.status === 'COMPLETED' ? 'Done!' : `${etaMin.toFixed(1)} <small class="text-xs font-normal">min</small>`;
        }
        const countdownDist = document.getElementById('traveler-order-countdown-dist');
        if (countdownDist) {
          countdownDist.innerText = `${distanceToHandoff.toFixed(1)} km ahead`;
        }
      }
    }
  }

  initMap(state, activeRoute) {
    setTimeout(() => {
      const map = deliviaMapManager.initMap('traveler-map-container', {
        center: [state.currentVehicleCoords.lat, state.currentVehicleCoords.lng],
        zoom: 10
      });

      if (map) {
        deliviaMapManager.renderRoute('traveler-map-container', activeRoute);
        deliviaMapManager.renderHandoffPoints('traveler-map-container', DELIVIA_DATA.handoffPoints, state.activeOrder ? state.activeOrder.handoffId : null);
        deliviaMapManager.renderRestaurants('traveler-map-container', DELIVIA_DATA.restaurants, state.cart.restaurantId);
        deliviaMapManager.updateVehicleMarker('traveler-map-container', {
          lat: state.currentVehicleCoords.lat,
          lng: state.currentVehicleCoords.lng,
          heading: state.currentVehicleCoords.heading,
          speedKmph: state.currentSpeedKmph
        });
      }
    }, 50);
  }

  bindEvents(container) {
    // Route Selection
    const routeSelect = container.querySelector('#traveler-route-select');
    if (routeSelect) {
      routeSelect.addEventListener('change', (e) => {
        deliviaState.selectRoute(e.target.value);
      });
    }

    // Play / Pause Simulation
    const playPauseBtn = container.querySelector('#sim-play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        const state = deliviaState.getState();
        deliviaState.setSimulationPlaying(!state.isSimulationPlaying);
      });
    }

    // Speed Multipliers (1x, 2x, 5x)
    container.querySelectorAll('.speed-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseInt(e.currentTarget.dataset.speed, 10);
        deliviaState.setSimulationSpeedMultiplier(speed);
      });
    });

    // Scrub Slider
    const progressSlider = container.querySelector('#sim-progress-slider');
    if (progressSlider) {
      progressSlider.addEventListener('input', (e) => {
        deliviaState.setVehicleProgress(parseFloat(e.target.value));
      });
    }

    // View Menu Buttons
    container.querySelectorAll('.view-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const restId = e.currentTarget.dataset.restId;
        this.openMenuModal(restId);
      });
    });

    // Quick Add Buttons
    container.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const restId = e.currentTarget.dataset.restId;
        const itemId = e.currentTarget.dataset.itemId;
        const rest = DELIVIA_DATA.restaurants.find(r => r.id === restId);
        if (rest) {
          const item = rest.menu.find(m => m.id === itemId);
          if (item) {
            deliviaState.addToCart(restId, item);
            deliviaAudio.playChime();
          }
        }
      });
    });

    // Open Cart Drawer
    const openCartBtn = container.querySelector('#open-cart-btn');
    if (openCartBtn) {
      openCartBtn.addEventListener('click', () => {
        this.openCartDrawer();
      });
    }
  }

  openMenuModal(restaurantId) {
    const restaurant = DELIVIA_DATA.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;

    const modalContainer = document.getElementById('menu-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop">
        <div class="menu-modal glass-panel">
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div class="text-3xl">${restaurant.image || '🍛'}</div>
              <div>
                <h3 class="modal-title">${restaurant.name}</h3>
                <p class="modal-subtitle">${restaurant.tagline}</p>
              </div>
            </div>
            <button id="close-menu-btn" class="modal-close-btn">&times;</button>
          </div>

          <div class="menu-items-grid">
            ${restaurant.menu.map(item => `
              <div class="menu-item-card">
                <div class="item-info">
                  <div class="item-badge-row">
                    <span class="veg-badge ${item.veg ? 'is-veg' : 'is-non-veg'}"></span>
                    ${item.bestSeller ? '<span class="bestseller-pill">⭐ Bestseller</span>' : ''}
                    <span class="item-prep-time">⏱️ ${item.prepTimeMin}m prep</span>
                  </div>
                  <h4 class="item-name">${item.name}</h4>
                  <p class="item-desc">${item.desc}</p>
                  <div class="item-price">₹${item.price}</div>
                </div>

                <div class="item-action">
                  <button class="add-to-cart-action-btn" data-item-id="${item.id}">
                    + Add to Cart
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="modal-footer">
            <button id="close-menu-footer-btn" class="btn-secondary">Close Menu</button>
            <button id="checkout-from-menu-btn" class="btn-primary">
              View Cart & Checkout (${deliviaState.getState().cart.items.reduce((s, i) => s + i.quantity, 0)})
            </button>
          </div>
        </div>
      </div>
    `;

    modalContainer.querySelector('#close-menu-btn').addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });
    modalContainer.querySelector('#close-menu-footer-btn').addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });
    modalContainer.querySelector('#checkout-from-menu-btn').addEventListener('click', () => {
      modalContainer.innerHTML = '';
      this.openCartDrawer();
    });

    modalContainer.querySelectorAll('.add-to-cart-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        const item = restaurant.menu.find(m => m.id === itemId);
        if (item) {
          deliviaState.addToCart(restaurant.id, item);
          deliviaAudio.playChime();
          btn.innerText = '✓ Added!';
          btn.classList.add('btn-added');
          setTimeout(() => {
            btn.innerText = '+ Add to Cart';
            btn.classList.remove('btn-added');
          }, 1200);
        }
      });
    });
  }

  openCartDrawer() {
    const drawerContainer = document.getElementById('cart-drawer-container');
    if (!drawerContainer) return;

    const state = deliviaState.getState();
    const restaurant = DELIVIA_DATA.restaurants.find(r => r.id === state.cart.restaurantId) || DELIVIA_DATA.restaurants[0];
    const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === restaurant.associatedHandoffId) || DELIVIA_DATA.handoffPoints[0];

    drawerContainer.innerHTML = `
      <div class="drawer-backdrop">
        <div class="cart-drawer glass-panel">
          <div class="drawer-header">
            <div>
              <h3 class="drawer-title">🛒 Highway Food Cart</h3>
              <p class="drawer-subtitle">${restaurant.name}</p>
            </div>
            <button id="close-cart-btn" class="drawer-close-btn">&times;</button>
          </div>

          <div class="drawer-content">
            ${state.cart.items.length === 0 ? `
              <div class="text-center py-12 text-gray-500">
                <div class="text-4xl mb-2">🛒</div>
                <p class="text-sm font-semibold">Your highway cart is empty</p>
                <p class="text-xs text-gray-400 mt-1">Browse restaurants along your route to add hot meals.</p>
              </div>
            ` : `
              <div class="cart-items-list">
                ${state.cart.items.map(item => `
                  <div class="cart-item-row">
                    <div class="flex-1">
                      <div class="font-bold text-sm text-gray-800">${item.name}</div>
                      <div class="text-xs text-gray-500">₹${item.price} each</div>
                    </div>
                    <div class="quantity-controls">
                      <button class="qty-btn minus-btn" data-item-id="${item.id}">-</button>
                      <span class="qty-val">${item.quantity}</span>
                      <button class="qty-btn plus-btn" data-item-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-total font-bold text-sm text-gray-900 w-16 text-right">
                      ₹${item.price * item.quantity}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Synced Hand-off Delivery Point Info -->
              <div class="cart-handoff-info-box">
                <div class="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  <span>🅿️ Roadside Hand-off Point:</span>
                </div>
                <div class="text-xs text-gray-700 font-semibold mt-1">${handoff.name}</div>
                <div class="text-[11px] text-gray-500">${handoff.laneInstruction}</div>
              </div>

              <!-- Checkout Bill Breakdown -->
              <div class="cart-bill-summary">
                <div class="bill-row">
                  <span>Item Subtotal</span>
                  <span>₹${state.cart.totalAmount}</span>
                </div>
                <div class="bill-row">
                  <span>Highway Safe Hand-off Fee</span>
                  <span class="text-emerald-700 font-bold">₹0 (Free Hackathon Demo)</span>
                </div>
                <div class="bill-row bill-total">
                  <span>Total Amount</span>
                  <span>₹${state.cart.totalAmount}</span>
                </div>
              </div>

              <!-- Traveler Details Form -->
              <div class="traveler-details-form">
                <div class="form-group">
                  <label class="form-label">Vehicle Registration Number</label>
                  <input type="text" id="checkout-plate-input" value="${state.activeOrder ? state.activeOrder.vehiclePlate : 'UP-16-BX-4090'}" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Traveler Name</label>
                  <input type="text" id="checkout-name-input" value="${state.activeOrder ? state.activeOrder.travelerName : 'Yumna Abidi (VisionX)'}" class="form-input" />
                </div>
              </div>
            `}
          </div>

          <div class="drawer-footer">
            ${state.cart.items.length > 0 ? `
              <button id="confirm-place-order-btn" class="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                <span>⚡ Place Highway Order</span>
                <span>•</span>
                <span>₹${state.cart.totalAmount}</span>
              </button>
            ` : `
              <button id="close-empty-cart-btn" class="btn-secondary w-full">Browse Food</button>
            `}
          </div>
        </div>
      </div>
    `;

    drawerContainer.querySelector('#close-cart-btn').addEventListener('click', () => {
      drawerContainer.innerHTML = '';
    });

    const closeEmptyBtn = drawerContainer.querySelector('#close-empty-cart-btn');
    if (closeEmptyBtn) {
      closeEmptyBtn.addEventListener('click', () => {
        drawerContainer.innerHTML = '';
      });
    }

    drawerContainer.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        const item = state.cart.items.find(i => i.id === itemId);
        if (item) {
          deliviaState.addToCart(state.cart.restaurantId, item);
          this.openCartDrawer();
        }
      });
    });

    drawerContainer.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        deliviaState.removeFromCart(itemId);
        this.openCartDrawer();
      });
    });

    const placeOrderBtn = drawerContainer.querySelector('#confirm-place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        const plateInput = drawerContainer.querySelector('#checkout-plate-input').value;
        const nameInput = drawerContainer.querySelector('#checkout-name-input').value;

        deliviaState.placeOrder({
          vehiclePlate: plateInput || 'UP-16-BX-4090',
          travelerName: nameInput || 'Yumna Abidi (VisionX)'
        });

        drawerContainer.innerHTML = '';
      });
    }
  }
}

const deliviaTravelerView = new DeliviaTravelerView();
