import cron from 'node-cron';
import { slaService } from '../services/slaService.js';
import { preventiveService } from '../services/preventiveService.js';

let cronJob = null;

export function initSlaCron() {
  if (process.env.NODE_ENV === 'test') {
    // Skip auto-scheduling during tests to avoid lingering background timers
    return null;
  }

  // Schedule to run every 15 minutes: "*/15 * * * *"
  cronJob = cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron] ⏱️  Running automated SLA Overdue, Escalation & Preventive scan...');
    try {
      const results = await slaService.checkAndEscalateOverdueComplaints();
      console.log(`[Cron] ✓ SLA scan complete. Scanned: ${results.scannedCount}, Overdue flagged: ${results.flaggedOverdue}, Escalated: ${results.escalatedCount}`);
      
      const prevResults = await preventiveService.checkAndExecuteDuePlans();
      if (prevResults.executedCount > 0) {
        console.log(`[Cron] 🔧 Preventive scan complete. Dispatched ${prevResults.executedCount} recurring work orders.`);
      }
    } catch (err) {
      console.error('[Cron] ❌ Error running SLA/Preventive scan:', err);
    }
  });

  console.log('⏰ [Cron] SLA & Preventive Monitoring Cron Job initialized (interval: every 15 minutes)');
  return cronJob;
}

export function stopSlaCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}

export default {
  initSlaCron,
  stopSlaCron
};
