import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button } from "@fluentui/react-components"
import * as React from "react"

export interface ITreeSelectionDialogProps{
    isOpen:boolean,
    title:string
}

export const TreeSelectionDialog:React.FC<ITreeSelectionDialogProps> = (props) => {
    return (
    <Dialog open={props.isOpen} >
        <DialogSurface>
        <DialogBody>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
            exercitationem cumque repellendus eaque est dolor eius expedita
            nulla ullam? Tenetur reprehenderit aut voluptatum impedit voluptates
            in natus iure cumque eaque?
        </DialogContent>
        <DialogActions>
            <Button appearance="primary">Select</Button>
            <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
        </DialogActions>
        </DialogBody>
    </DialogSurface>
    </Dialog>)
}