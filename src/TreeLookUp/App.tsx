import * as React from "react"
import { PowerAppsContextProvider } from "./components/PowerAppsContextProvider"
import { IInputs } from "./generated/ManifestTypes"
import { Lookuptree } from "./components/Lookuptree"
import { FluentProvider, webLightTheme } from "@fluentui/react-components"
import { IPowerAppsContextServiceProps, PowerAppsContextService } from "./services/PowerAppsContextService"

export type AppProps = IPowerAppsContextServiceProps;

export const App:React.FC<AppProps> = (props) => {

    const service = new PowerAppsContextService(props);

    return (
    <PowerAppsContextProvider Service={service}>
        <FluentProvider style={{width:'100%'}} theme={webLightTheme}>
            <Lookuptree />
        </FluentProvider>
    </PowerAppsContextProvider>)
}