const express = require('express');
const path = require('path');
const mysql = require('mysql');
const { newConnectionFactory, selectQueryFactory} = require("./db_utils");
const {isArray}  =  require ('lodash');

const poolConfig={
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'nodeuser',
    password : 'nodepass',
    database : 'learning_db',
};

let pool = mysql.createPool(poolConfig);

const port  = 5057;

const webserver = express();

webserver.use(express.json());

webserver.options('/sendQuery', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");

    res.send(""); // сам ответ на preflight-запрос может быть пустым
})


webserver.use(
    "/index.html",
    express.static(path.resolve(__dirname,"../SQLExplorerFront/public/index.html"))
);
webserver.use(
    "/bundle.min.js",
    express.static(path.resolve(__dirname,"../SQLExplorerFront/public/bundle.min.js"))
);
webserver.use(
    "/main.bundle.css",
    express.static(path.resolve(__dirname,"../SQLExplorerFront/public/main.bundle.css"))
);

webserver.post('/sendQuery', async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");

    const queryText = req.body.query;

    let connection=null;
    try {
        connection = await newConnectionFactory(pool,res);

        let queryResult = await selectQueryFactory(connection, queryText, []);

        const resultType = isArray(queryResult) ? 'table' : 'message';
        const result = isArray(queryResult) ?
            queryResult :
            `Всего затронуто строк: ${queryResult.affectedRows}; Изменено строк: ${queryResult.changedRows}; Предупреждений: ${queryResult.warningCount}`

        res.send({
            type: resultType,
            data: result,
        });

    }
    catch ( error ) {
        res.send({
            type:'error',
            data: error.sqlMessage,
        });
    }
    finally {
        if ( connection )
            connection.release();
    }

})

webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});