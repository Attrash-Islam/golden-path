import { assocPath, path as rPath } from 'ramda';
import resolvePath from './resolvePath';
import { TOKEN_HASH } from './constants';

const update = (unResolvedPath, value, object) => {
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
        
            objectResult = assocPath(p, newVal, objectResult)
        });
    }

    return objectResult;
};

const get = (unResolvedPath, object) => {
    const { path, notExist } = resolvePath(unResolvedPath, object);
    if (notExist) { return undefined; }

    return rPath(path, object);
};

const v = (value) => `${TOKEN_HASH}${value}${TOKEN_HASH}`;

export { get, update, v };
