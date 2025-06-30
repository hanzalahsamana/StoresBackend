const { formatDate } = require("../Utils/FormatDate");

function generateOrderDetailsTemplate(admin, order) {
  const { from, to, customerInfo, orderData, orderInfo } = order;

  const productsHTML = orderData
    .map(
      (product) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              product.name
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.quantity
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.selectedSize
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.totalOfProduct / product.quantity
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.totalOfProduct
            }</td>
          </tr>
        `,
    )
    .join("");

  return `
      <html lang="en">
        <body>
          <div
            style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; border-radius: 4px; background-color: #ffffff; line-height: 1.5; color: #373e43; border: 1px solid #00afbc65; padding: 20px; margin: auto;"
          >
            <!-- Header -->
            <div
              style="width: 100%; border-bottom: 1px solid #c5c5c592; text-align: center; padding-bottom: 10px;"
            >
              <img src="${to}" alt="${from}" style="margin: 0; width:150px; height:auto;"/>
              <p style="margin: 5px 0;">Order Recieved from ${from}</p>
            </div>
  
            <!-- Greeting -->
            <div style="padding: 10px 0;">
              <p style="margin: 0;">
                Hi <strong>${admin?.name}</strong>,
              </p>
              <p style="margin: 0;">
                Here are your order details:
              </p>
            </div>
  
            <!-- Customer Info -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Customer Information
            </h3>
            <p style="margin:5px 0;"><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
            <p style="margin:5px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
            <p style="margin:5px 0;"><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p style="margin:5px 0;"><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.appartment}, ${customerInfo.city}, ${customerInfo.country} - ${customerInfo.postalCode}</p>
            <p style="margin:5px 0;"><strong>Payment Method:</strong> ${customerInfo.method}</p>
            <p style="margin:5px 0;"><strong>Order Id:</strong> #${order._id}</p>
  
            <!-- Order Details -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Order Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Size</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Price</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
  
            <!-- Order Summary -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Order Summary
            </h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Tax:</strong></p>
              <p style="margin: 0;">${orderInfo.tax}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Shipping:</strong></p>
              <p style="margin: 0;">${orderInfo.shipping}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Discount:</strong></p>
              <p style="margin: 0;">-${orderInfo.discount}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 18px;">
              <p style="margin: 0;"><strong>Total:</strong></p>
              <p style="margin: 0; color: #00afbc;">${orderInfo.total}</p>
            </div>
  
            <!-- Footer -->
            <div
              style="padding: 20px 10px; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #c5c5c592;"
            >
              Copyright ©2024 ${from} | All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
}

function generateOrderConfirmTemplate(admin, order) {
  const { from, to, customerInfo, orderData, orderInfo } = order;

  const productsHTML = orderData
    .map(
      (product) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              product.name
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.quantity
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.selectedSize
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.totalOfProduct / product.quantity
            }</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
              product.totalOfProduct
            }</td>
          </tr>
        `,
    )
    .join("");

  return `
      <html lang="en">
        <body>
          <div
            style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; border-radius: 4px; background-color: #ffffff; line-height: 1.5; color: #373e43; border: 1px solid #00afbc65; padding: 20px; margin: auto;"
          >
            <!-- Header -->
            <div
              style="width: 100%; border-bottom: 1px solid #c5c5c592; text-align: center; padding-bottom: 10px;"
            >
              <img src="${to}" alt="${from}" style="margin: 0; width:150px; height:auto;"/>
              <p style="margin: 5px 0;">Order Summary of ${from}</p>
            </div>
  
            <!-- Greeting -->
            <div style="padding: 10px 0;">
              <p style="margin: 0;">
                Hi <strong>${customerInfo.firstName} ${customerInfo.lastName}</strong>,
              </p>
              <p style="margin: 0;">
                Thank you for your order! Here are your order details:
              </p>
            </div>
  
            <!-- Customer Info -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Your Information
            </h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.appartment}, ${customerInfo.city}, ${customerInfo.country} - ${customerInfo.postalCode}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${customerInfo.method}</p>
            <p style="margin: 5px 0;"><strong>Order Id:</strong> #${order._id}</p>
  
            <!-- Order Details -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Order Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Size</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Price</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
  
            <!-- Order Summary -->
            <h3
              style="color: #00afbc; font-size: 18px; margin: 20px 0 10px 0; border-bottom: 1px solid #c5c5c592; padding-bottom: 5px;"
            >
              Order Summary
            </h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Tax:</strong></p>
              <p style="margin: 0;">${orderInfo.tax}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Shipping:</strong></p>
              <p style="margin: 0;">${orderInfo.shipping}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 0;"><strong>Discount:</strong></p>
              <p style="margin: 0;">-${orderInfo.discount}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 18px;">
              <p style="margin: 0;"><strong>Total:</strong></p>
              <p style="margin: 0; color: #00afbc;">${orderInfo.total}</p>
            </div>
  
            <!-- Footer -->
            <div
              style="padding: 20px 10px; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #c5c5c592;"
            >
              Copyright ©2024 ${from} | All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
}

function generateAdminContactTemplate(adminInfo, data) {
  return `<html lang="en">

<body>
    <div
        style="font-family: Arial, sans-serif; width: 100%; text-align:center; border-radius: 4px; background-color: #ffffff; line-height: 1.5; color: #373e43; border: 1px solid #00afbc65; padding: 20px;">
        <div style="width: 100%; padding:10px 0px; margin:auto; border-bottom: 1px solid #c5c5c592; text-align: center;">
            <img src=${
              adminInfo?.logo
            } alt=""  style="width: 150px; height: auto; margin:auto; margin-bottom: 10px;"/>
            <p style="margin: 0;">
                Hi <strong>${
                  adminInfo?.name
                },</strong> There has been a Contact Form Submission
                from <strong>${adminInfo?.brandName}</strong>
            </p>
        </div>

        <h3 style="color: #00afbc; font-size: 20px; font-weight: 500; margin: 10px 0 10px 0;">
            Contact Information:
        </h3>
        <div
            style="width: 90%; max-width:600px; margin:auto; border-radius: 4px; background-color: #f4f4f4; padding: 25px;">
            <div
                style="display: flex; width: 100%; justify-content: space-between; border-left: 4px solid #00afbc; padding: 10px;">
                <p style="margin: 0;">Name:</p>
                <p style="margin: 0 20px;">${data.name}</p>
            </div>
            <div
                style="display: flex; width: 100%; justify-content: space-between; border-left: 4px solid #00afbc; padding: 10px;">
                <p style="margin: 0;">Email:</p>
                <a href="mailto:${
                  data.email
                }" style="color: #00afbc; margin: 0 20px; text-decoration: none;">
                    ${data.email}
                </a>
            </div>
            <div
                style="display: flex; width: 100%; justify-content: space-between; border-left: 4px solid #00afbc; padding: 10px;">
                <p style="margin: 0;">Phone:</p>
                <p style="margin: 0 20px;">${data?.phone}</p>
            </div>
            <div
                style="display: flex; width: 100%; justify-content: space-between; border-left: 4px solid #00afbc; padding: 10px;">
                <p style="margin: 0;">Date / Time:</p>
                <p style="margin: 0 20px;">${formatDate(data.createdAt)}</p>
            </div>
        </div>
        <h3 style="color: #00afbc; font-size: 20px; font-weight: 500; margin: 10px 0 10px 0;">
            Customer message:
        </h3>
        <div
            style="width: 90%; max-width:600px; margin:auto; border-radius: 4px; background-color: #f4f4f4; padding: 25px;">
            <blockquote style="border-left: 4px solid #00afbc; text-align:left; padding-left: 10px; margin: 0;">
                ${data?.message}
            </blockquote>
        </div>

        <div style="padding: 20px 10px; font-size: 10px; text-align: center; margin-top: 20px;">
            Copyright @2024 ${adminInfo?.brandName}
        </div>
    </div>
</body>

</html>
`;
}

function generateCustomerContactTemplate(adminInfo, data) {
  return `<html lang="en">
  <body>
    <div
      style="font-family: Arial, sans-serif; width: 95%; border-radius: 4px; background-color: #ffffff; line-height: 1.5; color: #373e43; border: 1px solid #00afbc65; padding: 20px;"
    >
      <div
        style="width: 100%; border-bottom: 1px solid #c5c5c592; text-align: center;"
      >
        <img
          src=${adminInfo?.logo}
          alt=${adminInfo?.brandName}
          style="width: 100px; height: auto; margin:auto; margin-bottom: 10px;"
        />
        <p style="margin: 0;">
          Hi <strong>${data?.name},</strong> Thank you for getting in touch!
        </p>
      </div>
      <div
        style="width: 90%; border-radius: 4px; background-color: #f4f4f4; padding: 25px; margin: 10px auto; max-width:600px;"
      >
        <p style="margin: 0; color: #373e43;">
          We have received your message and will get back to you shortly.
        </p>

        <p style="margin: 10px 0; color: #373e43;">
          If you need immediate assistance, feel free to contact us at:
        </p>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">

            <a
            href="mailto:${adminInfo?.email}"
            style="color: #00afbc; text-decoration: none; margin: 10px 0;"
            >
            ${adminInfo.email}
            </a
            >
        </div>
      </div>

      <div
        style="padding: 20px 10px; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #c5c5c592;"
      >
        Copyright ©2024 ${adminInfo?.brandName} | All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
}

function generateOTPVerificationTemplate(user, otp) {
  return `<html lang="en">
  <body>
    <div
      style="font-family: Arial, sans-serif; width: 95%; border-radius: 4px; background-color: #ffffff; line-height: 1.5; color: #373e43; border: 1px solid #355CCE; padding: 20px;"
    >
      <div
        style="width: 100%; color:white; background-color: #355CCE; border-bottom: 1px solid #c5c5c592; text-align: center; padding:40px 0;"
      >
        <p style="margin: 0;">
          Thank You For Signing Up
        </p>
        <h1 style="margin: 0;">
          Verify Your Email Address
        </h1>

       
      </div>
      <div
        style="width: 90%; border-radius: 4px; background-color: #f4f4f4; padding: 25px; margin: 20px auto; max-width:600px;"
      >
       <p style="margin: 0;">
          Hi <strong>${user?.name},
        </p>
        <p style="margin: 10px 0; font-weight:500;">
         Please use the follwing One Time Password (OTP)
        </p>
        
        <div style="border:1px solid #355CCE; background-color:#fff; width:160px; text-align:center; letter-spacing:6px; font-size:22px;padding:10px; font-weight:500; color:#355CCE; ">

            ${otp}
        </div>
      </div>

      <div
        style="padding: 20px 10px; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #355CCE;"
      >
        Copyright ©2024 Admin Panel | All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = {
  generateOrderDetailsTemplate,
  generateOrderConfirmTemplate,
  generateAdminContactTemplate,
  generateCustomerContactTemplate,
  generateOTPVerificationTemplate,
};
