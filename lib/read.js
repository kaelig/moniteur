var lem = require('lem');
var level = require('level');

var leveldb = level('./data');
var lemdb = lem(leveldb);

var through = require('through');
var tree = {};

lemdb.keys('stylesheets').pipe(through(function(data){
    tree[data.key] = data.value;
}, function(){
    console.dir(tree);
}));

// create a range - this can be a 'session' to make meaningful groups within lem
var sessionstart = new Date('04/05/2013 12:34:43');
var sessionend = new Date('04/05/2015 12:48:10');
var counter = 0;
var total = 0;

var secs = (sessionend.getTime() - sessionstart.getTime()) / 1000;

lemdb.valuestream('stylesheets.ded0bfd1866585da258ff2173f47afa0.size').pipe(through(function(data){

    // this is the timestamp of the value
    var key = data.key;

    // this is the actual value
    var value = data.value;

    // map-reduce beginnings
    total += value;
    counter++;
}, function(){

    var avg = 0;

    if(counter>0){
        avg = total / counter;
    }

    console.log('average size of: ' + avg);
    console.log('data points: ' + total);
    console.log('time period: ' + secs + ' secs');

}));