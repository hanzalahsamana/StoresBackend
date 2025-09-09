// const Queue = require("bull");
// const { sendEmail } = require("../../Helpers/EmailSender");
// const { baseTemplate } = require("../../Emails/baseTemplate");

// const emailQueue = new Queue("emailQueue", {
//   redis: { host: "127.0.0.1", port: 6379 },
// });

// // Process emails in queue
// emailQueue.process(10, async (job) => {
//   const {
//     from,
//     to,
//     subject,
//     html,
//     userName,
//     isAction,
//     actionLink,
//     actionText,
//   } = job.data;

//   let bodyHtml = html;

//   if (isAction && actionLink && actionText) {
//     bodyHtml += `
//       <p style="margin-top:20px; text-align:center;">
//         <a href="${actionLink}" 
//            style="
//              display:inline-block;
//              padding:10px 30px;
//              background:#355DFC;
//              color:#fff;
//              text-decoration:none;
//              text-transform: capitalize;
//              border-radius:8px;
//              font-weight:bold;
//              font-size:16px;
//              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
//              transition: all 0.3s ease;
//            "
//            onmouseover="this.style.background='#2a44c1'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.2)';"
//            onmouseout="this.style.background='#355DFC'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.15)';"
//         >
//           ${actionText}
//         </a>
//       </p>
//     `;
//   }

//   const template = baseTemplate({
//     title: subject,
//     userName: userName || "User",
//     bodyHtml,
//   });

//   await sendEmail(from, to, subject, template);
//   return { success: true, to };
// });

// module.exports = emailQueue;
