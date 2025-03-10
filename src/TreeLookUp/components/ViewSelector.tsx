import * as React from "react";
import {
    makeStyles,
    Select,
    SelectOnChangeData,
    shorthands,
    tokens,
    useId,
  } from "@fluentui/react-components";
import { LookupView } from "../hooks";





const useStyles = makeStyles({
   
  
    field: {
      display: "grid",
      gridRowGap: tokens.spacingVerticalXXS,
      marginTop: tokens.spacingVerticalMNudge,
      padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalMNudge}`,

      '> span > select':{
        fontWeight:'600',
        ...shorthands.borderStyle("none")
      },
      '> span > span:after':{
        display:'none'
      }
    }
  });

type IViewSelectorProps = {
    entityName:string;
    onViewChange:(view:LookupView)=>void;
    views:LookupView[],
    disabled:boolean,
    defaultText:string
};

const ViewSelector:React.FC<IViewSelectorProps> =  (props)  => {
    const styles = useStyles();
    const selectId = useId();
    const defaultview = props.views.find((v) => v.isDefault);
    
    const onChange = (e:React.ChangeEvent<HTMLSelectElement>,data: SelectOnChangeData) => {
        const sv = props.views.find(v => v.viewId === data.value);
        props.onViewChange(sv!);
    };
    return(<div className={styles.field}>
        <Select defaultValue={defaultview?.viewId} disabled={props.disabled} onChange={onChange} id={`${selectId}-underline`} appearance="outline">
          {props.views.map((v) => (<option key={v.viewId} value={v.viewId}>{v.viewName} {v.isDefault && `(${props.defaultText})`}</option>) )}
        </Select>
      </div>)
};
export default React.memo(ViewSelector);