import React, {Fragment} from 'react';
//import PropTypes from 'prop-types';
import find from 'lodash/find';
import './MainPage.scss';
import {requestHeaders, requestMethodOptions} from '../constants/constants';
const getEncodedStrFromArray = arr => {
  return arr.map(({key, value}) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}
class MainPage extends React.PureComponent {

    state = {
        comment: '',
        file: null,
        fileBase: [],
        progress: 0,
        wsConnection: false,
        sending: false,
    }

   async componentDidMount() {
        this.createWsConnection();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(!this.state.wsConnection) {
            this.createWsConnection();
        }
    }

    createWsConnection = async () => {
        const  socket = new WebSocket("ws://134.209.249.75:5056");
        socket.onopen = () => {
            console.log('Соединение с ws установлено!');
            this.setState({
                wsConnection: true,
            })
        }
        socket.onmessage = async (event) => {

            const data = JSON.parse(event.data);

            if(data.type === 'progress') {
                this.setState({
                    progress: data.progress,
                })
            }
            else if(data.type === 'registration') {
                this.setState({
                    wsId: data.id,
                }, () => alert(' Ваш id WS: ' + data.id))

                socket.onclose = () => {
                    alert('Соединение с ws потеряно');
                    this.setState({
                        wsConnection: false,
                        wsId: null,
                    })
                }

                try {
                    const response = await fetch('http://134.209.249.75:5055/getFilesBase', {
                        method: 'get'
                    });
                    const fileBase = await response.json();
                    this.setState({
                        fileBase,
                    })
                }catch(e) {
                    alert(`Произошла ошибка!!! ${e}`);
                }
            }
        };

    }

    onChangeFileInput = async e => {
        this.setState({
            file: e.target.files[0],
        })

  }

    onChangeComment = e => {
        this.setState({
            comment: e.target.value,
        })
    }

    sendFile = async () => {
        if(!this.state.comment || !this.state.file) {
            alert('Все должно быть заполнено!');
            return;
        }
        if(!this.state.wsConnection) {
            alert('Отсутсвтует соединение!');
            return;
        }
        this.setState({
            sending: true,
        })
        const formData = new FormData;
        formData.append('file', this.state.file);
        formData.append('comment', this.state.comment);
        try {
            const response = await fetch(`http://134.209.249.75:5055/sendFile?id=${this.state.wsId}`, {
                method: 'post',
                body: formData,
            });
            const newBase = await response.json();
            this.setState({
                fileBase: newBase,
                progress: 0,
                sending: false,
                comment: '',
            }, () => alert('Файл загружен на сервер'));
        }
        catch(e) {
            alert(`Произошла ошибка!!! ${e}`);
            this.setState({sending: false, progress: 0});
        }
    }

    downloadFile = async (name, originName) => {
        try {
            const response = await fetch('http://134.209.249.75:5055/getFile', {
                method: 'post',
                headers: {
                    ['Content-Type']: 'application/json; charset=utf-8',
                },
                body: JSON.stringify({name})
            });
            const fileBlob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(fileBlob);
            link.download = originName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch(e) {
            alert(`Произошла ошибка!!! ${e}`)
        }
    }


  render() {
    return (
       <div className={'MainPage'}>
        <div className={"Form"}>
            <div>
            <input type={'file'} disabled={this.state.sending} name={'file'} onChange={this.onChangeFileInput}/>
            </div>
            <div>
                Комментарий:
            <textarea value={this.state.comment} onChange={this.onChangeComment} disabled={this.state.sending}>

            </textarea>
            </div>
          <div>
           <button onClick={this.sendFile} disabled={this.state.sending}>Отправить</button>
          </div>

            <div style={{height: '30px', width: '100%', display: 'block'}}>
                {!!this.state.progress &&
                <div style={{height: '100%', width: this.state.progress * 100 + '%', backgroundColor: 'lightblue', overflow: 'visible', whiteSpace: 'nowrap'}}>Идет отправка</div>
                }
            </div>
        </div>
           <div className={'List'}>
               <h3>Список загруженных файлов</h3>
               {this.state.fileBase.map(item => (
                   <div className={'ListItem'}>
                       <div><b>Название:</b> {item.originName}</div>
                       <div><b>Комментарий: </b>{item.comment}</div>
                       <div>
                       <button onClick={() => this.downloadFile(item.storageName, item.originName)}>Скачать файл</button>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    )

  }
}

export default MainPage;
