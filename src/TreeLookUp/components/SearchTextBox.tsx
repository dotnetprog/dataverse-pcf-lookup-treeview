import * as React from "react"; 
import {Button, ButtonProps, Field, Input, InputOnChangeData} from '@fluentui/react-components';
import {DismissRegular, SearchRegular} from "@fluentui/react-icons";




const ClearButton: React.FC<ButtonProps> = (props) => {
    return (
      <Button
        {...props}
        appearance="transparent"
        size="small"
        icon={<DismissRegular/>}
      ></Button>
    );
  };

export type ISearchTextBoxProps = {
    onChangeText:(value:string) => void;
    LabelText:string;
}

export const SearchTextBox:React.FC<ISearchTextBoxProps> = (props) => {
    const [showClearBtn,setShowClearBtn] = React.useState(false);
    const [textValue,setTextValue] = React.useState("");
    const onKeyDown = (ev:React.ChangeEvent<HTMLInputElement>,data:InputOnChangeData) => {    
        setTextValue(data.value);
    }
    React.useEffect(() => {
        props.onChangeText(textValue);
        if(showClearBtn && !textValue){//hide btn only if needed
            setShowClearBtn(false);
        }
        if(!showClearBtn && textValue){//show btn only if needed
            setShowClearBtn(true);
        }
    },[textValue]);
    const clearTextField = () => {
        setTextValue("");
    }
    return (<Field label={props.LabelText}>
              <Input onChange={onKeyDown} value={textValue} contentBefore={<SearchRegular />} contentAfter={showClearBtn ? <ClearButton onClick={clearTextField} /> : undefined} />
            </Field>)
}