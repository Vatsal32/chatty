import React from 'react';
import {Avatar, Box, Typography} from "@mui/material";

function RoomTitle(props: { active: boolean, on_click: () => void, title: string }) {
    return (
        <Box sx={{
            display: 'flex',
            minWidth: '25rem',
            backgroundColor: props.active ? '#313739' : '#111C21',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0.35',
            outline: 'none',
            border: 'none',
            '&:hover': {backgroundColor: '#2C3134'},
        }} onClick={props.on_click}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Avatar sx={{margin: '.25rem 1rem'}}/>
            </Box>
            <Box sx={{borderBottom: '1px solid #2E383D', flex: '1', display: 'flex', alignItems: 'center', paddingY: '.5rem', height: '60px'}}>
                <Typography variant={'h5'} color={'#F0F0F1'}>{props.title}</Typography>
            </Box>
        </Box>
    );
}

export default RoomTitle;
