/**
 * DELIVIA - Central State Management & Reactive Event Bus
 * Uses BroadcastChannel for instant zero-latency cross-tab and cross-view sync.
 */

class DeliviaState {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('delivia_sync_bus') : null;
    this.listeners = [];

    // Initialize state
    this.state = this.getInitialState();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
          this.state = event.data.payload;
          this.notifyListeners('REMOTE_SYNC');
        }
      };
    }
  }

  getInitialState() {
    const defaultRoute = DELIVIA_DATA.routes[0]; // Yamuna Expressway
    const defaultHandoff = DELIVIA_DATA.handoffPoints[1]; // Tappal Oasis (Km 70)
    const defaultRestaurant = DELIVIA_DATA.restaurants[0]; // Shiva Dhaba

    return {
      activeRole: 'traveler', // 'traveler', 'restaurant', 'runner', 'admin', 'split'
      activeRouteId: defaultRoute.id,
      routeProgressPercent: 15, // Starts ~25km in
      currentKmAlongRoute: 24.75, // 165 * 0.15
      currentSpeedKmph: 85,
      isSimulationPlaying: true,
      simulationSpeedMultiplier: 1, // 1x, 2x, 5x, 10x
      currentVehicleCoords: { lat: 28.3850, lng: 77.5300, heading: 145 },

      // Cart
      cart: {
        restaurantId: defaultRestaurant.id,
        items: [
          { id: 'm1', name: 'Special Paneer Butter Masala + 2 Tandoori Roti combo', price: 280, quantity: 1, prepTimeMin: 12 },
          { id: 'm4', name: 'Chilled Punjabi Sweet Lassi in Earthen Matka', price: 90, quantity: 2, prepTimeMin: 3 }
        ],
        totalAmount: 460
      },

      // Active Order
      activeOrder: {
        id: 'DLV-9842',
        travelerName: 'Yumna Abidi (VisionX)',
        travelerPhone: '+91 98765-12345',
        vehiclePlate: 'UP-16-BX-4090',
        restaurantId: defaultRestaurant.id,
        handoffId: defaultHandoff.id,
        items: [
          { id: 'm1', name: 'Special Paneer Butter Masala + 2 Tandoori Roti combo', price: 280, quantity: 1 },
          { id: 'm4', name: 'Chilled Punjabi Sweet Lassi in Earthen Matka', price: 90, quantity: 2 }
        ],
        totalAmount: 460,
        status: 'PLACED', // PLACED, KITCHEN_TRIGGERED, PREPARING, FOOD_READY, RUNNER_AT_LAYBY, VEHICLE_ARRIVED, COMPLETED
        prepTimeMinutes: 14,
        syncedKitchenTriggerEta: 14, // Kitchen ticket fires when Vehicle ETA <= 14 min
        kitchenTicketFired: false,
        runnerId: 'runner_1',
        otp: '7492',
        placedTimestamp: Date.now() - 60000,
        pullOverAlertShown: false,
        handOffCompletedTimestamp: null
      },

      // Environmental simulation settings
      weather: 'CLEAR',
      trafficCongestionIndex: 1.05,
      soundEnabled: true,
      autoDemoRunning: false
    };
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(changeType = 'STATE_CHANGE') {
    this.listeners.forEach(fn => fn(this.state, changeType));
  }

  broadcast(changeType = 'STATE_CHANGE') {
    this.notifyListeners(changeType);
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'STATE_UPDATE', payload: this.state, changeType });
      } catch (e) {
        console.warn('Broadcast error', e);
      }
    }
  }

  // --- ACTIONS ---

  setActiveRole(role) {
    this.state.activeRole = role;
    this.broadcast('STATE_CHANGE');
  }

  selectRoute(routeId) {
    const route = DELIVIA_DATA.routes.find(r => r.id === routeId);
    if (!route) return;

    this.state.activeRouteId = routeId;
    this.state.routeProgressPercent = 5;
    this.state.currentKmAlongRoute = Number((route.totalDistanceKm * 0.05).toFixed(1));
    this.state.currentVehicleCoords = { lat: route.polyline[0][0], lng: route.polyline[0][1], heading: 145 };
    
    // Set default restaurant & handoff for the newly selected route
    const defaultRestaurant = DELIVIA_DATA.restaurants.find(r => r.routeId === routeId) || DELIVIA_DATA.restaurants[0];
    const defaultHandoff = DELIVIA_DATA.handoffPoints.find(hp => hp.routeId === routeId) || DELIVIA_DATA.handoffPoints[0];
    
    this.state.cart = {
      restaurantId: defaultRestaurant.id,
      items: [
        { id: defaultRestaurant.menu[0].id, name: defaultRestaurant.menu[0].name, price: defaultRestaurant.menu[0].price, quantity: 1, prepTimeMin: defaultRestaurant.menu[0].prepTimeMin }
      ],
      totalAmount: defaultRestaurant.menu[0].price
    };

    // Reset active order to match the new route
    this.state.activeOrder = {
      id: `DLV-${Math.floor(1000 + Math.random() * 9000)}`,
      travelerName: 'Yumna Abidi (VisionX)',
      travelerPhone: '+91 98765-12345',
      vehiclePlate: 'UP-16-BX-4090',
      restaurantId: defaultRestaurant.id,
      handoffId: defaultHandoff.id,
      items: [...this.state.cart.items],
      totalAmount: this.state.cart.totalAmount,
      status: 'PLACED',
      prepTimeMinutes: defaultRestaurant.avgPrepTimeMin,
      syncedKitchenTriggerEta: defaultRestaurant.avgPrepTimeMin,
      kitchenTicketFired: false,
      runnerId: DELIVIA_DATA.runners.find(run => run.assignedHandoffId === defaultHandoff.id)?.id || 'runner_1',
      otp: '7492',
      placedTimestamp: Date.now(),
      pullOverAlertShown: false,
      handOffCompletedTimestamp: null
    };

    this.broadcast('STATE_CHANGE');
  }

  setVehicleProgress(percent, isTick = false) {
    const route = DELIVIA_DATA.routes.find(r => r.id === this.state.activeRouteId) || DELIVIA_DATA.routes[0];
    const clamped = Math.max(0, Math.min(100, percent));
    this.state.routeProgressPercent = clamped;
    this.state.currentKmAlongRoute = Number(((clamped / 100) * route.totalDistanceKm).toFixed(1));

    // Interpolate polyline lat/lng
    const poly = route.polyline;
    const indexFloat = (clamped / 100) * (poly.length - 1);
    const idx = Math.min(poly.length - 2, Math.floor(indexFloat));
    const t = indexFloat - idx;

    const p1 = poly[idx];
    const p2 = poly[idx + 1] || poly[idx];

    const lat = p1[0] + (p2[0] - p1[0]) * t;
    const lng = p1[1] + (p2[1] - p1[1]) * t;

    // Heading angle in degrees
    const dLat = p2[0] - p1[0];
    const dLng = p2[1] - p1[1];
    const heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);

    this.state.currentVehicleCoords = { lat, lng, heading };

    // Check order triggers based on new progress
    const prevStatus = this.state.activeOrder ? this.state.activeOrder.status : null;
    this.evaluateOrderSyncTransitions();
    const newStatus = this.state.activeOrder ? this.state.activeOrder.status : null;

    // If order status transitioned during movement, broadcast full STATE_CHANGE so badges update
    const changeType = (prevStatus !== newStatus || !isTick) ? 'STATE_CHANGE' : 'TICK';
    this.broadcast(changeType);
  }

  setSimulationPlaying(isPlaying) {
    this.state.isSimulationPlaying = isPlaying;
    this.broadcast('STATE_CHANGE');
  }

  setSimulationSpeedMultiplier(multiplier) {
    this.state.simulationSpeedMultiplier = multiplier;
    this.broadcast('STATE_CHANGE');
  }

  setVehicleSpeed(speedKmph) {
    this.state.currentSpeedKmph = Math.max(0, Math.min(130, speedKmph));
    this.broadcast('TICK');
  }

  // --- Cart Actions ---
  addToCart(restaurantId, menuItem) {
    if (this.state.cart.restaurantId !== restaurantId) {
      // Switched restaurant, reset cart items
      this.state.cart = {
        restaurantId,
        items: [],
        totalAmount: 0
      };
    }

    const existing = this.state.cart.items.find(i => i.id === menuItem.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.state.cart.items.push({ ...menuItem, quantity: 1 });
    }

    this.recalculateCartTotal();
    this.broadcast('STATE_CHANGE');
  }

  removeFromCart(menuItemId) {
    const idx = this.state.cart.items.findIndex(i => i.id === menuItemId);
    if (idx !== -1) {
      if (this.state.cart.items[idx].quantity > 1) {
        this.state.cart.items[idx].quantity -= 1;
      } else {
        this.state.cart.items.splice(idx, 1);
      }
    }
    this.recalculateCartTotal();
    this.broadcast('STATE_CHANGE');
  }

  recalculateCartTotal() {
    this.state.cart.totalAmount = this.state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // --- Order Lifecycle Actions ---
  placeOrder(customData = {}) {
    const restaurant = DELIVIA_DATA.restaurants.find(r => r.id === this.state.cart.restaurantId) || DELIVIA_DATA.restaurants[0];
    const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === restaurant.associatedHandoffId) || DELIVIA_DATA.handoffPoints[0];

    const orderId = `DLV-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const items = this.state.cart.items.length > 0 
      ? [...this.state.cart.items] 
      : [{ id: restaurant.menu[0].id, name: restaurant.menu[0].name, price: restaurant.menu[0].price, quantity: 1 }];
    const totalAmount = this.state.cart.totalAmount > 0 
      ? this.state.cart.totalAmount 
      : items.reduce((s, i) => s + (i.price * i.quantity), 0);

    const runner = DELIVIA_DATA.runners.find(run => run.assignedHandoffId === handoff.id) || DELIVIA_DATA.runners[0];

    this.state.activeOrder = {
      id: orderId,
      travelerName: customData.travelerName || 'Yumna Abidi (VisionX)',
      travelerPhone: customData.travelerPhone || '+91 98765-12345',
      vehiclePlate: customData.vehiclePlate || 'UP-16-BX-4090',
      restaurantId: restaurant.id,
      handoffId: handoff.id,
      items,
      totalAmount,
      status: 'PLACED',
      prepTimeMinutes: restaurant.avgPrepTimeMin,
      syncedKitchenTriggerEta: restaurant.avgPrepTimeMin,
      kitchenTicketFired: false,
      runnerId: runner.id,
      otp,
      placedTimestamp: Date.now(),
      pullOverAlertShown: false,
      handOffCompletedTimestamp: null
    };

    deliviaAudio.playChime();
    this.broadcast('STATE_CHANGE');
    return this.state.activeOrder;
  }

  updateOrderStatus(newStatus) {
    if (!this.state.activeOrder) return;
    this.state.activeOrder.status = newStatus;

    if (newStatus === 'KITCHEN_TRIGGERED' || newStatus === 'PREPARING') {
      this.state.activeOrder.kitchenTicketFired = true;
      deliviaAudio.playKitchenBell();
    } else if (newStatus === 'FOOD_READY') {
      deliviaAudio.playChime();
    } else if (newStatus === 'COMPLETED') {
      this.state.activeOrder.handOffCompletedTimestamp = Date.now();
      deliviaAudio.playSuccess();
    }

    this.broadcast('STATE_CHANGE');
  }

  adjustPrepTime(deltaMinutes) {
    if (!this.state.activeOrder) return;
    this.state.activeOrder.prepTimeMinutes = Math.max(3, this.state.activeOrder.prepTimeMinutes + deltaMinutes);
    this.state.activeOrder.syncedKitchenTriggerEta = this.state.activeOrder.prepTimeMinutes;
    this.broadcast('STATE_CHANGE');
  }

  /**
   * Automatic evaluation of kitchen trigger, runner alert, and pull-over alarm
   * as the vehicle moves along the route.
   */
  evaluateOrderSyncTransitions() {
    const order = this.state.activeOrder;
    if (!order || order.status === 'COMPLETED' || order.status === 'NONE') return;

    const handoff = DELIVIA_DATA.handoffPoints.find(hp => hp.id === order.handoffId);
    if (!handoff) return;

    const distanceToHandoffKm = handoff.highwayKm - this.state.currentKmAlongRoute;
    const etaAnalysis = deliviaEtaModel.predictEta({
      distanceKm: Math.max(0.1, distanceToHandoffKm),
      currentSpeedKmph: this.state.currentSpeedKmph,
      weather: this.state.weather,
      trafficCongestionIndex: this.state.trafficCongestionIndex
    });

    const vehicleEtaMin = etaAnalysis.refinedEtaMinutes;

    // 1. Kitchen Ticket Trigger Condition: (Vehicle ETA - PrepTime) <= 1.5 min
    if (order.status === 'PLACED' && vehicleEtaMin <= (order.prepTimeMinutes + 2)) {
      this.updateOrderStatus('PREPARING');
    }

    // 2. Runner At Lay-by Condition: Vehicle ETA <= 5 min
    if ((order.status === 'PREPARING' || order.status === 'FOOD_READY') && vehicleEtaMin <= 5) {
      if (order.status !== 'RUNNER_AT_LAYBY' && order.status !== 'VEHICLE_ARRIVED') {
        order.status = 'RUNNER_AT_LAYBY';
      }
    }

    // 3. 2-Minute Pull-Over Warning Sound Alert (Triggered when ETA <= 2.2 min and > 0.5 min)
    if (vehicleEtaMin <= 2.2 && distanceToHandoffKm > 0.1 && !order.pullOverAlertShown) {
      order.pullOverAlertShown = true;
      deliviaAudio.playPullOverAlert();
    }

    // 4. Vehicle Arrived at Hand-off Bay (Distance <= 0.4 km)
    if (distanceToHandoffKm <= 0.4 && distanceToHandoffKm >= -0.5) {
      if (order.status !== 'VEHICLE_ARRIVED' && order.status !== 'COMPLETED') {
        order.status = 'VEHICLE_ARRIVED';
        this.setVehicleSpeed(0); // Vehicle stopped in safe lay-by bay!
      }
    }
  }

  resetDemo() {
    this.state = this.getInitialState();
    this.broadcast();
  }
}

const deliviaState = new DeliviaState();
