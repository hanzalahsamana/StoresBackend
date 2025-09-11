const { baseTemplate } = require("../../Emails/baseTemplate");
const { sendEmail } = require("../../Helpers/EmailSender");
const { UserModal } = require("../../Models/userModal");

module.exports = {
  emailSender: async (req, res) => {
    try {
      const {
        html,
        subject,
        audience,
        users = [],
        isAction,
        actionLink,
        actionText,
      } = req.body;

      let recipients = [];

      const baseFilter = { role: { $ne: "superAdmin" } }; // superAdmin exclude

      if (audience === "All Users") {
        recipients = await UserModal.find(baseFilter, "email name");
      } else if (audience === "Suspended Users") {
        recipients = await UserModal.find(
          { ...baseFilter, status: "suspended" },
          "email name"
        );
      } else if (audience === "Active Users") {
        recipients = await UserModal.find(
          { ...baseFilter, status: "active" },
          "email name"
        );
      } else if (audience === "Specific Users") {
        recipients = await UserModal.find(
          { ...baseFilter, email: { $in: users } },
          "email name"
        );
      }

      if (!recipients.length) {
        return res.status(404).json({
          success: false,
          message: "No users found for the selected audience!",
        });
      }

      const from = {
        storeName: "Hello",
        email: "no-reply@multitenant.com",
      };

      let bodyHtml = html;

      if (isAction && actionLink && actionText) {
        bodyHtml += `
              <p style="margin-top:20px; text-align:center;">
                <a href="${actionLink}" 
                   style="
                     display:inline-block;
                     padding:10px 30px;
                     background:#355DFC;
                     color:#fff;
                     text-decoration:none;
                     text-transform: capitalize;
                     border-radius:8px;
                     font-weight:bold;
                     font-size:16px;
                     box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                     transition: all 0.3s ease;
                   "
                   onmouseover="this.style.background='#2a44c1'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.2)';"
                   onmouseout="this.style.background='#355DFC'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.15)';"
                >
                  ${actionText}
                </a>
              </p>
            `;
      }
      
      const emailPromises = recipients.map((user) => {
        const template = baseTemplate({
          title: subject,
          bodyHtml,
        });
        return sendEmail(from, user?.email, subject, template);
      });

      await Promise.all(emailPromises);

      return res.status(200).json({
        success: true,
        message: `Emails sent successfully to ${recipients.length} users.`,
      });
    } catch (e) {
      console.error("Error sending Email!", e?.message || e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },
};
