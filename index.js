var express = require('express');
var app = require('express-ws-routes')();
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var csurf = require('csurf');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var fs = require('fs');
var spawn = require('child_process').spawn;
var rmdir = require('rmdir');
var async = require('async');
var marked = require('marked');

var config = require('./config');
var problems = require('./models/problems');
var users = require('./models/users');
var editor = require('./controllers/editor');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(cookieParser(config.secretKey));
app.use(cookieSession({
  name: 'session',
  keys: [config.secretKey]
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(csurf({
	ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'WEBSOCKET']
}));

app.use(function (request, response, next) {
	response.locals.csrfToken = request.csrfToken();
	next();
});

var authenticate = function (req, res, next) {
	users.authenticate(req.signedCookies.id, req.signedCookies.authToken, function(err, user) {
		if (err) {
			return res.redirect('/sign-in');
		}
		req.user = user;
		next();
	});
};

app.get('/', authenticate, function(req, res) {
	res.redirect('/problems');
});

app.get('/sign-in', function(req, res) {
	res.render('sign-in');
});

app.post('/sign-in', function(req, res) {
	req.assert('email', 'A valid email is required.').isEmail();
	req.assert('password', 'Password is required.').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.render('sign-in', { errors: errors });
	}
	users.signIn(req.body.email, req.body.password, function(err, user) {
		if (err) {
			return res.render('sign-in', { errors: [{
				msg: err
			}] });
		}
		res.cookie('id', user.id, { signed: true, maxAge: config.cookieMaxAge });
		res.cookie('authToken', user.authToken, { signed: true, maxAge: config.cookieMaxAge });
		res.redirect('/problems');
	});
});

app.get('/sign-up', function(req, res) {
	res.render('sign-up');
});

app.post('/sign-up', function(req, res) {
	req.assert('email', 'A valid email is required.').isEmail();
	req.assert('name', 'Name is required.').notEmpty();
	req.assert('password', 'Password is required.').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.render('sign-up', { errors: errors });
	}
	users.signUp(req.body.email, req.body.name, req.body.password, function(err, user) {
		if (err) {
			return res.render('sign-up', { errors: [{
				msg: err
			}] });
		}
		res.cookie('id', user.id, { signed: true, maxAge: config.cookieMaxAge });
		res.cookie('authToken', user.authToken, { signed: true, maxAge: config.cookieMaxAge });
		res.redirect('/problems');
	});
});

app.get('/sign-out', function(req, res) {
	res.clearCookie('userId');
	res.clearCookie('authToken');
	res.redirect('/');
});

app.get('/problems', authenticate, function(req, res) {
	problems.problems(function(err, results) {
		if (err) {
			return res.status(500).send(err);
		}
		res.render('problems', { problems: results });
	});
});

app.use('/editor', authenticate, editor);
									 
app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
