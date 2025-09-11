const { baseTemplate } = require("./baseTemplate");

module.exports = {
  userStatusTemplate: (title, status, reason) => {
    if (status === "suspended") {
      bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:20px 0px; margin: 0px auto; background: #fff;">
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding:20px 0px; margin: 0px auto; background: #fff;">
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
};
