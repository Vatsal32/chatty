import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {ApolloClient, ApolloProvider, split, HttpLink, InMemoryCache} from "@apollo/client";
import {BrowserRouter} from "react-router-dom";
import {WebSocketLink} from "@apollo/client/link/ws";
import {getMainDefinition} from "@apollo/client/utilities";

const httpLink = new HttpLink({
    uri: '/graphql',
    credentials: 'same-origin',
});

const wsLink = new WebSocketLink({
    uri: 'ws://localhost:8080/graphql',
    options: {
        reconnect: true,
    }
});

const splitLink = split(({ query }) => {
    const definition = getMainDefinition(query);
    return (
        definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
}, wsLink, httpLink);

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink
});

const app = (
    <React.StrictMode>
        <ApolloProvider client={client}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ApolloProvider>
    </React.StrictMode>
);

ReactDOM.render(
    app,
    document.getElementById('root')
);
