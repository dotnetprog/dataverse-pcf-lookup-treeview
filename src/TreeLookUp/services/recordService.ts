
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
    getRecordsByView(entityName:string,primaryAttribute:string,viewid:string,groupby:string[],filterText:string):Promise<ComponentFramework.WebApi.Entity[]>
}
export class FakeRecordService implements IRecordService {
    getRecordsByView(entityName: string,primaryAttribute:string, viewid: string,groupby:string[],filterText:string): Promise<ComponentFramework.WebApi.Entity[]> {
        return new Promise((resolve,reject) => {resolve(mockContactDataset);});
    }

}
type viewLists = {[key: string]: string;}
export class ContextRecordService implements IRecordService {
    private _webClient:ComponentFramework.WebApi;
    private _pagingSize:number;
    private _xmlParse:DOMParser = new DOMParser();
    private _xmlSerializer:XMLSerializer = new XMLSerializer();
    private _viewFetch:viewLists
    /**
     *
     */
    constructor(webClient:ComponentFramework.WebApi,pagingSize:number) {
        this._webClient = webClient;
        this._pagingSize = pagingSize;
        this._viewFetch = {};
    }

    async getRecordsByView(entityName:string,primaryAttribute:string,viewid: string,groupby:string[],filterText:string): Promise<ComponentFramework.WebApi.Entity[]> {
        const viewfetchXml = this._transformFetchXml(await this._getView(viewid),primaryAttribute,groupby,filterText);
        console.log(viewfetchXml);
        const options = `?fetchXml=${encodeURIComponent(viewfetchXml)}`;
        const records = await this._webClient.retrieveMultipleRecords(entityName,options,this._pagingSize);
        return records.entities;
    }
    private async _getView(viewid:string):Promise<string>{
        const options = `?$select=fetchxml,savedqueryid`;

        const cachedView = this._viewFetch[viewid];
        if(cachedView){
            return cachedView;
        }

        const view = await this._webClient.retrieveRecord('savedquery',viewid,options);
        this._viewFetch[viewid] = view.fetchxml;
        return this._viewFetch[viewid];
    }
    private _transformFetchXml(fetchXml:string,primaryAttribute:string,columns:string[],filterText:string):string{
        let xmlDoc = this._xmlParse.parseFromString(fetchXml,"text/xml");
        this._addMissingAttributes(xmlDoc,[primaryAttribute,...columns]);
        this._addFilterSearch(xmlDoc,primaryAttribute,filterText);
         return this._xmlSerializer.serializeToString(xmlDoc);
    }
    private _addFilterSearch(xmlDoc:Document,primaryAttribute:string,filterText:string){
        if(!filterText){return;}
        let entityElement = xmlDoc.getRootNode().firstChild?.firstChild;
        const filterElem =  xmlDoc.createElement('filter');
        filterElem.setAttribute('type','and');
        const condition = xmlDoc.createElement('condition');
        condition.setAttribute('attribute',primaryAttribute);
        condition.setAttribute('operator','like');
        condition.setAttribute('value',`%${filterText}%`);
        filterElem.appendChild(condition);
        entityElement!.appendChild(filterElem);

    }
    private _addMissingAttributes(xmlDoc:Document,columns:string[]){
        let entityElement = xmlDoc.getRootNode().firstChild?.firstChild;
        let attributes = Array.from(xmlDoc.getElementsByTagName('attribute'));
        columns.forEach((c)=> {
            const attrFound = attributes.find(a => a.getAttribute('name') === c );
            if(!attrFound){
                entityElement!.appendChild(this._createfetchXmlAttribute(xmlDoc,c));
            }

         });
    }
    private _createfetchXmlAttribute(xmlDoc:Document,attribute:string):HTMLElement{
        const attributeElement = xmlDoc.createElement('attribute');
        attributeElement.setAttribute('name',attribute);
        return attributeElement;
    }
}
