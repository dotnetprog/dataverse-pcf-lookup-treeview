import { MessageBar, MessageBarBody, MessageBarTitle } from "@fluentui/react-components";
import * as React from "react";



export type ErrorMessageBarProps = {
    error:any;
    title:string;
    defaultMessage:string
}
const getErrorText = (error:any,defaultMessage:string):string => {
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
            return defaultMessage;
    }
}
export const ErrorMessageBar:React.FC<ErrorMessageBarProps> = ({error,title,defaultMessage})=>{
    
    const errorText = getErrorText(error,defaultMessage);
    return ( <MessageBar intent="error">
        <MessageBarBody >
          <MessageBarTitle >{title}</MessageBarTitle>
          <div style={{whiteSpace:'pre-wrap'}}>{errorText}</div>
        </MessageBarBody>
      </MessageBar>)
};
