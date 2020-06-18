const express = require('express');
const nodemailer = require('nodemailer');
var session = require('express-session');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const Busboy = require('busboy');
const inspect = require('util').inspect;
const {find, includes}  = require('lodash');
const WebSocket = require('ws');
const {sha256} = require('js-sha256');
const { newConnectionFactory, selectQueryFactory,modifyQueryFactory} = require("./db_utils");
const {nodemailerTransporterConfig, dbFileStoragePoolConfig} = require('./secretConfigs.js');

let pool = mysql.createPool(dbFileStoragePoolConfig);

let transporter = nodemailer.createTransport(nodemailerTransporterConfig);

const {webServerPort: port, webSocketPort: wsPort}  = require('./../common.js');
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

webserver.options('/*', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","http://localhost:4096");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send("");
})

webserver.use(session({
    secret: 'ANY_SECRET_TEXT',
    resave: false,
    saveUninitialized: true
}));

webserver.use(function (req, res, next) {
    const url = req.originalUrl;

    res.setHeader("Access-Control-Allow-Origin","http://localhost:4096");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    (async () => {

        const {login, password, eMail} = req.body;
        const hashedPassword = password && sha256(password);
        const verificationKey = String(Math.random());
        const errors = [];
        const answer = {};
        let queryResult;
        const connection = await newConnectionFactory(pool,res);

        try {
            if (url === '/registration') {
                res.setHeader("Content-type","application/json");
                 queryResult = await selectQueryFactory(
                    connection,
                    `select id, login from users where login='${login}'`,
                    []);

                if(queryResult && queryResult.length){
                    errors.push('Данный логин используется другим пользователем');
                }
                else {
                    const {insertId} = await modifyQueryFactory(
                        connection,
                        ` insert into users(login,password, eMail, verificationKey) 
                        values ('${login}', '${hashedPassword}','${eMail}', '${verificationKey}')`,
                        []);
                    if(insertId) {
                        const link = `http://134.209.249.75:${port}/verification?login=${encodeURIComponent(login)}&verificationKey=${verificationKey}`
                        const {messageId} = await transporter.sendMail({
                            from: '"FileStorage" <shmygatest@gmail.com>',
                            to: eMail,
                            subject: "Подтверждение регистрации",
                            text: "Привет!!",
                            html: `Привет! Перейди по ,<a href=${link} target="_blank">ссылочке</a> чтобы подтвердить регистрацию`
                        })
                        if(messageId) {
                            answer.id = insertId;
                        }
                    else {
                        errors.push('Ошибка отправки письма на ваш e-mail');
                        }
                    }
                }
                res.send(JSON.stringify(answer))
            } else if (includes(url, '/verification')) {
                const {login, verificationKey} = req.query;
                queryResult = await selectQueryFactory(
                    connection,
                    `select id, login, verificationKey from users 
                    where login='${login}' and verificationKey='${verificationKey}'`,
                    []);
                if(queryResult && queryResult.length === 1){
                    const {affectedRows} = await modifyQueryFactory(
                        connection,
                        `update users
set active=1
where id='${queryResult[0].id}';`,
                        []);
                    if(affectedRows) {
                        next();
                        return;
                    }
                }

                res.send('Ошибка верификации вашего аккаунта');
            } else if (url === '/authorization') {
                res.setHeader("Content-type","application/json");
                const queryResult = await selectQueryFactory(
                    connection,
                    `select id, login, password from users where login='${login}' and password='${hashedPassword}'`,
                    []);
                if(queryResult && queryResult.length === 1){
                    req.session.isAuthorized = true;
                    req.session.login = login;
                    answer.isAuthorized = true;
                }
                else {
                    errors.push('Ошибка авторизации');
                }

                res.send(JSON.stringify(answer));
            }
            else if (url === '/checkAuthorization') {
                res.setHeader("Content-type","application/json");
                res.send(JSON.stringify({
                    isAuthorized: !!req.session.isAuthorized,
                    login: req.session.login,
                }))

            }
        }
        catch(e) {
            console.log('ошибка', e);
        }
        finally {
            if ( connection ) {
                connection.release();
            }
        next();
        }
        })()
});

webserver.get('/verification', (req, res) => {
     res.redirect(302,`http://134.209.249.75:${port}/index.html`);
});



webserver.post('/sendFile', (req, res, next) => {
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

webserver.use(
    "/bundle.min.js",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/bundle.min.js"))
);
webserver.use(
    "/main.bundle.css",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/main.bundle.css"))
);
webserver.use(
    "/index.html/*",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/index.html"))
);

webserver.use(
    "/index.html",
    express.static(path.resolve(__dirname,"../FileStorageFront/public/index.html"))
);

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});