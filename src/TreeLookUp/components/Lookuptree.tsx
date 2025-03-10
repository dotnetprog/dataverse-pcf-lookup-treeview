import * as React from "react";
import { useState } from "react";
import { SearchButton } from "./SearchButton";
import FieldSecured  from "./FieldSecured";
import { RecordTag } from "./RecordTag";
import { usePowerAppsContextContext } from "./PowerAppsContextProvider";
import { useEntityMetadata } from "../hooks";

const containerStyles:React.CSSProperties = {
    width:'100%',
    display:'flex',
    backgroundColor:'rgb(245, 245, 245)',
    height:'32px'
 };
 const btnStyles:React.CSSProperties = {
    marginRight:'4px'
 };
export const Lookuptree = ():JSX.Element => {
    const powerAppsService = usePowerAppsContextContext();
    const [recordReference,setRecordReference] = useState(powerAppsService.selectedValue);
    const [entityMetadata] = useEntityMetadata(powerAppsService.mainLookupEntityName);
    if(recordReference?.id !== powerAppsService.selectedValue?.id){
        setRecordReference(powerAppsService.selectedValue);
    }
 
    const clearRecord = React.useCallback(() => {
        setRecordReference(undefined);
        powerAppsService.onChange(undefined);
    },[powerAppsService.onChange]);
    const onRecordSelected =(lv:ComponentFramework.LookupValue) => {
        setRecordReference(lv);
        powerAppsService.onChange(lv);
    }
    const cstyle = {...containerStyles};
    const bstyle = {...btnStyles};
    if(recordReference?.id === undefined){
        cstyle.paddingInlineStart = '10px';
        bstyle.marginRight = '14px';
    }

    return (
        !powerAppsService.isMasked ? <div style={cstyle}>
            
            {recordReference?.id !== undefined && recordReference?.id !== null && entityMetadata &&
            <RecordTag entityMetadata={entityMetadata!} style={{width:'100%',marginTop:'5px'}} isUnderline={true} onTagClick={powerAppsService.openRecord.bind(powerAppsService)} recordLookup={recordReference} onClear={!powerAppsService.isReadOnly ? clearRecord : undefined }   />
           }
            {recordReference?.id == undefined && <div style={{width:'100%'}}> ---</div>}
            <SearchButton entityType={powerAppsService.mainLookupEntityName} disabled={powerAppsService.isReadOnly} style={bstyle} onSelectedValue={onRecordSelected} selectedRecord={recordReference} />
        </div> : <FieldSecured tag="input-secured" />
    )
      
};  
