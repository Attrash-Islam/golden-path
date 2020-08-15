import { path as rPath } from 'ramda';

const normalizeBuffer = (buffer) => isNaN(buffer) ? buffer : parseInt(buffer);

const EQUALITY_SYMBOLS = {
    '=': (x, y) => x === y,
    '>': (x, y) => x > y,
    '>=': (x, y) => x >= y,
    '<': (x, y) => x < y,
    '<=': (x, y) => x <= y
};

const resolvePaths = (unResolvedPath, object) => {
    // const isManyReturnType = unResolvedPath.indexOf('[*') > -1;
    let path = [];

    let i = 0;
    let buffer = '';
    let inConditionPhase = false;
    let condition = {};

    while (i < unResolvedPath.length) {
        const isLast = i === unResolvedPath.length - 1;
        const token = unResolvedPath[i];
        // const prevToken = unResolvedPath[i - 1];
        // const nextToken = unResolvedPath[i + 1];

        const normalizedBuffer = normalizeBuffer(buffer);
        let preValueArray;
        let arrayIndex;

        switch (token) {

            case '.':
                if (inConditionPhase) {
                    buffer += token;
                    break;
                }

                if (buffer) { path.push(normalizedBuffer); }
                buffer = '';
            break;

            case '[':
                if (buffer) { path.push(normalizedBuffer); }
                buffer = '';
                inConditionPhase = true;
            break;

            case '=':
            case '>':
            case '<':
                condition = {
                    prop: buffer,
                    logicSymbol: token
                };

                buffer = '';
            break;

            case ']':
                condition.value = eval(buffer);

                inConditionPhase = false;
                preValueArray = rPath(path, object);

                arrayIndex = preValueArray.findIndex((item) => {
                    const operator = EQUALITY_SYMBOLS[condition.logicSymbol];
                    return operator(item[condition.prop], condition.value);
                });

                path.push(arrayIndex);
                buffer = '';
            break;

            default:
                // add to the query buffer.
                buffer += token;

                if (isLast) {
                    path.push(normalizeBuffer(buffer));
                }
            break;
        }

        i++;
    }

    return path;
};

export default resolvePaths;
