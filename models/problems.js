var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcrypt');
var db = new sqlite3.Database(path.join(__dirname, '../db/users.db'));

db.run('create table if not exists problems (id integer not null, name text not null, source text not null, mark integer, primary key (id, name))');

module.exports.problems = function(id, callback) {
	db.get('select * from problems where id = ?', [id], function(err, problems) {
		var submittedProblems = {};
		problems = [].concat(problems);
		problems.forEach(problem => { submittedProblems[problem.name] = problem; });
		fs.readFile(path.join(__dirname, '../', 'programme.json'), 'utf-8', function(err, data) {
			if (err) {
				return callback(err);
			}
			var problems = JSON.parse(data);
			problems = problems.map(week => { week.problems = []; return week; });
			fs.readdir(path.join(__dirname, '../problems'), function(err, files) {
				if (err) {
					return callback(err);
				}
				files = files.filter(file => !path.basename(file).startsWith('.'));
				async.each(files, function(file, callback) {
					fs.readFile(path.join(__dirname, '../problems', file, 'problem.json'), 'utf-8', function(err, data) {
						if (err) {
							return callback(err);
						}
						var problem = JSON.parse(data);
						if (submittedProblems[problem.id]) {
							problem.mark = submittedProblems[problem.id].mark;
						}
						problems[problem.week - 1].problems.push(problem);
						callback();
					});
				}, function(err) {
					if (err) {
						return callback(err);
					}
					callback(null, problems);
				});
			});
		});	
	});
};

module.exports.load = function(id, name, callback) {
	db.get('select * from problems where id = ? and name = ?', [id, name], callback);
};

module.exports.save = function(id, name, source, mark, callback) {
	db.serialize(function() {
		db.run('replace into problems(id, name, source, mark) values (?, ?, ?, ?)', [id, name, source, mark], function(err, rows) {
			if(err) {
				return callback('Failed to save submission.');
			}
			callback(null);
		});
	});
};
