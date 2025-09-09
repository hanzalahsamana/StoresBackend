const baseTemplate = ({
  title,
  userName = "User",
  bodyHtml,
  customStyles = "",
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: sans-serif;
        }
        .main-container {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding: 20px 0;
          width: 100%;
          background-color: #ffffff;
        }
        .email-container {
          border: 1px solid #e5e7eb;
          width:100%;
          max-width: 500px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #355DFC;
          padding: 25px 0px;
          text-align: center;
        }
        .header .logo {
          font-size: 22px;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
          letter-spacing: 1px;
        }
        .content {
          padding: 20px;
        }
        .greeting {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 15px 0;
          color: #333333;
        }
        .title {
          font-size: 20px; 
          font-weight: bold;
          color: #333333;
          margin-bottom: 10px;
        }
        .message {
          font-size: 16px;
          color: #555555;
          line-height: 1.6;
        }
        .footer {
          background: #F3F4F6;
          padding: 6px 0px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #999999;
          text-align: center;
        }
        ${customStyles}
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="email-container">
          <div class="header">
            <p class="logo">MULTI TENANT</p>
          </div>
          <div class="content">
            <p class="greeting">Hello ${userName} 👋,</p>
            ${bodyHtml}
            <p class="message">Best regards,<br />Team Multi Tenant</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Multi Tenant. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

module.exports = { baseTemplate };
