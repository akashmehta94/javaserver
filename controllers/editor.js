var express = require('express');
var path = require('path');
var spawn = require('child_process').spawn;
var rmdir = require('rmdir');
var async = require('async');
var marked = require('marked');
var editor = require('../models/editor');
var router = express.Router();

router.get('/:problem', function(req, res, next) {
	var problem = req.params.problem.replace(/[^A-Za-z\-]/g, '');
	async.parallel({
		description: function(callback) {
			editor.description(problem, callback);
		},
		template: function(callback) {
			editor.template(problem, callback);
		},
		tests: function(callback) {
			editor.tests(problem, callback);
		}
	}, function(err, results) {
		if (err) {
			return res.status(500).send(err);
		}
		results.marked = marked;
		results.problem = problem;
		results.user = req.user;
		res.render('editor', results);		
	});
});

router.post('/:problem', function(req, res, next) {
	var problem = req.params.problem.replace(/[^A-Za-z\-]/g, '');
	var source = req.body.source;
	editor.submit(problem, source, function(err, results) {
		if (err) {
			return res.status(500).send(err);
		}
		var mark = 100 * results.filter(x => x.result).length / results.length;
		var problemTitle = problem.replace('-', ' ').toLowerCase().replace(/(^| )(\w)/g, x => x.toUpperCase());
		res.render('result', { problem: problemTitle, source: source, mark: mark, tests: results });
	});
});

var clients = [];

router.websocket('/editor', function(info, callback, next) {
	callback(function(ws) {
		clients.push(ws);
		ws.on('message', function(message) {
			try {
				message = JSON.parse(message);
				var problem = message.problem.replace(/[^A-Za-z\-]/g, '');
				if (message.type == 'run-test') {
					editor.runTest(problem, message.test, message.source, function(err, output) {
						ws.send(JSON.stringify({
							problem: problem,
							type: 'test-result',
							test: message.test,
							result: !err,
							output: output
						}));
					});
				} else if (message.type == 'chat-message') {
					console.log('sending', message);
					clients.forEach(function(client) {
						try {
							client.send(JSON.stringify(message));
						} catch (err) {
							console.log(err);
						}
					});
				}
			} catch (err) {
				console.log(err);
			}
		});
		ws.on('close', function() {
			try {
				var i = clients.indexOf(ws);
				if (i != -1) {
					clients.splice(i, 1);
				}
			} catch (err) {
				console.log(err);
			}
		});
	});
});
					 
module.exports = router;
