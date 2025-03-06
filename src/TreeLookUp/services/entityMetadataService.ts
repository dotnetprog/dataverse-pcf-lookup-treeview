export interface IEntityMetadataService{
    clearCache():void;
    getEntityMetadata(etn:string,bypassCache:boolean,attributes?:string[]) : Promise<ComponentFramework.PropertyHelper.EntityMetadata>
}

export class CachedEntityMetadataService implements IEntityMetadataService {
    _util:ComponentFramework.Utility;
    _cachedMetadata:Record<string,ComponentFramework.PropertyHelper.EntityMetadata> = {};
    constructor(util:ComponentFramework.Utility){
        this._util = util;
    }
    clearCache(): void {
        this._cachedMetadata = {};
    }
    async getEntityMetadata(etn: string,bypassCache:boolean,attributes?: string[]): Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
        if(this._cachedMetadata[etn] && !bypassCache){
            return this._cachedMetadata[etn];
        }
        console.log(`query metadata: ${etn} , ${bypassCache} , [${attributes?.join(',')}] `);
        const md = await this._util.getEntityMetadata(etn,attributes);
        this._cachedMetadata[etn] = md;
        return this._cachedMetadata[etn];
    }

}