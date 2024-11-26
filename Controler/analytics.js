const { BetaAnalyticsDataClient } = require('@google-analytics/data');
require('dotenv').config(); 

const {
  GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_PRIVATE_KEY_ID,
  GOOGLE_CLOUD_PRIVATE_KEY,
  GOOGLE_CLOUD_CLIENT_EMAIL,
  GOOGLE_CLOUD_CLIENT_ID,
  GOOGLE_CLOUD_AUTH_URI,
  GOOGLE_CLOUD_TOKEN_URI,
  GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
  GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
  GOOGLE_CLOUD_UNIVERSE_DOMAIN,
} = process.env;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    type: "service_account",
    project_id: GOOGLE_CLOUD_PROJECT_ID,
    private_key_id: GOOGLE_CLOUD_PRIVATE_KEY_ID,
    private_key: GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'), 
    client_email: GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: GOOGLE_CLOUD_CLIENT_ID,
    auth_uri: GOOGLE_CLOUD_AUTH_URI,
    token_uri: GOOGLE_CLOUD_TOKEN_URI,
    auth_provider_x509_cert_url: GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
    universe_domain: GOOGLE_CLOUD_UNIVERSE_DOMAIN,
  },
});

const today = new Date();
const lastYear = new Date(today);
lastYear.setFullYear(today.getFullYear() - 1); 
const startDate = lastYear.toISOString().split('T')[0]; 
const endDate = today.toISOString().split('T')[0];

const getAnalyticsData = async (req, res) => {
    const propertyId = process.env.PROPERTY_ID;

  if (!propertyId) {
    return res.status(400).json({ message: 'Property ID is required' });
  }

  try {

    const [pathResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: startDate, endDate: endDate }],
        dimensions: [{ name: 'pagepath' }],
        metrics: [{ name: 'activeUsers' }],
      });
      
      const [countryResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: startDate, endDate: endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
      });

      const data = {
        pages:[],
        countries:[],
      }

    if (pathResponse.rows && pathResponse.rows.length > 0) {
        pathResponse.rows.forEach(row => {
            data.pages.push({
                page:row.dimensionValues[0].value,
                users:row.metricValues[0].value,
            });
          });
          
          countryResponse.rows.forEach(row => {
            data.countries.push({
                country:row.dimensionValues[0].value,
                users:row.metricValues[0].value,
            });
          });
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: 'No data found for the provided property' });
    }
  } catch (error) {
    return res.status(500).json({ message: `Error fetching analytics data: ${error.message}` });
  }
};

module.exports = { getAnalyticsData };
