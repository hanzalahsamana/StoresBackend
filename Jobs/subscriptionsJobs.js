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
};
