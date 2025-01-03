const { google } = require('googleapis');
const { calculateDateRange } = require('../Utils/CalculateDateRange');
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
  PROPERTY_ID
} = process.env;

const getAnalyticsData = async (req, res) => {
    const { dateFilter } = req.query;

    if (!PROPERTY_ID) {
        return res.status(400).json({ message: 'Property ID is required' });
    }

    if (!dateFilter) {
        return res.status(400).json({ message: 'Date filter is required' });
    }

    const { startDate, endDate } = calculateDateRange(dateFilter);

    try {
        // Set up the Google Analytics API client
        const auth = new google.auth.GoogleAuth({
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
            scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        });

        const analytics = google.analytics('v3');
        google.options({ auth });

        // Fetch real-time data (active users)
        const realTimeData = await analytics.data.realtime.get({
            ids: `ga:${PROPERTY_ID}`,
            metrics: 'rt:activeUsers',
        });

        const activeUsers = realTimeData.data.rows ? realTimeData.data.rows[0][0] : 0;

        // Get historical data (like pageviews, countries, etc.) if needed
        const [pathResponse] = await analyticsDataClient.runReport({
            property: `properties/${PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'pagepath' }],
            metrics: [{ name: 'activeUsers' }],
        });

        const [countryResponse] = await analyticsDataClient.runReport({
            property: `properties/${PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }],
        });

        const data = {
            realTimeActiveUsers: activeUsers,
            pages: [],
            countries: [],
        };

        if (pathResponse.rows && pathResponse.rows.length > 0) {
            pathResponse.rows.forEach(row => {
                data.pages.push({
                    page: row.dimensionValues[0].value,
                    users: row.metricValues[0].value,
                });
            });

            countryResponse.rows.forEach(row => {
                data.countries.push({
                    country: row.dimensionValues[0].value,
                    users: row.metricValues[0].value,
                });
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: `Error fetching analytics data: ${error.message}` });
    }
};

module.exports = { getAnalyticsData };
