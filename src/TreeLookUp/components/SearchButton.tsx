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
     TreeCheckedChangeEvent,
     Tag,
     InteractionTag,
     InteractionTagPrimary,
     InteractionTagSecondary,
     Field,
     Divider,
     Badge,
     CounterBadge,} from "@fluentui/react-components";
import * as React from "react"; 
import {useEffect} from "react"; 
import { AddSquare16Regular, AddSquareRegular, FluentIconsProps, SearchRegular, SubtractSquare16Regular, SubtractSquareRegular } from "@fluentui/react-icons";
import { LookupView, useEntityMetadata, useLookupViews, useMetadataService, useRecordService, useViewService, useXrm, useXrmControlSettings } from "../hooks/xrm.hooks";
import { groupBy } from "../utility";
import ViewSelector  from "./ViewSelector";
import { SearchTextBox } from "./SearchTextBox";
import { RecordTag } from "./RecordTag";
import { EntityIcon } from "./EntityIcon";
import { FetchXmlQuery, LinkEntity } from "../common/fetchXmlQuery";
import { IEntityMetadataService } from "../services/entityMetadataService";
const useStyles = makeStyles({
    container: {
        "> div > span ": { display:"none" },
      "> div > span > input": { pointerEvents: "none",display:"none" },
    },
    dialogContainer:{
        height:'94%',
        width:'100%',
        maxWidth:'1000px'
        
    },
    dialogBody:{
        display:'relative',
        height:'100%'
    },
    dialogSeparator:{
        display:'absolute',
        bottom:0,
        width:'99%'
    },
    field:{
        "> label": { fontWeight:"700" },
        
    },
    treeBar: {
        columnGap: "15px",
        display: "flex",
      },
    advancedSectionContainer:{
        display:'flex',
        flexFlowflow:{
            flexDirection:'row',
            flexWrap:'nowrap'
        },
        width:'auto',
        height:'auto',
        boxSizing: 'border-box',
        justifyContent: 'space-between'
    }
    // Inverted Spinners are meant as overlays (e.g., over an image or similar)
    // so give it a solid, dark background so it is visible in all themes.
  });
const IconProps: FluentIconsProps = {
    transform:'scale (-1, 1)'
};
type CustomTreeItem = HeadlessFlatTreeItemProps & { description?:string,content: string,count:number,lookup?:ComponentFramework.LookupValue };
class GroupedEntity implements ComponentFramework.WebApi.Entity{
    childEntities:ComponentFramework.WebApi.Entity[];
    name:string;
}
const getFormattedSuffix =(property:string,amd:any)=>{
    switch(amd.AttributeType){
        case 0:
        case 2:
        case 8:
        case 9:
        case 11:
        case 13:
            return `${property}@OData.Community.Display.V1.FormattedValue`;
        case 6:
        case 1:
            return `_${property}_value@OData.Community.Display.V1.FormattedValue`
        default:
            return property;
    }
}
const getRelatedFormattedField =(field:string,linkEntity:LinkEntity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {
    const [property,relatedproperty] = field.split('.');
    const amd = entityMetadata.Attributes.getByName(field);
    let formattedSuffix = getFormattedSuffix(relatedproperty,amd);
    return `${linkEntity.alias}.${formattedSuffix}`;
    
}
const getFormattedField = (field:string,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) => {
    const amd = entityMetadata.Attributes.getByName(field);
    return getFormattedSuffix(field,amd);
}
const noValue = "(none)";
const getDescriptionForRecord = (record:ComponentFramework.WebApi.Entity,fields:string[]) => {
    if(fields.length === 0){
        return undefined;
    }
    const description = fields.map(f => record[f]).filter(v => v !== undefined && v !== null).join(' - ');
    return description === "" ? undefined: description;
}
const distinctStringArray = (values:string[]) => {
    return Array.from(new Set(values));
}
const MapToCustomTreeItem = (obj:any,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,viewFields:string[],parentValue?:any):CustomTreeItem[] => {
    let beautifyData:CustomTreeItem[] = [];

    obj.forEach((value:any,key:any,m:any) => {
        let klabel = !key ? noValue : key;
        let d:CustomTreeItem = {
            content:klabel,
            value:parentValue ?parentValue+ klabel: klabel,
            parentValue:parentValue,
            count:0,
            itemType:"branch"
        }; 
        beautifyData.push(d);
        if(value.length){
            d.count = value.length;
            value.forEach((v:any) => {
                beautifyData.push({
                    itemType:"leaf",
                    value:v[entityMetadata.PrimaryIdAttribute],
                    parentValue:d.value,
                    content:v[entityMetadata.PrimaryNameAttribute],
                    count:0,
                    lookup:{ entityType:entityMetadata.LogicalName,id:v[entityMetadata.PrimaryIdAttribute],name: v[entityMetadata.PrimaryNameAttribute]},
                    description:getDescriptionForRecord(v,viewFields)
                });
            });
        }else{
            const childrows = MapToCustomTreeItem(value,entityMetadata,viewFields,d.value);
            beautifyData = beautifyData.concat(childrows);
        }
    });
   
    return beautifyData;
}
export type SearchButtonProps = ButtonProps &
{ 
    selectedRecord:ComponentFramework.LookupValue | null;
    onSelectedValue(value:ComponentFramework.LookupValue): void;
}
export const SearchButton:React.FC<SearchButtonProps> = ({ onSelectedValue,selectedRecord,...btnprops}) => {
    const xrmContext = useXrm();
    const controlSettings = useXrmControlSettings();
    const etn = xrmContext!.parameters.MainLookUp.getTargetEntityType();
    const styles = useStyles();
    const [views,isViewLoading] = useLookupViews(etn);
    const [entityMetadata] = useEntityMetadata(etn,controlSettings.groupby);
    const recordService = React.useMemo(() => useRecordService(),[]);
    const viewService = React.useMemo(() => useViewService(),[]);
    const metadataService = React.useMemo(() => useMetadataService(),[]);
    const [openItems,setOpenItems] = React.useState<Iterable<TreeItemValue>>([]);
    const [filterText,setFilterText] = React.useState("");
    const [currentView,setCurrentView] = React.useState<LookupView | null>(null)
    const [isOpened,setIsOpened] = React.useState(false);
    const [groupedRecords,setGroupedRecords] = React.useState<CustomTreeItem[]>([]);
    const [disableSelectBtn,setDisableSelectBtn] = React.useState(true);
    const [isLoading,setIsLoading] = React.useState(true);
    const onSelectChange = (event: TreeCheckedChangeEvent, data: TreeCheckedChangeData)=>{
        const sitems = Array.from(data.checkedItems).map(v=>v);
        setDisableSelectBtn(sitems.length === 0);
    }
    const onOpenChange = (event: TreeOpenChangeEvent, data: TreeOpenChangeData)=>{
        setOpenItems(data.openItems);
    }
    const flatTree = useHeadlessFlatTree_unstable(groupedRecords, {
        selectionMode: 'single',
        onCheckedChange:onSelectChange,
        onOpenChange:onOpenChange,
        openItems:openItems
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
    
    
    const fetchData = async () => {
        if (!currentView || !isOpened) {
            return;
        }
        console.log('fetching data for tree view.');
        setIsLoading(true);
        
        // get the data from the api
        const viewFetchXml = await viewService.getFetchXmlFromViewId(currentView!.viewId);
        const fetchQuery = new FetchXmlQuery(metadataService);
        fetchQuery.LoadFrom(viewFetchXml);
        await fetchQuery.addAttributes(...controlSettings.groupby);
        fetchQuery.addFilterSearch(entityMetadata!.PrimaryNameAttribute,filterText);
        const data = await recordService.getRecordsByFetchXml(entityMetadata!.LogicalName,fetchQuery.toString());
        const reservedFields:string[] = [...controlSettings.groupby,entityMetadata!.PrimaryNameAttribute,entityMetadata!.PrimaryIdAttribute];
        let viewFields = fetchQuery.getTopLevelAttributes().filter(f => !reservedFields.includes(f));//exclude columns that is already used in the component.
        if(viewFields.length > 2) {//take only the first two
            viewFields = viewFields.slice(0,2);
        }
        const relatedLookupColums = distinctStringArray(controlSettings.groupby.filter(c => c.includes('.')));
        const relatedFormattedColumns:string[] = []
        for(const relatedColumn of relatedLookupColums){
            const [sourceField,property,type] = relatedColumn.split('.');
            const linkEntity = fetchQuery.getLinkEntity(sourceField);  
            const linkEntityMetadata = await metadataService.getEntityMetadata(linkEntity.entityType,false,linkEntity.columns); 
            relatedFormattedColumns.push(getRelatedFormattedField(property,linkEntity,linkEntityMetadata));
        }
        const nonRelatedFormattedFields = controlSettings.groupby.filter(s => !s.includes('.')).map((s) =>{
            return getFormattedField(s,entityMetadata!);
        })
        const formattedFields =nonRelatedFormattedFields.concat(relatedFormattedColumns);
        const emd = await xrmContext.utils.getEntityMetadata(etn,[...controlSettings.groupby,...viewFields]);
        // convert the data to json
        const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...formattedFields); 
        // set state with the result
        const treeItems = MapToCustomTreeItem(groupedData,entityMetadata!,viewFields.map(f => getFormattedField(f,emd)));
        setGroupedRecords(treeItems);
        setOpenItems(treeItems.filter(t => t.itemType === "branch").map(t=> t.value));//Always open all branches by default
        setIsLoading(false);
      };
    useEffect(() => {
       
        fetchData();
    },[currentView,isOpened,filterText])
    useEffect(() => {
        if(isViewLoading || views.length === 0){
            return;
        }
        const defaultview = views.find((v) => v.isDefault)!;
        setCurrentView(defaultview);
    },[isViewLoading])
    const onDialogOpenChange = (event: DialogOpenChangeEvent, data: DialogOpenChangeData) =>{
        setIsOpened(data.open);
    }
    const collapseAll = React.useCallback(() => {
        setOpenItems([]);
    },[]);
    const expandAll = () => {
        console.log('expandAll');
        const items = groupedRecords.filter(gr => gr.itemType === 'branch').map(gr => gr.value);
        setOpenItems(items);
    };
    const openSelectedRecord = () => {
        console.log('open selected record called.');
        xrmContext.navigation.openForm({
            entityName:selectedRecord?.entityType!,
            entityId: selectedRecord?.id!,
            openInNewWindow:false
        });
    };
    const openRecord = React.useCallback((record:ComponentFramework.LookupValue) => {
        console.log('open record');
        xrmContext.navigation.openForm({
            entityName:record.entityType,
            entityId: record.id,
            openInNewWindow:false
        });
    },[]);
    const onFilterTextChange = (filter:string) => {
        console.log('filter text: '+filter);
        setFilterText(filter);
    }
    return (
        <Dialog onOpenChange={onDialogOpenChange}>
            <DialogTrigger disableButtonEnhancement>
            <Button
        appearance="transparent"
        {...btnprops}
        icon={<SearchRegular {...IconProps} />}
        size="small" />
            </DialogTrigger>
        <DialogSurface className={styles.dialogContainer}>
        <DialogBody className={styles.dialogBody}>
        <DialogTitle>Select a record</DialogTitle>
        <DialogContent style={{height:'100%',position:'relative'}} >
        <div className={styles.advancedSectionContainer}>
            <ViewSelector disabled={!controlSettings.isViewPickerEnabled} views={views} entityName={etn} onViewChange={setCurrentView}/>
            
            <SearchTextBox onChangeText={onFilterTextChange} />
        </div>
        <div className={styles.treeBar}>
            <Button appearance="subtle" onClick={expandAll} icon={ <AddSquareRegular />}>
                Expand All
            </Button>
            <Button appearance="subtle" onClick={collapseAll} icon={ <SubtractSquareRegular />}>
                Collapse All
            </Button>
        </div>
        {isLoading ? 
         <Spinner appearance="primary" label="Loading data..." /> : 
         <FlatTree {...flatTree.getTreeProps()} aria-label="Selection">
             {Array.from(flatTree.items(), (flatTreeItem) => {
                const {description,lookup ,content,count, ...treeItemProps } = flatTreeItem.getTreeItemProps();
                
                return (
                <FlatTreeItem className={ flatTreeItem.itemType === 'branch'? styles.container : undefined} {...treeItemProps} key={flatTreeItem.value}>
                    {flatTreeItem.itemType === 'branch' ? 
                    <TreeItemLayout aside={<CounterBadge appearance="filled" size="medium">{count}</CounterBadge>}>{content}</TreeItemLayout>:
                    <TreeItemLayout><RecordTag icon={<EntityIcon entityMetadata={entityMetadata!} />} onTagClick={openRecord} text={content} recordLookup={lookup!} description={description} /></TreeItemLayout>
                    }
                    
                </FlatTreeItem>
                );
            })}
            </FlatTree> 
            }
            <Divider style={{width:'99%',position:'absolute',bottom:0}}  />
       
        </DialogContent>
        <DialogActions style={{gridColumn:'1/-1',justifySelf:'normal'} } fluid={true}>
        <Field style={{width:'100%',display:'block'}} className={styles.field} orientation="horizontal"
                label="Current selected record">{selectedRecord !== undefined && selectedRecord !== null &&
                <InteractionTag value={selectedRecord.id} key={selectedRecord?.id} appearance="brand">
                                <InteractionTagPrimary style={{textDecoration:'underline'}} onClick={openSelectedRecord}>{selectedRecord?.name}</InteractionTagPrimary>    

                            </InteractionTag>
             }</Field>
            <DialogTrigger>
                <Button disabled={disableSelectBtn} onClick={onSelectClick} appearance="primary">Select</Button>
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