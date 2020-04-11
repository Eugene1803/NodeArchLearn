const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const responseHeaders = [
    "Access-Control-Allow-Origin",
    "Content-Length",
    "Content-Type",
    "Date",
    "ETag",
    "X-Powered-By",
]

const getEncodedStrFromArray = arr => {
    return arr.map(({key, value}) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}

const webserver = express();

webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
//webserver.use(bodyParser.text()); // мидлварь, умеющая обрабатывать тело запроса в текстовом формате (есть и bodyParser.json())
//webserver.use(anyBodyParser);  //
const port = 5050;
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

webserver.use(
    "/index.html",
    express.static(path.resolve(__dirname,"../PostmanFront/public/index.html"))
);
webserver.use(
    "/bundle.min.js",
    express.static(path.resolve(__dirname,"../PostmanFront/public/bundle.min.js"))
);
webserver.use(
    "/main.bundle.css",
    express.static(path.resolve(__dirname,"../PostmanFront/public/main.bundle.css"))
);

webserver.get('/requestsList', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    fs.openSync(requestBaseFN, 'a+');
    const fileData = fs.readFileSync(requestBaseFN, "utf8");
    res.send(fileData || JSON.stringify([]));
});

webserver.post('/saveRequest', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    const requestData = req.body;
    fs.openSync(requestBaseFN, 'a+');
    const fileData = fs.readFileSync(requestBaseFN, "utf8");
    let newBase = fileData ? JSON.parse(fileData) : [];
    let newReqItem;
    if(requestData.id !== null) {
        newBase = newBase.map(item => {
            return (item.id === requestData.id) && requestData || item;
        })
    }
    else {
       newReqItem = {...requestData, id: newBase.length + 1};
        newBase.push(newReqItem);
    }
    const newBaseJSON = JSON.stringify(newBase);
    fs.writeFileSync(requestBaseFN,newBaseJSON);
    
    res.send(JSON.stringify(requestData.id !== null ? requestData: newReqItem));
})

webserver.post('/makeRequest', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const {method, url, headers, body, reqParams} = req.body;
    const reqHeaders = {};
    headers.forEach(item => {
        reqHeaders[item.key] = item.value;
    })
    let requestResult = {};
    const reqUrl = reqParams.length ? `${url}?${getEncodedStrFromArray(reqParams)}` : url;
    const reqConfig = {
        method,
        headers: reqHeaders,
    };
    method === 'POST' && body && (reqConfig.body = body);
    let response;
    try {
        response = await fetch(reqUrl, reqConfig);

    } catch (e) {
        res.status(500).send(e.message);
        return;
    }

    requestResult.headers = {};
    responseHeaders.forEach(item => {
        requestResult.headers[item] = response.headers.get(item);
    })
    requestResult.status = response.status;
    requestResult.body = (requestResult.headers['Content-type'] && requestResult.headers['Content-type'].indexOf('application/json') !== -1) ?
        await response.json() :
        await response.text();

    res.send(JSON.stringify(requestResult));
})

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});