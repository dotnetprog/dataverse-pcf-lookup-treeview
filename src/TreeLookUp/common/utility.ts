export type GroupedBy<T, K> = K extends [infer K0, ...infer KR] ?
    Map<T[Extract<K0, keyof T>], GroupedBy<T, KR>> : T[];

// call signature
export function groupBy<T, K extends Array<keyof T>>(
  objects: readonly T[], ...by: [...K]
): GroupedBy<T, K>; 
export function groupBy(objects: readonly any[], ...by: Array<PropertyKey>) {
    if (!by.length) return objects;
    const [k0, ...kr] = by;
    const topLevelGroups = new Map<any, any[]>();
    for (const obj of objects) {
        let k = obj[k0];
        let arr = topLevelGroups.get(k);
        if (!arr) {
            arr = [];
            topLevelGroups.set(k, arr);
        }
        arr.push(obj);
    }
    return new Map(Array.from(topLevelGroups, ([k, v]) => ([k, groupBy(v, ...kr)])));

};