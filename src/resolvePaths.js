import { path as rPath } from 'ramda';

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
    // const isManyReturnType = unResolvedPath.indexOf('[*') > -1;
    let path = [];

    let i = 0;
    let buffer = '';
    let inConditionPhase = false;
    let alreadyReachedLogicSymbol = false;
    let condition = {};

    while (i < unResolvedPath.length) {
        const isLast = i === unResolvedPath.length - 1;
        const token = unResolvedPath[i];
        // const prevToken = unResolvedPath[i - 1];
        const nextToken = unResolvedPath[i + 1];

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

            case '!':
            case '=':
            case '>':
            case '<':
                if (alreadyReachedLogicSymbol) {
                    buffer += token;
                    break;
                }

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
                alreadyReachedLogicSymbol = true;
            break;

            case ']':
                if (isLast || nextToken === '.') {
                    alreadyReachedLogicSymbol = false;
                    condition.value = eval(buffer);
    
                    inConditionPhase = false;
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
                } else {
                    buffer += token;
                }
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
