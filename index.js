var env = require('./.env.json');
var winston = require('winston');
var slack = require('./slack');

winston.add(winston.transports.File, { filename: 'log/chaos.log' });

var currentTime = new Date().toISOString();
winston.info('Started Power Hour Bot - ' + currentTime);
