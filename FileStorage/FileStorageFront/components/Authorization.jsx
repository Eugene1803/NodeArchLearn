import React from 'react';
import './Authorization.scss';
import NavLink from "react-router-dom/NavLink";
import {isObject} from 'lodash';

import {withRouter} from "react-router";
import {webServerUrl} from "../constants/constants";

class Authorization extends React.PureComponent {

    state = {
        login: {value: '', valid: true, error: ''},
        password:  {value: '', valid: true, error: ''},
        processed: false,
    }

    validateLogin = () => {
        const value = this.state.login.value;
        const state = this.state.login;

        if(value.length < 4) {
            this.setState({login: {...state, error: 'Логин должен быть не менее 4 символов'}});

            return false;
        }
        else {
            this.setState({
                login: {...state, error: ''}
            })

            return true;
        }
    }

    validatePassword = () => {
        const value = this.state.password.value;
        const state = this.state.password;

        if(value.length < 4) {
            this.setState({password: {...state, error: 'Пароль должен быть не менее 4 символов'}});

            return false;
        }
        else {
            this.setState({
                password: {...state, error: ''}
            })

            return true;
        }
    }


    setValue = (e, fieldName) => {
        const value = e.target.value.trim();
        const state = this.state[fieldName];
        this.setState({[fieldName]: {...state, value}})
    }

    authorize = async () => {
        this.setState({processed: true})
        try {
            const response = await fetch(`${webServerUrl}/authorization`, {
                method: 'post',
                body: JSON.stringify({
                    login: this.state.login.value,
                    password: this.state.password.value,
                }),
                headers: {
                    ['Content-type']: 'application/json'
                },
                credentials: 'include',
            });
            const {isAuthorized, errors} = await response.json();
            if(isAuthorized) {
                this.props.history.push('/index.html/main');
                document.title = this.state.login.value;
            }
            else if(errors.length) {
                alert(errors.join('  /   '));
            }
        }
        catch(e) {
            alert(`Произошла ошибка ${e}`)
        }
        this.setState({processed: false})
    }

    render() {

        const formIsValid = Object.keys(this.state).every(key => {
            const item = this.state[key];
            if(isObject(item)) {
                return !item.error && item.value;
            }
            return true;
        })

        return (
            <div className={"Authorization"}>
                <div>
                    <div>Логин</div>
                    <input type={'text'} onBlur={this.validateLogin} onChange={(e) => this.setValue(e, 'login')} value={this.state.login.value}/><br/>
                    <span style={{color: 'red'}}>{this.state.login.error}</span>

                </div>
                <div>
                    <div>Пароль</div>
                    <input type={'password'} onBlur={this.validatePassword} onChange={(e) => this.setValue(e, 'password')} value={this.state.password.value}/><br/>
                    <span style={{color: 'red'}}>{this.state.password.error}</span>

                </div>
                <div><NavLink to={'/index.html/registration'}>Перейти на страницу регистрации</NavLink></div>
                <div><button disabled={!formIsValid || this.state.processed} onClick={this.authorize}>Авторизоваться</button></div>
            </div>
        )

    }

}

export default withRouter(Authorization);