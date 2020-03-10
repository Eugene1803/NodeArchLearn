const express = require('express');
const path = require('path');
const fs = require('fs');

/// fs.openSync(path.join(__dirname, 'votesResults.json'));

const webserver = express(); 
const port = 3010;
webserver.use(express.json());
//webserver.use(express.urlencoded({extended:true}));

const initVoteOptions = [
    {name: 'белый', value: 0},
    {name: 'черный', value: 1},
];

webserver.use(
    express.static(path.resolve(__dirname))
);
/*
webserver.get('/index.html', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html'));
});
*/

const getVoteResults = () => {
    const data =  fs.readFileSync(path.join(__dirname, 'votesResults.json'));
            let currentStatistics;
            
            if (!data) {
                currentStatistics = initVoteOptions.map(item => ({value: item.value, votes: 0}));
               
            }else {
                currentStatistics = JSON.parse(data);  
            }
            return currentStatistics;
}

webserver.get('/variants', (req, res) =>
    res.send(initVoteOptions))

    webserver.post('/vote', (req, res) => {

            const newStatistics = getVoteResults().map(item =>{ 
                if(+item.value === +req.body.value) item.votes++;
                return item;
             })
        fs.writeFileSync(path.join(__dirname, 'votesResults.json'),JSON.stringify(newStatistics));
        
          res.send(true);
    })

    webserver.get('/getFormattedStatistics', (req, res) => {
        const statistics = getVoteResults();
        const accept = req.headers.accept;
        if(accept === 'application/json'){
            res.send(JSON.stringify(statistics));
        }
        else if(accept === 'text/html'){
            res.send(statistics.map(item => 
                `<div>Код варианта: ${item.value} Голосов: ${item.votes}</div>`).join('<br/>')
                );
        }
        else if(accept === 'application/xml'){
            res.send(statistics.map(item => 
                `<voteOption>
                <code>Код варианта: ${item.value}</code><votes> Голосов: ${item.votes}</votes>
                </voteOption>`).join('')
                );
        }
        else res.status(404).end();
    })

webserver.get('/stat', (req, res) => {
    res.setHeader('Content-type', 'text/html');
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
