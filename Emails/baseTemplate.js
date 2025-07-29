const baseTemplate = ({ title, bodyHtml, customStyles = '' }) => {
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
          background-color: #F3F2F0
        }
        .email-container {
          border: 2px solid #BBBBBB;
          max-width: 450px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
        }
        .header {
          margin-bottom: 20px;
          display: flex;
          width: 100%;
        }
        .header img {
          width: 250px;
          margin: 0 auto;
        }
        .title {
          font-size: 24px;
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
          font-size: 14px;
          color: #999999;
          margin-top: 30px;
          text-align: center;
        }

        .logo{
        font-size:25px;
        }

        ${customStyles}
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="email-container">
          <div class="header">
           <p class="logo">Multi Tenant</p>
          </div>
          ${bodyHtml}
          <p class="message">Best regards,<br />Team myratespermile</p>
          <div class="footer">
            <p>&copy; 2024 Multi Tenant. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

module.exports = { baseTemplate };
