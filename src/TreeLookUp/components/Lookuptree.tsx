import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary } from "@fluentui/react-components";
import * as React from "react";
import { useState } from "react";
import { SearchButton } from "./SearchButton";

export interface ILookuptreeProps {
    entityName:string,
    currentrecord:ComponentFramework.LookupValue | null,
    defaultview:string,
    views?:string[],
    preSearch?:string;
    onValueChange(value:ComponentFramework.LookupValue | null):void;
}
const defaultValue = {
    id:undefined,
    entityType:undefined,
    name:undefined
}
export const Lookuptree:React.FC<ILookuptreeProps> = (props:ILookuptreeProps) => {
    const [recordReference,setRecordReference] = useState({id:props.currentrecord?.id,name:props.currentrecord?.name,entityType:props.currentrecord?.entityType});
    if(recordReference.id !== props.currentrecord?.id){
        setRecordReference({id:props.currentrecord?.id,name:props.currentrecord?.name,entityType:props.currentrecord?.entityType});
    }
    const openSelectedRecord = () => {
        console.log('open selected record called.');
    };
    const clearRecord = () => {
        setRecordReference(defaultValue);
        props.onValueChange(null);
    };
    const selectLookUpValue = () => {
        console.log('record selection called.');
    };
    
    return (
    <div>
        {recordReference?.id !== undefined &&
        <InteractionTag value={recordReference?.id} key={recordReference?.id} appearance="brand">
            <InteractionTagPrimary onClick={openSelectedRecord}>{recordReference?.name}</InteractionTagPrimary>    
            <InteractionTagSecondary onClick={clearRecord} aria-label="remove" />
        </InteractionTag>}
        {recordReference?.id == undefined && "---"
        }
        <SearchButton onClick={selectLookUpValue} />
    </div>
    )
      
};  