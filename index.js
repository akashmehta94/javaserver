var express = require('express');
var app = require('express-ws-routes')();
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var spawn = require('child_process').spawn;
var rmdir = require('rmdir');
var async = require('async');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/', function(req, res) {
  var fileName = 'temp/' + req.body.className + '.java';
  async.waterfall([
    function(callback) {
        fs.mkdir('temp', function(err) {
            if (err) {
               return callback('Server error.');
            }
            callback(null);
         });
    },
    function(callback) {
        fs.writeFile(fileName, req.body.input, function(err) {
            if (err) {
                return callback('Server error.');
            }
            callback(null);
        });
    },
    function(callback) {
       var compiler = spawn('javac', [fileName]);
       compiler.on('exit', function(code) {
            if (code != 0) {
                return callback('Compilation error.');
            }
            callback(null);
        });
    },
    function(callback) {
        var outOutput = '';
        var errOutput = '';
        var execution = spawn('java', ['-cp', 'temp', req.body.className]);
        execution.stdout.on('data', function(data) {
            outOutput += data;
        });
        execution.stderr.on('data', function(data) {
            errOutput += data;
        });
        execution.on('exit', function(code) {
            if (code != 0) {
                return callback('Execution error.');
            }
            callback(null, outOutput, errOutput);
        });
    }
  ], function(err, outOutput, errOutput) {
    rmdir('temp', function() {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({
            status: "success",
            out: outOutput,
            err: errOutput
        });
    });
  });
});
                   
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
