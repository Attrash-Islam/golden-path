import { assocPath, path } from 'ramda';
import resolvePaths from './resolvePaths';

const GoldenPathUpdater = (unResolvedPath, value, object) => {
    const resolvedPaths = resolvePaths(unResolvedPath);
    let objectResult = object;

    resolvedPaths.forEach((resolvedPath) => {
        let newVal = value;

        if (typeof value === 'function') {
            newVal = value(
                path(resolvedPath, object)
            );
        }

        objectResult = assocPath(resolvedPath, newVal, object)
    });

    return objectResult;
};

export default GoldenPathUpdater;
