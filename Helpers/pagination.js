const paginate = async (Model, query = {}, options = {}, pipeline = []) => {
  let { limit = 0, sort = {}, page = 1 } = options;

  // Convert and clamp values
  limit = Math.max(parseInt(limit) || 0, 0);
  page = Math.max(parseInt(page) || 1, 1); // Ensure page ≥ 1

  const skip = (page - 1) * limit;

  let totalData = 0;
  let data = [];

  if (pipeline.length > 0) {
    // Add $match stage at the start if query exists
    const fullPipeline = [
      ...(Object.keys(query).length ? [{ $match: query }] : []),
      ...pipeline,
      { $sort: sort },
      ...(limit > 0 ? [{ $skip: skip }, { $limit: limit }] : [])
    ];

    // Count total documents with same query + pipeline (without $skip/$limit)
    const countPipeline = [
      ...(Object.keys(query).length ? [{ $match: query }] : []),
      ...pipeline,
      { $count: 'count' }
    ];

    const countResult = await Model.aggregate(countPipeline);
    totalData = countResult[0]?.count || 0;

    data = await Model.aggregate(fullPipeline);
  } else {
    // Plain query (no aggregation)
    totalData = await Model.countDocuments(query);
    data = await Model.find(query).sort(sort).skip(skip).limit(limit);
  }

  return { data, totalData };
};

module.exports = { paginate };
