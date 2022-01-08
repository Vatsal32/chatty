import React, {useEffect, useState, Suspense} from 'react';
import {gql, useQuery} from "@apollo/client";
import {Box, CircularProgress} from "@mui/material";
import {Redirect} from "react-router-dom";
import RoomSideBar from "../../components/SideBar/RoomSideBar";
// import MediaChat from "../../components/ChatSection/MediaChat";

const allRoomQuery = gql`
    query getMyDetails {
        me {
            id
            name
            avatar
            rooms {
                id
            }
        }
    }
`;

function Home(props: Object) {

    const [room, setRoom] = useState<string>('');

    const {error, data} = useQuery(allRoomQuery);

    useEffect(() => {
        if (data)
            setRoom(data.me.rooms[0].id);
    }, [data]);

    if (error) {
        console.log(error);
        return <Redirect to={'/login'}/>;
    }

    if (data) {
        const ChatSection = React.lazy(() => import("../../components/ChatSection/ChatSection"));

        return (
            <Box sx={{
                display: 'flex',
                width: '75vw',
                height: '97vh',
                margin: 'auto',
                marginTop: '1.5vh'
            }}>
                <Suspense fallback={<h1>Loading</h1>}>
                    <RoomSideBar setRoom={setRoom}/>
                    <ChatSection roomID={room}/>
                </Suspense>
            </Box>
        );


    }

    return <CircularProgress sx={{
        width: '100vw',
        height: '100vh',
        marginTop: '50vh',
        marginLeft: '50vw',
        transform: 'translate(-50%, -50%)'
    }}/>;
}

export default Home;