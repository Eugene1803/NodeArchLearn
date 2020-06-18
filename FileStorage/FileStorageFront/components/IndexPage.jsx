import React, {Fragment} from 'react'
import {withRouter} from "react-router";

import Registration from "./Registration";
import Authorization from "./Authorization";
import MainPage from "./MainPage";
import {Route} from "react-router-dom";
import {webServerUrl} from "../constants/constants";

class IndexPage extends React.PureComponent {

    constructor(props) {
        super(props);
        this.props.history.push('/');
    }

    async componentDidMount() {
        console.log('загрузка глваной страницы');
        const response = await fetch(`${webServerUrl}/checkAuthorization`, {
            method: 'post',
            credentials: 'include',
        });
        const {isAuthorized, login} = await response.json();
        if(!isAuthorized) {
            this.props.history.push('/authorization');
        }
        else {
            this.props.history.push('/main');
            if(login) {
                document.title = login;
            }
        }
    }

    render() {
        return(<Fragment>
                    <Route exact path={'/registration'} component={Registration}/>
                    <Route exact path={'/authorization'} component={Authorization}/>
                    <Route exact path={'/main'} component={MainPage}/>
            </Fragment>

        )
    }
}

export default withRouter(IndexPage);