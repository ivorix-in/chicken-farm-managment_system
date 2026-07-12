import { countActiveBatches, sumActiveBirds } from "../batches/batches.repository.js";
import { countTodaysVisits } from "../dailyVisits/dailyVisits.repository.js";
import { countActiveFarms } from "../farms/farms.repository.js";
import { getLowStockAlerts, findAllFeedStock } from "../feed/feed.repository.js";
import { getLowMedicineAlerts } from "../medicines/medicines.repository.js";

export async function getDashboardKpis() {
  const [
    activeFarms,
    activeBatches,
    birdStats,
    todaysVisits,
    feedStock,
    lowFeedAlerts,
    lowMedicineAlerts,
  ] = await Promise.all([
    countActiveFarms(),
    countActiveBatches(),
    sumActiveBirds(),
    countTodaysVisits(),
    findAllFeedStock(),
    getLowStockAlerts(),
    getLowMedicineAlerts(),
  ]);

  const mortalityPct =
    birdStats.totalChicks > 0
      ? +((birdStats.totalMortality / birdStats.totalChicks) * 100).toFixed(2)
      : 0;

  return {
    activeFarms,
    activeBatches,
    activeBirds: birdStats.totalBirds,
    totalMortality: birdStats.totalMortality,
    mortalityPct,
    feedStock: feedStock.map((s) => ({
      feedType: s.feedType,
      quantityKg: s.quantityKg,
      unitCostPerKg: s.unitCostPerKg,
      lowStock: s.quantityKg <= s.lowStockThresholdKg,
    })),
    todaysVisits,
    alerts: {
      lowFeed: lowFeedAlerts.map((s) => ({ feedType: s.feedType, quantityKg: s.quantityKg })),
      lowMedicine: lowMedicineAlerts.map((m) => ({ name: m.name, quantityUnits: m.quantityUnits, unit: m.unit })),
    },
  };
}
