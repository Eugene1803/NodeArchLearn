import React from 'react';
import './Registration.scss';
import NavLink from "react-router-dom/NavLink";
import {isObject} from "lodash";
import {webServerUrl} from "../constants/constants";

class Registration extends React.PureComponent {

    state = {
        login: {value: '', valid: true, error: ''},
        eMail: {value: '', valid: true, error: ''},
        password:  {value: '', valid: true, error: ''},
        passwordConfirm: {value: '', valid: true, error: ''},
        registrationSuccess: false,
    }


    setValue = (e, fieldName) => {
        const value = e.target.value.trim();
        const state = this.state[fieldName];
        this.setState({[fieldName]: {...state, value}})
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

    validatePasswordConfirm = () => {
        const value = this.state.passwordConfirm.value;
        const state = this.state.passwordConfirm;

        if(value !== this.state.password.value) {
            this.setState({passwordConfirm: {...state, error: 'Введенные пароли не совпадают'}});

            return false;
        }
        else {
            this.setState({
                passwordConfirm: {...state, error: ''}
            })

            return true;
        }
    }

    validateEMail = () => {
        const value = this.state.eMail.value;
        const state = this.state.eMail;

        if(!/^[\w\d%$:.-]+@\w+\.\w{2,5}$/.test(value)) {
            this.setState({eMail: {...state, error: 'Введите e-mail в формате myEmail@mail.com'}});

            return false;
        }
        else {
            this.setState({
                eMail: {...state, error: ''}
            })

            return true;
        }
    }

    register = async () => {
        this.setState({processed: true})
        try {
            const response = await fetch(`${webServerUrl}/registration`, {
                method: 'post',
                body: JSON.stringify({
                    login: this.state.login.value,
                    password: this.state.password.value,
                    eMail: this.state.eMail.value,
                }),
                headers: {
                    ['Content-type']: 'application/json'
                },
                credentials: 'include',
            });
            const {errors, id} = await response.json();
            if(id) {
                alert('На вашу почту выслано письмо для подтверждения регистрации');
                this.props.history.push('/authorization');
            }
            else if(errors.length) {
                alert(errors.join('  /  '));
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
            <div className={'Registration'}>
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
                <div>
                    <div>Подтверждение пароля</div>
                    <input type={'password'} onBlur={this.validatePasswordConfirm} onChange={(e) => this.setValue(e, 'passwordConfirm')} value={this.state.passwordConfirm.value}/><br/>
                    <span style={{color: 'red'}}>{this.state.passwordConfirm.error}</span>

                </div>
                <div>
                    <div>e-mail</div>
                    <input type={'text'} onBlur={this.validateEMail} onChange={(e) => this.setValue(e, 'eMail')} value={this.state.eMail.value}/><br/>
                    <span style={{color: 'red'}}>{this.state.eMail.error}</span>

                </div>
                <div><NavLink to={'/authorization'}>Перейти на страницу авторизации</NavLink></div>
                <div><button disabled={!formIsValid || this.state.processed} onClick={this.register}>Зарегистрироваться</button></div>
            </div>
        )
    }
}

export default Registration;