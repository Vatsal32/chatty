import React, {useEffect, useState} from 'react';
import {Avatar, Box, InputAdornment} from "@mui/material";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RoomTitle from "./RoomTitle";
import MySearchField from "../../utils/MySearchField";
import SearchIcon from "@mui/icons-material/Search";
import {gql, useQuery} from "@apollo/client";
import {room} from "../../react-app-env";

const GET_ROOMS_QUERY = gql`
    query getRooms {
        currentUserRooms {
            id
            title
            avatar
        }
    }
`;

function RoomSideBar(props: { setRoom: React.Dispatch<React.SetStateAction<string>> }) {

    const [value, setValue] = useState('');

    const [rooms, setRooms] = useState<Array<room>>([]);

    const {data} = useQuery(GET_ROOMS_QUERY);


    useEffect(() => {
        if (data) {
            setRooms(data.currentUserRooms);
        }
    }, [data]);

    return (
        <Box sx={{flex: '0.25'}}>
            <Box component={'header'}
                 sx={{
                     padding: '1rem',
                     backgroundColor: '#292F32',
                     borderRight: '1px solid #3E4347',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between'
                 }}>
                <Avatar/>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <DonutLargeOutlinedIcon sx={{color: '#818689', marginX: '0.5rem'}}/>
                    <ChatIcon sx={{color: '#818689', marginX: '0.5rem'}}/>
                    <MoreVertIcon sx={{color: '#818689'}}/>
                </Box>
            </Box>

            <Box sx={{
                backgroundColor: '#111C21',
                height: '5%',
                padding: '.5rem 1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRight: '1px solid #273033',
                borderBottom: '1px solid #2E383D'
            }}>
                <MySearchField placeholder={'Search or start a new chat'} InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{position: "relative", color: '#818689'}}/>
                        </InputAdornment>
                    ),
                }} value={value} id={'1'} key={'1'} onChange={(e) => setValue(e.target.value)} multiLine={false}
                               name={'1'}/>
            </Box>

            {rooms.map(room => <RoomTitle active={false} on_click={() => props.setRoom(room.id)} title={room.title}
                                             key={room.id}/>)}
        </Box>
    );
}

export default RoomSideBar;