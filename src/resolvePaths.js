const normalizeQuery = (q) => isNaN(q) ? q : parseInt(q);

const resolvePaths = (unResolvedPath) => {
    let path = [];

    let i = 0;
    let query = '';
    let inConditionalClause = false;
    // let conditionalData = [];

    while (i < unResolvedPath.length) {
        const token = unResolvedPath[i];
        const normalizedQuery = normalizeQuery(query);

        switch (token) {
            case '.':
                if (query) { path.push(normalizedQuery); }
                query = '';
            break;

            case '[':
                inConditionalClause = true;
                if (query) { path.push(normalizedQuery); }
                query = '';
            break;

            case ']':
                inConditionalClause = false;
                // TODO execute the conditionalData object logic.
            break;

            case '&':
                if (!inConditionalClause) { throw new Error('can\'t use "&" outside of conditional clause.') }
            break;

            case '|':
                if (!inConditionalClause) { throw new Error('can\'t use "|" outside of conditional clause.') }
            break;

            default:
                // add to the query buffer.
                query += token;
            break;
        }

        i++;
    }

    // If query is buffered then this means that we've last data to push to the path array.
    if (query.length > 0) {
        path.push(normalizeQuery(query));
    }

    return [path];
};

export default resolvePaths;
