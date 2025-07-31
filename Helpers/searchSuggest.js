// helpers/searchSuggestion.js
const searchSuggestion = async ({
    Model,
    searchTerm,
    field = 'name',
    extraQuery = {},
    projection = { _id: 1, name: 1 },
    limit = 0,
}) => {
    try {
        console.log("projection", projection)
        if (!searchTerm) {
            const query = Model.find(extraQuery, projection).sort({ [field]: 1 });
            if (limit > 0) query.limit(limit);
            return await query;
        }

        const regexStartsWith = new RegExp(`^${searchTerm}`, 'i');
        const regexIncludes = new RegExp(searchTerm, 'i');

        const startsWithQuery = Model.find(
            {
                ...extraQuery,
                [field]: regexStartsWith,
            },
            projection
        ).sort({ [field]: 1 });

        const includesQuery = Model.find(
            {
                ...extraQuery,
                [field]: {
                    $regex: regexIncludes,
                    $not: regexStartsWith,
                },
            },
            projection
        ).sort({ [field]: 1 });

        if (limit > 0) {
            startsWithQuery.limit(limit);
            includesQuery.limit(limit);
        }

        const [startsWith, includes] = await Promise.all([
            startsWithQuery,
            includesQuery,
        ]);

        return [...startsWith, ...includes];
    } catch (err) {
        console.error('Search Suggestion Error:', err);
        throw err;
    }
};

module.exports = { searchSuggestion };
