/**
 * DELIVIA - Leaflet Map Component Manager
 * Renders high-performance interactive highway maps with animated vehicles,
 * safe pull-over lay-bys, restaurant pins, runner markers, and route trails.
 */

class DeliviaMapManager {
  constructor() {
    this.maps = {};
    this.markers = {};
    this.renderedRouteIds = {};
  }

  /**
   * Initializes or reuses a Leaflet map container
   * @param {string} containerId - DOM ID of map container
   * @param {Object} options - Center, zoom, and theme options
   */
  initMap(containerId, { center = [28.1633, 77.5891], zoom = 9, interactive = true } = {}) {
    const el = document.getElementById(containerId);
    if (!el) return null;

    // If map already exists and is mounted on the current DOM element, reuse it
    if (this.maps[containerId]) {
      const existingMap = this.maps[containerId];
      if (existingMap.getContainer() === el) {
        setTimeout(() => {
          existingMap.invalidateSize();
        }, 50);
        return existingMap;
      } else {
        try {
          existingMap.remove();
        } catch (e) {
          // ignore
        }
        delete this.maps[containerId];
      }
    }

    // Clean any dangling Leaflet reference on the element
    if (el._leaflet_id) {
      delete el._leaflet_id;
    }

    try {
      const map = L.map(containerId, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        attributionControl: false
      });

      // High quality OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      this.maps[containerId] = map;
      this.markers[containerId] = {
        routePolyline: null,
        passedPolyline: null,
        vehicleMarker: null,
        handoffMarkers: [],
        restaurantMarkers: [],
        runnerMarkers: []
      };

      setTimeout(() => {
        if (this.maps[containerId]) {
          this.maps[containerId].invalidateSize();
        }
      }, 100);

      return map;
    } catch (err) {
      console.warn('Map initialization note:', err);
      return null;
    }
  }

  getMap(containerId) {
    return this.maps[containerId];
  }

  invalidateSize(containerId) {
    if (this.maps[containerId]) {
      try {
        this.maps[containerId].invalidateSize();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Renders the highway route polyline. Only fits bounds if route changed or forceFit is true.
   */
  renderRoute(containerId, routeData, forceFit = false) {
    const map = this.maps[containerId];
    if (!map || !routeData) return;

    const layers = this.markers[containerId];
    const isNewRoute = this.renderedRouteIds[containerId] !== routeData.id;

    if (layers.routePolyline) {
      map.removeLayer(layers.routePolyline);
    }
    if (layers.passedPolyline) {
      map.removeLayer(layers.passedPolyline);
    }

    // Route polyline (Olive green)
    layers.routePolyline = L.polyline(routeData.polyline, {
      color: '#2D5A27',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    this.renderedRouteIds[containerId] = routeData.id;

    // Only fit bounds on initial load or route switch — NEVER on tick movement!
    if (isNewRoute || forceFit) {
      map.fitBounds(layers.routePolyline.getBounds(), { padding: [20, 20], animate: false });
    }
  }

  /**
   * Updates or creates the vehicle marker along the highway route smoothly
   */
  updateVehicleMarker(containerId, { lat, lng, heading = 145, speedKmph = 80, label = 'Your Vehicle' }) {
    const map = this.maps[containerId];
    if (!map) return;

    const layers = this.markers[containerId];
    if (!layers) return;

    const carHtml = `
      <div class="delivia-car-marker" style="transform: rotate(${heading}deg);">
        <div class="car-pulse"></div>
        <div class="car-body">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
            <path d="M5 17h14M5 17l1.5-6h11l1.5 6M5 17a2 2 0 104 0M15 17a2 2 0 104 0M7 11l2-5h6l2 5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="car-speed-tag">${Math.round(speedKmph)} km/h</div>
      </div>
    `;

    const carIcon = L.divIcon({
      className: 'delivia-custom-icon',
      html: carHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (layers.vehicleMarker) {
      layers.vehicleMarker.setLatLng([lat, lng]);
      layers.vehicleMarker.setIcon(carIcon);
    } else {
      layers.vehicleMarker = L.marker([lat, lng], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
    }
  }

  /**
   * Renders safe pull-over lay-by points on the map
   */
  renderHandoffPoints(containerId, handoffPoints, targetHandoffId = null) {
    const map = this.maps[containerId];
    if (!map || !handoffPoints) return;

    const layers = this.markers[containerId];
    if (!layers) return;

    layers.handoffMarkers.forEach(m => map.removeLayer(m));
    layers.handoffMarkers = [];

    handoffPoints.forEach(hp => {
      const isTarget = hp.id === targetHandoffId;
      const html = `
        <div class="delivia-layby-marker ${isTarget ? 'is-target' : ''}">
          <div class="layby-pin">
            <span>🅿️</span>
          </div>
          <div class="layby-tag">${hp.shortName || hp.name}</div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'delivia-custom-icon',
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([hp.lat, hp.lng], { icon, zIndexOffset: isTarget ? 800 : 500 })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-xs font-sans">
            <div class="font-bold text-emerald-800">${hp.name}</div>
            <div class="text-gray-600 mt-1">🛣️ Highway Km ${hp.highwayKm}</div>
            <div class="text-gray-500">${hp.laneInstruction}</div>
            <div class="mt-1.5 inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
              Max Speed: ${hp.safeSpeedThresholdKmph} km/h (Safe Bay)
            </div>
          </div>
        `);

      layers.handoffMarkers.push(marker);
    });
  }

  /**
   * Renders partner restaurant pins on map
   */
  renderRestaurants(containerId, restaurants, selectedRestaurantId = null) {
    const map = this.maps[containerId];
    if (!map || !restaurants) return;

    const layers = this.markers[containerId];
    if (!layers) return;

    layers.restaurantMarkers.forEach(m => map.removeLayer(m));
    layers.restaurantMarkers = [];

    restaurants.forEach(r => {
      const isSelected = r.id === selectedRestaurantId;
      const html = `
        <div class="delivia-restaurant-marker ${isSelected ? 'is-selected' : ''}">
          <div class="rest-pin">${r.image || '🍽️'}</div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'delivia-custom-icon',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([r.lat, r.lng], { icon, zIndexOffset: isSelected ? 700 : 400 })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-xs font-sans">
            <div class="font-bold text-gray-900">${r.name}</div>
            <div class="text-amber-600 font-medium">⭐ ${r.rating} • ${r.cuisine}</div>
            <div class="text-gray-500 mt-1">⏱️ Avg Prep: ${r.avgPrepTimeMin} mins</div>
          </div>
        `);

      layers.restaurantMarkers.push(marker);
    });
  }

  /**
   * Centers map smoothly around vehicle with slight forward tilt
   */
  panToVehicle(containerId, lat, lng) {
    const map = this.maps[containerId];
    if (map) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }
}

const deliviaMapManager = new DeliviaMapManager();
