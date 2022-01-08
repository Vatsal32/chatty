import {createServer} from "http";
import {execute, subscribe} from "graphql";
import {SubscriptionServer} from "subscriptions-transport-ws";
import {ApolloServer} from "apollo-server-express";
import {schema} from "./schema";
import {createContext} from "./context";
import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from 'path';

async function main() {
    const app = express();

    const corsOptions = {
        origin: ['http://localhost:3000', 'https://studio.apollographql.com', 'https://chatty-graphql-server.herokuapp.com/'],
        credentials: true
    }

    app.use(cors(corsOptions));

    app.use(cookieParser());

    const httpServer = createServer(app);

    const server = new ApolloServer({
        schema,
        plugins: [
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            },
        ],
        context: createContext,
    });

    const subscriptionServer = SubscriptionServer.create(
        {
            schema, execute, subscribe, async onConnect() {
                return createContext(null, null);
            }
        },
        {server: httpServer, path: server.graphqlPath},
    );

    await server.start();
    
    app.use(express.static('public'));
    
    app.get('*', (req, res) => {
    	res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });

    server.applyMiddleware({app});

    httpServer.listen(process.env.PORT, () => {
        console.log(
            `🚀 Server is now Running on ${process.env.PORT}.`
        );
    });
}

main()
    .then(() => console.log("Server Running"))
    .catch((err) => console.log(err));
