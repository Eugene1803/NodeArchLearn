const express = require('express');
const path = require('path');
const fs = require('fs');

/// fs.openSync(path.join(__dirname, 'votesResults.json'));

const webserver = express(); 
const port = 3000;
webserver.use(express.json());
//webserver.use(express.urlencoded({extended:true}));

const initVoteOptions = [
    {name: 'белый', value: 0},
    {name: 'черный', value: 1},
];

webserver.get('/index.html', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html'));
});

webserver.get('/variants', (req, res) =>
    res.send(initVoteOptions))

    webserver.post('/vote', (req, res) => {

       const data =  fs.readFileSync(path.join(__dirname, 'votesResults.json'));
            let currentStatistics;
            
            if (!data) {
                currentStatistics = initVoteOptions.map(item => ({value: item.value, votes: 0}));
               
            }else {
                currentStatistics = JSON.parse(data);  
            }

            const newStatistics = currentStatistics.map(item =>{ 
                if(+item.value === +req.body.value) item.votes++;
                return item;
             })
        fs.writeFileSync(path.join(__dirname, 'votesResults.json'),JSON.stringify(newStatistics));
        
          res.send(true);

        
    })

webserver.get('/stat', (req, res) => {
    
    const data = fs.readFileSync(path.join(__dirname, 'votesResults.json'));
    if (!data) {
        res.send(initVoteOptions.map(item => ({value: item.value, votes: 0})))
    }else {
        res.send(data);
    }
})

webserver.listen(port,()=>{ 
    console.log("web server running on port "+port);
}); 
