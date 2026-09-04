/**
 * DELIVIA - Main Application Orchestrator & Simulation Clock
 * Handles role routing, background GPS ticker, auto demo showcase, and audio triggers.
 */

class DeliviaApp {
  constructor() {
    this.simInterval = null;
    this.autoDemoTimer = null;
  }

  init() {
    console.log('🚀 Initializing DELIVIA Platform...');

    // Subscribe to state updates to trigger re-renders or granular tick updates
    deliviaState.subscribe((state, changeType) => {
      if (changeType === 'TICK') {
        this.updateTickViews(state);
        this.updateHeaderBadges(state);
      } else {
        this.renderCurrentView();
        this.updateHeaderBadges(state);
      }
    });

    // Setup navigation role triggers
    this.setupHeaderEvents();

    // Start highway simulation movement clock
    this.startSimulationClock();

    // Initial render
    this.renderCurrentView();
    this.updateHeaderBadges(deliviaState.getState());
  }

  updateTickViews(state) {
    switch (state.activeRole) {
      case 'traveler':
        if (typeof deliviaTravelerView.updateTick === 'function') {
          deliviaTravelerView.updateTick(state);
        }
        break;
      case 'restaurant':
        if (typeof deliviaRestaurantView.updateTick === 'function') {
          deliviaRestaurantView.updateTick(state);
        }
        break;
      case 'runner':
        if (typeof deliviaRunnerView.updateTick === 'function') {
          deliviaRunnerView.updateTick(state);
        }
        break;
      case 'admin':
        if (typeof deliviaAdminView.updateTick === 'function') {
          deliviaAdminView.updateTick(state);
        }
        break;
      case 'split':
        if (typeof deliviaSplitView.updateTick === 'function') {
          deliviaSplitView.updateTick(state);
        }
        break;
      default:
        if (typeof deliviaTravelerView.updateTick === 'function') {
          deliviaTravelerView.updateTick(state);
        }
    }
  }

  setupHeaderEvents() {
    const navButtons = document.querySelectorAll('.role-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.dataset.role;
        deliviaState.setActiveRole(role);
        deliviaAudio.playChime();
      });
    });

    // Sound toggle button
    const soundBtn = document.getElementById('global-sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = !deliviaAudio.enabled;
        deliviaAudio.toggleSound();
        soundBtn.innerHTML = deliviaAudio.enabled ? '🔊 Sound On' : '🔇 Sound Off';
        soundBtn.classList.toggle('sound-muted', !deliviaAudio.enabled);
        if (deliviaAudio.enabled) deliviaAudio.playChime();
      });
    }

    // Auto Demo Showcase button
    const autoDemoBtn = document.getElementById('auto-demo-showcase-btn');
    if (autoDemoBtn) {
      autoDemoBtn.addEventListener('click', () => {
        this.triggerAutoDemo();
      });
    }
  }

  renderCurrentView() {
    const container = document.getElementById('app-main-viewport');
    if (!container) return;

    const state = deliviaState.getState();

    // Highlight active role button
    document.querySelectorAll('.role-nav-btn').forEach(btn => {
      btn.classList.toggle('nav-active', btn.dataset.role === state.activeRole);
    });

    switch (state.activeRole) {
      case 'traveler':
        deliviaTravelerView.render(container);
        break;
      case 'restaurant':
        deliviaRestaurantView.render(container);
        break;
      case 'runner':
        deliviaRunnerView.render(container);
        break;
      case 'admin':
        deliviaAdminView.render(container);
        break;
      case 'split':
        deliviaSplitView.render(container);
        break;
      default:
        deliviaTravelerView.render(container);
    }
  }

  updateHeaderBadges(state) {
    const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
    
    const routeTag = document.getElementById('header-route-tag');
    if (routeTag) {
      routeTag.innerText = activeRoute.shortName;
    }

    const speedTag = document.getElementById('header-speed-tag');
    if (speedTag) {
      speedTag.innerText = `${Math.round(state.currentSpeedKmph)} km/h`;
    }

    const orderTag = document.getElementById('header-order-status-tag');
    if (orderTag) {
      if (state.activeOrder && state.activeOrder.status !== 'NONE') {
        orderTag.style.display = 'inline-flex';
        orderTag.innerText = `Order: ${state.activeOrder.status.replace('_', ' ')}`;
        orderTag.className = `badge status-badge status-${state.activeOrder.status.toLowerCase()}`;
      } else {
        orderTag.style.display = 'none';
      }
    }
  }

  /**
   * Background highway movement tick
   * Moves simulated vehicle forward along route polyline
   */
  startSimulationClock() {
    if (this.simInterval) clearInterval(this.simInterval);

    this.simInterval = setInterval(() => {
      const state = deliviaState.getState();
      if (!state.isSimulationPlaying) return;

      const activeRoute = DELIVIA_DATA.routes.find(r => r.id === state.activeRouteId) || DELIVIA_DATA.routes[0];
      
      // Speed in km per second
      const speedKmPerSec = (state.currentSpeedKmph / 3600) * state.simulationSpeedMultiplier;
      // Tick is 800ms
      const distanceMovedKm = speedKmPerSec * 0.8 * 8; // scaled for lively demo visibility

      const newKm = state.currentKmAlongRoute + distanceMovedKm;
      const newPercent = (newKm / activeRoute.totalDistanceKm) * 100;

      if (newPercent < 100) {
        deliviaState.setVehicleProgress(newPercent, true);
      } else {
        // Loop back to start if reached destination
        deliviaState.setVehicleProgress(5, true);
      }
    }, 800);
  }

  /**
   * Runs an automated 45-second judge demo simulation with live transitions
   */
  triggerAutoDemo() {
    deliviaAudio.playChime();
    const demoBanner = document.createElement('div');
    demoBanner.className = 'auto-demo-toast';
    demoBanner.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="animate-spin">🌀</span>
        <strong class="text-white">Auto-Demo Showcase Running:</strong>
        <span>Simulating Delhi &rarr; Agra journey with real-time Kitchen &amp; Runner sync!</span>
      </div>
    `;
    document.body.appendChild(demoBanner);

    setTimeout(() => demoBanner.remove(), 7000);

    // 1. Switch to 3-in-1 Split View to see all roles sync
    deliviaState.setActiveRole('split');
    deliviaState.setVehicleProgress(15);
    deliviaState.setVehicleSpeed(85);
    deliviaState.setSimulationPlaying(true);
    deliviaState.setSimulationSpeedMultiplier(2);

    // 2. Place Order at Shiva Dhaba
    deliviaState.placeOrder();

    // 3. Fast-forward vehicle towards Tappal Bay (Km 70)
    setTimeout(() => {
      deliviaState.setVehicleProgress(32); // Km ~52 -> triggers kitchen cooking!
    }, 3000);

    setTimeout(() => {
      deliviaState.setVehicleProgress(38); // Km ~63 -> food ready & runner to bay
      deliviaState.updateOrderStatus('FOOD_READY');
    }, 6000);

    setTimeout(() => {
      deliviaState.setVehicleProgress(41.5); // Km ~68.5 -> 2-min warning chime
    }, 9000);

    setTimeout(() => {
      deliviaState.setVehicleProgress(42.4); // Km 70 -> car pulled over in lay-by, speed 0
      deliviaState.setVehicleSpeed(0);
      deliviaState.updateOrderStatus('VEHICLE_ARRIVED');
    }, 12000);

    setTimeout(() => {
      // Complete OTP Verification
      deliviaState.updateOrderStatus('COMPLETED');
    }, 15000);
  }
}

const deliviaApp = new DeliviaApp();

window.addEventListener('DOMContentLoaded', () => {
  deliviaApp.init();
});
