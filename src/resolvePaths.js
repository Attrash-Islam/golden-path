import { path as rPath } from 'ramda';
import { TOKEN_HASH } from './constants';

const normalizeBuffer = (buffer) => isNaN(buffer) ? buffer : parseInt(buffer);

const EQUALITY_SYMBOLS = {
    '!=': (x, y) => x !== y,
    '=': (x, y) => x === y,
    '>': (x, y) => x > y,
    '>=': (x, y) => x >= y,
    '<': (x, y) => x < y,
    '<=': (x, y) => x <= y
};

const resolvePaths = (unResolvedPath, object) => {
    let path = [];

    let i = 0;
    let buffer = '';
    let condition = {};
    let isUserInput = false;

    while (i < unResolvedPath.length) {
        const isLast = i === unResolvedPath.length - 1;
        const token = unResolvedPath[i];
        const nextToken = unResolvedPath[i + 1];

        const normalizedBuffer = normalizeBuffer(buffer);
        let preValueArray;
        let arrayIndex;
        let isTokenHash;

        isTokenHash = token === TOKEN_HASH[0] && unResolvedPath.slice(i, TOKEN_HASH.length + i) === TOKEN_HASH;

        if (isTokenHash) {
            if (!isUserInput) {
                isUserInput = true;

                // Skip token hash
                i += TOKEN_HASH.length;
                buffer = '';
                continue;
            } else {
                isUserInput = false;
                condition.value = eval(buffer);
                buffer = '';

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

                condition = {
                    prop: buffer,
                    logicSymbol: token
                };

                if (token === '>' && nextToken === '=') {
                    condition.logicSymbol = '>=';
                    i++;
                }

                if (token === '<' && nextToken === '=') {
                    condition.logicSymbol = '<=';
                    i++;
                }

                if (token === '!' && nextToken === '=') {
                    condition.logicSymbol = '!=';
                    i++;
                }

                buffer = '';
            break;

            case ']':
                if (!condition.value) {
                    condition.value = eval(buffer);
                }

                preValueArray = rPath(path, object);

                arrayIndex = preValueArray.findIndex((item) => {
                    const operator = EQUALITY_SYMBOLS[condition.logicSymbol];
                    return operator(item[condition.prop], condition.value);
                });

                if (arrayIndex === -1) {
                    return {
                        path,
                        notExist: true
                    };
                }

                path.push(arrayIndex);
                buffer = '';
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

export default resolvePaths;
