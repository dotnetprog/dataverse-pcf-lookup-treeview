import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { App, AppProps } from "./App";

export class TreeLookUp implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private _currentValue:ComponentFramework.LookupValue | null;
    private _fakeCurrentValue:ComponentFramework.LookupValue = {
        entityType:'contact',
        id:'05d92850-4eb8-42a7-b836-8247b18bff9c',
        name:'Doe, John'
    };
    private _defaultPagingSize=1000;
    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }
    private setCurrentValueFromContext(context: ComponentFramework.Context<IInputs>){
        if(this.isLocalEnvironment()){
            this._currentValue = this._fakeCurrentValue;
        }else if(context.parameters.MainLookUp.raw !== null && context.parameters.MainLookUp.raw.length > 0){
            this._currentValue = context.parameters.MainLookUp.raw[0];
        }else{
            this._currentValue = null;
        }
    }
    private onValueChangedFromControl(value?:ComponentFramework.LookupValue) {
        console.log("value selected: ",value);
        this._currentValue = value ?? null;
        this.notifyOutputChanged();
    }
    private isLocalEnvironment():boolean{
        return window.location.hostname === 'localhost';
    }
    private async testContext(context: ComponentFramework.Context<IInputs>){
        const etn = context.parameters.MainLookUp.getTargetEntityType();
        const lookupAttribute = (context.parameters.MainLookUp as any);
        const allviews = await lookupAttribute.getAllViews(etn);
        console.log('allViews',allviews);
        console.log('available viewIds',lookupAttribute.availableViewIds);
        console.log('available ViewNames',lookupAttribute.availableViewNames);
        const filter = lookupAttribute.filtering.getFilter();
        console.log('filtering',filter);
        const defaultViewId = lookupAttribute.getDefaultViewId(etn);
        console.log('defaultViewId',defaultViewId);
    }
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.setCurrentValueFromContext(context);
        this.testContext(context);
        const props: AppProps = { 
            context:context,
            onChange:this.onValueChangedFromControl.bind(this)
        };
       return React.createElement(App,props);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        if(this._currentValue !== null && this._currentValue !== undefined){
            return {
                MainLookUp:[this._currentValue]
            };
        }
        return { MainLookUp:undefined };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
