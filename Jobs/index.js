const { scheduleCronJob } = require("../Helpers/CronHelper");
const { trialExpiredJob, subscriptionExpiredJob } = require("./subscriptionsJobs");

scheduleCronJob("0 0 * * *", trialExpiredJob, "Trial Expired");
scheduleCronJob("0 0 * * *", subscriptionExpiredJob, "Subscription Expired");
