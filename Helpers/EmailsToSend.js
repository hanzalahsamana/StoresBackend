const {
  generateOrderDetailsTemplate,
  generateAdminContactTemplate,
  generateCustomerContactTemplate,
  generateOrderConfirmTemplate,
  generateOTPVerificationTemplate,
} = require("./EmailHtmlTemplate");
const sendEmail = require("./EmailSender");

const AdminPanel = {
  email:'hanzalahsamana789@gmail.com',
  brandName:'Admin Panel',
}

const adminContactResponse = async (admin, to, logo, data) => {
  await sendEmail(
    admin,
    to,
    `Contact Form Submitted from ${admin.brandName}`,
    generateAdminContactTemplate({ ...admin, logo }, data)
  );
};

const customerContactResponse = async (admin, to, logo, data) => {
  await sendEmail(
    admin,
    to,
    `Contact To ${admin.brandName}`,
    generateCustomerContactTemplate({ ...admin, logo }, data)
  );
};

const adminOrderDetail = async (admin, to, orderDetails) => {
  await sendEmail(
    admin,
    to,
    `Order Summary of ${admin.brandName}`,
    generateOrderDetailsTemplate(admin, orderDetails)
  );
};

const customerOrderDetail = async (admin, to, orderDetails) => {
  await sendEmail(
    admin,
    to,
    `Order Summary of ${admin.brandName}`,
    generateOrderConfirmTemplate(admin, orderDetails)
  );
};

const OTPVerificationEmail = async (user, otp) => {
  await sendEmail(
    AdminPanel,
    user.email,
    `OTP Verification`,
    generateOTPVerificationTemplate(user, otp)
  );
};

module.exports = {
  adminContactResponse,
  customerContactResponse,
  adminOrderDetail,
  customerOrderDetail,
  OTPVerificationEmail,
};
