import {rule, shield} from "graphql-shield";
import {Context} from "./context";
import {getUserId} from "./utils";

const rules = {

    isAuthenticatedUser: rule()((_parent, _args, context: Context) => {
        const userId = getUserId(context);
        return Boolean(userId);
    }),

    inRoom: rule()(async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (userId) {
            const room = await context.prisma.room.findUnique({
                where: {
                    id: args.roomId
                }
            });
            if (room) {
                return Boolean(room.memberIds.includes(userId));
            } else {
                throw new Error('User not in the Room.');
            }
        } else {
            throw new Error('Not authorized.')
        }
    }),
};

export const permissions = shield({
    Query: {
        allRooms: rules.isAuthenticatedUser,
        allChats: rules.isAuthenticatedUser,
    },
    Mutation: {
        createRoom: rules.isAuthenticatedUser,
        newMessage: rules.inRoom,
        addUser: rules.inRoom,
        newMedia: rules.inRoom,
        removeUser: rules.inRoom,
    }
});