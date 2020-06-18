import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter} from "react-router-dom";
import IndexPage from "./components/IndexPage";

ReactDOM.render(
    <BrowserRouter>
        <IndexPage/>
    </BrowserRouter>,
    document.getElementById('container'
    ));
