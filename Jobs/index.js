const { scheduleCronJob } = require("../Helpers/CronHelper");
const { trialExpiredJob } = require("./subscriptionsJobs");

scheduleCronJob("0 0 * * *", trialExpiredJob, "Trial Expired");
