import { assocPath, path as rPath } from 'ramda';
import resolvePaths from './resolvePaths';

const update = (unResolvedPath, value, object) => {
    const resolvedPath = resolvePaths(unResolvedPath, object);
    let objectResult = object;

    let newVal = value;

    if (typeof value === 'function') {
        newVal = value(
            rPath(resolvedPath, object)
        );
    }

    objectResult = assocPath(resolvedPath, newVal, object)

    return objectResult;
};

export { update };
