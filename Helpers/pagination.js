const paginate = async (Model, query = {}, options = {}, pipeline = []) => {
    let { limit = 0, sort = {}, page = 1, populate, select } = options;

    limit = parseInt(limit);
    page = parseInt(page);

    const skip = (page - 1) * limit;

    let totalData = 0;
    let data = [];

    if (pipeline.length > 0) {
        const fullPipeline = [
            ...(Object.keys(query).length ? [{ $match: query }] : []),
            ...pipeline,
            { $sort: sort },
            ...(limit > 0 ? [{ $skip: skip }, { $limit: limit }] : [])
        ];

        const countPipeline = [
            ...(Object.keys(query).length ? [{ $match: query }] : []),
            ...pipeline,
            { $count: 'count' }
        ];

        const countResult = await Model.aggregate(countPipeline);
        totalData = countResult[0]?.count || 0;

        data = await Model.aggregate(fullPipeline);
    } else {
        console.log("limit", limit)
        console.log("skip", skip)
        console.log("page", page)
        totalData = await Model.countDocuments(query);
        let abc = Model.find(query).select(select || "").sort(sort).skip(skip).limit(limit);
        if (populate) {
            abc = abc.populate(populate);
        }
        data = await abc
    }

    return {
        data, totalData, pagination: {
            total: totalData,
            currentPage: page,
            totalPages: limit ? Math.ceil(totalData / limit) : page,
            skip: skip,
            limit: data?.length + limit * (page - 1),
        },
    };
};

module.exports = { paginate };
