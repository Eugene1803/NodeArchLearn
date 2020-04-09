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
    isEditable: true,
  }

  async componentDidMount() {
    this.getRequestsList()
  }

  getRequestsList = async () => {
    const response = await fetch('http://134.209.249.75:5050/requestsList', {
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
      isEditable: true
    })
  }

  sendRequest = async () => {
    const {method, url, headers, reqParams} = this.state;
    const reqConfig = {
      method, url, headers, reqParams,
    }
    let response = await fetch('http://134.209.249.75:5050/makeRequest', {
      method: 'post',
      body: JSON.stringify(reqConfig),
      headers: {
        "Content-type": "application/json"
      }
    });
    if(response.status === 500) {
      const errorDescription = await response.text();
      alert(`Внутренняя ошибка сервера: ${errorDescription}`);
      return;
    }
    response = await response.json();
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
      isEditable: false
    })
  }

  saveReqConfig = async () => {
    this.setState({isEditable: false});
    const {method, url, headers, reqParams, id} = this.state;
    const reqConfig = {
      method, url, headers, reqParams,id
    }
    console.log(reqConfig);
    let response = await fetch('http://134.209.249.75:5050/saveRequest', {
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
    const {response, isEditable} = this.state;
    const headersJsx = [];
    if(response && response.headers) {
    for(let key in response.headers) {
      headersJsx.push(
          <div style={{display: 'flex'}} className='RequestListItem'>
            <div><b>{key}:</b></div>
            <div>{response.headers[key]}</div>
          </div>
      )
    }}
    return (
      <div className="MainPage">
        <h3>Сохраненные конфигурации запросов</h3>
        <div className={'RequestList'}>
          {this.state.requestsList.map(item =>
              <div style={{display: 'flex'}} className='RequestListItem' onClick={(e) => this.getRequestFromList(e, item)}>
                <div><b>id:</b> {item.id}</div>
                <div><b>Метод:</b> {item.method}</div>
                <div><b>Url:</b> {item.url}</div>
              </div>
          )}
        </div>
        <div className={'ReqParamsSection'}>
        <select onChange={this.changeReqMethod} value={this.state.method} disabled={!isEditable}>
          {requestMethodOptions.map(item => (
            <option key={item.value} name={item.name} value={item.value} >
              {item.value}
              </option>
          ))}
        </select>

        <label>URL</label>
        <input style={{width: '60%'}} type='text' value={this.state.url} onChange={this.onChangeUrl} disabled={!isEditable}/>
        </div>
        <div className={'ReqParamsSection'}>
          <h3>Параметры</h3>
          <div className={'ParamsInputsList'}>
        {this.state.reqParams.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
          <input placeholder={'Ключ'} disabled={!isEditable} value={this.state.reqParams[i].key} onChange={(e) => this.onChangeReqParams(e, i, 'key')}/>
          <input placeholder={'Значение'} disabled={!isEditable} value={this.state.reqParams[i].value} onChange={(e) => this.onChangeReqParams(e, i, 'value')}/>
            {isEditable &&
              <button onClick={() => this.deleteReqParamsRow(i)}>Х</button>
            }
          </div>
        ))}
          </div>
          {isEditable &&
          <button onClick={this.addReqParamsRow}>Добавить параметр запроса</button>
          }
        </div>
        <div className={'ReqParamsSection'}>
          <h3>Заголовки </h3>
          <div className={'ParamsInputsList'}>
        {this.state.headers.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
          <input placeholder={'Наименование заголовка'} disabled={!isEditable} value={this.state.headers[i].key} onChange={(e) => this.onChangeHeaders(e, i, 'key')}/>

          <input placeholder={'Значение'} disabled={!isEditable} value={this.state.headers[i].value} onChange={(e) => this.onChangeHeaders(e, i, 'value')}/>
            {isEditable &&
            <button onClick={() => this.deleteHeadersRow(i)}>Х</button>
            }

          </div>
        ))}
          </div>
          {isEditable &&
          <button onClick={this.addHeadersRow}>Добавить заголовок запроса</button>
          }
        </div>
        <div>
          {isEditable &&
            <button className={'SaveButton'} onClick={this.saveReqConfig}>Сохранить запрос</button>
          }
          <button className={'SaveButton'} onClick={this.makeNewRequestConfig}>Создать новый запрос</button>
          {!isEditable &&
            <button onClick={() => this.setState({isEditable: true})}>Изменить данные запроса</button>
          }
          {!isEditable &&
          <button className={'SaveButton'} onClick={this.sendRequest}>Отправить запрос</button>
          }
        </div>
        <h3>Результаты запроса</h3>
        {!!response &&
        <div>
          <div>
            <div><b>Статус: </b>{!!response && response.status}</div>
            <br/>
            <div>Заголовки ответа</div>
            <div>
              <div className={'RequestList'}>
                {headersJsx}
              </div>
            </div>
          </div>
          <br/>
          <div>Тело ответа</div>
          <pre style={{width: '100%', height: '300px', border: '1px solid black'}}>
            {!!this.state.response && this.state.response.body}
          </pre>
        </div>}
      </div>
    );
  }
}

export default MainPage;
