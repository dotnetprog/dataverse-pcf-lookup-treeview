
const mockContactDataset:ComponentFramework.WebApi.Entity[] = [
    {
        firstname:'John',
        lastname:'Doe',
        customertypecode:1
    },
    {
        firstname:'Eric',
        lastname:'Bonin',
        customertypecode:1
    },
    {
        firstname:'Jean',
        lastname:'Dumas',
        customertypecode:1
    },
    {
        firstname:'Celine',
        lastname:'Lavache',
        customertypecode:2
    },
    {
        firstname:'Gucci',
        lastname:'Dior',
        customertypecode:3
    },
    {
        firstname:'Italia',
        lastname:'Milano',
        customertypecode:3
    }
];


export interface IRecordService {
    getRecordsByView(entityName:string,viewid:string):Promise<ComponentFramework.WebApi.Entity[]>
}
export class FakeRecordService implements IRecordService {
    getRecordsByView(entityName: string, viewid: string): Promise<ComponentFramework.WebApi.Entity[]> {
        return new Promise((resolve,reject) => {resolve(mockContactDataset);});
    }

}
export class ContextRecordService implements IRecordService {
    _webClient:ComponentFramework.WebApi;
    _pagingSize:number;
    /**
     *
     */
    constructor(webClient:ComponentFramework.WebApi,pagingSize:number) {
        this._webClient = webClient;
        this._pagingSize = pagingSize;
    }

    async getRecordsByView(entityName:string,viewid: string): Promise<ComponentFramework.WebApi.Entity[]> {
        const options = `?savedQuery=${viewid}`;
        const records = await this._webClient.retrieveMultipleRecords(entityName,options,this._pagingSize);
        return records.entities;
    }

}
