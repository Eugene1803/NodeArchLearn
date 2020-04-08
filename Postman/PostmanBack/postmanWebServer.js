const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const webserver = express();

webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
//webserver.use(bodyParser.text()); // мидлварь, умеющая обрабатывать тело запроса в текстовом формате (есть и bodyParser.json())
//webserver.use(anyBodyParser);  //
const port = 8081;
const requestBaseFN = path.join(__dirname, '/requestBase.json');

// webserver.use() для статики

webserver.options('/saveRequest', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
});

webserver.options('/requestsList', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
})

webserver.options('/makeRequest', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
})


webserver.get('/requestsList', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    fs.openSync(requestBaseFN, 'a+');
    const fileData = fs.readFileSync(requestBaseFN, "utf8");
    res.send(fileData || JSON.stringify([]));
});

webserver.post('/saveRequest', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    const requestData = req.body;
    console.log(requestData);
    fs.openSync(requestBaseFN, 'a+');
    const fileData = fs.readFileSync(requestBaseFN, "utf8");
    const newBase = fileData ? JSON.parse(fileData) : [];
    const newReqItem = {...requestData, id: newBase.length + 1};
    newBase.push(newReqItem);
    const newBaseJSON = JSON.stringify(newBase);
    fs.writeFileSync(requestBaseFN,newBaseJSON);
    
    res.send(JSON.stringify(newReqItem));
})

webserver.post('/makeRequest', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    const {method, url, headers, reqParams}  = req.body;
    const reqHeaders = {};
    headers.forEach(item => {
        reqHeaders[item.key] = item.value;
    })
    let requestResult = {};
    if(method === 'POST'){
        const response = await fetch(url, {
            method,
            headers: reqHeaders,
            body: reqParams,
        });
        requestResult.headers = response.headers;
        requestResult.status = response.status;
        console.log('response', response);
        requestResult.body = await response.json();

    }
    else if(method === 'GET'){
        requestResult = 'Пока не обрабатывается GET'
    }

    res.send(JSON.stringify(requestResult));
})

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});