import React, {Fragment} from 'react';
//import PropTypes from 'prop-types';

import './MainPage.scss';
import { requestMethodOptions } from '../constants/constants';

class MainPage extends React.PureComponent {

  static propTypes = {
    //name: PropTypes.string.isRequired,
  };

  state={
    id: null,
    method: 'GET',
    url: '',
    reqParams: [{key: '', value: ''}],
    headers: [{key: '', value: ''}],
    requestsList: [],
    response: null,
  }

  async componentDidMount() {
    this.getRequestsList()
  }

  getRequestsList = async () => {
    const response = await fetch('http://localhost:8081/requestsList', {
      method: 'GET'
    });
    const data = await response.json();
    this.setState({requestsList: data})
    return data;
  }

  changeReqMethod = e => {
    this.setState({
      method: e.target.value,
    })
  }

  onChangeUrl = e => {
    this.setState({
      url: e.target.value,
    })
  }

  makeNewRequestConfig = () => {
    this.setState({
      id: null,
      method: 'GET',
      url: '',
      reqParams: [{key: '', value: ''}],
      headers: [{key: '', value: ''}],
      response: null,
    })
  }

  sendRequest = async () => {
    const {method, url, headers, reqParams} = this.state;
    const reqConfig = {
      method, url, headers, reqParams,
    }
    let response = await fetch('http://localhost:8081/makeRequest', {
      method: 'post',
      body: JSON.stringify(reqConfig),
      headers: {
        "Content-type": "application/json"
      }
    });
    response = await response.json();
    console.log(response);
    this.setState({response});
  }

  onChangeReqParams = (e, index, key) => {
    let newReqParams = this.state.reqParams.map((item, i) => {
      if(i === index) {
        return {...item, [key]: e.target.value.trim()}
      }
      return item;
    })
    this.setState({
      reqParams: newReqParams,
    })
  }

  addReqParamsRow = () => {
    let newReqParams = [...this.state.reqParams];
    newReqParams.push({key: '', value: ''});
    this.setState({
      reqParams: newReqParams,
    })
  }

  deleteReqParamsRow = index => {
    this.setState({
      reqParams: this.state.reqParams.filter((item, i) => i !== index),
    })
  }

  onChangeHeaders = (e, index, key) => {
    let newHeaders = this.state.headers.map((item, i) => {
      if(i === index) {
        return {...item, [key]: e.target.value.trim()}
      }
      return item;
    })
    this.setState({
      headers: newHeaders,
    })
  }

  addHeadersRow = () => {
    let newReqHeaders = [...this.state.headers];
    newReqHeaders.push({key: '', value: ''});
    this.setState({
      headers: newReqHeaders,
    })
  }

  deleteHeadersRow = index => {
    this.setState({
      headers: this.state.headers.filter((item, i) => i !== index),
    })
  }

  getRequestFromList = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      ...item,
      response: null,
    })
  }

  saveReqConfig = async () => {
    const {method, url, headers, reqParams} = this.state;
    const reqConfig = {
      method, url, headers, reqParams,
    }
    let response = await fetch('http://localhost:8081/saveRequest', {
      method: 'post', 
      body: JSON.stringify(reqConfig),
      headers: {
        "Content-type": "application/json"
      }
    });
    const data = await response.json();
    this.setState({id: data.id});
    this.getRequestsList();
  } 

  render() {

    return (
      <div className="MainPage">
        <select onChange={this.changeReqMethod} value={this.state.method} disabled={this.state.id}>
          {requestMethodOptions.map(item => (
            <option key={item.value} name={item.name} value={item.value} >
              {item.value}
              </option>
          ))}
        </select>

        <label>URL</label>
        <input type='text' value={this.state.url} onChange={this.onChangeUrl} disabled={this.state.id}/>
        <div>
          <h3>Параметры запроса</h3>
        {this.state.reqParams.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
            <label>Ключ</label>
          <input disabled={this.state.id} value={this.state.reqParams[i].key} onChange={(e) => this.onChangeReqParams(e, i, 'key')}/>
          <label>Значение</label>
          <input disabled={this.state.id} value={this.state.reqParams[i].value} onChange={(e) => this.onChangeReqParams(e, i, 'value')}/>
            {!this.state.id &&
              <button onClick={() => this.deleteReqParamsRow(i)}>Удалить параметр запроса</button>
            }
          </div>
        ))}
          {!this.state.id &&
          <button onClick={this.addReqParamsRow}>Добавить параметр запроса</button>
          }
        </div>
        <div>
          <h3>Заголовки запроса</h3>
        {this.state.headers.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
            <label>Ключ</label>
          <input disabled={this.state.id} value={this.state.headers[i].key} onChange={(e) => this.onChangeHeaders(e, i, 'key')}/>
          <label>Значение</label>
          <input disabled={this.state.id} value={this.state.headers[i].value} onChange={(e) => this.onChangeHeaders(e, i, 'value')}/>
            {!this.state.id &&
            <button onClick={() => this.deleteHeadersRow(i)}>Удалить заголовок запроса</button>
            }

          </div>
        ))}
          {!this.state.id &&
          <button onClick={this.addHeadersRow}>Добавить заголовок запроса</button>
          }
        </div>
        <div>
          {!this.state.id &&
            <button onClick={this.saveReqConfig}>Сохранить запрос</button>
          }
          {this.state.id &&
          <button onClick={this.makeNewRequestConfig}>Создать новый запрос</button>
          }
          {this.state.id &&
          <button onClick={this.sendRequest}>Отправить запрос</button>
          }
        </div>
        <div>
          {this.state.requestsList.map(item =>
          <div style={{display: 'flex'}} onClick={(e) => this.getRequestFromList(e, item)}>
            <div>{item.id}</div>
            <div>{item.method}</div>
            <div>{item.url}</div>
          </div>
          )}
        </div>
        <div>
          <h3>Ответ на запрос</h3>
          <pre style={{width: '60%', height: '300px'}}>
            {!!this.state.response && JSON.stringify(this.state.response)}
          </pre>
        </div>
      </div>
    )
    ;

  }

}

export default MainPage;
