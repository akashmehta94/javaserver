var path = require('path');
var fs = require('fs-extra');

module.exports.problems = function(callback) {
	fs.readdir(path.join(__dirname, '../problems'), function(err, files) {
		if (err) {
			return callback(err);
		}
		files = files.filter(file => !path.basename(file).startsWith('.'));
		files = files.map(file => { return { id: file, title: file.replace('-', ' ').toLowerCase().replace(/(^| )(\w)/g, x => x.toUpperCase()) } });
		callback(null, files);
	});
};

