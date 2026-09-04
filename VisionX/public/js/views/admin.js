/**
 * DELIVIA - Admin / Ops Live Command Center View
 * Full highway radar map, real-time order fleet oversight,
 * manual exception overrides, and AI demand forecasting charts.
 */

class DeliviaAdminView {
  constructor() {
    this.forecastChart = null;
  }

  render(container) {
    const state = deliviaState.getState();
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
    const order = state.activeOrder;
    const hasOrder = order && order.status !== 'NONE';

    // Mock multi-order fleet table for admin
    const activeOrdersList = [
      ...(hasOrder ? [order] : []),
      {
        id: 'DLV-8712',
        travelerName: 'Anil Kapoor (Passenger)',
        vehiclePlate: 'DL-01-AB-7890',
        restaurantId: 'rest_highway_king',
        handoffId: 'hp_yamuna_1',
        totalAmount: 370,
        status: 'COMPLETED',
        prepTimeMinutes: 9,
        runnerId: 'runner_2',
        otp: '4192'
      },
      {
        id: 'DLV-8640',
        travelerName: 'Sanjay Dutt (Truck Driver)',
        vehiclePlate: 'HR-55-CT-2211',
        restaurantId: 'rest_mathura_pedha_hub',
        handoffId: 'hp_yamuna_3',
        totalAmount: 470,
        status: 'FOOD_READY',
        prepTimeMinutes: 6,
        runnerId: 'runner_3',
        otp: '8821'
      }
    ];

    container.innerHTML = `
      <div class="admin-view-layout">
        <!-- Admin Ops Header & System Health -->
        <div class="admin-header-bar glass-panel">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-extrabold text-gray-900">🛰️ Delivia Ops & Highway Fleet Command</h2>
              <span class="badge badge-emerald">Real-Time Telemetry Live</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">Monitoring Active Expressways, Partner Dhabas, Dispatched Runners, and Safe Lay-by Bays</p>
          </div>

          <div class="admin-metrics-row">
            <div class="admin-stat-card">
              <div class="stat-title">Active Highway Orders</div>
              <div class="stat-number text-emerald-800">${activeOrdersList.length}</div>
            </div>
            <div class="admin-stat-card">
              <div class="stat-title">Safe Lay-by Hubs</div>
              <div class="stat-number text-blue-700">${DELIVIA_DATA.handoffPoints.length}</div>
            </div>
            <div class="admin-stat-card">
              <div class="stat-title">Runners On Duty</div>
              <div class="stat-number text-purple-700">${DELIVIA_DATA.runners.length}</div>
            </div>
            <div class="admin-stat-card">
              <div class="stat-title">Hand-Off Accuracy</div>
              <div class="stat-number text-salmon-700">99.4%</div>
            </div>
          </div>
        </div>

        <!-- Top Row: Full Radar Map & Controls -->
        <div class="admin-map-card glass-panel">
          <div class="map-header">
            <div class="map-title">
              <span class="live-dot"></span> Full-Expressway Multi-Entity Radar Map
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-gray">Showing: ${activeRoute.name}</span>
              <button id="admin-reset-demo-btn" class="btn-secondary text-xs px-2.5 py-1">
                🔄 Reset Demo State
              </button>
            </div>
          </div>
          <div id="admin-map-container" class="admin-map-box"></div>
        </div>

        <!-- Bottom Row: 2-Column Grid (Order Fleet Table & AI Demand Forecasting) -->
        <div class="admin-bottom-grid">
          <!-- Left Column: Live Order Fleet Table with Override Actions -->
          <div class="admin-table-card glass-panel">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-sm text-gray-900">📋 Active Highway Order Stream</h3>
              <span class="text-xs text-gray-500">${activeOrdersList.length} active records</span>
            </div>

            <div class="overflow-x-auto">
              <table class="delivia-data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Vehicle Plate</th>
                    <th>Restaurant</th>
                    <th>Safe Lay-by Bay</th>
                    <th>Status</th>
                    <th>Runner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeOrdersList.map(o => {
                    const r = DELIVIA_DATA.restaurants.find(rest => rest.id === o.restaurantId);
                    const h = DELIVIA_DATA.handoffPoints.find(hp => hp.id === o.handoffId);
                    const runner = DELIVIA_DATA.runners.find(run => run.id === o.runnerId);

                    return `
                      <tr>
                        <td class="font-mono font-bold text-emerald-900">${o.id}</td>
                        <td class="font-semibold text-gray-800">${o.vehiclePlate}</td>
                        <td class="text-xs text-gray-600">${r ? r.name.split(' ')[0] + ' ' + (r.name.split(' ')[1] || '') : 'Dhaba'}</td>
                        <td class="text-xs text-gray-600">${h ? h.shortName : 'Bay #1'}</td>
                        <td>
                          <span class="status-pill status-${o.status.toLowerCase()} text-[10px]">
                            ${o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td class="text-xs">${runner ? runner.name.split(' ')[0] : 'Auto'}</td>
                        <td>
                          <div class="flex items-center gap-1">
                            <button class="action-mini-btn admin-advance-btn" data-order-id="${o.id}">⚡ Advance</button>
                            <button class="action-mini-btn admin-alert-btn" data-order-id="${o.id}">⚠️ Alert</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: AI Demand Forecasting Chart -->
          <div class="admin-forecast-card glass-panel">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="font-bold text-sm text-gray-900">📈 AI Route Demand & Transit Volume Forecaster</h3>
                <p class="text-[11px] text-gray-500">Predicted orders per hour across highway safe hand-off bays</p>
              </div>
              <span class="badge badge-emerald">Peak: 13:00 (Lunch Rush)</span>
            </div>

            <div class="chart-container">
              <canvas id="admin-forecast-canvas" height="180"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.initMap(state, activeRoute);
    this.renderForecastChart();
  }

  updateTick(state) {
    deliviaMapManager.updateVehicleMarker('admin-map-container', {
      lat: state.currentVehicleCoords.lat,
      lng: state.currentVehicleCoords.lng,
      heading: state.currentVehicleCoords.heading,
      speedKmph: state.currentSpeedKmph,
      label: 'Vehicle (DLV-9842)'
    });
  }

  initMap(state, activeRoute) {
    setTimeout(() => {
      const map = deliviaMapManager.initMap('admin-map-container', {
        center: [27.8400, 77.7050],
        zoom: 9
      });

      if (map) {
        deliviaMapManager.renderRoute('admin-map-container', activeRoute);
        deliviaMapManager.renderHandoffPoints('admin-map-container', DELIVIA_DATA.handoffPoints, state.activeOrder ? state.activeOrder.handoffId : null);
        deliviaMapManager.renderRestaurants('admin-map-container', DELIVIA_DATA.restaurants, state.cart.restaurantId);
        deliviaMapManager.updateVehicleMarker('admin-map-container', {
          lat: state.currentVehicleCoords.lat,
          lng: state.currentVehicleCoords.lng,
          heading: state.currentVehicleCoords.heading,
          speedKmph: state.currentSpeedKmph,
          label: 'Vehicle (DLV-9842)'
        });
      }
    }, 50);
  }

  renderForecastChart() {
    setTimeout(() => {
      const canvas = document.getElementById('admin-forecast-canvas');
      if (!canvas || typeof Chart === 'undefined') return;

      const forecastData = deliviaDemandForecaster.generateForecast(DELIVIA_DATA.handoffPoints.slice(0, 3));

      if (this.forecastChart) {
        this.forecastChart.destroy();
      }

      const ctx = canvas.getContext('2d');
      this.forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: forecastData.hours.filter((_, i) => i % 2 === 0), // Every 2 hours for clean axis
          datasets: forecastData.datasets.map(d => ({
            label: d.handoffName,
            data: d.hourlyOrders.filter((_, i) => i % 2 === 0),
            borderColor: d.color,
            backgroundColor: d.color + '20',
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 3
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { size: 10, family: 'Outfit' } }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: {
              beginAtZero: true,
              grid: { color: '#E5E7EB' },
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }, 100);
  }

  bindEvents(container) {
    const resetBtn = container.querySelector('#admin-reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        deliviaState.resetDemo();
        deliviaAudio.playChime();
      });
    }

    container.querySelectorAll('.admin-advance-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const state = deliviaState.getState();
        const nextMap = {
          'PLACED': 'PREPARING',
          'PREPARING': 'FOOD_READY',
          'FOOD_READY': 'RUNNER_AT_LAYBY',
          'RUNNER_AT_LAYBY': 'VEHICLE_ARRIVED',
          'VEHICLE_ARRIVED': 'COMPLETED',
          'COMPLETED': 'PLACED'
        };
        const cur = state.activeOrder ? state.activeOrder.status : 'PLACED';
        deliviaState.updateOrderStatus(nextMap[cur] || 'PLACED');
      });
    });

    container.querySelectorAll('.admin-alert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deliviaAudio.playPullOverAlert();
      });
    });
  }
}

const deliviaAdminView = new DeliviaAdminView();
