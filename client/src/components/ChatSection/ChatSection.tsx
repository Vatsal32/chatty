import React, {useEffect, useState} from 'react';
import {gql, useMutation, useQuery} from "@apollo/client";
import {Avatar, Box, CircularProgress, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MessageInputBox from "./MessageInputBox";
import ChatsDisplay from "./ChatsDisplay";
import {chat, user} from "../../react-app-env";
import RoomMenu from "../Menu/RoomMenu";

const CURRENT_ROOM = gql`
    query CurrentRoomDetails($roomID: ID!) {
        currentRoom(roomID: $roomID) {
            id
            title
            description
            chats {
                id
                type
                content
                createdAt
                author {
                    id
                    name
                    email
                }
            }
            members {
                id
                name
                avatar
            }
        }
    }
`;

const NEW_MESSAGE_TEXT = gql`
    mutation newTextMessage($content: String!, $roomID: String!) {
        newMessage(content: $content, type: TEXT, roomId: $roomID) {
            id
            content
        }
    }
`;

function ChatSection(props: { roomID: string }) {

    const {data, error, loading} = useQuery(CURRENT_ROOM, {variables: {roomID: props.roomID}});

    const [chats, setChats] = useState<Array<chat>>([]);

    // eslint-disable-next-line
    const [members, setMembers] = useState<Array<user>>([]);

    const [sendMsg] = useMutation(NEW_MESSAGE_TEXT);

    useEffect(() => {
        if (data) {
            setChats(data.currentRoom.chats);
            setMembers(data.currentRoom.members);
        }
    }, [data]);

    if (error) {
        console.log(error.message);
    }

    if (loading) {
        return <CircularProgress sx={{
            width: '100vw',
            height: '100vh',
            marginTop: '50vh',
            marginLeft: '50vw',
            transform: 'translate(-50%, -50%)'
        }}/>;
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: '0.75'}}>
            <Box component={'header'}
                 sx={{
                     padding: '1rem',
                     backgroundColor: '#292F32',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     height: '2.5rem'
                 }}>
                <Avatar sx={{marginX: '1rem'}}/>
                <Box sx={{flex: '1', color: '#F1F1F2', marginX: '1rem'}}>
                    <Typography variant={'h6'}>{data.currentRoom.title}</Typography>
                    <Typography variant={'caption'}>{data.currentRoom.description}</Typography>
                </Box>
                <SearchIcon sx={{color: '#818689', marginX: '1rem'}}/>
                <RoomMenu roomId={data.currentRoom.id} />
                <MoreVertIcon sx={{color: '#818689', marginX: '1rem'}}/>
            </Box>

            <ChatsDisplay id={data.currentRoom.id} chats={chats}/>

            <MessageInputBox sendMessage={(e: any, setValue: any) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                    content: formData.get("message"),
                    roomID: props.roomID,
                };
                sendMsg({variables: data}).catch((err) => console.log(err));
                setValue('');
            }}/>
        </Box>
    );
}

export default ChatSection;
