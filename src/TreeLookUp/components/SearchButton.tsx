import { Button, ButtonProps, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Tree, TreeItem, TreeItemLayout, TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent } from "@fluentui/react-components";
import * as React from "react"; 
import {useEffect} from "react"; 
import { AddSquare16Regular, FluentIconsProps, SearchRegular, SubtractSquare16Regular } from "@fluentui/react-icons";
import { useEntityMetadata, useRecordService, useXrm, useXrmControlSettings } from "../hooks/xrm.hooks";
import { groupBy } from "../utility";

const IconProps: FluentIconsProps = {
    transform:'scale (-1, 1)'
};
class GroupedEntity implements ComponentFramework.WebApi.Entity{
    childEntities:ComponentFramework.WebApi.Entity[];
    name:string;
}
const TreeLeefMapper = (e:ComponentFramework.WebApi.Entity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {  
    
    return (<TreeItem itemType="leaf" value={e[entityMetadata.PrimaryIdAttribute]}><TreeItemLayout>{e[entityMetadata.PrimaryNameAttribute]}</TreeItemLayout></TreeItem>)
};
const TreeViewMapper = (openItems:TreeItemValue[],gr:GroupedEntity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {
    return (
        <TreeItem itemType="branch" value={gr.name}>
            <TreeItemLayout expandIcon={openItems.includes(gr.name) ? ( <SubtractSquare16Regular /> ) : ( <AddSquare16Regular />)}>
            {gr.name} ({gr.childEntities.length})
            </TreeItemLayout>
            <Tree>
            {gr.childEntities.map(ce => {
            if(!!ce.childEntities){
                return (TreeViewMapper(openItems,ce as GroupedEntity,entityMetadata));
            }else{
                return TreeLeefMapper(ce,entityMetadata);
            }})}
            </Tree>
        </TreeItem>
        );
}
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
const MapToGroupedEntity = (obj:any,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata):GroupedEntity[] => {
    const beautifyData:GroupedEntity[] = [];

    obj.forEach((value:any,key:any,m:any) => {
        let d:GroupedEntity = {
            name:key,
            childEntities: !!value.length ? value : MapToGroupedEntity(value,entityMetadata)
        } 
        beautifyData.push(d);
    });
   
    return beautifyData;
}
export const SearchButton:React.FC<ButtonProps> = (props) => {
    const xrmContext = useXrm();
    const controlSettings = useXrmControlSettings();
    const entityMetadata = useEntityMetadata(xrmContext!.parameters.MainLookUp.getTargetEntityType(),controlSettings.groupby);
    const recordService = useRecordService(50);
    const [groupedRecords,setGroupedRecords] = React.useState<GroupedEntity[]>([]);
    const [openItems, setOpenItems] = React.useState<TreeItemValue[]>([]);
    const handleOpenChange = (
        event: TreeOpenChangeEvent,
        data: TreeOpenChangeData
      ) => {
        setOpenItems((curr) =>
          data.open
            ? [...curr, data.value]
            : curr.filter((value) => value !== data.value)
        );
      };
    useEffect(() =>{
        const fetchData = async () => {
            console.log('fetching data for tree view.')
            // get the data from the api
            const data = await recordService.getRecordsByView(entityMetadata!.LogicalName ,controlSettings.defaultViewId);
            // convert the data to json
            const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...controlSettings.groupby.map((s) => getFormattedField(s,entityMetadata!))) as any;    
            // set state with the result
            setGroupedRecords(MapToGroupedEntity(groupedData,entityMetadata!));
          };
        if(entityMetadata === undefined){
            return;
        }
        fetchData();
    },[entityMetadata]);
    return (
        <Dialog >
            <DialogTrigger disableButtonEnhancement>
            <Button
        {...props}
        appearance="transparent"
        icon={<SearchRegular {...IconProps} />}
        size="small" />
            </DialogTrigger>
        <DialogSurface>
        <DialogBody>
        <DialogTitle>Select a record</DialogTitle>
        <DialogContent>
        <Tree aria-label="Expand Icon" openItems={openItems} onOpenChange={handleOpenChange}>
            {groupedRecords.map((gr) => TreeViewMapper(openItems,gr,entityMetadata!))}
            </Tree>
        </DialogContent>
        <DialogActions>
            <Button appearance="primary">Select</Button>
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