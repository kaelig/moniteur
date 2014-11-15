'use strict';

var level = require('level');
var lem = require('lem');

// create a new leveldb - this can also be a sub-level
var leveldb = level('./data');

// create a new lem store using the leveldb
var lemdb = lem(leveldb);

module.exports = lemdb;