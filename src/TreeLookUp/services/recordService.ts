




export interface IRecordService {
    getRecordsByFetchXml(entityName:string,fetchXml:string):Promise<ComponentFramework.WebApi.Entity[]>
}

export class ContextRecordService implements IRecordService {
    private _webClient:ComponentFramework.WebApi;

    /**
     *
     */
    constructor(webClient:ComponentFramework.WebApi) {
        this._webClient = webClient;
    }
   
    async getRecordsByFetchXml(entityName:string,fetchXml:string): Promise<ComponentFramework.WebApi.Entity[]> {
        console.log(fetchXml);
        const options = `?fetchXml=${encodeURIComponent(fetchXml)}`;
        const records = await this._webClient.retrieveMultipleRecords(entityName,options);
        return records.entities;
    }
   
    
}
