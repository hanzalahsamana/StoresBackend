const { subscriptionStatusTemplate } = require("../Emails/emailTemplates");
const { sendEmail } = require("../Helpers/EmailSender");
const { SubscriptionModel } = require("../Models/subscriptionmodel");

module.exports = {
  trialExpiredJob: async () => {
    try {
      const now = new Date();

      const trialSubs = await SubscriptionModel.find({
        status: "trial",
      }).populate({
        path: "storeRef",
        populate: { path: "userRef", select: "email" },
      });

      if (!trialSubs.length) return;

      const updates = [];
      const emailPromises = [];

      for (const sub of trialSubs) {
        const createdAt = new Date(sub.createdAt);
        const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

        if (diffInDays >= 3) {
          updates.push(
            SubscriptionModel.updateOne(
              { _id: sub._id },
              { $set: { status: "trial expired" } }
            )
          );

          const storeName = sub?.storeRef?.storeName;
          const email = sub?.storeRef?.userRef?.email;
          if (email) {
            emailPromises.push(
              sendEmail(
                { storeName: "Admin", email: "" },
                email,
                `Trial for ${storeName} store has Expired`,
                subscriptionStatusTemplate(
                  "Trial Period Expired",
                  "trial expired",
                  "",
                  storeName
                )
              )
            );
          }
        }
      }

      if (updates?.length > 0) {
        await Promise.all(updates);
        await Promise.all(emailPromises);
      } else {
        return;
      }
    } catch (error) {
      console.error("❌ Error in trialExpiredJob:", error);
    }
  },

  subscriptionExpiredJob: async () => {
    try {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0)); 

      const activeSubs = await SubscriptionModel.find({
        status: "active",
      }).populate({
        path: "storeRef",
        populate: { path: "userRef", select: "email" },
      });

      if (!activeSubs?.length) return;

      const updates = [];
      const emailPromises = [];

      for (const sub of activeSubs) {
        if (!sub?.subsEnd) continue;

        const subsEndDate = new Date(sub.subsEnd);
        const normalizedSubsEnd = new Date(subsEndDate.setHours(0, 0, 0, 0));

        if (normalizedSubsEnd.getTime() === today.getTime()) {
          updates.push(
            SubscriptionModel.updateOne(
              { _id: sub._id },
              { $set: { status: "cancelled" } }
            )
          );

          const storeName = sub?.storeRef?.storeName;
          const email = sub?.storeRef?.userRef?.email;

          if (email) {
            emailPromises.push(
              sendEmail(
                { storeName: "Admin", email: "" },
                email,
                `Subscription for ${storeName} store has been Cancelled`,
                subscriptionStatusTemplate(
                  "Subscription Cancelled",
                  "cancelled_due_to_expiry",
                  "",
                  storeName
                )
              )
            );
          }
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
        await Promise.all(emailPromises);
      }
    } catch (error) {
      console.error("❌ Error in cancelExpiredSubscriptionsJob:", error);
    }
  },
};
