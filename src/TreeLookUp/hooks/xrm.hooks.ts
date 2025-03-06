import { useContext, useEffect, useMemo, useState } from "react";
import { XrmContext } from "../components/XrmContextProvider";
import { ContextRecordService, FakeRecordService, IRecordService } from "../services/recordService";
import { LookupSettings } from "../ControlSettings";
import { CachedEntityMetadataService, IEntityMetadataService } from "../services/entityMetadataService";
import { CachedViewService, IViewService } from "../services/viewService";
export type LookupView = {
    viewId:string;
    viewName:string;
    relatedEntityName:string;
    isDefault:boolean;
    isPinned:boolean;
    isUserView:boolean;
}

export function useXrm(){
    const context = useContext(XrmContext);
    return context!;
}
export function useViewService():IViewService{
    const xrmContext = useXrm();
    return new CachedViewService(xrmContext.webAPI);
}
export function useRecordService():IRecordService{
    const xrmContext = useXrm();
    return window.location.hostname === 'localhost' ? 
                new FakeRecordService() : 
                new ContextRecordService(xrmContext!.webAPI);
}
export function useMetadataService():IEntityMetadataService{
    const xrmContext = useXrm();
    return new CachedEntityMetadataService(xrmContext.utils);
}
export function useXrmControlSettings():LookupSettings{
    const xrmContext = useXrm();
    const isSecured = xrmContext.parameters.MainLookUp.security?.secured ?? false;
    const security = xrmContext.parameters.MainLookUp.security!;
    const settings:LookupSettings = {
        groupby:xrmContext!.parameters.GroupBy.raw!.split(','),
        isReadOnly:xrmContext!.mode.isControlDisabled,
        isViewPickerEnabled:(xrmContext.parameters.MainLookUp as any).enableViewPicker ?? true,
        isEditable: isSecured  ? security.editable : true,
        isReadable:isSecured  ? security.readable : true,
    };
       
    return settings;

}
export function useEntityMetadata(etn:string,attributes?:string[]):[ComponentFramework.PropertyHelper.EntityMetadata | undefined, React.Dispatch<React.SetStateAction<ComponentFramework.PropertyHelper.EntityMetadata | undefined>>]{
    const [entityMetadata,setEntityMetadata] = useState<ComponentFramework.PropertyHelper.EntityMetadata>();
    const mdService = useMemo(() => useMetadataService(),[]);
    useEffect(() => {
        const fetchEMD = async () => {
            const emd = await mdService.getEntityMetadata(etn,false,attributes);
            setEntityMetadata(emd);
        }
        fetchEMD();
    },[etn]);
    return [entityMetadata,setEntityMetadata] ;
    
}
export function useLookupViews(etn:string):[LookupView[],boolean]{
    const [views,setViews] = useState<LookupView[]>([]);
    const [isViewLoading,setIsViewLoading] = useState<boolean>(false);
    const xrmContext = useXrm();
    useEffect(() => {
        const fetchViews = async () => {
            setIsViewLoading(true);
            const lookupAttribute = (xrmContext.parameters.MainLookUp as any);
            const views:LookupView[] = await lookupAttribute.getAllViews(etn);
            const defaultViewId = lookupAttribute.getDefaultViewId(etn);
            views.forEach((v) => {
                v.isDefault = v.viewId == defaultViewId
            });
            setViews(views);
            setIsViewLoading(false);
        }
        fetchViews();
    },[etn]);
    return [views,isViewLoading];
    
}