const express = require('express');

const webserver = express();
webserver.use(express.json());
webserver.use(express.urlencoded({extended:true}));
const port = 5052;

const getEncodedStrFromObject = obj => {
    const arr = [];
    for(let k in obj) {
        arr.push(`${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`);
    }
    return arr.join('&');
}

function buildResponseHTML(requestData, errorMessage) {
    if(!Object.keys(requestData).length || errorMessage) {
    let form = (
        `<form method='post' action=${"http://134.209.249.75:" + port +"/service"}>
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

webserver.get('/service', (req, res) => {
    res.send(buildResponseHTML(req.query));
});

webserver.get('/results', (req, res) => {
    res.send(buildResponseHTML(req.query));
})

webserver.post('/service', (req, res) => {
    const errors = getErrors(req.body);
    if(errors){
        res.send(buildResponseHTML(req.body, errors));
    }
    else {
        res.redirect(302, `http://134.209.249.75:${port}/results?${getEncodedStrFromObject(req.body)}`)
    }

});

webserver.listen(port,()=>{ 
    console.log("web server running on port "+port);
}); 
