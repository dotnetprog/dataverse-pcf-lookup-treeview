import { useState, useEffect } from "react";
import { usePowerAppsContextContext } from "../components/PowerAppsContextProvider";
export type LookupView = {
    viewId:string;
    viewName:string;
    relatedEntityName:string;
    isDefault:boolean;
    isPinned:boolean;
    isUserView:boolean;
}
export function useLookupViews(etn:string):[LookupView[],boolean]{
    const [views,setViews] = useState<LookupView[]>([]);
    const [isViewLoading,setIsViewLoading] = useState<boolean>(false);
    const powerAppsService = usePowerAppsContextContext();
    useEffect(() => {
        const fetchViews = async () => {
            setIsViewLoading(true);
            const lookupAttribute = (powerAppsService.context.parameters.MainLookUp as any);
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