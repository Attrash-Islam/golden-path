declare module 'golden-path' {
    export const get = (path: string, object: Object|Array) => any;
    export const update = (path: string, newValue: any, object: Object|Array) => any;
    export const v = (value: any) => any;
}
