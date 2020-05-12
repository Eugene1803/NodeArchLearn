import React, {Fragment} from 'react';
import './MainPage.scss';

const backendHost = 'http://134.209.249.75:5057';

class MainPage extends React.PureComponent {

    state = {
        sqlQuery: '',
        loading: false,
        result: {
            type: '',
            data: null,
        }
    }

    onChangeSQLQuery = e => {
        this.setState({
            sqlQuery: e.target.value,
        })
    }

    sendQuery = async () => {
        this.setState({
            loading: true,
            result: {
                type: '',
                data: null,
            }
        });
        if(!this.state.sqlQuery) {
            alert('Введите запрос');
            return;
        }
        try {
            const response = await fetch(`${backendHost}/sendQuery`, {
                method: 'post',
                body: JSON.stringify({
                    query: this.state.sqlQuery,
                }),
                headers: {
                    ['Content-Type']: 'application/json;charset=UTF-8',
                }

            });
            const result = await response.json();
            if(result.type === 'error'){
                alert(`База данных ответила ошибкой: ${result.data}`);
            }
            else {
                this.setState({
                    result,
                })
            }
        }
        catch(error) {
            alert(`Что-то пошло не так!`);
        }
        this.setState({loading: false});
    }

    buildResultTable = data => {
        if(!data.length) return;
        const tableHeaders = Object.keys(data[0]);
        return (
            <table className={'ResultTable'}>
                <tbody>
                <tr>
                    {tableHeaders.map(item => <th>{item}</th>)}
                </tr>
                {data.map(item => (
                    <tr>
                        {tableHeaders.map(header => <td>{item[header]}</td>)}
                    </tr>
                ))}
                </tbody>
            </table>
        )
    }

    render() {
        return (
            <div>
                   <h3>Введите запрос в базу данных</h3>
                   <textarea className={"TextAreaQuery"} onChange={this.onChangeSQLQuery}>

                   </textarea>
                <br/>
                <button onClick={this.sendQuery}>Отправить запрос</button>
                <h3>Результат запроса</h3>
                <div>
                {this.state.result.type === 'message' && this.state.result.data ||
                this.state.result.type === 'table' && this.buildResultTable(this.state.result.data)
                }
                </div>
            </div>
        )
    }
}

export default MainPage;
