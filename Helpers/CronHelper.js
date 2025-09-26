const cron = require("node-cron");

/**
 * Generic Cron Job Scheduler
 * @param {string} cronTime - Cron expression (e.g., "0 0 * * *")
 * @param {Function} jobFunction - Function to execute
 * @param {string} jobName - (Optional) Name for logging
 */
function scheduleCronJob(cronTime, jobFunction, jobName = "Unnamed Job") {
  try {
    const task = cron.schedule(
      cronTime,
      async () => {
        console.log(
          `[CRON] Running Job: ${jobName} at ${new Date().toISOString()}`
        );
        try {
          await jobFunction();
          console.log(`[CRON] Completed Job: ${jobName}`);
        } catch (err) {
          console.error(`[CRON] Error in Job: ${jobName}`, err);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Karachi",
      }
    );

    console.log(`[CRON] Scheduled Job: ${jobName} (${cronTime})`);
    return task;
  } catch (err) {
    console.error(`[CRON] Failed to schedule job: ${jobName}`, err);
  }
}

module.exports = { scheduleCronJob };
