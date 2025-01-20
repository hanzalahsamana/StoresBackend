const {
  generateOrderDetailsTemplate,
  generateAdminContactTemplate,
  generateCustomerContactTemplate,
  generateOrderConfirmTemplate,
} = require("./EmailHtmlTemplate");
const sendEmail = require("./EmailSender");

const adminContactResponse = async (admin, to, logo, data) => {
  await sendEmail(
    admin.email,
    to,
    `Contact Form Submitted from ${admin.brandName}`,
    generateAdminContactTemplate({ ...admin, logo }, data)
  );
};

const customerContactResponse = async (admin, to, logo, data) => {
  await sendEmail(
    admin.email,
    to,
    `Contact To ${admin.brandName}`,
    generateCustomerContactTemplate({ ...admin, logo }, data)
  );
};

const adminOrderDetail = async (admin, to, orderDetails) => {
  await sendEmail(
    admin.email,
    to,
    `Order Summary of ${admin.brandName}`,
    generateOrderDetailsTemplate(admin , orderDetails)
  );
};
const customerOrderDetail = async (admin, to, orderDetails) => {
  await sendEmail(
    admin.email,
    to,
    `Order Summary of ${admin.brandName}`,
    generateOrderConfirmTemplate(admin , orderDetails)
  );
};

module.exports = {
  adminContactResponse,
  customerContactResponse,
  adminOrderDetail,
  customerOrderDetail,
};
