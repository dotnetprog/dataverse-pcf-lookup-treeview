import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";
import { IInputs } from "../generated/ManifestTypes";
import { PowerAppsContextService } from "../services/PowerAppsContextService";
const PowerAppsContext = createContext<PowerAppsContextService>(undefined!);
interface PowerAppsContextProviderProps {
    Service:PowerAppsContextService,
    children: ReactNode
 }
 export const PowerAppsContextProvider = ({ Service, children }: PowerAppsContextProviderProps) => {
    return (
       <PowerAppsContext.Provider value={Service}>
         {children}
       </PowerAppsContext.Provider>
    )
  }
  export const usePowerAppsContextContext = () => {
    return useContext(PowerAppsContext);
  }