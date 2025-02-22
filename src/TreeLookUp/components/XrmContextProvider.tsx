import { createContext, useContext, useState } from "react";
import { IInputs } from "../generated/ManifestTypes";
export const XrmContext = createContext<ComponentFramework.Context<IInputs> | null>(null);
