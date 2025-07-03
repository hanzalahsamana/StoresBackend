
const paginate = async (Model, query = {}, options = {}, pipeline = []) => {
    const { limit, sort, page } = options
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (pipeline.length > 0) {
        const fullPipeline = [
            ...pipeline,
            { $sort: sort },
            ...(limit > 0 ? [{ $skip: skip }, { $limit: parseInt(limit) }] : []),
        ];

        const data = await Model.aggregate(fullPipeline);
        return data
    }

    const data = await Model.find(query)
        .sort(sort || {})
        .skip(skip)
        .limit(parseInt(limit));

    return data;
};

module.exports = { paginate };
