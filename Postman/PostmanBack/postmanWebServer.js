const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const webserver = express();

webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
//webserver.use(bodyParser.text()); // мидлварь, умеющая обрабатывать тело запроса в текстовом формате (есть и bodyParser.json())
//webserver.use(anyBodyParser);  //
const port = 8081;
const requestBaseFN = path.join(__dirname, 'requestBase.json');

// webserver.use() для статики

 
webserver.post('/saveRequest', (req, res) => {
    console.log(req.body);
    res.setHeader("Access-Control-Allow-Origin","*");
    const fileData = fs.readFileSync(requestBaseFN);
    const newBase = fileData ? JSON.parse(fileData) : [];
    newBase.push({...requestData, id: newBase.length + 1});
    const newBaseJSON = JSON.stringify(newBase);
    fs.writeFileSync(requestBaseFN,newBaseJSON);
    
    res.send(newBaseJSON);
})

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});