const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: './hannanfabrics-62b13dc68822.json',
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
