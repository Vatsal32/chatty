import React from 'react';
import {TextField} from "@mui/material";

function MyTextField(props: { id: string, value: string, name: string, placeholder: string, InputProps?: Object, multiLine: boolean, width?: string, onChange: (e: any) => void }) {
    return (
        <TextField sx={{
            '.MuiInput-underline:before': {
                borderBottom: 'none'
            },
            '&& .MuiInput-underline:hover:before': {
                borderBottom: 'none'
            },
            '.MuiInput-underline:after': {
                borderBottom: 'none',
                color: 'white',
            },
            '& .MuiInputBase-root': {
                color: '#F1F1F2',
            },
            height: 'fit-content',
            maxHeight: "4rem",
            margin: '0.5rem',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            backgroundColor: '#32383B',
            width: props.width? props.width : '95%',
            borderRadius: '25px',
            paddingLeft: '1.25rem',
            paddingTop: '.25rem',
            paddingBottom: '.25rem',
            color: '#F1F1F2',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'orange',
                borderRadius: '5px',
            }
        }} variant={'standard'} placeholder={props.placeholder} value={props.value} InputProps={props.InputProps}
                   id={props.id} name={props.name} multiline={props.multiLine} onChange={props.onChange} />
    );
}

export default MyTextField;