import React from 'react';
import {Box, Typography} from "@mui/material";
import {gql, useQuery} from '@apollo/client';

const USER_QUERY = gql`
    query getUserId {
        me {
            id
            avatar
        }
    }
`;

function Chat(props: { content: string, createdAt: string, received: boolean, authorEmail: string, authorName: string }) {
    const dateTime = new Date(props.createdAt);

    const {data, error} = useQuery(USER_QUERY);

    if (data) {
        if (props.received) {
            return (
                <Box sx={{ margin: '1rem',
                        backgroundColor: '#252D31',
                        width: 'fit-content',
                        maxWidth: '80%',
                        padding: '10px',
                        borderRadius: '5px',
                        marginLeft: '10px',}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography sx={{flex: '1'}} color={'rebeccapurple'} variant={'caption'}>
                            <strong>{props.authorName}&ensp;&ensp;</strong>
                        </Typography>
                        <Typography variant={'caption'} color={'lightgray'} >
                            ~{props.authorEmail}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'self-end',
                    }}>
                        <Box sx={{color: '#F1F1F2', maxWidth: '93%', marginLeft: '3px', marginRight: '-1 rem'}}>

                            <Typography sx={{whiteSpace: 'pre-line', wordWrap: 'break-word'}}>
                                {props.content}
                            </Typography>
                        </Box>

                        <Typography variant={'caption'}
                                    sx={{color: '#F1F1F2', whiteSpace: 'pre-line', paddingLeft: '6px'}}>
                            {dateTime.getHours() > 12 ? dateTime.getHours() - 12 : dateTime.getHours()}:{dateTime.getMinutes()} {dateTime.getHours() >= 12 ? 'pm' : 'am'}
                        </Typography>
                    </Box>
                </Box>
            );
        } else {
            return (
                <Box sx={{
                    margin: '1rem',
                    backgroundColor: '#006564',
                    width: 'fit-content',
                    maxWidth: '80%',
                    padding: '10px',
                    borderRadius: '5px',
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'self-end',
                }}>
                    <Box sx={{color: '#F1F1F2', maxWidth: '93%', marginLeft: '3px'}}>
                        <Typography sx={{whiteSpace: 'pre-line', wordWrap: 'break-word'}}>
                            {props.content}
                        </Typography>
                    </Box>

                    <Typography variant={'caption'} sx={{color: '#F1F1F2', whiteSpace: 'pre-line', paddingLeft: '6px'}}>
                        {dateTime.getHours() > 12 ? dateTime.getHours() - 12 : dateTime.getHours()}:{dateTime.getMinutes()} {dateTime.getHours() >= 12 ? 'pm' : 'am'}
                    </Typography>
                </Box>
            );
        }
    }

    if (error) {
        console.log(error);
    }

    return <h1 style={{textAlign: 'center'}}>404</h1>;
}

export default Chat;
