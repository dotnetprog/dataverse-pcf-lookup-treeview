import * as React from "react";
import {
    makeStyles,
    mergeClasses,
    Select,
    SelectOnChangeData,
    shorthands,
    tokens,
    useId,
  } from "@fluentui/react-components";
import { LookupView } from "../hooks/xrm.hooks";




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

export type IViewSelectorProps = {
    entityName:string;
    onViewChange:(view:LookupView)=>void;
    views:LookupView[]
};

export const ViewSelector:React.FC<IViewSelectorProps> = (props)  => {
    const styles = useStyles();
    const selectId = useId();
    
    const onChange = (e:React.ChangeEvent<HTMLSelectElement>,data: SelectOnChangeData) => {
        const sv = props.views.find(v => v.viewId === data.value);
        props.onViewChange(sv!);
    };
    return(<div className={styles.field}>
        <Select onChange={onChange} id={`${selectId}-underline`} appearance="outline">
          {props.views.map((v) => <option value={v.viewId}>{v.viewName} {v.isDefault && "(Default)"}</option> )}
        </Select>
      </div>)
}