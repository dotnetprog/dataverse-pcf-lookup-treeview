import { useContext, useEffect, useState } from "react";
import { XrmContext } from "../components/XrmContextProvider";
import { ContextRecordService, FakeRecordService, IRecordService } from "../services/recordService";
import { LookupSettings } from "../ControlSettings";


export function useXrm(){
    const context = useContext(XrmContext);
    return context!;
}
export function useRecordService(defaultPagingLimit:number):IRecordService{
    const xrmContext = useXrm();
    const userPagingLimit = (xrmContext!.userSettings as any).pagingLimit ?? defaultPagingLimit;
    return window.location.hostname === 'localhost' ? 
                new FakeRecordService() : 
                new ContextRecordService(xrmContext!.webAPI,userPagingLimit);
}
export function useXrmControlSettings():LookupSettings{
    const xrmContext = useXrm();
    const settings =xrmContext!.parameters.LookUpSettings.raw;
    return JSON.parse(settings!);

}
export function useEntityMetadata(etn:string,attributes?:string[]){
    const [entityMetadata,setEntityMetadata] = useState<ComponentFramework.PropertyHelper.EntityMetadata>();
    const xrmContext = useXrm();
    useEffect(() => {
        const fetchEMD = async () => {
            const emd = await xrmContext!.utils.getEntityMetadata(etn,attributes);
            setEntityMetadata(emd);
        }
        fetchEMD();
    },[etn]);
    return entityMetadata;
    
}