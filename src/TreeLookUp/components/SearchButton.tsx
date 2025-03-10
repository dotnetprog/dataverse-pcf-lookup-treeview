import { Button,
     ButtonProps,
     Dialog, DialogActions,
     DialogBody, 
     DialogContent, 
     DialogSurface, 
     DialogTitle, 
     DialogTrigger, 
 TreeItemValue, makeStyles, Spinner,  
     DialogOpenChangeEvent,
     DialogOpenChangeData,
     Field,
} from "@fluentui/react-components";
import * as React from "react"; 
import {useEffect} from "react"; 
import { AddSquareRegular, FluentIconsProps, SearchRegular, SubtractSquareRegular } from "@fluentui/react-icons";
import { LookupView, useEntityMetadata, useLookupViews } from "../hooks";

import ViewSelector  from "./ViewSelector";
import { SearchTextBox } from "./SearchTextBox";
import { RecordTag } from "./RecordTag";

import { usePowerAppsContextContext } from "./PowerAppsContextProvider";
import { PowerAppsTree } from "./PowerAppsTree";
import { useTreeData } from "../hooks";
import { ErrorMessageBar } from "./ErrorMessageBar";
const useStyles = makeStyles({
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
    onSelectedValue:(value:ComponentFramework.LookupValue)=> void;
}
export const SearchButton:React.FC<SearchButtonProps> = ({ entityType,onSelectedValue,selectedRecord,...btnprops}) => {
    const powerAppsService = usePowerAppsContextContext();
    const styles = useStyles();
    
    const [views,isViewLoading] = useLookupViews(entityType);
    const [entityMetadata] = useEntityMetadata(entityType,powerAppsService.GroupedBy);
    const [selectedValue,setSelectedValue] = React.useState<ComponentFramework.LookupValue | undefined>(undefined);
    const [filterText,setFilterText] = React.useState("");
    const [openItems,setOpenItems] = React.useState<Iterable<TreeItemValue>>([]);
    const [currentView,setCurrentView] = React.useState<LookupView | null>(null)
    const [isOpened,setIsOpened] = React.useState(false);
    const {data,error,isDataLoading} = useTreeData(currentView?.viewId,filterText,isOpened);
    const onSelectChange = (selectedTreeValue?:ComponentFramework.LookupValue)=>{
        setSelectedValue(selectedTreeValue);
    }
   
    const onSelectClick = () => {
        if(!selectedValue) return;

        onSelectedValue(selectedValue);
    } 
    useEffect(() => {
        if(isDataLoading) return;
        setOpenItems(data.filter(t => t.itemType === "branch").map(t=> t.value));//Always open all branches by default
    },[isDataLoading])
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
        const items = data.filter(gr => gr.itemType === 'branch').map(gr => gr.value);
        setOpenItems(items);
    };

   
    const onFilterTextChange = (filter:string) => {
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
        <DialogTitle>{powerAppsService.controlLabels.dialogTitle}</DialogTitle>
        <DialogContent style={{height:'100%',position:'relative'}} >
        <div className={styles.advancedSectionContainer}>
            <ViewSelector defaultText={powerAppsService.controlLabels.defaultViewText} disabled={!powerAppsService.isViewPickerEnabled} views={views} entityName={entityType} onViewChange={setCurrentView}/>
            
            <SearchTextBox onChangeText={onFilterTextChange} LabelText={powerAppsService.controlLabels.searchInputText} />
        </div>
        <div className={styles.treeBar}>
            <Button appearance="subtle" onClick={expandAll} icon={ <AddSquareRegular />}>
                {powerAppsService.controlLabels.expandBtn}
            </Button>
            <Button appearance="subtle" onClick={collapseAll} icon={ <SubtractSquareRegular />}>
            {powerAppsService.controlLabels.collapseBtn}
            </Button>
        </div>

        {error ? <ErrorMessageBar
         title={powerAppsService.controlLabels.errorPopupTitle} 
         defaultMessage={powerAppsService.controlLabels.defaultErrorText} 
         error={error} /> : isDataLoading || !entityMetadata ? 
         <Spinner appearance="primary" label={powerAppsService.controlLabels.loadingText} /> : 
            <PowerAppsTree
             groupedRecords={data}
              entityMetadata={entityMetadata} 
              onOpenChange={setOpenItems} 
              openItems={openItems} 
              onSelectChange={onSelectChange}  />
            }
            
       
        </DialogContent>
        <DialogActions style={{gridColumn:'1/-1',justifySelf:'normal'} } fluid={true}>
        <Field style={{width:'100%',display:'flex'}} className={styles.field} orientation="horizontal"
                label={powerAppsService.controlLabels.currentRecordLabel}>{selectedRecord !== undefined && selectedRecord !== null && entityMetadata &&
                    <RecordTag entityMetadata={entityMetadata} style={{marginTop:'2px'}} onTagClick={powerAppsService.openRecord.bind(powerAppsService)} recordLookup={selectedRecord} isUnderline={true} />
                
             }</Field>
            <DialogTrigger>
                <Button disabled={!selectedValue} onClick={onSelectClick} appearance="primary">{powerAppsService.controlLabels.selectBtn}</Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">{powerAppsService.controlLabels.cancelBtn}</Button>
            </DialogTrigger>
        </DialogActions>
        </DialogBody>
    </DialogSurface>
    </Dialog>
       
    );
};
           