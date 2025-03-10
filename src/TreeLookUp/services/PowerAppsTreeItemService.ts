import { HeadlessFlatTreeItemProps } from "@fluentui/react-components";

export type PowerAppsTreeItem = HeadlessFlatTreeItemProps & { description?:string,content: string,count:number,lookup?:ComponentFramework.LookupValue };
export class PowerAppsTreeItemService{
    _noValueLabel:string;
    constructor(noValueLabel:string){
        this._noValueLabel = noValueLabel;
    }
     getDescriptionForRecord(record:ComponentFramework.WebApi.Entity,fields:string[]){
            if(fields.length === 0){
                return undefined;
            }
            const description = fields.map(f => record[f]).filter(v => v !== undefined && v !== null).join(' - ');
            return description === "" ? undefined: description;
     }
       MapToCustomTreeItem(obj:any,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,viewFields:string[],parentValue?:any):PowerAppsTreeItem[] {
            let beautifyData:PowerAppsTreeItem[] = [];
        
            obj.forEach((value:any,key:any) => {
                const klabel = !key ? this._noValueLabel : key;
                const d:PowerAppsTreeItem = {
                    content:klabel,
                    value:parentValue ?parentValue+ klabel: klabel,
                    parentValue:parentValue,
                    count:0,
                    itemType:"branch"
                }; 
                beautifyData.push(d);
                if(value.length){
                    d.count = value.length;
                    value.forEach((v:any) => {
                        beautifyData.push({
                            itemType:"leaf",
                            value:v[entityMetadata.PrimaryIdAttribute],
                            parentValue:d.value,
                            content:v[entityMetadata.PrimaryNameAttribute],
                            count:0,
                            lookup:{ entityType:entityMetadata.LogicalName,id:v[entityMetadata.PrimaryIdAttribute],name: v[entityMetadata.PrimaryNameAttribute]},
                            description:this.getDescriptionForRecord(v,viewFields)
                        });
                    });
                }else{
                    const childrows = this.MapToCustomTreeItem(value,entityMetadata,viewFields,d.value);
                    beautifyData = beautifyData.concat(childrows);
                }
            });
           
            return beautifyData;
       }
    }