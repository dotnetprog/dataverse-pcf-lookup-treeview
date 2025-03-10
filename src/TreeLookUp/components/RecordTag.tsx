import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary } from "@fluentui/react-components"
import * as React from "react"
import { EntityIcon } from "./EntityIcon";





export type RecordTagProps = {
    description?:string,
    text?:string,
    style?:React.CSSProperties
    isUnderline?:boolean,
    entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,
    recordLookup:ComponentFramework.LookupValue,
    onTagClick:(value:ComponentFramework.LookupValue) => void
    onClear?:(value:ComponentFramework.LookupValue) => void;
}
export const RecordTag:React.FC<RecordTagProps> = ({recordLookup,onClear,entityMetadata,...props})=> {
    const onClick = React.useCallback(() => {
        props.onTagClick(recordLookup);
    },[recordLookup]);
    const onClearCallback = React.useCallback(() => {
      if(onClear){
        onClear!(recordLookup);
      }
     
    },[recordLookup,onClear]);
    if(!entityMetadata){
      return (<></>);
    }
    return (<InteractionTag style={props.style} appearance="brand" size={props.description ? "medium" : 'small'}>
        <InteractionTagPrimary 
          icon={<EntityIcon entityMetadata={entityMetadata!} />}
          onClick={onClick}
          style={ props.isUnderline ? { textDecoration:'underline'} : undefined}
          secondaryText={props.description}>
          {props.text ?? recordLookup.name}
        </InteractionTagPrimary>
        {onClear && <InteractionTagSecondary onClick={onClearCallback} aria-label="remove" /> }
      </InteractionTag>)
} 