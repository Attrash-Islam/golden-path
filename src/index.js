import { assocPath, path as rPath, curry } from 'ramda';
import resolvePath from './resolvePath';
import { TOKEN_HASH } from './constants';

const update = curry((unResolvedPath, value, object) => {
    let { path, paths, notExist } = resolvePath(unResolvedPath, object);
    if (notExist) { return object; }
    if (path && !paths) { paths = [path]; }

    let objectResult = object;

    let newVal = value;

    if (paths) {
        paths.forEach((p) => {
            if (typeof value === 'function') {
                newVal = value(
                    rPath(p, object)
                );
            }

            const isSameValue = rPath(p, objectResult) === newVal;
            if (isSameValue) { return; }
        
            objectResult = assocPath(p, newVal, objectResult)
        });
    }

    return objectResult;
});

const get = curry((unResolvedPath, object) => {
    let { path, paths, notExist, isGreedy } = resolvePath(unResolvedPath, object);
    if (notExist) { return isGreedy ? [] : undefined; }

    if (path) { return rPath(path, object); }

    if (paths) { return paths.map((p) => rPath(p, object)); }
});

const v = (value) => `${TOKEN_HASH}${value}${TOKEN_HASH}`;

export { get, update, v };
