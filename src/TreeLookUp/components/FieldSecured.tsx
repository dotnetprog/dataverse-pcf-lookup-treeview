import { Input, makeStyles, shorthands, useId } from "@fluentui/react-components";
import * as React from "react";


const useStyles = makeStyles({ 
    container: {
        width:'100%',
        backgroundColor:'rgb(245, 245, 245)',
        height:'32px',
        "> span": { ...shorthands.borderStyle("none"),width:'100%' },
    }
});
type FieldSecuredProps = {
    tag:string
};

const FieldSecured:React.FC<FieldSecuredProps> = ({tag})=>{
    const style = useStyles();
    const passwordId = useId(tag);
    return (<div className={style.container}><Input style={{width:'100%'}} disabled={true} appearance="filled-darker" type="password" defaultValue="password" id={passwordId} /></div>)
};
export default React.memo(FieldSecured);
