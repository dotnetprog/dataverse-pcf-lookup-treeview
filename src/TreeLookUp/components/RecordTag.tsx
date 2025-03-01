import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary, Slot } from "@fluentui/react-components"
import * as React from "react"





export type RecordTagProps = {
    iconUrl?:string,
    description?:string,
    text:string,
    icon?: Slot<'span'>;
    recordLookup:ComponentFramework.LookupValue,
    onTagClick:(value:ComponentFramework.LookupValue) => void
}
export const RecordTag:React.FC<RecordTagProps> = ({recordLookup,...props})=> {
    const onClick = React.useCallback(() => {
        props.onTagClick(recordLookup);
    },[recordLookup]);

    return (<InteractionTag appearance="brand">
        <InteractionTagPrimary 
          icon={props.icon}
          onClick={onClick}
          secondaryText={props.description}>
          {props.text}
        </InteractionTagPrimary>
      </InteractionTag>)
} 