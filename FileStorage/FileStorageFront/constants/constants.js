export const requestMethodOptions = [
    {name: 'GET', value: 'GET', key: 0},
    {name: 'POST', value: 'POST', key: 1},
];

export const requestHeaders = [
    "Content-type",
    "Accept",
    "Accept-Encoding",
    "Accept-Language",
    "Connection",
    "Content-Length",
    "Host",
    "Origin",
    "Referer",
    "Sec-Fetch-Dest",
    "Sec-Fetch-Mode",
    "Sec-Fetch-Site",
    "User-Agent",
]

export const localhost = 'localhost';
export const remoteHost = '134.209.249.75';

const {webServerPort, webSocketPort} = require('./../../common.js');

export const webServerUrl = `http://${remoteHost}:${webServerPort}`;
export const webSocketUrl = `ws://${remoteHost}:${webSocketPort}`;