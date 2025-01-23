const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "junaidhunani890@gmail.com",
      pass: "kgns hjyl xumr zexs",
    },
  });
};

// VNhqswlhWjCF2wJrvxtVnmVu vercel token

const sendEmail = async (from, to, subject, html) => {
  const mailOptions = {
    from: `${from.brandName} <${from.email}>`,
    to,
    subject,
    html,
  };

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail(mailOptions);
    return `Email sent: ${info.response}`;
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

module.exports = sendEmail;
