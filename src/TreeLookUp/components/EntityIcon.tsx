import * as React from "react"
import { PuzzlePiece16Regular } from '@fluentui/react-icons';
import { makeStyles } from "@fluentui/react-components";
export type EntityIconProps = {
    entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,
}
const useStyles = makeStyles({
    img: {
        width:'16px',
        height:'16px'
    },
   
    // Inverted Spinners are meant as overlays (e.g., over an image or similar)
    // so give it a solid, dark background so it is visible in all themes.
  });
export const EntityIcon:React.FC<EntityIconProps> = (props) => {
    
    if(props.entityMetadata.IsCustomEntity && !props.entityMetadata.IconVectorName){
        return (<PuzzlePiece16Regular />)
    }
    const style = useStyles();
    const entityUrl = props.entityMetadata.IsCustomEntity ? `/WebResources/${props.entityMetadata.IconVectorName}` :`/_imgs/svg_${props.entityMetadata.ObjectTypeCode}.svg`;

    return (<span>
        <img className={style.img} src={entityUrl} />
    </span>)
}
