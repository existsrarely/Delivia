/**
 * DELIVIA - AI ETA Refinement Model
 * Dynamically refines vehicle travel time to roadside safe hand-off bays
 * using multi-factor regression calibration (Speed, Traffic Congestion, Toll Delays, Weather, Lay-by Deceleration)
 */

class DeliviaEtaModel {
  constructor() {
    this.weatherFactors = {
      'CLEAR': 1.0,
      'MIST_FOG': 1.18,
      'RAIN': 1.22,
      'HEAVY_RAIN': 1.35
    };
  }

  /**
   * Refines raw travel ETA to a specific highway hand-off point
   * @param {Object} params
   * @param {number} params.distanceKm - Distance to hand-off point in km
   * @param {number} params.currentSpeedKmph - Current vehicle speed in km/h
   * @param {number} params.expresswayAvgSpeed - Normal expressway cruise speed (e.g. 85 km/h)
   * @param {number} params.tollCountEnRoute - Number of toll plazas between vehicle & lay-by
   * @param {string} params.weather - Weather condition ('CLEAR', 'MIST_FOG', 'RAIN')
   * @param {number} params.trafficCongestionIndex - 1.0 (free flow) to 1.8 (heavy slowdown)
   * @returns {Object} Refined ETA analysis
   */
  predictEta({
    distanceKm = 20,
    currentSpeedKmph = 80,
    expresswayAvgSpeed = 85,
    tollCountEnRoute = 0,
    weather = 'CLEAR',
    trafficCongestionIndex = 1.08
  }) {
    if (distanceKm <= 0.1) {
      return {
        refinedEtaMinutes: 0.2,
        rawEtaMinutes: 0.1,
        confidenceScore: 0.99,
        varianceWindowMinutes: 0.2,
        tollDelayMinutes: 0,
        weatherDelayMinutes: 0,
        decelerationOverheadMinutes: 0.2,
        syncedHandOffWindow: 'IMMEDIATE'
      };
    }

    // Blend current instantaneous speed with expressway historical cruising speed
    const effectiveSpeedKmph = Math.max(30, (currentSpeedKmph * 0.45) + (expresswayAvgSpeed * 0.55));

    // Raw travel time in minutes
    const rawEtaMinutes = (distanceKm / effectiveSpeedKmph) * 60;

    // Traffic congestion penalty
    const congestionFactor = Math.max(1.0, trafficCongestionIndex);
    const trafficAdjustedEta = rawEtaMinutes * congestionFactor;

    // Toll plaza bottleneck regression: avg 2.2 min per FASTag lane queue
    const tollDelayMinutes = tollCountEnRoute * 2.2;

    // Weather impact
    const weatherMult = this.weatherFactors[weather] || 1.0;
    const weatherDelayMinutes = trafficAdjustedEta * (weatherMult - 1.0);

    // Highway deceleration into safe lay-by + parking alignment overhead
    const decelerationOverheadMinutes = 1.2;

    // Total refined ETA
    const refinedEtaMinutes = Math.max(
      1.0,
      Number((trafficAdjustedEta + tollDelayMinutes + weatherDelayMinutes + decelerationOverheadMinutes).toFixed(1))
    );

    // AI Confidence & variance bounds
    const confidenceScore = Number(Math.max(0.82, 0.98 - (distanceKm * 0.002)).toFixed(2));
    const varianceWindowMinutes = Number((refinedEtaMinutes * (1.0 - confidenceScore) * 1.5).toFixed(1));

    return {
      distanceKm: Number(distanceKm.toFixed(1)),
      effectiveSpeedKmph: Math.round(effectiveSpeedKmph),
      rawEtaMinutes: Number(rawEtaMinutes.toFixed(1)),
      refinedEtaMinutes,
      confidenceScore,
      varianceWindowMinutes,
      tollDelayMinutes: Number(tollDelayMinutes.toFixed(1)),
      weatherDelayMinutes: Number(weatherDelayMinutes.toFixed(1)),
      decelerationOverheadMinutes,
      factorsApplied: {
        congestionFactor: Number(congestionFactor.toFixed(2)),
        weatherMultiplier: weatherMult,
        tollsEnRoute: tollCountEnRoute
      }
    };
  }

  /**
   * Computes the exact timestamp when the restaurant kitchen ticket must fire
   * so food preparation finishes exactly 2 minutes before the car reaches the pull-over point.
   */
  computeKitchenTrigger({ refinedEtaMinutes, prepTimeMinutes, bufferMinutes = 2 }) {
    const timeUntilTrigger = refinedEtaMinutes - (prepTimeMinutes + bufferMinutes);
    const shouldFireNow = timeUntilTrigger <= 0;

    return {
      timeUntilTriggerMinutes: Number(Math.max(0, timeUntilTrigger).toFixed(1)),
      shouldFireNow,
      targetFoodReadyEtaMinutes: Number((refinedEtaMinutes - bufferMinutes).toFixed(1)),
      status: shouldFireNow ? 'KITCHEN_ACTIVE' : 'SCHEDULED_TRIGGER'
    };
  }
}

const deliviaEtaModel = new DeliviaEtaModel();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeliviaEtaModel, deliviaEtaModel };
}
