// helpers/searchSuggestion.js
const searchSuggestion = async ({
    Model,
    searchTerm,
    field = 'name',
    extraQuery = {},
    projection = { _id: 1, name: 1 },
    limit = 0, // 0 means no limit
}) => {
    if (!searchTerm) return [];

    const regexStartsWith = new RegExp(`^${searchTerm}`, 'i');
    const regexIncludes = new RegExp(searchTerm, 'i');

    const query = {
        $and: [
            extraQuery,
            {
                $or: [
                    { [field]: regexStartsWith },
                    { [field]: regexIncludes },
                ],
            },
        ],
    };

    try {
        let dbQuery = Model.find(query, projection).sort({ [field]: 1 });

        if (limit > 0) {
            dbQuery = dbQuery.limit(limit);
        }

        const results = await dbQuery;

        // Move "startsWith" matches first
        const startsWith = [];
        const includes = [];

        for (let doc of results) {
            if (regexStartsWith.test(doc[field])) {
                startsWith.push(doc);
            } else {
                includes.push(doc);
            }
        }

        return [...startsWith, ...includes];
    } catch (err) {
        console.error('Search Suggestion Error:', err);
        throw err;
    }
};

module.exports = { searchSuggestion };
