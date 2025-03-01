import { useContext, useEffect, useState } from "react";
import { XrmContext } from "../components/XrmContextProvider";
import { ContextRecordService, FakeRecordService, IRecordService } from "../services/recordService";
import { LookupSettings } from "../ControlSettings";
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
export function useRecordService():IRecordService{
    const xrmContext = useXrm();
    return window.location.hostname === 'localhost' ? 
                new FakeRecordService() : 
                new ContextRecordService(xrmContext!.webAPI);
}
export function useXrmControlSettings():LookupSettings{
    const xrmContext = useXrm();
    const settings:LookupSettings = {
        groupby:xrmContext!.parameters.GroupBy.raw!.split(',')
    };
       
    return settings;

}
export function useEntityMetadata(etn:string,attributes?:string[]):[ComponentFramework.PropertyHelper.EntityMetadata | undefined, React.Dispatch<React.SetStateAction<ComponentFramework.PropertyHelper.EntityMetadata | undefined>>]{
    const [entityMetadata,setEntityMetadata] = useState<ComponentFramework.PropertyHelper.EntityMetadata>();
    const xrmContext = useXrm();
    useEffect(() => {
        const fetchEMD = async () => {
            const emd = await xrmContext!.utils.getEntityMetadata(etn,attributes);
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
            const views:LookupView[] = await (xrmContext.parameters.MainLookUp as any).getAllViews(etn);
            setViews(views);
            setIsViewLoading(false);
        }
        fetchViews();
    },[etn]);
    return [views,isViewLoading];
    
}