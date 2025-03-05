export interface IEntityMetadataService{
    getEntityMetadata(etn:string,bypassCache:boolean,attributes?:string[]) : Promise<ComponentFramework.PropertyHelper.EntityMetadata>
}

export class CachedEntityMetadataService implements IEntityMetadataService {
    _util:ComponentFramework.Utility;
    _cachedMetadata:Record<string,ComponentFramework.PropertyHelper.EntityMetadata> = {};
    constructor(util:ComponentFramework.Utility){
        this._util = util;
    }
    async getEntityMetadata(etn: string,bypassCache:boolean,attributes?: string[]): Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
        if(this._cachedMetadata[etn] && !bypassCache){
            return this._cachedMetadata[etn];
        }

        const md = await this._util.getEntityMetadata(etn,attributes);
        this._cachedMetadata[etn] = md;
        return this._cachedMetadata[etn];
    }

}