import React from 'react';
import './App.css';
import Home from "./containers/Home/Home";
import {Route, Switch} from "react-router-dom";
import Login from "./containers/Users/Login";
import Signup from "./containers/Users/Signup";

function App() {
    return (
        <Switch>
            <Route path={'/signup'}><Signup /></Route>
            <Route path={'/login'}><Login /></Route>
            <Route path={'/'}><Home /></Route>
        </Switch>
    );
}

export default App;
