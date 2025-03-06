import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary } from "@fluentui/react-components";
import * as React from "react";
import { useState } from "react";
import { SearchButton } from "./SearchButton";
import { FluentProvider, webLightTheme,webDarkTheme } from '@fluentui/react-components';
import { useEntityMetadata, useXrm, useXrmControlSettings } from "../hooks/xrm.hooks";
import FieldSecured  from "./FieldSecured";
import { RecordTag } from "./RecordTag";

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
    const [recordReference,setRecordReference] = useState(props.currentrecord);
    const lookUpSettings = useXrmControlSettings();
    const [entityMetadata] = useEntityMetadata(props.entityName);
    if(recordReference?.id !== props.currentrecord?.id){
        setRecordReference(props.currentrecord);
    }
    const openSelectedRecord = (v:ComponentFramework.LookupValue) => {
        console.log('open selected record called.');
        xrmContext.navigation.openForm({
            entityName:v?.entityType!,
            entityId: v?.id!,
            openInNewWindow:false
        });
    };
    const clearRecord = () => {
        setRecordReference(null);
        props.onValueChange(null);
    };
    const onRecordSelected =(lv:ComponentFramework.LookupValue) => {
        setRecordReference(lv);
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
        {lookUpSettings.isReadable ? <div style={cstyle}>
            
            {recordReference?.id !== undefined && recordReference?.id !== null && entityMetadata &&
            <RecordTag entityMetadata={entityMetadata!} style={{width:'100%',marginTop:'5px'}} isUnderline={true} onTagClick={openSelectedRecord} recordLookup={recordReference} onClear={!lookUpSettings.isReadOnly && lookUpSettings.isEditable ? clearRecord : undefined }   />
           }
            {recordReference?.id == undefined && <div style={{width:'100%'}}> ---</div>}
            <SearchButton disabled={lookUpSettings.isReadOnly || !lookUpSettings.isEditable} style={bstyle} onSelectedValue={onRecordSelected} selectedRecord={recordReference} />
        </div> : <FieldSecured tag="input-secured" />}
       
    </FluentProvider>
    )
      
};  

/* <InteractionTag style={{width:'100%'}} value={recordReference?.id} key={recordReference?.id} appearance="brand">
                <InteractionTagPrimary style={{textDecoration:'underline'}} onClick={openSelectedRecord}>{recordReference?.name}</InteractionTagPrimary>    
                {!lookUpSettings.isReadOnly && lookUpSettings.isEditable && <InteractionTagSecondary onClick={clearRecord} aria-label="remove" />}
            </InteractionTag>*/