import { IEntityMetadataService } from "./entityMetadataService";
import * as utilities from "../utils";

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
    getRecordsByFetchXml(entityName:string,fetchXml:string):Promise<ComponentFramework.WebApi.Entity[]>
}
export class FakeRecordService implements IRecordService {
    getRecordsByFetchXml(entityName:string,fetchXml:string): Promise<ComponentFramework.WebApi.Entity[]> {
        return new Promise((resolve,reject) => {resolve(mockContactDataset);});
    }
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
