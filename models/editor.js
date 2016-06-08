var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var async = require('async');
var parseString = require('xml2js').parseString;

module.exports.description = function(problem, callback) {
	fs.readFile(path.join(__dirname, '../problems', problem, 'description.md'), 'utf-8', callback);
};

module.exports.filename = function(problem, callback) {
	fs.readdir(path.join(__dirname, '../problems', problem), function(err, files) {
		if (err) {
			return callback(err);
		}
		files = files.filter(file => path.extname(file) == '.java');
		if (files.length == 0) {
			return callback('Source file not found.');
		}
		callback(null, files[0]);
	});
};

module.exports.template = function(problem, callback) {
	fs.readdir(path.join(__dirname, '../problems', problem), function(err, files) {
		if (err) {
			return callback(err);
		}
		files = files.filter(file => path.extname(file) == '.java');
		if (files.length == 0) {
			return callback('Source file not found.');
		}
		fs.readFile(path.join(__dirname, '../problems', problem, files[0]), 'utf-8', callback);
	});
};

module.exports.tests = function(problem, callback) {
	fs.readdir(path.join(__dirname, '../problems', problem, 'tests'), function(err, files) {
		if (err) {
			return callback(err);
		}
		files = files.filter(file => path.extname(file) == '.java');
		files = files.map(file => { return { description: file.replace('.java', '').replace(/[A-Z]/g, x => ' ' + x).trim(), file: file } });
		callback(null, files);
	});
};

module.exports.runTest = function(problem, test, source, callback) {
	var output = '';
	var directory = null;
	async.waterfall([
		function(callback) {
			fs.mkdtemp(path.join(__dirname, '../temp/test-'), function(err, tempDirectory) {
				if (err) {
					return callback(err);
				}
				directory = tempDirectory;
				callback(null);
			});
		},
		function(callback) {
			module.exports.filename(problem, function(err, filename) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			fs.writeFile(path.join(directory, filename), source, function(err) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var compiler = spawn('javac', [path.join(directory, filename)]);
			compiler.stdout.on('data', function(data) {
				output += data;
			});
			compiler.stderr.on('data', function(data) {
				output += data;
			});
			compiler.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback('Compilation error.');
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			fs.copy(path.join(__dirname, '../problems', problem, 'tests', test), path.join(directory, test), function (err) {
				if (err) {
					return callback(err);
				};
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var compiler = spawn('javac', ['-cp', directory + ':' + path.join(__dirname, '../libs/junit-4.12.jar'), path.join(directory, test)]);
			compiler.stdout.on('data', function(data) {
				output += data;
			});
			compiler.stderr.on('data', function(data) {
				output += data;
			});
			compiler.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback('Compilation error.');
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var execution = spawn('java', ['-cp', directory + ':' + path.join(__dirname, '../libs/junit-4.12.jar') + ':' + path.join(__dirname, '../libs/hamcrest-core-1.3.jar'), 'org.junit.runner.JUnitCore', test.replace('.java', '')]);
			execution.stdout.on('data', function(data) {
				output += data;
			});
			execution.stderr.on('data', function(data) {
				output += data;
			});
			execution.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback(exitCode);
				}
				callback(null);
			});
		}
	], function(err) {
		if (directory != null) {
			fs.remove(directory, function() {
				callback(err, output);
			});
		} else {
			callback(err);
		}
	});
};

module.exports.evaluationTests = function(problem, callback) {
	fs.readdir(path.join(__dirname, '../problems', problem, 'evaluation'), function(err, files) {
		if (err) {
			return callback(err);
		}
		files = files.filter(file => path.extname(file) == '.java');
		files = files.map(file => { return { description: file.replace('.java', '').replace(/[A-Z]/g, x => ' ' + x).trim(), file: file } });
		callback(null, files);
	});
};

module.exports.runEvaluationTest = function(problem, test, source, callback) {
	var output = '';
	var directory = null;
	async.waterfall([
		function(callback) {
			fs.mkdtemp(path.join(__dirname, '../temp/test-'), function(err, tempDirectory) {
				if (err) {
					return callback(err);
				}
				directory = tempDirectory;
				callback(null);
			});
		},
		function(callback) {
			module.exports.filename(problem, function(err, filename) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			fs.writeFile(path.join(directory, filename), source, function(err) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var compiler = spawn('javac', [path.join(directory, filename)]);
			compiler.stdout.on('data', function(data) {
				output += data;
			});
			compiler.stderr.on('data', function(data) {
				output += data;
			});
			compiler.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback('Compilation error.');
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			fs.copy(path.join(__dirname, '../problems', problem, 'evaluation', test), path.join(directory, test), function (err) {
				if (err) {
					return callback(err);
				};
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var compiler = spawn('javac', ['-cp', directory + ':' + path.join(__dirname, '../libs/junit-4.12.jar'), path.join(directory, test)]);
			compiler.stdout.on('data', function(data) {
				output += data;
			});
			compiler.stderr.on('data', function(data) {
				output += data;
			});
			compiler.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback('Compilation error.');
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var execution = spawn('java', ['-cp', directory + ':' + path.join(__dirname, '../libs/junit-4.12.jar') + ':' + path.join(__dirname, '../libs/hamcrest-core-1.3.jar'), 'org.junit.runner.JUnitCore', test.replace('.java', '')]);
			execution.stdout.on('data', function(data) {
				output += data;
			});
			execution.stderr.on('data', function(data) {
				output += data;
			});
			execution.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback(exitCode);
				}
				callback(null);
			});
		}
	], function(err) {
		if (directory != null) {
			fs.remove(directory, function() {
				callback(err, output);
			});
		} else {
			callback(err);
		}
	});
}

module.exports.getFeedback = function(problem, source, callback) {
	var output = '';
	var directory = null;
	async.waterfall([
		function(callback) {
			fs.mkdtemp(path.join(__dirname, '../temp/test-'), function(err, tempDirectory) {
				if (err) {
					return callback(err);
				}
				directory = tempDirectory;
				callback(null);
			});
		},
		function(callback) {
			module.exports.filename(problem, function(err, filename) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			fs.writeFile(path.join(directory, filename), source, function(err) {
				if (err) {
					return callback(err);
				}
				callback(null, filename);
			});
		},
		function(filename, callback) {
			var checker = spawn('java', ['-jar', path.join(__dirname, '../libs', 'checkstyle-6.19-all.jar'), '-c', path.join(__dirname, '../libs', 'config.xml'), '-f', 'xml', path.join(directory, filename)]);
			checker.stdout.on('data', function(data) {
				output += data;
			});
			checker.stderr.on('data', function(data) {
				output += data;
			});
			checker.on('exit', function(exitCode) {
				if (exitCode != 0) {
					return callback('Compilation error.');
				}
				callback(null);
			});
		}
	], function(err) {
		if (directory != null) {
			fs.remove(directory, function() {
				parseString(output, function (err, result) {
					var errors = result.checkstyle.file[0].error ? result.checkstyle.file[0].error.map(error => error['$']) : [];
					callback(err, errors);
				});
			});
		} else {
			callback(err);
		}
	});
}

module.exports.submit = function(problem, source, callback) {
	module.exports.evaluationTests(problem, function(err, tests) {
		if (err) {
			return callback(err);
		}
		async.map(tests, function(test, callback) {
			module.exports.runEvaluationTest(problem, test.file, source, function(err, output) {
				callback(null, { test: test.description, result: (err ? false : true), output: output });
			});	
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			module.exports.getFeedback(problem, source, function(err, output) {
				if (err) {
					return callback(err);
				}
				callback(null, { tests: results, feedback: output });
			});
		});
	});
};
