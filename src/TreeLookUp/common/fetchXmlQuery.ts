import { IEntityMetadataService } from "../services/entityMetadataService";
import * as utilities from "../utils";
export type LinkEntity = {
    entityType:string;
    alias:string;
    columns:string[]
}
export class FetchXmlQuery{
    private _xmlParse:DOMParser = new DOMParser();
    private _xmlSerializer:XMLSerializer = new XMLSerializer();
    private _xmlDoc:Document;
    private _entityMetadataService:IEntityMetadataService;
    constructor(entityMetadataService:IEntityMetadataService){
        this._entityMetadataService = entityMetadataService;
    }
    LoadFrom(fetchXml:string){
        this._xmlDoc = this._xmlParse.parseFromString(fetchXml,"text/xml");
    }
    toString(){
        return this._xmlSerializer.serializeToString(this._xmlDoc);
    }
    getTopLevelAttributes():string[]{
        const xpathResult = this._xmlDoc.evaluate("/fetch/entity/attribute",this._xmlDoc,null,XPathResult.ANY_TYPE);
        const attributesXmlElems = this.getAllElementsFromXPathResult(xpathResult);
        return attributesXmlElems.map(a => a.getAttribute('name')!);
    }
    getQueryEntityName():string{
        const xpathResult = this._xmlDoc.evaluate("/fetch/entity",this._xmlDoc,null,XPathResult.ANY_TYPE);
        const entityEl = xpathResult.iterateNext() as Element;
        return entityEl.getAttribute('name')!;
    }
    async addAttributes(...columns:string[]){
        const columnsMd = columns.map(c => c.split('.')[0]);
        const rootMd = await this._entityMetadataService.getEntityMetadata(this.getQueryEntityName(),true,columnsMd);
        let entityElement = this._xmlDoc.getRootNode().firstChild?.firstChild;
        const xpathResult = this._xmlDoc.evaluate("/fetch/entity/attribute",this._xmlDoc,null,XPathResult.ANY_TYPE);
        let attributes = this.getAllElementsFromXPathResult(xpathResult);
        columns.filter(c => !c.includes('.')).forEach((c)=> {
            const attrFound = attributes.find(a => a.getAttribute('name') === c);
            if(!attrFound){
                entityElement!.appendChild(this._createfetchXmlAttribute(c));
            }

         });
         const relatedColumns = columns.filter(c => c.includes('.'));
         for(const relatedColumn of relatedColumns){
            await this._addRelatedAttribute(rootMd,relatedColumn);
         }
        
    }
    addFilterSearch(attribute:string,filterText:string){
        if(!filterText){return;}
        let entityElement = this._xmlDoc.getRootNode().firstChild?.firstChild;
        const filterElem =  this._xmlDoc.createElement('filter');
        filterElem.setAttribute('type','and');
        const condition = this._xmlDoc.createElement('condition');
        condition.setAttribute('attribute',attribute);
        condition.setAttribute('operator','like');
        condition.setAttribute('value',`%${filterText}%`);
        filterElem.appendChild(condition);
        entityElement!.appendChild(filterElem);

    }
    getLinkEntity(column:string):LinkEntity{
        const xpathResult = this._xmlDoc.evaluate(`/fetch/entity/link-entity[@to='${column}']`,this._xmlDoc,null,XPathResult.ANY_TYPE);
        const existingLinkEntity = xpathResult?.iterateNext() as Element;
        const relatedAttributes = Array.from(existingLinkEntity.getElementsByTagName('attribute')).map(a => a.getAttribute('name')!);
        return { 
            alias:existingLinkEntity?.getAttribute('alias')!,
            entityType:existingLinkEntity?.getAttribute('name')!,
            columns:relatedAttributes
        };
    }
    private async _addRelatedAttribute(rootEntityMD:ComponentFramework.PropertyHelper.EntityMetadata,relatedField:string){
        const [source,destination,entityType] = relatedField.split('.');
        const xpathResult = this._xmlDoc.evaluate(`/fetch/entity/link-entity[@to='${source}']`,this._xmlDoc,null,XPathResult.ANY_TYPE);
        let entityElement = this._xmlDoc.getRootNode().firstChild?.firstChild;
        const existingLinkEntity = xpathResult.iterateNext() as Element;
        if(existingLinkEntity){
            const existingAttributes = Array.from(existingLinkEntity.getElementsByTagName('attribute')).map(a => a.getAttribute('name'));
            if(!existingAttributes.includes(destination)){
                existingLinkEntity.appendChild(this._createfetchXmlAttribute(destination))
            }
        }else{
            const alias = 'a_'+utilities.makeid(5);
            // Get metadata to build the link entity.
            const attributeMD = rootEntityMD.Attributes.getByName(source);
            const targetType = entityType ?? attributeMD.Targets[0];
            const targetMetadata = await this._entityMetadataService.getEntityMetadata(targetType,false);
            // Build link-entity and add related field
            const linkEntityElement = this._xmlDoc.createElement('link-entity');
            linkEntityElement.setAttribute('name',targetType);
            linkEntityElement.setAttribute('to',source);
            linkEntityElement.setAttribute('from',targetMetadata.PrimaryIdAttribute);
            linkEntityElement.setAttribute('link-type','outer');
            linkEntityElement.setAttribute('alias',alias);

            const relatedAttributeElement = this._xmlDoc.createElement('attribute');
            relatedAttributeElement.setAttribute('name',destination);
            linkEntityElement.appendChild(relatedAttributeElement);
            entityElement?.appendChild(linkEntityElement);
            
        }
    }
    private getAllElementsFromXPathResult(result:XPathResult){
        const array = [];
        let val:HTMLElement = result.iterateNext() as HTMLElement;
        do{
            if(val){
                array.push(val);
            }
            val = result.iterateNext() as HTMLElement;
        }while(val);
        return array;
    }
    private _createfetchXmlAttribute(attribute:string):HTMLElement{
        const attributeElement = this._xmlDoc.createElement('attribute');
        attributeElement.setAttribute('name',attribute);
        return attributeElement;
    }
}