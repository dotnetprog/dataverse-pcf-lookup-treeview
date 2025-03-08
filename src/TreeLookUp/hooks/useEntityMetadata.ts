import { useEffect, useMemo, useState } from "react";
import { usePowerAppsContextContext } from "../components/PowerAppsContextProvider";

export function useEntityMetadata(etn:string,attributes?:string[]):[ComponentFramework.PropertyHelper.EntityMetadata | undefined, React.Dispatch<React.SetStateAction<ComponentFramework.PropertyHelper.EntityMetadata | undefined>>]{
    const powerAppsService = usePowerAppsContextContext();
    const [entityMetadata,setEntityMetadata] = useState<ComponentFramework.PropertyHelper.EntityMetadata>();
    useEffect(() => {
        const fetchEMD = async () => {
            const emd = await powerAppsService.metadataService.getEntityMetadata(etn,false,attributes);
            setEntityMetadata(emd);
        }
        fetchEMD();
    },[etn]);
    return [entityMetadata,setEntityMetadata] ;
    
}