const cloudinary = require('cloudinary').v2;

// Configure Cloudinary API credentials
cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
});

// Export the configured cloudinary instance
module.exports = cloudinary;
