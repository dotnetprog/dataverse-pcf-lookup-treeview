import { useEffect, useState } from "react";
import { usePowerAppsContextContext } from "../components/PowerAppsContextProvider";
import { FetchXmlQuery } from "../common/fetchXmlQuery";
import { PowerAppsTreeItem } from "../services/PowerAppsTreeItemService";




export function useTreeData(viewid:string | undefined,filterText:string,isOpened:boolean){
     const powerAppsService = usePowerAppsContextContext();
     const[isDataLoading,setIsDataLoading] = useState(false);
     const[error,setError] = useState<any>();
     const[data,setData] = useState<PowerAppsTreeItem[]>([]);
     const fetchData = async () => {
            setError(undefined);
            if (!viewid || !isOpened) {
                return;
            }
            console.log('fetching data for tree view.');
            setIsDataLoading(true);
          
            // get the data from the api
            const treeItems = await powerAppsService.getTreeData(viewid,filterText);
            setData(treeItems);
          //  setOpenItems(treeItems.filter(t => t.itemType === "branch").map(t=> t.value));//Always open all branches by default
          };
    useEffect(() => {

      fetchData().catch(e => setError(e)).finally(() => setIsDataLoading(false));

    },[viewid,filterText,isOpened]);
    return {
      error,
      data,
      isDataLoading
    };
}