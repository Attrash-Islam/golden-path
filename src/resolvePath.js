import { path as rPath } from 'ramda';
import { TOKEN_HASH } from './constants';

const normalizeBuffer = (buffer) => isNaN(buffer) ? buffer : parseInt(buffer);

const parseIt = (value) => {
    if (value === 'true') { return true; }
    if (value === 'false') { return false; }
    if (value === 'undefined') { return undefined; }
    if (value === 'null') { return null; }

    if (!isNaN(value)) { return Number(value); }

    // If a string.
    if (['\'', '"', '`'].some((x) => value[0] === x && value[value.length - 1] === x)) {
        return value.slice(1, value.length - 1);
    }
    
    return value;
};

const EQUALITY_SYMBOLS = {
    '!=': (x, y) => x !== y,
    '=': (x, y) => x === y,
    '>': (x, y) => x > y,
    '>=': (x, y) => x >= y,
    '<': (x, y) => x < y,
    '<=': (x, y) => x <= y
};

const resolvePath = (unResolvedPath, object) => {
    let path = [];

    let i = 0;
    let buffer = '';
    let conditions = [];
    let conditionIndex = 0;
    let isUserInput = false;
    let isGreedyQuery = false;

    while (i < unResolvedPath.length) {
        const isLast = i === unResolvedPath.length - 1;
        const token = unResolvedPath[i];
        const nextToken = unResolvedPath[i + 1];

        const normalizedBuffer = normalizeBuffer(buffer);
        let preValueArray;
        let arrayIndex;
        let isTokenHash;

        const satisfyTheQuery = (item) => conditions.every(({ logicSymbol, prop, value }) => {
            const operator = EQUALITY_SYMBOLS[logicSymbol];
            return operator(item[prop], value);
        });

        const getGreedyPaths = () => {
            const preValueArray = rPath(path, object)
            const ids = preValueArray.reduce((acc, item, idx) => {
                if (satisfyTheQuery(item)) {
                    return [...acc, idx];
                }
        
                return acc;
            }, []);
        
            if (ids.length === 0) {
                return {
                    isGreedy: true,
                    notExist: true
                };
            } else {
                let finalPaths = [];
        
                const results = ids.map((id) => {
                    // When we've such a greedy query:
                    // `array*[id=1].friends[name="Alex"]`
                    // and this query match multiple items in the array
                    // then we need to grab the ids and duplicate the update among all of them.
                    // In this code we reach the point where we resolve this query to:
                    //
                    // `array.0.friends*[name="Alex"]`
                    // `array.1.friends*[name="Alex"]`
                    // 
                    // and then we want to send all of them back to the resolvePath in order
                    // to continue with the next conditional path.
                    // Some sort of recursive solution.
                    //
                    //  In the next phase the second greedy query will be resolved as well.
                    // `array.0.friends.3`
                    // `array.0.friends.5`
                    // `array.1.friends.4`
                    // `array.1.friends.8`
                    // 
                    let newPath = path.join('.');
                    const restOfPath = unResolvedPath.slice(i + 1);
                    if (path.length > 0) {
                        newPath += '.';
                    }

                    newPath += id;
                    if (restOfPath[i] !== '.') {
                        newPath += '.';
                    }

                    newPath += restOfPath;

                    return resolvePath(newPath, object);
                });

                results.forEach(({ path, notExist, paths }) => {
                    if (notExist) { return; }
                    if (path) { finalPaths.push(path); }
                    if (paths) { finalPaths = finalPaths.concat(paths); }
                });
        
                return {
                    isGreedy: true,
                    paths: finalPaths
                };
            }
        };

        isTokenHash = token === TOKEN_HASH[0] && unResolvedPath.slice(i, TOKEN_HASH.length + i) === TOKEN_HASH;

        if (isTokenHash) {
            if (!isUserInput) {
                isUserInput = true;

                // Skip token hash
                i += TOKEN_HASH.length;
                continue;
            } else {
                isUserInput = false;

                // Skip token hash
                i += TOKEN_HASH.length;
                continue;
            }
        }

        // While being in token hash then add to buffer and continue to next loop.
        if (isUserInput) {
            buffer += token;
            i++;
            continue;
        }

        switch (token) {

            case '.':
                if (buffer) { path.push(normalizedBuffer); }
                if (isGreedyQuery) { return getGreedyPaths(); }
                isGreedyQuery = false;

                // Reset conditions state
                conditions = [];
                conditionIndex = 0;
                buffer = '';
            break;

            case '[':
                if (buffer) { path.push(normalizedBuffer); }
                buffer = '';
            break;

            case '!':
            case '=':
            case '>':
            case '<':
                conditions[conditionIndex] = {
                    prop: buffer,
                    logicSymbol: token
                };

                if (token === '>' && nextToken === '=') {
                    conditions[conditionIndex].logicSymbol = '>=';

                    // Skip next token
                    i++;
                }

                if (token === '<' && nextToken === '=') {
                    conditions[conditionIndex].logicSymbol = '<=';

                    // Skip next token
                    i++;
                }

                if (token === '!' && nextToken === '=') {
                    conditions[conditionIndex].logicSymbol = '!=';

                    // Skip next token
                    i++;
                }

                buffer = '';
            break;

            case '*':
                isGreedyQuery = true;
                if (isLast) { return getGreedyPaths(); }
            break;

            case ']':
                if (!conditions[conditionIndex].value) {
                    conditions[conditionIndex].value = parseIt(buffer);
                }

                if (nextToken === '[') {
                    conditionIndex++;
                    buffer = '';

                    // Skip next token and move iterator to the next
                    i += 2;
                    continue;
                }
                
                preValueArray = rPath(path, object) || [];

                if (isGreedyQuery) { return getGreedyPaths(); }

                arrayIndex = preValueArray.findIndex(satisfyTheQuery);

                if (arrayIndex === -1) {
                    return {
                        path,
                        notExist: true
                    };
                }

                path.push(arrayIndex);
                buffer = '';

                // Reset conditions state
                conditions = [];
                conditionIndex = 0;
            break;

            default:
                buffer += token;

                if (isLast) {
                    path.push(normalizeBuffer(buffer));
                }
            break;
        }

        i++;
    }

    return { path };
};

export default resolvePath;
