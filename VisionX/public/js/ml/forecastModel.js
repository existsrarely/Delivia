/**
 * DELIVIA - AI Demand Forecasting Model (Ops/Admin)
 * Generates synthetic hourly traffic and food order demand distributions
 * across designated safe pull-over hubs to optimize runner dispatching.
 */

class DeliviaDemandForecaster {
  constructor() {
    // Hourly baseline coefficients (24 hours) for highway transit travel
    this.hourlyProfile = [
      0.12, 0.08, 0.05, 0.08, 0.20, 0.45, // 00:00 - 05:00 Early morning
      0.75, 0.95, 0.88, 0.70, 0.65, 0.85, // 06:00 - 11:00 Breakfast & Lunch rush
      0.98, 0.92, 0.60, 0.55, 0.72, 0.89, // 12:00 - 17:00 Afternoon & Tea rush
      0.96, 0.90, 0.80, 0.60, 0.40, 0.25  // 18:00 - 23:00 Dinner rush
    ];
  }

  /**
   * Generates 24-hour forecasted order demand for all safe hand-off points
   * @param {Array} handoffPoints
   * @returns {Object} Forecast dataset with hourly metrics and recommended runner shifts
   */
  generateForecast(handoffPoints = []) {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    const datasets = handoffPoints.map((hp, idx) => {
      const baseMultiplier = 18 + (idx * 6);
      const data = this.hourlyProfile.map((factor, hour) => {
        // Add subtle stochastic variation
        const noise = (Math.sin(hour * 1.5 + idx) * 0.15);
        return Math.round(Math.max(2, (factor + noise) * baseMultiplier));
      });

      const peakHour = data.indexOf(Math.max(...data));
      const totalDailyOrders = data.reduce((a, b) => a + b, 0);

      return {
        handoffId: hp.id,
        handoffName: hp.shortName || hp.name,
        color: ['#2D5A27', '#E06D53', '#3B82F6', '#8B5CF6', '#F59E0B'][idx % 5],
        hourlyOrders: data,
        peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
        peakVolume: data[peakHour],
        totalDailyOrders,
        recommendedRunnersPeak: Math.ceil(data[peakHour] / 8)
      };
    });

    return {
      hours,
      datasets,
      totalHighwayOrdersForecast: datasets.reduce((sum, d) => sum + d.totalDailyOrders, 0),
      peakHighwayCongestionHour: '13:00'
    };
  }
}

const deliviaDemandForecaster = new DeliviaDemandForecaster();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeliviaDemandForecaster, deliviaDemandForecaster };
}
