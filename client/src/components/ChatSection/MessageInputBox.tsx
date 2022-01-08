import React, {useState} from 'react';
import MoodIcon from "@mui/icons-material/Mood";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {Box, IconButton} from "@mui/material";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MyTextField from "../../utils/MySearchField";
import SendIcon from '@mui/icons-material/Send';

function MessageInputBox(props: { sendMessage: (e: any, setValue: any) => void }) {

    const [value, setValue] = useState('');

    return (
        <Box sx={{
            display: 'flex',
            backgroundColor: '#1D2428',
            alignItems: 'center',
            justifyContent: 'center',
            paddingX: '1rem'
        }}>
            <MoodIcon sx={{color: '#818689', marginX: '.5rem'}}/>
            <AttachFileIcon sx={{color: '#818689', marginX: '.5rem', transform: 'rotate(45deg)'}}/>
            <Box component={'form'} sx={{flex: '1', display: 'flex'}} onSubmit={async (e: any) => {
                await props.sendMessage(e, setValue);
            }}>
                <MyTextField name={"message"} id={"message"} placeholder={'Type a message'} value={value}
                             multiLine={true}
                             onChange={(e: any) => setValue(e.target.value)}/>
                <IconButton type={'submit'}>
                    <SendIcon sx={{color: '#818689'}}/>
                </IconButton>
            </Box>
            <MicOutlinedIcon sx={{color: '#818689', marginX: '.5rem'}}/>
        </Box>
    );
}

export default MessageInputBox;