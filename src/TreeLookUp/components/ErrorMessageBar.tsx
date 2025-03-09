import { MessageBar, MessageBarBody, MessageBarTitle, Link } from "@fluentui/react-components";
import * as React from "react";



export type ErrorMessageBarProps = {
    error:any;
}
const getErrorText = (error:any):string => {
    const errorType = typeof error;
    if(error instanceof TypeError){
        return error.message + '\n\t' + error.stack;
    }
    switch(errorType){
        case 'string':
            return error;
        case 'object':
            return JSON.stringify(error);
        default:
            return 'Unknown error';
    }
}
export const ErrorMessageBar:React.FC<ErrorMessageBarProps> = ({error})=>{
    
    const errorText = getErrorText(error);
    return ( <MessageBar intent="error">
        <MessageBarBody >
          <MessageBarTitle >An error has occured</MessageBarTitle>
          <div style={{whiteSpace:'pre-wrap'}}>{errorText}</div>
        </MessageBarBody>
      </MessageBar>)
};
