const express = require('express');
const path = require('path');
const fs = require('fs');

/// fs.openSync(path.join(__dirname, 'votesResults.json'));

const webserver = express(); 
const port = 3000;
webserver.use(express.json());
//webserver.use(express.urlencoded({extended:true}));

const initVoteOptions = [
    {name: 'белый', value: 0, votes: 0},
    {name: 'черный', value: 1, votes: 0},
];

webserver.get('/index.html', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html'));
});

webserver.get('/variants', (req, res) =>
    res.send(initVoteOptions))

webserver.get('/stat', (req, res) => {
    
    fs.readFile(path.join(__dirname, 'votesResults.json'), data => {
    
        if (!data) {res.send(initVoteOptions)}else {
            res.send(data);
        }
    });
})

webserver.post('/vote', (req, res) => {

    fs.readFile(path.join(__dirname, 'votesResults.json'), data => {
        let currentStatistics;
        if (!data) {
            currentStatistics = [...initVoteOptions];
           
        }else {
            currentStatistics = JSON.parse(data);
            
        }
        const newStatistics = currentStatistics.map(item =>{ 
            if(+item.value === +req.body.value) item.votes++;
            return item;
         })
    fs.writeFileSync(path.join(__dirname, 'votesResults.json'),JSON.stringify(newStatistics));
    
      res.send(JSON.stringify(newStatistics));
    });
    
})


webserver.listen(port,()=>{ 
    console.log("web server running on port "+port);
}); 
 