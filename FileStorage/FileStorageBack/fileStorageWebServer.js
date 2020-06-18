const express = require('express');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const inspect = require('util').inspect;
const {find}  = require('lodash');
const WebSocket = require('ws');

const port  = 5055;
const wsPort = 5056;
const clients = [];
const server = new WebSocket.Server({ port: wsPort });
server.on('connection', connection => {
    const id = clients.length + 1;
    clients.push( { id, connection:connection} );

    connection.send(JSON.stringify({id, type: 'registration'}));
});

const webserver = express();

webserver.use(express.urlencoded({extended: true}));

webserver.use(express.json());

webserver.options('/getFilesBase', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
})

webserver.options('/getFile', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
})

webserver.options('/sendFile', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
});

webserver.use(
    "/index.html",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/index.html"))
);
webserver.use(
    "/bundle.min.js",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/bundle.min.js"))
);
webserver.use(
    "/main.bundle.css",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/main.bundle.css"))
);

webserver.post('/sendFile', (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
   const clientId  = +req.query.id;
   const clientConnection = find(clients, {id:clientId}).connection;
   const contentLength = req.headers['content-length'];
   let length = 0;
   const fileInfo = {};
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', async function(fieldname, file, filename, encoding, mimetype) {
        const uniqueName = `${Math.random()}_${new Date().getTime()}_${filename}`;
        const  saveTo = path.join(__dirname, '/storage/' + uniqueName);
        fileInfo.storageName = uniqueName;
        fileInfo.originName = filename;
        file.pipe(fs.createWriteStream(saveTo));
        file.on('data', function(data) {
            length += data.length;
            clientConnection.send(JSON.stringify({type: 'progress', progress: length/contentLength}));
        });
        file.on('end', function() {
        });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        fileInfo.comment = inspect(val);
    });
    busboy.on('finish', function() {
        clientConnection.send(JSON.stringify({type: 'progress', progress: 1}));
        let filesInfoDataBase = null;
        try {
            fs.open(path.join(__dirname, '/filesInfoDataBase.json'), 'a+', (err, fd) => {
                if (err) throw new Error('');
                fs.readFile(fd, 'utf8', (err, data) => {
                    if (err) throw new Error('');
                    let newBase;
                    if (!data) {
                        newBase = [];
                    } else {
                        newBase = JSON.parse(data);
                    }
                    newBase.push(fileInfo);
                    fs.writeFile(path.join(__dirname, '/filesInfoDataBase.json'), JSON.stringify(newBase), (err) => {
                        if (err) throw new Error('');
                        fs.close(fd, () => {
                            res.send(JSON.stringify(newBase));
                        })
                    })
                })
            })
        } catch (err) {
            res.status(500).send('Oops');
        }

    });
    req.pipe(busboy);
})

webserver.post('/getFile', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    const body  = req.body;
    try {
        fs.open(path.join(__dirname, '/filesInfoDataBase.json'), 'a+', (err, fd) => {
            if (err) throw new Error('');
            fs.readFile(fd, 'utf8', (err, data) => {
                if (err) throw new Error('');
                const fileInfoBase = JSON.parse(data);
                const file = find(fileInfoBase, {storageName: body.name});
                fs.readdir(path.join(__dirname, '/storage'), (err, content) => {
                    if (err) throw new Error('');
                    fs.close(fd, (err) => {
                        if (err) throw new Error('');
                        res.setHeader("Content-Disposition", `attachment; filename="wfwefwef.doc"`);
                        res.sendFile(path.join(__dirname, `/storage/${body.name}`));
                    })
                });

            });

        })
    }catch (err) {
        res.status(500).send('Oops');
    }
})

webserver.get('/getFilesBase', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    try {
        fs.open(path.join(__dirname, '/filesInfoDataBase.json'), 'a+', (err, fd) => {
            if(err) throw new Error('');
            fs.readFile(fd, 'utf8', (err, data) => {
                if(err) throw new Error('');
                res.setHeader('Content-type', 'application/json');
                res.send(data || JSON.stringify([]));
                 fs.close(fd, (err, res) => {
                     if(err) console.log('ошибка', err);
                 });
            })
        })
    }catch (err) {
        res.status(500).send('Oops');
    }
} )

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});