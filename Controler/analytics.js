const { BetaAnalyticsDataClient } = require('@google-analytics/data');
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
  PROPERTY_ID,
} = process.env;

// 🎯 Initialize Google Analytics Client
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

// 🎯 Helper Functions for Formatting Date/Time
const formatMonth = (monthIndex) => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return months[parseInt(monthIndex, 10) - 1] || monthIndex;
};

const formatHour = (hourIndex) => {
  const hour = parseInt(hourIndex, 10);
  if (isNaN(hour)) return hourIndex;
  const period = hour < 12 ? "AM" : "PM";
  const formattedHour = hour % 12 || 12; // Convert 0 -> 12, 13 -> 1, etc.
  return `${formattedHour} ${period}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

// 🚀 Get Analytics Data
const getAnalyticsData = async (req, res) => {
  try {
    const { dateFilter ,siteName = 'ModestWardrobe' } = req.query;

    if (!PROPERTY_ID) throw new Error("Missing Google Analytics Property ID.");
    if (!dateFilter) throw new Error("Date filter is required.");

    const { startDate, endDate, timeDimension } = calculateDateRange(dateFilter);

    console.log(`📊 Fetching analytics for "${siteName}" | Date Range: ${startDate} - ${endDate}`);

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pageTitle' },
        { name: 'country' },
        { name: 'deviceCategory' },
        { name: 'newVsReturning' },
        { name: timeDimension }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'newUsers' },
        { name: 'totalUsers' },
        { name: 'userEngagementDuration' },
      ],
    });

    // 🎯 Aggregating Data Efficiently
    let stats = {
      views: 0,
      activeUsers: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      engagementDuration: 0,
      newUsers: 0,
      totalUsers: 0,
      newViews: 0,
      returningUsers: 0,
      countryViews: {},
      deviceViews: {},
      timeViews: {},
    };

    response.rows.forEach(row => {
      const [pageTitle, country, deviceType, userType, timeLabel] = row.dimensionValues.map(d => d.value);
      const views = parseInt(row.metricValues[0].value, 10);

      if (pageTitle === siteName) {
        stats.views += views;
        stats.activeUsers = parseInt(row.metricValues[1].value, 10);
        stats.sessions = parseInt(row.metricValues[2].value, 10);
        stats.bounceRate = parseFloat(row.metricValues[3].value);
        stats.avgSessionDuration = parseFloat(row.metricValues[4].value);
        stats.newUsers = parseInt(row.metricValues[5].value, 10);
        stats.totalUsers = parseInt(row.metricValues[6].value, 10);
        stats.engagementDuration = parseInt(row.metricValues[7].value, 10);

        stats.countryViews[country] ??= 0;
        stats.countryViews[country] += views;

        stats.deviceViews[deviceType] ??= 0;
        stats.deviceViews[deviceType] += views;

        // 🕒 Format Time Labels (Month, Hour, Date)
        let formattedTimeLabel = timeLabel;
        if (timeDimension === "month") formattedTimeLabel = formatMonth(timeLabel);
        else if (timeDimension === "hour") formattedTimeLabel = formatHour(timeLabel);
        else if (timeDimension === "date") formattedTimeLabel = formatDate(timeLabel);

        stats.timeViews[formattedTimeLabel] ??= 0;
        stats.timeViews[formattedTimeLabel] += views;

        userType === "new" ? (stats.newViews += views) : (stats.returningUsers += views);
      }
    });

  //   const avgEngagementPerUser = stats.activeUsers > 0
  // ? (stats.engagementDuration / stats.activeUsers).toFixed(2)
  // : "0";

  // const avgEngagementPerUserSeconds = (avgEngagementPerUser > 1000) 
  // ? (avgEngagementPerUser / 1000).toFixed(2) 
  // : avgEngagementPerUser;

    const formattedStats = {
      store: siteName,
      views: stats.views.toString(),
      activeUsers: stats.activeUsers.toString(),
      sessions: stats.sessions.toString(),
      bounceRate: `${stats.bounceRate}%`,
      avgSessionDuration: `${stats.avgSessionDuration} sec`,
      avgEngagementPerUser: `${stats.engagementDuration} sec`,
      countryViews: stats.countryViews,
      newUsers: stats.newUsers.toString(),
      returningUsers: stats.returningUsers.toString(),
      newViews: stats.newViews.toString(),
      totalUsers: stats.totalUsers.toString(),
      deviceViews: stats.deviceViews,
      timeViews: stats.timeViews
    };

    console.log("✅ Analytics Data:", formattedStats);
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalyticsData };
