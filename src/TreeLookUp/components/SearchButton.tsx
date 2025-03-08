import { Button,
     ButtonProps,
     Dialog, DialogActions,
     DialogBody, 
     DialogContent, 
     DialogSurface, 
     DialogTitle, 
     DialogTrigger, 
     TreeItemLayout, TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent,makeStyles, Spinner,  
     DialogOpenChangeEvent,
     DialogOpenChangeData,
     FlatTree,
     FlatTreeItem,
     useHeadlessFlatTree_unstable,
     TreeCheckedChangeData,
     TreeCheckedChangeEvent,
     Field,
     Divider,
     CounterBadge,} from "@fluentui/react-components";
import * as React from "react"; 
import {useEffect} from "react"; 
import { AddSquareRegular, FluentIconsProps, SearchRegular, SubtractSquareRegular } from "@fluentui/react-icons";
import { LookupView, useEntityMetadata, useLookupViews } from "../hooks";
import { groupBy } from "../utility";
import ViewSelector  from "./ViewSelector";
import { SearchTextBox } from "./SearchTextBox";
import { RecordTag } from "./RecordTag";
import { FetchXmlQuery } from "../common/fetchXmlQuery";
import { PowerAppsTreeItem } from "../services/PowerAppsTreeItemService";
import { usePowerAppsContextContext } from "./PowerAppsContextProvider";
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

export type SearchButtonProps = ButtonProps &
{ 
    entityType:string;
    selectedRecord?:ComponentFramework.LookupValue;
    onSelectedValue(value:ComponentFramework.LookupValue): void;
}
export const SearchButton:React.FC<SearchButtonProps> = ({ entityType,onSelectedValue,selectedRecord,...btnprops}) => {
    const powerAppsService = usePowerAppsContextContext();
    const styles = useStyles();
    const [views,isViewLoading] = useLookupViews(entityType);
    const [entityMetadata] = useEntityMetadata(entityType,powerAppsService.GroupedBy);
    const [openItems,setOpenItems] = React.useState<Iterable<TreeItemValue>>([]);
    const [filterText,setFilterText] = React.useState("");
    const [currentView,setCurrentView] = React.useState<LookupView | null>(null)
    const [isOpened,setIsOpened] = React.useState(false);
    const [groupedRecords,setGroupedRecords] = React.useState<PowerAppsTreeItem[]>([]);
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
            entityType: entityType,
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
        const viewFetchXml = await powerAppsService.viewService.getFetchXmlFromViewId(currentView!.viewId);
        const fetchQuery = new FetchXmlQuery(powerAppsService.metadataService);
        fetchQuery.LoadFrom(viewFetchXml);
        await fetchQuery.addAttributes(...powerAppsService.GroupedBy);
        fetchQuery.addFilterSearch(entityMetadata!.PrimaryNameAttribute,filterText);
        fetchQuery.addDependantFilter(entityMetadata!,powerAppsService.filterRelationshipName,powerAppsService.dependentValue);
        const data = await powerAppsService.recordService.getRecordsByFetchXml(entityMetadata!.LogicalName,fetchQuery.toString());
        const reservedFields:string[] = [...powerAppsService.GroupedBy,entityMetadata!.PrimaryNameAttribute,entityMetadata!.PrimaryIdAttribute];
        let viewFields = fetchQuery.getTopLevelAttributes().filter(f => !reservedFields.includes(f));//exclude columns that is already used in the component.
        if(viewFields.length > 2) {//take only the first two
            viewFields = viewFields.slice(0,2);
        }
        powerAppsService.metadataService.clearCache();
        const formattedFields:string[] = [];
        for(const c of powerAppsService.GroupedBy){
            if(c.includes('.')){
                const [sourceField] = c.split('.');
                const linkEntity = fetchQuery.getLinkEntity(sourceField);  
                const linkEntityMetadata = await powerAppsService.metadataService.getEntityMetadata(linkEntity.entityType,false,linkEntity.columns); 
                formattedFields.push(powerAppsService.getRelatedFormattedField(c,linkEntity,linkEntityMetadata));
            }else{
                formattedFields.push(powerAppsService.getFormattedField(c,entityMetadata!));
            }
        }

       
        const emd = await powerAppsService.metadataService.getEntityMetadata(entityType,true,[...powerAppsService.GroupedBy,...viewFields])
        // convert the data to json
        const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...formattedFields); 
        // set state with the result
        const treeItems = powerAppsService.treeItemService.MapToCustomTreeItem(groupedData,entityMetadata!,viewFields.map(f => powerAppsService.getFormattedField(f,emd)));
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
            <ViewSelector disabled={!powerAppsService.isViewPickerEnabled} views={views} entityName={entityType} onViewChange={setCurrentView}/>
            
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
        {isLoading || !entityMetadata ? 
         <Spinner appearance="primary" label="Loading data..." /> : 
         <FlatTree {...flatTree.getTreeProps()} aria-label="Selection">
             {Array.from(flatTree.items(), (flatTreeItem) => {
                const {description,lookup ,content,count, ...treeItemProps } = flatTreeItem.getTreeItemProps();
                
                return (
                <FlatTreeItem className={ flatTreeItem.itemType === 'branch'? styles.container : undefined} {...treeItemProps} key={flatTreeItem.value}>
                    {flatTreeItem.itemType === 'branch' ? 
                    <TreeItemLayout aside={<CounterBadge appearance="filled" size="medium">{count}</CounterBadge>}>{content}</TreeItemLayout>:
                    <TreeItemLayout><RecordTag entityMetadata={entityMetadata}  onTagClick={powerAppsService.openRecord.bind(powerAppsService)} text={content} recordLookup={lookup!} description={description} /></TreeItemLayout>
                    }
                    
                </FlatTreeItem>
                );
            })}
            </FlatTree> 
            }

       
        </DialogContent>
        <DialogActions style={{gridColumn:'1/-1',justifySelf:'normal'} } fluid={true}>
        <Field style={{width:'100%',display:'flex'}} className={styles.field} orientation="horizontal"
                label="Current selected record">{selectedRecord !== undefined && selectedRecord !== null && entityMetadata &&
                    <RecordTag entityMetadata={entityMetadata} style={{marginTop:'2px'}} onTagClick={powerAppsService.openRecord.bind(powerAppsService)} recordLookup={selectedRecord} isUnderline={true} />
                
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

           /*  <Divider style={{width:'99%',position:'absolute',bottom:0}}  /> */
           