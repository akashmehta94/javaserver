var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcrypt');
var db = new sqlite3.Database(path.join(__dirname, '../db/users.db'));

db.run('create table if not exists users (id integer primary key, name text, email text unique, password text, authToken text unique)');

module.exports.signUp = function(email, name, password, callback) {
	if (!email.endsWith('imperial.ac.uk') && !email.endsWith('ic.ac.uk')) {
		return callback('Email does not belong to Imperial College London.');
	}
	db.serialize(function() {
		db.run('insert into users(email, name, password, authToken) values (?, ?, ?, ?)', [email, name, bcrypt.hashSync(password, 8), bcrypt.genSaltSync(8)], function(err, rows) {
			if(err) {
				return callback('Email already taken.');
			}
			db.get('select * from users where email = ?', [email], function(err, user) {
				if (!user) {
					return callback('Error while trying to register user.');
				}
				callback(null, {
					id: user.id,
					email: user.email,
					name: user.name,
					authToken: user.auth_token
				});
			});
		});
	});
};

module.exports.signIn = function(email, password, callback) {
	db.get('select * from users where email = ?', [email], function(err, user) {
		if (!user) {
			return callback('Username does not exist.');
		}
		bcrypt.compare(password, user.password, function(err, res) {
			if (err) {
				return callback('Error while trying to login.');
			}
			if (!res) {
				return callback('Invalid email or password.');
			}
			callback(null, {
				id: user.id,
				email: user.email,
				name: user.name,
				authToken: user.authToken
			});
		});
	});
};

module.exports.authenticate = function(id, authToken, callback) {
	db.get('select * from users where id = ? and authToken = ?', [id, authToken], function(err, user) {
		if (err) {
			return callback('Error while trying to validate.');
		}
		if (!user) {
			return callback('Invalid login cookies.');
		}
		callback(null, {
			id: user.id,
			email: user.email,
			name: user.name,
			authToken: user.authToken
		});
	});
};
