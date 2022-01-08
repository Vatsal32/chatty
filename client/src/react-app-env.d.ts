/// <reference types="react-scripts" />
import {gql} from "@apollo/client";

interface user {
    id: string
    avatar: string
    name: string
}

interface chat {
    id: string
    createdAt: string
    type: string
    content: string
    author: {
        id: string
        email: string
        name: string
    }
}

interface room {
    id: string
    title: string
    description: string
}

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
