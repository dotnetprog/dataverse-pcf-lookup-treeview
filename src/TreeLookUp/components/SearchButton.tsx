import { Button, ButtonProps } from "@fluentui/react-components";
import * as React from "react"; 
import { SearchSquareRegular } from "@fluentui/react-icons";
export const SearchButton:React.FC<ButtonProps> = (props) => {
    return (
        <Button
        {...props}
        appearance="transparent"
        icon={<SearchSquareRegular />}
        size="large" />
    );
};