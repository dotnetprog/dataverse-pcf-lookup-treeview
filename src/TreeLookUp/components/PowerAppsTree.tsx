import { Text, CounterBadge, FlatTree, FlatTreeItem, makeStyles, TreeCheckedChangeData, TreeCheckedChangeEvent, TreeItemLayout, TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent, useHeadlessFlatTree_unstable } from "@fluentui/react-components";
import * as React from "react";
import { PowerAppsTreeItem } from "../services/PowerAppsTreeItemService";
import { RecordTag } from "./RecordTag";
import { usePowerAppsContextContext } from "./PowerAppsContextProvider";
import { DatabaseSearch20Regular }  from "@fluentui/react-icons";

const useStyles = makeStyles(
    {
        container: {
            "> div > span ": { display:"none" },
          "> div > span > input": { pointerEvents: "none",display:"none" },
        },
        nodataContainer:{
            lineHeight:'200px',
            textAlign:'center',
            '> span':{
                display:'inline-block'
            }
        }
    }
)
export type PowerAppsTreeProps ={
    onSelectChange(value?:ComponentFramework.LookupValue): void;
    groupedRecords:PowerAppsTreeItem[];
    openItems:Iterable<TreeItemValue>;
    onOpenChange(openItems:Set<TreeItemValue>):void
    entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata;
};
export const PowerAppsTree:React.FC<PowerAppsTreeProps> = (props) => {
    const styles = useStyles();
    const powerAppsService = usePowerAppsContextContext();
    const onOpenChange = (event: TreeOpenChangeEvent, data: TreeOpenChangeData)=>{
            props.onOpenChange(data.openItems);
    }
    const onSelectChange = (event: TreeCheckedChangeEvent, data: TreeCheckedChangeData)=>{
            const sitems = Array.from(data.checkedItems);
            if(sitems.length === 0){
                props.onSelectChange();
                return;
            }
           const grValue =  props.groupedRecords.find(item => item.value === sitems[0][0])!
           props.onSelectChange(grValue?.lookup);
    }
    const flatTree = useHeadlessFlatTree_unstable(props.groupedRecords, {
        selectionMode: 'single',
        onCheckedChange:onSelectChange,
        onOpenChange:onOpenChange,
        openItems:props.openItems
      });
    return ( props.groupedRecords.length > 0 ?<FlatTree {...flatTree.getTreeProps()} aria-label="Selection">
                 {Array.from(flatTree.items(), (flatTreeItem) => {
                    const {description,lookup ,content,count, ...treeItemProps } = flatTreeItem.getTreeItemProps();
                    
                    return (
                    <FlatTreeItem className={ flatTreeItem.itemType === 'branch'? styles.container : undefined} {...treeItemProps} key={flatTreeItem.value}>
                        {flatTreeItem.itemType === 'branch' ? 
                        <TreeItemLayout aside={<CounterBadge appearance="filled" size="medium">{count}</CounterBadge>}>{content}</TreeItemLayout>:
                        <TreeItemLayout><RecordTag entityMetadata={props.entityMetadata}  onTagClick={powerAppsService.openRecord.bind(powerAppsService)} text={content} recordLookup={lookup!} description={description} /></TreeItemLayout>
                        }
                        
                    </FlatTreeItem>
                    );
                })}
                </FlatTree> : <div className={styles.nodataContainer}><Text>{powerAppsService.controlLabels.noRecordFound}</Text></div>)
}