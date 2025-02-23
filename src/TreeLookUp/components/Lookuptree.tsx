import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary } from "@fluentui/react-components";
import * as React from "react";
import { useState } from "react";
import { SearchButton } from "./SearchButton";
import { TreeSelectionDialog } from "./TreeSelectionDialog";
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { XrmContext } from "./XrmContextProvider";
import { useXrm } from "../hooks/xrm.hooks";

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
const containerStyles:React.CSSProperties = {
    width:'100%',
    display:'flex',
    backgroundColor:'rgb(245, 245, 245)',
    height:'32px'
 };
 const btnStyles:React.CSSProperties = {
    marginRight:'4px'
 };
export const Lookuptree:React.FC<ILookuptreeProps> = (props:ILookuptreeProps) => {
    const xrmContext = useXrm();
    const [recordReference,setRecordReference] = useState({id:props.currentrecord?.id,name:props.currentrecord?.name,entityType:props.currentrecord?.entityType});
    if(recordReference.id !== props.currentrecord?.id){
        setRecordReference({id:props.currentrecord?.id,name:props.currentrecord?.name,entityType:props.currentrecord?.entityType});
    }
    const openSelectedRecord = () => {
        console.log('open selected record called.');
        xrmContext.navigation.openForm({
            entityName:recordReference.entityType!,
            entityId: recordReference.id!,
            openInNewWindow:false
        });
    };
    const clearRecord = () => {
        setRecordReference(defaultValue);
        props.onValueChange(null);
    };
    const onRecordSelected =(lv:ComponentFramework.LookupValue) => {
        setRecordReference({id:lv.id,name:lv.name,entityType:lv.entityType});
        props.onValueChange(lv);
    }
    let cstyle = {...containerStyles};
    let bstyle = {...btnStyles};
    if(recordReference?.id === undefined){
        cstyle.paddingInlineStart = '10px';
        bstyle.marginRight = '14px';
    }
    return (
     <FluentProvider style={{width:'100%'}} theme={webLightTheme}>
        <div style={cstyle}>
            {recordReference?.id !== undefined &&
            <InteractionTag style={{width:'100%'}} value={recordReference?.id} key={recordReference?.id} appearance="brand">
                <InteractionTagPrimary style={{textDecoration:'underline'}} onClick={openSelectedRecord}>{recordReference?.name}</InteractionTagPrimary>    
                <InteractionTagSecondary onClick={clearRecord} aria-label="remove" />
            </InteractionTag>}
            {recordReference?.id == undefined && <div style={{width:'100%'}}> ---</div>
            }
            <SearchButton style={bstyle} onSelectedValue={onRecordSelected} />
        </div>
    </FluentProvider>
    
    
    )
      
};  