import React, {Fragment} from 'react';
//import PropTypes from 'prop-types';

import './MainPage.scss';
import { requestMethodOptions } from '../constants/constants';

class MainPage extends React.PureComponent {

  static propTypes = {
    //name: PropTypes.string.isRequired,
  };

  state={
    method: 'GET',
    url: '',
    reqParams: [{key: '', value: ''}],
    headers: [{key: '', value: ''}],
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


  saveReqConfig = async () => {
    const {method, url, headers, reqParams} = this.state;
    const reqConfig = {
      method, url, headers, reqParams,
    }
    let response = await fetch('http://localhost:8081/saveRequest', {
      method: 'post', 
      body: JSON.stringify(reqConfig),
    })
  } 

  render() {

    return (
      <div className="MainPage">
        <select onChange={this.changeReqMethod} value={this.state.method}>
          {requestMethodOptions.map(item => (
            <option key={item.value} name={item.name} value={item.value} >
              {item.value}
              </option>
          ))}
        </select>

        <label>URL</label>
        <input type='text' value={this.state.url} onChange={this.onChangeUrl}/>
        <div>
          <h3>Параметры запроса</h3>
        {this.state.reqParams.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
            <label>Ключ</label>
          <input value={this.state.reqParams[i].key} onChange={(e) => this.onChangeReqParams(e, i, 'key')}/>
          <label>Значение</label>
          <input value={this.state.reqParams[i].value} onChange={(e) => this.onChangeReqParams(e, i, 'value')}/>
        
          <button onClick={() => this.deleteReqParamsRow(i)}>Удалить параметр запроса</button>
          </div>
        ))}
        <button onClick={this.addReqParamsRow}>Добавить параметр запроса</button>
        </div>
        <div>
          <h3>Заголовки запроса</h3>
        {this.state.headers.map((item, i) => (
          <div style={{display: 'flex'}} key={i}>
            <label>Ключ</label>
          <input value={this.state.headers[i].key} onChange={(e) => this.onChangeHeaders(e, i, 'key')}/>
          <label>Значение</label>
          <input value={this.state.headers[i].value} onChange={(e) => this.onChangeHeaders(e, i, 'value')}/>
        
          <button onClick={() => this.deleteHeadersRow(i)}>Удалить заголовок запроса</button>
          </div>
        ))}
        <button onClick={this.addHeadersRow}>Добавить заголовок запроса</button>
        </div>
        <div>
        <button onClick={this.saveReqConfig}>Сохранить запрос</button>
        </div>
      </div>
    )
    ;

  }

}

export default MainPage;
