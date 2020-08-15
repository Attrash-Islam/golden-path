import { assocPath, path as rPath } from 'ramda';
import resolvePaths from './resolvePaths';

const update = (unResolvedPath, value, object) => {
    const { path, notExist } = resolvePaths(unResolvedPath, object);
    if (notExist) { return object; }

    let objectResult = object;

    let newVal = value;

    if (typeof value === 'function') {
        newVal = value(
            rPath(path, object)
        );
    }

    objectResult = assocPath(path, newVal, object)

    return objectResult;
};

const get = (unResolvedPath, object) => {
    const { path, notExist } = resolvePaths(unResolvedPath, object);
    if (notExist) { return undefined; }

    return rPath(path, object);
};

export { get, update };
