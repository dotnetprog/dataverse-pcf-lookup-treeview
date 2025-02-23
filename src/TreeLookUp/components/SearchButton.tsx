import { Button,
     ButtonProps,
     Dialog, DialogActions,
     DialogBody, 
     DialogContent, 
     DialogSurface, 
     DialogTitle, 
     DialogTrigger, 
     Tree, 
     TreeItem, 
     TreeItemLayout, TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent,makeStyles, Spinner, tokens,  
     DialogOpenChangeEvent,
     DialogOpenChangeData,
     FlatTree,
     FlatTreeItem,
     HeadlessFlatTreeItemProps,
     useHeadlessFlatTree_unstable,
     TreeCheckedChangeData,
     TreeCheckedChangeEvent,} from "@fluentui/react-components";
import * as React from "react"; 
import {useEffect} from "react"; 
import { AddSquare16Regular, FluentIconsProps, SearchRegular, SubtractSquare16Regular } from "@fluentui/react-icons";
import { useEntityMetadata, useRecordService, useXrm, useXrmControlSettings } from "../hooks/xrm.hooks";
import { groupBy } from "../utility";
const useStyles = makeStyles({
    container: {
      "> div > span > input": { pointerEvents: "none" },
    },
  
    // Inverted Spinners are meant as overlays (e.g., over an image or similar)
    // so give it a solid, dark background so it is visible in all themes.
  });
const IconProps: FluentIconsProps = {
    transform:'scale (-1, 1)'
};
type CustomTreeItem = HeadlessFlatTreeItemProps & { content: string };
class GroupedEntity implements ComponentFramework.WebApi.Entity{
    childEntities:ComponentFramework.WebApi.Entity[];
    name:string;
}
/*
const TreeLeefMapper = (e:ComponentFramework.WebApi.Entity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {  
    
    return (<TreeItem itemType="leaf" value={e[entityMetadata.PrimaryIdAttribute]}><TreeItemLayout>{e[entityMetadata.PrimaryNameAttribute]}</TreeItemLayout></TreeItem>)
};
const TreeViewMapper = (openItems:TreeItemValue[],gr:GroupedEntity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {
    return (
        <Tr  itemType="branch"  value={gr.name}>
            <TreeItemLayout expandIcon={openItems.includes(gr.name) ? ( <SubtractSquare16Regular /> ) : ( <AddSquare16Regular />)}>
            {gr.name} ({gr.childEntities.length})
            </TreeItemLayout>
           
        </FlatTreeItem >
        );
}*/
const getFormattedField = (field:string,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {
    const amd = entityMetadata.Attributes.getByName(field);
   
    switch(amd.AttributeType){
        case 0:
        case 2:
        case 6:
        case 8:
        case 9:
        case 11:
        case 13:
            return `${field}@OData.Community.Display.V1.FormattedValue`;
        default:
            return field;
    }
}
const MapToCustomTreeItem = (obj:any,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,parentValue?:any):CustomTreeItem[] => {
    let beautifyData:CustomTreeItem[] = [];

    obj.forEach((value:any,key:any,m:any) => {
        let d:CustomTreeItem = {
            content:key,
            value:key,
            parentValue:parentValue,
            
        }; 
        beautifyData.push(d);
        if(value.length){
            value.forEach((v:any) => {
                beautifyData.push({
                    value:v[entityMetadata.PrimaryIdAttribute],
                    parentValue:key,
                    content:v[entityMetadata.PrimaryNameAttribute]
                });
            });
        }else{
            const childrows = MapToCustomTreeItem(value,entityMetadata,key);
            beautifyData = beautifyData.concat(childrows);
        }
    });
   
    return beautifyData;
}
export type SearchButtonProps = ButtonProps & { onSelectedValue(value:ComponentFramework.LookupValue): void;}
export const SearchButton:React.FC<SearchButtonProps> = (props) => {
    const { onSelectedValue,...btnProps } = props;
    const xrmContext = useXrm();
    const controlSettings = useXrmControlSettings();
    const entityMetadata = useEntityMetadata(xrmContext!.parameters.MainLookUp.getTargetEntityType(),controlSettings.groupby);
    const recordService = useRecordService(50);
    const treeUnselectableStyle = useStyles();
    const [groupedRecords,setGroupedRecords] = React.useState<CustomTreeItem[]>([]);
   
    const flatTree = useHeadlessFlatTree_unstable(groupedRecords, {
        selectionMode: 'single'
      });
    const onSelectClick = () => {
        console.log('Tree slection has changed');
        const items:any = Array.from(flatTree.getTreeProps().checkedItems).map(v=>v);
        const value = items[0][0];
        if(value === undefined){
            return;
        }
        const treeItemFound = groupedRecords.find((gr) => gr.value === value);
        onSelectedValue({
            entityType: xrmContext.parameters.MainLookUp.getTargetEntityType(),
            id:value.toString(),
            name:treeItemFound?.content
        });
        

        
    } 
    const [isLoading,setIsLoading] = React.useState(true);

    const fetchData = async () => {
        console.log('fetching data for tree view.');
        setIsLoading(true);
        // get the data from the api
        const data = await recordService.getRecordsByView(entityMetadata!.LogicalName ,controlSettings.defaultViewId);
        // convert the data to json
        const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...controlSettings.groupby.map((s) => getFormattedField(s,entityMetadata!))) as any;    
        // set state with the result
        setGroupedRecords(MapToCustomTreeItem(groupedData,entityMetadata!));
        setIsLoading(false);
      };
    const onDialogOpenChange = (event: DialogOpenChangeEvent, data: DialogOpenChangeData) =>{
        if(!data.open){
            return;
        }
        fetchData();
    }
   
    return (
        <Dialog onOpenChange={onDialogOpenChange}>
            <DialogTrigger disableButtonEnhancement>
            <Button
        {...btnProps}
        appearance="transparent"
        icon={<SearchRegular {...IconProps} />}
        size="small" />
            </DialogTrigger>
        <DialogSurface>
        <DialogBody>
        <DialogTitle>Select a record</DialogTitle>
        <DialogContent>
        {isLoading ? 
         <Spinner appearance="primary" label="Loading data..." /> : 
         <FlatTree {...flatTree.getTreeProps()} aria-label="Selection">
             {Array.from(flatTree.items(), (flatTreeItem) => {
                const { content, ...treeItemProps } = flatTreeItem.getTreeItemProps();
                
                return (
                <FlatTreeItem className={ flatTreeItem.itemType === 'branch'? treeUnselectableStyle.container : undefined} {...treeItemProps} key={flatTreeItem.value}>
                    <TreeItemLayout>{content}</TreeItemLayout>
                </FlatTreeItem>
                );
            })}
            </FlatTree> 
            }
       
        </DialogContent>
        <DialogActions>
            <DialogTrigger>
                <Button onClick={onSelectClick} appearance="primary">Select</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
        </DialogActions>
        </DialogBody>
    </DialogSurface>
    </Dialog>
       
    );
};
/*

            */