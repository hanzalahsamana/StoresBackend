const getCounts = async (Model, field = "status", filter = {}) => {
  const countsAgg = await Model.aggregate([
    { $match: filter },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
  ]);

  return countsAgg.reduce(
    (acc, item) => {
      acc[item._id?.toLowerCase()] = item.count;
      acc.all += item.count;
      return acc;
    },
    { all: 0 }
  );
};

module.exports = { getCounts };
