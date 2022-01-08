import {gql} from 'apollo-server-express';
import {makeExecutableSchema} from "@graphql-tools/schema";
import {Context} from "./context";
import {applyMiddleware} from "graphql-middleware";
import {permissions} from "./permissions";
import {compare, hash} from "bcrypt";
import {APP_SECRET, getUserId} from "./utils";
import pkg from '@prisma/client';
import {v2 as cloudinary} from 'cloudinary';
import {sign} from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const typeDefs = gql`
    scalar DateTime
    
    type Query {
        allUser: [User!]!
        allRooms: [Room!]!
        allChats: [Chat!]!
        me: User!
        currentRoom(roomID: ID!): Room!
        currentUserRooms: [Room!]!
    }
        
    type Mutation {
        signup(name: String!, email: String!, password: String!, avatar: String): User!
        createRoom(title: String!, description: String, avatar: String): Room!
        newMessage(type: ChatType!, content: String!, roomId: String!): Chat!
        login(email: String!, password: String!): authPayload!
        addUser(roomId: ID!, userId: ID!): Room!
        removeUser(roomId: String!, userId: String!): Room!
        newMedia(type: ChatType!, content: String!, roomId: String!): Chat!
    }

    type Subscription {
        roomChat(roomId: ID!): ChatPayload!
        userRoom(userId: ID!): RoomPayload!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        avatar: String!
        rooms: [Room!]!
        chats: [Chat!]!
    }

    type Room {
        id: ID!
        title: String!
        description: String!
        avatar: String!
        members: [User!]!
        chats: [Chat!]!
    }

    type Chat {
        id: ID!
        type: ChatType!
        createdAt: DateTime!
        content: String!
        author: User!
        room: Room!
    }

    enum ChatType {
        TEXT,
        VIDEO,
        IMAGE
    }

    type authPayload {
        token: String
        user: User
    }

    type ChatPayload {
        mutation: SubscriptionMutationType!
        data: Chat!
    }
    
    type RoomPayload {
        mutation: SubscriptionMutationType!
        data: Room!
    }

    enum SubscriptionMutationType {
        CREATED
        DELETED
    }
`;

const resolvers = {
    Query: {
        async allUser(parent: Object, args: Object, context: Context) {
            return context.prisma.user.findMany({
                include: {
                    rooms: true,
                    chats: true
                },
            });
        },

        async allRooms(parent: Object, args: Object, context: Context) {
            return context.prisma.room.findMany({
                include: {
                    members: true,
                    chats: true
                }
            });
        },

        async allChats(parent: Object, args: Object, context: Context) {
            return context.prisma.chat.findMany({
                include: {
                    author: true,
                    room: true,
                }
            });
        },

        async me(parent: Object, args: Object, context: Context) {
            const userId = getUserId(context);

            return context.prisma.user.findUnique({
                where: {
                    id: userId
                }, include: {
                    rooms: true
                }, rejectOnNotFound: true
            });
        },

        async currentRoom(parent: Object, args: { roomID: string }, context: Context) {
            return context.prisma.room.findUnique({
                where: {
                    id: args.roomID
                }, include: {
                    chats: {
                        include: {
                            author: true
                        }
                    },
                    members: true
                }, rejectOnNotFound: true
            });
        },

        async currentUserRooms(parent: Object, args: Object, context: Context) {
            const userId = getUserId(context);
            return context.prisma.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                    rooms: true,
                },
                rejectOnNotFound: true,
            }).then(res => {
                return res.rooms;
            });
        },

    },

    Mutation: {

        async signup(parent: Object, args: { email: string, name: string, password: string, avatar: string }, context: Context) {
            return context.prisma.user.findUnique({
                where: {
                    email: args.email
                }
            }).then(async (usr) => {
                if (!usr) {
                    const nameSplit = args.name.split(' ');
                    const hashedPass = await hash(args.password, 10);
                    return context.prisma.user.create({
                        data: {
                            avatar: args.avatar || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${nameSplit[0]}+${nameSplit[1]}`,
                            name: args.name,
                            password: hashedPass,
                            email: args.email
                        }
                    });
                } else {
                    throw new Error('Email already in use.')
                }
            }).catch(err => new Error(err));
        },

        async createRoom(parent: Object, args: { title: string, description: string, avatar: string }, context: Context) {
            const userId = getUserId(context);
            if (!userId) {
                throw new Error('Not Authorized');
            }
            const nameSplit = args.title.split(' ');
            return context.prisma.room.create({
                data: {
                    title: args.title,
                    description: args.description || 'Nothing Here!',
                    avatar: args.avatar || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${nameSplit[0]}+${nameSplit[1] || ''}`,
                    memberIds: [userId]
                }
            }).then(async (res) => {
                await context.prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        roomIds: {
                            push: res.id,
                        }
                    }
                });
                return res;
            });
        },

        async newMessage(parent: Object, args: {
            type: pkg.ChatType,
            content: string,
            roomId: string
        }, context: Context) {
            const userId = getUserId(context);
            if (!userId) {
                throw new Error('Not Authorized.');
            }
            return context.prisma.chat.create({
                data: {
                    type: args.type,
                    content: args.content,
                    authorId: userId,
                    roomId: args.roomId,
                },
                include: {
                    author: true,
                    room: true
                }
            }).then(res => {
                context.pubSub.publish(`room id ${args.roomId}`, {
                    roomChat: {
                        mutation: 'CREATED',
                        data: res
                    }
                });
                return res;
            });
        },

        async newMedia(parent: Object, args: { type: pkg.ChatType, content: string, roomId: string }, context: Context) {
            const userId = getUserId(context);
            if (!userId) {
                throw new Error('Not Authorized.');
            }
            return cloudinary.uploader.upload(args.content, {
                resource_type: args.type.toLocaleLowerCase(),
                public_id: `${userId}/${args.type.toLocaleLowerCase()}/${args.type.slice(0, 3)} ${Date.now()}`,
                overwrite: true
            }).then(result => {
                if (result) {
                    return context.prisma.chat.create({
                        data: {
                            type: args.type,
                            content: result.secure_url,
                            authorId: userId,
                            roomId: args.roomId,
                        },
                        include: {
                            author: true,
                            room: true
                        }
                    }).then(res => {
                        context.pubSub.publish(`room id ${args.roomId}`, {
                            roomChat: {
                                mutation: 'CREATED',
                                data: res
                            }
                        });
                        return res;
                    });
                } else {
                    throw new Error('Something went wrong.')
                }
            }).catch(err => new Error(err));
        },

        async login(parent: Object, args: { email: string, password: string }, context: Context) {
            const user = await context.prisma.user.findUnique({
                where: {
                    email: args.email
                }
            });

            if (!user) {
                throw new Error('User not found.');
            }

            const passwordVerified = await compare(args.password, user.password);

            if (!passwordVerified) {
                throw new Error('Password Invalid.');
            }

            const token = sign({userId: user.id}, APP_SECRET, {expiresIn: '1h'});

            context.res.cookie('token', token, {
                httpOnly: true,
                maxAge: 3600000,
            });

            return {
                token,
                user,
            };
        },

        async addUser(parent: Object, args: { userId: string, roomId: string }, context: Context) {
            return context.prisma.user.update({
                where: {
                    email: args.userId
                },
                data: {
                    roomIds: {
                        push: args.roomId
                    }
                }
            }).then((usr) => {
                if (!usr) {
                    throw new Error('User not found');
                }
                return context.prisma.room.update({
                    where: {
                        id: args.roomId
                    },
                    data: {
                        memberIds: {
                            push: usr.id
                        }
                    },
                    include: {
                        members: true,
                    }
                });
            }).catch(err => new Error(err));
        },

        async removeUser(parent: Object, args: { userId: string, roomId: string }, context: Context) {
            const user = await context.prisma.user.findUnique({
                where: {
                    id: args.userId
                },
                rejectOnNotFound: true
            });
            const room = await context.prisma.room.findUnique({
                where: {
                    id: args.roomId
                },
                rejectOnNotFound: true
            });
            return context.prisma.user.update({
                where: {
                    id: args.userId
                }, data: {
                    roomIds: user.roomIds.filter(u => u !== args.roomId)
                }
            }).then(res => {
                if (res) {
                    return context.prisma.room.update({
                        where: {
                            id: args.roomId
                        },
                        data: {
                            memberIds: room.memberIds.filter(u => u !== args.userId)
                        },
                        include: {
                            members: true
                        }
                    })
                }
            });

        },

    },

    Subscription: {
        roomChat: {
            subscribe(parent: Object, args: { roomId: string }, context: Context) {
                return context.prisma.room.findUnique({
                    where: {
                        id: args.roomId
                    }
                }).then((roomDetails) => {
                    if (roomDetails) {
                        return context.pubSub.asyncIterator(`room id ${roomDetails.id}`);
                    } else {
                        throw new Error('Room not Found.');
                    }
                }).catch(err => new Error(err));
            }
        },
        userRoom: {
            subscribe(parent: Object, args: { userId: string }, context: Context) {
                return context.prisma.user.findUnique({
                    where: {
                        id: args.userId
                    },
                    rejectOnNotFound: true
                }).then(res => {
                    if (res) {
                        return context.pubSub.asyncIterator(`user id ${res.id}`);
                    }
                }).catch(err => new Error(err));
            }
        }
    }
};

const schemaNoPermission = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export const schema = applyMiddleware(schemaNoPermission, permissions);
