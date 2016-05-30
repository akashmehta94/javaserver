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
var marked = require('marked');

var problems = require('./models/problems');
var editor = require('./controllers/editor');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.redirect('/problems');
});

app.use('/problems', function(req, res) {
	problems.problems(function(err, results) {
		if (err) {
			return res.status(500).send(err);
		}
		res.render('problems', { problems: results });
	});
});

app.use('/editor', editor);
									 
app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
