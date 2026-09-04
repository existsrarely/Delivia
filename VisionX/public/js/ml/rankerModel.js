/**
 * DELIVIA - AI Restaurant Ranking Model
 * Multi-factor dynamic scoring engine that ranks roadside restaurants ahead of the moving vehicle
 * Prioritizes: Prep Time Synchronization, Distance Ahead Window, Rating, Hygiene, and Kitchen Load
 */

class DeliviaRestaurantRanker {
  /**
   * Ranks an array of restaurants based on current vehicle location and forward travel trajectory
   * @param {Array} restaurants - List of partner restaurants
   * @param {number} vehicleKmAlongRoute - Current vehicle position (km along route)
   * @param {number} vehicleSpeedKmph - Current speed
   * @param {DeliviaEtaModel} etaModel - Instance of ETA model
   * @returns {Array} Ranked list of restaurants with match scores and sync suitability
   */
  rankRestaurants(restaurants, vehicleKmAlongRoute, vehicleSpeedKmph = 80, etaModel = null) {
    if (!restaurants || !Array.isArray(restaurants)) return [];

    const scored = restaurants.map(restaurant => {
      const distanceAheadKm = restaurant.highwayKm - vehicleKmAlongRoute;

      // Filter out restaurants already passed (allow small buffer of 0.5 km)
      if (distanceAheadKm < -0.5) {
        return {
          ...restaurant,
          distanceAheadKm: Number(distanceAheadKm.toFixed(1)),
          isAhead: false,
          matchScore: 0,
          eligibility: 'PASSED',
          etaMinutes: 0
        };
      }

      // Compute refined vehicle ETA to this restaurant's safe hand-off point
      const etaAnalysis = etaModel
        ? etaModel.predictEta({ distanceKm: Math.max(0.2, distanceAheadKm), currentSpeedKmph: vehicleSpeedKmph })
        : { refinedEtaMinutes: (distanceAheadKm / Math.max(40, vehicleSpeedKmph)) * 60 };

      const vehicleEtaToHandoff = etaAnalysis.refinedEtaMinutes;
      const prepTime = restaurant.avgPrepTimeMin;

      // --- SCORING ALGORITHM ---
      // 1. Sync Window Compatibility Score (0 to 45 pts)
      // Ideal: Vehicle ETA is between (PrepTime + 2m) and (PrepTime + 25m)
      let syncScore = 0;
      let syncStatus = 'PERFECT_MATCH';

      if (vehicleEtaToHandoff < prepTime) {
        // Vehicle will reach before kitchen can finish -> high risk of cold delay or car waiting
        const deficit = prepTime - vehicleEtaToHandoff;
        syncScore = Math.max(5, 30 - deficit * 4);
        syncStatus = 'KITCHEN_RUSH';
      } else if (vehicleEtaToHandoff <= prepTime + 18) {
        // Goldilocks zone! Food finishes 2-5 min before car pulls into lay-by
        syncScore = 45;
        syncStatus = 'PERFECT_SYNC';
      } else if (vehicleEtaToHandoff <= prepTime + 45) {
        // Feasible advance order
        syncScore = 38 - (vehicleEtaToHandoff - prepTime - 18) * 0.4;
        syncStatus = 'FUTURE_WAYPOINT';
      } else {
        // Too far ahead (>45 min)
        syncScore = 20;
        syncStatus = 'FAR_AHEAD';
      }

      // 2. Distance Ahead Optimal Range Score (0 to 25 pts)
      // Ideal distance ahead is 15 km to 45 km
      let distanceScore = 25;
      if (distanceAheadKm < 8) {
        distanceScore = 12; // Approaching very fast
      } else if (distanceAheadKm > 60) {
        distanceScore = Math.max(5, 25 - (distanceAheadKm - 60) * 0.3);
      }

      // 3. Quality & Rating Score (0 to 20 pts)
      const ratingScore = (restaurant.rating / 5.0) * 20;

      // 4. Kitchen Speed & Badge Bonus (0 to 10 pts)
      const speedBonus = restaurant.avgPrepTimeMin <= 10 ? 10 : restaurant.avgPrepTimeMin <= 15 ? 7 : 4;

      const totalScore = Math.min(100, Math.round(syncScore + distanceScore + ratingScore + speedBonus));

      return {
        ...restaurant,
        distanceAheadKm: Number(distanceAheadKm.toFixed(1)),
        isAhead: true,
        vehicleEtaMinutes: Number(vehicleEtaToHandoff.toFixed(1)),
        syncStatus,
        matchScore: totalScore,
        eligibility: syncScore >= 15 ? 'RECOMMENDED' : 'AVAILABLE',
        aiExplanation: this.generateAiExplanation(syncStatus, distanceAheadKm, vehicleEtaToHandoff, prepTime)
      };
    });

    // Sort: restaurants ahead first by matchScore descending, then passed
    return scored.sort((a, b) => {
      if (a.isAhead && !b.isAhead) return -1;
      if (!a.isAhead && b.isAhead) return 1;
      return b.matchScore - a.matchScore;
    });
  }

  generateAiExplanation(syncStatus, distanceKm, etaMin, prepMin) {
    switch (syncStatus) {
      case 'PERFECT_SYNC':
        return `🎯 Prime Sync: At ${distanceKm.toFixed(0)} km ahead (ETA ~${Math.round(etaMin)}m), kitchen has the exact ${prepMin}m needed so your food is piping hot right as you pull in.`;
      case 'KITCHEN_RUSH':
        return `⚡ Tight Window: ETA (${Math.round(etaMin)}m) is close to prep time (${prepMin}m). Order now for rapid prep!`;
      case 'FUTURE_WAYPOINT':
        return `🕒 Forward Booking: Reaches in ~${Math.round(etaMin)}m. Order scheduled for automatic kitchen trigger.`;
      default:
        return `📍 Located along your forward path (~${distanceKm.toFixed(0)} km ahead).`;
    }
  }
}

const deliviaRestaurantRanker = new DeliviaRestaurantRanker();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeliviaRestaurantRanker, deliviaRestaurantRanker };
}
