import { FetchXmlQuery, LinkEntity } from "../common/fetchXmlQuery";
import { IInputs } from "../generated/ManifestTypes";
import { groupBy } from "../common/utility";
import { CachedEntityMetadataService, IEntityMetadataService } from "./entityMetadataService";
import { PowerAppsTreeItemService } from "./PowerAppsTreeItemService";
import { ContextRecordService, IRecordService } from "./recordService";
import { CachedViewService, IViewService } from "./viewService";
import { ControlLabels } from "../ControlLabels";

export type IPowerAppsContextServiceProps = {
    context: ComponentFramework.Context<IInputs>;
    onChange: (selectedOption?: ComponentFramework.LookupValue) => void;
}



export class PowerAppsContextService {
    context: ComponentFramework.Context<IInputs>;
    selectedValue?:ComponentFramework.LookupValue;
    dependentValue?:ComponentFramework.LookupValue;
    dependentEntityName:string;
    filterRelationshipName:string;
    isReadOnly:boolean;
    isMasked:boolean;
    GroupedBy:string[];
    viewService:IViewService;
    metadataService:IEntityMetadataService;
    recordService:IRecordService;
    treeItemService:PowerAppsTreeItemService;
    noValueLabel = "(none)";
    isViewPickerEnabled:boolean;
    mainLookupEntityName:string;
    controlLabels:ControlLabels;
    onChange: (selectedOption?: ComponentFramework.LookupValue) => void;
    constructor(props:IPowerAppsContextServiceProps){

        if(!props){ return; }
        this.context = props.context;
        this.controlLabels = this.getControlLabels();
        this.noValueLabel = `(${this.controlLabels.noData})`;
        this.mainLookupEntityName = this.context.parameters.MainLookUp.getTargetEntityType();
        this.isViewPickerEnabled = (this.context.parameters.MainLookUp as any).enableViewPicker ?? true;
        this.metadataService = new CachedEntityMetadataService(this.context.utils);
        this.recordService = new ContextRecordService(this.context.webAPI);
        this.viewService = new CachedViewService(this.context.webAPI);
        this.treeItemService = new PowerAppsTreeItemService(this.noValueLabel);
        this.onChange=props.onChange;
        this.isReadOnly = props.context.mode.isControlDisabled || !props.context.parameters.MainLookUp.security?.editable;
        this.isMasked = !props.context.parameters.MainLookUp.security?.readable;
        this.selectedValue = props.context.parameters.MainLookUp.raw[0];
        this.GroupedBy = props.context.parameters.GroupBy.raw!.split(',');
        this.dependentEntityName = (props.context.parameters.MainLookUp as any).dependentAttributeType ?? ''
        this.filterRelationshipName = (props.context.parameters.MainLookUp as any).filterRelationshipName ?? ''
        this.dependentValue = props.context.parameters.DependentLookupField?.raw !== null
        ? props.context.parameters.DependentLookupField?.raw[0]
        : undefined
    }
    openRecord(v:ComponentFramework.LookupValue){
        console.log('open selected record called.');
        this.context.navigation.openForm({
            entityName:v?.entityType!,
            entityId: v?.id!,
            openInNewWindow:false
        });
    };
  
    getRelatedFormattedField(field:string,linkEntity:LinkEntity,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata){
        const [property,relatedproperty] = field.split('.');
        const amd = entityMetadata.Attributes.getByName(relatedproperty);
        let formattedSuffix = this.getRelatedFormattedSuffix(relatedproperty,amd);
        return `${linkEntity.alias}.${formattedSuffix}`;
        
    }
    async getTreeData(viewid:string,filterText:string){
        const viewFetchXml = await this.viewService.getFetchXmlFromViewId(viewid);
        const fetchQuery = new FetchXmlQuery(this.metadataService);
        fetchQuery.LoadFrom(viewFetchXml);
        const entityMetadata = await this.metadataService.getEntityMetadata(fetchQuery.getQueryEntityName(),false,this.GroupedBy);
        await fetchQuery.addAttributes(...this.GroupedBy);
        fetchQuery.addFilterSearch(entityMetadata!.PrimaryNameAttribute,filterText);
        fetchQuery.addDependantFilter(entityMetadata!,this.filterRelationshipName,this.dependentValue);
        const data = await this.recordService.getRecordsByFetchXml(entityMetadata!.LogicalName,fetchQuery.toString());
        const reservedFields:string[] = [...this.GroupedBy,entityMetadata!.PrimaryNameAttribute,entityMetadata!.PrimaryIdAttribute];
        let viewFields = fetchQuery.getTopLevelAttributes().filter(f => !reservedFields.includes(f));//exclude columns that is already used in the component.
        if(viewFields.length > 2) {//take only the first two
            viewFields = viewFields.slice(0,2);
        }
        this.metadataService.clearCache();
        const formattedFields:string[] = [];
        for(const c of this.GroupedBy){
            if(c.includes('.')){
                const [sourceField] = c.split('.');
                const linkEntity = fetchQuery.getLinkEntity(sourceField);  
                const linkEntityMetadata = await this.metadataService.getEntityMetadata(linkEntity.entityType,false,linkEntity.columns); 
                formattedFields.push(this.getRelatedFormattedField(c,linkEntity,linkEntityMetadata));
            }else{
                formattedFields.push(this.getFormattedField(c,entityMetadata!));
            }
        }

       
        const emd = await this.metadataService.getEntityMetadata(this.mainLookupEntityName,true,[...this.GroupedBy,...viewFields]);
        // convert the data to json
        const groupedData  = groupBy<ComponentFramework.WebApi.Entity,string[]>(data,...formattedFields); 
        // set state with the result
        const treeItems = this.treeItemService.MapToCustomTreeItem(groupedData,entityMetadata!,viewFields.map(f => this.getFormattedField(f,emd)));
        return treeItems;
    }
    getFormattedField (field:string,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) {
        const amd = entityMetadata.Attributes.getByName(field);
        return this.getFormattedSuffix(field,amd);
    }
    private getControlLabels():ControlLabels{
        return {
            selectBtn:this.context.resources.getString("SelectBtn"),
            loadingText:this.context.resources.getString("LoadingText"),
            errorPopupTitle:this.context.resources.getString("ErrorPopupTitle"),
            noData:this.context.resources.getString("NoData"),
            dialogTitle:this.context.resources.getString("DialogTitle"),
            searchInputText:this.context.resources.getString("SearchInputLabel"),
            currentRecordLabel:this.context.resources.getString("CurrentRecordLabel"),
            cancelBtn:this.context.resources.getString('CancelBtn'),
            expandBtn:this.context.resources.getString('ExpandBtn'),
            collapseBtn:this.context.resources.getString('CollapseBtn'),
            defaultViewText:this.context.resources.getString('DefaultViewText'),
            noRecordFound:this.context.resources.getString('NoRecordFound'),
            defaultErrorText:this.context.resources.getString('DefaultErrorText')
        }
    }
    private getFormattedSuffix(property:string,amd:any){
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
    private getRelatedFormattedSuffix(property:string,amd:any){
        switch(amd.AttributeType){
            case 0:
            case 2:
            case 8:
            case 9:
            case 11:
            case 13:
            case 6:
            case 1:
                return `${property}@OData.Community.Display.V1.FormattedValue`;
            default:
                return property;
        }
    }

}