const express = require('express');

const webserver = express(); 

const port = 8080;

function buildResponseHTML(requestData, errorMessage) {
    if(!Object.keys(requestData).length || errorMessage) {
    let form = (
        `<form method='get'>
        Ваше имя
        <input type='text' name='firstName' value='${requestData.firstName || ''}'/>
        <br/>
        Ваша фамилия
        <input type='text' name='lastName' value='${requestData.lastName || ''}'/>
        <br/>
        <button type='submit'> Отправить </button>
        </form>
        <br/>
        `
    )
        if(errorMessage) form = form + `<div style='color: red'>${errorMessage}</div>`;
        return form;
    }
    else {
        return `<h3>Ваши данные</h3>
        <span>Имя</span>
        <br/>
        <span>${requestData.firstName}</span>
        <br/>
        <span>Фамилия</span>
        <br/>
        <span>${requestData.lastName}</span>
        `
    }
}

function getErrors(formData) {
    if(!Object.keys(formData).length || (formData.firstName && formData.lastName)) {
        return null;
    }
    else {
        return 'В каждом поле должен быть введен хотя бы один символ'
    }
}

function getResponse(request) {
    const reqPayLoad = request.query;
    const errorMessage = getErrors(reqPayLoad);

    return buildResponseHTML(reqPayLoad, errorMessage);
} 

webserver.get('/service', (req, res) => { 
    res.send(getResponse(req));
});


webserver.listen(port,()=>{ 
    console.log("web server running on port "+port);
}); 
