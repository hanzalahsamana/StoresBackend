const { baseTemplate } = require("./baseTemplate");

module.exports = {
  userStatusTemplate: (title, status, reason) => {
    if (status === "suspended") {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #dc3545;">Account Suspended</h2>
      <p style="font-size: 15px; color: #555;">
        We regret to inform you that your account has been <strong style="color:#dc3545;">suspended</strong>.
      </p>
      <div style="background-color:#fff5f5; border:1px solid #f5c2c7; padding:15px; border-radius:8px; margin:20px 0;">
        <p style="margin:0; font-size:15px; color:#721c24;">
          <strong>Reason:</strong> ${reason}
        </p>
      </div>
      <p style="font-size: 14px; color: #555;">
        If you believe this was a mistake, please contact our support team immediately to resolve the issue.
      </p>
      <div style="padding: 20px 0px 0px 0px;">
        <a href="mailto:support@example.com" style="background-color:#dc3545; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
      </div>
    </div>
  `;
    } else {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #28a745;">🎉 Welcome Back!</h2>
      <p style="font-size: 15px; color: #555;">
        Great news! Your account has been successfully <strong style="color:#28a745;">re-activated</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        You can now log back in and continue using our platform without any issues.
      </p>
      <div style="padding: 20px 0px 0px 0px;">
        <a href="https://yourwebsite.com/login" style="background-color:#28a745; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Login Now</a>
      </div>
    </div>
  `;
    }
    return baseTemplate({ title, bodyHtml });
  },

  storeStatusTemplate: (title, status, reason, storeName) => {
    if (status === "suspended") {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #dc3545;">Store Suspended</h2>
      <p style="font-size: 15px; color: #555;">
        We regret to inform you that your ${storeName} store has been <strong style="color:#dc3545;">suspended</strong>.
      </p>
      <div style="background-color:#fff5f5; border:1px solid #f5c2c7; padding:15px; border-radius:8px; margin:20px 0;">
        <p style="margin:0; font-size:15px; color:#721c24;">
          <strong>Reason:</strong> ${reason}
        </p>
      </div>
      <p style="font-size: 14px; color: #555;">
        If you believe this was a mistake, please contact our support team immediately to resolve the issue.
      </p>
      <div style="padding: 20px 0px 0px 0px;">
        <a href="mailto:support@example.com" style="background-color:#dc3545; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
      </div>
    </div>
  `;
    } else {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #28a745;">🎉 Welcome Back!</h2>
      <p style="font-size: 15px; color: #555;">
        Great news! Your ${storeName} store has been successfully <strong style="color:#28a745;">re-activated</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        You can now log back in and continue using your store without any issues.
      </p>
      <div style="padding: 20px 0px 0px 0px;">
        <a href="https://yourwebsite.com/login" style="background-color:#28a745; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Login Now</a>
      </div>
    </div>
  `;
    }
    return baseTemplate({ title, bodyHtml });
  },

  subscriptionStatusTemplate: (title, status, reason, storeName) => {
    let bodyHtml = "";
    if (status === "Cancel") {
      bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
        <h2 style="color: #dc3545;">Subscription Cancelled</h2>
        <p style="font-size: 15px; color: #555;">
          Your subscription for <strong>${storeName}</strong> store has been <strong style="color:#dc3545;">cancelled</strong>.
        </p>
        <div style="background-color:#fff5f5; border:1px solid #f5c2c7; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#721c24;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
        <p style="font-size: 14px; color: #555;">
          If you would like to reactivate your subscription, please contact our support team.
        </p>
        <div style="padding: 20px 0px 0px 0px;">
          <a href="mailto:support@example.com" style="background-color:#dc3545; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
        </div>
      </div>
    `;
    } else if (status === "pending") {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #CA8A16;">Subscription Under Review</h2>
      <p style="font-size: 15px; color: #555;">
        Your subscription for <strong>${storeName}</strong> store is currently <strong style="color: #CA8A16;">under review</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        Our team is reviewing your request, and you will receive an update within the next <strong>12 hours</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        You don't need to take any action right now — we will notify you once the review is complete.
      </p>
      <div style="padding: 20px 0px 0px 0px;">
        <a href="mailto:support@example.com" style="background-color: #CA8A16; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
      </div>
    </div>
  `;
    } else if (status === "trial expired") {
      bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
        <h2 style="color: #FF9800;">⚠️ Trial Period Ended</h2>
        <p style="font-size: 15px; color: #555;">
          Your trial for <strong>${storeName}</strong> store has <strong style="color:#FF9800;">expired</strong>.
        </p>
        <p style="font-size: 14px; color: #555;">
          To keep your store running without interruption, please upgrade to a paid plan.
        </p>
        <div style="padding: 20px 0px 0px 0px;">
          <a href="https://yourwebsite.com/upgrade" style="background-color:#FF9800; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Upgrade Now</a>
        </div>
      </div>
    `;
    } else {
      bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
        <h2 style="color: #28a745;">🎉 Subscription Active</h2>
        <p style="font-size: 15px; color: #555;">
          Great news! Your subscription for <strong>${storeName}</strong> store is now <strong style="color:#28a745;">active</strong>.
        </p>
        <p style="font-size: 14px; color: #555;">
          You can log in anytime and continue running your store without any interruption.
        </p>
        <div style="padding: 20px 0px 0px 0px;">
          <a href="https://yourwebsite.com/login" style="background-color:#28a745; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Login Now</a>
        </div>
      </div>
    `;
    }

    return baseTemplate({ title, bodyHtml });
  },

  invoiceStatusTemplate: (title, status, reason, storeName) => {
    let bodyHtml = "";

    if (status === "Failed") {
      bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
        <h2 style="color: #dc3545;">Payment Failed</h2>
        <p style="font-size: 15px; color: #555;">
          Your payment for <strong>${storeName}</strong> store could not be processed.
        </p>
        <div style="background-color:#fff5f5; border:1px solid #f5c2c7; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#721c24;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
        <p style="font-size: 14px; color: #555;">
          Please try again or use a different payment method. If the issue persists, contact our support team for assistance.
        </p>
        <div style="padding: 20px 0px 0px 0px;">
          <a href="mailto:support@example.com" style="background-color:#dc3545; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
        </div>
      </div>
    `;
    } else if (status === "pending") {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
      <h2 style="color: #CA8A16;">Payment Under Review</h2>
      <p style="font-size: 15px; color: #555;">
        Your payment for <strong>${storeName}</strong> store is currently <strong style="color: #CA8A16;">being verified</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        Our billing team is reviewing the transaction, and you will receive an update within the next <strong>12 hours</strong>.
      </p>
      <p style="font-size: 14px; color: #555;">
        No action is required from you at the moment — we will notify you once the review is complete.
      </p>
    <div style="padding: 20px 0px 0px 0px;">
        <a href="mailto:support@example.com" style="background-color: #CA8A16; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Contact Support</a>
      </div>
    </div>
  `;
    } else {
      bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding:10px 0px; margin: 0px auto; background: #fff;">
        <h2 style="color: #28a745;">Payment Successful</h2>
        <p style="font-size: 15px; color: #555;">
          Thank you! Your payment for <strong>${storeName}</strong> store has been <strong style="color:#28a745;">successfully processed</strong>.
        </p>
        <p style="font-size: 14px; color: #555;">
          Your invoice is now marked as <strong>Paid</strong>. You can access your updated billing history anytime from your dashboard.
        </p>
        <div style="padding: 20px 0px 0px 0px;">
          <a href="https://yourwebsite.com/dashboard" style="background-color:#28a745; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">View Invoice</a>
        </div>
      </div>
    `;
    }

    return baseTemplate({ title, bodyHtml });
  },
};
