import { LinkEntity } from "../common/fetchXmlQuery";
import { IInputs } from "../generated/ManifestTypes";
import { CachedEntityMetadataService, IEntityMetadataService } from "./entityMetadataService";
import { PowerAppsTreeItemService } from "./PowerAppsTreeItemService";
import { ContextRecordService, IRecordService } from "./recordService";
import { CachedViewService, IViewService } from "./viewService";

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
    onChange: (selectedOption?: ComponentFramework.LookupValue) => void;
    constructor(props:IPowerAppsContextServiceProps){

        if(!props){ return; }
        this.context = props.context;
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
    getFormattedField (field:string,entityMetadata:ComponentFramework.PropertyHelper.EntityMetadata) {
        const amd = entityMetadata.Attributes.getByName(field);
        return this.getFormattedSuffix(field,amd);
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