
const paginate = async (Model, query = {}, options = {}, pipeline = []) => {
    const { limit, sort, page, select } = options
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalData = await Model.countDocuments(query);

    if (pipeline.length > 0) {
        const fullPipeline = [
            ...pipeline,
            { $sort: sort },
            ...(limit > 0 ? [{ $skip: skip }, { $limit: parseInt(limit) }] : []),
        ];
        const data = await Model.aggregate(fullPipeline);
        return {
            data,
            totalData,
            pagination: {
                total: totalData,
                currentPage: page,
                totalPages: limit ? Math.ceil(total / parseInt(limit)) : page,
                skip: skip,
                limit: data?.length + parseInt(limit) * (page - 1),
            }
        }
    }

    const data = await Model.find(query)
        .select(select || "")
        .sort(sort || {})
        .skip(skip)
        .limit(parseInt(limit));

    return {
        data,
        totalData,
        pagination: {
            total: totalData,
            currentPage: page,
            totalPages: limit ? Math.ceil(totalData / parseInt(limit)) : page,
            skip: skip,
            limit: data?.length + parseInt(limit) * (page - 1),
        }
    };
};

module.exports = { paginate };
