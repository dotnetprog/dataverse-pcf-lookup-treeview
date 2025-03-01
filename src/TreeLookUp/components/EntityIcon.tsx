import * as React from "react"

export type EntityIconProps = {
    entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,
}

export const EntityIcon:React.FC<EntityIconProps> = (props) => {
    const entityUrl = props.entityMetadata.IsCustomEntity ? `/_Common/icon.aspx?cache=1&iconType=VectorIcon&objectTypeCode=${props.entityMetadata.ObjectTypeCode}` :`/_imgs/svg_${props.entityMetadata.ObjectTypeCode}.svg`;

    return (<span>
        <img src={entityUrl} />
    </span>)
}
