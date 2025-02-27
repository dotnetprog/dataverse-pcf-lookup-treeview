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
import { AddSquare16Regular, FluentIconsProps, SearchRegular, SubtractSquare16Regular } from "@fluentui/react-icons";
import { LookupView, useEntityMetadata, useLookupViews, useRecordService, useXrm, useXrmControlSettings } from "../hooks/xrm.hooks";
import { groupBy } from "../utility";
import { ViewSelector } from "./ViewSelector";
import { SearchTextBox } from "./SearchTextBox";
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
type CustomTreeItem = HeadlessFlatTreeItemProps & { content: string,count:number };
class GroupedEntity implements ComponentFramework.WebApi.Entity{
    childEntities:ComponentFramework.WebApi.Entity[];
    name:string;
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
const noValue = "(no value)"
const MapToCustomTreeItem = (obj:any,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata,parentValue?:any):CustomTreeItem[] => {
    let beautifyData:CustomTreeItem[] = [];

    obj.forEach((value:any,key:any,m:any) => {
        let klabel = !key ? noValue : key;
        let d:CustomTreeItem = {
            content:klabel,
            value:klabel,
            parentValue:parentValue,
            count:0,
        }; 
        beautifyData.push(d);
        if(value.length){
            d.count = value.length;
            value.forEach((v:any) => {
                beautifyData.push({
                    value:v[entityMetadata.PrimaryIdAttribute],
                    parentValue:klabel,
                    content:v[entityMetadata.PrimaryNameAttribute],
                    count:0
                });
            });
        }else{
            const childrows = MapToCustomTreeItem(value,entityMetadata,klabel);
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
    const [views,isViewLoading] = useLookupViews(etn);
    const entityMetadata = useEntityMetadata(etn,controlSettings.groupby);
    const recordService = React.useMemo(() => useRecordService(50),[]);
    const styles = useStyles();
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
    const flatTree = useHeadlessFlatTree_unstable(groupedRecords, {
        selectionMode: 'single',
        onCheckedChange:onSelectChange
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
        const data = await recordService.getRecordsByView(entityMetadata!.LogicalName ,entityMetadata!.PrimaryNameAttribute, currentView!.viewId,controlSettings.groupby,filterText);
        // convert the data to json
        const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...controlSettings.groupby.map((s) => getFormattedField(s,entityMetadata!))) as any;    
        // set state with the result
        setGroupedRecords(MapToCustomTreeItem(groupedData,entityMetadata!));
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
        if(!data.open){
            return;
        }
    }
    const openSelectedRecord = () => {
        console.log('open selected record called.');
        xrmContext.navigation.openForm({
            entityName:selectedRecord?.entityType!,
            entityId: selectedRecord?.id!,
            openInNewWindow:false
        });
    };
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
            <ViewSelector views={views} entityName={etn} onViewChange={setCurrentView}/>
            <SearchTextBox onChangeText={onFilterTextChange} />
        </div>
        
        {isLoading ? 
         <Spinner appearance="primary" label="Loading data..." /> : 
         <FlatTree {...flatTree.getTreeProps()} aria-label="Selection">
             {Array.from(flatTree.items(), (flatTreeItem) => {
                const { content,count, ...treeItemProps } = flatTreeItem.getTreeItemProps();
                
                return (
                <FlatTreeItem className={ flatTreeItem.itemType === 'branch'? styles.container : undefined} {...treeItemProps} key={flatTreeItem.value}>
                    <TreeItemLayout aside={flatTreeItem.itemType === 'branch' ? <CounterBadge appearance="filled" size="medium">{count}</CounterBadge> : undefined}>{content}</TreeItemLayout>
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