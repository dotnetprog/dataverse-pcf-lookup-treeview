
type viewLists = Record<string,string>;
export interface IViewService {
    getFetchXmlFromViewId(viewId:string):Promise<string>
}

export class CachedViewService implements IViewService{
    private _webApi:ComponentFramework.WebApi;
    private _viewFetch:viewLists = {};
    constructor(webApi:ComponentFramework.WebApi){
        this._webApi = webApi;
    }
    async getFetchXmlFromViewId(viewId: string): Promise<string> {
        const options = `?$select=fetchxml,savedqueryid`;

        const cachedView = this._viewFetch[viewId];
        if(cachedView){
            return cachedView;
        }

        const view = await this._webApi.retrieveRecord('savedquery',viewId,options);
        this._viewFetch[viewId] = view.fetchxml;
        return this._viewFetch[viewId];
    }

    

}