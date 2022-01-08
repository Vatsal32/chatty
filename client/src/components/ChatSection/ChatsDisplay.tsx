import React, {useEffect, useMemo, useRef, useState} from 'react';
import {gql, useQuery, useSubscription} from "@apollo/client";
import {Box} from "@mui/material";
import Chat from "./Chat";
import {chat} from "../../react-app-env";

const MESSAGES_SUBSCRIPTION = gql`
    subscription ChatRoom($roomID: ID!) {
        roomChat(roomId: $roomID) {
            mutation
            data {
                id
                content
                createdAt
                author {
                    id
                    name
                    email
                }
            }
        }
    }
`;

const USER_QUERY = gql`
    query getUserId {
        me {
            id
        }
    }
`;

const groupUp = (array: chat[]) => {
    const map = new Map();
    array.forEach((item) => {
        const msgDate = new Date(item.createdAt);
        const key = msgDate.toDateString();
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
};

function ChatsDisplay(props: { id: string, chats: chat[] }) {

    const boxRef = useRef<HTMLDivElement>(null);

    const [userId, setUserId] = useState<string>('');

    const [msgList, setMsgList] = useState<Array<chat>>([]);

    const {data} = useSubscription(MESSAGES_SUBSCRIPTION, {variables: {roomID: props.id}});

    const user = useQuery(USER_QUERY);

    useEffect(() => {
        if (boxRef.current) {
            boxRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [msgList]);

    useEffect(() => {
        setMsgList(props.chats);
    }, [props.chats]);

    useEffect(() => {
        if (user.data) {
            setUserId(user.data.me.id);
        }
    }, [user.data]);

    useEffect(() => {
        if (data) {
            setMsgList(prevState => {
                return [...prevState, data.roomChat.data];
            });
        }
    }, [data]);

    const renderedChats = useMemo(() => {
        let dataRender: any = [];
        (groupUp(msgList)).forEach((value, key) => {
            dataRender.push(<h6 style={{textAlign: 'center', color: '#F1F1F1'}} key={key}>{key}</h6>);
            value.forEach((item: chat) => {
                dataRender.push(<Chat key={item.id} content={item.content} createdAt={item.createdAt}
                                      received={item.author.id !== userId} authorName={item.author.name} authorEmail={item.author.email} />)
            })
        });

        return dataRender;
    }, [msgList, userId]);

    return (
        <Box sx={{
            flex: '1',
            overflowY: 'auto',
            height: '85%',
            backgroundImage: `url('${process.env.PUBLIC_URL}/bg_dark.png')`,
            backgroundSize: 'contain',
            '&::-webkit-scrollbar': {
                width: '5px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent' /* color of the tracking area */
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#818689',
                borderRadius: '5px',
            }
        }}>
            {renderedChats}
            <div ref={boxRef}/>
        </Box>
    );

}

export default ChatsDisplay;